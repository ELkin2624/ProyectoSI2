// src/modulos/users/ChangePassword.jsx
import React, { useState } from 'react';
import api from '../../services/api';

export default function ChangePassword() {
  const [oldPassword, setOld] = useState('');
  const [newPassword, setNew] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('auth/change-password/', { old_password: oldPassword, new_password: newPassword });
      alert('Contraseña cambiada');
      setOld(''); setNew('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.old_password ? err.response.data.old_password.join(', ') : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-4 max-w-md">
      <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
      <input type="password" placeholder="Contraseña actual" value={oldPassword} onChange={e=>setOld(e.target.value)} className="w-full p-2 border rounded mt-3"/>
      <input type="password" placeholder="Nueva contraseña" value={newPassword} onChange={e=>setNew(e.target.value)} className="w-full p-2 border rounded mt-3"/>
      <button className="mt-3 px-3 py-2 bg-cyan-600 text-white rounded" disabled={loading}>{loading?'Guardando...':'Cambiar'}</button>
    </form>
  );
}
