import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import toast, { Toaster } from "react-hot-toast";
import api from "@/utils/api";
import ProyectoPresupuestoResumen from "./ProyectoPresupuestoResumen.jsx";
import { FileBarChart2, HardHat, Truck, Users, FileCheck } from "lucide-react";

// Rubros válidos y su forma "normalizada"
const rubrosBackend = {
  materiales: "Materiales",
  "mano de obra": "Mano de Obra",
  equipos: "Equipos",
  "servicios a terceros": "Servicios a Terceros",
  "costos indirectos": "Costos Indirectos"
};

const rubrosIconos = [
  { key: "materiales", label: "Materiales", icon: FileBarChart2 },
  { key: "mano de obra", label: "Mano de Obra", icon: Users },
  { key: "equipos", label: "Equipos", icon: Truck },
  { key: "servicios a terceros", label: "Servicios a Terceros", icon: FileCheck },
  { key: "costos indirectos", label: "Costos Indirectos", icon: HardHat }
];

const requiredCols = [
  "Código",
  "Descripción del ítem",
  "Unidad",
  "Cantidad",
  "Valor Unitario",
  "Valor Total",
  "Capítulo / Rubro"
];

const normalizeRubro = (r) =>
  (r || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export default function ModalPresupuestoDetalle({ proyectoId, onClose }) {
  const [presupuesto, setPresupuesto] = useState(null);
  const [monedas, setMonedas] = useState([]);
  const [monedaId, setMonedaId] = useState("");
  const [excelPreview, setExcelPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Refrescar presupuesto desde la API ---
  const refrescarPresupuesto = useCallback(async () => {
    setLoading(true);
    try {
      const p = await api.get(`/api/Presupuesto/por-proyecto/${proyectoId}`);
      if (p.data.ok) setPresupuesto(p.data.contenido);
    } catch {
      toast.error("Error al refrescar presupuesto");
    } finally {
      setLoading(false);
    }
  }, [proyectoId]);

  // Cargar presupuesto y monedas al abrir o cambiar proyectoId
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [p, m] = await Promise.all([
          api.get(`/api/Presupuesto/por-proyecto/${proyectoId}`),
          api.get(`/api/Moneda`),
        ]);
        if (p.data.ok) setPresupuesto(p.data.contenido);
        if (m.data.ok) setMonedas(m.data.contenido);
      } catch {
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    })();
  }, [proyectoId]);

  // --- Dropzone y parsing del Excel con validación de columnas ---
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

        // 1. Validación de columnas requeridas
        const missingCols = requiredCols.filter(
          (col) => !(col in (json[0] || {}))
        );
        if (missingCols.length > 0) {
          toast.error(`Faltan columnas: ${missingCols.join(", ")}`);
          setExcelPreview(null);
          return;
        }

        setExcelPreview(json);
      } catch (err) {
        toast.error("Archivo Excel inválido");
        setExcelPreview(null);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
      "application/vnd.ms-excel": [],
    },
    maxFiles: 1,
  });

  // --- Subtotal por rubro (robusto y validado) ---
  const getRubroSubtotal = (items, rubroExcel) =>
    items
      .filter(
        (x) =>
          normalizeRubro(x["Capítulo / Rubro"]) ===
          normalizeRubro(rubroExcel)
      )
      .reduce((a, b) => a + (Number(b["Valor Total"]) || 0), 0);

  // --- Total general ---
  const getTotalGeneral = (items) =>
    items.reduce((a, b) => a + (Number(b["Valor Total"]) || 0), 0);

  // --- Enviar presupuesto importado al backend ---
  const handleImportar = async (e) => {
    e.preventDefault();
    if (!file || !excelPreview || !monedaId) {
      toast.error("Completa todos los pasos y selecciona un archivo válido");
      return;
    }
    setLoading(true);

    // 2. Rubros mapeados de forma robusta
    const dto = {
      proyectoId,
      nombre: file.name,
      costoMateriales: getRubroSubtotal(excelPreview, rubrosBackend["materiales"]),
      costoManoObra: getRubroSubtotal(excelPreview, rubrosBackend["mano de obra"]),
      costoDepreciacion: getRubroSubtotal(excelPreview, rubrosBackend["equipos"]),
      costoOtros: getRubroSubtotal(excelPreview, rubrosBackend["servicios a terceros"]),
      costoIndirectos: getRubroSubtotal(excelPreview, rubrosBackend["costos indirectos"]),
      monedaId,
      fechaCreacion: new Date().toISOString(),
    };

    try {
      const { data } = await api.post("/api/Presupuesto/importar-excel", {
        presupuesto: dto,
        data: excelPreview,
      });
      if (data.ok) {
        toast.success("¡Presupuesto importado con éxito!");
        setPresupuesto(data.contenido);
        setExcelPreview(null);
        setFile(null);
      } else {
        toast.error(data.message || "Error en backend");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (typeof err === "string" ? err : "") ||
        "Error al importar presupuesto";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // --- Descargar plantilla Excel ---
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

  // --- Render del Modal ---
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2">
      <Toaster />
      <div
        className="
          relative bg-white dark:bg-gray-900 p-4 sm:p-8 rounded-2xl shadow-2xl
          w-full max-w-sm sm:max-w-lg md:max-w-2xl
          max-h-[90vh] overflow-y-auto
          transition-all
        "
        style={{
          minHeight: "320px",
          minWidth: "0",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-xl text-lg z-10"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Presupuesto del Proyecto
        </h2>
        {loading ? (
          <div className="text-center text-gray-500">Cargando...</div>
        ) : presupuesto ? (
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
              className="mt-6 bg-gray-600 hover:bg-gray-800 text-white px-6 py-2 rounded-xl"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <button
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-blue-600 hover:text-white transition"
                onClick={descargarPlantilla}
                type="button"
              >
                Descargar plantilla Excel
              </button>
            </div>
            <div className="mb-4">
              <label className="font-semibold">Moneda:</label>
              <select
                className="w-full px-3 py-2 rounded-xl border"
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
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl px-6 py-6 text-center cursor-pointer ${
                isDragActive ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div>
                  <b>Archivo:</b> {file.name}
                  <button
                    className="ml-4 px-2 py-1 bg-red-400 text-white rounded"
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
            {/* Subtotales por Rubro */}
            {excelPreview && (
              <div className="mt-6">
                <div className="font-semibold mb-2">Subtotales por Rubro</div>
                {/* Tabla para desktop */}
                <table className="min-w-full text-xs mb-3 border hidden sm:table">
                  <thead>
                    <tr>
                      {rubrosIconos.map((r) => (
                        <th key={r.key} className="px-2 py-1 border">
                          <span className="inline-flex items-center gap-2">
                            <r.icon className="w-4 h-4 inline-block text-blue-500" />
                            {r.label}
                          </span>
                        </th>
                      ))}
                      <th className="px-2 py-1 border text-blue-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {rubrosIconos.map((r) => {
                        const subtotal = getRubroSubtotal(
                          excelPreview,
                          rubrosBackend[r.key]
                        );
                        return (
                          <td
                            key={r.key}
                            className={`px-2 py-1 border text-right ${
                              subtotal === 0
                                ? "bg-yellow-100 text-yellow-700"
                                : ""
                            }`}
                          >
                            {subtotal.toLocaleString("es-CO", {
                              style: "currency",
                              currency: "COP",
                            })}
                            {subtotal === 0 && (
                              <span className="ml-1 text-xs">⚠️</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-2 py-1 border text-right font-bold text-blue-700">
                        {getTotalGeneral(excelPreview).toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
                {/* Cards para mobile/tablet */}
                <div className="sm:hidden flex flex-col gap-3 mb-6">
                  {rubrosIconos.map((r) => {
                    const subtotal = getRubroSubtotal(
                      excelPreview,
                      rubrosBackend[r.key]
                    );
                    const Icon = r.icon;
                    return (
                      <div
                        key={r.key}
                        className={`flex items-center gap-2 p-3 rounded-xl border shadow bg-gray-50 ${
                          subtotal === 0 ? "border-yellow-400" : "border-gray-200"
                        }`}
                      >
                        <Icon className="w-6 h-6 text-blue-500" />
                        <div className="flex-1">
                          <div className="text-xs text-gray-700">{r.label}</div>
                          <div className="text-base font-bold">
                            {subtotal.toLocaleString("es-CO", {
                              style: "currency",
                              currency: "COP",
                            })}{" "}
                            {subtotal === 0 && (
                              <span className="ml-1 text-xs text-yellow-600">⚠️</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-2 p-3 rounded-xl border bg-blue-50 border-blue-300">
                    <FileBarChart2 className="w-6 h-6 text-blue-700" />
                    <div className="flex-1">
                      <div className="text-xs text-blue-800 font-semibold">Total</div>
                      <div className="text-base font-bold text-blue-800">
                        {getTotalGeneral(excelPreview).toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Preview de filas Excel, cards solo en mobile/tablet */}
                <div className="sm:hidden flex flex-col gap-2 mb-4">
                  {excelPreview.slice(0, 5).map((row, i) => (
                    <div key={i} className="rounded-xl border bg-white p-3 shadow flex flex-col gap-1">
                      {Object.keys(row).map((col) => (
                        <div key={col} className="flex justify-between text-xs">
                          <span className="font-semibold text-gray-600">{col}:</span>
                          <span className="text-right break-all">{row[col]}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="text-xs text-gray-400 p-1 text-end">
                    Mostrando {Math.min(5, excelPreview.length)} de {excelPreview.length} filas
                  </div>
                </div>
                {/* Alertas */}
                {Object.values(rubrosBackend).some(
                  (r) => getRubroSubtotal(excelPreview, r) === 0
                ) && (
                  <div className="text-xs text-yellow-600 mb-2">
                    ⚠️ Hay rubros sin ítems o con subtotal cero. Revisa tu Excel.
                  </div>
                )}
              </div>
            )}
            <form
              onSubmit={handleImportar}
              className="mt-2 flex flex-col items-center"
            >
              <button
                type="submit"
                className="w-full px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-60"
                disabled={loading || !file || !excelPreview || !monedaId}
              >
                {loading ? "Importando..." : "Importar Presupuesto"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
