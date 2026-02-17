-- ==========================================
-- TURNETE - Script de Inicialización PostgreSQL
-- Versión: 2.0.0
-- Fecha: Febrero 2026
-- ==========================================

-- INSTRUCCIONES:
-- 1. Crear base de datos: CREATE DATABASE turnete_db;
-- 2. Conectarse a turnete_db
-- 3. Ejecutar este script completo

-- ==========================================
-- 1. TABLA DE NEGOCIOS (Nivel Global)
-- ==========================================

CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255),
  telefono VARCHAR(20),
  direccion TEXT,
  plan VARCHAR(50) DEFAULT 'free',
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar negocio de prueba
INSERT INTO businesses (nombre, slug, email, telefono, plan)
VALUES ('Salon Paula', 'salon-paula', 'paula@salon.com', '+54 9 11 1234-5678', 'premium')
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- 2. CREAR SCHEMA PARA EL TENANT
-- ==========================================

CREATE SCHEMA IF NOT EXISTS tenant_paula;

-- ==========================================
-- 3. TABLAS DEL TENANT
-- ==========================================

-- Profesionales
CREATE TABLE IF NOT EXISTS tenant_paula.profesionales (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id),
  nombre VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#3498db'
);

-- Servicios
CREATE TABLE IF NOT EXISTS tenant_paula.servicios (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id),
  nombre VARCHAR(255) NOT NULL,
  duracion INTEGER NOT NULL,
  precio DECIMAL(10,2) DEFAULT 0,
  categoria VARCHAR(100) DEFAULT 'General',
  descripcion TEXT,
  imagen_url TEXT
);

-- Horarios por profesional
CREATE TABLE IF NOT EXISTS tenant_paula.profesional_horarios (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id),
  profesional_id INTEGER NOT NULL,
  dia_semana VARCHAR(20) NOT NULL,
  hora_inicio VARCHAR(5) NOT NULL,
  hora_fin VARCHAR(5) NOT NULL,
  hora_inicio_tarde VARCHAR(5),
  hora_fin_tarde VARCHAR(5),
  activo BOOLEAN DEFAULT true,
  FOREIGN KEY (profesional_id) REFERENCES tenant_paula.profesionales(id),
  UNIQUE(profesional_id, dia_semana)
);

-- Sobreturnos
CREATE TABLE IF NOT EXISTS tenant_paula.sobreturnos (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id),
  profesional_id INTEGER NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio VARCHAR(5) NOT NULL,
  hora_fin VARCHAR(5) NOT NULL,
  motivo TEXT,
  creado_por VARCHAR(100) DEFAULT 'Admin',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profesional_id) REFERENCES tenant_paula.profesionales(id)
);

-- Bloques bloqueados
CREATE TABLE IF NOT EXISTS tenant_paula.bloques_bloqueados (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id),
  profesional_id INTEGER NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio VARCHAR(5) NOT NULL,
  hora_fin VARCHAR(5) NOT NULL,
  motivo TEXT,
  creado_por VARCHAR(100) DEFAULT 'Admin',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profesional_id) REFERENCES tenant_paula.profesionales(id)
);

-- Clientes (WhatsApp como identificador único)
CREATE TABLE IF NOT EXISTS tenant_paula.clientes (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id),
  whatsapp VARCHAR(20) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  edad INTEGER,
  telefono VARCHAR(20),
  email VARCHAR(255),
  saldo_deuda DECIMAL(10,2) DEFAULT 0,
  notas TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(business_id, whatsapp)
);

-- Profesional-Servicios (Many-to-Many)
CREATE TABLE IF NOT EXISTS tenant_paula.profesional_servicios (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id),
  profesional_id INTEGER NOT NULL,
  servicio_id INTEGER NOT NULL,
  FOREIGN KEY (profesional_id) REFERENCES tenant_paula.profesionales(id),
  FOREIGN KEY (servicio_id) REFERENCES tenant_paula.servicios(id),
  UNIQUE(profesional_id, servicio_id)
);

-- Google Calendar Tokens
CREATE TABLE IF NOT EXISTS tenant_paula.google_tokens (
  profesional_id INTEGER PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id),
  access_token TEXT,
  refresh_token TEXT,
  expiry_date BIGINT,
  FOREIGN KEY (profesional_id) REFERENCES tenant_paula.profesionales(id)
);

-- Turnos
CREATE TABLE IF NOT EXISTS tenant_paula.turnos (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id),
  servicio_id INTEGER,
  profesional_id INTEGER,
  cliente_id INTEGER,
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_whatsapp VARCHAR(20) NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio VARCHAR(5) NOT NULL,
  hora_fin VARCHAR(5) NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente',
  precio_pagado DECIMAL(10,2) DEFAULT 0,
  saldo_pendiente DECIMAL(10,2) DEFAULT 0,
  notas TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (servicio_id) REFERENCES tenant_paula.servicios(id),
  FOREIGN KEY (profesional_id) REFERENCES tenant_paula.profesionales(id),
  FOREIGN KEY (cliente_id) REFERENCES tenant_paula.clientes(id),
  UNIQUE(business_id, profesional_id, fecha, hora_inicio)
);

-- ==========================================
-- 4. ÍNDICES DE RENDIMIENTO
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_profesionales_business ON tenant_paula.profesionales(business_id);
CREATE INDEX IF NOT EXISTS idx_servicios_business ON tenant_paula.servicios(business_id);
CREATE INDEX IF NOT EXISTS idx_clientes_business ON tenant_paula.clientes(business_id);
CREATE INDEX IF NOT EXISTS idx_turnos_business ON tenant_paula.turnos(business_id);
CREATE INDEX IF NOT EXISTS idx_horarios_business ON tenant_paula.profesional_horarios(business_id);
CREATE INDEX IF NOT EXISTS idx_sobreturnos_business ON tenant_paula.sobreturnos(business_id);
CREATE INDEX IF NOT EXISTS idx_bloques_business ON tenant_paula.bloques_bloqueados(business_id);

CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON tenant_paula.turnos(business_id, fecha);
CREATE INDEX IF NOT EXISTS idx_sobreturnos_fecha ON tenant_paula.sobreturnos(business_id, fecha);
CREATE INDEX IF NOT EXISTS idx_bloques_fecha ON tenant_paula.bloques_bloqueados(business_id, fecha);

CREATE INDEX IF NOT EXISTS idx_turnos_profesional ON tenant_paula.turnos(business_id, profesional_id);
CREATE INDEX IF NOT EXISTS idx_clientes_whatsapp ON tenant_paula.clientes(business_id, whatsapp);

-- ==========================================
-- 5. DATOS DE PRUEBA
-- ==========================================

-- Profesionales
INSERT INTO tenant_paula.profesionales (business_id, nombre, color) VALUES
(1, 'Paula', '#e74c3c'),
(1, 'Mia', '#3498db'),
(1, 'Sophie', '#9b59b6'),
(1, 'Flor', '#f39c12'),
(1, 'Yami', '#1abc9c')
ON CONFLICT DO NOTHING;

-- Servicios
INSERT INTO tenant_paula.servicios (business_id, nombre, duracion, precio, categoria, descripcion) VALUES
(1, 'Microblading', 120, 15000, 'Cejas', 'Técnica de micropigmentación para cejas perfectas'),
(1, 'Extensión de Pestañas Pelo a Pelo', 90, 8000, 'Pestañas', 'Extensiones naturales una a una'),
(1, 'Lifting de Pestañas', 60, 6000, 'Pestañas', 'Rizado y lifting natural'),
(1, 'Perfilado de Cejas', 30, 3000, 'Cejas', 'Diseño y depilación de cejas'),
(1, 'Limpieza Facial Profunda', 60, 7000, 'Faciales', 'Limpieza completa con extracción'),
(1, 'Dermaplaning', 45, 8500, 'Faciales', 'Exfoliación con bisturí')
ON CONFLICT DO NOTHING;

-- Horarios para Paula (ID 1) - Lunes a Viernes: 09:00-13:00 | 14:00-18:00
INSERT INTO tenant_paula.profesional_horarios (business_id, profesional_id, dia_semana, hora_inicio, hora_fin, hora_inicio_tarde, hora_fin_tarde, activo) VALUES
(1, 1, 'Lunes', '09:00', '13:00', '14:00', '18:00', true),
(1, 1, 'Martes', '09:00', '13:00', '14:00', '18:00', true),
(1, 1, 'Miércoles', '09:00', '13:00', '14:00', '18:00', true),
(1, 1, 'Jueves', '09:00', '13:00', '14:00', '18:00', true),
(1, 1, 'Viernes', '09:00', '13:00', '14:00', '18:00', true),
(1, 1, 'Sábado', '10:00', '14:00', NULL, NULL, true),
(1, 1, 'Domingo', '10:00', '14:00', NULL, NULL, true)
ON CONFLICT (profesional_id, dia_semana) DO NOTHING;

-- ==========================================
-- SCRIPT COMPLETADO ✅
-- Para recrear: psql -U postgres -d turnete_db -f database.sql
-- ==========================================