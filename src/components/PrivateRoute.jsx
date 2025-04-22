import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
    const usuario = localStorage.getItem("usuario");

    // Si no hay sesión, redirige al login
    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    // Si hay sesión, deja pasar
    return children;
}
