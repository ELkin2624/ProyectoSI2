// src/modulos/facilities/Adjuntos.jsx
import React, { useEffect, useState } from "react";
import { Search, Trash } from "lucide-react";
import { list, remove } from "../../services/facilidades";
import api from "../../services/api";

export default function Adjuntos() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await list("adjuntos", { search: q, page, page_size: 10 });
      setItems(res.data.results ?? res.data);
      setCount(res.data.count ?? (Array.isArray(res.data) ? res.data.length : 0));
    } catch (err) { console.error(err); alert("Error cargando adjuntos"); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetch(); /* eslint-disable-next-line */ }, [q, page]);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar adjunto?")) return;
    try {
      await remove("adjuntos", id);
      alert("Eliminado");
      fetch();
    } catch (err) { console.error(err); alert("Error al eliminar"); }
  };

  return (
    <section aria-labelledby="adjuntos-title">
      <div className="flex items-center justify-between mb-4">
        <h2 id="adjuntos-title" className="text-2xl font-bold text-gray-800">Adjuntos</h2>
        <div className="relative hidden sm:block">
          <input value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} placeholder="Buscar por owner_type/owner_id..." className="rounded-full border px-4 py-2 pl-10 text-sm"/>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Owner</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">URL</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (<tr><td colSpan="4" className="p-6 text-center">Cargando...</td></tr>) :
              items.length === 0 ? (<tr><td colSpan="4" className="p-6 text-center">No hay adjuntos</td></tr>) :
              items.map((it, idx)=>(
                <tr key={it.id}>
                  <td className="px-4 py-3 text-sm">{(page-1)*10 + idx +1}</td>
                  <td className="px-4 py-3 text-sm">{it.owner_type} • {it.owner_id}</td>
                  <td className="px-4 py-3 text-sm"><a href={it.url} target="_blank" rel="noreferrer" className="text-indigo-600 truncate block max-w-xs">{it.url}</a></td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button onClick={()=>handleDelete(it.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash size={16}/></button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {count}</div>
        <div className="flex items-center gap-2">
          <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 rounded border">Anterior</button>
          <div className="px-3 py-1 border rounded">Página {page}</div>
          <button onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded border">Siguiente</button>
        </div>
      </div>
    </section>
  );
}
