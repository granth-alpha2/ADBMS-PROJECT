// CRUD, query operators, projections, sorting, pagination, nested updates,
// array updates, and explicit cursor cleanup using the MongoDB driver shell API.
const banksphere = db.getSiblingDB("banksphere");
const customers = banksphere.customers;
const history = banksphere.transaction_history;

// Create, read, update, then delete a disposable profile to demonstrate CRUD.
const demoCustomer = {
    _id: "CRUD-DEMO",
    name: "CRUD Demo Customer",
    email: "crud-demo@banksphere.example",
    phone: "+91-90000-0000",
    address: { city: "Pune", state: "Maharashtra", pincode: "411001" },
    linked_accounts: ["DEMO-ACCOUNT"],
    preferences: { currency: "INR", monthly_summary: true },
    kyc: { status: "PENDING", documents: [] }
};
customers.deleteOne({ _id: demoCustomer._id });
customers.insertOne(demoCustomer);
printjson(customers.findOne({ _id: demoCustomer._id }, { name: 1, email: 1, _id: 0 }));
customers.updateOne({ _id: demoCustomer._id }, { $set: { "address.city": "Mumbai" } });
customers.deleteOne({ _id: demoCustomer._id });

// Query operators: comparison, membership, conjunction, and case-insensitive regex.
print("Amount greater than 5,000:");
printjson(history.find({ amount: { $gt: 5000 } }).limit(3).toArray());
print("Deposits or transfers:");
printjson(history.find({ type: { $in: ["DEPOSIT", "TRANSFER"] } }).limit(3).toArray());
print("Large withdrawals in Groceries:");
printjson(history.find({
    $and: [{ type: "WITHDRAW" }, { amount: { $gt: 5000 } }, { category: "Groceries" }]
}).limit(3).toArray());
print("Merchant name contains 'market':");
printjson(history.find({ merchant: { $regex: "market", $options: "i" } }).limit(3).toArray());

// Projection returns only the fields needed by a history table.
printjson(history.find(
    { account_no: "ACCT001" },
    { account_no: 1, type: 1, amount: 1, date: 1, _id: 0 }
).sort({ date: -1 }).limit(5).toArray());

// Offset pagination uses sort + skip + limit; a cursor is closed after iteration.
const pageNumber = 2;
const pageSize = 10;
const pageCursor = history.find({ account_no: "ACCT001" })
    .sort({ date: -1, _id: -1 })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize);
try {
    pageCursor.forEach((transaction) => printjson(transaction));
} finally {
    pageCursor.close();
}

// $push and $pull add/remove a temporary linked account without losing others.
customers.updateOne({ _id: "C001" }, { $push: { linked_accounts: "CRUD-TEMP-ACCOUNT" } });
customers.updateOne({ _id: "C001" }, { $pull: { linked_accounts: "CRUD-TEMP-ACCOUNT" } });
// $set updates a nested preference; dot notation preserves other preferences.
const originalCustomer = customers.findOne({ _id: "C001" });
customers.updateOne(
    { _id: "C001" },
    { $set: { "preferences.monthly_summary": false, "address.pincode": "400001" } }
);
if (originalCustomer) {
    customers.updateOne(
        { _id: "C001" },
        { $set: {
            "preferences.monthly_summary": originalCustomer.preferences.monthly_summary,
            "address.pincode": originalCustomer.address.pincode
        } }
    );
}

print("CRUD and query examples completed.");
