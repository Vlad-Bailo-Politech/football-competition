module.exports = function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Дозволено передати або один рядок, або масив
    if (Array.isArray(allowedRoles)) {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
    } else {
      if (req.user.role !== allowedRoles) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }
    next();
  };
};