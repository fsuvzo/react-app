import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
    username: string;
    nombre: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    loading: boolean;
    login: (usuario: string, clave: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const isLoggedIn = !!token;

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
                        logout();
                    }
                })
                .catch(logout)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

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

    function logout() {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    }

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}
