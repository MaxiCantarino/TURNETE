import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import axios from "axios";

const AdminConfiguracion = () => {
  const [config, setConfig] = useState({
    nombre_negocio: "",
    slogan: "",
    telefono: "",
    instagram: "",
    direccion: "",
    banner_position: "50% 50%",
    color_primario: "#e91e63",
    banner_url: "",
    logo_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/configuracion/negocio",
      );
      setConfig(response.data);
    } catch (error) {
      console.error("Error cargando configuración:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await axios.put("http://localhost:5000/api/admin/configuracion", config, {
        headers: { "x-business-id": "1" },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error guardando:", error);
      alert("Error al guardar la configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingBanner(true);
    const formData = new FormData();
    formData.append("banner", file);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/configuracion/banner",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-business-id": "1",
          },
        },
      );
      setConfig({ ...config, banner_url: response.data.banner_url });
      alert("Banner subido correctamente");
    } catch (error) {
      console.error("Error subiendo banner:", error);
      alert("Error al subir el banner");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/configuracion/logo",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-business-id": "1",
          },
        },
      );
      setConfig({ ...config, logo_url: response.data.logo_url });
      alert("Logo subido correctamente");
    } catch (error) {
      console.error("Error subiendo logo:", error);
      alert("Error al subir el logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerDrag = (e) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const parts = (config.banner_position || "50% 50%").split(" ");
    const currentX = parseFloat(parts[0]) || 50;
    const currentY = parseFloat(parts[1]) || 50;

    const onMouseMove = (moveEvent) => {
      const dx = ((startX - moveEvent.clientX) / rect.width) * 100;
      const dy = ((startY - moveEvent.clientY) / rect.height) * 100;
      const newX = Math.min(100, Math.max(0, currentX + dx));
      const newY = Math.min(100, Math.max(0, currentY + dy));
      setConfig((prev) => ({
        ...prev,
        banner_position: `${newX.toFixed(0)}% ${newY.toFixed(0)}%`,
      }));
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-dark-900 mb-8">
            Configuración del Negocio
          </h1>

          {success && (
            <div className="alert-success mb-6">
              ✅ Configuración guardada correctamente
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Imágenes */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Imágenes</h2>
              <div className="space-y-6">
                {/* Banner */}
                <div>
                  <label className="label">Banner Principal</label>
                  <p className="text-sm text-dark-500 mb-2">
                    Recomendado: 1920x600px
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={uploadingBanner}
                    className="block w-full text-sm text-dark-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                  />
                  {uploadingBanner && (
                    <p className="text-sm text-brand-600 mt-2">Subiendo...</p>
                  )}

                  {config.banner_url && (
                    <div className="mt-4">
                      <label className="label">Posición del Banner</label>
                      <p className="text-xs text-dark-500 mb-2">
                        Arrastrá la imagen para acomodarla
                      </p>
                      <div
                        className="border rounded-lg overflow-hidden cursor-move"
                        style={{ height: "160px", position: "relative" }}
                        onMouseDown={handleBannerDrag}
                      >
                        <img
                          src={`http://localhost:5000${config.banner_url}`}
                          alt="Preview banner"
                          draggable={false}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: config.banner_position || "50% 50%",
                            userSelect: "none",
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-white/70 rounded-full p-2 shadow">
                            <svg
                              className="w-6 h-6 text-dark-700"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 9l4-4 4 4M8 15l4 4 4-4M9 8l-4 4 4 4M15 8l4 4-4 4"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logo */}
                <div>
                  <label className="label">Logo</label>
                  <p className="text-sm text-dark-500 mb-2">
                    Recomendado: 500x500px (cuadrado)
                  </p>
                  {config.logo_url && (
                    <div className="mb-4">
                      <img
                        src={`http://localhost:5000${config.logo_url}`}
                        alt="Logo actual"
                        className="w-32 h-32 object-contain rounded-lg bg-gray-100"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="block w-full text-sm text-dark-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                  />
                  {uploadingLogo && (
                    <p className="text-sm text-brand-600 mt-2">Subiendo...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Información Básica */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Información Básica</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Nombre del Negocio *</label>
                  <input
                    type="text"
                    value={config.nombre_negocio}
                    onChange={(e) =>
                      setConfig({ ...config, nombre_negocio: e.target.value })
                    }
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Slogan</label>
                  <input
                    type="text"
                    value={config.slogan || ""}
                    onChange={(e) =>
                      setConfig({ ...config, slogan: e.target.value })
                    }
                    className="input"
                    placeholder="Tu belleza, nuestra pasión"
                  />
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Datos de Contacto</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={config.telefono || ""}
                    onChange={(e) =>
                      setConfig({ ...config, telefono: e.target.value })
                    }
                    className="input"
                    placeholder="351-256-0617"
                  />
                </div>
                <div>
                  <label className="label">Instagram (sin @)</label>
                  <input
                    type="text"
                    value={config.instagram || ""}
                    onChange={(e) =>
                      setConfig({ ...config, instagram: e.target.value })
                    }
                    className="input"
                    placeholder="salonpaula"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="label">Dirección</label>
                <input
                  type="text"
                  value={config.direccion || ""}
                  onChange={(e) =>
                    setConfig({ ...config, direccion: e.target.value })
                  }
                  className="input"
                  placeholder="Córdoba, Argentina"
                />
              </div>
            </div>

            {/* Colores */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Personalización</h2>
              <div>
                <label className="label">Color Principal</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={config.color_primario}
                    onChange={(e) =>
                      setConfig({ ...config, color_primario: e.target.value })
                    }
                    className="w-20 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.color_primario}
                    onChange={(e) =>
                      setConfig({ ...config, color_primario: e.target.value })
                    }
                    className="input flex-1"
                    placeholder="#e91e63"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminConfiguracion;
