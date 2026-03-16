import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const ProtectedRoute = () => {
  const { user, jwtToken, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // We require both a Firebase user and a verified JWT from our backend
  if (!user || !jwtToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
