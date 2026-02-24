require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const { pool } = require("./database");
const { requireBusiness } = require("./middleware/businessMiddleware");
const multer = require("multer");
const path = require("path");

// Configurar almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, webp)"));
  },
});

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("public/uploads"));

// Configuración de Google OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// ========== CONFIGURACIÓN DEL NEGOCIO (PÚBLICO) ==========

app.get("/api/configuracion/negocio", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tenant_paula.configuracion_negocio WHERE business_id = 1");

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({
        nombre_negocio: "Turnete",
        slogan: "Sistema de Gestión de Turnos",
        color_primario: "#e91e63",
      });
    }
  } catch (error) {
    console.error("Error obteniendo configuración:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTAS DE PROFESIONALES ==========

app.get("/api/profesionales", requireBusiness, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tenant_paula.profesionales WHERE business_id = $1", [
      req.businessId,
    ]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo profesionales:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTAS DE SERVICIOS ==========

app.get("/api/servicios", requireBusiness, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tenant_paula.servicios WHERE business_id = $1", [req.businessId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo servicios:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTAS DE CONFIGURACIÓN ==========

app.get("/api/profesionales/:id/horarios", requireBusiness, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM tenant_paula.profesional_horarios 
       WHERE business_id = $1 AND profesional_id = $2 AND activo = true`,
      [req.businessId, id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo horarios:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/profesionales/:id/horarios/all", requireBusiness, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM tenant_paula.profesional_horarios 
       WHERE business_id = $1 AND profesional_id = $2 
       ORDER BY CASE dia_semana 
         WHEN 'Lunes' THEN 1 
         WHEN 'Martes' THEN 2 
         WHEN 'Miércoles' THEN 3 
         WHEN 'Jueves' THEN 4 
         WHEN 'Viernes' THEN 5 
         WHEN 'Sábado' THEN 6 
         WHEN 'Domingo' THEN 7 
       END`,
      [req.businessId, id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo horarios:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/configuracion", requireBusiness, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dia_semana, hora_inicio, hora_fin, hora_inicio_tarde, hora_fin_tarde 
       FROM tenant_paula.profesional_horarios 
       WHERE business_id = $1 AND profesional_id = 1 AND activo = true`,
      [req.businessId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo configuración:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/profesionales/:id/horarios/:dia", requireBusiness, async (req, res) => {
  const { id, dia } = req.params;
  const { hora_inicio, hora_fin, activo } = req.body;

  try {
    await pool.query(
      `UPDATE tenant_paula.profesional_horarios 
       SET hora_inicio = $1, hora_fin = $2, activo = $3
       WHERE business_id = $4 AND profesional_id = $5 AND dia_semana = $6`,
      [hora_inicio, hora_fin, activo ? true : false, req.businessId, id, dia],
    );
    res.json({ message: "Horario actualizado" });
  } catch (error) {
    console.error("Error actualizando horario:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/profesionales/:id/horarios", requireBusiness, async (req, res) => {
  const { id } = req.params;
  const { dia_semana, hora_inicio, hora_fin, hora_inicio_tarde, hora_fin_tarde, activo } = req.body;

  try {
    await pool.query(
      `INSERT INTO tenant_paula.profesional_horarios 
       (business_id, profesional_id, dia_semana, hora_inicio, hora_fin, hora_inicio_tarde, hora_fin_tarde, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (profesional_id, dia_semana) 
       DO UPDATE SET 
         hora_inicio = $4, 
         hora_fin = $5, 
         hora_inicio_tarde = $6, 
         hora_fin_tarde = $7, 
         activo = $8`,
      [req.businessId, id, dia_semana, hora_inicio, hora_fin, hora_inicio_tarde, hora_fin_tarde, activo ? true : false],
    );
    res.json({ message: "Horario guardado" });
  } catch (error) {
    console.error("Error guardando horario:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTAS DE TURNOS ==========

app.get("/api/turnos", requireBusiness, async (req, res) => {
  const { fecha_desde, fecha_hasta, profesional_id } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM tenant_paula.turnos 
       WHERE business_id = $1 AND fecha BETWEEN $2 AND $3 AND profesional_id = $4`,
      [req.businessId, fecha_desde, fecha_hasta, profesional_id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo turnos:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/turnos", requireBusiness, async (req, res) => {
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

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SET search_path TO tenant_paula, public");

    const checkResult = await client.query(
      `SELECT id FROM turnos 
       WHERE business_id = $1 AND profesional_id = $2 AND fecha = $3 AND hora_inicio = $4`,
      [req.businessId, profesional_id, fecha, hora_inicio],
    );

    if (checkResult.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Este horario ya está reservado" });
    }

    const insertResult = await client.query(
      `INSERT INTO turnos (
        business_id, servicio_id, profesional_id, cliente_id, cliente_nombre, cliente_whatsapp, 
        fecha, hora_inicio, hora_fin, precio_pagado, saldo_pendiente, notas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id`,
      [
        req.businessId,
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
    );

    const nuevoId = insertResult.rows[0].id;

    await client.query("COMMIT");

    const tokenResult = await pool.query(
      "SELECT * FROM tenant_paula.google_tokens WHERE business_id = $1 AND profesional_id = $2",
      [req.businessId, profesional_id],
    );

    if (tokenResult.rows.length > 0) {
      const row = tokenResult.rows[0];
      try {
        oauth2Client.setCredentials({
          access_token: row.access_token,
          refresh_token: row.refresh_token,
          expiry_date: row.expiry_date,
        });
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
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
        console.log(`✅ Turno ${nuevoId} sincronizado con Google Calendar.`);
      } catch (e) {
        console.error("❌ Error al sincronizar con Google Calendar:", e.message);
      }
    }

    res.json({ id: nuevoId });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({ error: "Este horario ya está reservado" });
    }

    console.error("Error creando turno:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.put("/api/turnos/:id/estado", requireBusiness, async (req, res) => {
  const { estado } = req.body;

  try {
    await pool.query(
      `UPDATE tenant_paula.turnos 
       SET estado = $1 
       WHERE business_id = $2 AND id = $3`,
      [estado, req.businessId, req.params.id],
    );
    res.json({ message: "Estado actualizado" });
  } catch (error) {
    console.error("Error actualizando estado:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/turnos/:id", requireBusiness, async (req, res) => {
  try {
    await pool.query("DELETE FROM tenant_paula.turnos WHERE business_id = $1 AND id = $2", [
      req.businessId,
      req.params.id,
    ]);
    res.json({ message: "Turno eliminado" });
  } catch (error) {
    console.error("Error eliminando turno:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTAS DE CLIENTES ==========

app.get("/api/clientes/whatsapp/:whatsapp", requireBusiness, async (req, res) => {
  const { whatsapp } = req.params;

  try {
    const result = await pool.query("SELECT * FROM tenant_paula.clientes WHERE business_id = $1 AND whatsapp = $2", [
      req.businessId,
      whatsapp,
    ]);
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error("Error buscando cliente:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/clientes/dni/:dni", requireBusiness, async (req, res) => {
  const { dni } = req.params;

  try {
    const result = await pool.query("SELECT * FROM tenant_paula.clientes WHERE business_id = $1 AND whatsapp = $2", [
      req.businessId,
      dni,
    ]);
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error("Error buscando cliente:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/clientes", requireBusiness, async (req, res) => {
  const { whatsapp, nombre, apellido, edad, telefono, email } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tenant_paula.clientes (business_id, whatsapp, nombre, apellido, edad, telefono, email) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, whatsapp, nombre, apellido`,
      [req.businessId, whatsapp, nombre, apellido, edad, telefono, email],
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creando cliente:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/clientes/:id/turnos", requireBusiness, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT t.*, s.nombre as servicio_nombre, s.precio, s.categoria,
              p.nombre as profesional_nombre
       FROM tenant_paula.turnos t
       JOIN tenant_paula.servicios s ON t.servicio_id = s.id
       JOIN tenant_paula.profesionales p ON t.profesional_id = p.id
       WHERE t.business_id = $1 AND t.cliente_id = $2
       ORDER BY t.fecha DESC, t.hora_inicio DESC`,
      [req.businessId, id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/clientes/:id/deuda", requireBusiness, async (req, res) => {
  const { id } = req.params;
  const { saldo_deuda } = req.body;

  try {
    await pool.query("UPDATE tenant_paula.clientes SET saldo_deuda = $1 WHERE business_id = $2 AND id = $3", [
      saldo_deuda,
      req.businessId,
      id,
    ]);
    res.json({ message: "Saldo actualizado" });
  } catch (error) {
    console.error("Error actualizando saldo:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/clientes", requireBusiness, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tenant_paula.clientes WHERE business_id = $1 ORDER BY creado_en DESC",
      [req.businessId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo clientes:", error);
    res.status(500).json({ error: error.message });
  }
});

const { hashPassword, verifyPassword, generateToken } = require("./utils/auth");
const { requireAuth, requireDueno, requireSuperAdmin } = require("./middleware/authMiddleware");
const rateLimit = require("express-rate-limit");

// Rate limiting para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: "Demasiados intentos de login. Intenta de nuevo en 15 minutos.",
  handler: (req, res) => {
    res.status(429).json({
      error: "Demasiados intentos de login. Intenta de nuevo en 15 minutos.",
    });
  },
});

// ========== AUTENTICACIÓN ==========

app.post("/api/auth/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y password requeridos" });
  }

  try {
    // Buscar en qué tenant está el usuario
    const tenantsResult = await pool.query("SELECT id, schema_name FROM public.tenants");

    let user = null;
    let businessId = null;
    let userSchema = null;

    // Buscar el usuario en cada tenant
    for (const tenant of tenantsResult.rows) {
      const authResult = await pool.query(
        `SELECT pa.*, p.nombre, p.apellido, p.es_dueno, p.color, p.activo as profesional_activo
         FROM ${tenant.schema_name}.profesional_auth pa
         JOIN ${tenant.schema_name}.profesionales p ON pa.profesional_id = p.id
         WHERE pa.email = $1`,
        [email],
      );

      if (authResult.rows.length > 0) {
        user = authResult.rows[0];
        businessId = tenant.id;
        userSchema = tenant.schema_name;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Verificar si está bloqueado
    if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
      return res.status(403).json({
        error: "Cuenta bloqueada temporalmente",
      });
    }

    // Verificar si está activo
    if (!user.activo || !user.profesional_activo) {
      return res.status(403).json({ error: "Usuario inactivo" });
    }

    // Verificar password
    const passwordValido = await verifyPassword(password, user.password_hash);

    if (!passwordValido) {
      const intentos = user.intentos_fallidos + 1;
      const bloqueado = intentos >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await pool.query(
        `UPDATE ${userSchema}.profesional_auth 
         SET intentos_fallidos = $1, bloqueado_hasta = $2 
         WHERE profesional_id = $3`,
        [intentos, bloqueado, user.profesional_id],
      );

      return res.status(401).json({
        error: "Credenciales inválidas",
        intentosRestantes: 5 - intentos,
      });
    }

    // Login exitoso
    await pool.query(
      `UPDATE ${userSchema}.profesional_auth 
       SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_login = NOW() 
       WHERE profesional_id = $1`,
      [user.profesional_id],
    );

    const token = generateToken({
      profesionalId: user.profesional_id,
      businessId: businessId,
      email: user.email,
      es_dueno: user.es_dueno,
      tipo: "profesional",
    });

    res.json({
      token,
      user: {
        id: user.profesional_id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        es_dueno: user.es_dueno,
        color: user.color,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// ========== RUTAS ADMIN ==========

app.get("/api/admin/turnos", requireBusiness, async (req, res) => {
  const { fecha, estado, profesional_id } = req.query;

  let sql = `
    SELECT t.*, 
           s.nombre as servicio_nombre, s.precio, s.categoria, s.duracion,
           p.nombre as profesional_nombre, p.color as profesional_color,
           c.nombre as cliente_nombre_completo, c.apellido, c.whatsapp, c.telefono
    FROM tenant_paula.turnos t
    LEFT JOIN tenant_paula.servicios s ON t.servicio_id = s.id
    LEFT JOIN tenant_paula.profesionales p ON t.profesional_id = p.id
    LEFT JOIN tenant_paula.clientes c ON t.cliente_id = c.id
    WHERE t.business_id = $1
  `;

  const params = [req.businessId];
  let paramIndex = 2;

  if (fecha) {
    sql += ` AND t.fecha = $${paramIndex}`;
    params.push(fecha);
    paramIndex++;
  }

  if (estado) {
    sql += ` AND t.estado = $${paramIndex}`;
    params.push(estado);
    paramIndex++;
  }

  if (profesional_id) {
    sql += ` AND t.profesional_id = $${paramIndex}`;
    params.push(profesional_id);
    paramIndex++;
  }

  sql += " ORDER BY t.fecha DESC, t.hora_inicio DESC";

  try {
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo turnos admin:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/estadisticas", requireBusiness, async (req, res) => {
  const hoy = new Date().toISOString().split("T")[0];

  try {
    const turnosHoyResult = await pool.query(
      `SELECT COUNT(*) as total FROM tenant_paula.turnos 
       WHERE business_id = $1 AND fecha = $2 AND estado != 'cancelado'`,
      [req.businessId, hoy],
    );

    const turnosPendientesResult = await pool.query(
      `SELECT COUNT(*) as total FROM tenant_paula.turnos 
       WHERE business_id = $1 AND fecha >= $2 AND estado = 'pendiente'`,
      [req.businessId, hoy],
    );

    const totalClientesResult = await pool.query(
      "SELECT COUNT(*) as total FROM tenant_paula.clientes WHERE business_id = $1",
      [req.businessId],
    );

    const deudaTotalResult = await pool.query(
      "SELECT SUM(saldo_deuda) as total FROM tenant_paula.clientes WHERE business_id = $1",
      [req.businessId],
    );

    res.json({
      turnosHoy: parseInt(turnosHoyResult.rows[0].total),
      turnosPendientes: parseInt(turnosPendientesResult.rows[0].total),
      totalClientes: parseInt(totalClientesResult.rows[0].total),
      deudaTotal: parseFloat(deudaTotalResult.rows[0].total) || 0,
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/actividad-reciente", requireBusiness, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, 
              s.nombre as servicio_nombre,
              p.nombre as profesional_nombre,
              c.nombre as cliente_nombre, c.apellido
       FROM tenant_paula.turnos t
       LEFT JOIN tenant_paula.servicios s ON t.servicio_id = s.id
       LEFT JOIN tenant_paula.profesionales p ON t.profesional_id = p.id
       LEFT JOIN tenant_paula.clientes c ON t.cliente_id = c.id
       WHERE t.business_id = $1
       ORDER BY t.creado_en DESC
       LIMIT 10`,
      [req.businessId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo actividad reciente:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/recordatorios", requireBusiness, async (req, res) => {
  const mañana = new Date();
  mañana.setDate(mañana.getDate() + 1);
  const fechaMañana = mañana.toISOString().split("T")[0];

  try {
    const result = await pool.query(
      `SELECT t.*, 
              s.nombre as servicio_nombre,
              p.nombre as profesional_nombre, p.color as profesional_color,
              c.nombre as cliente_nombre, c.apellido, c.telefono
       FROM tenant_paula.turnos t 
       LEFT JOIN tenant_paula.servicios s ON t.servicio_id = s.id
       LEFT JOIN tenant_paula.profesionales p ON t.profesional_id = p.id
       LEFT JOIN tenant_paula.clientes c ON t.cliente_id = c.id
       WHERE t.business_id = $1 AND t.fecha = $2 AND t.estado IN ('pendiente', 'confirmado')
       ORDER BY t.hora_inicio ASC`,
      [req.businessId, fechaMañana],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo recordatorios:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/servicios/:id", requireBusiness, async (req, res) => {
  const { id } = req.params;
  const { nombre, duracion, precio, categoria, descripcion } = req.body;

  try {
    await pool.query(
      `UPDATE tenant_paula.servicios 
       SET nombre = $1, duracion = $2, precio = $3, categoria = $4, descripcion = $5
       WHERE business_id = $6 AND id = $7`,
      [nombre, duracion, precio, categoria, descripcion, req.businessId, id],
    );
    res.json({ message: "Servicio actualizado" });
  } catch (error) {
    console.error("Error actualizando servicio:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/servicios", requireBusiness, async (req, res) => {
  const { nombre, duracion, precio, categoria, descripcion } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tenant_paula.servicios (business_id, nombre, duracion, precio, categoria, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [req.businessId, nombre, duracion, precio, categoria, descripcion],
    );
    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Error creando servicio:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/servicios/:id", requireBusiness, async (req, res) => {
  try {
    await pool.query("DELETE FROM tenant_paula.servicios WHERE business_id = $1 AND id = $2", [
      req.businessId,
      req.params.id,
    ]);
    res.json({ message: "Servicio eliminado" });
  } catch (error) {
    console.error("Error eliminando servicio:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTAS DE PROFESIONAL-SERVICIOS ==========

app.get("/api/profesionales/:id/servicios", requireBusiness, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT s.* 
       FROM tenant_paula.servicios s
       INNER JOIN tenant_paula.profesional_servicios ps ON s.id = ps.servicio_id
       WHERE ps.business_id = $1 AND ps.profesional_id = $2`,
      [req.businessId, id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo servicios del profesional:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/profesionales/:id/servicios", requireBusiness, async (req, res) => {
  const { id } = req.params;
  const { servicio_id } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tenant_paula.profesional_servicios (business_id, profesional_id, servicio_id) 
       VALUES ($1, $2, $3)
       RETURNING id`,
      [req.businessId, id, servicio_id],
    );
    res.json({ id: result.rows[0].id, message: "Servicio asignado" });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Servicio ya asignado" });
    }
    console.error("Error asignando servicio:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/profesionales/:id/servicios/:servicio_id", requireBusiness, async (req, res) => {
  const { id, servicio_id } = req.params;

  try {
    await pool.query(
      `DELETE FROM tenant_paula.profesional_servicios 
       WHERE business_id = $1 AND profesional_id = $2 AND servicio_id = $3`,
      [req.businessId, id, servicio_id],
    );
    res.json({ message: "Servicio desasignado" });
  } catch (error) {
    console.error("Error desasignando servicio:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/servicios/:id/profesionales", requireBusiness, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.* 
       FROM tenant_paula.profesionales p
       INNER JOIN tenant_paula.profesional_servicios ps ON p.id = ps.profesional_id
       WHERE ps.business_id = $1 AND ps.servicio_id = $2`,
      [req.businessId, id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo profesionales del servicio:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTAS DE SOBRETURNOS ==========

app.get("/api/sobreturnos", requireBusiness, async (req, res) => {
  const { fecha, profesional_id } = req.query;

  let sql = "SELECT * FROM tenant_paula.sobreturnos WHERE business_id = $1";
  const params = [req.businessId];
  let paramIndex = 2;

  if (fecha) {
    sql += ` AND fecha = $${paramIndex}`;
    params.push(fecha);
    paramIndex++;
  }

  if (profesional_id) {
    sql += ` AND profesional_id = $${paramIndex}`;
    params.push(profesional_id);
    paramIndex++;
  }

  sql += " ORDER BY fecha, hora_inicio";

  try {
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo sobreturnos:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sobreturnos", requireBusiness, async (req, res) => {
  const { profesional_id, fecha, hora_inicio, hora_fin, motivo } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tenant_paula.sobreturnos (business_id, profesional_id, fecha, hora_inicio, hora_fin, motivo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [req.businessId, profesional_id, fecha, hora_inicio, hora_fin, motivo || null],
    );
    res.json({
      id: result.rows[0].id,
      message: "Sobreturno creado correctamente",
    });
  } catch (error) {
    console.error("Error creando sobreturno:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/sobreturnos/:id", requireBusiness, async (req, res) => {
  try {
    await pool.query("DELETE FROM tenant_paula.sobreturnos WHERE business_id = $1 AND id = $2", [
      req.businessId,
      req.params.id,
    ]);
    res.json({ message: "Sobreturno eliminado" });
  } catch (error) {
    console.error("Error eliminando sobreturno:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTAS DE BLOQUES BLOQUEADOS ==========

app.get("/api/bloques-bloqueados", requireBusiness, async (req, res) => {
  const { fecha_desde, fecha_hasta, profesional_id } = req.query;

  let sql = "SELECT * FROM tenant_paula.bloques_bloqueados WHERE business_id = $1";
  const params = [req.businessId];
  let paramIndex = 2;

  if (fecha_desde && fecha_hasta) {
    sql += ` AND fecha BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
    params.push(fecha_desde, fecha_hasta);
    paramIndex += 2;
  }

  if (profesional_id) {
    sql += ` AND profesional_id = $${paramIndex}`;
    params.push(profesional_id);
    paramIndex++;
  }

  sql += " ORDER BY fecha, hora_inicio";

  try {
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo bloques bloqueados:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/bloques-bloqueados", requireBusiness, async (req, res) => {
  const { profesional_id, fecha, hora_inicio, hora_fin, motivo } = req.body;

  if (!profesional_id || !fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tenant_paula.bloques_bloqueados (business_id, profesional_id, fecha, hora_inicio, hora_fin, motivo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [req.businessId, profesional_id, fecha, hora_inicio, hora_fin, motivo || null],
    );
    res.json({
      id: result.rows[0].id,
      message: "Bloque bloqueado correctamente",
    });
  } catch (error) {
    console.error("Error bloqueando bloque:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/bloques-bloqueados/:id", requireBusiness, async (req, res) => {
  try {
    await pool.query("DELETE FROM tenant_paula.bloques_bloqueados WHERE business_id = $1 AND id = $2", [
      req.businessId,
      req.params.id,
    ]);
    res.json({ message: "Bloqueo eliminado" });
  } catch (error) {
    console.error("Error eliminando bloqueo:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTAS DE AUTENTICACIÓN GOOGLE ==========

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

    const businessId = 1;

    await pool.query(
      `INSERT INTO tenant_paula.google_tokens (business_id, profesional_id, access_token, refresh_token, expiry_date) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (profesional_id) 
       DO UPDATE SET access_token = $3, refresh_token = $4, expiry_date = $5`,
      [businessId, state, tokens.access_token, tokens.refresh_token, tokens.expiry_date],
    );

    console.log(`✅ Google vinculado para el profesional ID: ${state}`);
    res.redirect("http://localhost:3000/admin?google=success");
  } catch (error) {
    console.error("Error en el callback de Google:", error);
    res.redirect("http://localhost:3000/admin?google=error");
  }
});
app.put("/api/admin/configuracion", requireBusiness, async (req, res) => {
  const { nombre_negocio, slogan, telefono, instagram, direccion, color_primario, banner_position } = req.body;

  try {
    await pool.query(
      `UPDATE tenant_paula.configuracion_negocio 
       SET nombre_negocio = $1, slogan = $2, telefono = $3, instagram = $4, direccion = $5, color_primario = $6, banner_position = $7
       WHERE business_id = $8`,
      [nombre_negocio, slogan, telefono, instagram, direccion, color_primario, banner_position, req.businessId],
    );
    res.json({ message: "Configuración actualizada" });
  } catch (error) {
    console.error("Error actualizando configuración:", error);
    res.status(500).json({ error: error.message });
  }
});
// Subir banner
app.post("/api/admin/configuracion/banner", requireBusiness, upload.single("banner"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ninguna imagen" });
    }

    const bannerUrl = `/uploads/${req.file.filename}`;

    await pool.query("UPDATE tenant_paula.configuracion_negocio SET banner_url = $1 WHERE business_id = $2", [
      bannerUrl,
      req.businessId,
    ]);

    res.json({ banner_url: bannerUrl });
  } catch (error) {
    console.error("Error subiendo banner:", error);
    res.status(500).json({ error: error.message });
  }
});

// Subir logo
app.post("/api/admin/configuracion/logo", requireBusiness, upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ninguna imagen" });
    }

    const logoUrl = `/uploads/${req.file.filename}`;

    await pool.query("UPDATE tenant_paula.configuracion_negocio SET logo_url = $1 WHERE business_id = $2", [
      logoUrl,
      req.businessId,
    ]);

    res.json({ logo_url: logoUrl });
  } catch (error) {
    console.error("Error subiendo logo:", error);
    res.status(500).json({ error: error.message });
  }
});
// ========== INICIO DEL SERVIDOR ==========
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
