export default function ReporteMorosidadTable({ reportes, loading, onDelete, onExport }) {
  if (loading) return <p>Cargando reportes...</p>;

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">📌 Reportes de Morosidad</h2>
      <table className="w-full text-left border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">ID</th>
            <th className="p-2">Condominio</th>
            <th className="p-2">Generado en</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reportes.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="p-2">{r.id}</td>
              <td className="p-2">{r.condominio}</td>
              <td className="p-2">{new Date(r.generado_en).toLocaleString()}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => onExport(r.id, "csv")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                >
                  CSV
                </button>
                <button
                  onClick={() => onExport(r.id, "pdf")}
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                >
                  PDF
                </button>
                <button
                  onClick={() => onExport(r.id, "json")}
                  className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                >
                  JSON
                </button>
                <button
                  onClick={() => onDelete(r.id)}
                  className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                >
                  🗑
                </button>
              </td>
            </tr>
          ))}
          {reportes.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No hay reportes generados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
