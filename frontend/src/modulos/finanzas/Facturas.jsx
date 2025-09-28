// src/modulos/finanzas/Facturas.jsx
import React, { useEffect, useState } from "react";
import DataTable from "./components/DataTable";
import ModalForm from "./components/ModalForm";
import ModalPago from "./components/ModalPago";
import {
  listFacturas,
  createFactura,
  updateFactura,
  deleteFactura,
  listMorosos,
  pagarFactura,
} from "../../services/finanzas";
import { listCondominios, listUnidades } from "../../services/facilidades";

function fmtCurrency(v) {
  try { return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch { return v; }
}
function shortDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString();
}

export default function Facturas() {
  // estados (igual que antes)...
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [morosos, setMorosos] = useState([]);
  const [showMorososModal, setShowMorososModal] = useState(false);

  const [openPagoModal, setOpenPagoModal] = useState(false);
  const [pagoInitial, setPagoInitial] = useState({});

  const [estadoFilter, setEstadoFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [condominios, setCondominios] = useState([]);
  const [unidadesAll, setUnidadesAll] = useState([]);
  const [condoMap, setCondoMap] = useState({});
  const [unidadMap, setUnidadMap] = useState({});

  async function fetchCondos() {
    try {
      const res = await listCondominios();
      const list = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
      setCondominios(list);
      const m = {};
      list.forEach(c => m[c.id] = c);
      setCondoMap(m);
    } catch (err) { console.error(err); }
  }
  async function fetchUnidadesAll() {
    try {
      const res = await listUnidades();
      const list = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
      setUnidadesAll(list);
      const m = {};
      list.forEach(u => m[u.id] = u);
      setUnidadMap(m);
    } catch (err) { console.error(err); }
  }

  async function fetchFacturas() {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize };
      if (estadoFilter) params.estado = estadoFilter;
      if (search) params.search = search;
      const res = await listFacturas(params);
      if (res.data && Array.isArray(res.data.results)) {
        setFacturas(res.data.results);
        setTotal(res.data.count ?? res.data.results.length);
      } else {
        setFacturas(Array.isArray(res.data) ? res.data : []);
        setTotal(Array.isArray(res.data) ? res.data.length : 0);
      }
    } catch (err) {
      console.error(err);
      alert("Error al obtener facturas");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    fetchFacturas();
    fetchCondos();
    fetchUnidadesAll();
    // eslint-disable-next-line
  }, [page, estadoFilter, search]);

  // create/update handlers (devuelven promesa)
  async function handleCreate(payload) {
    return createFactura(payload).then(res => {
      setOpenModal(false);
      setPage(1);
      fetchFacturas();
      return res;
    });
  }
  async function handleUpdate(payload) {
    if (!editing || !editing.id) throw new Error("No invoice selected");
    return updateFactura(editing.id, payload).then(res => {
      setEditing(null);
      setOpenModal(false);
      fetchFacturas();
      return res;
    });
  }

  async function handleDelete(row) {
    if (!confirm(`Eliminar factura ${row.numero_factura}?`)) return;
    try {
      await deleteFactura(row.id);
      fetchFacturas();
    } catch (err) { console.error(err); alert("Error al eliminar"); }
  }

  // abrir modal pago prellenado
  function handleOpenMarkPaid(row) {
    setPagoInitial({
      factura: row.id,
      unidad: (typeof row.unidad === "object") ? row.unidad.id : row.unidad,
      usuario: "", // preferimos que admin seleccione o autocomplete sugiera
      monto: row.monto,
      metodo: "cash",
    });
    setOpenPagoModal(true);
  }

  // ahora usamos pago atómico via endpoint factura/{id}/pagar/
  async function handleCreatePagoAndMarkFactura(form) {
    if (!form.factura) throw new Error("Factura id requerido");
    try {
      const res = await pagarFactura(form.factura, form);
      setOpenPagoModal(false);
      fetchFacturas();
      return res;
    } catch (err) {
      // rethrow para que modal muestre errores inline
      throw err;
    }
  }

  async function fetchMorosos() {
    try {
      const res = await listMorosos();
      setMorosos(res.data ?? []);
      setShowMorososModal(true);
    } catch (err) {
      console.error(err);
      alert("Error al obtener morosos");
    }
  }

  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  function goto(p) { if (p < 1) p = 1; if (p > lastPage) p = lastPage; setPage(p); }

  function showCondominio(val) {
    if (!val && val !== 0) return "";
    if (typeof val === "object") return val.nombre ?? val.id;
    return condoMap[val]?.nombre ?? String(val);
  }
  function showUnidad(val) {
    if (!val && val !== 0) return "";
    if (typeof val === "object") return val.numero_unidad ?? val.id;
    return unidadMap[val]?.numero_unidad ?? String(val);
  }

  // badge helper
  function EstadoBadge({ estado }) {
    const base = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    if (estado === "pendiente") return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pendiente</span>;
    if (estado === "pagada") return <span className={`${base} bg-green-100 text-green-800`}>Pagada</span>;
    if (estado === "vencida") return <span className={`${base} bg-red-100 text-red-800`}>Vencida</span>;
    return <span className={`${base} bg-gray-100 text-gray-800`}>{estado}</span>;
  }

  const columns = [
    { header: "N° Factura", accessor: "numero_factura" },
    { header: "Condominio", accessor: "condominio", render: (r) => showCondominio(r.condominio) },
    { header: "Unidad", accessor: "unidad", render: (r) => showUnidad(r.unidad) },
    { header: "Monto", accessor: "monto", render: (r) => fmtCurrency(r.monto) },
    { header: "Estado", accessor: "estado", render: (r) => <EstadoBadge estado={r.estado} /> },
    { header: "Fecha Venc.", accessor: "fecha_vencimiento", render: (r) => shortDate(r.fecha_vencimiento) },
  ];

  const actions = [
    { label: "Ver", title: "Ver detalle", onClick: (r) => alert(JSON.stringify(r, null, 2)), className: "px-2 py-1 bg-gray-100 rounded" },
    { label: "Editar", title: "Editar factura", onClick: (r) => { setEditing(r); setOpenModal(true); }, className: "px-2 py-1 bg-yellow-100 rounded" },
    { label: "Pagar", title: "Registrar pago", onClick: handleOpenMarkPaid, className: "px-2 py-1 bg-green-100 rounded" },
    { label: "Eliminar", title: "Eliminar", onClick: handleDelete, className: "px-2 py-1 bg-red-100 rounded" },
  ];

  return (
    <section className="p-6">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Facturas</h2>
          <p className="text-sm text-gray-500">Gestión de facturas — búsqueda, filtros y morosos.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => { setEditing(null); setOpenModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700">Nueva Factura</button>
          <button onClick={fetchMorosos} className="px-4 py-2 bg-orange-600 text-white rounded-xl shadow hover:bg-orange-700">Ver Morosos</button>
          <button onClick={() => fetchFacturas()} className="px-4 py-2 bg-gray-200 rounded-xl">Actualizar</button>
        </div>
      </header>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex gap-2 items-center">
          <input
            placeholder="Buscar por N° factura..."
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            className="px-3 py-2 border rounded w-64"
          />
          <select value={estadoFilter} onChange={(e) => { setPage(1); setEstadoFilter(e.target.value); }} className="px-3 py-2 border rounded">
            <option value="">Todos</option>
            <option value="pendiente">pendiente</option>
            <option value="pagada">pagada</option>
            <option value="vencida">vencida</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">Mostrando {facturas.length} de {total}</div>
      </div>

      {loading ? <div className="p-6">Cargando...</div> : <DataTable columns={columns} data={facturas} actions={actions} />}

      {/* pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Página {page} de {lastPage}</div>
        <div className="flex gap-2">
          <button onClick={() => goto(1)} className="px-3 py-1 rounded border" disabled={page===1}>Primera</button>
          <button onClick={() => goto(page-1)} className="px-3 py-1 rounded border" disabled={page===1}>Anterior</button>
          <button onClick={() => goto(page+1)} className="px-3 py-1 rounded border" disabled={page===lastPage}>Siguiente</button>
          <button onClick={() => goto(lastPage)} className="px-3 py-1 rounded border" disabled={page===lastPage}>Última</button>
        </div>
      </div>

      <ModalForm
        open={openModal}
        onClose={() => { setOpenModal(false); setEditing(null); }}
        initial={editing ?? {}}
        condominioOptions={condominios}
        unidadOptions={unidadesAll}
        onSubmit={async (form) => {
          if (editing && editing.id) {
            return handleUpdate(form);
          } else {
            return handleCreate(form);
          }
        }}
      />

      <ModalPago
        open={openPagoModal}
        onClose={() => setOpenPagoModal(false)}
        initial={pagoInitial}
        unidadOptions={unidadesAll}
        onSubmit={async (form) => {
          return handleCreatePagoAndMarkFactura(form);
        }}
      />

      {/* Morosos modal */}
      {showMorososModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Reporte de Morosos</h3>
              <button onClick={() => setShowMorososModal(false)} className="text-sm text-gray-600">Cerrar</button>
            </div>

            <div className="grid gap-3 max-h-[60vh] overflow-auto">
              {morosos.length === 0 ? (
                <div className="text-sm text-gray-500">No hay morosos.</div>
              ) : morosos.map((m, idx) => (
                <div key={idx} className="p-3 bg-yellow-50 rounded">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{m.unidad} — {m.condominio}</div>
                      <div className="text-sm text-gray-600">Total pendiente: {fmtCurrency(m.total_pendiente)}</div>
                    </div>
                  </div>
                  <ul className="mt-2 text-sm">
                    {m.facturas.map((f, i2) => (
                      <li key={i2} className="text-gray-700">{f.numero_factura} — {fmtCurrency(f.monto)} — vence {f.fecha_vencimiento}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
