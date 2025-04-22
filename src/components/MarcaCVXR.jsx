import LogoClaro  from "../assets/logo-claro.svg?react";
import LogoOscuro from "../assets/logo-oscuro.svg?react";
import cvxrNegro  from "../assets/simple_negro.png";
import cvxrBlanco from "../assets/simple_blanco.png";

export default function MarcaCVXR({ size = "md" }) {
    const w = size === "lg" ? "w-20" : size === "sm" ? "w-12" : "w-16";

    return (
        <div className="flex items-center gap-3 w-fit">
            <div className="flex items-center gap-2">
                <div className={`${w} h-auto`}>
                    <LogoClaro className="w-full h-full dark:hidden"/>
                    <LogoOscuro className="w-full h-full hidden dark:block"/>
                </div>

                <h1 className="text-2xl font-bold leading-snug tracking-tight">
                    <span className="text-blue-600">Smart</span>
                    <span className="text-gray-900 dark:text-white">Ops</span>
                </h1>
            </div>

            {/* Separador */}
            <div className="h-10 border-l border-gray-300 dark:border-slate-600 opacity-50"/>

            <img src={cvxrNegro} alt="CVX‑R" className="w-20 dark:hidden opacity-90"/>
            <img src={cvxrBlanco} alt="CVX‑R" className="w-20 hidden dark:block opacity-90"/>
        </div>
    );
}
