import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        {/* Logo/Header */}
        <div className="mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-brand-500 to-brand-600 rounded-3xl mb-6 shadow-2xl shadow-brand-500/30 rotate-3">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-dark-900 mb-4">
            Turnete
          </h1>
          <p className="text-2xl text-dark-600">Sistema de Gestión de Turnos</p>
        </div>

        {/* Botones */}
        <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
          {/* Cliente */}
          <button
            onClick={() => navigate("/login")}
            className="group relative overflow-hidden bg-white rounded-3xl p-12 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-brand-200 hover:border-brand-400"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-500/10 to-accent-500/10 rounded-bl-full transform translate-x-12 -translate-y-12"></div>

            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-dark-900 mb-3 group-hover:text-brand-600 transition-colors">
                Reservar Turno
              </h2>
              <p className="text-dark-600 mb-6">Agenda tu cita en minutos</p>
              <div className="inline-flex items-center gap-2 text-brand-600 font-semibold">
                Continuar
                <svg
                  className="w-5 h-5 group-hover:translate-x-2 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>

          {/* Admin */}
          <button
            onClick={() => navigate("/admin")}
            className="group relative overflow-hidden bg-white rounded-3xl p-12 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-dark-200 hover:border-dark-400"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-dark-500/10 to-dark-700/10 rounded-bl-full transform translate-x-12 -translate-y-12"></div>

            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-dark-700 to-dark-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-dark-900 mb-3 group-hover:text-dark-700 transition-colors">
                Panel Admin
              </h2>
              <p className="text-dark-600 mb-6">Gestiona tu negocio</p>
              <div className="inline-flex items-center gap-2 text-dark-700 font-semibold">
                Ingresar
                <svg
                  className="w-5 h-5 group-hover:translate-x-2 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
