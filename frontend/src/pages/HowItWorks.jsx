import { useState } from "react";
import {
    Activity, ArrowRight, BookOpen, Braces, Database, Landmark, ShieldCheck, UserRound, Workflow
} from "lucide-react";
import { BehindBadge, Card, PageHeader } from "../components/Shared.jsx";

const steps = [
    { id: "user", title: "User", icon: UserRound, db: "none", badge: "Request", detail: "A customer or teller starts an action in the React interface. The JWT role determines which screens and API actions are available." },
    { id: "api", title: "Express API", icon: Workflow, db: "none", badge: "Validate", detail: "Express checks authentication, validates input, applies role guards and rate limits, then calls the matching service." },
    { id: "oracle", title: "Oracle PL/SQL", icon: Landmark, db: "oracle", badge: "Commit money", detail: "banking_pkg locks the account, checks its status and balance, updates account rows, writes transaction rows, and commits or rolls back." },
    { id: "trigger", title: "Audit trigger", icon: ShieldCheck, db: "oracle", badge: "Record change", detail: "The AFTER UPDATE trigger writes old and new balances into audit_log as part of the same Oracle transaction." },
    { id: "mongo", title: "MongoDB", icon: Braces, db: "mongodb", badge: "Sync context", detail: "After Oracle succeeds, the API retries the history sync once. A transfer uses a MongoDB session to log both account histories and its activity event atomically." },
    { id: "analytics", title: "Analytics", icon: Activity, db: "mongodb", badge: "Aggregate", detail: "Flexible profiles, transaction documents, and activity events support $group, $sum, $lookup, $facet, and explain executionStats." }
];

const units = [
    {
        unit: "Unit 1",
        title: "PL/SQL and transaction safety",
        color: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
        topics: ["Package procedures and functions", "ACID commit, rollback, and savepoints", "Account locking and check constraints", "Audit and validation triggers", "Parameterized cursors and exceptions"],
        features: ["Move money", "Oracle audit trail", "Balance card"]
    },
    {
        unit: "Unit 2",
        title: "MongoDB Fundamentals",
        color: "bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300",
        topics: ["Embedded customer documents and account references", "CRUD, projections, operators, sort and pagination", "Single-field, compound, and text indexes", "Array and nested updates"],
        features: ["Customer profile", "Transaction history", "Admin activity log"]
    },
    {
        unit: "Unit 3",
        title: "Advanced MongoDB",
        color: "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
        topics: ["Aggregation stages: $group, $sum, $lookup, $facet", "MongoDB session transaction for transfer logging", "ExecutionStats before and after an index", "Replica-set, backup, restore, and database users"],
        features: ["Analytics studio", "Performance lab", "Transfer sync"]
    }
];

export default function HowItWorks() {
    const [active, setActive] = useState("oracle");
    const activeStep = steps.find((step) => step.id === active);
    return (
        <div className="animate-rise-in">
            <PageHeader eyebrow="Project walkthrough" title="How BankSphere works" description="Follow a banking action from the interface into Oracle, then see how MongoDB makes it useful for people and analytics." action={<BehindBadge db="oracle" executed="money-critical · ACID-safe" always />} />
            <Card className="overflow-hidden">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">A request’s journey</h2><p className="mt-1 text-sm text-slate-500">Select any stage to see its job.</p></div><div className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 dark:bg-brand-950/50 dark:text-brand-200">Click a step</div></div>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const selected = active === step.id;
                        return <div key={step.id} className="flex items-center gap-2 xl:contents">
                            <button onClick={() => setActive(step.id)} className={`group flex min-h-32 flex-1 flex-col items-start rounded-2xl border p-4 text-left transition duration-300 hover:-translate-y-1 ${selected ? "border-brand-300 bg-brand-50 shadow-card dark:border-brand-700 dark:bg-brand-950/50" : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"}`}>
                                <span className={`mb-3 grid h-9 w-9 place-items-center rounded-xl ${step.db === "oracle" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200" : step.db === "mongodb" ? "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}><Icon size={18} /></span>
                                <span className="text-sm font-bold">{step.title}</span>
                                <span className="mt-1 text-xs text-slate-500">{step.badge}</span>
                            </button>
                            {index < steps.length - 1 && <ArrowRight className="hidden shrink-0 text-brand-400 xl:block" size={16} />}
                        </div>;
                    })}
                </div>
                <div key={activeStep.id} className="mt-5 grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 animate-rise-in dark:border-slate-800 dark:bg-slate-950 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div><p className="text-xs font-bold uppercase tracking-wide text-brand-600">{activeStep.title} · {activeStep.badge}</p><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{activeStep.detail}</p></div>
                    <BehindBadge db={activeStep.db} executed={activeStep.db === "oracle" ? "banking_pkg + audit trigger" : activeStep.db === "mongodb" ? "document query / aggregation" : "HTTP request + validation"} always />
                </div>
            </Card>

            <div className="mb-4 mt-8"><h2 className="text-xl font-bold text-slate-950 dark:text-white">Syllabus map</h2><p className="mt-1 text-sm text-slate-500">Each project screen demonstrates a concrete course topic.</p></div>
            <div className="grid gap-4 xl:grid-cols-3">{units.map((unit) => <Card key={unit.unit}>
                <div className="flex items-start justify-between gap-3"><div><span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${unit.color}`}>{unit.unit}</span><h3 className="mt-3 text-lg font-bold">{unit.title}</h3></div><BookOpen size={19} className="text-slate-400" /></div>
                <ul className="mt-4 space-y-2.5">{unit.topics.map((topic) => <li key={topic} className="flex gap-2 text-sm leading-5 text-slate-600 dark:text-slate-300"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />{topic}</li>)}</ul>
                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Project features</p><div className="mt-2 flex flex-wrap gap-2">{unit.features.map((feature) => <span key={feature} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{feature}</span>)}</div></div>
            </Card>)}</div>
        </div>
    );
}
