import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.tipo === "superadmin") navigate("/superadmin");
      else if (user.es_dueno) navigate("/admin");
      else navigate("/profesional/dashboard");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.response?.data?.error || err.message || "Error al iniciar sesión";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#080614" }}
    >
      {/* Fondo */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
          radial-gradient(ellipse 80% 50% at 20% 20%, rgba(124,58,237,0.3) 0%, transparent 60%),
          radial-gradient(ellipse 60% 60% at 80% 80%, rgba(109,40,217,0.2) 0%, transparent 60%)
        `,
        }}
      />

      {/* Grid pattern sutil */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Toggle */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md">
        <div
          className="p-[2px] rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #9066ff, #c084fc)",
            boxShadow: "0 0 40px rgba(124,58,237,0.4), 0 0 80px rgba(124,58,237,0.15)",
          }}
        >
          <div className="p-8 rounded-[14px]" style={{ background: "#110d24" }}>
            {/* Logo */}
            <div className="text-center mb-7">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #9066ff)",
                    boxShadow: "0 0 20px rgba(124,58,237,0.6)",
                  }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h1
                    className="text-2xl font-black text-white leading-none"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    TURNETE
                  </h1>
                  <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#9066ff" }}>
                    Management
                  </p>
                </div>
              </div>
              <h2 className="text-lg font-bold" style={{ color: "#9066ff" }}>
                Acceso al Panel de Administración
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="p-3 rounded-xl text-sm font-medium text-center"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    color: "#f87171",
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: "rgba(200,180,255,0.9)" }}>
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid rgba(124,58,237,0.4)",
                    background: "rgba(255,255,255,0.04)",
                    color: "white",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#9066ff")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.4)")}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: "rgba(200,180,255,0.9)" }}>
                  Contraseña:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    style={{
                      width: "100%",
                      padding: "11px 44px 11px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid rgba(124,58,237,0.4)",
                      background: "rgba(255,255,255,0.04)",
                      color: "white",
                      fontSize: "14px",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#9066ff")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.4)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#9066ff" }}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="text-right mt-1.5">
                  <button type="button" className="text-xs font-semibold hover:underline" style={{ color: "#9066ff" }}>
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-black text-white uppercase tracking-widest text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #9066ff)",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.5)",
                  letterSpacing: "0.15em",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  "INICIAR SESIÓN"
                )}
              </button>
            </form>
          </div>
        </div>
        <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.5)" }}>
          © 2026 Turnete · Desarrollado por{" "}
          <span className="font-black" style={{ color: "rgba(255,255,255,0.8)" }}>
            KAIROS
          </span>
        </p>
      </div>
    </div>
  );
};
export default AdminLogin;
