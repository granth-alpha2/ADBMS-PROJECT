import { useEffect, useState } from "react";
import { Activity, FileClock, ShieldCheck, UserCog } from "lucide-react";
import { api } from "../api/client.js";
import { BehindBadge, Card, EmptyState, ErrorState, formatDate, LoadingState, PageHeader } from "../components/Shared.jsx";
import { useToast } from "../context/ToastContext.jsx";

const sections = [
    { id: "audit", label: "Oracle audit trail", icon: FileClock },
    { id: "activity", label: "MongoDB activity", icon: Activity },
    { id: "users", label: "User management", icon: UserCog }
];

export default function Admin() {
    const [section, setSection] = useState("audit");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { notify } = useToast();

    async function load() {
        setLoading(true);
        setError("");
        const endpoint = section === "audit" ? "/admin/audit-logs" : section === "activity" ? "/admin/activity-logs" : "/admin/users";
        try {
            const { data: response } = await api.get(endpoint, { params: section === "users" ? {} : { page: 1, limit: 50 } });
            setData(response.data);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [section]);

    async function updateUser(userId, update) {
        try {
            const { data: response } = await api.patch(`/admin/users/${userId}`, update);
            setData((current) => current.map((user) => user._id === userId ? response.data : user));
            notify("User role updated.");
        } catch (requestError) {
            setError(requestError.message);
            notify(requestError.message, "error");
        }
    }

    return (
        <div className="animate-rise-in">
            <PageHeader eyebrow="Administration" title="Control room" description="Review Oracle balance audit entries, flexible MongoDB activity, and application roles." action={<BehindBadge db={section === "audit" ? "oracle" : "mongodb"} executed={section === "audit" ? "audit_log SELECT" : section === "activity" ? "activity_logs find" : "app_users find"} />} />
            <div className="mb-5 flex flex-wrap gap-2">{sections.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setSection(item.id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${section === item.id ? "bg-brand-600 text-white" : "border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}><Icon size={16} />{item.label}</button>; })}</div>
            <Card className="p-0">
                {loading ? <LoadingState label="Loading the administration view" /> : error ? <div className="p-5"><ErrorState message={error} onRetry={load} /></div> : !data.length ? <div className="p-5"><EmptyState title="Nothing to review yet" message="Database audit and activity entries will appear after demo actions." /></div> : section === "users" ? <UserTable users={data} onUpdate={updateUser} /> : <LogTable rows={data} section={section} />}
                <div className="border-t border-slate-100 p-4 dark:border-slate-800"><BehindBadge db={section === "audit" ? "oracle" : "mongodb"} executed={section === "audit" ? "account update trigger → audit_log" : section === "activity" ? "activity_logs find + sort/skip/limit" : "app_users find without passwordHash"} /></div>
            </Card>
        </div>
    );
}

function LogTable({ rows, section }) {
    const audit = section === "audit";
    return <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:bg-slate-950/60"><tr>{audit ? <><th className="px-5 py-3">Account</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Old balance</th><th className="px-5 py-3">New balance</th><th className="px-5 py-3">Changed at</th></> : <><th className="px-5 py-3">User</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">IP address</th><th className="px-5 py-3">Timestamp</th></>}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{rows.map((row) => audit ? <tr key={row.id}><td className="px-5 py-4 font-semibold">{row.accountNo}</td><td className="px-5 py-4"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">{row.action}</span></td><td className="px-5 py-4">{Number(row.oldBalance).toLocaleString("en-IN")}</td><td className="px-5 py-4 font-bold">{Number(row.newBalance).toLocaleString("en-IN")}</td><td className="px-5 py-4 text-slate-500">{formatDate(row.changedAt)}</td></tr> : <tr key={row._id}><td className="px-5 py-4 font-semibold">{row.user}</td><td className="px-5 py-4">{row.action}</td><td className="px-5 py-4 text-slate-500">{row.ip}</td><td className="px-5 py-4 text-slate-500">{formatDate(row.timestamp)}</td></tr>)}</tbody></table></div>;
}

function UserTable({ users, onUpdate }) {
    return <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:bg-slate-950/60"><tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Created</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{users.map((user) => <tr key={user._id}><td className="px-5 py-4"><p className="font-semibold">{user.name}</p><p className="mt-1 text-xs text-slate-500">{user.email}</p></td><td className="px-5 py-4"><select aria-label={`Role for ${user.email}`} value={user.role} onChange={(event) => onUpdate(user._id, { role: event.target.value })} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"><option>ADMIN</option><option>TELLER</option><option>CUSTOMER</option></select></td><td className="px-5 py-4"><button onClick={() => onUpdate(user._id, { active: !user.active })} className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"}`}>{user.active ? "Active" : "Disabled"}</button></td><td className="px-5 py-4 text-xs text-slate-500">{formatDate(user.createdAt)}</td></tr>)}</tbody></table></div>;
}
