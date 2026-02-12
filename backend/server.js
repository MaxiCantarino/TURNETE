require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const db = require("./database");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de Google OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// --- RUTAS DE LA API ---

// ========== RUTAS DE PROFESIONALES ==========
app.get("/api/profesionales", (req, res) => {
  db.all("SELECT * FROM profesionales", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ========== RUTAS DE SERVICIOS ==========
app.get("/api/servicios", (req, res) => {
  db.all("SELECT * FROM servicios", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ========== RUTAS DE CONFIGURACIÓN ==========

// Obtener horarios de un profesional específico
app.get("/api/profesionales/:id/horarios", (req, res) => {
  const { id } = req.params;

  db.all(
    "SELECT * FROM profesional_horarios WHERE profesional_id = ? AND activo = 1",
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    },
  );
});

// Obtener configuración (para compatibilidad - deprecado)
app.get("/api/configuracion", (req, res) => {
  // Por ahora devuelve horarios del primer profesional como fallback
  db.all(
    "SELECT dia_semana, hora_inicio, hora_fin FROM profesional_horarios WHERE profesional_id = 1 AND activo = 1",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    },
  );
});

// ========== RUTAS DE TURNOS ==========

// Obtener turnos existentes (para evitar solapamientos)
app.get("/api/turnos", (req, res) => {
  const { fecha_desde, fecha_hasta, profesional_id } = req.query;
  db.all(
    "SELECT * FROM turnos WHERE fecha BETWEEN ? AND ? AND profesional_id = ?",
    [fecha_desde, fecha_hasta, profesional_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    },
  );
});

// Crear un nuevo turno y sincronizar con Google
app.post("/api/turnos", (req, res) => {
  const {
    servicio_id,
    profesional_id,
    cliente_id,
    cliente_nombre,
    cliente_whatsapp,
    fecha,
    hora_inicio,
    hora_fin,
    precio_pagado,
    saldo_pendiente,
    notas,
  } = req.body;

  const sql = `INSERT INTO turnos (
    servicio_id, profesional_id, cliente_id, cliente_nombre, cliente_whatsapp, 
    fecha, hora_inicio, hora_fin, precio_pagado, saldo_pendiente, notas
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(
    sql,
    [
      servicio_id,
      profesional_id,
      cliente_id || null,
      cliente_nombre,
      cliente_whatsapp,
      fecha,
      hora_inicio,
      hora_fin,
      precio_pagado || 0,
      saldo_pendiente || 0,
      notas || null,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const nuevoId = this.lastID;

      // Buscar si el profesional tiene Google vinculado
      db.get(
        "SELECT * FROM google_tokens WHERE profesional_id = ?",
        [profesional_id],
        async (err, row) => {
          if (row) {
            try {
              oauth2Client.setCredentials({
                access_token: row.access_token,
                refresh_token: row.refresh_token,
                expiry_date: row.expiry_date,
              });
              const calendar = google.calendar({
                version: "v3",
                auth: oauth2Client,
              });
              await calendar.events.insert({
                calendarId: "primary",
                requestBody: {
                  summary: `Turno: ${cliente_nombre}`,
                  description: `WhatsApp: ${cliente_whatsapp}`,
                  start: {
                    dateTime: `${fecha}T${hora_inicio}:00`,
                    timeZone: "America/Argentina/Buenos_Aires",
                  },
                  end: {
                    dateTime: `${fecha}T${hora_fin}:00`,
                    timeZone: "America/Argentina/Buenos_Aires",
                  },
                },
              });
              console.log(
                `✅ Turno ${nuevoId} sincronizado con Google Calendar.`,
              );
            } catch (e) {
              console.error(
                "❌ Error al sincronizar con Google Calendar:",
                e.message,
              );
            }
          }
        },
      );

      res.json({ id: nuevoId });
    },
  );
});

// Actualizar estado de turno
app.put("/api/turnos/:id/estado", (req, res) => {
  const { estado } = req.body;
  db.run(
    "UPDATE turnos SET estado = ? WHERE id = ?",
    [estado, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Estado actualizado" });
    },
  );
});

// Eliminar turno
app.delete("/api/turnos/:id", (req, res) => {
  db.run("DELETE FROM turnos WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Turno eliminado" });
  });
});

// ========== RUTAS DE CLIENTES ==========

// Buscar cliente por DNI
app.get("/api/clientes/dni/:dni", (req, res) => {
  const { dni } = req.params;
  db.get("SELECT * FROM clientes WHERE dni = ?", [dni], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || null);
  });
});

// Crear nuevo cliente
app.post("/api/clientes", (req, res) => {
  const { dni, nombre, apellido, edad, telefono, email } = req.body;

  const sql = `INSERT INTO clientes (dni, nombre, apellido, edad, telefono, email) 
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [dni, nombre, apellido, edad, telefono, email], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, dni, nombre, apellido });
  });
});

// Obtener historial de turnos de un cliente
app.get("/api/clientes/:id/turnos", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT t.*, s.nombre as servicio_nombre, s.precio, s.categoria,
           p.nombre as profesional_nombre
    FROM turnos t
    JOIN servicios s ON t.servicio_id = s.id
    JOIN profesionales p ON t.profesional_id = p.id
    WHERE t.cliente_id = ?
    ORDER BY t.fecha DESC, t.hora_inicio DESC
  `;

  db.all(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Actualizar saldo de deuda de cliente
app.put("/api/clientes/:id/deuda", (req, res) => {
  const { id } = req.params;
  const { saldo_deuda } = req.body;

  db.run(
    "UPDATE clientes SET saldo_deuda = ? WHERE id = ?",
    [saldo_deuda, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Saldo actualizado" });
    },
  );
});

// Obtener todos los clientes (para admin)
app.get("/api/clientes", (req, res) => {
  db.all("SELECT * FROM clientes ORDER BY creado_en DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// ========== RUTAS ADMIN ==========

// Obtener todos los turnos con detalles (para admin)
app.get("/api/admin/turnos", (req, res) => {
  const { fecha, estado, profesional_id } = req.query;

  let sql = `
  SELECT t.*, 
         s.nombre as servicio_nombre, s.precio, s.categoria, s.duracion,
         p.nombre as profesional_nombre, p.color as profesional_color,
         c.nombre as cliente_nombre_completo, c.apellido, c.dni, c.telefono
  FROM turnos t
    LEFT JOIN servicios s ON t.servicio_id = s.id
    LEFT JOIN profesionales p ON t.profesional_id = p.id
    LEFT JOIN clientes c ON t.cliente_id = c.id
    WHERE 1=1
  `;

  const params = [];

  if (fecha) {
    sql += " AND t.fecha = ?";
    params.push(fecha);
  }

  if (estado) {
    sql += " AND t.estado = ?";
    params.push(estado);
  }

  if (profesional_id) {
    sql += " AND t.profesional_id = ?";
    params.push(profesional_id);
  }

  sql += " ORDER BY t.fecha DESC, t.hora_inicio DESC";

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Obtener estadísticas del dashboard
app.get("/api/admin/estadisticas", (req, res) => {
  const stats = {};

  // Turnos de hoy
  const hoy = new Date().toISOString().split("T")[0];
  db.get(
    "SELECT COUNT(*) as total FROM turnos WHERE fecha = ? AND estado != 'cancelado'",
    [hoy],
    (err, row) => {
      stats.turnosHoy = row?.total || 0;

      // Turnos pendientes (futuros)
      db.get(
        "SELECT COUNT(*) as total FROM turnos WHERE fecha >= ? AND estado = 'pendiente'",
        [hoy],
        (err, row) => {
          stats.turnosPendientes = row?.total || 0;

          // Total clientes
          db.get("SELECT COUNT(*) as total FROM clientes", [], (err, row) => {
            stats.totalClientes = row?.total || 0;

            // Deuda total
            db.get(
              "SELECT SUM(saldo_deuda) as total FROM clientes",
              [],
              (err, row) => {
                stats.deudaTotal = row?.total || 0;

                res.json(stats);
              },
            );
          });
        },
      );
    },
  );
});

// Actividad reciente (últimos 10 turnos)
app.get("/api/admin/actividad-reciente", (req, res) => {
  const sql = `
    SELECT t.*, 
           s.nombre as servicio_nombre,
           p.nombre as profesional_nombre,
           c.nombre as cliente_nombre, c.apellido
    FROM turnos t
    LEFT JOIN servicios s ON t.servicio_id = s.id
    LEFT JOIN profesionales p ON t.profesional_id = p.id
    LEFT JOIN clientes c ON t.cliente_id = c.id
    ORDER BY t.creado_en DESC
    LIMIT 10
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Obtener turnos para recordatorios (mañana)
app.get("/api/admin/recordatorios", (req, res) => {
  // Calcular fecha de mañana
  const mañana = new Date();
  mañana.setDate(mañana.getDate() + 1);
  const fechaMañana = mañana.toISOString().split("T")[0];

  const sql = `
  SELECT t.*, 
         s.nombre as servicio_nombre,
         p.nombre as profesional_nombre, p.color as profesional_color,
         c.nombre as cliente_nombre, c.apellido, c.telefono
  FROM turnos t 
    LEFT JOIN servicios s ON t.servicio_id = s.id
    LEFT JOIN profesionales p ON t.profesional_id = p.id
    LEFT JOIN clientes c ON t.cliente_id = c.id
    WHERE t.fecha = ? 
    AND t.estado IN ('pendiente', 'confirmado')
    ORDER BY t.hora_inicio ASC
  `;

  db.all(sql, [fechaMañana], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Actualizar servicio
app.put("/api/admin/servicios/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, duracion, precio, categoria, descripcion } = req.body;

  const sql = `UPDATE servicios 
               SET nombre = ?, duracion = ?, precio = ?, categoria = ?, descripcion = ?
               WHERE id = ?`;

  db.run(
    sql,
    [nombre, duracion, precio, categoria, descripcion, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Servicio actualizado" });
    },
  );
});

// Crear servicio
app.post("/api/admin/servicios", (req, res) => {
  const { nombre, duracion, precio, categoria, descripcion } = req.body;

  const sql = `INSERT INTO servicios (nombre, duracion, precio, categoria, descripcion)
               VALUES (?, ?, ?, ?, ?)`;

  db.run(
    sql,
    [nombre, duracion, precio, categoria, descripcion],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    },
  );
});

// Eliminar servicio
app.delete("/api/admin/servicios/:id", (req, res) => {
  db.run("DELETE FROM servicios WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Servicio eliminado" });
  });
});
// ========== RUTAS DE PROFESIONAL-SERVICIOS ==========

// Obtener servicios asignados a un profesional
app.get("/api/profesionales/:id/servicios", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT s.* 
    FROM servicios s
    INNER JOIN profesional_servicios ps ON s.id = ps.servicio_id
    WHERE ps.profesional_id = ?
  `;

  db.all(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Asignar servicio a profesional
app.post("/api/profesionales/:id/servicios", (req, res) => {
  const { id } = req.params;
  const { servicio_id } = req.body;

  const sql = `INSERT INTO profesional_servicios (profesional_id, servicio_id) 
               VALUES (?, ?)`;

  db.run(sql, [id, servicio_id], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({ error: "Servicio ya asignado" });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, message: "Servicio asignado" });
  });
});

// Desasignar servicio de profesional
app.delete("/api/profesionales/:id/servicios/:servicio_id", (req, res) => {
  const { id, servicio_id } = req.params;

  db.run(
    "DELETE FROM profesional_servicios WHERE profesional_id = ? AND servicio_id = ?",
    [id, servicio_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Servicio desasignado" });
    },
  );
});

// Obtener profesionales que ofrecen un servicio específico
app.get("/api/servicios/:id/profesionales", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT p.* 
    FROM profesionales p
    INNER JOIN profesional_servicios ps ON p.id = ps.profesional_id
    WHERE ps.servicio_id = ?
  `;

  db.all(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// --- RUTAS DE AUTENTICACIÓN GOOGLE ---

app.get("/api/auth/google/:id", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state: req.params.id,
    prompt: "consent",
  });
  res.redirect(url);
});

app.get("/api/auth/google/callback", async (req, res) => {
  const { code, state } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    db.run(
      `INSERT OR REPLACE INTO google_tokens (profesional_id, access_token, refresh_token, expiry_date) VALUES (?, ?, ?, ?)`,
      [state, tokens.access_token, tokens.refresh_token, tokens.expiry_date],
      (err) => {
        if (err) throw err;
        console.log(`✅ Google vinculado para el profesional ID: ${state}`);
        res.redirect("http://localhost:3000/admin?google=success");
      },
    );
  } catch (error) {
    console.error("Error en el callback de Google:", error);
    res.redirect("http://localhost:3000/admin?google=error");
  }
});

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
