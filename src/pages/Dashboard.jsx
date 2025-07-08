import React from "react";
import Card from "@/components/ui/Card";
import CardGrid from "@/components/ui/CardGrid";
import { BarChart2, Layers, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user, authenticated } = useAuth();

  if (!authenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Cargando sesión...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-zinc-800 dark:text-white mb-6">
        Dashboard de Obra
      </h1>

      <CardGrid>
        <Card
          title="Presupuesto Total"
          icon={<Layers className="w-6 h-6" />}
          footer={
            <span className="text-sm text-zinc-500">
              Incluye materiales y equipos
            </span>
          }
        >
          <p className="text-2xl font-bold">$1.200.000.000</p>
        </Card>

        <Card
          title="Ejecutado"
          icon={<BarChart2 className="w-6 h-6" />}
          footer={
            <span className="text-sm text-zinc-500">
              Última actualización: hoy
            </span>
          }
        >
          <p className="text-2xl font-bold text-green-600">$850.000.000</p>
        </Card>

        <Card title="Responsables de proyecto" icon={<Users className="w-6 h-6" />}>
          <ul className="text-sm list-disc ml-4">
            <li>Usuario: {user.usuario}</li>
            <li>Empresa: {user.empresaNombre}</li>
            <li>Rol: {Array.isArray(user.roles) ? user.roles.join(", ") : user.roles}</li>
          </ul>
        </Card>
      </CardGrid>
    </div>
  );
}
