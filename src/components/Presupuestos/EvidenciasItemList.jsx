import { useState } from "react";

export default function EvidenciasItemList({ evidencias = [], onNuevaEvidencia }) {
  const [preview, setPreview] = useState(null);

  // Para ver imagen/pdf en grande
  const handleVer = (evi) => setPreview(evi);
  const cerrarPreview = () => setPreview(null);

  return (
    <div>
      <div className="flex flex-col gap-4">
        {evidencias.length === 0 && (
          <div className="text-sm text-gray-400">Sin evidencias cargadas</div>
        )}
        {evidencias.map((evi) => (
          <div
            key={evi.id}
            className="bg-white shadow-md rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition hover:shadow-lg"
          >
            {/* Miniatura */}
            <div className="flex-shrink-0 flex items-center justify-center">
              {evi.tipoArchivo?.includes("pdf") ? (
                <button
                  className="text-red-500 text-4xl sm:text-2xl focus:outline-none"
                  title="Ver PDF"
                  onClick={() => handleVer(evi)}
                >📄</button>
              ) : evi.tipoArchivo?.includes("image") ? (
                <img
                  src={evi.urlArchivo}
                  alt={evi.nombreArchivo}
                  className="w-20 h-20 sm:w-14 sm:h-14 object-cover rounded shadow cursor-pointer border border-gray-200"
                  onClick={() => handleVer(evi)}
                  title="Ver imagen"
                />
              ) : (
                <span className="text-gray-500 text-3xl sm:text-xl">📎</span>
              )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{evi.nombreArchivo}</div>
              <div className="text-xs text-gray-500 flex gap-2 flex-wrap">
                {evi.valorSoportado && (
                  <span>
                    Soporte:{" "}
                    <span className="font-semibold">
                      {evi.valorSoportado.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      })}
                    </span>
                  </span>
                )}
                {evi.fechaCarga && (
                  <span>
                    {new Date(evi.fechaCarga).toLocaleDateString("es-CO")}
                  </span>
                )}
              </div>
            </div>
            {/* Acciones */}
            <div className="flex gap-2 mt-2 sm:mt-0">
              <a
                href={evi.urlArchivo}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-medium"
                download
              >
                Descargar
              </a>
              {evi.tipoArchivo?.includes("pdf") && (
                <button
                  className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded text-xs"
                  onClick={() => handleVer(evi)}
                >
                  Ver PDF
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Preview */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="relative bg-white rounded-xl shadow-lg p-3 w-full max-w-xl max-h-[90vh] overflow-auto">
            <button
              className="absolute top-2 right-2 bg-red-600 text-white rounded px-2 py-1"
              onClick={cerrarPreview}
            >
              Cerrar
            </button>
            {preview.tipoArchivo?.includes("pdf") ? (
              <iframe
                src={preview.urlArchivo}
                title="PDF"
                className="w-full h-[70vh] border rounded"
              />
            ) : (
              <img
                src={preview.urlArchivo}
                alt={preview.nombreArchivo}
                className="w-full h-auto max-h-[70vh] object-contain rounded"
              />
            )}
          </div>
        </div>
      )}

      {/* Subida de evidencias */}
      {onNuevaEvidencia && (
        <div className="mt-4">
          <SubirEvidenciaItem onUpload={onNuevaEvidencia} />
        </div>
      )}
    </div>
  );
}
