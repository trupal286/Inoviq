const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Reads token from Authorization header (Bearer <token>)
 * Attaches decoded user payload to req.user
 */
const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  // Support demo / mock tokens generated for guest/demo member login
  if (token && (token.endsWith('.mockSig') || token.endsWith('.mockSignature') || token.startsWith('mock-token-'))) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (!payload.exp || payload.exp * 1000 > Date.now()) {
          req.user = payload;
          return next();
        }
      } else {
        req.user = { id: '000000000000000000000001', email: 'demo@inoviq.io', firstName: 'Elena', lastName: 'Rostova' };
        return next();
      }
    } catch (e) {
      // fallback to jwt.verify below
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'inoviq_super_secret_key_change_in_production_2024');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

module.exports = authMiddleware;
