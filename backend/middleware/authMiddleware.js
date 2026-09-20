const jwt = require('jsonwebtoken');
const config = require('../config/environment');

function authMiddleware(req, res, next) {
  // Extract token from HttpOnly cookie or Authorization Bearer header
  let token = req.cookies?.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No session cookie or token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    // Minimal non-sensitive claims attached to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please sign in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
}

// Optional auth middleware for endpoints where authentication enhances the response (e.g. Chatbot)
function optionalAuthMiddleware(req, res, next) {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = {
        userId: decoded.userId,
        role: decoded.role
      };
    } catch (err) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
