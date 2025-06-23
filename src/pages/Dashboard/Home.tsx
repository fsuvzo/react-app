import PageMeta from "../../components/common/PageMeta";
import UltimosGpsPaginados from "../../components/ecommerce/UltimosGpsPaginados";
import ContadorClientes from "../../components/ecommerce/ContadorClientes";
import ContadorVehiculos from "../../components/ecommerce/ContadorVehiculos";
import ContadorTurnos from "../../components/ecommerce/ContadorTurnos";
import ContadorExpediciones from "../../components/ecommerce/ContadorExpediciones";
import UltimosDespachos from "../../components/ecommerce/UltimosDespachos";
import MonitorClientes from "../../components/ecommerce/MonitorClientes";

export default function Home() {
    return (
        <>
            <PageMeta title="SmartOps Dashboard" description="CVX-R" />

            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* 1ª fila: Resumen */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ContadorClientes />
                    <ContadorVehiculos />
                    <ContadorTurnos />
                    <ContadorExpediciones />
                </section>

                {/* 2ª fila: Monitor de Clientes */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-12">
                        <MonitorClientes />
                    </div>
                </section>


                {/* 3ª fila: Widgets GPS + Despachos */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-6">
                        <UltimosGpsPaginados className="h-[600px]" />
                    </div>
                    <div className="lg:col-span-6">
                        <UltimosDespachos className="h-[600px]" />
                    </div>
                </section>
            </div>
        </>
    );
}
