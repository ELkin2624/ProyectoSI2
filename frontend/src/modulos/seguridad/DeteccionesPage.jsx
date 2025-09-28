// File: src/modulos/seguridad/DeteccionesPage.jsx
import React, { useEffect, useState } from "react";
import { getDeteccionesPlacas, getDeteccionesRostros, deleteDeteccionPlaca, deleteDeteccionRostro } from "../../services/seguridad";

export default function DeteccionesPage(){
  const [placas, setPlacas] = useState([]);
  const [rostros, setRostros] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async ()=>{
    setLoading(true);
    try{
      const [pRes, rRes] = await Promise.all([getDeteccionesPlacas(), getDeteccionesRostros()]);
      setPlacas(pRes.data);
      setRostros(rRes.data);
    }catch(e){console.error(e);}finally{setLoading(false);}    
  };

  useEffect(()=>{ fetch() }, []);

  const removePlaca = async (id)=>{ if(!confirm('Eliminar detección?')) return; try{ await deleteDeteccionPlaca(id); fetch(); }catch(e){console.error(e);} };
  const removeRostro = async (id)=>{ if(!confirm('Eliminar detección?')) return; try{ await deleteDeteccionRostro(id); fetch(); }catch(e){console.error(e);} };

  if(loading) return <div>Cargando detecciones...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Detecciones - Placas</h3>
        <table className="w-full text-left"><thead><tr className="bg-gray-100"><th className="p-2">Placa detectada</th><th className="p-2">Confianza</th><th className="p-2">Camara</th><th className="p-2">Acciones</th></tr></thead>
        <tbody>{placas.map(p=> <tr key={p.id} className="border-b"><td className="p-2">{p.placa_detectada}</td><td className="p-2">{p.confianza}</td><td className="p-2">{p.camara_id}</td><td className="p-2"><button onClick={()=>removePlaca(p.id)} className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button></td></tr>)}</tbody>
        </table>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Detecciones - Rostros</h3>
        <table className="w-full text-left"><thead><tr className="bg-gray-100"><th className="p-2">Rostro ID</th><th className="p-2">Confianza</th><th className="p-2">Usuario</th><th className="p-2">Acciones</th></tr></thead>
        <tbody>{rostros.map(r=> <tr key={r.id} className="border-b"><td className="p-2">{r.rostro_id}</td><td className="p-2">{r.confianza}</td><td className="p-2">{r.usuario?.username ?? r.usuario}</td><td className="p-2"><button onClick={()=>removeRostro(r.id)} className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}