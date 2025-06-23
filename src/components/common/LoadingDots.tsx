/**
 * Tres puntos que pulsan en secuencia: …  …  …
 * Útil como indicador ligero de “cargando”.
 */
export default function LoadingDots() {
    return (
        <span className="inline-flex gap-x-0.5 leading-none">
      {/* delay 0 ms */}
            <span className="animate-[pulse_1s_ease-in-out_infinite]">.</span>
            {/* delay 200 ms */}
            <span className="animate-[pulse_1s_ease-in-out_200ms_infinite]">.</span>
            {/* delay 400 ms */}
            <span className="animate-[pulse_1s_ease-in-out_400ms_infinite]">.</span>
    </span>
    );
}
