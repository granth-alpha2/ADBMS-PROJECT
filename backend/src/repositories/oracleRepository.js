import oracledb from "oracledb";
import { getOraclePool } from "../config/oracle.js";

async function withConnection(operation) {
    const connection = await getOraclePool().getConnection();
    try {
        return await operation(connection);
    } finally {
        await connection.close();
    }
}

function mapTransaction(row) {
    return {
        id: Number(row.TXN_ID),
        accountNo: row.ACCOUNT_NO,
        type: row.TXN_TYPE,
        amount: Number(row.AMOUNT),
        balanceAfter: Number(row.BALANCE_AFTER),
        relatedAccount: row.RELATED_ACCOUNT,
        date: row.TXN_DATE,
        status: row.STATUS
    };
}

async function getTransactionsByIds(connection, ids) {
    const placeholders = ids.map((_, index) => `:id${index}`);
    const binds = Object.fromEntries(ids.map((id, index) => [`id${index}`, id]));
    const result = await connection.execute(
        `SELECT txn_id, account_no, txn_type, amount, balance_after, related_account, txn_date, status
           FROM transactions
          WHERE txn_id IN (${placeholders.join(", ")})
          ORDER BY txn_id`,
        binds,
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows.map(mapTransaction);
}

export async function executeMoneyOperation({ operation, accountNo, fromAccount, toAccount, amount }) {
    return withConnection(async (connection) => {
        let ids;
        if (operation === "deposit" || operation === "withdraw") {
            const transactionId = { dir: oracledb.BIND_OUT, type: oracledb.NUMBER };
            const procedure = operation === "deposit" ? "deposit" : "withdraw";
            const result = await connection.execute(
                `BEGIN banking_pkg.${procedure}(:accountNo, :amount, :transactionId); END;`,
                { accountNo, amount, transactionId }
            );
            ids = [result.outBinds.transactionId];
        } else {
            const fromTransactionId = { dir: oracledb.BIND_OUT, type: oracledb.NUMBER };
            const toTransactionId = { dir: oracledb.BIND_OUT, type: oracledb.NUMBER };
            const result = await connection.execute(
                `BEGIN banking_pkg.transfer(:fromAccount, :toAccount, :amount, :fromTransactionId, :toTransactionId); END;`,
                { fromAccount, toAccount, amount, fromTransactionId, toTransactionId }
            );
            ids = [result.outBinds.fromTransactionId, result.outBinds.toTransactionId];
        }
        return getTransactionsByIds(connection, ids);
    });
}

export async function getBalance(accountNo) {
    return withConnection(async (connection) => {
        const result = await connection.execute(
            "SELECT banking_pkg.get_balance(:accountNo) AS balance FROM dual",
            { accountNo },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return Number(result.rows[0].BALANCE);
    });
}

export async function accountBelongsToCustomer(accountNo, customerId) {
    const oracleCustomerId = Number(customerId.slice(1));
    return withConnection(async (connection) => {
        const result = await connection.execute(
            `SELECT 1 AS owns_account
               FROM accounts
              WHERE account_no = :accountNo
                AND customer_id = :customerId`,
            { accountNo, customerId: oracleCustomerId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows.length > 0;
    });
}

export async function getAuditLogs({ page, limit }) {
    return withConnection(async (connection) => {
        const offset = (page - 1) * limit;
        const result = await connection.execute(
            `SELECT log_id, account_no, action, old_balance, new_balance, changed_at
               FROM audit_log
              ORDER BY changed_at DESC
             OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
            { offset, limit },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const countResult = await connection.execute(
            "SELECT COUNT(*) AS total FROM audit_log",
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return {
            rows: result.rows.map((row) => ({
                id: Number(row.LOG_ID),
                accountNo: row.ACCOUNT_NO,
                action: row.ACTION,
                oldBalance: Number(row.OLD_BALANCE),
                newBalance: Number(row.NEW_BALANCE),
                changedAt: row.CHANGED_AT
            })),
            total: Number(countResult.rows[0].TOTAL)
        };
    });
}
