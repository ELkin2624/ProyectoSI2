// src/modulos/users/DashAdmin.jsx

import { useState } from "react";
import {
  Home, Users, BarChart2, Search, HelpCircle, 
  Settings, Bell, User, LogOut
} from "lucide-react";
import LogoReact from '../../assets/react.svg';


const handleLogout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login'; // o useNavigate para redirigir
};

// --- Módulos del Dashboard ---
// NOTA: En una aplicación real, cada uno de estos componentes debería estar en su propio archivo
// y ser importado aquí. Por ejemplo: import Inicio from './modulos/Inicio';
const Inicio = () => (
  <section aria-labelledby="inicio-title">
    <h2 id="inicio-title" className="text-2xl font-bold text-gray-800 mb-4">Dashboard de Inicio</h2>
    <div className="p-6 bg-white rounded-xl shadow-md">
      <p>Contenido principal del dashboard de bienvenida.</p>
    </div>
  </section>
);

const Residentes = () => (
  <section aria-labelledby="residentes-title">
    <h2 id="residentes-title" className="text-2xl font-bold text-gray-800 mb-4">Gestión de Residentes</h2>
    <div className="p-6 bg-white rounded-xl shadow-md">
      <p>Aquí se mostrará la tabla o lista para gestionar a los residentes.</p>
    </div>
  </section>
);

const Reportes = () => (
  <section aria-labelledby="reportes-title">
    <h2 id="reportes-title" className="text-2xl font-bold text-gray-800 mb-4">Reportes y Estadísticas</h2>
    <div className="p-6 bg-white rounded-xl shadow-md">
      <p>Aquí se mostrarán los gráficos y datos de los reportes.</p>
    </div>
  </section>
);

// 1. Array de configuración del sidebar.
// Lo movemos fuera del componente para que no se re-declare en cada renderizado.
const sidebarItems = [
  { name: "Inicio", icon: <Home size={22} />, component: <Inicio /> },
  { name: "Residentes", icon: <Users size={22} />, component: <Residentes /> },
  { name: "Reportes", icon: <BarChart2 size={22} />, component: <Reportes /> },
];


export default function DashAdmin() {
  const [activeItem, setActiveItem] = useState(sidebarItems[0]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* Sidebar: Menú de navegación principal */}
      <aside 
        className="w-20 md:w-60 bg-indigo-600 text-white flex flex-col shadow-lg transition-all duration-300"
        aria-label="Menú lateral principal"
      >
        {/* Logo */}
        <header className="flex items-center justify-center gap-2 px-4 py-6 border-b border-indigo-700">
          <img src={LogoReact} alt="Logo Koa" className="h-9 w-9" />
          <span className="hidden md:block font-bold text-xl text-white">Koa</span>
        </header>

        {/* Navegación principal */}
        <nav className="flex flex-col gap-2 p-2 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              title={item.name}
              className={`flex items-center justify-center md:justify-start gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                activeItem.name === item.name 
                  ? "bg-amber-500 text-white shadow-md" 
                  : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
              }`}
              onClick={() => setActiveItem(item)}
              aria-current={activeItem.name === item.name ? "page" : undefined}
            >
              {item.icon}
              <span className="hidden md:block">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Footer del Sidebar (ej. botón de salir) */}
        <footer className="p-2">
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="w-full flex items-center justify-center md:justify-start gap-3 rounded-md px-3 py-3 text-sm font-medium text-indigo-200 hover:bg-indigo-700 hover:text-white transition-colors duration-200"
          >
            <LogOut size={22} />
            <span className="hidden md:block">Cerrar Sesión</span>
          </button>
        </footer>
      </aside>

      {/* Contenedor del contenido principal */}
      <div className="flex-1 flex flex-col">
        
        {/* Header superior */}
        <header className="sticky top-0 z-10 w-full border-b bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Título del módulo activo */}
            <h1 className="text-2xl font-bold text-gray-800">
              {activeItem.name}
            </h1>
            
            <div className="flex items-center gap-6">
              {/* Búsqueda */}
              <div className="relative hidden lg:block">
                <label htmlFor="search-app" className="sr-only">Buscar</label>
                <input
                  id="search-app"
                  type="search"
                  placeholder="Buscar en la app..."
                  className="w-full max-w-xs rounded-full border border-gray-300 px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              {/* Acciones de Usuario y Notificaciones */}
              <div className="flex items-center space-x-4 text-gray-500">
                <button aria-label="Ayuda" className="p-2 rounded-full hover:bg-gray-100 transition-colors"><HelpCircle size={22} /></button>
                <button aria-label="Configuración" className="p-2 rounded-full hover:bg-gray-100 transition-colors"><Settings size={22} /></button>
                <button aria-label="Notificaciones" className="p-2 rounded-full hover:bg-gray-100 transition-colors"><Bell size={22} /></button>
                <button aria-label="Perfil de usuario" className="p-1 rounded-full hover:ring-2 hover:ring-indigo-400 transition-all">
                  <User className="h-8 w-8 rounded-full bg-indigo-200 text-indigo-600 p-1" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Área de contenido dinámico */}
        <main className="p-6 lg:p-8 flex-1 overflow-y-auto" role="main">
          {activeItem.component}
        </main>
      </div>
    </div>
  );
}