import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import api from "@/utils/api";
import { FileText, Images, Plus, X, Eye } from "lucide-react";
import { getEvidenciasPorItem } from "@/services/presupuestoService";
import { buildMediaUrl } from "@/utils/url";

/* =========================
 * Galería con botón "Vista previa"
 * ========================= */
function GaleriaEvidencias({ evidencias, tipo, onPreview }) {

  const filtroTipo = tipo === "facturas" ? "Factura" : "Foto";
  const lista = (evidencias || []).filter(
    (e) => (e.tipoEvidencia || e.TipoEvidencia) === filtroTipo
  );

  if (!lista.length) {
    return (
      <div className="mb-4 p-3 rounded border bg-gray-50 text-sm text-gray-600">
        No hay {tipo === "facturas" ? "facturas" : "fotos"} cargadas para este ítem.
      </div>
    );
  }

  const isImage = (mime) =>
    ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
      (mime || "").toLowerCase()
    );

  if (tipo === "facturas") {
    // Lista de PDFs
    return (
      <div className="mb-4 space-y-3">
        {lista.map((ev) => {
          const id = ev.id || ev.Id;
          const nombre = ev.nombreArchivo || ev.NombreArchivo || "archivo.pdf";
          const url = buildMediaUrl(ev.urlArchivo || ev.UrlArchivo || "#");
          const mime = (ev.tipoArchivo || ev.TipoArchivo || "application/pdf").toLowerCase();

          return (
            <div
              key={id}
              className="p-3 border rounded bg-white flex items-center gap-3"
              title={nombre}
            >
              <div className="w-10 h-12 flex items-center justify-center border rounded">
                <span className="text-xs font-semibold text-red-600">PDF</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-blue-700 truncate">{nombre}</div>
                <div className="text-xs text-gray-500">{mime}</div>
              </div>
              <div className="flex gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200"
                >
                  Abrir en pestaña
                </a>
                <button
                  onClick={() => onPreview?.({ type: "pdf", src: url, title: nombre })}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded bg-amber-100 hover:bg-amber-200 text-amber-700"
                  title="Vista previa"
                >
                  <Eye size={14} />
                  Vista previa
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }


  // Grid de imágenes
  return (
    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {lista.map((ev) => {
        const id = ev.id || ev.Id;
        const nombre = ev.nombreArchivo || ev.NombreArchivo || "imagen";
        const url = buildMediaUrl(ev.urlArchivo || ev.UrlArchivo || "#");
        const mime = ev.tipoArchivo || ev.TipoArchivo || "";

        return (
          <div key={id} className="border rounded bg-white overflow-hidden">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={nombre}
              className="block"
            >
              {isImage(mime) ? (
                <img src={url} alt={nombre} className="w-full h-40 object-cover" loading="lazy" />
              ) : (
                <div className="p-3 text-xs text-gray-600">
                  Formato no reconocido: {mime || "(sin mime)"}
                </div>
              )}
            </a>
            <div className="px-2 py-1 text-xs text-gray-700 truncate">{nombre}</div>
            <div className="p-2">
              <button
                onClick={() => onPreview?.({ type: "img", src: url, title: nombre })}
                className="w-full inline-flex items-center justify-center gap-1 px-3 py-1 text-xs rounded bg-purple-100 hover:bg-purple-200 text-purple-700"
                title="Vista previa"
              >
                <Eye size={14} />
                Vista previa
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ===========================================================================
 *  DetalleComparativoRubro (usa /api/evidencia/por-proyecto/{proyectoId})
 * =========================================================================== */
export default function DetalleComparativoRubro({
  open,
  rubro,
  presupuesto,
  proyectoId: proyectoIdProp,   // <- pásalo desde el padre si puedes
  excelPreview,
  onClose,
  onCargarEvidencia,
  items: externalItems,
}) {
  if (!open) return null;

  /* ---------- Estado base ---------- */
  const [items, setItems] = useState(Array.isArray(externalItems) ? externalItems : []);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);
  // Elimina la declaración duplicada de evidenciasByItem
  /* ---------- Acordeón + vista ---------- */
  const [expandedId, setExpandedId] = useState(null); // ítem abierto
  // "form" | "facturas" | "fotos"
  const [viewMode, setViewMode] = useState("form");
  const [evidenciasByItem, setEvidenciasByItem] = useState({}); // { [itemId]: Evidencia[] }
  /* ---------- Form evidencia ---------- */
  const [tipoEvidencia, setTipoEvidencia] = useState("factura");
  const [fecha, setFecha] = useState("");
  const [valorReal, setValorReal] = useState("");
  const [comentario, setComentario] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [cantidadReal, setCantidadReal] = useState("");

  /* ---------- Evidencias (por proyecto) ---------- */
  const [loadingEvidencias, setLoadingEvidencias] = useState(false);

  /* ---------- Preview ---------- */
  const [preview, setPreview] = useState({
    open: false,
    type: null, // "pdf" | "img"
    src: "",
    title: "",
  });
  const openPreview = ({ type, src, title }) =>
    setPreview({ open: true, type, src, title });
  const closePreview = () =>
    setPreview({ open: false, type: null, src: "", title: "" });

  /* ---------- ID de proyecto ---------- */
  const proyectoId =
    proyectoIdProp ??
    presupuesto?.proyectoId ??
    presupuesto?.proyecto?.id ??
    null;

  /* ---------- Helpers ---------- */
  const RUBROS_BACKEND = useMemo(
    () => ({
      materiales: "Materiales",
      "mano de obra": "Mano de Obra",
      equipos: "Equipos",
      "servicios a terceros": "Servicios a Terceros",
      "costos indirectos": "Costos Indirectos",
    }),
    []
  );

  const normalize = (s) =>
    (s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const mapRubroToBackend = (r) => {
    const label = typeof r === "string" ? r : r?.label || r;
    const n = normalize(label);
    return RUBROS_BACKEND[n] || label || "Materiales";
  };

  const formatCOP = (num) =>
    Number(num || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" });

  /* ---------- Cargar ítems por rubro ---------- */
  useEffect(() => {
    if (Array.isArray(externalItems) && externalItems.length > 0) {
      setItems(externalItems);
      return;
    }
    const fetchItems = async () => {
      if (!presupuesto?.id) return;
      setLoading(true);
      try {
        const rubroQuery = mapRubroToBackend(rubro);
        const url = `/api/Presupuesto/${presupuesto.id}/items`;
        const { data } = await api.get(url, { params: { rubro: rubroQuery } });
        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data?.contenido)
            ? data.contenido
            : [];
        setItems(lista);
      } catch (err) {
        console.error("Error al cargar ítems del rubro:", err?.response?.data || err);
        toast.error("Error al cargar ítems del presupuesto");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [presupuesto?.id, rubro, externalItems]);

  useEffect(() => setPage(1), [search, items]);

  /* ---------- Filtro y paginación ---------- */
  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return (items || []).filter(
      (it) =>
        it?.descripcion?.toLowerCase().includes(q) ||
        it?.codigo?.toLowerCase().includes(q)
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const visibleItems = useMemo(() => {
    if (expandedId) return filteredItems.filter((it) => it.id === expandedId);
    return pagedItems;
  }, [expandedId, filteredItems, pagedItems]);



    const loadEvidencias = async (itemId) => {
    if (!itemId) return;


    setLoadingEvidencias(true);
    try {
      const { data } = await getEvidenciasPorItem(itemId);

      // Soporta payload directo o dentro de 'contenido'
      const lista = Array.isArray(data) ? data : (data?.contenido ?? []);

      // Normaliza claves comunes (opcional)
      const normalizadas = lista.map((e) => ({
        id: e.id ?? e.Id,
        itemId: e.itemId ?? e.ItemId ?? e.ITEM_ID ?? e.item_id,
        nombreArchivo: e.nombreArchivo ?? e.NombreArchivo,
        urlArchivo: buildMediaUrl(e.urlArchivo ?? e.UrlArchivo),
        tipoArchivo: (e.tipoArchivo ?? e.TipoArchivo ?? "").toLowerCase(),
        tipoEvidencia: e.tipoEvidencia ?? e.TipoEvidencia, // "Factura" | "Foto"
      }));

      setEvidenciasByItem((prev) => ({ ...prev, [itemId]: normalizadas }));
    } catch (err) {
      console.error("Error cargando evidencias por ítem:", err?.response?.data || err);
      toast.error("No se pudieron cargar las evidencias de este ítem");
    } finally {
      setLoadingEvidencias(false);
    }
  };

  /* ---------- Acciones UI ---------- */
  const onExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      resetFormulario();
    } else {
      setExpandedId(id);
      setViewMode("form"); // por defecto, formulario
      resetFormulario();
    }
  };

  const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
  const isFactura = tipoEvidencia === "factura";
  const ACCEPT_FACTURA = "application/pdf";
  const ACCEPT_FOTO = "image/png,image/jpeg,image/jpg,image/webp";

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setArchivo(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("El archivo excede los 2 MB permitidos.");
      e.target.value = "";
      setArchivo(null);
      return;
    }
    if (isFactura) {
      if (f.type !== "application/pdf") {
        toast.error("Solo se permite PDF para tipo 'Factura'.");
        e.target.value = "";
        setArchivo(null);
        return;
      }
    } else {
      const ok = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(f.type);
      if (!ok) {
        toast.error("Solo se permiten imágenes PNG/JPEG/WEBP para 'Foto de ejecución'.");
        e.target.value = "";
        setArchivo(null);
        return;
      }
    }
    setArchivo(f);
  };

  const resetFormulario = () => {
    setTipoEvidencia("factura");
    setFecha("");
    setValorReal("");
    setComentario("");
    setArchivo(null);
    setCantidadReal("");
  };

  const handleGuardarEvidencia = async (item) => {
    if (!item?.id || !presupuesto?.id) return;
    const esFactura = tipoEvidencia === "factura";

    if (!fecha) return toast.error("La fecha es obligatoria.");
    if (!comentario?.trim()) return toast.error("El comentario es obligatorio.");
    if (!archivo) {
      return toast.error(
        esFactura
          ? "Debes seleccionar un PDF (máx. 2 MB)."
          : "Debes seleccionar una imagen PNG/JPEG/WEBP (máx. 2 MB)."
      );
    }
    if (esFactura) {
      if (!valorReal || Number(valorReal) <= 0)
        return toast.error("Para 'Factura' el costo real es obligatorio y mayor a 0.");
      if (!cantidadReal || Number(cantidadReal) <= 0)
        return toast.error("Para 'Factura' la cantidad real es obligatoria y mayor a 0.");
    }

    try {
      // Aquí asumo que tu flujo de carga/confirmación por ítem no cambia.
      const { data } = await api.post("/api/EvidenciasItem/solicitar-upload", {
        ItemId: item.id,
        TipoEvidencia: esFactura ? "Factura" : "Foto",
        NombreArchivo: archivo.name,
        TipoArchivo: archivo.type,
      });
      if (!data?.ok) return toast.error(data?.mensaje || "No se pudo solicitar la carga.");

      const { uploadId, uploadUrl, maxBytes } = data.contenido || {};
      if (!uploadId || !uploadUrl)
        return toast.error("Respuesta inválida al solicitar ticket de carga.");
      if (typeof maxBytes === "number" && archivo.size > maxBytes) {
        return toast.error("El archivo excede el tamaño permitido (2 MB).");
      }

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body: archivo,
      });
      if (!putRes.ok) {
        const text = await putRes.text();
        throw new Error(text || "Error al subir el archivo temporal.");
      }

      await api.post("/api/EvidenciasItem/confirmar", {
        UploadId: uploadId,
        ItemId: item.id,
        TipoEvidencia: esFactura ? "Factura" : "Foto",
        FechaEvidencia: fecha,
        Comentario: comentario,
        CostoReal: esFactura ? Number(valorReal) : 0,
        CantidadReal: esFactura ? Number(cantidadReal) : 0,
      });

      toast.success("Evidencia guardada correctamente");
      resetFormulario();
      setExpandedId(null);
      onCargarEvidencia?.();

      // Refrescar cache del proyecto para que aparezca en las listas al volver a abrir:
      setEvidenciasLoaded(false);

    } catch (err) {
      const msg =
        err?.response?.data?.mensaje ||
        err?.response?.data?.message ||
        err?.message ||
        "Error al guardar evidencia";
      console.error("handleGuardarEvidencia:", err);
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl w-full relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-blue-600 hover:text-white"
            onClick={onClose}
          >
            ← Volver al Resumen
          </button>
          <h2 className="text-xl font-bold">
            {(typeof rubro === "string" ? rubro : rubro?.label) || "Rubro"}: Detalle Comparativo
          </h2>
        </div>

        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por descripción o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Lista + acordeón */}
        {loading ? (
          <div className="text-center text-gray-500">Cargando...</div>
        ) : (
          <div className="flex flex-col gap-2">
            {visibleItems.length === 0 ? (
              <div className="text-center text-gray-400">No hay registros para mostrar.</div>
            ) : (
              visibleItems.map((it) => {
                const isOpen = expandedId === it.id;
                const evidenciasItem = evidenciasByItem[it.id] || [];
                return (
                  <div key={it.id} className="bg-gray-50 rounded-lg shadow p-4">
                    {/* Fila principal */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex-1">
                        <div className="font-semibold text-blue-700">{it.descripcion}</div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-1">
                          <span>Código: {it.codigo}</span>
                          <span> Cant. Presup.: <b>{it.cantidad}</b> </span>
                          <span> Cant. Real: <b>{it.cantidadReal}</b> </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span> Costo Presup: <b>{formatCOP(it?.valorPresupuestado)}</b> </span>
                          <span> Costo Real: <b>{it?.valorReal ? formatCOP(it.valorReal) : "-"}</b> </span>
                        </div>
                      </div>

                      {/* Acciones por ítem (solo cuando NO está abierto) */}
                      <div className="flex flex-wrap gap-2">
                        {!isOpen && (
                          <>
                            <button
                              className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                              onClick={() => {
                                setExpandedId(it.id);
                                setViewMode("form");
                              }}
                              title="Agregar evidencia"
                            >
                              <Plus size={16} />
                              Agregar
                            </button>

                            <button
                              className="inline-flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1 rounded text-xs"
                              onClick={async () => {
                                if (expandedId !== it.id) setExpandedId(it.id);
                                setViewMode("facturas");
                                await loadEvidencias(it.id);   // <--- AQUÍ
                              }}
                              title="Ver facturas"
                            >
                              <FileText size={16} />
                              Facturas
                            </button>

                            <button
                              className="inline-flex items-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded text-xs"
                              onClick={async () => {
                                if (expandedId !== it.id) setExpandedId(it.id);
                                setViewMode("fotos");
                                await loadEvidencias(it.id);   // <--- Y AQUÍ
                              }}
                              title="Ver evidencias"
                            >
                              <Images size={16} />
                              Evidencias
                            </button>

                          </>
                        )}
                      </div>
                    </div>

                    {/* Contenido expandido */}
                    {isOpen && (
                      <div className="mt-4 border-t pt-4 relative">
                        {/* SOLO botón Cerrar dentro del panel */}
                        <button
                          className="absolute top-0 right-0 -mt-2 -mr-2 inline-flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs"
                          onClick={() => {
                            setExpandedId(null);
                            resetFormulario();
                          }}
                          title="Cerrar"
                        >
                          <X size={16} />
                          Cerrar
                        </button>

                        {viewMode === "form" ? (
                          /* FORMULARIO */
                          <div className="max-w-2xl">
                            {/* Tipo de evidencia */}
                            <div className="mb-2">
                              <label className="block text-sm mb-1">Tipo de evidencia:</label>
                              <select
                                value={tipoEvidencia}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setTipoEvidencia(v);
                                  setArchivo(null);
                                  if (v !== "factura") {
                                    setValorReal("");
                                    setCantidadReal("");
                                  }
                                }}
                                className="w-full border rounded px-2 py-1"
                              >
                                <option value="factura">Factura</option>
                                <option value="foto">Foto de ejecución</option>
                              </select>
                            </div>

                            {/* Fecha */}
                            <div className="mb-2">
                              <label className="block text-sm mb-1">Fecha:</label>
                              <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="w-full border rounded px-2 py-1"
                              />
                            </div>

                            {/* Valor / Cantidad (solo factura) */}
                            <div className="mb-2">
                              <label className="block text-sm mb-1">Valor Real:</label>
                              <input
                                type="number"
                                value={valorReal}
                                onChange={(e) => setValorReal(e.target.value)}
                                className="w-full border rounded px-2 py-1"
                                disabled={tipoEvidencia !== "factura"}
                                placeholder={tipoEvidencia === "factura" ? "Ej: 150000" : "No aplica"}
                              />
                            </div>
                            <div className="mb-2">
                              <label className="block text-sm mb-1">Cantidad Real:</label>
                              <input
                                type="number"
                                value={cantidadReal}
                                onChange={(e) => setCantidadReal(e.target.value)}
                                className="w-full border rounded px-2 py-1"
                                disabled={tipoEvidencia !== "factura"}
                                placeholder={tipoEvidencia === "factura" ? "Ej: 2" : "No aplica"}
                                step="any"
                                min="0"
                              />
                            </div>

                            {/* Comentario */}
                            <div className="mb-2">
                              <label className="block text-sm mb-1">Comentario:</label>
                              <textarea
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                                className="w-full border rounded px-2 py-1"
                                placeholder="Describe brevemente la evidencia"
                              />
                            </div>

                            {/* Archivo */}
                            <div className="mb-4">
                              <label className="block text-sm mb-1">
                                {tipoEvidencia === "factura"
                                  ? "Archivo (PDF, máx. 2 MB)"
                                  : "Imagen (PNG/JPEG/WEBP, máx. 2 MB)"}
                              </label>
                              <input
                                type="file"
                                accept={tipoEvidencia === "factura" ? ACCEPT_FACTURA : ACCEPT_FOTO}
                                onChange={handleFileChange}
                                className="w-full border rounded px-2 py-2"
                              />
                              {archivo && (
                                <div className="mt-1 text-xs text-gray-600">
                                  Seleccionado: <b>{archivo.name}</b>{" "}
                                  ({(archivo.size / 1024).toFixed(1)} KB)
                                </div>
                              )}
                            </div>

                            {/* Botones */}
                            <div className="flex gap-2 justify-end">
                              <button
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                                onClick={() => {
                                  setExpandedId(null);
                                  resetFormulario();
                                }}
                                type="button"
                              >
                                Cancelar
                              </button>
                              <button
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                onClick={() => handleGuardarEvidencia(it)}
                                type="button"
                                disabled={
                                  tipoEvidencia === "factura"
                                    ? !fecha || !comentario?.trim() || !archivo || !valorReal || !cantidadReal
                                    : !fecha || !comentario?.trim() || !archivo
                                }
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* LISTAS con "Vista previa" (usando evidencias agrupadas por ItemId) */
                          <>
                            {loadingEvidencias && (
                              <div className="text-sm text-gray-500 mb-2">Cargando evidencias…</div>
                            )}
                            <GaleriaEvidencias
                              evidencias={evidenciasByItem[it.id] || []} // <--- proviene del map por ítem
                              tipo={viewMode}                            // "facturas" o "fotos"
                              onPreview={openPreview}                    // si usas modal de vista previa
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Paginación */}
            {!expandedId && totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-2">
                <button
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </button>
                <span> Página {page} de {totalPages} </span>
                <button
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE VISTA PREVIA */}
      {preview.open && (
        <div className="fixed inset-0 z-[10000] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-5xl relative overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold text-sm truncate pr-4">
                {preview.title || "Vista previa"}
              </div>
              <button
                onClick={closePreview}
                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs"
              >
                <X size={14} /> Cerrar
              </button>
            </div>

            <div className="p-0">
              {preview.type === "pdf" ? (
                <iframe
                  src={buildMediaUrl(preview.src)}
                  title={preview.title}
                  className="w-full h-[75vh]"
                />
              ) : (
                <div className="w-full h-[75vh] flex items-center justify-center bg-black">
                  <img
                    src={buildMediaUrl(preview.src)}
                    alt={preview.title}
                    className="max-w-full max-h-[75vh] object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
