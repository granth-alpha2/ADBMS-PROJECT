import { createContext, useContext, useMemo, useState } from "react";

const ExplainContext = createContext(null);

export function ExplainProvider({ children }) {
    const [explainMode, setExplainMode] = useState(() => localStorage.getItem("banksphere-explain") !== "off");
    function toggleExplain() {
        setExplainMode((current) => {
            localStorage.setItem("banksphere-explain", current ? "off" : "on");
            return !current;
        });
    }
    const value = useMemo(() => ({ explainMode, toggleExplain }), [explainMode]);
    return <ExplainContext.Provider value={value}>{children}</ExplainContext.Provider>;
}

export function useExplain() {
    const context = useContext(ExplainContext);
    if (!context) throw new Error("useExplain must be used inside ExplainProvider.");
    return context;
}
