// src/components/RoleRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * allowedRoles: array de roles permitidos, ejemplo ['admin']
 * Si allowedRoles no está definido, sólo chequea que exista token.
 */
export default function RoleRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role") ?? "";

  if (!token) return <Navigate to="/login" replace />;

  if (!allowedRoles || allowedRoles.length === 0) return children;

  return allowedRoles.includes(role) ? children : <Navigate to="/" replace />;
}
