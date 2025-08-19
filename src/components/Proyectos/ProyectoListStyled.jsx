import React, { useEffect, useState } from "react";
import { getProyectos, deleteProyecto } from "@/services/proyectoService";
import {
  LayoutGrid,
  Table,
  Pencil,
  Trash2,
  FileDown,
} from "lucide-react";
import ProyectoModalForm from "@/components/Proyectos/ProyectoModalForm";
import ModalPresupuestoDetalle from "@/components/Presupuestos/ModalPresupuestoDetalle";

export default function ProyectoListStyled() {
  const [modalVisible, setModalVisible] = useState(false);
  const [proyectoEditando, setProyectoEditando] = useState(null);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("cards");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  // Cargar proyectos
  const cargarProyectos = async () => {
    const res = await getProyectos(page, pageSize, search);
    if (res.data.ok) {
      setProyectos(res.data.contenido);
      setFiltered(res.data.contenido);
      setTotal(res.data.total);
    }
  };

  useEffect(() => {
    cargarProyectos();
    // eslint-disable-next-line
  }, [page, search]);

  useEffect(() => {
    if (search) {
      const filtro = proyectos.filter((p) =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
      );
      setFiltered(filtro);
    } else {
      setFiltered(proyectos);
    }
  }, [search, proyectos]);

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este proyecto?")) {
      const res = await deleteProyecto(id);
      if (res.data.ok) cargarProyectos();
    }
  };

  const handleEditarLocal = (proyecto) => {
    setProyectoEditando(proyecto);
    setModalVisible(true);
  };

  const handleExito = () => {
    setModalVisible(false);
    setProyectoEditando(null);
    cargarProyectos();
  };

  const handlePresupuestos = (proyecto) => {
    setProyectoSeleccionado(proyecto);
  };

  return (
    <>
      {/* Mostrar detalle si hay proyecto seleccionado */}
      {proyectoSeleccionado ? (
        <ModalPresupuestoDetalle
          proyectoId={proyectoSeleccionado.id}
          onClose={() => setProyectoSeleccionado(null)}
          onSuccess={cargarProyectos}
        />
      ) : (
        <>
          {/* Barra superior: buscador, vista y crear proyecto */}
          <div className="flex flex-col sm:flex-row items-center mb-6 gap-2">
            <input
              type="text"
              placeholder="Buscar proyecto..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="px-4 py-2 rounded-2xl border border-gray-300 dark:border-gray-700 text-sm w-60 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none shadow"
            />

            <div className="flex gap-0 ml-auto mt-3 sm:mt-0">
              <button
                onClick={() => setView("cards")}
                className={`flex items-center gap-2 px-4 py-2 rounded-l-xl border transition text-sm font-semibold ${view === "cards"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"
                  }`}
              >
                <LayoutGrid size={18} />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
              <button
                onClick={() => setView("table")}
                className={`flex items-center gap-2 px-4 py-2 rounded-r-xl border transition text-sm font-semibold ${view === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"
                  }`}
              >
                <Table size={18} />
                <span className="hidden sm:inline">Tabla</span>
              </button>
              {/* Botón crear proyecto al lado de los botones de vista */}
              <button
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold ml-3 hover:bg-blue-700 transition"
                onClick={() => {
                  setProyectoEditando(null);
                  setModalVisible(true);
                }}
              >
                + Nuevo Proyecto
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-300 mt-8">
              No se encontraron proyectos.
            </p>
          ) : view === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2 text-base">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 uppercase text-xs">
                    <th className="px-4 py-2 font-semibold rounded-l-2xl">Nombre</th>
                    <th className="px-4 py-2 font-semibold">Empresa</th>
                    <th className="px-4 py-2 text-right font-semibold rounded-r-2xl">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="bg-white dark:bg-gray-900 rounded-2xl shadow hover:shadow-lg transition text-gray-900 dark:text-white"
                    >
                      <td className="px-4 py-4 rounded-l-2xl">{p.nombre}</td>
                      <td className="px-4 py-4">{p.empresaNombre}</td>
                      <td className="px-4 py-4 text-right rounded-r-2xl">
                        <button
                          className="inline-flex items-center justify-center p-2 mr-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 transition"
                          onClick={() => handleEditarLocal(p)}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="inline-flex items-center justify-center p-2 mr-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 transition"
                          onClick={() => handlePresupuestos(p)}
                          title="Ver presupuestos"
                        >
                          <FileDown size={18} />
                        </button>
                        <button
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 transition"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="group p-6 border rounded-2xl shadow bg-white dark:bg-gray-900 text-gray-800 dark:text-white hover:shadow-lg transition"
                >
                  <h3 className="font-bold text-xl mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition">
                    {p.nombre}
                  </h3>
                  <div className="text-gray-500 dark:text-gray-400 mb-4">
                    <span className="font-semibold">Empresa:</span> {p.empresaNombre}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 transition"
                      onClick={() => handleEditarLocal(p)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="inline-flex items-center justify-center p-2 mr-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 transition"
                      onClick={() => handlePresupuestos(p)}
                      title="Ver presupuestos"
                    >
                      <FileDown size={18} />
                    </button>
                    <button
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 transition"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          <div className="flex justify-between items-center mt-8">
            <button
              disabled={page <= 1}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Página {page} de {Math.ceil(total / pageSize) || 1}
            </span>
            <button
              disabled={page * pageSize >= total}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </button>
          </div>

          {/* Modal de creación/edición de proyecto */}
          <ProyectoModalForm
            visible={modalVisible}
            proyecto={proyectoEditando}
            onClose={() => setModalVisible(false)}
            onSuccess={handleExito}
            onOpenFacturas={(proj) => setProyectoFacturas(proj)}     // abre tu modal de facturas
            onOpenEvidencias={(proj) => setProyectoEvidencias(proj)} // abre tu modal de evidencias
          />
        </>
      )}
    </>
  );
}
