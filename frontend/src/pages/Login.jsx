import { useState } from "react";
import { ArrowRight, BadgeCheck, Eye, EyeOff, Landmark, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { BehindBadge } from "../components/Shared.jsx";

const demoAccounts = [
    { role: "ADMIN", label: "Admin", email: "admin@banksphere.demo", password: "ChangeMeAdmin!123" },
    { role: "TELLER", label: "Teller", email: "teller@banksphere.demo", password: "ChangeMeTeller!123" },
    { role: "CUSTOMER", label: "Customer", email: "customer@banksphere.demo", password: "ChangeMeCustomer!123" }
];

export default function Login() {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const { signIn } = useAuth();
    const { notify } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    async function submit(event) {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
            await signIn(credentials);
            notify("Welcome to BankSphere.");
            navigate(location.state?.from || "/dashboard", { replace: true });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBusy(false);
        }
    }

    function chooseDemo(account) {
        setCredentials({ email: account.email, password: account.password });
        setError("");
    }

    return (
        <main className="grid min-h-screen bg-white dark:bg-slate-950 lg:grid-cols-[1.05fr_.95fr]">
            <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#163a88] via-[#255dc0] to-[#3978e8] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
                <div className="absolute -right-36 -top-20 h-[480px] w-[480px] rounded-full border border-white/10" />
                <div className="absolute -bottom-48 -left-20 h-[560px] w-[560px] rounded-full border border-white/10" />
                <div className="relative flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><Landmark size={25} /></div><div className="text-xl font-extrabold">BankSphere</div></div>
                <div className="relative max-w-xl">
                    <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-blue-100">One learning platform. Two databases.</p>
                    <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">Banking made clear. Data made useful.</h1>
                    <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">Explore reliable PL/SQL transactions alongside flexible MongoDB profiles, history, and analytics.</p>
                    <div className="mt-9 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><ShieldCheck size={19} /><p className="mt-3 font-semibold">Oracle PL/SQL</p><p className="mt-1 text-sm leading-5 text-blue-100">ACID-safe balance changes and audit triggers.</p></div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><BadgeCheck size={19} /><p className="mt-3 font-semibold">MongoDB</p><p className="mt-1 text-sm leading-5 text-blue-100">Flexible profiles, transaction history, and aggregation.</p></div>
                    </div>
                </div>
                <p className="relative text-xs text-blue-100">B.Tech CSE · Database Management Systems</p>
            </section>

            <section className="flex items-center justify-center px-5 py-10 sm:px-10">
                <div className="w-full max-w-md animate-rise-in">
                    <div className="mb-8 lg:hidden">
                        <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white"><Landmark size={24} /></div>
                        <h1 className="text-2xl font-extrabold">BankSphere</h1>
                        <p className="mt-2 text-sm text-slate-500">Oracle keeps money safe. MongoDB makes data insightful.</p>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-brand-600">Welcome back</p>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Sign in to your workspace</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Use a demo role below or enter your local demo credentials.</p>

                    <div className="mt-6 grid grid-cols-3 gap-2">
                        {demoAccounts.map((account) => (
                            <button key={account.role} type="button" onClick={() => chooseDemo(account)} className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${credentials.email === account.email ? "border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-950/50 dark:text-brand-200" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"}`}>
                                {account.label}
                            </button>
                        ))}
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={submit}>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Email address
                            <input type="email" autoComplete="username" required value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950" placeholder="you@banksphere.demo" />
                        </label>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Password
                            <span className="relative mt-2 block">
                                <input type={showPassword ? "text" : "password"} autoComplete="current-password" required minLength={8} value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950" placeholder="Enter your password" />
                                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                            </span>
                        </label>
                        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
                        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
                            {busy ? "Signing you in…" : "Sign in"} <ArrowRight size={17} />
                        </button>
                    </form>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-slate-500">Demo passwords are documented in <code>backend/.env.example</code></span>
                        <BehindBadge db="mongodb" executed="app_users + bcrypt + JWT" always />
                    </div>
                </div>
            </section>
        </main>
    );
}
