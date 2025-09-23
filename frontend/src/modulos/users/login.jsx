// src/modulos/users/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; 

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // endpoint según tu backend: /api/auth/login/
      const res = await api.post('auth/login/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);

      // opción: configurar header por defecto después de login
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;

      alert("Login exitoso");
      navigate('/admin'); // redirigir al dashboard
    } catch (err) {
      console.error(err);
      alert("Usuario o contraseña incorrecta");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Iniciar sesión</h2>
      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Usuario"
        className="w-full mb-3 p-2 border rounded"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full mb-4 p-2 border rounded"
      />
      <button onClick={handleLogin} className="w-full bg-indigo-600 text-white py-2 rounded">
        Login
      </button>
    </div>
  );
}
