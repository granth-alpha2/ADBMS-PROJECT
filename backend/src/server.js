import { app } from "./app.js";
import { closeMongo, connectMongo } from "./config/mongo.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { closeOracle, connectOracle } from "./config/oracle.js";

let server;
let shuttingDown = false;

async function start() {
    await Promise.all([connectMongo(), connectOracle()]);
    server = app.listen(env.port, () => {
        logger.info("BankSphere API listening", { port: env.port });
    });
}

async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info("Shutting down BankSphere API", { signal });
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }
    await Promise.all([closeMongo(), closeOracle()]);
}

process.once("SIGINT", () => shutdown("SIGINT").then(() => process.exit(0)).catch((error) => {
    logger.error("Shutdown failed", { error: error.message });
    process.exit(1);
}));
process.once("SIGTERM", () => shutdown("SIGTERM").then(() => process.exit(0)).catch((error) => {
    logger.error("Shutdown failed", { error: error.message });
    process.exit(1);
}));

start().catch((error) => {
    logger.error("BankSphere API could not start", { error: error.message, stack: error.stack });
    process.exitCode = 1;
});
