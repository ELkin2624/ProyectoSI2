// src/modulos/facilities/Instalaciones.jsx
import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash, Search } from "lucide-react";
import { list, create, update, remove } from "../../services/facilidades";
import api from "../../services/api";

export default function Instalaciones() {
  const [items, setItems] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    condominio: "",
    nombre: "",
    capacidad: "",
    reglas: "{}", // JSON string
    ventana_reserva_dias: 30
  });
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const fetchAux = async () => {
    try {
      const c = await list("condominios", { page_size: 1000 });
      setCondominios(c.data.results ?? c.data);
    } catch (err) { console.warn(err); }
  };

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await list("instalaciones", { search: q, page, page_size: 10 });
      setItems(res.data.results ?? res.data);
      setCount(res.data.count ?? (Array.isArray(res.data) ? res.data.length : 0));
    } catch (err) {
      console.error(err);
      alert("Error cargando instalaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAux();
    fetch();
    // eslint-disable-next-line
  }, [q, page]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      condominio: condominios[0]?.id ?? "",
      nombre: "",
      capacidad: "",
      reglas: "{}",
      ventana_reserva_dias: 30
    });
    setModalOpen(true);
  };

  const openEdit = (it) => {
    setEditing(it);
    setForm({
      condominio: it.condominio?.id ?? it.condominio ?? "",
      nombre: it.nombre ?? "",
      capacidad: it.capacidad ?? "",
      reglas: JSON.stringify(it.reglas ?? {}, null, 2),
      ventana_reserva_dias: it.ventana_reserva_dias ?? 30
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // intentar parsear reglas JSON
    let reglasParsed = {};
    try {
      reglasParsed = JSON.parse(form.reglas || "{}");
    } catch (err) {
      alert("El campo 'reglas' debe ser JSON válido.");
      return;
    }

    const payload = {
      condominio: form.condominio,
      nombre: form.nombre,
      capacidad: form.capacidad ? Number(form.capacidad) : null,
      reglas: reglasParsed,
      ventana_reserva_dias: Number(form.ventana_reserva_dias) || 30
    };

    try {
      if (editing) {
        await update("instalaciones", editing.id, payload);
        alert("Instalación actualizada");
      } else {
        await create("instalaciones", payload);
        alert("Instalación creada");
      }
      setModalOpen(false);
      fetch();
    } catch (err) {
      console.error(err);
      alert("Error al guardar instalación");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar instalación?")) return;
    try {
      await remove("instalaciones", id);
      alert("Eliminada");
      fetch();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar");
    }
  };

  const getCondominioNombre = (c) => {
    if (!c) return "-";
      // si la API ya devolvió el objeto anidado
      if (typeof c === "object") return c.nombre ?? c.id ?? "-";
        // si es id (string/number) buscamos en el listado cargado
        const found = condominios.find(x => String(x.id) === String(c));
    return found ? (found.nombre ?? String(found.id)) : String(c);
  };

  return (
    <section aria-labelledby="instalaciones-title">
      <div className="flex items-center justify-between mb-4">
        <h2 id="instalaciones-title" className="text-2xl font-bold text-gray-800">Instalaciones</h2>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <input value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} placeholder="Buscar por nombre..." className="rounded-full border px-4 py-2 pl-10 text-sm"/>
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Condominio</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Capacidad</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (<tr><td colSpan="5" className="p-6 text-center">Cargando...</td></tr>) :
              items.length === 0 ? (<tr><td colSpan="5" className="p-6 text-center">No hay instalaciones</td></tr>) :
              items.map((it, idx) => (
                <tr key={it.id}>
                  <td className="px-4 py-3 text-sm">{(page-1)*10 + idx +1}</td>
                  <td className="px-4 py-3 text-sm">{it.nombre}</td>
                  <td className="px-4 py-3 text-sm">{it.condominio_obj?.nombre ?? getCondominioNombre(it.condominio)}</td>
                  <td className="px-4 py-3 text-sm">{it.capacidad ?? "-"}</td>
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

      {/* pag */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {count}</div>
        <div className="flex items-center gap-2">
          <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 rounded border">Anterior</button>
          <div className="px-3 py-1 border rounded">Página {page}</div>
          <button onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded border">Siguiente</button>
        </div>
      </div>

      {/* modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 z-10">
            <h3 className="text-lg font-semibold mb-4">{editing ? "Editar instalación" : "Nueva instalación"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input required value={form.nombre} onChange={(e)=>setForm({...form, nombre: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Condominio</label>
                  <select required value={form.condominio} onChange={(e)=>setForm({...form, condominio: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
                    <option value="">Seleccionar</option>
                    {condominios.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacidad</label>
                  <input type="number" value={form.capacidad} onChange={(e)=>setForm({...form, capacidad: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ventana (días)</label>
                  <input type="number" value={form.ventana_reserva_dias} onChange={(e)=>setForm({...form, ventana_reserva_dias: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Reglas (JSON)</label>
                  <textarea rows={4} value={form.reglas} onChange={(e)=>setForm({...form, reglas: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2 font-mono text-sm" />
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
