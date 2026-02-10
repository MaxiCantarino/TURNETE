# 💅 Sistema de Gestión de Turnos - Estética Profesional

Sistema completo de reserva de turnos online para negocios de estética
## 📋 Características

### Panel del Cliente
- ✅ Selección de servicio (Microblading, Pestañas, etc.)
- ✅ Elección de profesional
- ✅ Calendario interactivo con días disponibles
- ✅ Visualización de horarios libres
- ✅ Reserva con nombre y WhatsApp
- ✅ Confirmación inmediata

### Panel de Administración
- ✅ Agenda semanal completa
- ✅ Vista por día con todos los turnos
- ✅ Confirmación/Cancelación de turnos
- ✅ Configuración de horarios de atención
- ✅ Gestión de duración de servicios
- ✅ Validación anti-superposición

## 🛠️ Tecnologías

### Frontend
- React 18
- Tailwind CSS
- React Router DOM
- Axios
- Date-fns
- Vite

### Backend
- Node.js
- Express
- SQLite3
- CORS
- Body-parser

## 📁 Estructura del Proyecto

```
turnos-estetica/
├── backend/
│   ├── database.js          # Configuración de SQLite
│   ├── server.js            # Servidor Express y API REST
│   ├── package.json
│   ├── .env
│   └── turnos.db           # Base de datos (se crea automáticamente)
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Calendar.jsx           # Selector de calendario
    │   │   └── TimeSlotSelector.jsx   # Selector de horarios
    │   ├── pages/
    │   │   ├── ClienteReserva.jsx     # Vista del cliente
    │   │   └── AdminPanel.jsx         # Panel administrativo
    │   ├── services/
    │   │   └── api.js                 # Cliente API
    │   ├── utils/
    │   │   └── dateUtils.js           # Utilidades de fecha
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 16+ 
- npm o yarn

### 1. Instalar Backend

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Iniciar el servidor
npm start
```

El backend estará corriendo en `http://localhost:5000`

### 2. Instalar Frontend

```bash
# En otra terminal, navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar la aplicación
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 📊 Base de Datos

La aplicación usa SQLite y se inicializa automáticamente con:

### Servicios predefinidos:
- Microblading (120 min)
- Pestañas pelo a pelo (90 min)
- Lifting de pestañas (60 min)
- Depilación facial (30 min)
- Limpieza facial (60 min)

### Profesionales predefinidos:
- María González
- Ana Rodríguez
- Laura Martínez

### Horarios predefinidos:
- Lunes a Viernes: 9:00 - 18:00
- Sábado: 10:00 - 14:00

## 🔌 API Endpoints

### Servicios
- `GET /api/servicios` - Listar servicios
- `POST /api/servicios` - Crear servicio
- `PUT /api/servicios/:id` - Actualizar servicio

### Profesionales
- `GET /api/profesionales` - Listar profesionales
- `POST /api/profesionales` - Crear profesional

### Turnos
- `GET /api/turnos` - Listar turnos (con filtros)
- `POST /api/turnos` - Crear turno
- `POST /api/turnos/verificar-disponibilidad` - Verificar disponibilidad
- `PUT /api/turnos/:id/estado` - Actualizar estado
- `DELETE /api/turnos/:id` - Eliminar turno

### Configuración
- `GET /api/configuracion` - Obtener horarios
- `POST /api/configuracion` - Crear/Actualizar horario
- `PUT /api/configuracion/:id` - Modificar horario

## 🎨 Personalización

### Colores (Tailwind)
Edita `frontend/tailwind.config.js` para cambiar el esquema de colores:

```javascript
colors: {
  primary: {
    // Personaliza aquí
  }
}
```

### Datos Iniciales
Modifica `backend/database.js` para cambiar servicios, profesionales y horarios iniciales.

## 🔐 Seguridad

**IMPORTANTE**: Esta es una versión de desarrollo. Para producción, implementa:
- Autenticación para el panel admin
- HTTPS
- Variables de entorno seguras
- Rate limiting
- Validación de inputs
- CSRF protection

## 📱 Responsive Design

La aplicación está optimizada para:
- ✅ Móviles (320px+)
- ✅ Tablets (768px+)
- ✅ Desktop (1024px+)

## 🐛 Solución de Problemas

### El backend no inicia
```bash
# Verifica que el puerto 5000 esté libre
lsof -i :5000

# Si está ocupado, cambia el puerto en .env
PORT=5001
```

### Error de CORS
Verifica que el frontend esté configurado en `vite.config.js` para hacer proxy al backend.

### La base de datos no se crea
Asegúrate de tener permisos de escritura en la carpeta `backend/`.

## 📈 Próximas Mejoras

- [ ] Notificaciones por email/SMS
- [ ] Recordatorios automáticos
- [ ] Sistema de pago online
- [ ] Historial de clientes
- [ ] Reportes y estadísticas
- [ ] Integración con Google Calendar
- [ ] App móvil nativa

## 👨‍💻 Desarrollo

```bash
# Backend en modo desarrollo (con nodemon)
cd backend
npm run dev

# Frontend en modo desarrollo
cd frontend
npm run dev
```

## 🏗️ Build para Producción

```bash
# Frontend
cd frontend
npm run build

# Los archivos estarán en frontend/dist/
```

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**Desarrollado con ❤️ para negocios de estética**
