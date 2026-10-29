import { performTransaction } from "../services/transactionService.js";
import { accountBelongsToCustomer, getBalance } from "../repositories/oracleRepository.js";
import { getDashboard } from "../services/dashboardService.js";
import { getHistory, getProfile } from "../repositories/mongoRepository.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";

function operationMessage(historySync, operation) {
    if (historySync === "retry_required") {
        return `The ${operation} was committed by Oracle, but MongoDB history sync needs attention. The server retried once and logged the failure.`;
    }
    return `${operation[0].toUpperCase()}${operation.slice(1)} completed successfully.`;
}

export async function transactionController(operation, request, response) {
    const result = await performTransaction({
        operation,
        ...request.body,
        user: request.user.email,
        ip: request.ip
    });
    const names = {
        deposit: "banking_pkg.deposit() + account audit trigger",
        withdraw: "banking_pkg.withdraw() + account audit trigger",
        transfer: "banking_pkg.transfer() + two account audit entries"
    };
    return sendSuccess(response, {
        message: operationMessage(result.historySync, operation),
        data: result,
        db: "oracle",
        executed: names[operation],
        extraMeta: { historySync: result.historySync }
    });
}

export async function balanceController(request, response) {
    await ensureAccountAccess(request, request.params.accountNo);
    const balance = await getBalance(request.params.accountNo);
    return sendSuccess(response, {
        message: "Current account balance loaded.",
        data: { accountNo: request.params.accountNo, balance },
        db: "oracle",
        executed: "banking_pkg.get_balance()"
    });
}

export async function dashboardController(request, response) {
    await ensureAccountAccess(request, request.params.accountNo);
    const data = await getDashboard(request.params.accountNo);
    return sendSuccess(response, {
        message: "Dashboard data loaded.",
        data,
        db: "oracle",
        executed: "banking_pkg.get_balance() + MongoDB recent-history find"
    });
}

async function ensureAccountAccess(request, accountNo) {
    if (request.user.role !== "CUSTOMER") return;
    const profile = await getProfile(request.user.customerId);
    if (!profile?.linked_accounts.includes(accountNo) ||
        !(await accountBelongsToCustomer(accountNo, request.user.customerId))) {
        throw new AppError(403, "This account is not owned by and linked to your customer profile.");
    }
}

export async function historyController(request, response) {
    const { page = 1, limit = 20, minAmount } = request.query;
    const accountNo = request.query.accountNo;
    if (request.user.role === "CUSTOMER") {
        if (!accountNo) throw new AppError(400, "Customers must select one of their linked accounts.");
        const profile = await getProfile(request.user.customerId);
        if (!profile?.linked_accounts.includes(accountNo) ||
            !(await accountBelongsToCustomer(accountNo, request.user.customerId))) {
            throw new AppError(403, "This account is not owned by and linked to your customer profile.");
        }
    }
    const result = await getHistory({
        ...request.query,
        accountNo,
        page: Number(page),
        limit: Number(limit),
        minAmount: minAmount === undefined ? undefined : Number(minAmount)
    });
    return sendSuccess(response, {
        message: "Transaction history loaded.",
        data: result.rows,
        db: "mongodb",
        executed: "transaction_history find + filter/sort/skip/limit",
        extraMeta: { page: Number(page), limit: Number(limit), total: result.total }
    });
}
