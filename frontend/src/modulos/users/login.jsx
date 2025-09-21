// src/Login.jsx
import { useState } from "react";
import api from "../../services/api";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await api.post('token/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      alert("Login exitoso");
    } catch (err) {
      console.error(err);
      alert("Usuario o contraseña incorrecta");
    };
  };

  return (
    <div>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuario" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;