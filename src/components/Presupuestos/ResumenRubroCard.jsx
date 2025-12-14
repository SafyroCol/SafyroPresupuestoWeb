import { ArrowDownRight, ArrowUpRight, CheckCircle, AlertCircle } from "lucide-react";

export default function ResumenRubroCard({
  nombre,
  presupuestado,
  real = 0,
  esGlobal = false,
  onVerDetalle, // nueva prop opcional
}) {
  const diferencia = real - presupuestado;
  const utilidad = diferencia < 0;

  // Card clickable solo si NO es global y hay handler
  const clickable = !esGlobal && typeof onVerDetalle === "function";

  return (
    <div
      className={`rounded-2xl shadow p-4 
        ${esGlobal 
          ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700" 
          : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        } 
        transition cursor-pointer 
        ${esGlobal 
          ? "hover:bg-blue-100 dark:hover:bg-blue-900/40" 
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }
        ${clickable ? "hover:shadow-lg" : ""}`}
      style={clickable ? { cursor: "pointer" } : {}}
      onClick={clickable ? () => onVerDetalle(nombre) : undefined}
      title={clickable ? "Ver detalle comparativo" : ""}
    >
      <div className="font-semibold text-gray-700 dark:text-gray-200">{nombre}</div>
      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {presupuestado.toLocaleString("es-CO", { style: "currency", currency: "COP" })}
      </div>
      <div className="text-md text-gray-700 dark:text-gray-300">
        Real: <span className="font-bold text-gray-900 dark:text-gray-100">{real.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</span>
      </div>
      <div className={`text-sm mt-1 font-semibold ${utilidad ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
        {utilidad ? "Utilidad:" : "Pérdida:"}{" "}
        {Math.abs(diferencia).toLocaleString("es-CO", { style: "currency", currency: "COP" })}
      </div>
    </div>
  );
}
