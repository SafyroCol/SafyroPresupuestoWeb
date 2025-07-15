// src/components/Presupuestos/RubroDetalleTable.jsx
export default function RubroDetalleTable({ rubro, items, costosReales, onCargarEvidencia }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs border mb-3">
        <thead>
          <tr>
            <th className="px-2 py-1 border">Ítem</th>
            <th className="px-2 py-1 border">Descripción</th>
            <th className="px-2 py-1 border">Presupuestado</th>
            <th className="px-2 py-1 border">Real</th>
            <th className="px-2 py-1 border">Evidencias</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id || idx}>
              <td className="border px-2 py-1">{item.codigo || item.id}</td>
              <td className="border px-2 py-1">{item.descripcion || item.nombre}</td>
              <td className="border px-2 py-1 text-right">
                {item.valorPresupuestado?.toLocaleString("es-CO", { style: "currency", currency: "COP" })}
              </td>
              <td className="border px-2 py-1 text-right">
                {(costosReales.find(cr => cr.itemId === item.id)?.valorReal || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" })}
              </td>
              <td className="border px-2 py-1">
                {/* Aquí puedes integrar EvidenciaUploader o galería */}
                {/* <EvidenciaUploader itemId={item.id} onUploaded={onCargarEvidencia} /> */}
                {/* Lista de evidencias por item */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
