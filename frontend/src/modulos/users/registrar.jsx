// src/modulos/users/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // ajusta según tu estructura

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !email || password.length < 8) {
      alert("Completa los campos. La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // 1) Crear usuario en el endpoint público de registro
      await api.post("auth/register/", { username, email, password });

      // 2) Hacer login automático para obtener tokens
      const res = await api.post("auth/login/", { username, password });
      const { access, refresh } = res.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // ajustar header por defecto para futuras peticiones
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      alert("Usuario creado y sesión iniciada.");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      // intentar mostrar mensaje específico del backend si existe
      if (err.response && err.response.data) {
        // err.response.data puede ser { username: [...], password: [...] } o string
        const data = err.response.data;
        if (typeof data === "string") alert(data);
        else {
          // concatenar errores
          const messages = Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("\n");
          alert(messages);
        }
      } else {
        alert("Error al crear usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Crear cuenta</h2>

      <input
        placeholder="Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Contraseña (min 8 caracteres)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-60"
      >
        {loading ? "Creando..." : "Registrar"}
      </button>
    </div>
  );
}
