import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface ModeloData {
    modelo: string;
    cantidad: number;
    porcentaje: number;
}

export default function DistribucionModelosGPS() {
    const [data, setData] = useState<ModeloData[]>([]);

    useEffect(() => {
        fetch("https://testzone.cvx-r.cl/backend/backend.php?action=distribucion_modelos_gps")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    console.log("Datos cargados desde la API:", data.modelos);
                    setData(data.modelos);
                } else {
                    console.error("Error en la respuesta:", data.error);
                }
            })
            .catch((err) => console.error("Error al cargar datos:", err));
    }, []);

    // ✅ Generar colores únicos dinámicamente
    const generarColoresUnicos = (cantidad: number) => {
        const colores: string[] = [];
        const saturacion = "60%";
        const luminosidad = "50%";

        for (let i = 0; i < cantidad; i++) {
            const hue = Math.floor((360 / cantidad) * i);
            colores.push(`hsl(${hue}, ${saturacion}, ${luminosidad})`);
        }

        return colores;
    };

    const series = data.map((d) => Number(d.cantidad));
    const labels = data.map((d) =>
        d.modelo && d.modelo.trim() !== "" ? d.modelo : "Desconocido"
    );
    const colores = generarColoresUnicos(labels.length);

    console.log("Labels finales:", labels);
    console.log("Series finales:", series);
    console.log("Colores únicos generados:", colores);

    const options: ApexOptions = {
        chart: {
            type: "donut",
            toolbar: { show: false },
            fontFamily: "Outfit, sans-serif",
        },
        labels: labels,
        legend: {
            position: "bottom",
            labels: { colors: "#6B7280" },
        },
        dataLabels: {
            enabled: true,
            formatter: (_, { seriesIndex }) =>
                `${data[seriesIndex]?.porcentaje || 0}%`,
        },
        tooltip: {
            y: {
                formatter: (val: number, { seriesIndex }) =>
                    `${val} equipos (${data[seriesIndex]?.porcentaje || 0}%)`,
            },
        },
        colors: colores,
        plotOptions: {
            pie: {
                donut: {
                    size: "60%",
                },
            },
        },
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Distribución de Modelos GPS
            </h3>
            {series.length > 0 ? (
                <Chart options={options} series={series} type="donut" height={320} />
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    No hay datos disponibles.
                </p>
            )}
        </div>
    );
}
