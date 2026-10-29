import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

function readStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("banksphere-user") || "null");
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readStoredUser);

    useEffect(() => {
        const clearSession = () => {
            setUser(null);
            localStorage.removeItem("banksphere-user");
        };
        window.addEventListener("banksphere:unauthorized", clearSession);
        return () => window.removeEventListener("banksphere:unauthorized", clearSession);
    }, []);

    async function signIn(credentials) {
        const { data } = await api.post("/auth/login", credentials);
        localStorage.setItem("banksphere-token", data.data.token);
        localStorage.setItem("banksphere-user", JSON.stringify(data.data.user));
        setUser(data.data.user);
        return data.data.user;
    }

    function signOut() {
        localStorage.removeItem("banksphere-token");
        localStorage.removeItem("banksphere-user");
        setUser(null);
    }

    const value = useMemo(() => ({ user, signIn, signOut }), [user]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider.");
    return context;
}
