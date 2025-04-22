import { useEffect, useState } from 'react';
import { obtenerClientes } from '../services/clientes';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    obtenerClientes().then((datos) => {
      console.log('Clientes recibidos:', datos);
      setClientes(datos);
    });
  }, []);


  return (
    <div>
      <h2 className="text-2xl font-bold text-green-600 mb-4">?? Clientes registrados</h2>

      {clientes.length === 0 ? (
        <p className="text-gray-600">No se encontraron clientes.</p>
      ) : (
        <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Ciudad</th>
              <th className="py-2 px-4 text-left">BD</th>
              <th className="py-2 px-4 text-left">Puerto</th>
              <th className="py-2 px-4 text-left">Habilitado</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{cliente.id}</td>
                <td className="py-2 px-4">{cliente.nombre_cliente}</td>
                <td className="py-2 px-4">{cliente.ciudad_cliente}</td>
                <td className="py-2 px-4">{cliente.nombre_bd}</td>
                <td className="py-2 px-4">{cliente.puerto_bd}</td>
                <td className="py-2 px-4">
                  {cliente.habilitado === "1" ? "✅" : "❌"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

