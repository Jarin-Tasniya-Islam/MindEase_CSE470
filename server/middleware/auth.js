const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  // Debug logging (dev only)
  try {
    if (!token) {
      console.warn('[auth] No token provided for', req.method, req.originalUrl);
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role }; // ✅ role available on req.user
    // minimal log showing authenticated user
    console.log(`[auth] user ${req.user.id} (${req.user.role}) authenticated for ${req.method} ${req.originalUrl}`);
    next();
  } catch (e) {
    console.warn('[auth] token invalid/expired for', req.method, req.originalUrl, '-', e.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
