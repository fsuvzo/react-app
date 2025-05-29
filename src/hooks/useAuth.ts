import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useAuth() {
    const [user, setUser] = useState<{ username: string; email?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const isLoggedIn = !!token;

    // Cargar usuario al iniciar
    useEffect(() => {
        if (token) {
            fetch("https://testzone.cvx-r.cl/backend/backend.php?action=get_usuario_autenticado", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        setUser(data.usuario);
                    } else {
                        logout(); // Token inválido
                    }
                })
                .catch(() => logout())
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    // Login: enviar credenciales
    async function login(usuario: string, clave: string): Promise<boolean> {
        try {
            const response = await fetch("https://testzone.cvx-r.cl/backend/backend.php?action=login_usuario", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario, clave }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem("token", data.token);
                navigate("/home");
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.error("Error de login:", err);
            return false;
        }
    }

    // Logout: limpiar sesión
    function logout() {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    }

    return {
        user,
        isLoggedIn,
        login,
        logout,
        getUser: () => user,
        loading,
    };
}
