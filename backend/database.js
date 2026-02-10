const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "turnos.db"), (err) => {
  if (err) console.error("Error base de datos:", err.message);
  else console.log("✅ Conectado a SQLite.");
});

db.serialize(() => {
  // 1. Crear tablas si no existen
  db.run(`CREATE TABLE IF NOT EXISTS profesionales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS servicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    duracion INTEGER NOT NULL,
    precio REAL DEFAULT 0,
    categoria TEXT DEFAULT 'General',
    descripcion TEXT,
    imagen_url TEXT
  )`);

  // NUEVA TABLA: Clientes
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

  db.run(`CREATE TABLE IF NOT EXISTS turnos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    servicio_id INTEGER,
    profesional_id INTEGER,
    cliente_id INTEGER,
    cliente_nombre TEXT,
    cliente_whatsapp TEXT,
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

  db.run(`CREATE TABLE IF NOT EXISTS google_tokens (
    profesional_id INTEGER PRIMARY KEY,
    access_token TEXT,
    refresh_token TEXT,
    expiry_date INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS configuracion_horarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dia_semana INTEGER NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fin TEXT NOT NULL,
    activo INTEGER DEFAULT 1
  )`);

  // --- ACTUALIZACIÓN DE DATOS ---
  db.run("DELETE FROM profesionales", (err) => {
    if (!err) {
      const equipo = ["Paula", "Mia", "Sophie", "Flor", "Yami"];
      equipo.forEach((nombre, index) => {
        db.run("INSERT INTO profesionales (id, nombre) VALUES (?, ?)", [
          index + 1,
          nombre,
        ]);
      });
      console.log("✅ Equipo actualizado: Paula, Mia, Sophie, Flor y Yami.");
    }
  });

  // Cargar Servicios (si la tabla está vacía)
  db.get("SELECT count(*) as count FROM servicios", (err, row) => {
    if (row && row.count === 0) {
      const serviciosIniciales = [
        [
          "Microblading",
          120,
          15000,
          "Cejas",
          "Técnica de micropigmentación para cejas perfectas",
        ],
        [
          "Extensión de Pestañas Pelo a Pelo",
          90,
          8000,
          "Pestañas",
          "Extensiones naturales una a una",
        ],
        [
          "Lifting de Pestañas",
          60,
          6000,
          "Pestañas",
          "Rizado y tinte de pestañas naturales",
        ],
        [
          "Perfilado de Cejas",
          30,
          3000,
          "Cejas",
          "Diseño y depilación profesional",
        ],
        [
          "Limpieza Facial Profunda",
          60,
          7000,
          "Faciales",
          "Limpieza completa con extracción",
        ],
        [
          "Dermaplaning",
          45,
          8500,
          "Faciales",
          "Exfoliación con bisturí para piel radiante",
        ],
      ];
      serviciosIniciales.forEach((s) => {
        db.run(
          "INSERT INTO servicios (nombre, duracion, precio, categoria, descripcion) VALUES (?, ?, ?, ?, ?)",
          s,
        );
      });
      console.log("✅ Servicios cargados con precios y categorías.");
    }
  });

  // Cargar Configuración de Horarios (si está vacía)
  db.get("SELECT count(*) as count FROM configuracion_horarios", (err, row) => {
    if (row && row.count === 0) {
      const horarios = [
        { dia: 1, inicio: "09:00", fin: "18:00" },
        { dia: 2, inicio: "09:00", fin: "18:00" },
        { dia: 3, inicio: "09:00", fin: "18:00" },
        { dia: 4, inicio: "09:00", fin: "18:00" },
        { dia: 5, inicio: "09:00", fin: "18:00" },
        { dia: 6, inicio: "10:00", fin: "14:00" },
      ];
      horarios.forEach((h) => {
        db.run(
          "INSERT INTO configuracion_horarios (dia_semana, hora_inicio, hora_fin) VALUES (?, ?, ?)",
          [h.dia, h.inicio, h.fin],
        );
      });
      console.log("✅ Configuración de horarios cargada.");
    }
  });

  console.log("✅ Base de datos lista y actualizada.");
});

module.exports = db;
