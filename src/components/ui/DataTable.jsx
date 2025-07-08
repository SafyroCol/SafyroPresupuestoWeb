import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function DataTable({ data, onEdit, onDelete }) {
    return (
        <div className="overflow-x-auto rounded-lg shadow bg-white">
            <table className="min-w-full text-sm text-left text-gray-600">
                <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                    <tr>
                        {Object.keys(data[0] || {}).map((key) => (
                            <th key={key} className="px-4 py-3">{key}</th>
                        ))}
                        <th className="px-4 py-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                            {Object.values(row).map((val, i) => (
                                <td key={i} className="px-4 py-2">{val}</td>
                            ))}
                            <td className="px-4 py-2 flex space-x-2">
                                <button
                                    onClick={() => onEdit(row)}
                                    className="p-1 rounded hover:bg-blue-100"
                                    title="Editar"
                                >
                                    <PencilIcon className="h-5 w-5 text-blue-600" />
                                </button>
                                <button
                                    onClick={() => onDelete(row)}
                                    className="p-1 rounded hover:bg-red-100"
                                    title="Eliminar"
                                >
                                    <TrashIcon className="h-5 w-5 text-red-600" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}