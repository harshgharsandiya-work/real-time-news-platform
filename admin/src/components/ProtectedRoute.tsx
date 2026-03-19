import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import "../style/loader.css";

export const ProtectedRoute = () => {
    const [showLoader, setShowLoader] = useState(false);
    const { user, jwtToken, loading } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLoader(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [loading]);

    if (loading || showLoader) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <div className="loader"></div>
            </div>
        );
    }
    // We require both a Firebase user and a verified JWT from our backend
    if (!user || !jwtToken) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
