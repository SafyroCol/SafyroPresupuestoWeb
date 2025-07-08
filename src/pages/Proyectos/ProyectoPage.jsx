import React, { useState } from "react";
import ProyectoModalForm from "@/components/Proyectos/ProyectoModalForm";
import ProyectoListStyled from "@/components/Proyectos/ProyectoListStyled";

export default function ProyectoPage() {
  const [proyectoEditando, setProyectoEditando] = useState(null);
  const [recargar, setRecargar] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleEditar = (proyecto) => {
    setProyectoEditando(proyecto);
    setModalVisible(true);
  };

  const handleCrear = () => {
    setProyectoEditando(null);
    setModalVisible(true);
  };

  const handleExito = () => {
    setModalVisible(false);
    setProyectoEditando(null);
    setRecargar(!recargar);
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setProyectoEditando(null);
        setModalVisible(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-6">
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Gestión de Proyectos
            </h1>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={handleCerrarModal}
            >
              Crear Proyecto
            </button>
          </div>
          <ProyectoListStyled
            onEdit={handleEditar}
            key={recargar}
          />
        </div>
      </section>
      <ProyectoModalForm
        visible={modalVisible}
        proyecto={proyectoEditando}
        onClose={handleCerrarModal}
        onSuccess={handleExito}
      />
    </div>
  );
}
