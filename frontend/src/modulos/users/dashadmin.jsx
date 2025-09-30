import React, { useState, Suspense, lazy } from "react";
import {
  Home, Users, Building, CalendarCheck, AlertTriangle, 
  FileText, Search, Settings, Bell, LogOut, DollarSign,
  ClipboardList, Shield, Bot
} from "lucide-react";
import api from '../../services/api';
import MenuHorizontal from "../../components/MenuHorizontal"; 

const Inicio = lazy(() => import("./Inicio"));
const AdminUsersDashboard = lazy (() => import("./admin/AdminUsersDashboard"))

const Condominios = lazy(() => import("../facilidades/Condominios"));
const Unidades = lazy(() => import("../facilidades/Unidades"));
const Instalaciones = lazy(() => import("../facilidades/Instalaciones"));
const Reservas = lazy(() => import("../facilidades/Reservas"));
const Incidencias = lazy(() => import("../facilidades/Incidencias"));
const Adjuntos = lazy(() => import("../facilidades/Adjuntos"));
const ResidentesUnidad = lazy(() => import ("../facilidades/ResidentesUnidad"));
const Indisponibilidades = lazy(() => import("../facilidades/Indisponibilidades"));

const Facturas = lazy(() => import("../finanzas/Facturas"))
const Pagos = lazy(() => import("../finanzas/Pagos"))
const EnlacesPago = lazy(() => import("../finanzas/EnlacesPago"))
const Cargos = lazy(() => import("../finanzas/Cargos"))

const Reportes = lazy(() => import("../reportes/Reportes"))

const SeguridadDashboard = lazy(() => import("../seguridad/SeguridadDashboard"))
const VehiculosPage = lazy(() => import("../seguridad/VehiculosPage"))
const PuntosAccesoPage = lazy(() => import("../seguridad/PuntosAccesoPage"))
const RegistrosAccesoPage = lazy(() => import("../seguridad/RegistrosAccesoPage"))
const AlertasPanicoPage = lazy(() => import("../seguridad/AlertasPanicoPage"))
const DeteccionesPage = lazy(() => import("../seguridad/DeteccionesPage"))

const Loader = () => (
  <div className="flex justify-center items-center h-full w-full">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-500"></div>
  </div>
);

const handleLogout = async () => {
  const refresh = localStorage.getItem('refresh_token');
  try {
    if (refresh) {
      await api.post('auth/logout/', { refresh }); 
      console.log("Llamada a la API para hacer logout...");
    }
  } catch (err) {
    console.warn('Logout backend falló (ignorado):', err);
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    if (api?.defaults?.headers?.common) {
      api.defaults.headers.common['Authorization'] = null;
    }    
    window.location.href = '/login';
  }
};

const sidebarItems = [
  { name: "Inicio", icon: Home, component: <Inicio /> },
  { name: "Usuarios", icon: Users, component: <AdminUsersDashboard /> },
  { name: "Facilidades", icon: Building, component: <Condominios />,
    subMenu: [
      { name: "Condominios", component: <Condominios /> },
      { name: "Unidades", component: <Unidades /> },
      { name: "Instalaciones", component: <Instalaciones /> },
      { name: "Reservas", icon: CalendarCheck, component: <Reservas /> },
      { name: "Incidencias", icon: AlertTriangle, component: <Incidencias /> },
      { name: "Adjuntos", icon: FileText, component: <Adjuntos /> },
      { name: "Residentes", component: <ResidentesUnidad /> },
      {name: "Indisponibilidades", icon: Suspense, component: <Indisponibilidades />}
    ],
  },
  { name: "Finanzas", icon: DollarSign, component: Facturas,
    subMenu: [
      { name: "Facturas", component: <Facturas /> },
      { name: "Pagos", component: <Pagos /> },
      { name: "EnlacesPago", component: <EnlacesPago /> },
      { name: "Cargos", component: <Cargos /> }
    ],
  },
  { name: "Reportes", icon: ClipboardList, component: <Reportes />,
    subMenu: [
      { name: "Dashboard", component: <Reportes /> },
      // { name: "Morosidad", component: <ReportesModule /> },
      // { name: "General", component: <ReportesModule /> },
    ]
  },
  { name: "Seguridad", icon: Shield, component: <SeguridadDashboard />,
    subMenu: [
      { name: "Dashboard", component: <SeguridadDashboard /> },
      { name: "Vehiculos", component: <VehiculosPage /> },
      { name: "Puntos de acceso", component: <PuntosAccesoPage /> },
      { name: "Registros de acceso", component: <RegistrosAccesoPage /> },
      { name: "Alertas de pánico", component: <AlertasPanicoPage /> },
      { name: "Detecciones", component: <DeteccionesPage /> },
    ]
  },
];

export default function DashAdmin() {
  const [activeItem, setActiveItem] = useState(sidebarItems[0]);
  const [activeSubItem, setActiveSubItem] = useState(null); 
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const subMenuItems = activeItem.subMenu || [];

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      {/* ===== Sidebar: Menú de navegación principal ===== */}
      <aside
        className={`bg-gradient-to-b from-cyan-600 to-cyan-700 text-white flex flex-col shadow-2xl transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
        aria-label="Menú principal"
      >
        {/* Logo y Nombre */}
        <header className="flex items-center justify-center gap-3 px-4 py-6 border-b border-white/10">
          <img src="https://placehold.co/40x40/FFFFFF/333333?text=K" alt="Logo Koa" className="h-10 w-10 rounded-lg" />
          <span className={`font-bold text-xl whitespace-nowrap transition-opacity duration-200 ${!isSidebarOpen && "opacity-0 hidden"}`}>
            Koa
          </span>
        </header>

        {/* Navegación principal */}
        <nav className="flex-1 p-3 space-y-2">
          <ul role="list">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem.name === item.name;
              return (
                <li key={item.name}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveItem(item);
                      setActiveSubItem(item.subMenu ? item.subMenu[0] : null);
                    }}
                    title={item.name}
                    className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? "bg-white/20 text-white shadow-inner"
                        : "text-cyan-100 hover:bg-white/10 hover:text-white"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon size={22} className="flex-shrink-0" />
                    <span className={`whitespace-nowrap transition-opacity duration-200 ${!isSidebarOpen && "opacity-0 hidden"}`}>{item.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer del Sidebar */}
        <footer className="p-3">
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="w-full flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium text-cyan-100 hover:bg-red-500/80 hover:text-white transition-colors duration-200"
          >
            <LogOut size={22} />
             <span className={`whitespace-nowrap transition-opacity duration-200 ${!isSidebarOpen && "opacity-0 hidden"}`}>Cerrar Sesión</span>
          </button>
        </footer>
      </aside>

      {/* ===== Contenedor del contenido principal ===== */}
      <div className="flex-1 flex flex-col">
        {/* Header superior */}
        <header className="sticky top-0 z-20 w-full border-b bg-white/80 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               {/* Botón para expandir/colapsar sidebar */}
               <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Toggle sidebar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"></line><line x1="3" x2="21" y1="12" y2="12"></line><line x1="3" x2="21" y1="18" y2="18"></line></svg>
               </button>
              {/* Título del módulo activo */}
              <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">
                {activeItem.name}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Búsqueda */}
              <div className="relative hidden md:block">
                <label htmlFor="search-app" className="sr-only">Buscar</label>
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="search-app"
                  type="search"
                  placeholder="Buscar..."
                  className="w-full max-w-xs rounded-full border bg-gray-100 px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>

              {/* Acciones de Usuario */}
              <div className="flex items-center space-x-2 text-gray-500">
                <button aria-label="Notificaciones" className="p-2 rounded-full hover:bg-gray-200 transition-colors relative">
                  <Bell size={22} />
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                </button>
                <button aria-label="Configuración" className="p-2 rounded-full hover:bg-gray-200 transition-colors"><Settings size={22} /></button>
                <button aria-label="Perfil de usuario" className="p-1 rounded-full border-2 border-transparent hover:border-cyan-400 transition-all">
                   <img src={`https://i.pravatar.cc/150?u=admin`} alt="Avatar de usuario" className="h-9 w-9 rounded-full" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/*Renderiza el menú horizontal justo debajo del header*/}
        <MenuHorizontal
          items={subMenuItems}
          activeSubItem={activeSubItem}
          onSubItemClick={setActiveSubItem}
        />

        {/* Área de contenido dinámico */}
        <main className="p-6 lg:p-8 flex-1 overflow-y-auto bg-gray-100" role="main">
          <Suspense fallback={<Loader />}>
            {activeSubItem ? activeSubItem.component : activeItem.component}
          </Suspense>
        </main>
      </div>
    </div>
  );
}