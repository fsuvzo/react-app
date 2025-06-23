import { useState, useEffect, useRef, useCallback } from "react";
import { debounce } from "lodash";

interface Gps {
    id: number;
    imei: string;
    modelo: string;
    fecha_asignacion: string;
    ciudad: string;
    nombre_cliente: string;
    compania: string;
    icc: string;
    nro_telefono: string;
}

interface Props {
    /** Clases extra para el contenedor principal */
    className?: string;
}

export default function UltimosGpsPaginados({ className = "" }: Props) {
    const [gpsList, setGpsList] = useState<Gps[]>([]);
    const [lastId, setLastId] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const sentinelRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    /** Carga paginada + búsqueda (con debounce) */
    const fetchData = useCallback(
        debounce(async (reset: boolean = false) => {
            if (isLoading) return;
            setIsLoading(true);

            try {
                const url = new URL(
                    "https://testzone.cvx-r.cl/backend/backend.php?action=ultimos_gps_paginados"
                );

                if (reset) {
                    setLastId(null);
                    setHasMore(true);
                }

                if (!reset && lastId) url.searchParams.append("last_id", String(lastId));
                if (searchQuery) url.searchParams.append("q", searchQuery);

                const response = await fetch(url.toString());
                const data = await response.json();

                if (data.success) {
                    setGpsList((prev) => (reset ? data.items : [...prev, ...data.items]));
                    setLastId(data.last_id);
                    setHasMore(data.has_more);
                }
            } catch (error) {
                console.error("Error fetching GPS data:", error);
            } finally {
                setIsLoading(false);
                setIsSearching(false);
            }
        }, 500),
        [lastId, searchQuery, isLoading]
    );

    /** Maneja cambios en el buscador */
    useEffect(() => {
        fetchData(true);
    }, [searchQuery]);

    /** Scroll infinito */
    useEffect(() => {
        if (isSearching || !hasMore || !sentinelRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) fetchData();
            },
            { root: containerRef.current, threshold: 0.1 }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, isSearching, fetchData]);

    return (
        <div
            className={`
      bg-white dark:bg-gray-800 rounded-xl shadow-sm border
      border-gray-200 dark:border-gray-700 overflow-hidden w-full
      min-w-[320px] flex flex-col                /* <— permite flex para que la lista crezca */
      ${className}
    `}
        >
            {/* Encabezado */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            Monitor de Equipos GPS
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isSearching
                                ? `Buscando: "${searchQuery}"`
                                : "Últimos equipos registrados en la plataforma"}
                        </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {gpsList.length} {gpsList.length === 1 ? "equipo" : "equipos"}
        </span>
                </div>
            </div>

            {/* Buscador */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por IMEI, ICC o teléfono..."
                    className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
            </div>

            {/* Lista */}
            <div
                ref={containerRef}
                className="flex-1 min-h-0 overflow-y-auto px-4 divide-y divide-gray-200 dark:divide-gray-700"
            >
                {gpsList.length === 0 && !isLoading ? (
                    <div className="py-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            {isSearching
                                ? "No se encontraron equipos con ese criterio"
                                : "No hay equipos registrados"}
                        </p>
                    </div>
                ) : (
                    <ul>
                        {gpsList.map((gps) => (
                            <li
                                key={`${gps.id}-${searchQuery}`}
                                className="py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                                    {/* Columna izquierda */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-gray-900 dark:text-white break-all">
                      {gps.imei}
                    </span>
                                            {gps.modelo && (
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                        {gps.modelo}
                      </span>
                                            )}
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {gps.icc ? (
                                                <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                        SIM: {gps.icc}
                      </span>
                                            ) : (
                                                <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                        SIN SIM
                      </span>
                                            )}

                                            {gps.compania && (
                                                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        {gps.compania}
                      </span>
                                            )}

                                            {gps.nro_telefono && (
                                                <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                        Tel: {gps.nro_telefono}
                      </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Columna derecha */}
                                    <div className="sm:w-40">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            <span className="font-medium">Asignado:</span>{" "}
                                            {gps.fecha_asignacion || "N/A"}
                                        </p>
                                        <p className="text-xs mt-1 text-gray-600 dark:text-gray-300 truncate">
                                            {gps.nombre_cliente || "Sin cliente"}
                                        </p>
                                        {gps.ciudad && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                                {gps.ciudad}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Sentinel */}
                {!isSearching && hasMore && <div ref={sentinelRef} className="h-4" />}

                {/* Loader */}
                {isLoading && (
                    <div className="py-4 text-center">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {isSearching ? "Buscando..." : "Cargando más equipos..."}
                        </p>
                    </div>
                )}

                {/* Fin de lista */}
                {!hasMore && gpsList.length > 0 && !isSearching && (
                    <div className="py-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Has llegado al final de la lista
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
