import React, { useEffect, useState } from "react";
import { proyectoInicial } from "@/dtos/proyectoDto";
import { createProyecto, updateProyecto } from "@/services/proyectoService";
import { getEmpresas, getEmpresaById } from "@/services/empresaService";
import { useAuth } from "@/context/AuthContext";

/** Detecta si el usuario tiene rol SuperAdmin, soportando:
 * - user.rol: "SuperAdmin" o "Admin,SuperAdmin"
 * - user.roles: ["SuperAdmin", "Otro"]
 * - user.roles: [{ name: "SuperAdmin" }] / { rol: "SuperAdmin" } / { tipo: "SuperAdmin" } / { role: "SuperAdmin" }
 * - variantes "SuperAdministrador"
 */
function hasSuperAdminRole(u) {
  if (!u) return false;

  const roles = [];

  // 1) Campo único tipo string (p.ej. "Admin,SuperAdmin")
  if (typeof u.rol === "string") {
    roles.push(...u.rol.split(","));
  }
  if (typeof u.role === "string") {
    roles.push(...u.role.split(","));
  }

  // 2) Arreglo de strings u objetos
  if (Array.isArray(u.roles)) {
    for (const r of u.roles) {
      if (typeof r === "string") roles.push(r);
      else if (r) roles.push(r.name ?? r.rol ?? r.tipo ?? r.role ?? r.RoleName ?? "");
    }
  }

  // 3) (Opcional) otras colecciones que uses en tu app
  if (Array.isArray(u.perfiles)) {
    for (const r of u.perfiles) {
      if (typeof r === "string") roles.push(r);
      else if (r) roles.push(r.name ?? r.rol ?? r.tipo ?? r.role ?? "");
    }
  }

  // Normaliza y busca variantes
  const norm = roles
    .filter(Boolean)
    .map((x) => x.toString().trim().toLowerCase());

  return norm.includes("superadmin") || norm.includes("superadministrador");
}

export default function ProyectoModalForm({ visible, onClose, onSuccess, proyecto }) {
  const { user } = useAuth();

  const [form, setForm] = useState(proyectoInicial);
  const [empresas, setEmpresas] = useState([]);
  const [empresaUsuario, setEmpresaUsuario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cargandoEmpresas, setCargandoEmpresas] = useState(false);

  const isSuperAdmin = hasSuperAdminRole(user);

  // Cargar empresas (para SuperAdmin) o empresa del usuario (para no-SuperAdmin)
  useEffect(() => {
    if (!visible) return;
    let cancel = false;

    (async () => {
      setCargandoEmpresas(true);
      try {
        if (isSuperAdmin) {
          const resEmp = await getEmpresas(1, 1000, ""); // ajusta según tu API
          if (!cancel && resEmp?.data?.ok) {
            const raw = resEmp.data.contenido;
            const items = Array.isArray(raw) ? raw : (raw?.items || raw?.lista || raw?.data || []);
            setEmpresas(items);
          }
        } else if (user?.empresaId) {
          const resUsr = await getEmpresaById(user.empresaId);
          if (!cancel && resUsr?.data?.ok) setEmpresaUsuario(resUsr.data.contenido);
        }
      } finally {
        if (!cancel) setCargandoEmpresas(false);
      }
    })();

    return () => { cancel = true; };
  }, [visible, isSuperAdmin, user?.empresaId]);

  // Inicializa / resetea form
  useEffect(() => {
    if (!visible) return;

    if (proyecto?.id) {
      setForm({ ...proyecto, empresaId: proyecto.empresaId ?? "" });
    } else {
      setForm({
        ...proyectoInicial,
        empresaId: isSuperAdmin ? "" : (user?.empresaId ?? ""),
      });
    }
  }, [visible, proyecto, user, isSuperAdmin]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleClose = () => {
    setForm(proyectoInicial);
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        empresaId: isSuperAdmin
          ? (form.empresaId ? parseInt(form.empresaId, 10) : null)
          : user.empresaId, // solo mi empresa si no soy SuperAdmin
      };

      const res = form.id
        ? await updateProyecto(form.id, payload)
        : await createProyecto(payload);

      if (res?.data?.ok) {
        onSuccess?.();
        handleClose();
      } else {
        alert(res?.data?.mensaje || "Error al guardar proyecto");
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar proyecto");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
        <button
          className="absolute top-3 right-3 bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-xl text-lg shadow-sm ring-1 ring-white/20"
          onClick={handleClose}
          type="button"
        >
          ×
        </button>

        <h2 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
          {form.id ? "Editar Proyecto" : "Nuevo Proyecto"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-800 dark:text-gray-200">Nombre del Proyecto</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre || ""}
              onChange={handleChange}
              className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 outline-none border-gray-300 dark:border-gray-700"
              required
              disabled={loading}
              placeholder="Nombre del proyecto"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-800 dark:text-gray-200">Empresa</label>

            {isSuperAdmin ? (
              <select
                name="empresaId"
                value={(form.empresaId ?? "").toString()}
                onChange={(e) => setForm((prev) => ({ ...prev, empresaId: e.target.value }))}
                className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 outline-none border-gray-300 dark:border-gray-700"
                required
                disabled={loading || cargandoEmpresas}
              >
                <option value="">{cargandoEmpresas ? "Cargando..." : "-- Selecciona empresa --"}</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id?.toString?.() ?? e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={empresaUsuario?.nombre || ""}
                disabled
                className="w-full border rounded-xl px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700"
              />
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl w-full mt-2 transition disabled:opacity-60 shadow-sm"
            disabled={
              loading ||
              !form.nombre ||
              (isSuperAdmin && !form.empresaId)
            }
          >
            {loading ? "Guardando..." : "Guardar Proyecto"}
          </button>
        </form>
      </div>
    </div>
  );
}
