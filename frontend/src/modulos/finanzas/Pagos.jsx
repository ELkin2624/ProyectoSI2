// src/modulos/finanzas/Pagos.jsx
import React, { useEffect, useState } from "react";
import DataTable from "./components/DataTable";
import ModalPago from "./components/ModalPago";
import { listPagos, createPago } from "../../services/finanzas";
import { listUnidades } from "../../services/facilidades";

function shortDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString();
}
function showFK(x) {
  if (!x && x !== 0) return "";
  if (typeof x === "object") {
    return x.username ?? x.numero_unidad ?? x.id;
  }
  return x;
}

export default function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [unidades, setUnidades] = useState([]);

  async function fetchPagos() {
    setLoading(true);
    try {
      const res = await listPagos();
      setPagos(Array.isArray(res.data) ? res.data : (res.data.results ?? []));
    } catch (err) {
      console.error(err);
      alert("Error al obtener pagos");
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnidades() {
    try {
      const res = await listUnidades();
      setUnidades(Array.isArray(res.data) ? res.data : (res.data.results ?? []));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchPagos();
    fetchUnidades();
  }, []);

  async function handleCreatePago(payload) {
    try {
      await createPago(payload);
      setOpenModal(false);
      fetchPagos();
    } catch (err) {
      // dejar que Modal muestre errores inline
      throw err;
    }
  }

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Usuario", accessor: "usuario", render: (r) => showFK(r.usuario) },
    { header: "Unidad", accessor: "unidad", render: (r) => showFK(r.unidad) },
    { header: "Monto", accessor: "monto" },
    { header: "Método", accessor: "metodo" },
    { header: "Estado", accessor: "estado" },
    { header: "Fecha Pago", accessor: "pagado_en", render: (r) => shortDate(r.pagado_en) },
  ];

  return (
    <section className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pagos</h2>
          <p className="text-sm text-gray-500">Lista de pagos y registro manual (admin).</p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setOpenModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700">Nuevo Pago</button>
          <button onClick={fetchPagos} className="px-4 py-2 bg-gray-200 rounded-xl">Actualizar</button>
        </div>
      </header>

      {loading ? <div>Cargando...</div> : <DataTable columns={columns} data={pagos} />}

      <ModalPago
        open={openModal}
        onClose={() => setOpenModal(false)}
        unidadOptions={unidades}
        onSubmit={async (form) => {
          return handleCreatePago(form);
        }}
      />
    </section>
  );
}
