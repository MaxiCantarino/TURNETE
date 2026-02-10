# 🚀 Guía de Inicio Rápido

## Comandos Esenciales

### Primera vez - Instalación completa

```bash
# 1. Instalar Backend
cd backend
npm install

# 2. Instalar Frontend (en otra terminal)
cd frontend
npm install
```

### Ejecutar la aplicación

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Acceder a la aplicación

- **Cliente**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **API**: http://localhost:5000/api

## ✅ Verificación

1. Abre http://localhost:3000
2. Deberías ver la pantalla "Reserva tu Turno"
3. Navega a http://localhost:3000/admin para ver el panel de administración

## 🎯 Flujo de Uso

### Como Cliente:
1. Selecciona un servicio
2. Elige un profesional
3. Selecciona fecha y hora
4. Ingresa tus datos
5. Confirma la reserva

### Como Admin:
1. Ve a /admin
2. Revisa la agenda semanal
3. Confirma o cancela turnos
4. Configura horarios de atención

## 🔧 Configuración Inicial

Los datos de ejemplo ya están cargados:
- ✅ 5 servicios de estética
- ✅ 3 profesionales
- ✅ Horarios Lun-Vie 9-18h, Sáb 10-14h

## 📞 Soporte

Si algo no funciona:
1. Verifica que Node.js esté instalado: `node --version`
2. Asegúrate de estar en la carpeta correcta
3. Revisa que los puertos 3000 y 5000 estén libres
4. Consulta la sección "Solución de Problemas" en README.md
