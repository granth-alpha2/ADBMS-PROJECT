import { useState } from "react";
import { Activity, Gauge, Play, SearchCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/client.js";
import { BehindBadge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from "../components/Shared.jsx";

export default function PerformanceLab() {
    const [comparison, setComparison] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function runComparison() {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/performance");
            setComparison(data.data);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    const chartData = comparison ? [
        { phase: "Before index", documents: comparison.beforeIndex.documentsExamined, keys: comparison.beforeIndex.keysExamined },
        { phase: "After index", documents: comparison.afterIndex.documentsExamined, keys: comparison.afterIndex.keysExamined }
    ] : [];

    return (
        <div className="animate-rise-in">
            <PageHeader eyebrow="Advanced MongoDB · Unit 3" title="Performance lab" description="Compare MongoDB executionStats for the same merchant query before and after creating a single-field index." action={<button disabled={loading} onClick={runComparison} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60"><Play size={16} /> {loading ? "Running explain…" : "Run comparison"}</button>} />
            {error && <div className="mb-5"><ErrorState message={error} onRetry={runComparison} /></div>}
            <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
                <Card>
                    <div className="mb-6 flex items-start gap-3"><span className="rounded-xl bg-brand-50 p-2.5 text-brand-700 dark:bg-brand-950/50 dark:text-brand-200"><Gauge size={19} /></span><div><h2 className="font-bold">Documents examined</h2><p className="mt-1 text-xs text-slate-500">Lower scan counts are easier to compare than elapsed time on a tiny local dataset.</p></div></div>
                    {loading ? <LoadingState label="Running explain('executionStats')" /> : comparison ? <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ left: 0, right: 12, top: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf5" /><XAxis dataKey="phase" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#8290a5" }} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8290a5" }} /><Tooltip /><Bar dataKey="documents" name="Documents examined" fill="#3978e8" radius={[6, 6, 0, 0]} /><Bar dataKey="keys" name="Keys examined" fill="#40a987" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div> : <EmptyState title="Run an explain comparison" message="The API forces a collection scan for the baseline, creates a merchant index, and reads executionStats again." action={<button onClick={runComparison} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white"><Play size={15} /> Run now</button>} />}
                </Card>
                <Card>
                    <div className="mb-4 flex items-center gap-3"><span className="rounded-xl bg-violet-50 p-2.5 text-violet-700 dark:bg-violet-950/50 dark:text-violet-200"><SearchCheck size={18} /></span><h2 className="font-bold">Query plan details</h2></div>
                    {comparison ? <><code className="block rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-950">{JSON.stringify(comparison.query)}</code><div className="mt-4 space-y-3">{[["Before index", comparison.beforeIndex], ["After index", comparison.afterIndex]].map(([label, stats]) => <div key={label} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"><p className="text-xs font-bold text-slate-500">{label}</p><div className="mt-3 grid grid-cols-3 gap-2"><Metric label="Docs" value={stats.documentsExamined} /><Metric label="Keys" value={stats.keysExamined} /><Metric label="Time" value={`${stats.executionTimeMs} ms`} /></div></div>)}</div></> : <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">This lesson makes the query planner visible. An index can reduce documents examined, while elapsed time may vary with data size and system load.</p>}
                    <div className="mt-5"><BehindBadge db="mongodb" executed="find().explain('executionStats') + createIndex({ merchant: 1 })" /></div>
                </Card>
            </div>
            {comparison && <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 p-5 dark:border-brand-900 dark:bg-brand-950/30"><div className="flex items-center gap-2 font-bold text-brand-800 dark:text-brand-200"><Activity size={17} /> How to read the result</div><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">The baseline forces a collection scan. The second query can use the named merchant index. Explain compares documents and index keys examined; timing is displayed but can fluctuate on a local demo dataset.</p></div>}
        </div>
    );
}

function Metric({ label, value }) {
    return <div><p className="text-[11px] text-slate-500">{label}</p><p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{value}</p></div>;
}
