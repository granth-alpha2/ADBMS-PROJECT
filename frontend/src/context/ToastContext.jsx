import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const notify = useCallback((message, tone = "success") => {
        const id = crypto.randomUUID();
        setToasts((current) => [...current, { id, message, tone }]);
        window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
    }, []);
    const dismiss = (id) => setToasts((current) => current.filter((toast) => toast.id !== id));
    const value = useMemo(() => ({ notify }), [notify]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed right-4 top-4 z-[70] flex w-[min(92vw,380px)] flex-col gap-2">
                {toasts.map((toast) => (
                    <div key={toast.id} role="status" className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-card animate-rise-in ${toast.tone === "error" ? "border-rose-200 bg-white text-rose-700 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300" : "border-emerald-200 bg-white text-emerald-700 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-300"}`}>
                        {toast.tone === "error" ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                        <span className="flex-1 text-sm font-medium">{toast.message}</span>
                        <button aria-label="Dismiss notification" onClick={() => dismiss(toast.id)}><X size={16} /></button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used inside ToastProvider.");
    return context;
}
