const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ message: 'Unauthorized: No role found' });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        message: `Forbidden: Access denied for role '${req.userRole}'`,
      });
    }

    next();
  };
};

export default authorize;
