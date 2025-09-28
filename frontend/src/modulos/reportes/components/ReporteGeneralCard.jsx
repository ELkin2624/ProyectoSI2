import { useState } from "react";
import { getReporteGeneral } from "../../../services/reportes";

export default function ReporteGeneralCard() {
  const [data, setData] = useState(null);

  const fetchGeneral = async () => {
    const res = await getReporteGeneral(1, "json"); // condominio_id dinámico
    setData(res.data);
  };

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">📑 Reporte General</h2>
      <button
        onClick={fetchGeneral}
        className="bg-cyan-500 text-white px-4 py-2 rounded-lg mb-4"
      >
        Obtener Reporte
      </button>
      {data ? (
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="text-gray-500">No hay datos cargados.</p>
      )}
    </div>
  );
}
