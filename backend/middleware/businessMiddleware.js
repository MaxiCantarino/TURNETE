// Middleware para inyectar business_id automáticamente
const requireBusiness = (req, res, next) => {
  // Por ahora hardcodeamos business_id = 1 (Salon Paula)
  // Más adelante esto vendrá del slug en la URL o del usuario autenticado
  req.businessId = 1;

  // TODO: Cuando implementemos autenticación:
  // req.businessId = req.user.business_id;
  // O cuando implementemos URLs públicas:
  // req.businessId = await getBusinessIdBySlug(req.params.slug);

  next();
};

// Middleware para obtener business_id desde slug en URL pública
const getBusinessFromSlug = async (req, res, next) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({ error: "Falta el slug del negocio" });
  }

  try {
    const { pool } = require("../database");
    const result = await pool.query(
      "SELECT id FROM businesses WHERE slug = $1 AND activo = true",
      [slug],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Negocio no encontrado" });
    }

    req.businessId = result.rows[0].id;
    next();
  } catch (error) {
    console.error("Error obteniendo business:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = { requireBusiness, getBusinessFromSlug };
