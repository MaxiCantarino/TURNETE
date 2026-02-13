const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./turnos.db");

db.serialize(() => {
  // Habilitar foreign keys
  db.run("PRAGMA foreign_keys = ON");

  // Tabla de profesionales CON COLOR
  db.run(`CREATE TABLE IF NOT EXISTS profesionales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    color TEXT DEFAULT '#3498db'
  )`);

  // Tabla de servicios
  db.run(`CREATE TABLE IF NOT EXISTS servicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    duracion INTEGER NOT NULL,
    precio REAL DEFAULT 0,
    categoria TEXT DEFAULT 'General',
    descripcion TEXT,
    imagen_url TEXT
  )`);

  // Tabla de horarios POR PROFESIONAL (con horarios cortados)
  db.run(`CREATE TABLE IF NOT EXISTS profesional_horarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profesional_id INTEGER NOT NULL,
  dia_semana TEXT NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fin TEXT NOT NULL,
  hora_inicio_tarde TEXT,
  hora_fin_tarde TEXT,
  activo INTEGER DEFAULT 1,
  FOREIGN KEY (profesional_id) REFERENCES profesionales(id),
  UNIQUE(profesional_id, dia_semana)
)`);

  // Tabla de clientes
  db.run(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dni TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    edad INTEGER,
    telefono TEXT,
    email TEXT,
    saldo_deuda REAL DEFAULT 0,
    notas TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de relación profesional-servicios (muchos a muchos)
  db.run(`CREATE TABLE IF NOT EXISTS profesional_servicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profesional_id INTEGER NOT NULL,
    servicio_id INTEGER NOT NULL,
    FOREIGN KEY (profesional_id) REFERENCES profesionales(id),
    FOREIGN KEY (servicio_id) REFERENCES servicios(id),
    UNIQUE(profesional_id, servicio_id)
  )`);

  // Tabla de tokens de Google Calendar
  db.run(`CREATE TABLE IF NOT EXISTS google_tokens (
    profesional_id INTEGER PRIMARY KEY,
    access_token TEXT,
    refresh_token TEXT,
    expiry_date INTEGER,
    FOREIGN KEY (profesional_id) REFERENCES profesionales(id)
  )`);

  // Tabla de turnos CON CLIENTE_ID
  db.run(`CREATE TABLE IF NOT EXISTS turnos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    servicio_id INTEGER,
    profesional_id INTEGER,
    cliente_id INTEGER,
    cliente_nombre TEXT NOT NULL,
    cliente_whatsapp TEXT NOT NULL,
    fecha TEXT NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fin TEXT NOT NULL,
    estado TEXT DEFAULT 'pendiente',
    precio_pagado REAL DEFAULT 0,
    saldo_pendiente REAL DEFAULT 0,
    notas TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id),
    FOREIGN KEY (profesional_id) REFERENCES profesionales(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
  )`);

  // ========== DATOS INICIALES ==========

  // Insertar profesionales CON COLORES
  db.run(
    `INSERT OR IGNORE INTO profesionales (id, nombre, color) VALUES
    (1, 'Paula', '#e74c3c'),
    (2, 'Mia', '#3498db'),
    (3, 'Sophie', '#9b59b6'),
    (4, 'Flor', '#f39c12'),
    (5, 'Yami', '#1abc9c')
  `,
    (err) => {
      if (err && !err.message.includes("UNIQUE")) {
        console.error("Error insertando profesionales:", err);
      } else {
        console.log(
          "✅ Equipo actualizado: Paula (rojo), Mia (azul), Sophie (violeta), Flor (naranja), Yami (verde).",
        );
      }
    },
  );

  // Insertar servicios con precios y categorías
  db.run(
    `INSERT OR IGNORE INTO servicios (id, nombre, duracion, precio, categoria, descripcion) VALUES
    (1, 'Microblading', 120, 15000, 'Cejas', 'Técnica de micropigmentación para cejas perfectas'),
    (2, 'Extensión de Pestañas Pelo a Pelo', 90, 8000, 'Pestañas', 'Extensiones naturales una a una'),
    (3, 'Lifting de Pestañas', 60, 6000, 'Pestañas', 'Rizado y lifting natural'),
    (4, 'Perfilado de Cejas', 30, 3000, 'Cejas', 'Diseño y depilación de cejas'),
    (5, 'Limpieza Facial Profunda', 60, 7000, 'Faciales', 'Limpieza completa con extracción'),
    (6, 'Dermaplaning', 45, 8500, 'Faciales', 'Exfoliación con bisturí')
  `,
    (err) => {
      if (err && !err.message.includes("UNIQUE")) {
        console.error("Error insertando servicios:", err);
      } else {
        console.log("✅ Servicios cargados con precios y categorías.");
      }
    },
  );

  // Insertar horarios por defecto para cada profesional (con horarios cortados)
  const horariosPorDefecto = [
    {
      dia: "Lunes",
      inicio: "09:00",
      fin: "13:00",
      inicioTarde: "14:00",
      finTarde: "18:00",
    },
    {
      dia: "Martes",
      inicio: "09:00",
      fin: "13:00",
      inicioTarde: "14:00",
      finTarde: "18:00",
    },
    {
      dia: "Miércoles",
      inicio: "09:00",
      fin: "13:00",
      inicioTarde: "14:00",
      finTarde: "18:00",
    },
    {
      dia: "Jueves",
      inicio: "09:00",
      fin: "13:00",
      inicioTarde: "14:00",
      finTarde: "18:00",
    },
    {
      dia: "Viernes",
      inicio: "09:00",
      fin: "13:00",
      inicioTarde: "14:00",
      finTarde: "18:00",
    },
    {
      dia: "Sábado",
      inicio: "10:00",
      fin: "14:00",
      inicioTarde: null,
      finTarde: null,
    },
    {
      dia: "Domingo",
      inicio: "10:00",
      fin: "14:00",
      inicioTarde: null,
      finTarde: null,
    },
  ];

  // Asignar horarios a cada profesional (1-5)
  for (let profId = 1; profId <= 5; profId++) {
    horariosPorDefecto.forEach((h) => {
      db.run(
        `INSERT OR IGNORE INTO profesional_horarios (profesional_id, dia_semana, hora_inicio, hora_fin, hora_inicio_tarde, hora_fin_tarde) VALUES (?, ?, ?, ?, ?, ?)`,
        [profId, h.dia, h.inicio, h.fin, h.inicioTarde, h.finTarde],
      );
    });
  }

  console.log("✅ Horarios de trabajo configurados para cada profesional.");
  console.log("✅ Base de datos lista y actualizada.");
});

module.exports = db;
