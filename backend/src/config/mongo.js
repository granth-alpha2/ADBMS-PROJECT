import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";
import { env } from "./env.js";
import { logger } from "./logger.js";

const demoUsers = [
    { email: "admin@banksphere.demo", name: "BankSphere Admin", role: "ADMIN", passwordKey: "admin" },
    { email: "teller@banksphere.demo", name: "BankSphere Teller", role: "TELLER", passwordKey: "teller" },
    {
        email: "customer@banksphere.demo",
        name: "Demo Customer",
        role: "CUSTOMER",
        customerId: "C001",
        passwordKey: "customer"
    }
];

const client = new MongoClient(env.mongoUri, {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 5000
});
let connectionPromise;
let databaseInstance;

export async function connectMongo() {
    if (!connectionPromise) {
        connectionPromise = client.connect().catch((error) => {
            connectionPromise = undefined;
            throw error;
        });
    }
    await connectionPromise;
    const database = client.db(env.mongoDatabase);
    await database.collection("app_users").createIndex({ email: 1 }, { unique: true, name: "ux_app_users_email" });
    await provisionDemoUsers(database);
    databaseInstance = database;
    logger.info("MongoDB client connected", { database: env.mongoDatabase });
    return database;
}

async function provisionDemoUsers(database) {
    const collection = database.collection("app_users");
    for (const user of demoUsers) {
        const passwordHash = await bcrypt.hash(env.demoPasswords[user.passwordKey], 12);
        const { passwordKey, ...safeUser } = user;
        await collection.updateOne(
            { email: user.email },
            {
                $setOnInsert: {
                    ...safeUser,
                    passwordHash,
                    createdAt: new Date(),
                    active: true
                }
            },
            { upsert: true }
        );
    }
}

export function getMongoDatabase() {
    if (!databaseInstance) {
        throw new Error("MongoDB client has not been initialized.");
    }
    return databaseInstance;
}

export function getMongoClient() {
    return client;
}

export async function closeMongo() {
    if (!connectionPromise) return;
    await client.close();
    connectionPromise = undefined;
    databaseInstance = undefined;
    logger.info("MongoDB client closed");
}
