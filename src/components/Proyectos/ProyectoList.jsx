import React, { useEffect, useState } from "react";
import {
  getProyectos,
  deleteProyecto,
} from "@/services/proyectoService";

export default function ProyectoList({ onEdit }) {
  const [proyectos, setProyectos] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const cargar = async () => {
    const res = await getProyectos(page, pageSize);
    if (res.data.ok) {
      setProyectos(res.data.contenido);
      setTotal(res.data.total);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Eliminar este proyecto?")) {
      const res = await deleteProyecto(id);
      if (res.data.ok) cargar();
    }
  };

  useEffect(() => {
    cargar();
  }, [page]);

  return (
    <div className="space-y-2">
      {proyectos.map((p) => (
        <div
          key={p.id}
          className="flex justify-between items-center border border-gray-300 dark:border-gray-600 p-3 rounded shadow-sm bg-white dark:bg-gray-800"
        >
          <div className="text-gray-900 dark:text-gray-100">
            <strong>{p.nombre}</strong> <span className="text-gray-600 dark:text-gray-400">- Empresa: {p.empresaNombre}</span>
          </div>
          <div className="space-x-2">
            <button onClick={() => onEdit(p)} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded transition">Editar</button>
            <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded transition">Eliminar</button>
          </div>
        </div>
      ))}
      <div className="flex justify-between mt-4">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded disabled:opacity-50 transition">
          Anterior
        </button>
        <span className="text-gray-700 dark:text-gray-300">
          Página {page} de {Math.ceil(total / pageSize)}
        </span>
        <button
          disabled={page * pageSize >= total}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded disabled:opacity-50 transition"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
