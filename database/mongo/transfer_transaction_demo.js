// Demonstrate one MongoDB session transaction that writes both transfer history
// records and the corresponding activity event atomically.
// MongoDB sessions with transactions require a replica set (including a single-node set).
const banksphere = db.getSiblingDB("banksphere");
const session = db.getMongo().startSession();
const sessionDb = session.getDatabase("banksphere");
const transferId = `DEMO-${new ObjectId().toString()}`;
const now = new Date();
const transferAmount = 250;

try {
    session.startTransaction();
    sessionDb.transaction_history.insertMany([
        {
            account_no: "ACCT001",
            type: "TRANSFER",
            amount: transferAmount,
            date: now,
            category: "Transfer",
            merchant: "BankSphere Demo",
            tags: ["transfer", "demo"],
            transfer_id: transferId
        },
        {
            account_no: "ACCT003",
            type: "TRANSFER",
            amount: transferAmount,
            date: now,
            category: "Transfer",
            merchant: "BankSphere Demo",
            tags: ["transfer", "demo"],
            transfer_id: transferId
        }
    ]);
    sessionDb.activity_logs.insertOne({
        user: "teller@banksphere.demo",
        action: "TRANSFER_LOGGED",
        ip: "127.0.0.1",
        timestamp: now,
        transfer_id: transferId
    });
    session.commitTransaction();
    print(`Committed transfer log ${transferId} with both history rows and activity.`);
} catch (error) {
    session.abortTransaction();
    throw error;
} finally {
    session.endSession();
}
