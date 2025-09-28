// src/modulos/facilities/Incidencias.jsx
import React, { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash, Search, Paperclip, X } from "lucide-react";
import { list, create, update, remove, uploadAdjunto } from "../../services/facilidades";
import api from "../../services/api";

export default function Incidencias() {
  const [items, setItems] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    unidad: "",
    condominio: "",
    categoria: "",
    titulo: "",
    descripcion: "",
    estado: "abierta",
    prioridad: "media",
    asignado_a: ""
  });
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentFiles, setCommentFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const firstInputRef = useRef(null);

  const fetchAux = async () => {
    try {
      const c = await list("condominios", { page_size: 1000 });
      setCondominios(c.data.results ?? c.data);
    } catch (err) { console.warn(err); }
    try {
      const u = await api.get("/users/?page_size=1000");
      setUsers(u.data.results ?? u.data);
    } catch (err) { console.warn(err); }
  };

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await list("incidencias", { search: q, page, page_size: 10 });
      setItems(res.data.results ?? res.data);
      setCount(res.data.count ?? (Array.isArray(res.data) ? res.data.length : 0));
    } catch (err) {
      console.error(err);
      alert("Error cargando incidencias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAux();
    fetch();
    // eslint-disable-next-line
  }, [q, page]);

  useEffect(() => {
    // si se abre modal, enfocar primer input
    if (modalOpen) {
      setTimeout(() => firstInputRef.current?.focus?.(), 50);
    }
  }, [modalOpen]);

  useEffect(() => {
    // cerrar modal con Escape
    const onKey = (e) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      unidad: "",
      condominio: condominios[0]?.id ?? "",
      categoria: "",
      titulo: "",
      descripcion: "",
      estado: "abierta",
      prioridad: "media",
      asignado_a: ""
    });
    setModalOpen(true);
  };

  const openEdit = (it) => {
    setEditing(it);
    setForm({
      unidad: it.unidad?.id ?? it.unidad ?? "",
      condominio: it.condominio?.id ?? it.condominio ?? "",
      categoria: it.categoria ?? "",
      titulo: it.titulo ?? "",
      descripcion: it.descripcion ?? "",
      estado: it.estado ?? "abierta",
      prioridad: it.prioridad ?? "media",
      asignado_a: it.asignado_a?.id ?? it.asignado_a ?? ""
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      unidad: form.unidad || null,
      condominio: form.condominio,
      categoria: form.categoria || null,
      titulo: form.titulo,
      descripcion: form.descripcion || "",
      estado: form.estado,
      prioridad: form.prioridad,
      asignado_a: form.asignado_a || null
    };
    try {
      if (editing) {
        await update("incidencias", editing.id, payload);
        alert("Incidencia actualizada");
      } else {
        await create("incidencias", payload);
        alert("Incidencia creada");
      }
      setModalOpen(false);
      fetch();
    } catch (err) {
      console.error(err);
      alert("Error al guardar incidencia");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar incidencia?")) return;
    try {
      await remove("incidencias", id);
      alert("Eliminada");
      fetch();
    } catch (err) { console.error(err); alert("Error al eliminar"); }
  };

  const openDetail = async (inc) => {
    setSelected(null);
    setComments([]);
    try {
      const res = await list("incidencias", { id: inc.id });
      const detail = (res.data.results && res.data.results[0]) || (res.data[0]) || inc;
      setSelected(detail);
      const c = await list("comentarios-incidencia", { incidencia: inc.id, page_size: 1000 });
      setComments(c.data.results ?? c.data);
    } catch (err) {
      console.error(err);
      setSelected(inc);
    }
  };

  const handleUploadAndComment = async () => {
    if (!selected) { alert("Selecciona una incidencia"); return; }
    if (!commentText && commentFiles.length === 0) { alert("Escribe un comentario o adjunta archivos"); return; }

    try {
      const uploadedIds = [];
      for (const f of commentFiles) {
        const fd = new FormData();
        fd.append('file', f);
        fd.append('owner_type', 'incidencia');
        fd.append('owner_id', selected.id);
        const res = await uploadAdjunto(fd, {
          onUploadProgress: (ev) => {
            // opcional: mostrar progreso
          }
        });
        uploadedIds.push(res.data.id ?? res.data);
      }

      const payload = {
        incidencia: selected.id,
        comentario: commentText,
        adjuntos: uploadedIds.length ? uploadedIds : undefined
      };
      await create("comentarios-incidencia", payload);

      const c = await list("comentarios-incidencia", { incidencia: selected.id, page_size: 1000 });
      setComments(c.data.results ?? c.data);
      setCommentText("");
      setCommentFiles([]);
    } catch (err) {
      console.error(err);
      alert("Error al subir adjuntos o crear comentario");
    }
  };

  return (
    <section aria-labelledby="incidencias-title" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <main className="lg:col-span-2">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <h2 id="incidencias-title" className="text-2xl font-bold text-gray-800">Incidencias</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Buscar por título/descr..."
                className="w-full sm:w-64 rounded-full border px-10 py-2 text-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                aria-label="Buscar incidencias"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <button onClick={openCreate} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md shadow">
              <Plus size={16}/> Nuevo
            </button>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Título</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Condominio</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Prioridad</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="6" className="p-6 text-center animate-pulse text-gray-500">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-500">No hay incidencias</td></tr>
              ) : (
                items.map((it, idx) => (
                  <tr key={it.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-sm">{(page-1)*10 + idx + 1}</td>
                    <td className="px-4 py-3 text-sm">
                      <button onClick={() => openDetail(it)} className="text-left text-indigo-600 hover:underline">
                        {it.titulo}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm">{it.condominio?.nombre ?? "-"}</td>
                    <td className="px-4 py-3 text-sm">{it.estado}</td>
                    <td className="px-4 py-3 text-sm">{it.prioridad}</td>
                    <td className="px-4 py-3 text-right text-sm flex justify-end gap-2">
                      <button onClick={() => openEdit(it)} className="p-2 rounded hover:bg-gray-100"><Pencil size={16}/></button>
                      <button onClick={() => handleDelete(it.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash size={16}/></button>
                    </td>
                  </tr>
                ))
              )}
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
      </main>

      <aside className="bg-white rounded-lg shadow p-4">
        {!selected ? (
          <div className="text-sm text-gray-600">Selecciona una incidencia para ver detalles y comentarios.</div>
        ) : (
          <>
            <article aria-labelledby={`inc-${selected.id}-title`} className="mb-3">
              <h3 id={`inc-${selected.id}-title`} className="text-lg font-semibold">{selected.titulo}</h3>
              <div className="text-sm text-gray-500">{selected.categoria ?? ""} — {selected.condominio?.nombre ?? ""}</div>
              <p className="mt-2 text-sm">{selected.descripcion}</p>
            </article>

            <section aria-labelledby="hilo-title" className="mb-3">
              <h4 id="hilo-title" className="font-medium">Hilo de comentarios</h4>
              <div className="space-y-3 mt-3 max-h-64 overflow-y-auto">
                {comments.length === 0 ? <div className="text-sm text-gray-500">Sin comentarios</div> :
                  comments.map(c => (
                    <div key={c.id} className="border rounded p-2">
                      <div className="text-xs text-gray-500">
                        {c.usuario ? (c.usuario.email ?? c.usuario) : "Anónimo"} •{" "}
                        {
                          // <-- CORRECCIÓN: paréntesis alrededor del ?? combinado con ||
                          new Date((c.created_at ?? c.created) || c.id?.slice?.(0,8)).toLocaleString?.() ?? ""
                        }
                      </div>
                      <div className="mt-1 text-sm">{c.comentario}</div>
                      {c.adjuntos && c.adjuntos.length > 0 && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {c.adjuntos.map(a => (
                            <a
                              key={a.id ?? a.url ?? a}
                              href={a.url ?? a}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-indigo-600 flex items-center gap-1"
                            >
                              <Paperclip size={12}/>{a.nombre ?? (a.filename ?? "adjunto")}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>
            </section>

            <section aria-labelledby="nuevo-comentario" className="mb-2">
              <h4 id="nuevo-comentario" className="font-medium">Nuevo comentario</h4>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                className="w-full mt-2 rounded border px-3 py-2"
                placeholder="Escribe tu comentario..."
                aria-label="Comentario"
              />
              <div className="flex items-center justify-between mt-2 gap-2">
                <label className="text-sm flex items-center gap-2">
                  <Paperclip size={14}/> 
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setCommentFiles(Array.from(e.target.files))}
                    className="hidden"
                    aria-label="Adjuntar archivos"
                  />
                  <span className="text-xs text-gray-500">Agregar archivos</span>
                </label>

                <div className="flex gap-2">
                  <button onClick={() => { setCommentText(""); setCommentFiles([]); }} className="px-3 py-1 border rounded">Limpiar</button>
                  <button onClick={handleUploadAndComment} className="px-3 py-1 rounded bg-cyan-600 text-white">Enviar</button>
                </div>
              </div>
            </section>
          </>
        )}

        <div className="mt-4 flex gap-2">
          <button onClick={() => { setSelected(null); }} className="px-3 py-1 rounded border">Cerrar</button>
          <button onClick={() => { /* acción extra */ }} className="px-3 py-1 rounded border">Acciones</button>
        </div>
      </aside>

      {/* modal create/edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 z-10">
            <div className="flex justify-between items-center mb-2">
              <h3 id="modal-title" className="text-lg font-semibold">{editing ? "Editar incidencia" : "Nueva incidencia"}</h3>
              <button onClick={() => setModalOpen(false)} aria-label="Cerrar modal" className="p-1 rounded hover:bg-gray-100"><X size={16}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Condominio</label>
                  <select ref={firstInputRef} required value={form.condominio} onChange={(e) => setForm({ ...form, condominio: e.target.value })} className="mt-1 block w-full rounded border px-3 py-2">
                    <option value="">Seleccionar</option>
                    {condominios.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Unidad (opcional)</label>
                  <input value={form.unidad} onChange={(e)=>setForm({...form, unidad: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" placeholder="ID de unidad o dejar vacío"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                  <select value={form.prioridad} onChange={(e)=>setForm({...form, prioridad: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select value={form.estado} onChange={(e)=>setForm({...form, estado: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
                    <option value="abierta">Abierta</option>
                    <option value="en_progreso">En progreso</option>
                    <option value="cerrada">Cerrada</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Título</label>
                  <input required value={form.titulo} onChange={(e)=>setForm({...form, titulo: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2"/>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea value={form.descripcion} onChange={(e)=>setForm({...form, descripcion: e.target.value})} rows={4} className="mt-1 block w-full rounded border px-3 py-2"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Asignado a</label>
                  <select value={form.asignado_a} onChange={(e)=>setForm({...form, asignado_a: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
                    <option value="">Sin asignar</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.email ?? u.username}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <input value={form.categoria} onChange={(e)=>setForm({...form, categoria: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2"/>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 rounded border hover:bg-gray-100">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white">{editing ? "Guardar" : "Crear"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
