import React, { useState } from "react";
import EmpresaModalForm from "@/components/Empresas/EmpresaModalForm";
import EmpresaListStyled from "@/components/Empresas/EmpresaListStyled";

export default function EmpresaPage() {
  const [empresaEditando, setEmpresaEditando] = useState(null);
  const [recargar, setRecargar] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleEditar = (empresa) => {
    setEmpresaEditando(empresa);
    setModalVisible(true);
  };

  const handleCrear = () => {
    setEmpresaEditando(null);
    setModalVisible(true);
  };

  const handleExito = () => {
    setModalVisible(false);
    setEmpresaEditando(null);
    setRecargar(!recargar); // fuerza recarga de la lista
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-6">
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Gestión de Empresas
            </h1>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={handleCrear}
            >
              Crear Empresa
            </button>
          </div>
          <EmpresaListStyled
            onEdit={handleEditar}
            key={recargar}
          />
        </div>
      </section>
      <EmpresaModalForm
        visible={modalVisible}
        empresa={empresaEditando}
        onClose={() => setModalVisible(false)}
        onSuccess={handleExito}
      />
    </div>
  );
}
