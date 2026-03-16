import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const ProtectedRoute = () => {
    const { user, jwtToken, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user || !jwtToken) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
