import React, { useState } from "react";
import DataTable from "@/components/ui/DataTable";

const mockData = [
    { ID: 1, Nombre: "Cemento", Unidad: "kg", Costo: 1200 },
    { ID: 2, Nombre: "Arena", Unidad: "m³", Costo: 35000 },
];

export default function MaterialPresupuestoPage() {
    const [rows, setRows] = useState(mockData);

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
            <h2 className="text-xl font-semibold mb-4">Materiales del Presupuesto</h2>
            <DataTable data={rows} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
    );
}