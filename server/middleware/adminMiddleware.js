/**
 * Restrict access to users with 'admin' role
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges are required to perform this action.',
    });
  }
  next();
};

module.exports = adminMiddleware;
