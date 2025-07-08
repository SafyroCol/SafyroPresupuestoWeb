import React, { useEffect, useState } from "react";
import { getPresupuestos, deletePresupuesto } from "@/services/presupuestoService";
import { Link } from "react-router-dom";

export default function PresupuestoList() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const { data } = await getPresupuestos();
      setPresupuestos(data);
    } catch (err) {
      setError("Error al cargar los presupuestos.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de eliminar este presupuesto?")) {
      await deletePresupuesto(id);
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Presupuestos</h1>
        <Link to="/presupuestos/nuevo" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Crear Presupuesto
        </Link>
      </div>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <table className="min-w-full border text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Empresa</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {presupuestos.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2">{p.id}</td>
                <td className="px-4 py-2">{p.nombre}</td>
                <td className="px-4 py-2">{p.empresaNombre}</td>
                <td className="px-4 py-2 space-x-2">
                  <Link to={`/presupuestos/${p.id}`} className="text-blue-600 hover:underline">Editar</Link>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}