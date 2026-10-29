import { getBalance } from "../repositories/oracleRepository.js";
import { getHistory } from "../repositories/mongoRepository.js";

export async function getDashboard(accountNo) {
    const [balance, recent] = await Promise.all([
        getBalance(accountNo),
        getHistory({
            accountNo,
            page: 1,
            limit: 6,
            sortBy: "date",
            sortOrder: "desc"
        })
    ]);
    return { balance, recentTransactions: recent.rows };
}
