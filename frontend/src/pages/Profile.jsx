import { useEffect, useState } from "react";
import { Check, MapPin, Plus, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { api } from "../api/client.js";
import { BehindBadge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from "../components/Shared.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Profile() {
    const { user } = useAuth();
    const customerId = user.customerId || "C001";
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ city: "", state: "", pincode: "", currency: "INR", monthlySummary: true });
    const [accountNo, setAccountNo] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { notify } = useToast();

    async function loadProfile() {
        setLoading(true);
        try {
            const { data } = await api.get(`/profiles/${customerId}`);
            setProfile(data.data);
            setForm({
                city: data.data.address.city,
                state: data.data.address.state,
                pincode: data.data.address.pincode,
                currency: data.data.preferences.currency || "INR",
                monthlySummary: Boolean(data.data.preferences.monthly_summary)
            });
            setError("");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadProfile(); }, [customerId]);

    async function saveProfile(event) {
        event.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.patch(`/profiles/${customerId}`, {
                address: { city: form.city, state: form.state, pincode: form.pincode },
                preferences: { currency: form.currency, monthly_summary: form.monthlySummary }
            });
            setProfile(data.data);
            notify("Customer profile saved.");
        } catch (requestError) {
            setError(requestError.message);
            notify(requestError.message, "error");
        } finally {
            setSaving(false);
        }
    }

    async function changeAccount(action, value) {
        try {
            const method = action === "add" ? "post" : "delete";
            const url = `/profiles/${customerId}/accounts`;
            const { data } = method === "post"
                ? await api.post(url, { accountNo: value })
                : await api.delete(url, { data: { accountNo: value } });
            setProfile(data.data);
            setAccountNo("");
            notify(`Linked account ${action === "add" ? "added" : "removed"}.`);
        } catch (requestError) {
            setError(requestError.message);
            notify(requestError.message, "error");
        }
    }

    if (loading) return <LoadingState label="Loading the flexible MongoDB customer profile" />;
    if (!profile) return <ErrorState message={error || "Profile unavailable."} onRetry={loadProfile} />;

    return (
        <div className="animate-rise-in">
            <PageHeader eyebrow="MongoDB Fundamentals · Unit 2" title="Customer profile" description="This flexible document embeds address, preferences, KYC details, and linked account references." action={<BehindBadge db="mongodb" executed="customers findOne by _id" />} />
            {error && <div className="mb-5"><ErrorState message={error} /></div>}
            <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
                <div className="space-y-5">
                    <Card>
                        <div className="flex items-start gap-4">
                            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-200"><UserRound size={23} /></span>
                            <div className="min-w-0"><p className="text-lg font-bold text-slate-900 dark:text-white">{profile.name}</p><p className="mt-1 text-sm text-slate-500">{profile.email}</p><p className="mt-1 text-sm text-slate-500">{profile.phone}</p></div>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><p className="text-xs text-slate-500">Customer ID</p><p className="mt-1 font-bold">{profile._id}</p></div>
                            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><p className="text-xs text-slate-500">KYC status</p><p className="mt-1 inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300"><ShieldCheck size={15} />{profile.kyc.status}</p></div>
                        </div>
                        <div className="mt-4"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">KYC documents</p><div className="flex flex-wrap gap-2">{profile.kyc.documents.map((document) => <span key={document} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{document}</span>)}</div></div>
                    </Card>
                    <Card>
                        <div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold">Linked accounts</h2><p className="mt-1 text-xs text-slate-500">Stored as account references</p></div><BehindBadge db="mongodb" executed="$addToSet / $pull linked_accounts" /></div>
                        <div className="space-y-2">{profile.linked_accounts.map((account) => <div key={account} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800"><span className="font-semibold">{account}</span><button aria-label={`Remove ${account}`} onClick={() => changeAccount("remove", account)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"><Trash2 size={16} /></button></div>)}{!profile.linked_accounts.length && <EmptyState title="No linked accounts" message="Add an existing Oracle account number below." />}</div>
                        <div className="mt-4 flex gap-2"><input value={accountNo} onChange={(event) => setAccountNo(event.target.value.toUpperCase())} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950" placeholder="Account number" /><button disabled={!accountNo.trim()} onClick={() => changeAccount("add", accountNo.trim())} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Plus size={16} /> Add</button></div>
                    </Card>
                </div>
                <Card>
                    <div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"><MapPin size={19} /></span><div><h2 className="font-bold">Profile details</h2><p className="text-xs text-slate-500">Edit nested fields in the MongoDB document</p></div></div>
                    <form onSubmit={saveProfile} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block text-sm font-semibold">City<input required minLength={2} value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className="form-input" /></label>
                            <label className="block text-sm font-semibold">State<input required minLength={2} value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} className="form-input" /></label>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block text-sm font-semibold">Pincode<input required pattern="\d{6}" value={form.pincode} onChange={(event) => setForm({ ...form, pincode: event.target.value })} className="form-input" /></label>
                            <label className="block text-sm font-semibold">Preferred currency<select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} className="form-input"><option>INR</option><option>USD</option><option>EUR</option></select></label>
                        </div>
                        <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-semibold dark:bg-slate-950"><input type="checkbox" checked={form.monthlySummary} onChange={(event) => setForm({ ...form, monthlySummary: event.target.checked })} className="h-4 w-4 accent-brand-600" /> Send a monthly summary</label>
                        <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">{saving ? "Saving…" : <><Check size={16} /> Save changes</>}</button>
                        <div className="pt-1"><BehindBadge db="mongodb" executed="customers $set address.city/state/pincode + preferences" /></div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
