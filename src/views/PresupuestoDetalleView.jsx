import React, { useState } from "react";

const tabs = [
    "Resumen",
    "Materiales",
    "Mano de Obra",
    "Equipos",
    "Servicios de Terceros",
    "Costos Indirectos"
];



const PresupuestoDetalleView = () => {

    const getTotales = () => {
        const sum = (items, key) => items.reduce((acc, item) => acc + (item[key] || 0), 0);

        return {
            materiales: {
                presupuestado: sum(materiales, "costoPresupuestado"),
                real: sum(materiales, "costoReal"),
            },
            manoObra: {
                presupuestado: sum(manoDeObra , "costoPresupuestado"),
                real: sum(manoDeObra , "costoReal"),
            },
            equipos: {
                presupuestado: sum(equipos, "costoPresupuestado"),
                real: sum(equipos, "costoReal"),
            },
            terceros: {
                presupuestado: sum(serviciosTerceros, "costoPresupuestado"),
                real: sum(serviciosTerceros, "costoReal"),
            },
            indirectos: {
                presupuestado: sum(costosIndirectos, "costoPresupuestado"),
                real: sum(costosIndirectos, "costoReal"),
            },
        };
    };

    const [activeTab, setActiveTab] = useState("Resumen");

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };
    const [materiales, setMateriales] = useState([
        { descripcion: "Tubería PVC 4\"", cantidad: 120, unidad: "m", costoPresupuestado: 1500, costoReal: 0 },
        { descripcion: "Cemento tipo UG", cantidad: 30, unidad: "saco", costoPresupuestado: 600, costoReal: 0 },
        { descripcion: "Arena lavada", cantidad: 15, unidad: "m3", costoPresupuestado: 300, costoReal: 0 },
    ]);

    const handleCostoRealChange = (index, value) => {
        const updated = [...materiales];
        updated[index].costoReal = value;
        setMateriales(updated);
    };
    const [manoDeObra, setManoDeObra] = useState([
        { descripcion: "Albañil", cantidad: 15, unidad: "días", costoPresupuestado: 1500, costoReal: 0 },
        { descripcion: "Ayudante", cantidad: 10, unidad: "días", costoPresupuestado: 800, costoReal: 0 },
        { descripcion: "Transporte personal", cantidad: 5, unidad: "viajes", costoPresupuestado: 400, costoReal: 0 },
    ]);

    const handleCostoRealManoObraChange = (index, value) => {
        const updated = [...manoDeObra];
        updated[index].costoReal = value;
        setManoDeObra(updated);
    };
    const [equipos, setEquipos] = useState([
        { descripcion: "Excavadora", cantidad: 3, unidad: "días", costoPresupuestado: 2400, costoReal: 0 },
        { descripcion: "Camión Volco", cantidad: 2, unidad: "días", costoPresupuestado: 1200, costoReal: 0 },
        { descripcion: "Generador", cantidad: 5, unidad: "días", costoPresupuestado: 1500, costoReal: 0 },
    ]);

    const handleCostoRealEquipoChange = (index, value) => {
        const updated = [...equipos];
        updated[index].costoReal = value;
        setEquipos(updated);
    };

    const [serviciosTerceros, setServiciosTerceros] = useState([
        { descripcion: "Diseño estructural", cantidad: 1, unidad: "servicio", costoPresupuestado: 5000, costoReal: 0 },
        { descripcion: "Consultoría ambiental", cantidad: 1, unidad: "servicio", costoPresupuestado: 3000, costoReal: 0 },
        { descripcion: "Supervisión técnica", cantidad: 2, unidad: "meses", costoPresupuestado: 4000, costoReal: 0 },
    ]);

    const handleCostoRealServicioChange = (index, value) => {
        const updated = [...serviciosTerceros];
        updated[index].costoReal = value;
        setServiciosTerceros(updated);
    };

    const [costosIndirectos, setCostosIndirectos] = useState([
        { descripcion: "Administración del proyecto", cantidad: 1, unidad: "mes", costoPresupuestado: 2500, costoReal: 0 },
        { descripcion: "Exámenes médicos", cantidad: 10, unidad: "persona", costoPresupuestado: 800, costoReal: 0 },
        { descripcion: "Capacitaciones obligatorias", cantidad: 5, unidad: "curso", costoPresupuestado: 1500, costoReal: 0 },
    ]);

    const handleCostoRealIndirectoChange = (index, value) => {
        const updated = [...costosIndirectos];
        updated[index].costoReal = value;
        setCostosIndirectos(updated);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Detalle del Presupuesto</h1>

            <div className="flex space-x-4 border-b mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabClick(tab)}
                        className={`px-4 py-2 font-medium ${activeTab === tab
                            ? "border-b-4 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-blue-600"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="bg-white shadow rounded p-4">

                {activeTab === "Resumen" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Resumen Comparativo Global</h2>
                        <table className="min-w-full table-auto border border-gray-300 text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-4 py-2">Rubro</th>
                                    <th className="border px-4 py-2">Presupuestado</th>
                                    <th className="border px-4 py-2">Real</th>
                                    <th className="border px-4 py-2">Diferencia</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(getTotales()).map(([rubro, { presupuestado, real }]) => (
                                    <tr key={rubro}>
                                        <td className="border px-4 py-2 capitalize">{rubro}</td>
                                        <td className="border px-4 py-2 text-right text-green-700">${presupuestado.toFixed(2)}</td>
                                        <td className="border px-4 py-2 text-right text-blue-700">${real.toFixed(2)}</td>
                                        <td className={`border px-4 py-2 text-right font-bold ${real > presupuestado ? 'text-red-600' : 'text-gray-800'}`}>
                                            ${(real - presupuestado).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-200 font-semibold">
                                    <td className="border px-4 py-2">Total</td>
                                    <td className="border px-4 py-2 text-right">${Object.values(getTotales()).reduce((acc, v) => acc + v.presupuestado, 0).toFixed(2)}</td>
                                    <td className="border px-4 py-2 text-right">${Object.values(getTotales()).reduce((acc, v) => acc + v.real, 0).toFixed(2)}</td>
                                    <td className="border px-4 py-2 text-right">${Object.values(getTotales()).reduce((acc, v) => acc + (v.real - v.presupuestado), 0).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === "Materiales" && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Materiales</h2>

                        <div className="overflow-auto">
                            <table className="min-w-full table-auto border-collapse border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-4 py-2">Descripción</th>
                                        <th className="border px-4 py-2">Cantidad</th>
                                        <th className="border px-4 py-2">Unidad</th>
                                        <th className="border px-4 py-2">Costo Presupuestado</th>
                                        <th className="border px-4 py-2">Costo Real</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materiales.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="border px-4 py-2">{item.descripcion}</td>
                                            <td className="border px-4 py-2 text-center">{item.cantidad}</td>
                                            <td className="border px-4 py-2 text-center">{item.unidad}</td>
                                            <td className="border px-4 py-2 text-right">${item.costoPresupuestado.toFixed(2)}</td>
                                            <td className="border px-4 py-2">
                                                <input
                                                    type="number"
                                                    className="w-full border px-2 py-1 rounded"
                                                    value={item.costoReal || ""}
                                                    onChange={(e) =>
                                                        handleCostoRealChange(index, parseFloat(e.target.value) || 0)
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-4 flex justify-end space-x-8 text-sm md:text-base">
                                <div className="text-right">
                                    <p className="font-semibold">Total Presupuestado:</p>
                                    <p className="text-green-600 font-bold">
                                        ${materiales.reduce((acc, item) => acc + item.costoPresupuestado, 0).toFixed(2)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">Total Real:</p>
                                    <p className="text-blue-600 font-bold">
                                        ${materiales.reduce((acc, item) => acc + (item.costoReal || 0), 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={guardarCostosRealesMateriales}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Guardar Costos Reales
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "ManoDeObra" && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Mano de Obra</h2>
                        <div className="overflow-auto">
                            <table className="min-w-full table-auto border-collapse border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-4 py-2">Descripción</th>
                                        <th className="border px-4 py-2">Cantidad</th>
                                        <th className="border px-4 py-2">Unidad</th>
                                        <th className="border px-4 py-2">Costo Presupuestado</th>
                                        <th className="border px-4 py-2">Costo Real</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {manoDeObra.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="border px-4 py-2">{item.descripcion}</td>
                                            <td className="border px-4 py-2 text-center">{item.cantidad}</td>
                                            <td className="border px-4 py-2 text-center">{item.unidad}</td>
                                            <td className="border px-4 py-2 text-right">${item.costoPresupuestado.toFixed(2)}</td>
                                            <td className="border px-4 py-2">
                                                <input
                                                    type="number"
                                                    className="w-full border px-2 py-1 rounded"
                                                    value={item.costoReal || ""}
                                                    onChange={(e) =>
                                                        handleCostoRealManoObraChange(index, parseFloat(e.target.value) || 0)
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-end space-x-8 text-sm md:text-base">
                            <div className="text-right">
                                <p className="font-semibold">Total Presupuestado:</p>
                                <p className="text-green-600 font-bold">
                                    ${manoDeObra.reduce((acc, item) => acc + item.costoPresupuestado, 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">Total Real:</p>
                                <p className="text-blue-600 font-bold">
                                    ${manoDeObra.reduce((acc, item) => acc + (item.costoReal || 0), 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "Equipos" && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Equipos</h2>
                        <div className="overflow-auto">
                            <table className="min-w-full table-auto border-collapse border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-4 py-2">Descripción</th>
                                        <th className="border px-4 py-2">Cantidad</th>
                                        <th className="border px-4 py-2">Unidad</th>
                                        <th className="border px-4 py-2">Costo Presupuestado</th>
                                        <th className="border px-4 py-2">Costo Real</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipos.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="border px-4 py-2">{item.descripcion}</td>
                                            <td className="border px-4 py-2 text-center">{item.cantidad}</td>
                                            <td className="border px-4 py-2 text-center">{item.unidad}</td>
                                            <td className="border px-4 py-2 text-right">${item.costoPresupuestado.toFixed(2)}</td>
                                            <td className="border px-4 py-2">
                                                <input
                                                    type="number"
                                                    className="w-full border px-2 py-1 rounded"
                                                    value={item.costoReal || ""}
                                                    onChange={(e) =>
                                                        handleCostoRealEquipoChange(index, parseFloat(e.target.value) || 0)
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-end space-x-8 text-sm md:text-base">
                            <div className="text-right">
                                <p className="font-semibold">Total Presupuestado:</p>
                                <p className="text-green-600 font-bold">
                                    ${equipos.reduce((acc, item) => acc + item.costoPresupuestado, 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">Total Real:</p>
                                <p className="text-blue-600 font-bold">
                                    ${equipos.reduce((acc, item) => acc + (item.costoReal || 0), 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "Servicios de Terceros" && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Servicios de Terceros</h2>
                        <div className="overflow-auto">
                            <table className="min-w-full table-auto border-collapse border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-4 py-2">Descripción</th>
                                        <th className="border px-4 py-2">Cantidad</th>
                                        <th className="border px-4 py-2">Unidad</th>
                                        <th className="border px-4 py-2">Costo Presupuestado</th>
                                        <th className="border px-4 py-2">Costo Real</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serviciosTerceros.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="border px-4 py-2">{item.descripcion}</td>
                                            <td className="border px-4 py-2 text-center">{item.cantidad}</td>
                                            <td className="border px-4 py-2 text-center">{item.unidad}</td>
                                            <td className="border px-4 py-2 text-right">${item.costoPresupuestado.toFixed(2)}</td>
                                            <td className="border px-4 py-2">
                                                <input
                                                    type="number"
                                                    className="w-full border px-2 py-1 rounded"
                                                    value={item.costoReal || ""}
                                                    onChange={(e) =>
                                                        handleCostoRealServicioChange(index, parseFloat(e.target.value) || 0)
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-end space-x-8 text-sm md:text-base">
                            <div className="text-right">
                                <p className="font-semibold">Total Presupuestado:</p>
                                <p className="text-green-600 font-bold">
                                    ${serviciosTerceros.reduce((acc, item) => acc + item.costoPresupuestado, 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">Total Real:</p>
                                <p className="text-blue-600 font-bold">
                                    ${serviciosTerceros.reduce((acc, item) => acc + (item.costoReal || 0), 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "Costos Indirectos" && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Costos Indirectos</h2>
                        <div className="overflow-auto">
                            <table className="min-w-full table-auto border-collapse border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-4 py-2">Descripción</th>
                                        <th className="border px-4 py-2">Cantidad</th>
                                        <th className="border px-4 py-2">Unidad</th>
                                        <th className="border px-4 py-2">Costo Presupuestado</th>
                                        <th className="border px-4 py-2">Costo Real</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {costosIndirectos.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="border px-4 py-2">{item.descripcion}</td>
                                            <td className="border px-4 py-2 text-center">{item.cantidad}</td>
                                            <td className="border px-4 py-2 text-center">{item.unidad}</td>
                                            <td className="border px-4 py-2 text-right">${item.costoPresupuestado.toFixed(2)}</td>
                                            <td className="border px-4 py-2">
                                                <input
                                                    type="number"
                                                    className="w-full border px-2 py-1 rounded"
                                                    value={item.costoReal || ""}
                                                    onChange={(e) =>
                                                        handleCostoRealIndirectoChange(index, parseFloat(e.target.value) || 0)
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-end space-x-8 text-sm md:text-base">
                            <div className="text-right">
                                <p className="font-semibold">Total Presupuestado:</p>
                                <p className="text-green-600 font-bold">
                                    ${costosIndirectos.reduce((acc, item) => acc + item.costoPresupuestado, 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">Total Real:</p>
                                <p className="text-blue-600 font-bold">
                                    ${costosIndirectos.reduce((acc, item) => acc + (item.costoReal || 0), 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};


const guardarCostosRealesMateriales = async () => {
    const presupuestoId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"; // reemplaza con el ID real

    const data = materiales.map((item, index) => ({
        materialPresupuestoId: item.materialPresupuestoId ?? `00000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
        costoReal: item.costoReal,
    }));

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/material/costos-reales`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "EmpresaId": "tu-empresa-id", // si lo usas en headers
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                presupuestoId,
                materiales: data
            }),
        });

        const result = await response.json();
        if (result.ok) {
            alert("Costos reales guardados correctamente.");
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Error al guardar costos reales:", error);
        alert("Ocurrió un error al guardar.");
    }
};

export default PresupuestoDetalleView;
