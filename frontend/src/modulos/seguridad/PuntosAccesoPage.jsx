// File: src/modulos/seguridad/PuntosAccesoPage.jsx
import React, { useEffect, useState } from "react";
import { getPuntosAcceso, createPuntoAcceso, updatePuntoAcceso, deletePuntoAcceso } from "../../services/seguridad";

function PuntoForm({ onSubmit, initial = {}, onCancel }) {
  const [form, setForm] = useState({ nombre: "", tipo: "", ubicacion: {}, ...initial });
  useEffect(()=> setForm(s=>({ ...s, ...initial })), [initial]);
  return (
    <form onSubmit={e=>{ e.preventDefault(); onSubmit(form); }} className="space-y-2">
      <input value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} placeholder="Nombre" className="p-2 border rounded w-full" />
      <input value={form.tipo} onChange={e=>setForm({...form, tipo: e.target.value})} placeholder="Tipo" className="p-2 border rounded w-full" />
      <div className="flex gap-2">
        <button className="bg-cyan-600 text-white px-4 py-2 rounded">Guardar</button>
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancelar</button>}
      </div>
    </form>
  );
}

export default function PuntosAccesoPage(){
  const [puntos, setPuntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetch = async ()=>{
    setLoading(true);
    try{ const res = await getPuntosAcceso(); setPuntos(res.data); }catch(e){console.error(e);}finally{setLoading(false);} };
  useEffect(()=>{fetch()}, []);

  const handleCreate = async (data) => { try{ await createPuntoAcceso(data); setCreating(false); fetch(); }catch(e){console.error(e);} };
  const handleUpdate = async (data) => { try{ await updatePuntoAcceso(editing.id, data); setEditing(null); fetch(); }catch(e){console.error(e);} };
  const handleDelete = async (id) => { if(!confirm('Eliminar punto?')) return; try{ await deletePuntoAcceso(id); fetch(); }catch(e){console.error(e);} };

  if(loading) return <div>Cargando puntos de acceso...</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Puntos de Acceso</h2>
        <button onClick={()=>setCreating(!creating)} className="px-3 py-1 bg-cyan-600 text-white rounded">{creating? 'Cerrar':'Nuevo punto'}</button>
      </div>

      {creating && <PuntoForm onSubmit={handleCreate} onCancel={()=>setCreating(false)} />}

      <table className="w-full text-left mt-4">
        <thead><tr className="bg-gray-100"><th className="p-2">Nombre</th><th className="p-2">Tipo</th><th className="p-2">Acciones</th></tr></thead>
        <tbody>
          {puntos.map(p=> (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.nombre}</td>
              <td className="p-2">{p.tipo}</td>
              <td className="p-2 flex gap-2">
                <button onClick={()=>setEditing(p)} className="px-2 py-1 border rounded">Editar</button>
                <button onClick={()=>handleDelete(p.id)} className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (<div className="mt-4"><h3 className="font-semibold">Editar Punto</h3><PuntoForm initial={editing} onSubmit={handleUpdate} onCancel={()=>setEditing(null)} /></div>)}
    </div>
  );
}
