import { ObjectId } from "mongodb";
import { getMongoClient, getMongoDatabase } from "../config/mongo.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function findUserByEmail(email) {
    return getMongoDatabase().collection("app_users").findOne({ email });
}

export async function listUsers() {
    return getMongoDatabase().collection("app_users")
        .find({}, { projection: { passwordHash: 0 } })
        .sort({ createdAt: -1 })
        .toArray();
}

export async function updateUser(userId, update) {
    const result = await getMongoDatabase().collection("app_users").findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: update },
        { returnDocument: "after", projection: { passwordHash: 0 } }
    );
    return result;
}

export async function getHistory({ accountNo, type, search, page, limit, sortBy, sortOrder, minAmount }) {
    const filter = {};
    if (accountNo) filter.account_no = accountNo;
    if (type) filter.type = type;
    if (minAmount !== undefined) filter.amount = { $gte: minAmount };
    if (search) filter.$or = [
        { merchant: { $regex: escapeRegex(search), $options: "i" } },
        { category: { $regex: escapeRegex(search), $options: "i" } },
        { tags: { $regex: escapeRegex(search), $options: "i" } }
    ];

    const allowedSortFields = new Set(["date", "amount", "type", "merchant"]);
    const field = allowedSortFields.has(sortBy) ? sortBy : "date";
    const direction = sortOrder === "asc" ? 1 : -1;
    const collection = getMongoDatabase().collection("transaction_history");
    const [rows, total] = await Promise.all([
        collection.find(filter)
            .sort({ [field]: direction, _id: direction })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
        collection.countDocuments(filter)
    ]);
    return { rows, total };
}

export async function writeOperationHistory(transactions, { user, ip, isTransfer }) {
    const database = getMongoDatabase();
    const session = getMongoClient().startSession();
    try {
        await session.withTransaction(async () => {
            await database.collection("transaction_history").insertMany(
                transactions.map((transaction) => ({
                    account_no: transaction.accountNo,
                    type: transaction.type,
                    amount: transaction.amount,
                    date: new Date(transaction.date),
                    category: transaction.type === "DEPOSIT" ? "Deposit" :
                        transaction.type === "TRANSFER" ? "Transfer" : "Withdrawal",
                    merchant: isTransfer ? "BankSphere Transfer" : "BankSphere Teller",
                    tags: isTransfer ? ["transfer", "banking"] : ["banking"],
                    balance_after: transaction.balanceAfter,
                    related_account: transaction.relatedAccount,
                    oracle_txn_id: transaction.id
                })),
                { session }
            );
            await database.collection("activity_logs").insertOne({
                user,
                action: isTransfer ? "TRANSFER_COMPLETED" : `${transactions[0].type}_COMPLETED`,
                ip,
                timestamp: new Date(),
                oracle_txn_ids: transactions.map((transaction) => transaction.id)
            }, { session });
        });
    } finally {
        await session.endSession();
    }
}

export async function getProfile(customerId) {
    return getMongoDatabase().collection("customers").findOne({ _id: customerId });
}

export async function updateProfile(customerId, update) {
    const result = await getMongoDatabase().collection("customers").findOneAndUpdate(
        { _id: customerId },
        { $set: update },
        { returnDocument: "after" }
    );
    return result;
}

export async function changeLinkedAccount(customerId, accountNo, action) {
    const modifier = action === "add"
        ? { $addToSet: { linked_accounts: accountNo } }
        : { $pull: { linked_accounts: accountNo } };
    const result = await getMongoDatabase().collection("customers").updateOne(
        { _id: customerId },
        modifier
    );
    return result.matchedCount > 0;
}

export async function listActivityLogs({ page, limit }) {
    const collection = getMongoDatabase().collection("activity_logs");
    const [rows, total] = await Promise.all([
        collection.find().sort({ timestamp: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
        collection.countDocuments()
    ]);
    return { rows, total };
}

export async function runAggregation(collectionName, pipeline) {
    return getMongoDatabase().collection(collectionName).aggregate(pipeline).toArray();
}

export async function compareMerchantIndex() {
    const collection = getMongoDatabase().collection("transaction_history");
    const query = { merchant: "Northstar Market" };
    const before = await collection.find(query).hint({ $natural: 1 }).explain("executionStats");
    await collection.createIndex({ merchant: 1 }, { name: "ix_history_merchant_performance_demo" });
    const after = await collection.find(query).explain("executionStats");
    const stats = (explain) => ({
        documentsExamined: explain.executionStats.totalDocsExamined,
        keysExamined: explain.executionStats.totalKeysExamined,
        executionTimeMs: explain.executionStats.executionTimeMillis
    });
    return { query, beforeIndex: stats(before), afterIndex: stats(after) };
}
