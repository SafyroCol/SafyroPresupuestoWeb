import { useEffect, useState } from "react";
import api from "@/utils/api";
import * as XLSX from "xlsx";
import PresupuestoAccordion from "./PresupuestoAccordion"; // Ajusta el path si es necesario


const ModalPresupuestoDetalle = ({ proyectoId, onClose }) => {
  const [selectedProyectoId, setSelectedProyectoId] = useState(null);
  const [file, setFile] = useState(null);
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const [presupuesto, setPresupuesto] = useState(null);
  const [monedas, setMonedas] = useState([]);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState("");
  const [loading, setLoading] = useState(true);

  const handleImportarPresupuesto = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Seleccione un archivo");
      return;
    }
    // Leer el archivo Excel
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (evt) => {
      console.log("Entró a reader.onload"); // 1️⃣ ¿Sale este log?
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        console.log("json:", json); // 2️⃣ ¿Sale esto?

        // Aquí arma el DTO
        const presupuestoDto = {
          proyectoId: proyectoId,
          nombre: sheetName,
          costoMateriales: calcularSubtotal(json, "Materiales"),
          costoManoObra: calcularSubtotal(json, "Mano de Obra"),
          costoDepreciacion: calcularSubtotal(json, "Equipos"),
          costoOtros: calcularSubtotal(json, "Servicios de Terceros"),
          costoIndirectos: calcularSubtotal(json, "Costos Indirectos"),
          monedaId: selectedMonedaId,
          fechaCreacion: new Date().toISOString(),
        };
        console.log("presupuestoDto:", presupuestoDto); // 4️⃣ ¿Sale esto?
        // ... resto del código
      } catch (err) {
        console.error("Error en onload:", err); // 5️⃣ ¿Se imprime esto?
        alert("Error en onload: " + err.message);
      }

      // Objeto final a enviar
      const payload = {
        presupuesto: presupuestoDto,
        data: json, // array de ítems leídos del Excel
      };

      try {
        const response = await fetch("/api/Presupuesto/importar-excel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (result.ok) {
          alert("Presupuesto importado exitosamente.");
        } else {
          alert("Error en el backend: " + result.message);
        }
      } catch (err) {
        alert("Error al enviar archivo: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Puedes calcular los subtotales por rubro (ejemplo simple)
  function calcularSubtotal(items, rubro) {
    // Ajusta los nombres según tu archivo
    switch (rubro) {
      case "Materiales":
        return items
          .filter((x) => x.Rubro === "Materiales")
          .reduce(
            (a, b) => a + (Number(b.Cantidad) * Number(b.CostoUnitario) || 0),
            0
          );
      case "Mano de Obra":
        return items
          .filter((x) => x.Rubro === "Mano de Obra")
          .reduce((a, b) => a + (Number(b.Subtotal) || 0), 0);
      case "Equipos":
        return items
          .filter((x) => x.Rubro === "Equipos")
          .reduce((a, b) => a + (Number(b.Subtotal) || 0), 0);
      case "Servicios de Terceros":
        return items
          .filter((x) => x.Rubro === "Servicios de Terceros")
          .reduce(
            (a, b) => a + (Number(b.Cantidad) * Number(b.CostoUnitario) || 0),
            0
          );
      case "Costos Indirectos":
        return items
          .filter((x) => x.Rubro === "Costos Indirectos")
          .reduce((a, b) => a + (Number(b.Valor) || 0), 0);
      default:
        return 0;
    }
  }

  useEffect(() => {
    if (!proyectoId) return;
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [presupuestoRes, monedasRes] = await Promise.all([
          api.get(`/api/Presupuesto/por-proyecto/${proyectoId}`),
          api.get(`/api/Moneda`),
        ]);
        if (presupuestoRes.data.ok)
          setPresupuesto(presupuestoRes.data.contenido);
        if (monedasRes.data.ok && Array.isArray(monedasRes.data.contenido))
          setMonedas(monedasRes.data.contenido);
        else setMonedas([]);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setMonedas([]);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [proyectoId]);

  if (!proyectoId) return null;

  const tienePresupuesto =
    presupuesto &&
    ((Array.isArray(presupuesto.materiales) &&
      presupuesto.materiales.length > 0) ||
      (Array.isArray(presupuesto.manoDeObra) &&
        presupuesto.manoDeObra.length > 0) ||
      (Array.isArray(presupuesto.equipos) && presupuesto.equipos.length > 0) ||
      (Array.isArray(presupuesto.serviciosTerceros) &&
        presupuesto.serviciosTerceros.length > 0) ||
      (Array.isArray(presupuesto.costosIndirectos) &&
        presupuesto.costosIndirectos.length > 0));

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div
        className={`
          bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl
          max-w-[98vw] w-auto relative
          overflow-y-auto
        `}
        style={{
          maxHeight: "95vh",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-xl text-lg transition"
        >
          ×
        </button>

        {loading ? (
          <div className="text-center mt-10 text-gray-500 dark:text-gray-300">
            Cargando datos...
          </div>
        ) : tienePresupuesto ? (
          <div className="mt-2 flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-200">
              Presupuesto Detallado
            </h2>
            {/* 
              Envolvemos el acordeón en un overflow-x-auto para tablas anchas 
              Si tu render real es distinto, ponlo aquí con overflow-x-auto
            */}
            <div className="w-full overflow-x-auto">
              {/* 
                Aquí debería ir tu render de datos reales.
                Puedes reemplazarlo por <PresupuestoAccordion /> si quieres mock siempre.
              */}
              <PresupuestoAccordion />{" "}
              {/* temporal: quítalo si tienes datos reales */}
            </div>
          </div>
        ) : (
          <div className="mt-2 flex flex-col items-center w-full">
            <h2 className="text-xl font-bold mb-2 text-gray-700 dark:text-gray-200">
              No existe presupuesto para este proyecto.
            </h2>
            <div className="w-full overflow-x-auto">
              <PresupuestoAccordion />
            </div>
            {/* Solo muestra moneda/importar si NO hay presupuesto */}
            <div className="mt-4 w-full max-w-md">
              <label className="block mb-2 font-semibold text-gray-600 dark:text-gray-300">
                Seleccione la moneda:
              </label>
              <select
                value={monedaSeleccionada}
                onChange={(e) => setMonedaSeleccionada(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">-- Seleccione --</option>
                {monedas.map((moneda) => (
                  <option key={moneda.id} value={moneda.id}>
                    {moneda.nombre} ({moneda.simbolo})
                  </option>
                ))}
              </select>
            </div>
            {monedaSeleccionada && (
              <>
                <div className="mt-8 w-full max-w-md flex flex-col items-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                    Descargue la plantilla de presupuesto en Excel, diligénciela
                    y luego impórtela.
                  </p>
                  <form
                    onSubmit={handleImportarPresupuesto}
                    className="flex flex-col items-center w-full gap-3"
                  >
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileChange}
                      className="file:px-3 file:py-2 file:border file:rounded-lg file:bg-gray-200 file:text-gray-800 file:dark:bg-gray-700 file:dark:text-white"
                    />
                    <button
                      type="submit"
                      className="mt-3 w-full px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                    >
                      Importar Presupuesto
                    </button>
                  </form>
                </div>
                <div className="mt-6 w-full max-w-md">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Puede importar el archivo para generar el presupuesto en el
                    sistema.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalPresupuestoDetalle;
