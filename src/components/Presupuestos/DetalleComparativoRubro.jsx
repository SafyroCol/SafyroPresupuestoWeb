import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "@/utils/api";
import Uploady, { useItemFinishListener } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import UploadPreview from "@rpldy/upload-preview";

function UploadFinishListener({ onFinish }) {
  useItemFinishListener(onFinish);
  return null;
}

const ejemploRubro = { label: "Transporte" };
const ejemploPresupuesto = { id: 1 };
const ejemploItems = [
  {
    id: 101,
    descripcion: "Alquiler de bus",
    codigo: "TR-001",
    cantidad: 2,
    valorPresupuestado: 500000,
    valorReal: 480000,
  },
  {
    id: 102,
    descripcion: "Combustible",
    codigo: "TR-002",
    cantidad: 100,
    valorPresupuestado: 300000,
    valorReal: null,
  },
];

export default function DetalleComparativoRubro({
  rubro = ejemploRubro,
  presupuesto = ejemploPresupuesto,
  onClose = () => { },
  onCargarEvidencia = () => { },
}) {
  const [items, setItems] = useState(ejemploItems);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [valorReal, setValorReal] = useState("");
  const [comentario, setComentario] = useState("");
  const [tipoEvidencia, setTipoEvidencia] = useState("factura");

  // Buscador
  const [search, setSearch] = useState("");
  // Paginación
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          `/api/MatePresupuesto/ByPresupuesto/${presupuesto.id}`
        );
        setItems(data || []);
      } catch {
        toast.error("Error al cargar materiales del presupuesto");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [presupuesto.id, onCargarEvidencia]);

  // Reinicia página al cambiar búsqueda o items
  useEffect(() => {
    setPage(1);
  }, [search, items]);

  // Filtrado predictivo
  const filteredItems = items.filter(
    it =>
      it.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
      it.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación sobre filtrados
  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE) || 1;
  const pagedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePrevPage = () => setPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setPage(p => Math.min(totalPages, p + 1));

  const handleUploadFinish = () => {
    toast.success("Evidencia cargada correctamente");
    setSelectedItem(null);
    setValorReal("");
    setComentario("");
    setTipoEvidencia("factura");
    onCargarEvidencia?.();
  };

  const getDestination = () => ({
    url: `/api/Presupuesto/${presupuesto.id}/item/${selectedItem.id}/evidencias`,
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
    params: { valorReal, comentario, tipoEvidencia },
  });

  return (
  <div className="bg-white rounded-xl shadow-lg p-4 max-w-3xl mx-auto">
    {/* Encabezado: botón y título en la misma fila */}
    <div className="flex items-center justify-between mb-4">
      <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
        ← Volver al Resumen
      </button>
      <h2 className="text-xl font-bold">{rubro.label}: Detalle Comparativo</h2>
    </div>

    {/* Buscador */}
    <div className="mb-4">
      <input
        type="text"
        placeholder="Buscar por descripción o código..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
    </div>

    {loading && <div className="text-center text-gray-500">Cargando...</div>}

    {!loading && (
      <div className="flex flex-col gap-2">
        {pagedItems.length === 0 && (
          <div className="text-center text-gray-400">No hay materiales para mostrar.</div>
        )}
        {pagedItems.map(it => (
          <div
            key={it.id}
            className="bg-gray-50 rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center gap-2"
          >
            <div className="flex-1">
              <div className="font-semibold text-blue-700">{it.descripcion}</div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-1">
                <span>Código: {it.codigo}</span>
                <span>Cant: <b>{it.cantidad}</b></span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>
                  Presup: <b>{it.valorPresupuestado?.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</b>
                </span>
                <span>
                  Real: <b>{it.valorReal?.toLocaleString("es-CO", { style: "currency", currency: "COP" }) || "-"}</b>
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                onClick={() => setSelectedItem(it)}
              >
                Agregar Evidencia
              </button>
            </div>
          </div>
        ))}

        {/* Controles de paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}

        {/* ...modal de evidencia... */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedItem(null)}
                  aria-label="Cerrar"
                >
                  ✕
                </button>
                <div className="font-semibold mb-2">
                  Cargar evidencia para:{" "}
                  <span className="text-blue-700">{selectedItem.descripcion}</span>
                </div>
                <div className="mb-2">
                  <label className="block text-sm mb-1">Tipo de evidencia:</label>
                  <select
                    value={tipoEvidencia}
                    onChange={e => setTipoEvidencia(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="factura">Factura</option>
                    <option value="foto">Foto de ejecución</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-sm mb-1">Valor Real:</label>
                  <input
                    type="number"
                    value={valorReal}
                    onChange={e => setValorReal(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm mb-1">Comentario:</label>
                  <textarea
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <Uploady destination={getDestination()}>
                  <UploadButton
                    className="bg-green-600 text-white px-4 py-2 rounded mb-2 w-full"
                    disabled={!valorReal}
                  >
                    Seleccionar archivos
                  </UploadButton>
                  <UploadPreview styles={{ preview: { maxWidth: 120, maxHeight: 90 } }} />
                  <UploadFinishListener onFinish={handleUploadFinish} />
                </Uploady>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}