import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

import {
    Home,
    Building2,
    FolderKanban,
    LogOut,
    ChevronDown,
    ChevronRight,
    Wrench,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MobileAccordionMenu from "@/components/ui/MobileAccordionMenu";
import { useAuth } from "@/context/AuthContext"; // ✅ nuevo

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [openPresupuesto, setOpenPresupuesto] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const { user, authenticated, logout } = useAuth(); // ✅ usa contexto

    useEffect(() => {
        if (!authenticated) {
            navigate("/login");
        }
    }, [authenticated, navigate]);

    return (
        <div className="flex h-screen flex-col md:flex-row">
            {/* Header móvil */}
            <header className="md:hidden flex justify-between items-center px-4 py-3 bg-gray-900 text-white">
                <div className="text-xl font-bold">Safyro</div>
                <button type="button" onClick={() => setMenuOpen(!menuOpen)}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </header>

            {/* Menú móvil tipo acordeón */}
            {menuOpen && (
                <div className="md:hidden bg-gray-100 border-b border-gray-200">
                    <MobileAccordionMenu />
                    <button
                        type="button"
                        className="w-full text-left text-red-600 px-6 py-3 font-medium hover:bg-gray-200"
                        onClick={logout}
                    >
                        Cerrar sesión
                    </button>
                </div>
            )}

            {/* Sidebar escritorio */}
            <aside className="hidden md:flex w-64 bg-gray-900 text-white flex-col">
                <div className="text-xl font-bold p-4 border-b border-gray-700">Safyro</div>

                {/* 👤 Usuario conectado */}
                <div className="text-sm px-4 py-2 text-gray-400 border-b border-gray-700">
                    Usuario: <span className="text-white">{user?.usuario}</span>
                    <br />
                    Empresa: <span className="text-white">{user?.empresaNombre}</span>
                </div>

                <nav className="flex-1 p-4 space-y-2 text-sm">
                    <NavLink to="/dashboard" icon={<Home size={18} />} label="Inicio" location={location} />
                    <NavLink to="/empresas" icon={<Building2 size={18} />} label="Empresas" location={location} />
                    <NavLink to="/proyectos" icon={<FolderKanban size={18} />} label="Proyectos" location={location} />

                    {/* Submenú Presupuestos */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setOpenPresupuesto(!openPresupuesto)}
                            className="flex items-center w-full justify-between text-left hover:text-blue-400"
                        >
                            <span className="flex items-center gap-2">
                                <Wrench size={18} /> Presupuestos
                            </span>
                            {openPresupuesto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>

                        <AnimatePresence initial={false}>
                            {openPresupuesto && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="ml-6 mt-2 flex flex-col space-y-1"
                                >
                                    <Link className="hover:text-blue-400" to="/presupuestos">General</Link>
                                    <Link className="hover:text-blue-400" to="/presupuestos/materiales">Materiales</Link>
                                    <Link className="hover:text-blue-400" to="/presupuestos/mano-obra">Mano de Obra</Link>
                                    <Link className="hover:text-blue-400" to="/presupuestos/equipos">Equipos</Link>
                                    <Link className="hover:text-blue-400" to="/presupuestos/detalle">Detalle</Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>

                <button
                    type="button"
                    className="flex items-center gap-2 p-4 hover:bg-gray-800 border-t border-gray-700"
                    onClick={logout}
                >
                    <LogOut size={18} /> Cerrar sesión
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto bg-gray-50">
                <Outlet />
            </main>
        </div>
    );
}

function NavLink({ to, icon, label, location }) {
    const isActive = location.pathname.startsWith(to);
    return (
        <Link
            to={to}
            className={`flex items-center gap-2 hover:text-blue-400 ${isActive ? "text-blue-400 font-medium" : ""
                }`}
        >
            {icon} {label}
        </Link>
    );
}
