import { useEffect, useState } from "react";

interface Gps {
    id: number;
    imei: string;
    modelo: string;
    fecha_asignacion: string;
    ciudad: string;
    id_cliente: string;
    chip: string;
    compania: string;
}

export default function Ultimas5GpsIngresados() {
    const [gpsList, setGpsList] = useState<Gps[]>([]);

    useEffect(() => {
        fetch("https://testzone.cvx-r.cl/backend/backend.php?action=ultimos_5_gps_ingresados")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setGpsList(data.ultimos_gps);
                } else {
                    console.error("Error:", data.error);
                }
            })
            .catch((err) => console.error("Error al cargar datos:", err));
    }, []);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Últimos 5 GPS Ingresados
            </h3>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {gpsList.map((gps) => (
                    <li key={gps.id} className="py-2 flex flex-col sm:flex-row sm:justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                IMEI: <span className="font-semibold">{gps.imei}</span>
                                <span className="ml-2 text-gray-500 dark:text-gray-400">({gps.modelo || "Desconocido"})</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Cliente ID: {gps.id_cliente || "N/A"}
                            </p>
                        </div>
                        <div className="mt-1 sm:mt-0 sm:text-right">
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                Asignado: {gps.fecha_asignacion || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{gps.ciudad || "Ubicación desconocida"}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
