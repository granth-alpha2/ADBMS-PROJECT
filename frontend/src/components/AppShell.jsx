import {
    Activity, ArrowLeftRight, BarChart3, BookOpen, CircleUserRound, CreditCard,
    Gauge, LayoutDashboard, LogOut, Moon, Sun, Users
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useExplain } from "../context/ExplainContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const navigation = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["ADMIN", "TELLER", "CUSTOMER"] },
    { to: "/banking", label: "Move money", icon: ArrowLeftRight, roles: ["ADMIN", "TELLER"] },
    { to: "/history", label: "Transactions", icon: CreditCard, roles: ["ADMIN", "TELLER", "CUSTOMER"] },
    { to: "/profile", label: "Customer profile", icon: CircleUserRound, roles: ["ADMIN", "TELLER", "CUSTOMER"] },
    { to: "/analytics", label: "Analytics", icon: BarChart3, roles: ["ADMIN", "TELLER"] },
    { to: "/admin", label: "Administration", icon: Users, roles: ["ADMIN"] },
    { to: "/performance", label: "Performance lab", icon: Gauge, roles: ["ADMIN"] },
    { to: "/how-it-works", label: "How it works", icon: BookOpen, roles: ["ADMIN", "TELLER", "CUSTOMER"] }
];

export default function AppShell() {
    const { user, signOut } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const { explainMode, toggleExplain } = useExplain();
    const navigate = useNavigate();
    const location = useLocation();
    const links = navigation.filter((item) => item.roles.includes(user?.role));

    function logout() {
        signOut();
        navigate("/login");
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb] text-slate-800 transition-colors dark:bg-[#0c1424] dark:text-slate-100">
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-950 lg:flex">
                <Brand />
                <div className="mt-9 px-3 text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">Workspace</div>
                <nav className="mt-3 flex flex-1 flex-col gap-1">
                    {links.map((item) => <NavItem key={item.to} item={item} />)}
                </nav>
                <div className="rounded-2xl bg-brand-50 p-4 dark:bg-slate-900">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-brand-700 dark:text-brand-300"><Activity size={15} /> Database learning</div>
                    <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">Oracle protects balances. MongoDB powers profiles and analytics.</p>
                </div>
            </aside>

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
                    <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-7">
                        <div className="flex min-w-0 items-center gap-3 lg:hidden"><Brand compact /></div>
                        <div className="hidden min-w-0 flex-1 text-sm text-slate-500 dark:text-slate-400 lg:block">
                            Banking workspace <span className="mx-2 text-slate-300">/</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{navigation.find((item) => location.pathname.startsWith(item.to))?.label || "Overview"}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-2 sm:gap-3">
                            <button onClick={toggleExplain} aria-pressed={explainMode} className={`rounded-full border px-3 py-2 text-xs font-bold transition ${explainMode ? "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-200" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}>
                                Explain {explainMode ? "on" : "off"}
                            </button>
                            <button onClick={toggleTheme} className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}>
                                {darkMode ? <Sun size={17} /> : <Moon size={17} />}
                            </button>
                            <div className="hidden items-center gap-2 sm:flex">
                                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-100">{user?.name?.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                                <div className="hidden leading-4 md:block"><p className="text-xs font-semibold">{user?.name}</p><p className="text-[11px] text-slate-500">{user?.role}</p></div>
                            </div>
                            <button onClick={logout} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Sign out"><LogOut size={17} /></button>
                        </div>
                    </div>
                    <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden dark:border-slate-800">
                        {links.map((item) => <NavItem key={item.to} item={item} compact />)}
                    </nav>
                </header>
                <main className="mx-auto min-h-[calc(100vh-68px)] max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8">
                    <Outlet />
                </main>
                <footer className="px-6 pb-6 text-center text-xs text-slate-400">BankSphere learning project · Oracle PL/SQL + MongoDB</footer>
            </div>
        </div>
    );
}

function Brand({ compact = false }) {
    return (
        <div className={`flex items-center gap-3 ${compact ? "" : "px-3"}`}>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20"><CreditCard size={21} /></div>
            <div>
                <div className="text-[18px] font-extrabold tracking-tight text-slate-950 dark:text-white">BankSphere</div>
                {!compact && <div className="text-[11px] font-semibold text-slate-400">BANKING & ANALYTICS</div>}
            </div>
        </div>
    );
}

function NavItem({ item, compact = false }) {
    const Icon = item.icon;
    return (
        <NavLink to={item.to} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-200" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"} ${compact ? "px-3 py-2 text-xs" : ""}`}>
            <Icon size={17} />
            <span>{item.label}</span>
        </NavLink>
    );
}
