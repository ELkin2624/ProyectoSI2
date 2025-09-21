import { Routes, Route } from "react-router-dom";
import KoaLanding from "../modulos/users/dashboard";
import AdminDashboard from "../modulos/users/dashadmin";
import Login from "../modulos/users/login";

export default function AppRouter() {
    return ( 
    <Routes> 
        <Route path="/" element={<KoaLanding />} /> 
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<Login />} />
    </Routes> 
    ); 
}