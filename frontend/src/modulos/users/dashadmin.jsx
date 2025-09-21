// src/AdminDashboard.jsx
import { useState } from "react";
import {
  Home,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { name: "Inicio", icon: Home },
  { name: "Residentes", icon: Users },
  { name: "Reportes", icon: FileText },
  { name: "Configuración", icon: Settings },
];

export default function AdminDashboard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        {/* Navbar grande */}
        <nav className="hidden md:flex max-w-7xl mx-auto px-6 py-4 justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">Koa Admin</h1>
          <ul className="flex space-x-6">
            {navItems.map((item) => (
              <li key={item.name}>
                <a
                  href="#"
                  className="flex items-center space-x-2 hover:text-indigo-600"
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </a>
              </li>
            ))}
            <li>
              <a
                href="#"
                className="flex items-center space-x-2 text-red-500 hover:text-red-700"
              >
                <LogOut size={18} />
                <span>Salir</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Navbar móvil */}
        <div className="md:hidden flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              aria-label="Abrir menú"
              onClick={() => setOpen(true)}
              className="p-1"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-indigo-600">Koa Admin</h1>
          </div>
        </div>
      </header>

      {/* Sidebar móvil como aside */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40">
          <aside
            className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg p-6 z-50"
            aria-label="Menú de navegación"
          >
            {/* Botón cerrar */}
            <button
              className="absolute top-4 right-4"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={24} />
            </button>

            <ul className="mt-10 space-y-6">
              {navItems.map((item) => (
                <li key={item.name}>
                  <a
                    href="#"
                    className="flex items-center space-x-3 hover:text-indigo-600"
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#"
                  className="flex items-center space-x-3 text-red-500 hover:text-red-700"
                >
                  <LogOut size={20} />
                  <span>Salir</span>
                </a>
              </li>
            </ul>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold">Bienvenido Administrador</h2>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article className="bg-white p-6 rounded-xl shadow">
            📊 Reporte de ocupación
          </article>
          <article className="bg-white p-6 rounded-xl shadow">
            📋 Solicitudes pendientes
          </article>
          <article className="bg-white p-6 rounded-xl shadow">
            🔔 Notificaciones recientes
          </article>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Koa. Todos los derechos reservados.
      </footer>
    </div>
  );
}
