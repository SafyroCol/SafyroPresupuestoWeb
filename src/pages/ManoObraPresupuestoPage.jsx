// src/pages/ManoObraPresupuestoPage.jsx
import React, { useState } from "react";
import DataTable from "@/components/ui/DataTable";

const mockManoObra = [
    {
        id: 1,
        rol: "Albañil",
        horas: 160,
        tarifaHora: 25000,
    },
    {
        id: 2,
        rol: "Ingeniero Civil",
        horas: 80,
        tarifaHora: 60000,
    },
];

export default function ManoObraPresupuestoPage() {
    const [rows, setRows] = useState(mockManoObra);

    const handleEdit = (item) => {
        alert("Editar: " + JSON.stringify(item));
    };

    const handleDelete = (item) => {
        const confirmDelete = confirm(`¿Eliminar "${item.rol}"?`);
        if (confirmDelete) {
            setRows(rows.filter((r) => r.ID !== item.ID));
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Mano de Obra del Presupuesto</h2>
            <DataTable data={rows} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
    );
}
