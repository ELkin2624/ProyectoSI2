// File: src/modulos/seguridad/SeguridadDashboard.jsx
import React, { useEffect, useState } from "react";
import { getRegistrosAcceso, getAlertasPanico, 
    getDeteccionesPlacas, getDeteccionesRostros, getVehiculos 
} from "../../services/seguridad";

export default function SeguridadDashboard() {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const [rAcc, alerts, placas, rostros, vehs] = await Promise.all([
                    getRegistrosAcceso(),
                    getAlertasPanico(),
                    getDeteccionesPlacas(),
                    getDeteccionesRostros(),
                    getVehiculos(),
                ]);
                setStats({
                    registros: rAcc.data.length,
                    alertas: alerts.data.length,
                    placas: placas.data.length,
                    rostros: rostros.data.length,
                    vehiculos: vehs.data.length,
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-4">Cargando dashboard...</div>;
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm text-gray-500">Registros de Acceso</h3>
                <p className="text-2xl font-bold">{stats.registros}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm text-gray-500">Alertas de Pánico</h3>
                <p className="text-2xl font-bold">{stats.alertas}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm text-gray-500">Detecciones - Placas</h3>
                <p className="text-2xl font-bold">{stats.placas}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm text-gray-500">Detecciones - Rostros</h3>
                <p className="text-2xl font-bold">{stats.rostros}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm text-gray-500">Vehículos Registrados</h3>
                <p className="text-2xl font-bold">{stats.vehiculos}</p>
            </div>
        </div>
    );
}