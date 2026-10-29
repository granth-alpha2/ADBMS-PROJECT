// Seed 10 customer profiles and 1,200 flexible transaction-history documents.
// The linked account numbers let analytics join profiles to transactions.
const banksphere = db.getSiblingDB("banksphere");
const customers = [
    ["Aarav Sharma", "aarav@example.com", "C001", ["ACCT001", "ACCT002"], "Mumbai", "Maharashtra"],
    ["Diya Patel", "diya@example.com", "C002", ["ACCT003", "ACCT004"], "Ahmedabad", "Gujarat"],
    ["Kabir Singh", "kabir@example.com", "C003", ["ACCT005"], "Delhi", "Delhi"],
    ["Anaya Gupta", "anaya@example.com", "C004", ["ACCT006", "ACCT007"], "Jaipur", "Rajasthan"],
    ["Ishaan Rao", "ishaan@example.com", "C005", ["ACCT008"], "Bengaluru", "Karnataka"],
    ["Meera Nair", "meera@example.com", "C006", ["ACCT009", "ACCT010"], "Kochi", "Kerala"],
    ["Arjun Das", "arjun@example.com", "C007", ["ACCT011"], "Kolkata", "West Bengal"],
    ["Saanvi Iyer", "saanvi@example.com", "C008", ["ACCT012"], "Chennai", "Tamil Nadu"],
    ["Vivaan Khan", "vivaan@example.com", "C009", ["ACCT013"], "Hyderabad", "Telangana"],
    ["Tara Joshi", "tara@example.com", "C010", ["ACCT014", "ACCT015"], "Pune", "Maharashtra"]
];

const customerDocuments = customers.map(([name, email, id, linkedAccounts, city, state], index) => ({
    _id: id,
    name,
    email,
    phone: `+91-90000-${String(index + 1).padStart(4, "0")}`,
    address: { city, state, pincode: String(400001 + index) },
    linked_accounts: linkedAccounts,
    preferences: { currency: "INR", monthly_summary: true, alerts: ["large_transfer"] },
    kyc: { status: index < 8 ? "VERIFIED" : "PENDING", documents: ["PAN", "ADDRESS_PROOF"] }
}));

customerDocuments.forEach((customer) => {
    banksphere.customers.replaceOne({ _id: customer._id }, customer, { upsert: true });
});

// Remove only the previous generated seed rows, preserving live history.
banksphere.transaction_history.deleteMany({ seed_batch: "banksphere-demo-v1" });
const accountNumbers = customers.flatMap((customer) => customer[3]);
const categories = ["Groceries", "Utilities", "Travel", "Dining", "Shopping", "Salary"];
const merchants = [
    "Northstar Market", "City Power", "Metro Transit", "Harbor Cafe", "Bluebird Shop",
    "Payroll Services", "Green Basket", "Cloud Mobile", "QuickFuel", "Campus Books"
];
const transactionDocuments = [];

for (let index = 0; index < 1200; index += 1) {
    const accountIndex = index % accountNumbers.length;
    const accountNumber = accountNumbers[accountIndex];
    const customer = customers.find((entry) => entry[3].includes(accountNumber));
    const type = index % 9 === 0 ? "DEPOSIT" : index % 17 === 0 ? "TRANSFER" : "WITHDRAW";
    const amount = index % 41 === 0 ? 12500 + (index % 7) * 500 : 120 + ((index * 37) % 9800);
    transactionDocuments.push({
        account_no: accountNumber,
        type,
        amount,
        date: new Date(Date.UTC(2025, index % 12, (index % 27) + 1, 10, 30)),
        category: type === "DEPOSIT" ? "Salary" : categories[index % categories.length],
        merchant: merchants[index % merchants.length],
        tags: index % 6 === 0 ? ["recurring", "online"] : ["demo"],
        customer_id: customer[2],
        seed_batch: "banksphere-demo-v1"
    });
}

banksphere.transaction_history.insertMany(transactionDocuments, { ordered: true });
banksphere.activity_logs.deleteMany({ seed_batch: "banksphere-demo-v1" });
banksphere.activity_logs.insertMany([
    {
        user: "admin@banksphere.demo",
        action: "SEEDED_DEMO_DATA",
        ip: "127.0.0.1",
        timestamp: new Date(),
        seed_batch: "banksphere-demo-v1"
    },
    {
        user: "teller@banksphere.demo",
        action: "VIEWED_CUSTOMER_PROFILE",
        ip: "127.0.0.1",
        timestamp: new Date(),
        seed_batch: "banksphere-demo-v1"
    }
]);

print(`Seeded ${customerDocuments.length} customers and ${transactionDocuments.length} transactions.`);
