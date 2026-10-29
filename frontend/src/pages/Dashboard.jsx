import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ArrowUpRightFromSquare, CreditCard, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import {
    Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import { api } from "../api/client.js";
import { BehindBadge, Card, EmptyState, ErrorState, formatCurrency, formatDate, LoadingState, PageHeader } from "../components/Shared.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const fallbackAccounts = ["ACCT001", "ACCT003", "ACCT006"];

export default function Dashboard() {
    const { user } = useAuth();
    const [accountNo, setAccountNo] = useState(user.customerId === "C001" ? "ACCT001" : "ACCT001");
    const [accounts, setAccounts] = useState(fallbackAccounts);
    const [dashboard, setDashboard] = useState(null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        api.get(`/profiles/${user.customerId || "C001"}`)
            .then(({ data }) => {
                if (data.data.linked_accounts?.length) {
                    setAccounts(data.data.linked_accounts);
                    setAccountNo((current) => data.data.linked_accounts.includes(current) ? current : data.data.linked_accounts[0]);
                }
            })
            .catch(() => {
                if (user.role === "CUSTOMER") setError("Your MongoDB profile could not be loaded.");
            });
    }, [user.customerId, user.role]);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");
        Promise.all([
            api.get(`/dashboard/${accountNo}`),
            api.get("/transactions", { params: { accountNo, page: 1, limit: 100, sortBy: "date", sortOrder: "asc" } })
        ]).then(([dashboardResponse, historyResponse]) => {
            if (!active) return;
            setDashboard(dashboardResponse.data.data);
            setHistory(historyResponse.data.data);
        }).catch((requestError) => {
            if (active) setError(requestError.message);
        }).finally(() => active && setLoading(false));
        return () => { active = false; };
    }, [accountNo, refreshKey]);

    const chartData = useMemo(() => {
        const byMonth = new Map();
        for (const transaction of history) {
            const date = new Date(transaction.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            const row = byMonth.get(key) || { month: date.toLocaleString("en", { month: "short" }), income: 0, spending: 0, order: key };
            if (transaction.type === "DEPOSIT") row.income += transaction.amount;
            else if (transaction.type === "WITHDRAW") row.spending += transaction.amount;
            byMonth.set(key, row);
        }
        return [...byMonth.values()].sort((first, second) => first.order.localeCompare(second.order)).slice(-8);
    }, [history]);

    if (loading && !dashboard) return <LoadingState label="Connecting your account to Oracle and MongoDB" />;

    return (
        <div className="animate-rise-in">
            <PageHeader
                eyebrow="Your banking overview"
                title={`Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}, ${user.name.split(" ")[0]}`}
                description="A clear view of your account, recent activity, and money movement."
                action={<label className="text-xs font-semibold text-slate-500">Account<select value={accountNo} onChange={(event) => setAccountNo(event.target.value)} className="ml-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">{accounts.map((account) => <option key={account}>{account}</option>)}</select></label>}
            />
            {error && <div className="mb-5"><ErrorState message={error} onRetry={() => setRefreshKey((value) => value + 1)} /></div>}

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#1c4ca7] to-[#3978e8] text-white">
                    <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border border-white/15" />
                    <div className="relative flex items-center justify-between text-blue-100"><span className="text-sm font-semibold">Available balance</span><CreditCard size={19} /></div>
                    <div className="relative mt-5 text-3xl font-bold tracking-tight">{dashboard ? formatCurrency(dashboard.balance) : "—"}</div>
                    <div className="relative mt-4"><BehindBadge db="oracle" executed="banking_pkg.get_balance()" /></div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400"><span className="text-sm font-semibold">Income shown</span><span className="rounded-xl bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><ArrowDownLeft size={18} /></span></div>
                    <p className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(history.filter((item) => item.type === "DEPOSIT").reduce((sum, item) => sum + item.amount, 0))}</p>
                    <p className="mt-2 text-xs text-slate-500">From the currently loaded history page</p>
                </Card>
                <Card>
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400"><span className="text-sm font-semibold">Spending shown</span><span className="rounded-xl bg-rose-50 p-2 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"><ArrowUpRight size={18} /></span></div>
                    <p className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(history.filter((item) => item.type === "WITHDRAW").reduce((sum, item) => sum + item.amount, 0))}</p>
                    <p className="mt-2 text-xs text-slate-500">From the currently loaded history page</p>
                </Card>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
                <Card>
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                        <div><h2 className="font-bold text-slate-900 dark:text-white">Income vs. spending</h2><p className="mt-1 text-xs text-slate-500">Grouped from this account's MongoDB history</p></div>
                        <BehindBadge db="mongodb" executed="transaction_history find + date grouping" />
                    </div>
                    {chartData.length ? <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                                <defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3978e8" stopOpacity={0.22} /><stop offset="95%" stopColor="#3978e8" stopOpacity={0} /></linearGradient><linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f07878" stopOpacity={0.16} /><stop offset="95%" stopColor="#f07878" stopOpacity={0} /></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf5" />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#8290a5" }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8290a5" }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Area type="monotone" dataKey="income" name="Deposits" stroke="#3978e8" strokeWidth={2.5} fill="url(#incomeFill)" />
                                <Area type="monotone" dataKey="spending" name="Withdrawals" stroke="#ec7777" strokeWidth={2.5} fill="url(#spendFill)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div> : <EmptyState title="No chart data yet" message="MongoDB history will appear here after you seed the demo or record transactions." />}
                </Card>
                <Card>
                    <div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-slate-900 dark:text-white">Recent transactions</h2><p className="mt-1 text-xs text-slate-500">Latest activity for {accountNo}</p></div><Link to="/history" className="text-xs font-bold text-brand-600 hover:underline">View all</Link></div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {dashboard?.recentTransactions?.slice(0, 5).map((transaction) => <div key={transaction._id} className="flex items-center gap-3 py-3">
                            <span className={`grid h-9 w-9 place-items-center rounded-xl ${transaction.type === "DEPOSIT" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{transaction.type === "DEPOSIT" ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span>
                            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{transaction.merchant || transaction.category}</p><p className="mt-0.5 text-xs text-slate-500">{formatDate(transaction.date)} · {transaction.type}</p></div>
                            <p className={`text-sm font-bold ${transaction.type === "DEPOSIT" ? "text-emerald-700 dark:text-emerald-300" : "text-slate-800 dark:text-slate-100"}`}>{transaction.type === "DEPOSIT" ? "+" : "−"}{formatCurrency(transaction.amount)}</p>
                        </div>)}
                        {!dashboard?.recentTransactions?.length && <EmptyState title="No recent activity" message="Your account activity will show here." />}
                    </div>
                    <div className="mt-3"><BehindBadge db="mongodb" executed="transaction_history find + sort/limit" /></div>
                </Card>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-brand-50/80 p-5 dark:border-brand-900 dark:bg-brand-950/30">
                <div><h2 className="font-bold text-slate-900 dark:text-white">Ready to move money?</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Deposits, withdrawals, and transfers are protected by Oracle PL/SQL.</p></div>
                {user.role !== "CUSTOMER" ? <Link to="/banking" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700"><Plus size={16} /> New transaction</Link> : <Link to="/history" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700">View history <ArrowUpRightFromSquare size={15} /></Link>}
            </div>
        </div>
    );
}
