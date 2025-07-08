import React, { useState } from "react";
import * as XLSX from "xlsx";
import { createPresupuesto } from "@/api/presupuestoApi"; // Asegúrate de tener esta API

const CrearPresupuestoForm = ({ proyectos, empresas }) => {
    const [file, setFile] = useState(null);
    const [empresaId, setEmpresaId] = useState("");
    const [proyectoId, setProyectoId] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file || !empresaId || !proyectoId) {
            alert("Todos los campos son obligatorios");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

            const payload = {
                empresaId,
                proyectoId,
                usuarioId: localStorage.getItem("usuarioId"),
                datosPresupuesto: json
            };

            try {
                const response = await createPresupuesto(payload);
                alert("Presupuesto importado exitosamente.");
            } catch (err) {
                console.error(err);
                alert("Error al importar el presupuesto.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Importar Presupuesto desde Excel</h2>

            <div className="mb-3">
                <label className="block mb-1">Empresa</label>
                <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} className="w-full border p-2 rounded">
                    <option value="">Seleccione</option>
                    {empresas.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="block mb-1">Proyecto</label>
                <select value={proyectoId} onChange={(e) => setProyectoId(e.target.value)} className="w-full border p-2 rounded">
                    <option value="">Seleccione</option>
                    {proyectos.map(proj => (
                        <option key={proj.id} value={proj.id}>{proj.nombre}</option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="block mb-1">Archivo Excel</label>
                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="w-full" />
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Importar</button>
        </form>
    );
};

export default CrearPresupuestoForm;