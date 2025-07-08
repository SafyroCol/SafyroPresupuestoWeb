import React, { useState } from "react";
import { presupuestoPorRubros } from "./presupuesto-mock-data";

// Columnas por defecto para todos los rubros (excepto Resumen)
const columns = [
  { key: "ITEM", label: "Ítem" },
  { key: "CODIGO", label: "Código" },
  { key: "DESCRIPCION", label: "Descripción" },
  { key: "UNIDAD", label: "Unidad" },
  { key: "CANTIDAD", label: "Cantidad" },
  { key: "VALOR_UNITARIO", label: "Valor Unitario" },
  { key: "VALOR_TOTAL", label: "Valor Total" },
  { key: "OBSERVACIONES", label: "Observaciones" }
];
// Columnas para el resumen global
const resumenCols = [
  { key: "ETAPA", label: "Etapa/Concepto" },
  { key: "VALOR", label: "Valor" }
];

function isMobile() {
  return typeof window !== "undefined" && window.innerWidth < 768;
}

export default function PresupuestoAccordion() {
  const [open, setOpen] = useState(0); // Primer acordeón abierto por defecto

  const rubroNames = Object.keys(presupuestoPorRubros);

  return (
    <div className="w-full max-w-3xl mx-auto mt-4">
      {rubroNames.map((rubro, idx) => {
        const items = presupuestoPorRubros[rubro];
        const cols = rubro === "Resumen Global" ? resumenCols : columns;
        return (
          <div
            key={rubro}
            className="border-b border-gray-300 mb-2 bg-white rounded-2xl shadow"
          >
            <button
              className="w-full flex justify-between items-center py-4 px-6 text-lg font-bold text-left focus:outline-none"
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              <span>{rubro}</span>
              <span>{open === idx ? "▲" : "▼"}</span>
            </button>
            {open === idx && (
              <div className="px-4 pb-6">
                {isMobile() ? (
                  <div className="space-y-4">
                    {items.map((item, i) => (
                      <div
                        key={i}
                        className="bg-gray-100 rounded-xl p-4 flex flex-col gap-2"
                      >
                        {cols.map((col) => (
                          <div key={col.key} className="flex justify-between">
                            <span className="font-semibold">{col.label}:</span>
                            <span>
                              {typeof item[col.key] === "number"
                                ? item[col.key].toLocaleString("es-CO", {
                                    style: "currency",
                                    currency: "COP"
                                  })
                                : item[col.key] || ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="min-w-full table-auto text-sm border mt-2 rounded-xl">
                    <thead>
                      <tr>
                        {cols.map((col) => (
                          <th
                            key={col.key}
                            className="px-3 py-2 text-left bg-gray-200"
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr key={i} className="bg-white hover:bg-gray-50">
                          {cols.map((col) => (
                            <td key={col.key} className="px-3 py-2">
                              {typeof item[col.key] === "number"
                                ? item[col.key].toLocaleString("es-CO", {
                                    style: "currency",
                                    currency: "COP"
                                  })
                                : item[col.key] || ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
