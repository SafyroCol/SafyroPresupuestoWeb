import React, { useState } from 'react';

const MaterialRealPresupuestoView = ({ materialesPresupuestados, onSave }) => {
    const [materialesReales, setMaterialesReales] = useState(
        materialesPresupuestados.map((item) => ({
            materialPresupuestoId: item.id,
            nombre: item.nombre,
            cantidadPresupuestada: item.cantidad,
            costoUnitarioPresupuestado: item.costoUnitario,
            cantidadReal: '',
            costoUnitarioReal: '',
        }))
    );

    const handleChange = (index, field, value) => {
        const updated = [...materialesReales];
        updated[index][field] = value;
        setMaterialesReales(updated);
    };

    const handleSubmit = () => {
        const payload = materialesReales.map((item) => ({
            materialPresupuestoId: item.materialPresupuestoId,
            cantidadReal: parseFloat(item.cantidadReal),
            costoUnitarioReal: parseFloat(item.costoUnitarioReal),
        }));

        onSave(payload); // se llama a la función del padre para guardar en backend
    };

    return (
        <div className="p-6 bg-white shadow rounded-md">
            <h2 className="text-2xl font-semibold mb-4">Costos Reales - Materiales</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Material</th>
                            <th className="border p-2">Cantidad Presup.</th>
                            <th className="border p-2">Costo Unit. Presup.</th>
                            <th className="border p-2">Cantidad Real</th>
                            <th className="border p-2">Costo Unit. Real</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materialesReales.map((item, idx) => (
                            <tr key={idx}>
                                <td className="border p-2">{item.nombre}</td>
                                <td className="border p-2 text-center">{item.cantidadPresupuestada}</td>
                                <td className="border p-2 text-center">${item.costoUnitarioPresupuestado.toFixed(2)}</td>
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={item.cantidadReal}
                                        onChange={(e) => handleChange(idx, 'cantidadReal', e.target.value)}
                                        className="w-full border px-2 py-1 rounded"
                                    />
                                </td>
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={item.costoUnitarioReal}
                                        onChange={(e) => handleChange(idx, 'costoUnitarioReal', e.target.value)}
                                        className="w-full border px-2 py-1 rounded"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button
                onClick={handleSubmit}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Guardar Costos Reales
            </button>
        </div>
    );
};

export default MaterialRealPresupuestoView;
