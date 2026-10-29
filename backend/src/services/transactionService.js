import { logger } from "../config/logger.js";
import { executeMoneyOperation } from "../repositories/oracleRepository.js";
import { writeOperationHistory } from "../repositories/mongoRepository.js";
import { AppError } from "../utils/AppError.js";

const oracleErrorMap = {
    20001: [400, "Insufficient funds for this transaction."],
    20002: [409, "The account is frozen or closed."],
    20003: [400, "Transaction amount must be greater than zero."],
    20004: [404, "The requested account was not found."],
    20005: [400, "Source and destination accounts must be different."],
    20006: [400, "The supplied rate is invalid."],
    20007: [400, "The supplied month is invalid."]
};

function mapOracleError(error) {
    const mapped = oracleErrorMap[error.errorNum];
    if (!mapped) return error;
    return new AppError(
        mapped[0],
        mapped[1],
        { oracleCode: error.errorNum },
        { db: "oracle", executed: "banking_pkg raised ORA-" + error.errorNum }
    );
}

export async function performTransaction({ operation, accountNo, fromAccount, toAccount, amount, user, ip }) {
    let transactions;
    try {
        transactions = await executeMoneyOperation({ operation, accountNo, fromAccount, toAccount, amount });
    } catch (error) {
        throw mapOracleError(error);
    }

    let historySync = "synced";
    let syncError;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
            await writeOperationHistory(transactions, { user, ip, isTransfer: operation === "transfer" });
            syncError = undefined;
            break;
        } catch (error) {
            syncError = error;
            logger.warn("MongoDB transaction-history sync failed", {
                operation,
                attempt,
                oracleTransactionIds: transactions.map((transaction) => transaction.id),
                error: error.message
            });
        }
    }
    if (syncError) {
        historySync = "retry_required";
        logger.error("MongoDB history sync failed after one retry; Oracle transaction remains committed", {
            operation,
            oracleTransactionIds: transactions.map((transaction) => transaction.id),
            error: syncError.message
        });
    }

    return { transactions, historySync };
}
