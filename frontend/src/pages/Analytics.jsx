import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, ChevronRight, GitBranch, X } from "lucide-react";
import {
    Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer,
    Tooltip, XAxis, YAxis
} from "recharts";
import { api } from "../api/client.js";
import { BehindBadge, Card, EmptyState, ErrorState, formatCurrency, LoadingState, PageHeader } from "../components/Shared.jsx";

const reportDefinitions = [
    { id: "depositsVsWithdrawals", title: "Deposits vs. withdrawals", subtitle: "Customer totals by transaction type", icon: BarChart3 },
    { id: "monthlyTrend", title: "Monthly transaction trend", subtitle: "Volume and count over time", icon: Activity },
    { id: "topCustomers", title: "Top 5 customers", subtitle: "Largest transaction volume", icon: BarChart3 },
    { id: "spendingByCategory", title: "Spending by category", subtitle: "Withdrawal mix", icon: GitBranch },
    { id: "customerTransactionJoin", title: "Customer + transaction join", subtitle: "Profile and history in one report", icon: GitBranch },
    { id: "suspiciousActivity", title: "Large transactions", subtitle: "Flag amount ≥ ₹10,000", icon: Activity }
];
const colors = ["#3978e8", "#40a987", "#ee9b51", "#9271d4", "#e36c83", "#61a8c9"];

export default function Analytics() {
    const [reports, setReports] = useState({});
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    async function loadReports() {
        setLoading(true);
        setError("");
        try {
            const results = await Promise.all(reportDefinitions.map(async (report) => {
                const { data } = await api.get(`/analytics/${report.id}`);
                return [report.id, { rows: data.data, meta: data.meta }];
            }));
            setReports(Object.fromEntries(results));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadReports(); }, []);

    const customerTotals = useMemo(() => {
        const totals = new Map();
        for (const row of reports.depositsVsWithdrawals?.rows || []) {
            const name = row._id.name;
            const item = totals.get(name) || { name, deposits: 0, withdrawals: 0 };
            item[row._id.type === "DEPOSIT" ? "deposits" : "withdrawals"] = row.total_amount;
            totals.set(name, item);
        }
        return [...totals.values()];
    }, [reports.depositsVsWithdrawals]);
    const joinedCustomerTotals = useMemo(() => {
        const totals = new Map();
        for (const row of reports.customerTransactionJoin?.rows || []) {
            totals.set(row.customer_name, (totals.get(row.customer_name) || 0) + row.amount);
        }
        return [...totals.entries()].map(([name, volume]) => ({ name, volume }));
    }, [reports.customerTransactionJoin]);

    if (loading) return <LoadingState label="Running MongoDB aggregation pipelines" />;

    return (
        <div className="animate-rise-in">
            <PageHeader eyebrow="Advanced MongoDB · Unit 3" title="Analytics studio" description="Each visual is powered by a MongoDB aggregation pipeline. Open the pipeline panel to explain its stages." action={<BehindBadge db="mongodb" executed="aggregation pipelines: $group · $sum · $lookup · $facet" always />} />
            {error && <div className="mb-5"><ErrorState message={error} onRetry={loadReports} /></div>}
            <div className="grid gap-5 xl:grid-cols-2">
                <ChartCard definition={reportDefinitions[0]} onShowPipeline={() => setSelected(reportDefinitions[0])}>
                    {customerTotals.length ? <ResponsiveContainer width="100%" height={260}><BarChart data={customerTotals.slice(0, 8)} margin={{ left: -18, right: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf5" /><XAxis dataKey="name" tickFormatter={(value) => value.split(" ")[0]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8290a5" }} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8290a5" }} /><Tooltip formatter={(value) => formatCurrency(value)} /><Bar dataKey="deposits" name="Deposits" fill="#3978e8" radius={[5, 5, 0, 0]} /><Bar dataKey="withdrawals" name="Withdrawals" fill="#40a987" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyState title="No totals yet" message="Seed transaction history to build customer totals." />}
                </ChartCard>

                <ChartCard definition={reportDefinitions[1]} onShowPipeline={() => setSelected(reportDefinitions[1])}>
                    <ResponsiveContainer width="100%" height={260}><LineChart data={(reports.monthlyTrend?.rows || []).map((row) => ({ month: `${row._id.year}-${String(row._id.month).padStart(2, "0")}`, count: row.transaction_count, volume: row.total_volume }))} margin={{ left: -18, right: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf5" /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8290a5" }} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8290a5" }} /><Tooltip formatter={(value, key) => key === "volume" ? formatCurrency(value) : value} /><Line type="monotone" dataKey="volume" name="Volume" stroke="#3978e8" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="count" name="Transactions" stroke="#ee9b51" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer>
                </ChartCard>

                <ChartCard definition={reportDefinitions[2]} onShowPipeline={() => setSelected(reportDefinitions[2])}>
                    <ResponsiveContainer width="100%" height={260}><BarChart layout="vertical" data={reports.topCustomers?.rows || []} margin={{ left: 12, right: 20 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8edf5" /><XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8290a5" }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} /><YAxis type="category" dataKey="name" width={105} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8290a5" }} /><Tooltip formatter={(value) => formatCurrency(value)} /><Bar dataKey="total_volume" name="Transaction volume" fill="#3978e8" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer>
                </ChartCard>

                <ChartCard definition={reportDefinitions[3]} onShowPipeline={() => setSelected(reportDefinitions[3])}>
                    <ResponsiveContainer width="100%" height={260}><PieChart><Pie data={reports.spendingByCategory?.rows || []} dataKey="total_spend" nameKey="_id" innerRadius={58} outerRadius={90} paddingAngle={3}>{(reports.spendingByCategory?.rows || []).map((entry, index) => <Cell key={entry._id} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(value) => formatCurrency(value)} /></PieChart></ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">{(reports.spendingByCategory?.rows || []).map((row, index) => <span key={row._id} className="inline-flex items-center gap-1.5 text-xs text-slate-500"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{row._id}</span>)}</div>
                </ChartCard>

                <ChartCard definition={reportDefinitions[4]} onShowPipeline={() => setSelected(reportDefinitions[4])}>
                    <ResponsiveContainer width="100%" height={250}><BarChart layout="vertical" data={joinedCustomerTotals.slice(0, 7)} margin={{ left: 12, right: 20 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8edf5" /><XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8290a5" }} /><YAxis type="category" dataKey="name" width={105} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8290a5" }} /><Tooltip formatter={(value) => formatCurrency(value)} /><Bar dataKey="volume" name="Joined transaction volume" fill="#9271d4" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer>
                    <div className="mt-2 overflow-x-auto"><table className="w-full min-w-[420px] text-left text-xs"><thead className="text-slate-500"><tr><th className="pb-2">Customer</th><th className="pb-2">Account</th><th className="pb-2">Type</th><th className="pb-2 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{(reports.customerTransactionJoin?.rows || []).slice(0, 4).map((row, index) => <tr key={`${row.account_no}-${index}`}><td className="py-2.5 font-semibold">{row.customer_name}</td><td className="py-2.5 text-slate-500">{row.account_no}</td><td className="py-2.5">{row.type}</td><td className="py-2.5 text-right font-bold">{formatCurrency(row.amount)}</td></tr>)}</tbody></table></div>
                </ChartCard>

                <ChartCard definition={reportDefinitions[5]} onShowPipeline={() => setSelected(reportDefinitions[5])}>
                    <SuspiciousCard report={reports.suspiciousActivity?.rows?.[0]} />
                </ChartCard>
            </div>
            {selected && <PipelineDrawer definition={selected} report={reports[selected.id]} onClose={() => setSelected(null)} />}
        </div>
    );
}

function ChartCard({ definition, children, onShowPipeline }) {
    const Icon = definition.icon;
    return (
        <Card>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3"><span className="rounded-xl bg-brand-50 p-2.5 text-brand-700 dark:bg-brand-950/50 dark:text-brand-200"><Icon size={18} /></span><div><h2 className="font-bold text-slate-900 dark:text-white">{definition.title}</h2><p className="mt-1 text-xs text-slate-500">{definition.subtitle}</p></div></div>
                <button onClick={onShowPipeline} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Show pipeline</button>
            </div>
            {children}
            <div className="mt-3"><BehindBadge db="mongodb" executed={definition.id.replaceAll(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)} /></div>
        </Card>
    );
}

function SuspiciousCard({ report }) {
    const flagged = report?.flagged_transactions || [];
    const summary = report?.summary?.[0];
    return (
        <div>
            <div className="mb-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/40"><p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Flagged transactions</p><p className="mt-2 text-2xl font-bold">{summary?.count || 0}</p></div><div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950"><p className="text-xs font-semibold text-slate-500">Flagged volume</p><p className="mt-2 text-lg font-bold">{formatCurrency(summary?.total_amount)}</p></div></div>
            {flagged.length ? <>
                <ResponsiveContainer width="100%" height={190}><BarChart data={flagged.slice(0, 6)} margin={{ left: -18, right: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf5" /><XAxis dataKey="account_no" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#8290a5" }} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#8290a5" }} /><Tooltip formatter={(value) => formatCurrency(value)} /><Bar dataKey="amount" name="Flagged amount" fill="#ee9b51" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>
                <div className="space-y-2">{flagged.slice(0, 3).map((row) => <div key={row._id} className="flex justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-xs dark:border-slate-800"><span>{row.account_no} · {row.merchant}</span><strong>{formatCurrency(row.amount)}</strong></div>)}</div>
            </> : <EmptyState title="No large transactions" message="No records met the current threshold." />}
        </div>
    );
}

function PipelineDrawer({ definition, report, onClose }) {
    return (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/40 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <aside className="h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl animate-rise-in dark:border-slate-800 dark:bg-slate-950 sm:p-7">
                <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-brand-600">Aggregation pipeline</p><h2 className="mt-2 text-xl font-bold">{definition.title}</h2><p className="mt-2 text-sm text-slate-500">Collection: <code>{report?.meta?.pipeline ? "see pipeline stages" : "transaction_history"}</code></p></div><button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close pipeline panel"><X size={19} /></button></div>
                <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-blue-100">
                    <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(report?.meta?.pipeline || [], null, 2)}</pre>
                </div>
                    <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950/30"><div className="flex items-center gap-2 text-sm font-bold text-brand-800 dark:text-brand-200"><GitBranch size={16} /> In plain language</div><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{report?.meta?.executed || "MongoDB aggregation runs grouped and joined document data."}</p><p className="mt-2 text-xs text-slate-500">Collection: <code>{report?.meta?.collection}</code></p></div>
                <div className="mt-5"><BehindBadge db="mongodb" executed={report?.meta?.executed} always /></div>
            </aside>
        </div>
    );
}
