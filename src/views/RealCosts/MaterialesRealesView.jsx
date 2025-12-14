import React, { useState, useEffect } from "react";
import axios from "@/utils/api";

const MaterialesRealesView = ({ presupuestoId }) => {
  const [materiales, setMateriales] = useState([]);

  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const res = await axios.get(`/api/materiales-presupuesto/${presupuestoId}`);
        const materialesConCostos = res.data.map((mat) => ({
          ...mat,
          costo_real: 0,
        }));
        setMateriales(materialesConCostos);
      } catch (error) {
        console.error("Error al cargar materiales:", error);
      }
    };

    fetchMateriales();
  }, [presupuestoId]);

  const handleChange = (index, value) => {
    const nuevosMateriales = [...materiales];
    nuevosMateriales[index].costo_real = parseFloat(value) || 0;
    setMateriales(nuevosMateriales);
  };

  const guardarCostosReales = async () => {
    try {
      await axios.post("/api/materiales-reales", {
        presupuestoId,
        materiales: materiales.map((m) => ({
          materialPresupuestoId: m.id,
          costoReal: m.costo_real,
        })),
      });
      alert("Costos reales guardados correctamente.");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar los costos reales.");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Registro de Costos Reales - Materiales</h2>
      <div className="overflow-auto">
        <table className="min-w-full text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left">
              <th className="px-4 py-2 text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600">Material</th>
              <th className="px-4 py-2 text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600">Cantidad</th>
              <th className="px-4 py-2 text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600">Costo Presupuestado</th>
              <th className="px-4 py-2 text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600">Costo Real</th>
              <th className="px-4 py-2 text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {materiales.map((m, i) => (
              <tr key={m.id} className="border-t border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{m.nombre}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{m.cantidad}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{m.costo_unitario}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={m.costo_real}
                    onChange={(e) => handleChange(i, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </td>
                <td className="px-4 py-2 font-semibold text-gray-900 dark:text-gray-100">
                  {(m.costo_real - m.costo_unitario * m.cantidad).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={guardarCostosReales}
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded transition shadow-sm"
      >
        Guardar Costos Reales
      </button>
    </div>
  );
};

export default MaterialesRealesView;
