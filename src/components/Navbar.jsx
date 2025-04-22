import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const usuario = localStorage.getItem("usuario");

    const cerrarSesion = () => {
        localStorage.removeItem("usuario");
        navigate("/login");
    };

    return (
        <nav className="bg-white shadow flex justify-between items-center px-6 py-3">
            <div className="flex items-center gap-4">
                <Link
                    to="/home" // ✅ ahora apunta siempre a /home
                    className="text-blue-600 font-bold text-lg hover:underline"
                >
                    CVX-R
                </Link>
                {usuario && (
                    <>
                        <Link to="/clientes" className="text-gray-700 hover:text-blue-600">
                            Clientes
                        </Link>
                    </>
                )}
            </div>

            {usuario && (
                <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            Bienvenido, <strong>{usuario}</strong>
          </span>
                    <button
                        onClick={cerrarSesion}
                        className="text-red-600 hover:underline text-sm"
                    >
                        Cerrar sesión
                    </button>
                </div>
            )}
        </nav>
    );
}
