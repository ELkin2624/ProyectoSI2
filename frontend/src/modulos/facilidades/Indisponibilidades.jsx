// src/modulos/facilities/Indisponibilidades.jsx
import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash, Search } from "lucide-react";
import { list, create, update, remove } from "../../services/facilidades";

export default function Indisponibilidades() {
  const [items, setItems] = useState([]);
  const [instalaciones, setInstalaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ instalacion: "", inicio: "", fin: "", motivo: "" });
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const fetchAux = async () => {
    try {
      const r = await list("instalaciones", { page_size: 1000 });
      setInstalaciones(r.data.results ?? r.data);
    } catch (err) { console.warn(err); }
  };

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await list("indisponibilidades", { search: q, page, page_size: 10 });
      setItems(res.data.results ?? res.data);
      setCount(res.data.count ?? (Array.isArray(res.data) ? res.data.length : 0));
    } catch (err) { console.error(err); alert("Error cargando indisponibilidades"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAux();
    fetch();
    // eslint-disable-next-line
  }, [q, page]);

  const openCreate = () => {
    setEditing(null);
    setForm({ instalacion: instalaciones[0]?.id ?? "", inicio: "", fin: "", motivo: "" });
    setModalOpen(true);
  };

  const openEdit = (it) => {
    const toLocal = (iso) => {
      if (!iso) return "";
      const d = new Date(iso);
      const pad=(n)=>n.toString().padStart(2,"0");
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setEditing(it);
    setForm({ instalacion: it.instalacion?.id ?? it.instalacion ?? "", inicio: toLocal(it.inicio), fin: toLocal(it.fin), motivo: it.motivo ?? "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.instalacion || !form.inicio || !form.fin) {
      alert("Selecciona instalación e intervalo.");
      return;
    }
    const payload = {
      instalacion: form.instalacion,
      inicio: new Date(form.inicio).toISOString(),
      fin: new Date(form.fin).toISOString(),
      motivo: form.motivo || ""
    };
    try {
      if (editing) {
        await update("indisponibilidades", editing.id, payload);
        alert("Indisponibilidad actualizada");
      } else {
        await create("indisponibilidades", payload);
        alert("Indisponibilidad creada");
      }
      setModalOpen(false);
      fetch();
    } catch (err) {
      console.error(err);
      alert("Error al guardar indisponibilidad");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar indisponibilidad?")) return;
    try {
      await remove("indisponibilidades", id);
      alert("Eliminada");
      fetch();
    } catch (err) { console.error(err); alert("Error al eliminar"); }
  };

  return (
    <section aria-labelledby="indisponibilidades-title">
      <div className="flex items-center justify-between mb-4">
        <h2 id="indisponibilidades-title" className="text-2xl font-bold text-gray-800">Indisponibilidades</h2>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <input value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} placeholder="Buscar..." className="rounded-full border px-4 py-2 pl-10 text-sm"/>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-md shadow"><Plus size={16}/> Nuevo</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Instalación</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Inicio → Fin</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Motivo</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (<tr><td colSpan="5" className="p-6 text-center">Cargando...</td></tr>) :
              items.length === 0 ? (<tr><td colSpan="5" className="p-6 text-center">No hay indisponibilidades</td></tr>) :
              items.map((it, idx)=>(
                <tr key={it.id}>
                  <td className="px-4 py-3 text-sm">{(page-1)*10 + idx +1}</td>
                  <td className="px-4 py-3 text-sm">{it.instalacion?.nombre ?? it.instalacion}</td>
                  <td className="px-4 py-3 text-sm">{it.inicio ? new Date(it.inicio).toLocaleString() : "-"} → {it.fin ? new Date(it.fin).toLocaleString() : "-"}</td>
                  <td className="px-4 py-3 text-sm">{it.motivo ?? "-"}</td>
                  <td className="px-4 py-3 text-right text-sm space-x-2">
                    <button onClick={()=>openEdit(it)} className="p-2 rounded hover:bg-gray-100"><Pencil size={16}/></button>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 z-10">
            <h3 className="text-lg font-semibold mb-4">{editing ? "Editar indisponibilidad" : "Nueva indisponibilidad"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Instalación</label>
                  <select required value={form.instalacion} onChange={(e)=>setForm({...form, instalacion: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
                    <option value="">Seleccionar</option>
                    {instalaciones.map(i=> <option key={i.id} value={i.id}>{i.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Inicio</label>
                  <input required type="datetime-local" value={form.inicio} onChange={(e)=>setForm({...form, inicio: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fin</label>
                  <input required type="datetime-local" value={form.fin} onChange={(e)=>setForm({...form, fin: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Motivo</label>
                  <input value={form.motivo} onChange={(e)=>setForm({...form, motivo: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2"/>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 rounded border">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-cyan-600 text-white">{editing ? "Guardar" : "Crear"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
