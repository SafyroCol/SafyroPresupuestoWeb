import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import toast, { Toaster } from "react-hot-toast";
import api from "@/utils/api";
import ProyectoPresupuestoResumen from "./ProyectoPresupuestoResumen.jsx";
import DetalleComparativoRubro from "./DetalleComparativoRubro.jsx";
import { FileBarChart2, HardHat, Truck, Users, FileCheck } from "lucide-react";
import { getEvidenciasPorProyecto } from "@/services/presupuestoService";
/**
 * ModalPresupuestoDetalle
 * --------------------------------------------------------------------------
 * Muestra el detalle/gestión del presupuesto de un proyecto. Permite:
 *  - Cargar/validar un Excel de presupuesto.
 *  - Calcular subtotales por rubro y total general (preview).
 *  - Importar el presupuesto al backend.
 *  - Abrir un modal comparativo por rubro para cargar evidencias.
 *
 * @param {Object} props
 * @param {number|string} props.proyectoId  ID del proyecto (requerido).
 * @param {Function} props.onClose          Cierra el modal contenedor.
 */
export default function ModalPresupuestoDetalle({ proyectoId, onClose }) {
  // =========================================================================
  // 1) CONSTANTES DE CONFIGURACIÓN
  // =========================================================================

  /** Mapeo “clave UI” => “nombre en Excel” */
  const RUBROS_BACKEND = {
    materiales: "Materiales",
    manoDeObra: "Mano de Obra",
    equipos: "Equipos",
    serviciosATerceros: "Servicios a Terceros",
    costosIndirectos: "Costos Indirectos",
  };

  /** Rubros y su ícono para UI */
  const RUBROS_ICONOS = [
    { key: "materiales", label: "Materiales", icon: FileBarChart2 },
    { key: "mano de obra", label: "Mano de Obra", icon: Users },
    { key: "equipos", label: "Equipos", icon: Truck },
    { key: "servicios a terceros", label: "Servicios a Terceros", icon: FileCheck },
    { key: "costos indirectos", label: "Costos Indirectos", icon: HardHat },
  ];

  /** Columnas requeridas en el Excel */
  const REQUIRED_COLS = [
    "Código",
    "Descripción del ítem",
    "Unidad",
    "Cantidad",
    "Valor Unitario",
    "Valor Total",
    "Capítulo / Rubro",
  ];

  // =========================================================================
  // 2) UTILIDADES
  // =========================================================================

  /** Normaliza el nombre del rubro para comparaciones robustas */
  const normalizeRubro = (r) =>
    (r || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  /** Formateo de moneda en COP */
  const formatCOP = (num) =>
    Number(num || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" });

  /** Suma de un rubro específico en el Excel parseado */
  const getRubroSubtotal = (items, rubroExcel) =>
    (Array.isArray(items) ? items : [])
      .filter(
        (x) => normalizeRubro(x["Capítulo / Rubro"]) === normalizeRubro(rubroExcel)
      )
      .reduce((a, b) => a + (Number(b["Valor Total"]) || 0), 0);

  /** Suma total general del Excel parseado */
  const getTotalGeneral = (items) =>
    (Array.isArray(items) ? items : []).reduce(
      (a, b) => a + (Number(b["Valor Total"]) || 0),
      0
    );

  /** Descarga una plantilla vacía de presupuesto */
  const descargarPlantilla = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        Ítem: "",
        Código: "",
        "Descripción del ítem": "",
        Unidad: "",
        Cantidad: "",
        "Valor Unitario": "",
        "Valor Total": "",
        "Capítulo / Rubro": "",
        Tamaño: "",
        "Especificaciones / Observaciones": "",
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Presupuesto");
    XLSX.writeFile(wb, "plantilla_presupuesto.xlsx");
  };

  // =========================================================================
  // 3) ESTADO
  // =========================================================================

  const [presupuesto, setPresupuesto] = useState(null);
  const [monedas, setMonedas] = useState([]);
  const [monedaId, setMonedaId] = useState("");

  const [excelPreview, setExcelPreview] = useState(null); // JSON del Excel
  const [file, setFile] = useState(null);                  // Archivo subido

  const [loading, setLoading] = useState(false);

  /** Estado del modal de detalle por rubro */
  const [detalleRubro, setDetalleRubro] = useState(null);
  // detalleRubro: { rubro: "Materiales" | "Mano de Obra" | ... } | null

  // =========================================================================
  // 4) EFECTOS: CARGA INICIAL
  // =========================================================================

  const fetchEvidenciasProyecto = async () => {
  if (!proyectoId) {
    toast.error("Falta el proyectoId para cargar evidencias.");
    return;
  }
  setLoadingEvidencias(true);
  try {
    const { data } = await getEvidenciasPorProyecto(proyectoId);
    const lista = Array.isArray(data) ? data : (data?.contenido ?? []);

    // (opcional) normaliza por si el backend varía en las claves
    const normalizadas = lista.map((e) => ({
      id: e.id ?? e.Id,
      itemId: e.itemId ?? e.ItemId ?? e.ITEM_ID ?? e.item_id,
      nombreArchivo: e.nombreArchivo ?? e.NombreArchivo,
      urlArchivo: e.urlArchivo ?? e.UrlArchivo,
      tipoArchivo: (e.tipoArchivo ?? e.TipoArchivo ?? "").toLowerCase(),
      tipoEvidencia: e.tipoEvidencia ?? e.TipoEvidencia, // "Factura" | "Foto"
    }));

    setEvidenciasProyecto(normalizadas);
    setEvidenciasLoaded(true);
  } catch (err) {
    console.error("Error evidencias proyecto:", err?.response?.data || err);
    toast.error("No se pudieron cargar las evidencias del proyecto");
    setEvidenciasProyecto([]);
    setEvidenciasLoaded(false);
  } finally {
    setLoadingEvidencias(false);
  }
};

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [p, m] = await Promise.all([
          api.get(`/api/Presupuesto/por-proyecto/${proyectoId}`),
          api.get(`/api/Moneda`),
        ]);

        if (p?.data?.ok) setPresupuesto(p.data.contenido);
        if (m?.data?.ok && Array.isArray(m.data.contenido)) setMonedas(m.data.contenido);
      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    })();
  }, [proyectoId]);

  // =========================================================================
  // 5) CALLBACKS / HANDLERS
  // =========================================================================

  /**
   * Refresca el presupuesto desde backend (útil tras subir evidencia).
   */
  const refrescarPresupuesto = useCallback(async () => {
    setLoading(true);
    try {
      const p = await api.get(`/api/Presupuesto/por-proyecto/${proyectoId}`);
      if (p?.data?.ok) setPresupuesto(p.data.contenido);
    } catch (err) {
      console.error("Error al refrescar presupuesto:", err);
      toast.error("Error al refrescar presupuesto");
    } finally {
      setLoading(false);
    }
  }, [proyectoId]);

  /**
   * Maneja el drop de un archivo Excel y valida columnas requeridas.
   */
  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles[0]) return;

    const file = acceptedFiles[0];
    setFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        // Validación básica
        if (!Array.isArray(json) || json.length === 0) {
          toast.error("El archivo no contiene filas válidas.");
          setExcelPreview(null);
          return;
        }

        // Validación de columnas requeridas
        const missingCols = REQUIRED_COLS.filter((col) => !(col in (json[0] || {})));
        if (missingCols.length > 0) {
          toast.error(`Faltan columnas requeridas: ${missingCols.join(", ")}`);
          setExcelPreview(null);
          return;
        }

        setExcelPreview(json);
      } catch (err) {
        console.error("Error al parsear Excel:", err);
        toast.error("Archivo Excel inválido");
        setExcelPreview(null);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  /** Configuración del dropzone */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
      "application/vnd.ms-excel": [],
    },
    maxFiles: 1,
  });

  /**
   * Envía el Excel al backend para importar el presupuesto.
   */
  const handleImportar = async (e) => {
    e.preventDefault();

    if (!file || !excelPreview || !monedaId) {
      toast.error("Completa todos los pasos y selecciona un archivo válido");
      return;
    }

    setLoading(true);

    // Construir DTO de importación (cálculos desde preview)
    const dto = {
      proyectoId,
      nombre: file.name,
      costoMateriales: getRubroSubtotal(excelPreview, RUBROS_BACKEND["materiales"]),
      costoManoObra: getRubroSubtotal(excelPreview, RUBROS_BACKEND["mano de obra"]),
      costoDepreciacion: getRubroSubtotal(excelPreview, RUBROS_BACKEND["equipos"]),
      costoOtros: getRubroSubtotal(excelPreview, RUBROS_BACKEND["servicios a terceros"]),
      costoIndirectos: getRubroSubtotal(excelPreview, RUBROS_BACKEND["costos indirectos"]),
      monedaId,
      fechaCreacion: new Date().toISOString(),
    };

    try {
      const { data } = await api.post("/api/Presupuesto/importar-excel", {
        presupuesto: dto,
        data: excelPreview,
      });


      if (data?.ok) {
        toast.success("¡Presupuesto importado con éxito!");
        setPresupuesto(data.contenido);
        setExcelPreview(null);
        setFile(null);
      } else {
        toast.error(data?.message || "Error en el backend");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (typeof err === "string" ? err : "") ||
        "Error al importar presupuesto";
      console.error("Error importar:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // 6) RENDER
  // =========================================================================

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4">
      <div className="w-full max-w-4xl mx-auto my-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl">
        <div className="p-4 sm:p-8">
          <Toaster />

          {/* -------------------------------------------------------------------
          Modal de Detalle Comparativo por Rubro
          - Se renderiza siempre y se controla con la prop "open".
          - IMPORTANTE: pasamos onCargarEvidencia para refrescar después de subir evidencias.
        ------------------------------------------------------------------- */}
      {/* Pasamos onCargarEvidencia para refrescar luego de subir evidencias */}
      <DetalleComparativoRubro
        open={!!detalleRubro}
        rubro={detalleRubro?.rubro}
        presupuesto={presupuesto}
        excelPreview={excelPreview}
        onCargarEvidencia={refrescarPresupuesto}
        proyectoId={proyectoId}   // <-- aquí
        onClose={() => setDetalleRubro(null)}
      />

      {/* Header principal */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onClose}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-blue-600 hover:text-white text-gray-800 dark:text-gray-100 transition px-4 py-2 rounded-xl ring-1 ring-black/10 dark:ring-white/10"
        >
          ← Volver
        </button>
        <h2 className="text-2xl font-bold text-right text-gray-900 dark:text-gray-100">Presupuesto del Proyecto</h2>
      </div>

      {/* Estado de carga */}
      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-300">Cargando...</div>
      ) : presupuesto ? (
        // ---------------------------------------------------------------
        // Vista: Presupuesto ya guardado -> Resumen + Gestión
        // ---------------------------------------------------------------
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700 dark:text-gray-200">
            Resumen y Gestión del Presupuesto
          </h2>

          <ProyectoPresupuestoResumen
            presupuesto={presupuesto}
            onCargarEvidencia={refrescarPresupuesto}
          />

          <button
            onClick={onClose}
            className="mt-6 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-6 py-2 rounded-xl transition"
          >
            Volver
          </button>
        </div>
      ) : (
        // ---------------------------------------------------------------
        // Vista: Sin presupuesto -> Configuración e Importación
        // ---------------------------------------------------------------
        <>
          {/* Botón plantilla */}
          <div className="mb-4">
            <button
              className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-blue-600 hover:text-white text-gray-800 dark:text-gray-100 transition"
              onClick={descargarPlantilla}
              type="button"
            >
              Descargar plantilla Excel
            </button>
          </div>

          {/* Selección de moneda */}
          <div className="mb-4">
            <label className="font-semibold text-gray-800 dark:text-gray-200">Moneda:</label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={monedaId}
              onChange={(e) => setMonedaId(e.target.value)}
            >
              <option value="">-- Selecciona moneda --</option>
              {monedas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.simbolo})
                </option>
              ))}
            </select>
          </div>

          {/* Dropzone de archivo */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl px-6 py-6 text-center cursor-pointer transition ${isDragActive ? "bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500" : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              } text-gray-700 dark:text-gray-200`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="text-gray-900 dark:text-gray-100">
                <b>Archivo:</b> {file.name}
                <button
                  className="ml-4 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setExcelPreview(null);
                  }}
                >
                  Quitar
                </button>
              </div>
            ) : (
              <span>
                Arrastra y suelta el archivo Excel aquí
                <br />o haz click para seleccionar
              </span>
            )}
          </div>

          {/* Preview de subtotales por rubro */}
          {excelPreview && (
            <div className="mt-6">
              <div className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Subtotales por Rubro</div>

              {/* Tabla (desktop) */}
              <table className="min-w-full text-xs mb-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hidden sm:table">
                <thead>
                  <tr>
                    {RUBROS_ICONOS.map((r) => (
                      <th key={r.key} className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <span className="inline-flex items-center gap-2">
                          <r.icon className="w-4 h-4 inline-block text-blue-500 dark:text-blue-400" />
                          {r.label}
                        </span>
                      </th>
                    ))}
                    <th className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-blue-700 dark:text-blue-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {RUBROS_ICONOS.map((r) => {
                      const subtotal = getRubroSubtotal(
                        excelPreview,
                        RUBROS_BACKEND[r.key]
                      );
                      return (
                        <td
                          key={r.key}
                          className={`px-2 py-1 border text-right ${subtotal === 0 ? "bg-yellow-100 text-yellow-700" : ""
                            }`}
                        >
                          {formatCOP(subtotal)}
                          {subtotal === 0 && <span className="ml-1 text-xs">⚠️</span>}

                          {/* Botón para abrir detalle comparativo */}
                          <button
                            className="ml-2 text-xs underline text-blue-600"
                            type="button"
                            onClick={() => setDetalleRubro({ rubro: RUBROS_BACKEND[r.key] })}
                          >
                            Comparar
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-right font-bold text-blue-700 dark:text-blue-400 text-gray-900 dark:text-gray-100">
                      {formatCOP(getTotalGeneral(excelPreview))}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Cards (mobile/tablet) */}
              <div className="sm:hidden flex flex-col gap-3 mb-6">
                {RUBROS_ICONOS.map((r) => {
                  const subtotal = getRubroSubtotal(excelPreview, RUBROS_BACKEND[r.key]);
                  const Icon = r.icon;
                  return (
                    <div
                      key={r.key}
                      className={`flex items-center gap-2 p-3 rounded-xl border shadow bg-gray-50 ${subtotal === 0 ? "border-yellow-400" : "border-gray-200"
                        }`}
                    >
                      <Icon className="w-6 h-6 text-blue-500" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-700">{r.label}</div>
                        <div className="text-base font-bold">
                          {formatCOP(subtotal)}{" "}
                          {subtotal === 0 && (
                            <span className="ml-1 text-xs text-yellow-600">⚠️</span>
                          )}
                        </div>
                      </div>

                      {/* Botón para abrir detalle comparativo */}
                      <button
                        className="ml-2 text-xs underline text-blue-600"
                        type="button"
                        onClick={() => setDetalleRubro({ rubro: RUBROS_BACKEND[r.key] })}
                      >
                        Comparar
                      </button>
                    </div>
                  );
                })}

                {/* Total (mobile) */}
                <div className="flex items-center gap-2 p-3 rounded-xl border bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600">
                  <FileBarChart2 className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                  <div className="flex-1">
                    <div className="text-xs text-blue-800 dark:text-blue-300 font-semibold">Total</div>
                    <div className="text-base font-bold text-blue-800 dark:text-blue-200">
                      {formatCOP(getTotalGeneral(excelPreview))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Aquí puedes añadir alertas, preview de filas, etc. */}
            </div>
          )}

          {/* Formulario de importación */}
          <form onSubmit={handleImportar} className="mt-2 flex flex-col items-center">
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold transition disabled:opacity-60 shadow-sm"
              disabled={loading || !file || !excelPreview || !monedaId}
            >
              {loading ? "Importando..." : "Importar Presupuesto"}
            </button>
          </form>
        </>
      )}
        </div>
      </div>
    </div>
  );
}
