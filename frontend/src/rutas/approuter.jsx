import { Routes, Route, Navigate } from "react-router-dom";
import KoaLanding from "../modulos/users/dashboard";
import AdminDashboard from "../modulos/users/dashadmin";
import Login from "../modulos/users/login";
import Register from "../modulos/users/registrar.jsx";
import DashResidentes from "../modulos/users/dashresidente";

function PrivateRoute({ children }) {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<KoaLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={
        <PrivateRoute>
          <AdminDashboard />
        </PrivateRoute>
      } />
      
      <Route path="/residente" element={DashResidentes()} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}