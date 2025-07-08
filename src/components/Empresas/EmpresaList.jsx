import React, { useEffect, useState } from "react";
import { getEmpresas } from "@/services/empresaService";

export default function EmpresaList({ onSelect }) {
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    getEmpresas(1, 1000).then((res) => {
      if (res.data.ok) setEmpresas(res.data.contenido);
    });
  }, []);

  return (
    <ul className="divide-y">
      {empresas.map((e) => (
        <li
          key={e.id}
          className="py-2 px-4 hover:bg-blue-100 cursor-pointer"
          onClick={() => onSelect?.(e)}
        >
          {e.nombre} - <span className="text-gray-500">{e.dominio}</span>
        </li>
      ))}
    </ul>
  );
}
