import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function TotalGPSBarChart() {
    const [labels, setLabels] = useState<string[]>([]);
    const [values, setValues] = useState<number[]>([]);
    const [totalGPS, setTotalGPS] = useState<number>(0);
    const [verTodos, setVerTodos] = useState(false);
    const [clientesTotales, setClientesTotales] = useState<number>(0);

    useEffect(() => {
        fetch("https://testzone.cvx-r.cl/backend/backend.php?action=contar_gps_instalados")
            .then((res) => res.json())
            .then((data: {
                total_gps_instalados: number;
                totales_por_cliente: { [cliente: string]: number };
            }) => {
                const ordenados = Object.entries(data.totales_por_cliente)
                    .sort((a, b) => b[1] - a[1]);

                const clientes = verTodos ? ordenados : ordenados.slice(0, 10);
                setLabels(clientes.map(([cliente]) => cliente));
                setValues(clientes.map(([, total]) => total));
                setTotalGPS(data.total_gps_instalados);
                setClientesTotales(ordenados.length);
            })
            .catch((err) => console.error("Error al cargar datos:", err));
    }, [verTodos]);

    const options: ApexOptions = {
        chart: {
            type: "bar",
            height: Math.max(labels.length * 40, 320),
            toolbar: { show: false },
            fontFamily: "Outfit, sans-serif",
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4,
                barHeight: "70%",
                distributed: true,
            },
        },
        colors: labels.map((_, i) => {
            if (i === 0) return "#FFD700"; // Oro
            if (i === 1) return "#C0C0C0"; // Plata
            if (i === 2) return "#CD7F32"; // Bronce
            return "#465FFF"; // Azul por defecto
        }),
        dataLabels: {
            enabled: true,
            style: { colors: ["#fff"] },
        },
        xaxis: {
            categories: labels,
            labels: {
                style: { colors: "#6B7280", fontSize: "12px" },
            },
        },
        yaxis: {
            labels: {
                style: { colors: "#6B7280", fontSize: "12px" },
            },
        },
        tooltip: {
            y: {
                formatter: (val) => {
                    const porcentaje = totalGPS ? ((val / totalGPS) * 100).toFixed(1) : "0";
                    return `${val} GPS (${porcentaje}%)`;
                },
            },
        },
    };

    const series = [
        {
            name: "GPS Instalados",
            data: values,
        },
    ];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        GPS Instalados por Cliente
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Mostrando {labels.length} de {clientesTotales} clientes
                    </p>
                </div>
                <button
                    onClick={() => setVerTodos(!verTodos)}
                    className="text-sm font-medium text-blue-600 hover:underline"
                >
                    {verTodos ? "Mostrar solo Top 10" : "Ver todos"}
                </button>
            </div>

            <Chart options={options} series={series} type="bar" height={options.chart?.height as number} />
        </div>
    );
}
