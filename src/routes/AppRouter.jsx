// src/routes/AppRouter.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import Login from "../pages/Login";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import EmpresaPage from "../pages/Empresas/EmpresaPage";
import ProyectoPage from "../pages/Proyectos/ProyectoPage";
import PresupuestoList from "../pages/Presupuestos/PresupuestoList";
import PresupuestoForm from "../pages/Presupuestos/PresupuestoForm";
import ProyectoForm from "../components/Proyectos/ProyectoForm";
import MaterialPresupuestoPage from "../pages/MaterialPresupuestoPage";
import ManoObraPresupuestoPage from "../pages/ManoObraPresupuestoPage";
import EquipoPresupuestoPage from "../pages/EquipoPresupuestoPage";
import PresupuestoDetalleView from "../views/PresupuestoDetalleView";

import PrivateRoute from "./PrivateRoute";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="empresas" element={<EmpresaPage />} />
          <Route path="proyectos" element={<ProyectoPage />} />
          <Route path="proyectos/nuevo" element={<ProyectoForm />} />
          <Route path="presupuestos" element={<PresupuestoList />} />
          <Route path="presupuestos/nuevo" element={<PresupuestoForm />} />
          <Route path="presupuestos/materiales" element={<MaterialPresupuestoPage />} />
          <Route path="presupuestos/mano-obra" element={<ManoObraPresupuestoPage />} />
          <Route path="presupuestos/equipos" element={<EquipoPresupuestoPage />} />
          <Route path="presupuestos/detalle" element={<PresupuestoDetalleView />} /> {/* NUEVO */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Route>

        {/* Catch-all: si no autenticado y ruta no existe */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
