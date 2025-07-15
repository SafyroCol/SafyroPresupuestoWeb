import React, { useEffect, useState } from "react";
import { proyectoInicial } from "@/dtos/proyectoDto";
import { createProyecto, updateProyecto } from "@/services/proyectoService";
import { getEmpresas, getEmpresaById } from "@/services/empresaService";
import { useAuth } from "@/context/AuthContext";

// ProyectoModalForm.jsx
export default function ProyectoModalForm({ visible, onClose, onSuccess, proyecto }) {
  const { usuario } = useAuth();
  const [form, setForm] = useState(proyectoInicial);
  const [empresas, setEmpresas] = useState([]);
  const [empresaUsuario, setEmpresaUsuario] = useState(null);
  const [loading, setLoading] = useState(false);

  // Si usuario aún no está disponible, no renderizar nada (o puedes poner un loader)
  if (!visible || !usuario) return null;

  useEffect(() => {
    if (!visible || !usuario) return;
    if (usuario.rol === "SuperAdmin") {
      getEmpresas().then(res => {
        if (res.data.ok) setEmpresas(res.data.contenido);
      });
    } else if (usuario.empresaId) {
      getEmpresaById(usuario.empresaId).then(res => {
        if (res.data.ok) setEmpresaUsuario(res.data.contenido);
      });
    }
  }, [usuario, visible]);

  useEffect(() => {
    if (!visible || !usuario) return;
    if (proyecto) {
      setForm(proyecto);
    } else {
      setForm({
        ...proyectoInicial,
        empresaId: usuario.rol === "SuperAdmin" ? "" : usuario.empresaId,
      });
    }
  }, [proyecto, usuario, visible]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      empresaId:
        usuario.rol === "SuperAdmin"
          ? parseInt(form.empresaId)
          : usuario.empresaId,
    };

    const res = form.id
      ? await updateProyecto(form.id, payload)
      : await createProyecto(payload);

    setLoading(false);

    if (res.data.ok) {
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } else {
      alert("Error al guardar proyecto");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      style={{ animation: "fadeIn .2s" }}
    >
      <div className="relative bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <button
          className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-xl text-lg"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">
          {form.id ? "Editar Proyecto" : "Nuevo Proyecto"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-semibold mb-1">Nombre del Proyecto</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre || ""}
              onChange={handleChange}
              className="w-full border rounded-xl px-3 py-2"
              required
              disabled={loading}
              placeholder="Nombre del proyecto"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Empresa</label>
            {usuario.rol === "SuperAdmin" ? (
              <select
                name="empresaId"
                value={form.empresaId || ""}
                onChange={handleChange}
                className="w-full border rounded-xl px-3 py-2"
                required
                disabled={loading}
              >
                <option value="">-- Selecciona empresa --</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={empresaUsuario?.nombre || ""}
                disabled
                className="w-full border rounded-xl px-3 py-2 bg-gray-100"
              />
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl w-full mt-2 transition disabled:opacity-60"
            disabled={loading || (!form.nombre || (!form.empresaId && usuario.rol === "SuperAdmin"))}
          >
            {loading ? "Guardando..." : "Guardar Proyecto"}
          </button>
        </form>
      </div>
    </div>
  );
}
