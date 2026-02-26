import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  const handleLogout = () => {
    if (confirm("¿Cerrar sesión?")) {
      logout();
      navigate("/admin/login");
    }
  };

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const esDueno = user?.es_dueno;
  const esSuperAdmin = user?.tipo === "superadmin";
  const rolActual = esSuperAdmin ? "superadmin" : esDueno ? "dueno" : "profesional";

  const todosLosMenus = [
    {
      name: "Dashboard",
      path: "/admin",
      roles: ["dueno", "superadmin"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Agenda",
      path: "/admin/agenda",
      roles: ["dueno", "profesional", "superadmin"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: "Clientes",
      path: "/admin/clientes",
      roles: ["dueno", "superadmin"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      name: "Profesionales",
      roles: ["dueno", "superadmin"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      submenu: [
        { name: "Gestión de Profesionales", path: "/admin/profesionales" },
        { name: "Horarios", path: "/admin/horarios" },
        { name: "Servicios", path: "/admin/servicios" },
      ],
    },
    {
      name: "Reportes",
      path: "/admin/reportes",
      roles: ["dueno", "superadmin"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      name: "Configuración",
      path: "/admin/configuracion",
      roles: ["dueno", "superadmin"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const menuItems = todosLosMenus.filter((item) => item.roles.includes(rolActual));

  return (
    <div className="w-64 bg-white border-r border-dark-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-dark-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg text-dark-900">Turnete</h1>
            <p className="text-xs text-dark-500">
              {esSuperAdmin ? "Super Admin" : esDueno ? "Admin Panel" : "Panel Profesional"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isExpanded = expandedMenus[item.name];
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const hasActiveSubmenu = hasSubmenu && item.submenu.some((sub) => location.pathname === sub.path);

          return (
            <div key={item.name}>
              {hasSubmenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between gap-3 px-6 py-3 transition-all ${
                      hasActiveSubmenu
                        ? "bg-gradient-to-r from-brand-50 to-accent-50 text-brand-700 font-semibold"
                        : "text-dark-600 hover:bg-dark-50 hover:text-dark-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="bg-dark-50">
                      {item.submenu.map((subItem) => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`flex items-center gap-3 px-6 py-2 pl-14 transition-all text-sm ${
                              isSubActive
                                ? "bg-brand-100 border-r-4 border-brand-500 text-brand-700 font-semibold"
                                : "text-dark-600 hover:bg-dark-100 hover:text-dark-900"
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-6 py-3 transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-brand-50 to-accent-50 border-r-4 border-brand-500 text-brand-700 font-semibold"
                      : "text-dark-600 hover:bg-dark-50 hover:text-dark-900"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-dark-200">
        {user && (
          <div className="px-6 py-3 mb-2">
            <p className="text-xs text-dark-500 mb-1">Sesión iniciada como:</p>
            <p className="text-sm font-semibold text-dark-900">{user.nombre}</p>
            <p className="text-xs text-dark-600">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full px-6 py-3 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
