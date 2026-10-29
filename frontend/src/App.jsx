import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import { LoadingState } from "./components/Shared.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const Admin = lazy(() => import("./pages/Admin.jsx"));
const Analytics = lazy(() => import("./pages/Analytics.jsx"));
const BankingAction = lazy(() => import("./pages/BankingAction.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const History = lazy(() => import("./pages/History.jsx"));
const HowItWorks = lazy(() => import("./pages/HowItWorks.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const PerformanceLab = lazy(() => import("./pages/PerformanceLab.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));

function ProtectedRoute({ children, roles }) {
    const { user } = useAuth();
    const location = useLocation();
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
    return children;
}

function App() {
    const { user } = useAuth();
    return (
        <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#f5f7fb] dark:bg-[#0c1424]"><LoadingState label="Opening BankSphere" /></div>}>
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="banking" element={<ProtectedRoute roles={["ADMIN", "TELLER"]}><BankingAction /></ProtectedRoute>} />
                <Route path="history" element={<History />} />
                <Route path="profile" element={<Profile />} />
                <Route path="analytics" element={<ProtectedRoute roles={["ADMIN", "TELLER"]}><Analytics /></ProtectedRoute>} />
                <Route path="admin" element={<ProtectedRoute roles={["ADMIN"]}><Admin /></ProtectedRoute>} />
                <Route path="performance" element={<ProtectedRoute roles={["ADMIN"]}><PerformanceLab /></ProtectedRoute>} />
                <Route path="how-it-works" element={<HowItWorks />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
        </Routes>
        </Suspense>
    );
}

export default App;
