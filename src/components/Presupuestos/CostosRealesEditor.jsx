import { useState } from "react";

const rubrosReales = [
  { key: "costoRealMateriales", label: "Materiales" },
  { key: "costoRealManoObra", label: "Mano de Obra" },
  { key: "costoRealEquipos", label: "Equipos" },
  { key: "costoRealServiciosTerceros", label: "Servicios de Terceros" },
  { key: "costoRealCostosIndirectos", label: "Costos Indirectos" },
];

export default function CostosRealesEditor({ valoresIniciales, onGuardar, loading }) {
  const [valores, setValores] = useState(() =>
    rubrosReales.reduce(
      (acc, r) => ({ ...acc, [r.key]: valoresIniciales[r.key] ?? "" }),
      {}
    )
  );

  const handleChange = (key, value) => {
    setValores((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(valores);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-5 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600">
      <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">Editar Costos Reales</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        {rubrosReales.map((r) => (
          <div key={r.key} className="flex flex-col">
            <label className="text-xs mb-1 text-gray-700 dark:text-gray-300">{r.label}</label>
            <input
              className="border border-gray-300 dark:border-gray-600 px-2 py-1 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              type="number"
              min="0"
              step="any"
              value={valores[r.key]}
              onChange={(e) => handleChange(r.key, e.target.value)}
            />
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded transition disabled:opacity-50"
      >
        Guardar
      </button>
    </form>
  );
}
