import React, { useState, useEffect } from "react";
import { proyectoInicial } from "@/dtos/proyectoDto";
import {
  createProyecto,
  updateProyecto,
} from "@/services/proyectoService";

export default function ProyectoForm({ proyectoActual, onSuccess, onCancel }) {
  const [form, setForm] = useState(proyectoInicial);

  useEffect(() => {
    if (proyectoActual) setForm(proyectoActual);
  }, [proyectoActual]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const accion = form.id
      ? await updateProyecto(form.id, form)
      : await createProyecto(form);

    if (accion.data.ok) {
      onSuccess();
    } else {
      alert("Error al guardar el proyecto");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-gray-300 dark:border-gray-600 p-4 rounded bg-white dark:bg-gray-800">
      <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
        {form.id ? "Editar Proyecto" : "Nuevo Proyecto"}
      </h2>

      <div>
        <label className="text-gray-700 dark:text-gray-300">Nombre del Proyecto</label>
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required
        />
      </div>

      <div>
        <label className="text-gray-700 dark:text-gray-300">Empresa ID</label>
        <input
          type="number"
          name="empresaId"
          value={form.empresaId}
          onChange={handleChange}
          className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required
        />
      </div>

      <div className="space-x-2">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded transition">
          Guardar
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 px-4 py-2 rounded transition">
          Cancelar
        </button>
      </div>
    </form>
  );
}
