// src/pages/EquipoPresupuestoPage.jsx
import React, { useState } from "react";
import DataTable from "@/components/ui/DataTable";

const mockEquipos = [
    {
        id: 1,
        nombre: "Excavadora",
        horasUso: 100,
        costoHora: 150000,
    },
    {
        id: 2,
        nombre: "Grua Torre",
        horasUso: 200,
        costoHora: 200000,
    },
];

export default function EquipoPresupuestoPage() {
    const [rows, setRows] = useState(mockEquipos);

    const handleEdit = (item) => {
        alert("Editar: " + JSON.stringify(item));
    };

    const handleDelete = (item) => {
        const confirmDelete = confirm(`¿Eliminar "${item.Nombre}"?`);
        if (confirmDelete) {
            setRows(rows.filter((r) => r.ID !== item.ID));
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Equipos del Presupuesto</h2>
            <DataTable data={rows} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
    );
}