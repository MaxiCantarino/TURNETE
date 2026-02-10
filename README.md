# 🎯 Turnete

Sistema de gestión de turnos para salones de belleza - SaaS multi-tenant

## 📋 Descripción

Turnete es una aplicación web completa para la gestión de turnos en salones de belleza, spas y centros estéticos. Diseñada para ser alquilada como SaaS, permite a cada negocio personalizar completamente sus servicios, profesionales y horarios.

## ✨ Características Principales

### Para Clientes:

- ✅ Login con DNI
- ✅ Reserva de turnos en 4 pasos simples
- ✅ Historial de turnos
- ✅ Vista de servicios con precios

### Para Administradores:

- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de clientes (búsqueda, historial, deuda)
- ✅ Agenda visual del día con filtros
- ✅ Gestión completa de servicios (crear, editar, eliminar, categorías)
- ✅ Recordatorios automáticos por WhatsApp
- ✅ Integración directa con WhatsApp
- ✅ Sistema de profesionales con servicios asignados

## 🛠️ Tecnologías

### Backend:

- Node.js + Express
- SQLite (base de datos)
- Google Calendar API (sincronización)

### Frontend:

- React + Vite
- React Router DOM
- Tailwind CSS
- Axios

## 📦 Instalación

### Requisitos:

- Node.js 16+
- npm o yarn

### Backend:

```bash
cd backend
npm install
node server.js
```

### Frontend:

```bash
cd frontend
npm install
npm run dev
```

## 🌐 URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Panel Admin: http://localhost:3000/admin

## 📂 Estructura del Proyecto

```
TURNETE/
├── backend/
│   ├── database.js          # Configuración SQLite
│   ├── server.js            # API REST
│   └── turnos.db           # Base de datos
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── contexts/       # Context API (cliente)
│   │   ├── pages/          # Páginas principales
│   │   ├── services/       # API calls
│   │   └── utils/          # Utilidades
│   └── index.css          # Estilos globales
└── README.md
```

## 🔐 Variables de Entorno

Crear archivo `.env` en `/backend`:

```env
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

## 🚀 Roadmap

### ✅ Fase A - Sistema Base (Completado)

- Sistema de clientes con DNI
- Reserva de turnos
- Historial de clientes
- Panel admin básico

### ✅ Fase B - Admin Avanzado (Completado)

- Dashboard con métricas
- Gestión de servicios
- Recordatorios WhatsApp
- Agenda visual

### ⏳ Fase C - Configuración de Profesionales (En desarrollo)

- Asignar servicios específicos a cada profesional
- Configurar horarios de trabajo individuales
- Bloquear días específicos

### 📋 Fase D - Gestión Avanzada

- Editar/Reprogramar turnos
- Bloquear slots de tiempo
- Notas internas
- Reportes de ingresos

### 🏢 Fase E - Multi-tenant

- Múltiples negocios en una instalación
- Configuración personalizada por negocio
- Sistema de suscripciones

## 👥 Equipo

- **Desarrolladores:** En desarrollo
- **Cliente:** Paula (Negocio estético)
- **Profesionales:** Paula, Mia, Sophie, Flor, Yami

## 📄 Licencia

Privado - Todos los derechos reservados

## 📞 Contacto

Para consultas sobre alquiler o personalización del sistema, contactar al desarrollador.
