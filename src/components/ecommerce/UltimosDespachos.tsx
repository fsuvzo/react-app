import { useState, useEffect, useRef, useMemo } from "react";
import { debounce } from "lodash";

/** ------------------------------------------------------------------
 *  Tipos de datos
 * ------------------------------------------------------------------*/
interface Despacho {
    id: number;
    id_guia: number;
    fecha_salida: string;
    hora_salida: string;
    turno: string;
    estado_turno: string;
    nombre_conductor: string;
    nro_interno: string;
    patente: string;
    nro_vuelta: number;
    destino: string;
    nombre_servicio: string | null;
    sentido: "Ida" | "Retorno";
    fecha_descarga: string;
    hora_descarga: string;
    fecha_hora_asignacion: string;
    nombre_inspector: string;
}

interface Cliente {
    codigo: string;
    nombre: string;
}

interface ApiResponse<T> {
    success: boolean;
    items: T[];
    first_key?: string | null;
    last_key?: string | null;
    has_more?: boolean;
}

/** ------------------------------------------------------------------
 *  Constantes helper
 * ------------------------------------------------------------------*/
const API_BASE_URL = "https://testzone.cvx-r.cl/backend/backend.php";
const PAGE_SIZE = 10;
const DEBOUNCE_MS = 400;

const formatDate = (fechaISO: string) => {
    if (fechaISO === "1996-01-01") return "-";
    const [year, month, day] = fechaISO.split("-");
    return `${day}-${month}-${year}`;
};

const formatTime = (t: string) => t === "00:00:00" ? "-" : t.slice(0, 5);

const formatDateTime = (fecha: string, hora: string) => {
    if (fecha === "1996-01-01" || hora === "00:00:00") return "-";
    return `${formatDate(fecha)} ${formatTime(hora)}`;
};

/** ------------------------------------------------------------------
 *  Componente principal
 * ------------------------------------------------------------------*/
export default function UltimosDespachos({ className = "" }: { className?: string }) {
    /* ---------------- estado general ---------------- */
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [clienteSel, setClienteSel] = useState<string>("");

    const [despachos, setDespachos] = useState<Despacho[]>([]);
    const hasMoreRef = useRef(true);
    const lastKeyRef = useRef<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filtros, setFiltros] = useState({
        id: "",
        id_guia: "",
        fecha_salida: "",
        nombre_conductor: "",
        nro_interno: "",
        patente: "",
        destino: "",
        sentido: "",
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    /* ---------------- valores derivados --------------- */
    const filtrosActivos = useMemo(() => Object.values(filtros).some(v => v.trim() !== ""), [filtros]);

    /* ---------------- obtención de clientes ----------- */
    useEffect(() => {
        (async () => {
            try {
                console.log("[API] list_clientes");
                const res = await fetch(`${API_BASE_URL}?action=list_clientes`);
                const data: ApiResponse<Cliente> = await res.json();
                if (data.success) setClientes(data.items);
                else setError("Error al cargar clientes");
            } catch (err) {
                console.error(err);
                setError("Error de conexión");
            }
        })();
    }, []);

    /* ---------------- fetch despachos debounced ------- */
    const fetchDespachos = useMemo(
        () =>
            debounce(async (reset: boolean) => {
                if (!clienteSel) return;
                if (isLoading) return;

                setIsLoading(true);
                setError(null);

                try {
                    const url = new URL(API_BASE_URL);
                    url.searchParams.append("action", "ultimos_despachos_paginados");
                    url.searchParams.append("cliente", clienteSel);
                    url.searchParams.append("limit", PAGE_SIZE.toString());

                    Object.entries(filtros).forEach(([k, v]) => {
                        if (v.trim()) url.searchParams.append(k, v.trim());
                    });

                    if (!reset && lastKeyRef.current) {
                        url.searchParams.append("cursor", lastKeyRef.current);
                        url.searchParams.append("direction", "next");
                    }

                    console.log("[API] ultimos_despachos_paginados →", url.toString());
                    const res = await fetch(url.toString());
                    const data: ApiResponse<Despacho> = await res.json();

                    if (data.success) {
                        setDespachos(prev => reset ? data.items : [...prev, ...data.items]);
                        lastKeyRef.current = data.last_key ?? null;
                        hasMoreRef.current = data.has_more ?? false;
                    } else {
                        setError("Error al cargar despachos");
                    }
                } catch (err) {
                    console.error("[API] Error:", err);
                    setError("Error de conexión");
                } finally {
                    setIsLoading(false);
                }
            }, DEBOUNCE_MS),
        [clienteSel, filtros]
    );

    /* ---------------- recargar cuando cambian deps ---- */
    useEffect(() => {
        setDespachos([]);
        lastKeyRef.current = null;
        hasMoreRef.current = true;
        if (clienteSel) fetchDespachos(true);
    }, [clienteSel, filtros, fetchDespachos]);

    /* ---------------- scroll infinito ---------------- */
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && hasMoreRef.current && !isLoading) {
                fetchDespachos(false);
            }
        }, { root: containerRef.current, threshold: 0.1 });

        io.observe(sentinel);
        return () => io.disconnect();
    }, [fetchDespachos, isLoading]);

    /* ---------------- handlers ----------------------- */
    const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => setClienteSel(e.target.value);
    const handleFiltroChange = (k: keyof typeof filtros, v: string) => {
        setFiltros(p => ({ ...p, [k]: v }));
    };

    /* ---------------- render ------------------------- */
    return (
        <div className={`bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-sm overflow-hidden ${className}`}>
            {/* header */}
            <div className="px-6 py-4 border-b dark:border-gray-700 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Monitor de Despachos</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {clienteSel ? `Cliente: ${clientes.find(c => c.codigo === clienteSel)?.nombre || clienteSel}` : "Seleccione un cliente"}
                    </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {despachos.length} {despachos.length === 1 ? "registro" : "registros"}{filtrosActivos && " (filtrados)"}
                </span>
            </div>

            {/* selector y filtros */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 space-y-3">
                <select
                    value={clienteSel}
                    onChange={handleClienteChange}
                    className="w-full px-4 py-2 text-sm border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(c => <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.nombre}</option>)}
                </select>

                {clienteSel && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        <input type="number" value={filtros.id} onChange={e => handleFiltroChange('id', e.target.value)} placeholder="id" className="px-3 py-1.5 text-xs border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                        <input type="number" value={filtros.id_guia} onChange={e => handleFiltroChange('id_guia', e.target.value)} placeholder="id_guia" className="px-3 py-1.5 text-xs border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                        <input type="date"   value={filtros.fecha_salida} onChange={e => handleFiltroChange('fecha_salida', e.target.value)} className="px-3 py-1.5 text-xs border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                        <input type="text"   value={filtros.nombre_conductor} onChange={e => handleFiltroChange('nombre_conductor', e.target.value)} placeholder="conductor" className="px-3 py-1.5 text-xs border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                        <input type="number" value={filtros.nro_interno} onChange={e => handleFiltroChange('nro_interno', e.target.value)} placeholder="nro_interno" className="px-3 py-1.5 text-xs border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                        <input type="text"   value={filtros.patente} onChange={e => handleFiltroChange('patente', e.target.value)} placeholder="patente" className="px-3 py-1.5 text-xs border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                        <input type="text"   value={filtros.destino} onChange={e => handleFiltroChange('destino', e.target.value)} placeholder="destino" className="px-3 py-1.5 text-xs border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                        <select value={filtros.sentido} onChange={e => handleFiltroChange('sentido', e.target.value)} className="px-3 py-1.5 text-xs border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                            <option value="">Todos</option>
                            <option value="Ida">Ida</option>
                            <option value="Retorno">Retorno</option>
                        </select>
                    </div>
                )}
            </div>

            {/* lista de despachos */}
            <div ref={containerRef} className="h-[32rem] overflow-y-auto px-4 divide-y dark:divide-gray-700 relative">
                {error ? (
                    <div className="h-full flex items-center justify-center text-red-500 dark:text-red-400">{error}</div>
                ) : despachos.length === 0 && !isLoading ? (
                    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                        {clienteSel ? "No se encontraron despachos" : "Seleccione un cliente"}
                    </div>
                ) : (
                    <>
                        {despachos.map(d => (
                            <div
                                key={`${d.id}-${d.fecha_salida}`}
                                className="py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                            >
                                {/* Encabezado superior */}
                                <div className="flex justify-between items-center mb-1">
                                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                                        #{d.id}
                                        {d.id_guia && (
                                            <span className="ml-2 text-gray-800 dark:text-gray-300">
            Guía: <span className="font-bold">{d.id_guia}</span>
          </span>
                                        )}
                                    </div>
                                    <div className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                                        Descarga: {formatDateTime(d.fecha_descarga, d.hora_descarga)}
                                    </div>
                                </div>

                                {/* Línea de turno */}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-1">
                                    <span className="text-blue-600 dark:text-blue-300">Turno: {d.turno}</span>
                                    <span className="flex items-center gap-1">
                                    Estado:
                                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                                        d.estado_turno === 'A'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                                    }`}>
                                      {d.estado_turno}
                                    </span>
                                  </span>
                                    <span>Vuelta: {d.nro_vuelta}</span>
                                </div>

                                {/* Datos principales en bloques verticales */}
                                <div className="space-y-1 pl-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-300 font-semibold">Fecha/Hora Salida:</span>
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full font-semibold">
          {formatDateTime(d.fecha_salida, d.hora_salida)}
        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-300 font-semibold">Vehículo:</span>
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full font-semibold">
          {d.nro_interno} - {d.patente}
        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-300 font-semibold">Conductor:</span>
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full font-semibold">
          {d.nombre_conductor || '-'}
        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-300 font-semibold">Destino:</span>
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full font-semibold">
          {d.destino}
        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-300 font-semibold">Servicio:</span>
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full font-semibold">
          {d.nombre_servicio || '-'}
        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-300 font-semibold">Sentido:</span>
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full font-semibold">
          {d.sentido}
        </span>
                                    </div>
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="text-gray-600 dark:text-gray-300 font-semibold">Inspector:</span>
                                        <span className="font-semibold">{d.nombre_inspector || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-300 font-semibold">Fecha/Hora Asignación:</span>
                                        {new Date(d.fecha_hora_asignacion).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* sentinel */}
                        {hasMoreRef.current && <div ref={sentinelRef} className="h-4"/>}

                        {isLoading && (
                            <div className="py-4 flex justify-center">
                                <div
                                    className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}