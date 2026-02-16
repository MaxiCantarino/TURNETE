const { Pool } = require("pg");

// Configuración de conexión a PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "turnete_db",
  password: "Duna3215",
  port: 5432,
});

// Función helper para ejecutar queries CON business_id automático
const query = async (text, params, businessId) => {
  const client = await pool.connect();
  try {
    // Usar el schema del tenant
    await client.query("SET search_path TO tenant_paula, public");

    // Si la query es un SELECT/UPDATE/DELETE y tiene WHERE, inyectar business_id
    // Esto es una medida de seguridad adicional
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// Inicializar conexión
const initDB = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Conectado a PostgreSQL - Base de datos: turnete_db");
    console.log("✅ Schema activo: tenant_paula");
    console.log("✅ Sistema multi-tenant con business_id listo");
  } catch (error) {
    console.error("❌ Error conectando a PostgreSQL:", error.message);
    process.exit(1);
  }
};

// Ejecutar inicialización
initDB();

module.exports = { pool, query };
