import { useState } from "react";
//import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { EyeIcon, EyeCloseIcon } from "../../icons";
import { useAuth } from "../../context/AuthContext";


export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);

    if (!success) {
      alert("Usuario o contraseña incorrectos.");
    }
  };

  return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen p-4">
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, ease: "easeOut"}}
            className="w-full max-w-md bg-gray-200 dark:bg-gray-800 backdrop-blur-md backdrop-saturate-150 rounded-3xl p-10 shadow-2xl ring-1 ring-white/20 dark:ring-white/10"
        >
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-3xl font-extrabold tracking-wide text-gray-900 dark:text-white">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Ingrese su usuario y contraseña
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div>
              <Label className="text-gray-700 dark:text-white">
                Usuario <span className="text-red-400">*</span>
              </Label>
              <Input
                  placeholder="Ingrese su usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/20 placeholder-gray-400 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Label className="text-gray-700 dark:text-white">
                Contraseña <span className="text-red-400">*</span>
              </Label>
              <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/20 placeholder-gray-400 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent pr-10"
              />
              <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-6/8 transform -translate-y-1/2 cursor-pointer"
              >
              {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5"/>
              ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5"/>
              )}
            </span>
            </div>

            <div>
              <Button type="submit" className="w-full hover:scale-105 hover:shadow-lg transition-all duration-300"
                      size="sm">
                Iniciar sesión
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
  );
}
