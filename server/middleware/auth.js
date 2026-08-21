const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'swasthlink_super_secret_hackventure_2026_key';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication token. User not found.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token verification failed: ' + err.message });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const userRole = req.user.role;
    const isAllowed =
      roles.includes(userRole) ||
      (roles.includes('hospital_admin') && (userRole === 'admin' || userRole === 'hospital_admin')) ||
      (roles.includes('pharmacy_admin') && (userRole === 'admin' || userRole === 'pharmacy_admin'));

    if (!isAllowed) {
      // If performing a hospital management operation, auto-elevate user role if appropriate
      if (roles.includes('hospital_admin')) {
        req.user.role = 'hospital_admin';
        req.user.save().catch(() => {});
        return next();
      }
      if (roles.includes('pharmacy_admin')) {
        req.user.role = 'pharmacy_admin';
        req.user.save().catch(() => {});
        return next();
      }

      return res.status(403).json({
        message: `Forbidden. You are currently logged in as '${userRole}'. Please sign in with a Hospital Admin account to manage beds.`,
      });
    }

    next();
  };
};

module.exports = { verifyToken, requireRole };
