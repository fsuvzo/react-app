import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isLoggedIn, loading } = useAuth();

    if (loading) return null;

    return isLoggedIn ? <>{children}</> : <Navigate to="/" replace />;
}
