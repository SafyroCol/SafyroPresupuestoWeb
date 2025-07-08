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
          className="flex justify-between items-center border p-3 rounded shadow-sm"
        >
          <div>
            <strong>{p.nombre}</strong> - Empresa: {p.empresaNombre}
          </div>
          <div className="space-x-2">
            <button onClick={() => onEdit(p)}>Editar</button>
            <button onClick={() => handleDelete(p.id)}>Eliminar</button>
          </div>
        </div>
      ))}
      <div className="flex justify-between mt-4">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Anterior
        </button>
        <span>
          Página {page} de {Math.ceil(total / pageSize)}
        </span>
        <button
          disabled={page * pageSize >= total}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
