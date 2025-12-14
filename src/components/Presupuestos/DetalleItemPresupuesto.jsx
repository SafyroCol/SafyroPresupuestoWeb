import { useEffect, useState } from "react";
import api from "@/utils/api";
import EvidenciasItemList from "./EvidenciasItemList";

export default function DetalleItemPresupuesto({ itemId, onClose }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar detalle + evidencias
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/Presupuesto/item/${itemId}`);
        setItem(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [itemId]);

  // Handler para subir evidencia
  const handleUploadEvidencia = async (formData) => {
    await api.post(`/api/Presupuesto/item/${itemId}/evidencia`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // Recargar evidencias
    const { data } = await api.get(`/api/Presupuesto/item/${itemId}`);
    setItem(data);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></span>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando...</span>
      </div>
    );
  }
  if (!item) return null;

  const costoReal = item.evidenciasItemPresupuesto?.reduce(
    (a, b) => a + (b.valorSoportado || 0),
    0
  );

  return (
    <div className="p-6 max-w-lg w-full mx-auto">
      <button
        className="mb-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm text-gray-700 dark:text-gray-200 font-semibold transition"
        onClick={onClose}
      >
        ← Volver
      </button>
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100 truncate">{item.descripcion || "Ítem sin descripción"}</h2>
      <div className="text-gray-600 dark:text-gray-300 mb-1">
        <b>Código:</b> <span className="font-mono">{item.codigo}</span>
      </div>
      <div className="text-gray-600 dark:text-gray-300 mb-1">
        <b>Unidad:</b> {item.unidad} &nbsp; | &nbsp;
        <b>Cantidad:</b> {item.cantidad}
      </div>
      <div className="text-gray-600 dark:text-gray-300 mb-1">
        <b>Presupuestado:</b>{" "}
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {Number(item.valorTotal || 0).toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
          })}
        </span>
      </div>
      <div className="text-green-800 dark:text-green-400 mb-4 text-lg font-bold">
        Costo Real:{" "}
        {costoReal
          ? costoReal.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            })
          : "—"}
      </div>

      {/* Evidencias */}
      <EvidenciasItemList
        evidencias={item.evidenciasItemPresupuesto}
        onNuevaEvidencia={handleUploadEvidencia}
      />
    </div>
  );
}
