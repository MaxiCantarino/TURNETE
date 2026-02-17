import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LandingPage = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfiguracion();
  }, []);

  const loadConfiguracion = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/configuracion/negocio",
      );
      setConfig(response.data);
    } catch (error) {
      console.error("Error cargando configuración:", error);
      setConfig({
        nombre_negocio: "Turnete",
        slogan: "Sistema de Gestión de Turnos",
        color_primario: "#e91e63",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div
          className="spinner w-10 h-10 border-4 border-t-transparent animate-spin rounded-full"
          style={{
            borderColor: "#eee",
            borderTopColor: config?.color_primario || "#e91e63",
          }}
        ></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f7] flex flex-col font-sans antialiased">
      {/* HERO SECTION - Restaurado el movimiento con banner_position */}
      <header
        className="relative h-[450px] bg-cover overflow-hidden flex items-center justify-center text-center"
        style={{
          backgroundImage: config.banner_url
            ? `url(http://localhost:5000${encodeURI(config.banner_url)})`
            : "linear-gradient(135deg, #111 0%, #333 100%)",
          backgroundPosition: config.banner_position || "center", // ESTO HACE QUE SE MUEVA SEGÚN EL ADMIN
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

        {/* ACCESO ADMIN */}
        <div className="absolute top-8 right-8 z-20">
          <button
            onClick={() => navigate("/admin/login")}
            className="px-6 py-2.5 border-2 border-white/30 rounded-full text-xs font-black text-white hover:bg-white hover:text-black transition-all active:scale-95 uppercase tracking-widest shadow-lg"
          >
            Acceso Admin
          </button>
        </div>

        <div className="relative z-10 px-4">
          <div className="mb-6 flex justify-center">
            {/* LOGO GRANDE */}
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-[5px] border-white/40 shadow-2xl bg-white overflow-hidden p-1 animate-fade-in transition-transform hover:scale-105 duration-500">
              {config.logo_url ? (
                <img
                  src={`http://localhost:5000${config.logo_url}`}
                  alt="Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-6xl font-black"
                  style={{ color: config.color_primario }}
                >
                  {config.nombre_negocio.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight animate-slide-up drop-shadow-2xl">
            {config.nombre_negocio}
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-10 font-medium max-w-2xl mx-auto animate-slide-up">
            {config.slogan}
          </p>

          <button
            onClick={() => navigate("/reservar")}
            className="relative px-14 py-5 rounded-full font-black text-white shadow-2xl transition-all text-xl active:scale-95 animate-pulse-slow hover:scale-110"
            style={{
              backgroundColor: config.color_primario,
              boxShadow: `0 15px 45px ${config.color_primario}80`,
            }}
          >
            Reservar un Turno
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-25"
              style={{ backgroundColor: config.color_primario }}
            ></span>
          </button>
        </div>
      </header>

      {/* SECCIÓN DE CARDS */}
      <main className="flex-grow flex items-center justify-center py-16 bg-[#f4f4f7]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
          {config.telefono && (
            <ContactCard
              label="WhatsApp"
              value={config.telefono}
              color="#25D366"
              icon={
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.653a11.883 11.883 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              }
            />
          )}
          {config.instagram && (
            <ContactCard
              label="Instagram"
              value={`@${config.instagram}`}
              link={`https://instagram.com/${config.instagram}`}
              color="#E1306C"
              icon={
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              }
            />
          )}
          {config.direccion && (
            <ContactCard
              label="Ubicación"
              value={config.direccion}
              color={config.color_primario}
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              }
              isLocation
            />
          )}
        </div>
      </main>

      {/* FOOTER ULTRA FINO */}
      <footer className="bg-[#0a0a0a] text-white py-4 border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <p className="text-sm font-black tracking-widest uppercase opacity-70">
              TURNETE
            </p>
            <span className="text-gray-700">|</span>
            <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">
              © {new Date().getFullYear()} Todos los derechos reservados
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[7px] font-bold text-gray-600 uppercase tracking-[0.4em]">
              Desarrollado por
            </span>
            <span className="text-2xl font-black italic tracking-tighter text-white opacity-90">
              KAIROS
            </span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
          50% { transform: scale(1.03); box-shadow: 0 15px 50px rgba(0,0,0,0.3); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

const ContactCard = ({
  label,
  value,
  color,
  icon,
  link,
  isLocation = false,
}) => {
  if (!value) return null;
  const Wrapper = link ? "a" : "div";
  return (
    <Wrapper
      href={link}
      target={link ? "_blank" : undefined}
      className="bg-white p-12 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-3 group shadow-sm"
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 25px 65px ${color}45`;
      }}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:rotate-6 shadow-inner"
        style={{ backgroundColor: `${color}15` }}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-8 h-8"
          style={{
            fill: isLocation ? "none" : color,
            stroke: isLocation ? color : "none",
          }}
        >
          {icon}
        </svg>
      </div>
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
        {label}
      </span>
      <span className="text-gray-900 font-black text-2xl leading-tight tracking-tight">
        {value}
      </span>
    </Wrapper>
  );
};

export default LandingPage;
