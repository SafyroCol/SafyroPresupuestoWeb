import React, { useState } from "react";
import DataTable from "@/components/ui/DataTable";

const mockPresupuestos = [
    {
        id: 1,
        nombre: "Presupuesto General 2025",
        proyecto: "Edificio Central",
        total: 1200000000,
        estado: "Aprobado",
    },
    {
        id: 2,
        nombre: "Presupuesto Ampliación",
        proyecto: "Sede Norte",
        total: 850000000,
        estado: "En revisión",
    },
];

export default function PresupuestoPage() {
    const [rows, setRows] = useState(mockPresupuestos);

    const handleEdit = (item) => {
        alert("Editar: " + JSON.stringify(item));
    };

    const handleDelete = (item) => {
        const confirmDelete = confirm(`¿Eliminar "${item.nombre}"?`);
        if (confirmDelete) {
            setRows(rows.filter((r) => r.id !== item.id));
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Presupuesto de la Obra</h2>
            <DataTable data={rows} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
    );
}
