// src/modulos/facilities/Reservas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash, Plus, Search } from "lucide-react";
import { list, create, update, remove } from "../../services/facilidades";
import api from "../../services/api";

export default function Reservas() {
  const [items, setItems] = useState([]);
  const [instalaciones, setInstalaciones] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [errors, setErrors] = useState(null);

  // NOTE: usamos `inicio` y `fin` (coincide con tu modelo/serializer)
  const [form, setForm] = useState({
    instalacion: "",
    unidad: "",
    usuario: "",
    inicio: "",
    fin: "",
    estado: "confirmada",
  });

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  // Cargar datos auxiliares
  const fetchAux = async () => {
    try {
      const r = await list("instalaciones", { page_size: 1000 });
      setInstalaciones(r.data.results ?? r.data ?? []);
    } catch (err) { console.warn("instalaciones:", err); setInstalaciones([]); }
    try {
      const u = await list("unidades", { page_size: 1000 });
      setUnidades(u.data.results ?? u.data ?? []);
    } catch (err) { console.warn("unidades:", err); setUnidades([]); }
    try {
      const uu = await api.get("/users/");
      setUsers(uu.data.results ?? uu.data ?? []);
    } catch (err) { console.warn("users:", err); setUsers([]); }
  };

  const fetch = async (params = {}) => {
    setLoading(true);
    try {
      const res = await list("reservas", { search: q, page, page_size: 10, ...params });
      const data = res.data;
      setItems(data.results ?? data ?? []);
      setCount(data.count ?? (data.results ? data.count : (Array.isArray(data) ? data.length : 0)));
    } catch (err) {
      console.error(err);
      alert("Error cargando reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAux();
    fetch();
    // eslint-disable-next-line
  }, [q, page]);

  // maps para acceso rápido (mejor rendimiento en listas grandes)
  const instalacionesMap = useMemo(() => Object.fromEntries((instalaciones || []).map(i => [String(i.id), i])), [instalaciones]);
  const unidadesMap = useMemo(() => Object.fromEntries((unidades || []).map(u => [String(u.id), u])), [unidades]);
  const usersMap = useMemo(() => Object.fromEntries((users || []).map(u => [String(u.id), u])), [users]);

  // Helpers para mostrar etiquetas (prioridad: nombre+apellido -> username -> email -> id)
  const getUserLabel = (u) => {
    if (!u) return "-";
    if (typeof u === "object") {
      const fullName = (u.first_name || u.last_name) ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() : null;
      return fullName ?? u.username ?? u.email ?? (u.id ?? "-");
    }
    const found = usersMap[String(u)];
    if (found) {
      const fullName = (found.first_name || found.last_name) ? `${found.first_name ?? ""} ${found.last_name ?? ""}`.trim() : null;
      return fullName ?? found.username ?? found.email ?? String(found.id);
    }
    return String(u);
  };

  const getInstalacionLabel = (ins) => {
    if (!ins) return "-";
    if (typeof ins === "object") return ins.nombre ?? ins.id ?? "-";
    return instalacionesMap[String(ins)]?.nombre ?? String(ins);
  };

  const getUnidadLabel = (u) => {
    if (!u) return "-";
    if (typeof u === "object") return u.numero_unidad ?? (u.id ?? "-");
    return unidadesMap[String(u)]?.numero_unidad ?? String(u);
  };

  // datetime-local <-> ISO helpers
  // input value for datetime-local should be 'YYYY-MM-DDTHH:MM' (no seconds)
  const isoToLocalInput = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    // get local components
    const pad = (n) => String(n).padStart(2, "0");
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
  };
  const localInputToISOString = (localValue) => {
    if (!localValue) return null;
    // 'YYYY-MM-DDTHH:mm' interpreted as local time by Date constructor
    const d = new Date(localValue);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString(); // backend (DRF) can parse ISO with timezone
  };

  // abrir modal para crear
  const openCreate = () => {
    setEditing(null);
    setErrors(null);
    setForm({
      instalacion: instalaciones[0]?.id ?? "",
      unidad: "",
      usuario: "",
      inicio: "",
      fin: "",
      estado: "confirmada"
    });
    setModalOpen(true);
  };

  // abrir modal para editar (ajustamos fechas a formato datetime-local)
  const openEdit = (it) => {
    setEditing(it);
    setErrors(null);
    setForm({
      instalacion: it.instalacion?.id ?? it.instalacion ?? "",
      unidad: it.unidad?.id ?? it.unidad ?? "",
      usuario: it.usuario?.id ?? it.usuario ?? "",
      inicio: isoToLocalInput(it.inicio ?? it.inicio),
      fin: isoToLocalInput(it.fin ?? it.fin),
      estado: it.estado ?? "confirmada"
    });
    setModalOpen(true);
  };

  // valida solapamiento (comparando ISO strings o datetime-local converted to ms)
  const overlaps = (aStart, aEnd, bStart, bEnd) => {
    const Astart = new Date(aStart).getTime();
    const Aend = new Date(aEnd).getTime();
    const Bstart = new Date(bStart).getTime();
    const Bend = new Date(bEnd).getTime();
    return (Astart < Bend) && (Bstart < Aend);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);

    // validaciones cliente
    if (!form.instalacion || !form.unidad || !form.inicio || !form.fin) {
      setErrors({ general: "Completa instalación, unidad y rango de fechas." });
      return;
    }
    const inicioISO = localInputToISOString(form.inicio);
    const finISO = localInputToISOString(form.fin);
    if (!inicioISO || !finISO) {
      setErrors({ general: "Formato de fecha inválido." });
      return;
    }
    if (new Date(inicioISO).getTime() >= new Date(finISO).getTime()) {
      setErrors({ general: "Fecha inicio debe ser anterior a fecha fin." });
      return;
    }

    try {
      setSaving(true);
      // obtener reservas existentes de esa instalación para validar solapamientos
      const res = await list("reservas", { instalacion: form.instalacion, page_size: 1000 });
      const existing = res.data.results ?? res.data ?? [];

      const conflict = existing.some(r => {
        if (editing && r.id === editing.id) return false;
        if (!r.inicio || !r.fin) return false;
        return overlaps(inicioISO, finISO, r.inicio, r.fin);
      });

      if (conflict) {
        setErrors({ general: "Conflicto: ya existe una reserva en ese rango para la instalación seleccionada." });
        setSaving(false);
        return;
      }

      // payload usa los nombres que espera el backend: inicio/fin
      const payload = {
        instalacion: form.instalacion,
        unidad: form.unidad,
        usuario: form.usuario || null,
        inicio: inicioISO,
        fin: finISO,
        estado: form.estado
      };

      if (editing) {
        await update("reservas", editing.id, payload);
        // opcional: mensaje
      } else {
        await create("reservas", payload);
      }
      setModalOpen(false);
      fetch();
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      if (data) {
        // mostraremos en UI los errores devueltos por el backend
        const parsed = {};
        Object.entries(data).forEach(([k, v]) => {
          parsed[k] = Array.isArray(v) ? v.join(" ") : String(v);
        });
        setErrors(parsed);
      } else {
        setErrors({ general: "Error al guardar reserva" });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar reserva?")) return;
    try {
      await remove("reservas", id);
      fetch();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar");
    }
  };

  return (
    <section aria-labelledby="reservas-title" className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 id="reservas-title" className="text-2xl font-bold text-gray-800">Reservas</h2>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Buscar..."
              className="rounded-full border px-4 py-2 pl-10 text-sm focus:outline-none"
              aria-label="Buscar reservas"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-md shadow">
            <Plus size={16}/> Nueva Reserva
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Instalación</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Unidad</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Inicio - Fin</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="6" className="p-6 text-center">Cargando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="6" className="p-6 text-center">No hay reservas</td></tr>
            ) : items.map((it, idx) => (
              <tr key={it.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{(page-1)*10 + idx + 1}</td>
                <td className="px-4 py-3 text-sm">{it.instalacion_obj?.nombre ?? getInstalacionLabel(it.instalacion)}</td>
                <td className="px-4 py-3 text-sm">{it.unidad_obj?.numero_unidad ?? getUnidadLabel(it.unidad)}</td>
                <td className="px-4 py-3 text-sm">{getUserLabel(it.usuario_obj ?? it.usuario)}</td>
                <td className="px-4 py-3 text-sm">
                  {it.inicio ? new Date(it.inicio).toLocaleString() : "-"} → {it.fin ? new Date(it.fin).toLocaleString() : "-"}
                </td>
                <td className="px-4 py-3 text-right text-sm space-x-2">
                  <button onClick={() => openEdit(it)} className="p-2 rounded hover:bg-gray-100"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(it.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {count}</div>
        <div className="flex items-center gap-2">
          <button disabled={page===1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 rounded border disabled:opacity-50">Anterior</button>
          <div className="px-3 py-1 border rounded">Página {page}</div>
          <button onClick={() => setPage(p => p+1)} className="px-3 py-1 rounded border">Siguiente</button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 z-10">
            <h3 className="text-lg font-semibold mb-4">{editing ? "Editar reserva" : "Nueva reserva"}</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Instalación</label>
                  <select required value={form.instalacion} onChange={(e)=>setForm({...form, instalacion: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
                    <option value="">Seleccionar</option>
                    {instalaciones.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Unidad</label>
                  <select required value={form.unidad} onChange={(e)=>setForm({...form, unidad: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
                    <option value="">Seleccionar</option>
                    {unidades.map(u => <option key={u.id} value={u.id}>{u.numero_unidad} — {u.condominio?.nombre ?? ""}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario (opcional)</label>
                  <select value={form.usuario} onChange={(e)=>setForm({...form, usuario: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
                    <option value="">Sin asignar</option>
                    {users.map(u => <option key={u.id} value={u.id}>{(u.first_name || u.last_name) ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() : (u.username ?? u.email)}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select value={form.estado} onChange={(e)=>setForm({...form, estado: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha inicio</label>
                  <input required type="datetime-local" value={form.inicio} onChange={(e)=>setForm({...form, inicio: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha fin</label>
                  <input required type="datetime-local" value={form.fin} onChange={(e)=>setForm({...form, fin: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2"/>
                </div>
              </div>

              {errors?.general && <div className="text-sm text-red-600">{errors.general}</div>}
              {/* mostrar errores por campo retornados por backend */}
              {Object.entries(errors ?? {}).filter(([k]) => k !== "general").map(([k,v]) => (
                <div key={k} className="text-sm text-red-600">{k}: {v}</div>
              ))}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded border">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-cyan-600 text-white">{saving ? "Guardando..." : (editing ? "Guardar" : "Crear")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}
