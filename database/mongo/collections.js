// Create the BankSphere MongoDB collections with beginner-friendly validators.
// Run with: mongosh "$MONGODB_URI" collections.js
const banksphere = db.getSiblingDB("banksphere");

const collectionDefinitions = [
    {
        name: "customers",
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["name", "email", "phone", "address", "linked_accounts", "preferences", "kyc"],
                properties: {
                    name: { bsonType: "string" },
                    email: { bsonType: "string" },
                    phone: { bsonType: "string" },
                    address: {
                        bsonType: "object",
                        required: ["city", "state", "pincode"],
                        properties: {
                            city: { bsonType: "string" },
                            state: { bsonType: "string" },
                            pincode: { bsonType: "string" }
                        }
                    },
                    linked_accounts: { bsonType: "array", items: { bsonType: "string" } },
                    preferences: { bsonType: "object" },
                    kyc: {
                        bsonType: "object",
                        required: ["status", "documents"],
                        properties: {
                            status: { enum: ["PENDING", "VERIFIED", "REJECTED"] },
                            documents: { bsonType: "array", items: { bsonType: "string" } }
                        }
                    }
                }
            }
        }
    },
    {
        name: "transaction_history",
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["account_no", "type", "amount", "date", "category", "merchant", "tags"],
                properties: {
                    account_no: { bsonType: "string" },
                    type: { enum: ["DEPOSIT", "WITHDRAW", "TRANSFER"] },
                    amount: { bsonType: ["double", "int", "long", "decimal"], minimum: 0.01 },
                    date: { bsonType: "date" },
                    category: { bsonType: "string" },
                    merchant: { bsonType: "string" },
                    tags: { bsonType: "array", items: { bsonType: "string" } }
                }
            }
        }
    },
    {
        name: "activity_logs",
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["user", "action", "ip", "timestamp"],
                properties: {
                    user: { bsonType: "string" },
                    action: { bsonType: "string" },
                    ip: { bsonType: "string" },
                    timestamp: { bsonType: "date" }
                }
            }
        }
    }
];

collectionDefinitions.forEach(({ name, validator }) => {
    const exists = banksphere.getCollectionInfos({ name }).length > 0;
    if (exists) {
        banksphere.runCommand({ collMod: name, validator, validationLevel: "moderate" });
    } else {
        banksphere.createCollection(name, { validator, validationLevel: "moderate" });
    }
});

print("BankSphere collections and validators are ready.");
