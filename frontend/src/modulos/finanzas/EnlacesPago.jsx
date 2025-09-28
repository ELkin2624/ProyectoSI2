// src/modulos/finanzas/EnlacesPago.jsx
import React, { useEffect, useState } from "react";
import DataTable from "./components/DataTable";

export default function EnlacesPago() {
  const [enlaces, setEnlaces] = useState([]);

  useEffect(() => {
    fetch("/api/finanzas/enlaces-pago/", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setEnlaces(data));
  }, []);

  const columns = [
    { header: "Enlace", accessor: "enlace" },
    { header: "Condominio", accessor: "condominio" },
    { header: "Unidad", accessor: "unidad" },
    { header: "Monto", accessor: "monto" },
    { header: "Estado", accessor: "estado" },
    { header: "Expira", accessor: "expira_en" },
  ];

  return (
    <section className="p-6">
      <header className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Enlaces de Pago</h2>
        <button className="px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700">
          Nuevo Enlace
        </button>
      </header>
      <DataTable columns={columns} data={enlaces} />
    </section>
  );
}
