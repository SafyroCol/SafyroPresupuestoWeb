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
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Registro de Costos Reales - Materiales</h2>
      <div className="overflow-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2">Material</th>
              <th className="px-4 py-2">Cantidad</th>
              <th className="px-4 py-2">Costo Presupuestado</th>
              <th className="px-4 py-2">Costo Real</th>
              <th className="px-4 py-2">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {materiales.map((m, i) => (
              <tr key={m.id} className="border-t">
                <td className="px-4 py-2">{m.nombre}</td>
                <td className="px-4 py-2">{m.cantidad}</td>
                <td className="px-4 py-2">{m.costo_unitario}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={m.costo_real}
                    onChange={(e) => handleChange(i, e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="px-4 py-2 font-semibold">
                  {(m.costo_real - m.costo_unitario * m.cantidad).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={guardarCostosReales}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Guardar Costos Reales
      </button>
    </div>
  );
};

export default MaterialesRealesView;
