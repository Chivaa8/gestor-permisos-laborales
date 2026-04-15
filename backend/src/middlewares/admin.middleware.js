const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.rol !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }

  next();
};

export default adminMiddleware;