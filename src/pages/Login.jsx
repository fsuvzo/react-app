import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import MarcaCVXR from "../components/MarcaCVXR";
import videoFondo from "../assets/video-login.mp4";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]   = useState("");
  const navigate            = useNavigate();
  const [loading, setLoading] = useState(false);


  /* ---------- LÓGICA DE LOGIN ---------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return; // evita doble click
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
          "https://testzone.cvx-r.cl/backend/backend.php?action=login_usuario",
          { usuario, clave },
          { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        localStorage.setItem("usuario", res.data.usuario);
        navigate("/home");
      } else {
        setError(res.data.message || "Credenciales incorrectas");
      }
    } catch {
      setError("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Video de fondo */}
        <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover blur-sm scale-105"
        >
          <source src={videoFondo} type="video/mp4"/>
        </video>

        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

        {/* Tarjeta de login */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-8 w-full max-w-sm animate-fade-in">

            {/* Marca */}
            <div className="flex justify-center mb-8 animate-fade-in">
              <MarcaCVXR />
            </div>

            {/* Separador*/}
            <div className="flex items-center my-6">
              <hr className="flex-grow border-t border-gray-300"/>

              <hr className="flex-grow border-t border-gray-300"/>
            </div>

            {/* Encabezado */}
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
              ¡Bienvenido!
            </h2>

            {/* Formulario */}
            {/* ─────────────────── FORMULARIO con etiquetas visibles ─────────────────── */}
            <form onSubmit={handleLogin} className="space-y-5 text-left">

              {/* ───── Usuario ───── */}
              <div>
                <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">
                  Usuario
                </label>

                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                      id="usuario"
                      type="text"
                      autoComplete="username"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                  />
                </div>
              </div>

              {/* ───── Contraseña ───── */}
              <div>
                <label htmlFor="clave" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>

                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                      id="clave"
                      type={showPass ? "text" : "password"}
                      autoComplete="current-password"
                      value={clave}
                      onChange={(e) => setClave(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                  />
                  <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* ───── Mensaje de error ───── */}
              {error && (
                  <p role="alert" className="text-red-600 text-sm text-center">{error}</p>
              )}

              {/* ───── Botón ───── */}
              <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center gap-2
    ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"}
    text-white font-semibold py-3 rounded-md transition shadow-md`}
              >
                {/* Spinner visible solo cuando loading */}
                {loading && (
                    <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                      <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                      />
                      <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                )}

                {loading ? "Verificando…" : "Iniciar sesión"}
              </button>
            </form>


            {/* Separador*/}
            <div className="flex items-center my-6">
              <hr className="flex-grow border-t border-gray-300"/>

              <hr className="flex-grow border-t border-gray-300"/>
            </div>

            {/*<div className="flex justify-center">*/}
            {/*  <button className="bg-slate-200 hover:bg-slate-300 p-2 rounded-full transition">*/}
            {/*    🌙*/}
            {/*  </button>*/}
            {/*</div>*/}

            <p className="text-xs text-center text-gray-400 mt-6">
              Plataforma de Gestión CVX-R © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
  );
}
