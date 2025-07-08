import React, { useEffect, useState } from "react";
import { proyectoInicial } from "@/dtos/proyectoDto";
import { createProyecto, updateProyecto } from "@/services/proyectoService";
import { getEmpresas, getEmpresaById } from "@/services/empresaService";
import { useAuth } from "@/context/AuthContext"; // ← usar el contexto

export default function ProyectoModalForm({ proyecto, visible, onClose, onSuccess }) {
  const { usuario } = useAuth(); // ← usuario autenticado del contexto
  const [form, setForm] = useState(proyectoInicial);
  const [empresas, setEmpresas] = useState([]);
  const [empresaUsuario, setEmpresaUsuario] = useState(null);

  // Obtener empresas (si es SuperAdmin)
  useEffect(() => {
    if (usuario?.rol === "SuperAdmin") {
      getEmpresas().then((res) => {
        if (res.data.ok) setEmpresas(res.data.contenido);
      });
    } else if (usuario?.empresaId) {
      getEmpresaById(usuario.empresaId).then((res) => {
        if (res.data.ok) setEmpresaUsuario(res.data.contenido);
      });
    }
  }, [usuario]);

  useEffect(() => {
    if (proyecto) {
      setForm(proyecto);
    } else if (usuario) {
      setForm({
        ...proyectoInicial,
        empresaId: usuario.rol === "SuperAdmin" ? 0 : usuario.empresaId,
      });
    }
  }, [proyecto, usuario]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    if (res.data.ok) {
      onSuccess();
      onClose();
    } else {
      alert("Error al guardar proyecto");
    }
  };

  if (!visible || !usuario) return null;

  // ... tu mismo render JSX (igual que antes)
}
