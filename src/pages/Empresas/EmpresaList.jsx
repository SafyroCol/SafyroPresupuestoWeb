import React, { useEffect, useState } from "react";
import { getEmpresas, deleteEmpresa } from "@/services/empresaService";
import { Link } from "react-router-dom";

export default function EmpresaList() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEmpresas = async () => {
    try {
      const { data } = await getEmpresas();
      setEmpresas(data);
    } catch (err) {
      setError("Error al cargar las empresas.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de eliminar esta empresa?")) {
      await deleteEmpresa(id);
      fetchEmpresas();
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <Link to="/empresas/nueva" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Crear Empresa
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
              <th className="px-4 py-2">Dominio</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="px-4 py-2">{e.id}</td>
                <td className="px-4 py-2">{e.nombre}</td>
                <td className="px-4 py-2">{e.dominio || "—"}</td>
                <td className="px-4 py-2 space-x-2">
                  <Link to={`/empresas/${e.id}`} className="text-blue-600 hover:underline">Editar</Link>
                  <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
