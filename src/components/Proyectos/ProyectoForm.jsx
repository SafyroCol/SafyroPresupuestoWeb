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
    <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded">
      <h2 className="font-bold text-lg">
        {form.id ? "Editar Proyecto" : "Nuevo Proyecto"}
      </h2>

      <div>
        <label>Nombre del Proyecto</label>
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
      </div>

      <div>
        <label>Empresa ID</label>
        <input
          type="number"
          name="empresaId"
          value={form.empresaId}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
      </div>

      <div className="space-x-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Guardar
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded">
          Cancelar
        </button>
      </div>
    </form>
  );
}
