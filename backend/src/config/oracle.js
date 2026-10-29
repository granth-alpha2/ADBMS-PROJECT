import oracledb from "oracledb";
import { env } from "./env.js";
import { logger } from "./logger.js";

let pool;

export async function connectOracle() {
    if (pool) return pool;
    pool = await oracledb.createPool({
        user: env.oracleUser,
        password: env.oraclePassword,
        connectString: env.oracleConnectString,
        poolMin: 1,
        poolMax: 10,
        poolIncrement: 1,
        poolTimeout: 60
    });
    logger.info("Oracle connection pool created", { poolMax: 10 });
    return pool;
}

export function getOraclePool() {
    if (!pool) throw new Error("Oracle connection pool has not been initialized.");
    return pool;
}

export async function closeOracle() {
    if (!pool) return;
    await pool.close(10);
    pool = undefined;
    logger.info("Oracle connection pool closed");
}
