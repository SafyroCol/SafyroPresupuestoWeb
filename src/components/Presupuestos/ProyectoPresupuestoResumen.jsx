import { useState } from "react";
import ResumenRubroCard from "./ResumenRubroCard";
import PresupuestoTabs from "./PresupuestoTabs";
import DetalleComparativoRubro from "./DetalleComparativoRubro";
import toast from "react-hot-toast";
import api from "@/utils/api";

const rubros = [
  { key: "costoMateriales", keyReal: "costoRealMateriales", label: "Materiales" },
  { key: "costoManoObra", keyReal: "costoRealManoObra", label: "Mano de Obra" },
  { key: "costoDepreciacion", keyReal: "costoRealEquipos", label: "Equipos" },
  { key: "costoOtros", keyReal: "costoRealServiciosTerceros", label: "Servicios a Terceros" },
  { key: "costoIndirectos", keyReal: "costoRealCostosIndirectos", label: "Costos Indirectos" },
];

export default function ProyectoPresupuestoResumen({
  presupuesto,
  onCargarEvidencia,
}) {
  const [detalleRubro, setDetalleRubro] = useState(null);

  // Suma total presupuestado y real
  const totalPres = rubros.reduce((a, r) => a + (Number(presupuesto[r.key]) || 0), 0);
  const totalReal = rubros.reduce((a, r) => a + (Number(presupuesto[r.keyReal]) || 0), 0);

  if (detalleRubro) {
    const rubroObj = rubros.find((r) => r.label === detalleRubro);
    return (
      <DetalleComparativoRubro
        open={true}
        rubro={rubroObj}
        presupuesto={presupuesto}
        onClose={() => setDetalleRubro(null)}
        onCargarEvidencia={onCargarEvidencia}
      />
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Resumen Financiero del Proyecto
      </h2>
      {/* Cards de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {rubros.map((r) => (
          <ResumenRubroCard
            key={r.key}
            nombre={r.label}
            presupuestado={Number(presupuesto[r.key]) || 0}
            real={Number(presupuesto[r.keyReal]) || 0}
            onVerDetalle={() => setDetalleRubro(r.label)}
          />
        ))}
        <ResumenRubroCard
          nombre="Global"
          presupuestado={totalPres}
          real={totalReal}
          esGlobal
        />
      </div>

      {/* Tabs con tablas y módulos de carga */}
      <PresupuestoTabs
        rubros={rubros}
        presupuesto={presupuesto}
        onCargarEvidencia={onCargarEvidencia}
      />
    </div>
  );
}
