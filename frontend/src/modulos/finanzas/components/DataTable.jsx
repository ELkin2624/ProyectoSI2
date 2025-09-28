// src/modulos/finanzas/components/DataTable.jsx
import React from "react";

export default function DataTable({ columns, data, actions }) {
  return (
    <div className="overflow-x-auto rounded-2xl shadow-md bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3">{col.header}</th>
            ))}
            {actions && <th className="px-4 py-3">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, i) => (
              <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className="px-4 py-3 align-top max-w-xs">
                    {col.render ? col.render(row) : getValue(row, col.accessor)}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {actions.map((act, k) => (
                        <button
                          key={k}
                          title={act.title}
                          onClick={() => act.onClick(row)}
                          className={act.className || "px-2 py-1 text-sm rounded"}
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={(columns.length + (actions ? 1 : 0))} className="text-center py-6 text-gray-500">
                No hay registros
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// helper para soportar fk object o id
function getValue(row, accessor) {
  if (!accessor) return "";
  const parts = accessor.split(".");
  let val = row;
  for (let p of parts) {
    if (val === null || val === undefined) return "";
    val = val[p];
  }
  // si es fecha ISO, solo cortar (opcional)
  if (typeof val === "string" && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
    return new Date(val).toLocaleString();
  }
  return val ?? "";
}
