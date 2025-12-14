// src/components/Presupuestos/RubroDetalleTable.jsx
export default function RubroDetalleTable({ rubro, items, costosReales, onCargarEvidencia }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs border border-gray-300 dark:border-gray-600 mb-3 bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Ítem</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Descripción</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Presupuestado</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Real</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Evidencias</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">
              <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{item.codigo || item.id}</td>
              <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{item.descripcion || item.nombre}</td>
              <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-right">
                {item.valorPresupuestado?.toLocaleString("es-CO", { style: "currency", currency: "COP" })}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-right">
                {(costosReales.find(cr => cr.itemId === item.id)?.valorReal || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" })}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">
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
