import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Users, FileText, ClipboardList,
  FileSignature, FileMinus, LogOut, Menu, X, Ambulance, Bell
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/dashboard",   label: "Dashboard",        icon: LayoutDashboard },
  { to: "/pacientes",   label: "Pacientes",         icon: Users },
  { to: "/solicitudes", label: "Solicitudes",       icon: ClipboardList },
  { to: "/historias-clinicas/nueva", label: "Historia Clínica", icon: FileText },
  { to: "/consentimientos/nuevo",    label: "Consentimiento",   icon: FileSignature },
  { to: "/desistimientos/nuevo",     label: "Desistimiento",    icon: FileMinus },
];

const adminItems = [
  { to: "/usuarios", label: "Usuarios", icon: Users },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sian-700">
        <div className="bg-white rounded-lg p-1.5">
          <Ambulance className="w-6 h-6 text-sian-500" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">CliniSign</div>
          <div className="text-sian-300 text-xs leading-tight">SIAN SALUD</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="text-sian-400 text-xs font-semibold uppercase tracking-wider px-3 mb-2">Principal</p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sian-600 text-white"
                  : "text-sian-200 hover:bg-sian-700 hover:text-white"
              )
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="text-sian-400 text-xs font-semibold uppercase tracking-wider px-3 mb-2 mt-4">Administración</p>
            {adminItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sian-600 text-white"
                      : "text-sian-200 hover:bg-sian-700 hover:text-white"
                  )
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-sian-700 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-sian-400 flex items-center justify-center text-white font-bold text-sm">
            {user?.nombres?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{user?.nombres}</div>
            <div className="text-sian-300 text-xs truncate">{user?.rol}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full text-sian-300 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-sian-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-sian-800 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-64 bg-sian-800 flex flex-col">
            <button
              className="absolute top-4 right-4 text-sian-300 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <button
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-500 hover:text-gray-700 relative">
              <Bell className="w-5 h-5" />
            </button>
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-800">{user?.nombres}</span>
              <span className="mx-1">·</span>
              <span className="text-sian-600">{user?.rol}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
