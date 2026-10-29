import dotenv from "dotenv";

dotenv.config();

const required = [
    "MONGODB_URI",
    "ORACLE_USER",
    "ORACLE_PASSWORD",
    "ORACLE_CONNECT_STRING",
    "JWT_SECRET",
    "DEMO_ADMIN_PASSWORD",
    "DEMO_TELLER_PASSWORD",
    "DEMO_CUSTOMER_PASSWORD"
];

const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
    throw new Error(`Missing required environment values: ${missing.join(", ")}`);
}
if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters.");
}

export const env = {
    port: Number(process.env.PORT || 4000),
    nodeEnv: process.env.NODE_ENV || "development",
    frontendOrigins: (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
        .split(",")
        .map((origin) => origin.trim()),
    mongoUri: process.env.MONGODB_URI,
    mongoDatabase: process.env.MONGODB_DATABASE || "banksphere",
    oracleUser: process.env.ORACLE_USER,
    oraclePassword: process.env.ORACLE_PASSWORD,
    oracleConnectString: process.env.ORACLE_CONNECT_STRING,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
    demoPasswords: {
        admin: process.env.DEMO_ADMIN_PASSWORD,
        teller: process.env.DEMO_TELLER_PASSWORD,
        customer: process.env.DEMO_CUSTOMER_PASSWORD
    }
};
