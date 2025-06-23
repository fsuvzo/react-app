import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    Check,
    X,
    WifiOff,
    Loader2,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";

/* -------------------------------------------------------------------------- */
/*  Tipos                                                                     */
/* -------------------------------------------------------------------------- */
type TerminalStatus = "OK" | "Error grave" | "Sin Conexión";

interface Terminal {
    ip_vpn: string;
    estado_replica_remota: string;           // normalizado después
    fecha_hora_actualizacion_replica: string | null;
}

interface Cliente {
    pk: string;
    codigo: string;
    nombre: string;
    ciudad: string;
    puerto_escucha_receptor: string | null;
    terminales: Terminal[];
}

interface DisplayData {
    tipo: "terminal" | "sin-terminal";
    ciudad: string;
    nombre: string;
    ip_vpn?: string;
    estado?: TerminalStatus;
    ultima?: string | null;
    tieneProblemas: boolean;
    clienteCodigo: string;
}

/* -------------------------------------------------------------------------- */
/*  Config axios                                                              */
/* -------------------------------------------------------------------------- */
const apiClient = axios.create({
    baseURL: "https://testzone.cvx-r.cl/backend",
    timeout: 10000,
});

/* -------------------------------------------------------------------------- */
/*  Fetch                                                                     */
/* -------------------------------------------------------------------------- */
const fetchMonitorClientes = async (): Promise<Cliente[]> => {
    const { data } = await apiClient.get<Record<string, Cliente[]>>(
        "/backend.php?action=monitor_clientes"
    );
    return Object.values(data).flat();
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */
const normalizaEstado = (raw: string): TerminalStatus => {
    if (raw === "Sin Conexi&oacute;n" || raw === "Sin Conexion")
        return "Sin Conexión";
    return raw as TerminalStatus;
};

/* -------------------------------------------------------------------------- */
/*  Icono de estado                                                           */
/* -------------------------------------------------------------------------- */
const EstadoIcon = ({ estado }: { estado: TerminalStatus }) => {
    const iconMap = {
        OK: <Check className="w-4 h-4 text-green-500" />,
        "Error grave": <X className="w-4 h-4 text-red-500" />,
        "Sin Conexión": <WifiOff className="w-4 h-4 text-yellow-500" />,
    };
    return iconMap[estado] ?? (
        <span className="text-xs italic text-gray-500">?</span>
    );
};

/* -------------------------------------------------------------------------- */
/*  Indicadores de carga / error                                              */
/* -------------------------------------------------------------------------- */
const LoadingIndicator = () => (
    <div className="flex flex-col items-center justify-center gap-2 p-4 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span>Cargando datos de clientes…</span>
    </div>
);

const ErrorDisplay = ({ message }: { message?: string }) => (
    <div className="p-4 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded">
        {message || "Error al cargar los datos"}
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Componente principal                                                      */
/* -------------------------------------------------------------------------- */
export default function MonitorClientes() {
    const {
        data: clientes,
        isLoading,
        isError,
        error,
        isRefetching,
    } = useQuery<Cliente[]>({
        queryKey: ["monitor_clientes"],
        queryFn: fetchMonitorClientes,
        refetchInterval: 60_000,
        staleTime: 30_000,
    });

    const [showClientesOk, setShowClientesOk] = useState(false);
    const [showRefreshIndicator, setShowRefreshIndicator] = useState(false);

    /* ---- Indicador de refresco async ------------------------------------- */
    useEffect(() => {
        if (isRefetching) {
            setShowRefreshIndicator(true);
            const t = setTimeout(() => setShowRefreshIndicator(false), 2000);
            return () => clearTimeout(t);
        }
    }, [isRefetching]);

    /* ---- Procesamiento de datos ------------------------------------------ */
    const { datos, totalConProblemas} =
        useMemo(() => {
            const datos: DisplayData[] = [];
            let tc = 0;
            let tp = 0;
            let st = 0;

            clientes?.forEach((c) => {
                if (c.terminales.length === 0) {
                    datos.push({
                        tipo: "sin-terminal",
                        ciudad: c.ciudad,
                        nombre: c.nombre,
                        clienteCodigo: c.codigo,
                        tieneProblemas: false,
                    });
                    st++;
                } else {
                    c.terminales.forEach((t) => {
                        const estado = normalizaEstado(t.estado_replica_remota);
                        const tieneProblemas = estado !== "OK";
                        if (tieneProblemas) tp++;

                        datos.push({
                            tipo: "terminal",
                            ciudad: c.ciudad,
                            nombre: c.nombre,
                            clienteCodigo: c.codigo,
                            ip_vpn: t.ip_vpn,
                            estado,
                            ultima: t.fecha_hora_actualizacion_replica,
                            tieneProblemas,
                        });
                        tc++;
                    });
                }
            });

            datos.sort((a, b) =>
                a.tieneProblemas === b.tieneProblemas ? 0 : a.tieneProblemas ? -1 : 1
            );

            return {
                datos,
                totalTerminales: tc,
                totalConProblemas: tp,
                totalSinTerminales: st,
            };
        }, [clientes]);

    if (isLoading) return <LoadingIndicator />;
    if (isError)
        return (
            <ErrorDisplay message={error instanceof Error ? error.message : undefined} />
        );
    if (!clientes?.length)
        return <div className="p-4 text-center text-gray-500">No se encontraron datos</div>;

    const datosConProblemas = datos.filter((d) => d.tieneProblemas);
    const datosOk = datos.filter((d) => !d.tieneProblemas);

    /* ---------------------------------------------------------------------- */
    return (
        <div className="p-4 mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Monitor de Clientes
                </h1>

                {showRefreshIndicator}
            </div>

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                {" "}
                <span className="text-red-500 dark:text-red-400">Terminales con problemas:</span>{" "}
                {totalConProblemas}{" "}
            </div>

            <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60">
                {/* overlay mientras refetching */}
                {isRefetching && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                )}

                <table className="min-w-full text-xs divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-100 dark:bg-slate-800/80">
                    <tr>
                        <th className="px-4 py-2 text-left w-1/6">Ciudad</th>
                        <th className="px-4 py-2 text-left w-2/6">Cliente</th>
                        <th className="px-4 py-2 text-left w-1/5">IP&nbsp;VPN</th>
                        <th className="px-4 py-2 text-left w-1/6">Estado</th>
                        <th className="px-4 py-2 text-left w-1/5">Última&nbsp;Act.</th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {/* ---- Problemas ------------------------------------------------ */}
                    {datosConProblemas.map((d, idx) => (
                        <tr
                            key={`${d.tipo}-${d.clienteCodigo}-${d.ip_vpn || "x"}`}
                            className={`${
                                idx % 2
                                    ? "bg-gray-50 dark:bg-slate-800"
                                    : "bg-white dark:bg-slate-700"
                            } border-l-4 ${d.tieneProblemas ? "border-red-500" : "border-transparent"}`}
                        >
                            <td className="px-4 py-2">{d.ciudad}</td>
                            <td className="px-4 py-2 font-medium">
                                {d.clienteCodigo} - {d.nombre}
                            </td>
                            <td className="px-4 py-2 font-mono">{d.ip_vpn ?? "-"}</td>
                            <td className="px-4 py-2">
                                {d.estado && <EstadoIcon estado={d.estado} />}
                            </td>
                            <td className="px-4 py-2">
                                {d.ultima
                                    ? new Date(d.ultima).toLocaleString("es-CL")
                                    : "N/A"}
                            </td>
                        </tr>
                    ))}

                    {/* ---- OK / sin terminales (colapsable) ------------------------ */}
                    {datosOk.length > 0 && (
                        <>
                            <tr
                                className="bg-gray-100 dark:bg-slate-800/70 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-slate-700/80"
                                onClick={() => setShowClientesOk((v) => !v)}
                            >
                                <td colSpan={5} className="px-4 py-2 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {showClientesOk ? (
                                            <ChevronUp className="w-4 h-4" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4" />
                                        )}
                                        <span>
                        Mostrar todos los clientes
                      </span>
                                    </div>
                                </td>
                            </tr>

                            {showClientesOk &&
                                datosOk.map((d, idx) => (
                                    <tr
                                        key={`ok-${d.clienteCodigo}-${d.ip_vpn || "x"}`}
                                        className={`${
                                            idx % 2
                                                ? "bg-gray-50 dark:bg-slate-800"
                                                : "bg-white dark:bg-slate-700"
                                        }`}
                                    >
                                        <td className="px-4 py-2">{d.ciudad}</td>
                                        <td className="px-4 py-2 font-medium">
                                            {d.clienteCodigo} - {d.nombre}
                                            {d.tipo === "sin-terminal" && (
                                                <span className="ml-1 text-xs text-gray-500">
                            (sin terminales)
                          </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 font-mono">
                                            {d.ip_vpn ?? "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {d.estado ? <EstadoIcon estado={d.estado} /> : "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {d.ultima
                                                ? new Date(d.ultima).toLocaleString("es-CL")
                                                : "N/A"}
                                        </td>
                                    </tr>
                                ))}
                        </>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
