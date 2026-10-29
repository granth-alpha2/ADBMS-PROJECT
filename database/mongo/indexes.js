// Indexes used by profile lookups, account history, and text search.
const banksphere = db.getSiblingDB("banksphere");

banksphere.customers.createIndex({ email: 1 }, { unique: true, name: "ux_customers_email" });
banksphere.transaction_history.createIndex(
    { account_no: 1, date: -1 },
    { name: "ix_history_account_date" }
);
banksphere.transaction_history.createIndex(
    { type: 1, category: 1, date: -1 },
    { name: "ix_history_type_category_date" }
);
banksphere.transaction_history.createIndex(
    { merchant: "text", category: "text", tags: "text" },
    { name: "tx_history_search" }
);
banksphere.activity_logs.createIndex({ timestamp: -1 }, { name: "ix_activity_timestamp" });

print("BankSphere single-field, compound, and text indexes are ready.");
