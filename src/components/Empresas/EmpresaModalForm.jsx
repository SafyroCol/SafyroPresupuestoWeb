import React, { useEffect, useState } from "react";
import { createEmpresa, updateEmpresa } from "@/services/empresaService";

export default function EmpresaModalForm({ visible, empresa, onClose, onSuccess }) {
  const [nombre, setNombre] = useState("");
  const [dominio, setDominio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset o cargar datos cuando se abre/cambia la empresa
  useEffect(() => {
    if (empresa) {
      setNombre(empresa.nombre || "");
      setDominio(empresa.dominio || "");
    } else {
      setNombre("");
      setDominio("");
    }
    setError("");
  }, [empresa, visible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!nombre.trim() || !dominio.trim()) {
        setError("Debe completar todos los campos.");
        return;
      }
      if (empresa && empresa.id) {
        // Editar
        const res = await updateEmpresa(empresa.id, { nombre, dominio });
        if (res.data.ok) {
          onSuccess();
        } else {
          setError(res.data.mensaje || "No se pudo actualizar.");
        }
      } else {
        // Crear
        const res = await createEmpresa({ nombre, dominio });
        if (res.data.ok) {
          onSuccess();
        } else {
          setError(res.data.mensaje || "No se pudo crear la empresa.");
        }
      }
    } catch (ex) {
      setError("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md shadow-lg relative animate-fade-in"
        autoComplete="off"
      >
        <button
          type="button"
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl"
          onClick={onClose}
          disabled={loading}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">
          {empresa ? "Editar Empresa" : "Crear Empresa"}
        </h2>
        <div className="mb-3">
          <label className="block mb-1 text-sm">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
            disabled={loading}
            autoFocus
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1 text-sm">Dominio</label>
          <input
            value={dominio}
            onChange={(e) => setDominio(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
            disabled={loading}
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm mb-2">{error}</div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading
              ? empresa
                ? "Actualizando..."
                : "Creando..."
              : empresa
              ? "Actualizar"
              : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}
