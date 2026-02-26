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
    whatsapp_template:
      "Hola {$CLIENTE_NOMBRE}! Te recordamos tu turno de {$SERVICIOS} el {$TURNO_DIA} a las {$TURNO_HORA}. ¡Te esperamos! 😊",
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
      const response = await axios.get("http://localhost:5000/api/configuracion/negocio");
      setConfig({
        ...response.data,
        whatsapp_template:
          response.data.whatsapp_template ||
          "Hola {$CLIENTE_NOMBRE}! Te recordamos tu turno de {$SERVICIOS} el {$TURNO_DIA} a las {$TURNO_HORA}. ¡Te esperamos! 😊",
      });
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
      const response = await axios.post("http://localhost:5000/api/admin/configuracion/banner", formData, {
        headers: { "Content-Type": "multipart/form-data", "x-business-id": "1" },
      });
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
      const response = await axios.post("http://localhost:5000/api/admin/configuracion/logo", formData, {
        headers: { "Content-Type": "multipart/form-data", "x-business-id": "1" },
      });
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
    const rect = e.currentTarget.getBoundingClientRect();
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
      setConfig((prev) => ({ ...prev, banner_position: `${newX.toFixed(0)}% ${newY.toFixed(0)}%` }));
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
          <h1 className="text-3xl font-bold text-dark-900 mb-8">Configuración del Negocio</h1>

          {success && <div className="alert-success mb-6">✅ Configuración guardada correctamente</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Imágenes */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Imágenes</h2>
              <div className="space-y-6">
                <div>
                  <label className="label">Banner Principal</label>
                  <p className="text-sm text-dark-500 mb-2">Recomendado: 1920x600px</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={uploadingBanner}
                    className="block w-full text-sm text-dark-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                  />
                  {uploadingBanner && <p className="text-sm text-brand-600 mt-2">Subiendo...</p>}
                  {config.banner_url && (
                    <div className="mt-4">
                      <label className="label">Posición del Banner</label>
                      <p className="text-xs text-dark-500 mb-2">Arrastrá la imagen para acomodarla</p>
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
                <div>
                  <label className="label">Logo</label>
                  <p className="text-sm text-dark-500 mb-2">Recomendado: 500x500px (cuadrado)</p>
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
                  {uploadingLogo && <p className="text-sm text-brand-600 mt-2">Subiendo...</p>}
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
                    onChange={(e) => setConfig({ ...config, nombre_negocio: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Slogan</label>
                  <input
                    type="text"
                    value={config.slogan || ""}
                    onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
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
                    onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                    className="input"
                    placeholder="351-256-0617"
                  />
                </div>
                <div>
                  <label className="label">Instagram (sin @)</label>
                  <input
                    type="text"
                    value={config.instagram || ""}
                    onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
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
                  onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
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
                    onChange={(e) => setConfig({ ...config, color_primario: e.target.value })}
                    className="w-20 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.color_primario}
                    onChange={(e) => setConfig({ ...config, color_primario: e.target.value })}
                    className="input flex-1"
                    placeholder="#e91e63"
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Mensaje de WhatsApp
              </h2>
              <p className="text-sm text-dark-500 mb-4">
                Se usa al mandar recordatorios o escribir a un cliente desde la agenda.
              </p>

              <div className="mb-4">
                <p className="text-xs font-semibold text-dark-600 mb-2">Variables disponibles (click para insertar):</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "{$CLIENTE_NOMBRE}",
                    "{$TURNO_DIA}",
                    "{$TURNO_HORA}",
                    "{$MARCA}",
                    "{$SERVICIOS}",
                    "{$TURNO_DIRECCION}",
                    "{$TURNO_MAPA}",
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, whatsapp_template: (prev.whatsapp_template || "") + tag }))
                      }
                      className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 font-mono"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={config.whatsapp_template || ""}
                onChange={(e) => setConfig({ ...config, whatsapp_template: e.target.value })}
                rows={4}
                className="input resize-none mb-1"
                placeholder="Hola {$CLIENTE_NOMBRE}! Te recordamos tu turno..."
              />
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    whatsapp_template:
                      "Hola {$CLIENTE_NOMBRE}! Te recordamos tu turno de {$SERVICIOS} el {$TURNO_DIA} a las {$TURNO_HORA}. ¡Te esperamos! 😊",
                  })
                }
                className="text-xs text-dark-400 hover:text-dark-600 underline block mb-4"
              >
                Restaurar por defecto
              </button>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-green-800 mb-2">👁 Vista previa:</p>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm text-dark-800 whitespace-pre-wrap">
                    {(config.whatsapp_template || "")
                      .replace(/\{\$CLIENTE_NOMBRE\}/g, "María")
                      .replace(/\{\$TURNO_DIA\}/g, "15/03/2025")
                      .replace(/\{\$TURNO_HORA\}/g, "10:30")
                      .replace(/\{\$MARCA\}/g, config.nombre_negocio || "Tu negocio")
                      .replace(/\{\$SERVICIOS\}/g, "Corte y peinado")
                      .replace(/\{\$TURNO_DIRECCION\}/g, config.direccion || "Córdoba")
                      .replace(/\{\$TURNO_MAPA\}/g, "https://maps.google.com/...")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
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
