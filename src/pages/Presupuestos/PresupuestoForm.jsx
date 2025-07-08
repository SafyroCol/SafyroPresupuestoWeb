import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPresupuestoById, createPresupuesto, updatePresupuesto } from "@/services/presupuestoService";
import { getEmpresas } from "@/services/empresaService";
import { useAuth } from "@/context/AuthContext"; // <-- Asegúrate de tener un contexto que exponga el usuario autenticado

export default function PresupuestoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Asume que user = { empresaId, roles: ["SuperAdmin", ...] }

  const [form, setForm] = useState({ nombre: "", empresaId: "" });
  const [empresas, setEmpresas] = useState([]);
  const [error, setError] = useState("");

  const esSuperAdmin = user?.roles?.includes("SuperAdmin");

  useEffect(() => {
    if (id) {
      getPresupuestoById(id).then(({ data }) => setForm(data));
    } else if (!esSuperAdmin) {
      // Asignar empresa directamente si NO es SuperAdmin
      setForm(prev => ({ ...prev, empresaId: user.empresaId }));
    }
  }, [id, esSuperAdmin, user]);

  useEffect(() => {
    if (esSuperAdmin) {
      getEmpresas().then(({ data }) => setEmpresas(data));
    }
  }, [esSuperAdmin]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updatePresupuesto(id, form);
      } else {
        await createPresupuesto(form);
      }
      navigate("/presupuestos");
    } catch (err) {
      setError("Error al guardar el presupuesto.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{id ? "Editar" : "Nuevo"} Presupuesto</h1>
      {error && <p className="text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {esSuperAdmin ? (
          <div>
            <label className="block mb-1">Empresa</label>
            <select
              name="empresaId"
              value={form.empresaId}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Seleccione una empresa</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <input type="hidden" name="empresaId" value={form.empresaId} />
        )}

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Guardar
        </button>
      </form>
    </div>
  );
}
