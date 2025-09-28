// src/modulos/facilities/Condominios.jsx
import React, { useEffect, useState } from "react";
import { Pencil, Trash, Plus, Search } from "lucide-react";
import { list, create, update, remove } from "../../services/facilidades";

export default function Condominios() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", direccion: "", ciudad: "" });
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const fetch = async (params = {}) => {
    setLoading(true);
    try {
      const res = await list("condominios", { search: q, page, ...params });
      const data = res.data;
      setItems(data.results ?? data);
      setCount(data.count ?? (data.results ? data.results.length : data.length));
    } catch (err) {
      console.error(err);
      alert("Error cargando condominios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [q, page]);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: "", direccion: "", ciudad: "" });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ nombre: item.nombre || "", direccion: item.direccion || "", ciudad: item.ciudad || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await update("condominios", editing.id, form);
      else await create("condominios", form);
      setModalOpen(false);
      fetch();
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar condominio?")) return;
    try {
      await remove("condominios", id);
      fetch();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar");
    }
  };

  return (
    <section aria-labelledby="condominios-title" className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <h2 id="condominios-title" className="text-2xl font-bold text-gray-800">Condominios</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre o ciudad..."
              className="w-full sm:w-64 rounded-full border px-10 py-2 text-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md shadow transition"
          >
            <Plus size={16}/> Nuevo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Dirección</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ciudad</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="5" className="p-6 text-center animate-pulse text-gray-500">Cargando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="5" className="p-6 text-center text-gray-500">No hay condominios</td></tr>
            ) : items.map((it, idx) => (
              <tr key={it.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-sm">{(page-1)*10 + idx + 1}</td>
                <td className="px-4 py-3 text-sm">{it.nombre}</td>
                <td className="px-4 py-3 text-sm">{it.direccion}</td>
                <td className="px-4 py-3 text-sm">{it.ciudad}</td>
                <td className="px-4 py-3 text-right text-sm flex justify-end gap-2">
                  <button onClick={() => openEdit(it)} className="p-2 rounded hover:bg-gray-100 transition"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(it.id)} className="p-2 rounded hover:bg-red-50 text-red-600 transition"><Trash size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-600">
        <div>Total: {count}</div>
        <div className="flex items-center gap-2">
          <button disabled={page===1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 rounded border disabled:opacity-50">Anterior</button>
          <div className="px-3 py-1 border rounded">Página {page}</div>
          <button onClick={() => setPage(p => p+1)} className="px-3 py-1 rounded border">Siguiente</button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-10 animate-fadeIn">
            <h3 className="text-lg font-semibold mb-4">{editing ? "Editar condominio" : "Nuevo condominio"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {['nombre', 'direccion', 'ciudad'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
                  <input
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="mt-1 block w-full rounded border px-3 py-2 focus:ring-2 focus:ring-cyan-400 transition"
                    required={field === "nombre"}
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded border hover:bg-gray-100 transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white transition">{editing ? "Guardar" : "Crear"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
