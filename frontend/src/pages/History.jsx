import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Search, SlidersHorizontal } from "lucide-react";
import { api } from "../api/client.js";
import { BehindBadge, Card, EmptyState, ErrorState, formatCurrency, formatDate, LoadingState, PageHeader } from "../components/Shared.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const pageSize = 10;

export default function History() {
    const { user } = useAuth();
    const [accountNo, setAccountNo] = useState(user.customerId === "C001" ? "ACCT001" : "");
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [accounts, setAccounts] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        api.get(`/profiles/${user.customerId || "C001"}`)
            .then(({ data }) => {
                const linked = data.data.linked_accounts || [];
                setAccounts(linked);
                setAccountNo((current) => current || linked[0] || "");
            })
            .catch((requestError) => {
                if (user.role === "CUSTOMER") setError(requestError.message);
            });
    }, [user.customerId, user.role]);

    useEffect(() => {
        if (!accountNo) {
            setLoading(false);
            return undefined;
        }
        let active = true;
        setLoading(true);
        const timer = window.setTimeout(() => {
            api.get("/transactions", {
                params: {
                    accountNo,
                    page,
                    limit: pageSize,
                    search: search || undefined,
                    type: type || undefined,
                    sortBy: "date",
                    sortOrder
                }
            }).then(({ data }) => {
                if (!active) return;
                setRows(data.data);
                setTotal(data.meta.total);
                setError("");
            }).catch((requestError) => active && setError(requestError.message))
                .finally(() => active && setLoading(false));
        }, search ? 250 : 0);
        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [accountNo, page, refreshKey, search, sortOrder, type]);

    const pageCount = Math.max(1, Math.ceil(total / pageSize));

    function exportCsv() {
        const headers = ["Account", "Type", "Amount", "Category", "Merchant", "Date"];
        const values = rows.map((row) => [row.account_no, row.type, row.amount, row.category, row.merchant, new Date(row.date).toISOString()]);
        const csv = [headers, ...values].map((line) => line.map((value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`).join(",")).join("\r\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `banksphere-${accountNo || "history"}-page-${page}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="animate-rise-in">
            <PageHeader eyebrow="MongoDB Fundamentals · Unit 2" title="Transaction history" description="Search, filter, sort, and export the flexible transaction documents synced from Oracle." action={<button onClick={exportCsv} disabled={!rows.length} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Download size={16} /> Export CSV</button>} />
            <Card className="p-0">
                <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:p-5">
                    <label className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950" placeholder="Search merchant, category, tag…" aria-label="Search transaction history" /></label>
                    {user.role === "CUSTOMER" ? <select aria-label="Account" value={accountNo} onChange={(event) => { setAccountNo(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-slate-700 dark:bg-slate-950">{accounts.map((account) => <option key={account}>{account}</option>)}</select> : <input aria-label="Account" value={accountNo} onChange={(event) => { setAccountNo(event.target.value.toUpperCase()); setPage(1); }} className="w-36 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-slate-700 dark:bg-slate-950" placeholder="Account" />}
                    <select aria-label="Transaction type" value={type} onChange={(event) => { setType(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-slate-700 dark:bg-slate-950"><option value="">All types</option><option>DEPOSIT</option><option>WITHDRAW</option><option>TRANSFER</option></select>
                    <button onClick={() => setSortOrder((value) => value === "desc" ? "asc" : "desc")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"><SlidersHorizontal size={15} /> Date {sortOrder === "desc" ? "newest" : "oldest"}</button>
                </div>
                {error && <div className="p-5"><ErrorState message={error} onRetry={() => setRefreshKey((value) => value + 1)} /></div>}
                {loading ? <LoadingState label="Searching MongoDB transaction history" /> : rows.length ? <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[740px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-950/60"><tr><th className="px-5 py-3.5">Transaction</th><th className="px-5 py-3.5">Account</th><th className="px-5 py-3.5">Category</th><th className="px-5 py-3.5">Date</th><th className="px-5 py-3.5 text-right">Amount</th><th className="px-5 py-3.5">Type</th></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{rows.map((row) => <tr key={row._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"><td className="px-5 py-4"><p className="font-semibold text-slate-900 dark:text-slate-100">{row.merchant || "BankSphere"}</p><p className="mt-1 text-xs text-slate-500">{row.tags?.join(" · ") || "—"}</p></td><td className="px-5 py-4 font-medium">{row.account_no}</td><td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.category}</td><td className="px-5 py-4 text-slate-500">{formatDate(row.date)}</td><td className="px-5 py-4 text-right font-bold">{formatCurrency(row.amount)}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${row.type === "DEPOSIT" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : row.type === "TRANSFER" ? "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{row.type}</span></td></tr>)}</tbody>
                        </table>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm dark:border-slate-800">
                        <p className="text-xs text-slate-500">Showing {Math.min(total, (page - 1) * pageSize + 1)}–{Math.min(total, page * pageSize)} of {total}</p>
                        <div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700" aria-label="Previous page"><ChevronLeft size={17} /></button><span className="text-xs font-semibold">Page {page} of {pageCount}</span><button disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700" aria-label="Next page"><ChevronRight size={17} /></button></div>
                    </div>
                </> : !error && <div className="p-5"><EmptyState title="No transactions found" message="Try a different search or filter, or seed the MongoDB demo history." /></div>}
                <div className="border-t border-slate-100 p-4 dark:border-slate-800"><BehindBadge db="mongodb" executed="transaction_history find + $regex/$in filters + sort/skip/limit" /></div>
            </Card>
        </div>
    );
}
