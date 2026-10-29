import { AlertCircle, ArrowRight, Database, LoaderCircle, X } from "lucide-react";
import { useExplain } from "../context/ExplainContext.jsx";

export function PageHeader({ eyebrow, title, description, action }) {
    return (
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
                {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-brand-600 dark:text-brand-300">{eyebrow}</p>}
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{title}</h1>
                {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>}
            </div>
            {action}
        </div>
    );
}

export function Card({ children, className = "" }) {
    return <section className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-6 ${className}`}>{children}</section>;
}

export function BehindBadge({ db = "mongodb", executed, always = false }) {
    const { explainMode } = useExplain();
    if ((!explainMode && !always) || !executed) return null;
    const isOracle = db === "oracle";
    return (
        <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-4 ${isOracle ? "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" : "bg-violet-50 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300"}`}>
            <Database size={12} />
            <span className="truncate">{isOracle ? "Oracle" : "MongoDB"} · {executed}</span>
        </span>
    );
}

export function MetaBadge({ meta, always = false }) {
    if (!meta?.executed) return null;
    return <BehindBadge db={meta.db} executed={meta.executed} always={always} />;
}

export function LoadingState({ label = "Loading your banking data" }) {
    return (
        <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <LoaderCircle className="animate-spin text-brand-600" size={26} />
            <span>{label}</span>
            <div className="mt-2 h-2 w-52 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
    );
}

export function EmptyState({ title, message, action }) {
    return (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 text-center dark:border-slate-700">
            <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-500 dark:bg-slate-800 dark:text-slate-300"><AlertCircle size={20} /></div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{message}</p>
            {action}
        </div>
    );
}

export function ErrorState({ message, onRetry }) {
    return (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            <span>{message}</span>
            {onRetry && <button className="inline-flex items-center gap-1 font-semibold underline" onClick={onRetry}>Try again <ArrowRight size={14} /></button>}
        </div>
    );
}

export function Modal({ title, children, onClose, footer }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
                    <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close dialog" onClick={onClose}><X size={18} /></button>
                </div>
                <div>{children}</div>
                {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
            </section>
        </div>
    );
}

export function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(Number(value || 0));
}

export function formatDate(value) {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
