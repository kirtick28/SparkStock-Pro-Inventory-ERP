const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Unauthorized. Required role: ${allowedRoles.join(' or ')}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Error checking role authorization',
        error: error.message
      });
    }
  };
};

module.exports = roleMiddleware;
