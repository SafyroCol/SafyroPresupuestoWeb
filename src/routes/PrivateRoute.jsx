import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function PrivateRoute({ children }) {
  const { authenticated, user } = useAuth();

  // Mientras carga el contexto, puede mostrar algo
  if (user === null && !authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!authenticated || !user?.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
