import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "../ThemeToggle";

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
    setExpandedMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
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

  const SIDEBAR_BG = "#100e22";
  const SIDEBAR_BORDER = "#332d6e";
  const SIDEBAR_TEXT = "rgba(255,255,255,0.65)";
  const SIDEBAR_TEXT_ACTIVE = "white";
  const SIDEBAR_HOVER = "rgba(255,255,255,0.06)";
  const BRAND = "#7c3aed";
  const BRAND_LIGHT = "#9066ff";
  const BRAND_GLOW = "rgba(124,58,237,0.25)";

  return (
    <div
      className="w-64 flex flex-col h-screen sticky top-0"
      style={{ background: SIDEBAR_BG, borderRight: `1px solid ${SIDEBAR_BORDER}` }}
    >
      {/* LOGO */}
      <div className="p-5" style={{ borderBottom: `1px solid ${SIDEBAR_BORDER}` }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})`,
              boxShadow: `0 4px 14px ${BRAND_GLOW}`,
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h1
              className="font-black text-lg tracking-tight"
              style={{ color: "white", fontFamily: "Outfit, sans-serif" }}
            >
              Turnete
            </h1>
            <p className="text-xs" style={{ color: SIDEBAR_TEXT }}>
              {esSuperAdmin ? "Super Admin" : esDueno ? "Admin Panel" : "Panel Profesional"}
            </p>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
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
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium"
                    style={{
                      background: hasActiveSubmenu ? BRAND_GLOW : "transparent",
                      color: hasActiveSubmenu ? BRAND_LIGHT : SIDEBAR_TEXT,
                    }}
                    onMouseEnter={(e) => {
                      if (!hasActiveSubmenu) e.currentTarget.style.background = SIDEBAR_HOVER;
                    }}
                    onMouseLeave={(e) => {
                      if (!hasActiveSubmenu) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="mt-1 ml-4 pl-4 space-y-1 border-l-2" style={{ borderColor: SIDEBAR_BORDER }}>
                      {item.submenu.map((subItem) => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className="flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                            style={{
                              background: isSubActive ? BRAND_GLOW : "transparent",
                              color: isSubActive ? BRAND_LIGHT : SIDEBAR_TEXT,
                            }}
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
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium"
                  style={{
                    background: isActive ? `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})` : "transparent",
                    color: isActive ? SIDEBAR_TEXT_ACTIVE : SIDEBAR_TEXT,
                    boxShadow: isActive ? `0 4px 14px ${BRAND_GLOW}` : "none",
                  }}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 space-y-3" style={{ borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
        {/* Theme toggle */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium" style={{ color: SIDEBAR_TEXT }}>
            Tema
          </span>
          <ThemeToggle />
        </div>

        {/* Usuario */}
        {user && (
          <div
            className="px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${SIDEBAR_BORDER}` }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})` }}
              >
                {user.nombre?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "white" }}>
                  {user.nombre}
                </p>
                <p className="text-xs truncate" style={{ color: SIDEBAR_TEXT }}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
          style={{ color: "#f87171" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
