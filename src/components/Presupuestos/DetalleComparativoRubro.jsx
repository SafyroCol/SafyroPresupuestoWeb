import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "@/utils/api";

export default function DetalleComparativoRubro({
  rubro,
  presupuesto,
  onClose,
  onCargarEvidencia,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Para el formulario de evidencias
  const [selectedItem, setSelectedItem] = useState(null);
  const [archivos, setArchivos] = useState([]);

  // Cargar los ítems presupuestados de este rubro
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        // Reemplaza la ruta por tu endpoint real
        const { data } = await api.get(
          `/api/Presupuesto/${presupuesto.id}/items?rubro=${rubro.label}`
        );
        setItems(data.contenido || []);
      } catch {
        toast.error("Error al cargar items del rubro");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [presupuesto.id, rubro.label]);

  // Subida de archivos
  const handleArchivoChange = (e) => {
    setArchivos(Array.from(e.target.files));
  };

  // Guardar evidencia (factura/foto) asociada al ítem
  const handleCargarEvidencia = async (e) => {
    e.preventDefault();
    if (!selectedItem || archivos.length === 0) {
      toast.error("Selecciona un ítem y al menos un archivo");
      return;
    }
    const formData = new FormData();
    formData.append("itemId", selectedItem.id);
    archivos.forEach((file) => formData.append("archivos", file));
    setLoading(true);
    try {
      await api.post(
        `/api/Presupuesto/${presupuesto.id}/item/${selectedItem.id}/evidencias`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Evidencia cargada correctamente");
      setArchivos([]);
      setSelectedItem(null);
      if (onCargarEvidencia) await onCargarEvidencia();
    } catch {
      toast.error("Error al cargar evidencia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <button className="mb-4 px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
        ← Volver al Resumen
      </button>
      <h2 className="text-2xl font-bold mb-4">{rubro.label}: Detalle Comparativo</h2>

      {loading ? (
        <div className="text-center text-gray-500">Cargando...</div>
      ) : (
        <>
          <table className="w-full text-xs border mb-6">
            <thead>
              <tr>
                <th className="border px-2 py-1">Ítem</th>
                <th className="border px-2 py-1">Descripción</th>
                <th className="border px-2 py-1">Unidad</th>
                <th className="border px-2 py-1">Cantidad</th>
                <th className="border px-2 py-1">Valor Presupuestado</th>
                <th className="border px-2 py-1">Valor Real</th>
                <th className="border px-2 py-1">Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="border px-2 py-1">{item.codigo}</td>
                  <td className="border px-2 py-1">{item.descripcion}</td>
                  <td className="border px-2 py-1">{item.unidad}</td>
                  <td className="border px-2 py-1">{item.cantidad}</td>
                  <td className="border px-2 py-1">
                    {(item.valorPresupuestado || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" })}
                  </td>
                  <td className="border px-2 py-1">
                    {(item.valorReal || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" })}
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => setSelectedItem(item)}
                    >
                      Cargar evidencia
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Formulario para subir evidencias */}
          {selectedItem && (
            <form onSubmit={handleCargarEvidencia} className="my-4 border rounded-lg p-4 bg-gray-50">
              <div className="font-semibold mb-2">
                Cargar evidencia para: <span className="text-blue-700">{selectedItem.descripcion}</span>
              </div>
              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                onChange={handleArchivoChange}
                className="mb-2"
              />
              <div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded mr-2"
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "Subir Evidencia"}
                </button>
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded"
                  onClick={() => {
                    setSelectedItem(null);
                    setArchivos([]);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
