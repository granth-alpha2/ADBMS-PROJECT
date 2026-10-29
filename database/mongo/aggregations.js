// Each example pipeline illustrates a different Advanced MongoDB syllabus topic.
const banksphere = db.getSiblingDB("banksphere");

// Deposits and withdrawals per customer: join account references and sum by type.
const depositsVsWithdrawals = [
    { $lookup: {
        from: "transaction_history",
        localField: "linked_accounts",
        foreignField: "account_no",
        as: "transactions"
    } },
    { $unwind: "$transactions" },
    { $match: { "transactions.type": { $in: ["DEPOSIT", "WITHDRAW"] } } },
    { $group: {
        _id: { customer_id: "$_id", name: "$name", type: "$transactions.type" },
        total_amount: { $sum: "$transactions.amount" }
    } },
    { $sort: { "_id.customer_id": 1, "_id.type": 1 } }
];

// Monthly trend: group dates by year and month, then order chronologically.
const monthlyTransactionTrend = [
    { $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        transaction_count: { $sum: 1 },
        total_volume: { $sum: "$amount" }
    } },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
];

// Top five customers by transaction volume: join on linked account numbers.
const topCustomersByVolume = [
    { $lookup: {
        from: "customers",
        localField: "account_no",
        foreignField: "linked_accounts",
        as: "customer"
    } },
    { $unwind: "$customer" },
    { $group: {
        _id: "$customer._id",
        name: { $first: "$customer.name" },
        transaction_count: { $sum: 1 },
        total_volume: { $sum: "$amount" }
    } },
    { $sort: { total_volume: -1 } },
    { $limit: 5 }
];

// Spending by category counts withdrawals and adds their value.
const spendingByCategory = [
    { $match: { type: "WITHDRAW" } },
    { $group: {
        _id: "$category",
        transaction_count: { $sum: 1 },
        total_spend: { $sum: "$amount" }
    } },
    { $sort: { total_spend: -1 } }
];

// Customer + transaction report: $lookup, $unwind, and a compact $project.
const customerTransactionJoin = [
    { $lookup: {
        from: "customers",
        localField: "account_no",
        foreignField: "linked_accounts",
        as: "customer"
    } },
    { $unwind: "$customer" },
    { $project: {
        _id: 0,
        customer_id: "$customer._id",
        customer_name: "$customer.name",
        account_no: 1,
        type: 1,
        amount: 1,
        date: 1,
        category: 1
    } },
    { $sort: { date: -1 } },
    { $limit: 20 }
];

// Suspicious activity returns both matching rows and a compact count/total summary.
const suspiciousActivity = [
    { $match: { amount: { $gte: 10000 } } },
    { $facet: {
        flagged_transactions: [
            { $sort: { amount: -1, date: -1 } },
            { $limit: 20 },
            { $project: { account_no: 1, type: 1, amount: 1, date: 1, merchant: 1 } }
        ],
        summary: [
            { $group: { _id: null, count: { $sum: 1 }, total_amount: { $sum: "$amount" } } }
        ]
    } }
];

print("Deposits vs withdrawals per customer:");
printjson(banksphere.customers.aggregate(depositsVsWithdrawals).toArray());
print("Monthly transaction trend:");
printjson(banksphere.transaction_history.aggregate(monthlyTransactionTrend).toArray());
print("Top five customers by volume:");
printjson(banksphere.transaction_history.aggregate(topCustomersByVolume).toArray());
print("Spending by category:");
printjson(banksphere.transaction_history.aggregate(spendingByCategory).toArray());
print("Customer + transaction join:");
printjson(banksphere.transaction_history.aggregate(customerTransactionJoin).toArray());
print("Suspicious activity:");
printjson(banksphere.transaction_history.aggregate(suspiciousActivity).toArray());
