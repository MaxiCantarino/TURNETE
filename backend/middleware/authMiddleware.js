const { verifyToken } = require("../utils/auth");

// Middleware para verificar que el usuario esté autenticado
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error en autenticación:", error);
    return res.status(401).json({ error: "Error de autenticación" });
  }
};

// Middleware para verificar que sea dueño del negocio
const requireDueno = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (req.user.tipo === "superadmin") {
      return next();
    }

    if (!req.user.es_dueno) {
      return res.status(403).json({ error: "Acceso denegado: Solo dueños del negocio" });
    }

    next();
  } catch (error) {
    console.error("Error verificando permisos de dueño:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
};

// Middleware para verificar que sea super admin
const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (req.user.tipo !== "superadmin") {
      return res.status(403).json({ error: "Acceso denegado: Solo super administradores" });
    }

    next();
  } catch (error) {
    console.error("Error verificando super admin:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = {
  requireAuth,
  requireDueno,
  requireSuperAdmin,
};
