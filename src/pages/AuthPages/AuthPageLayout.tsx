import React, {useState} from "react";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import {motion} from "framer-motion";

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const [videoLoaded, setVideoLoaded] = useState(false);

    return (
        <div className="relative p-6 bg-white dark:bg-gray-900 sm:p-0 overflow-hidden">

            {/* Theme toggler separado */}
            <div className="fixed z-50 bottom-6 right-6 sm:block drop-shadow-lg">
                <ThemeTogglerTwo/>
            </div>

            <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">

                {/* Lado Izquierdo (Formulario) */}
                <div
                    className="flex items-center justify-center w-full lg:w-1/2 transition-opacity duration-700 ease-in-out">
                    {children}
                </div>

                {/* Lado Derecho (video) */}
                    <div
                    className="relative items-center justify-center hidden w-full h-full overflow-hidden lg:flex lg:w-1/2">
                    {/* Video de fondo */}
                    <video
                        autoPlay
                        loop
                        muted
                        className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-1500 ease-in-out ${
                            videoLoaded ? 'opacity-73 blur-sm' : 'opacity-0'
                        }`}
                        style={{transform: "translateX(0%)"}}
                        onCanPlay={() => setVideoLoaded(true)}
                    >
                        <source src="/login-video.mp4" type="video/mp4"/>
                        Tu navegador no soporta videos HTML5.
                    </video>
                    {/*Overlay*/}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`relative z-10 grid grid-cols-2 items-center px-12 py-8 rounded-[1.5rem] bg-gradient-to-r from-black/88 to-black shadow-[0_8px_32px_rgba(0,0,0,0.6)] ring-1 ring-white/10 mt-[-330px] backdrop-brightness-105 `}
                        style={{
                            maxWidth: "840px", // Más ancho para acomodar los logos más grandes
                            width: "92%",
                        }}
                    >

                        {/* SmartOps - Columna izquierda */}
                        <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="flex items-center space-x-6"
                        >
                            <img
                                src="/images/logo/simple-logo-smartops-2.svg"
                                alt="SmartOps Logo"
                                className="w-74 h-auto drop-shadow-lg"
                            />
                        </motion.div>

                        {/* CVX-R - Columna derecha */}
                        <motion.div
                            initial={{ x: 30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex items-end justify-center space-y-3 space-x-5 border-l border-white/10 pl-8"
                        >
    <span className="text-white text-xs tracking-widest uppercase opacity-90">
      Supported by
    </span>
                            <img
                                src="/images/logo/cvx-r_simple.svg"
                                alt="CVX-R Logo"
                                className="w-35 h-auto opacity-85"
                            />
                        </motion.div>

                    </motion.div>


                </div>

            </div>
        </div>
    );
}
