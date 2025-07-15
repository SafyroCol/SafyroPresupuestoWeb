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
      className={`rounded-2xl shadow p-4 ${esGlobal ? "bg-blue-50" : "bg-gray-50"} 
        transition cursor-pointer hover:bg-blue-100
        ${clickable ? "hover:shadow-lg" : ""}`}
      style={clickable ? { cursor: "pointer" } : {}}
      onClick={clickable ? () => onVerDetalle(nombre) : undefined}
      title={clickable ? "Ver detalle comparativo" : ""}
    >
      <div className="font-semibold text-gray-700">{nombre}</div>
      <div className="text-xl font-bold">
        {presupuestado.toLocaleString("es-CO", { style: "currency", currency: "COP" })}
      </div>
      <div className="text-md">
        Real: <span className="font-bold">{real.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</span>
      </div>
      <div className={`text-sm mt-1 ${utilidad ? "text-green-600" : "text-red-600"}`}>
        {utilidad ? "Utilidad:" : "Pérdida:"}{" "}
        {Math.abs(diferencia).toLocaleString("es-CO", { style: "currency", currency: "COP" })}
      </div>
    </div>
  );
}
