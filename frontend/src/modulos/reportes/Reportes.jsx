import { useEffect, useState } from "react";
import {
  getReportesMorosidad,
  generarReporteMorosidad,
  deleteReporteMorosidad,
  exportarReporteMorosidad,
  getReporteGeneral,
} from "../../services/reportes";
import ReporteMorosidadTable from "./components/ReporteMorosidadTable";
import ReporteGeneralCard from "./components/ReporteGeneralCard";

export default function Reportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReportes = async () => {
    setLoading(true);
    try {
      const res = await getReportesMorosidad();
      setReportes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  const handleGenerar = async () => {
    await generarReporteMorosidad(1); // <-- condominio_id (cámbialo dinámicamente)
    fetchReportes();
  };

  const handleDelete = async (id) => {
    await deleteReporteMorosidad(id);
    fetchReportes();
  };

  const handleExport = async (id, formato) => {
    try {
      const res = await exportarReporteMorosidad(id, formato);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `reporte.${formato}`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Error exportando:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">

      <div className="flex gap-4">
        <button
          onClick={handleGenerar}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg shadow hover:bg-cyan-700"
        >
          Generar Reporte Morosidad
        </button>
        <button
          onClick={async () => {
            const res = await getReporteGeneral(1, "json");
            alert("Condominio: " + res.data.condominio);
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700"
        >
          Ver Reporte General
        </button>
      </div>

      <ReporteMorosidadTable
        reportes={reportes}
        loading={loading}
        onDelete={handleDelete}
        onExport={handleExport}
      />

      <ReporteGeneralCard />
    </div>
  );
}
