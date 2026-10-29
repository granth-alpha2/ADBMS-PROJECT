import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { api } from "../api/client.js";
import { BehindBadge, Card, ErrorState, formatCurrency, MetaBadge, Modal, PageHeader } from "../components/Shared.jsx";
import { useToast } from "../context/ToastContext.jsx";

const actionOptions = [
    { value: "deposit", label: "Deposit", icon: ArrowDownLeft, endpoint: "/transactions/deposit" },
    { value: "withdraw", label: "Withdraw", icon: ArrowUpRight, endpoint: "/transactions/withdraw" },
    { value: "transfer", label: "Transfer", icon: ArrowLeftRight, endpoint: "/transactions/transfer" }
];

export default function BankingAction() {
    const [action, setAction] = useState("transfer");
    const [form, setForm] = useState({ accountNo: "ACCT001", fromAccount: "ACCT001", toAccount: "ACCT003", amount: "" });
    const [fieldError, setFieldError] = useState("");
    const [requestError, setRequestError] = useState(null);
    const [result, setResult] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const { notify } = useToast();

    const selected = actionOptions.find((option) => option.value === action);
    const amount = Number(form.amount);
    const liveValidation = useMemo(() => {
        if (form.amount && (!Number.isFinite(amount) || amount <= 0)) return "Enter an amount greater than zero.";
        if (action === "transfer" && form.fromAccount && form.fromAccount === form.toAccount) return "Choose two different accounts.";
        return "";
    }, [action, amount, form.amount, form.fromAccount, form.toAccount]);

    function update(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
        setFieldError("");
        setRequestError(null);
        setResult(null);
    }

    async function submit() {
        setBusy(true);
        setRequestError(null);
        try {
            const payload = action === "transfer"
                ? { fromAccount: form.fromAccount.trim(), toAccount: form.toAccount.trim(), amount }
                : { accountNo: form.accountNo.trim(), amount };
            const { data } = await api.post(selected.endpoint, payload);
            setResult(data);
            setConfirming(false);
            notify(data.message);
            setForm((current) => ({ ...current, amount: "" }));
        } catch (error) {
            setRequestError({
                message: error.message,
                meta: error.response?.data?.meta
            });
            setConfirming(false);
            notify(error.message, "error");
        } finally {
            setBusy(false);
        }
    }

    function review(event) {
        event.preventDefault();
        if (form.amount.trim() === "" || !Number.isFinite(amount) || amount <= 0) {
            setFieldError("Enter a valid amount greater than zero.");
            return;
        }
        if (liveValidation) {
            setFieldError(liveValidation);
            return;
        }
        setConfirming(true);
    }

    return (
        <div className="animate-rise-in">
            <PageHeader eyebrow="Oracle PL/SQL · Unit 1" title="Move money with confidence" description="Every balance change is executed by banking_pkg in Oracle and audited by a database trigger." />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(290px,.7fr)]">
                <Card>
                    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800">
                        {actionOptions.map((option) => {
                            const Icon = option.icon;
                            return <button key={option.value} onClick={() => { setAction(option.value); setResult(null); setRequestError(null); setFieldError(""); }} className={`flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm font-bold transition ${action === option.value ? "bg-white text-brand-700 shadow-sm dark:bg-slate-950 dark:text-brand-300" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"}`}><Icon size={16} />{option.label}</button>;
                        })}
                    </div>

                    <form onSubmit={review} className="mt-7 space-y-5">
                        {action === "transfer" ? <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block text-sm font-semibold">From account<input required value={form.fromAccount} onChange={(event) => update("fromAccount", event.target.value)} className="form-input" placeholder="ACCT001" /></label>
                            <label className="block text-sm font-semibold">To account<input required value={form.toAccount} onChange={(event) => update("toAccount", event.target.value)} className="form-input" placeholder="ACCT003" /></label>
                        </div> : <label className="block text-sm font-semibold">Account number<input required value={form.accountNo} onChange={(event) => update("accountNo", event.target.value)} className="form-input" placeholder="ACCT001" /></label>}
                        <label className="block text-sm font-semibold">Amount <span className="text-slate-400">(INR)</span>
                            <div className="relative mt-2"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</span><input type="number" min="0.01" step="0.01" required value={form.amount} onChange={(event) => update("amount", event.target.value)} className="form-input pl-9 text-lg font-bold" placeholder="0.00" /></div>
                        </label>
                        {(fieldError || liveValidation) && <p role="alert" className="text-sm font-medium text-rose-600">{fieldError || liveValidation}</p>}
                        {requestError && <><ErrorState message={requestError.message} /><div className="mt-2"><MetaBadge meta={requestError.meta} always /></div></>}
                        {result && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 shrink-0 animate-success-pop text-emerald-600 dark:text-emerald-300" size={23} />
                                <div><p className="font-bold text-emerald-900 dark:text-emerald-200">{result.message}</p><p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">{formatCurrency(result.data.transactions[0].amount)} · Ref {result.data.transactions[0].id}</p><div className="mt-3"><MetaBadge meta={result.meta} always /></div></div>
                            </div>
                        </div>}
                        <button type="submit" disabled={Boolean(liveValidation)} className="w-full rounded-xl bg-brand-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">Review {selected.label.toLowerCase()}</button>
                    </form>
                </Card>

                <div className="space-y-5">
                    <Card>
                        <div className="mb-3 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><ShieldCheck size={20} /></span><div><h2 className="font-bold">Money-critical logic</h2><p className="text-xs text-slate-500">Oracle is the source of truth</p></div></div>
                        <ul className="space-y-3 text-sm leading-5 text-slate-600 dark:text-slate-300"><li>• Package locks the account before changing its balance.</li><li>• Check constraints prevent negative account balances.</li><li>• The audit trigger records old and new balances.</li><li>• MongoDB receives the committed history afterwards.</li></ul>
                        <div className="mt-4"><BehindBadge db="oracle" executed={`banking_pkg.${action}() + audit trigger`} /></div>
                    </Card>
                    <Card className="bg-slate-50 dark:bg-slate-900/70">
                        <h2 className="font-bold">Before you confirm</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Oracle commits a successful operation before flexible history is synced. If MongoDB sync needs attention, the response tells you clearly and the server logs the failed retry.</p>
                    </Card>
                </div>
            </div>

            {confirming && <Modal title={`Confirm ${selected.label.toLowerCase()}`} onClose={() => setConfirming(false)} footer={<><button onClick={() => setConfirming(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">Cancel</button><button disabled={busy} onClick={submit} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{busy ? "Processing…" : `Confirm ${selected.label.toLowerCase()}`}</button></>}>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">You are about to {action} <strong>{formatCurrency(amount)}</strong> {action === "transfer" ? `from ${form.fromAccount} to ${form.toAccount}` : `in ${form.accountNo}`}.</p>
                <div className="mt-4"><BehindBadge db="oracle" executed={`banking_pkg.${action}() + audit trigger`} always /></div>
            </Modal>}
        </div>
    );
}
