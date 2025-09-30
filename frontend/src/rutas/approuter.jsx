// src/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import KoaLanding from "../modulos/users/dashboard";
import AdminDashboard from "../modulos/users/dashadmin";
import Login from "../modulos/users/login";          
import Register from "../modulos/users/registrar"; 
import ChangePassword from "../modulos/users/ChangePassword"
import DashResidentes from "../modulos/users/dashresidente";
import RoleRoute from "../components/RoleRoute";      
import AdminUsersDashboard from "../modulos/users/admin/AdminUsersDashboard"; 

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<KoaLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<ChangePassword />} />
      <Route path="/admin/users" element={
        <RoleRoute allowedRoles={['admin']}>
          <AdminUsersDashboard />
        </RoleRoute>
      } />

      <Route path="/admin" element={
        <RoleRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </RoleRoute>
      } />

      <Route path="/residente" element={
        <RoleRoute allowedRoles={['residente']}>
          <DashResidentes />
        </RoleRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
