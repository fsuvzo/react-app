export default function Home() {
    const usuario = localStorage.getItem("usuario");

    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Bienvenido a SmartOps CVX-R</h1>
            <p className="text-gray-700 text-lg">
                ¡Hola, <strong>{usuario}</strong>! Puedes navegar por el sistema desde el menú superior.
            </p>
        </div>
    );
}
