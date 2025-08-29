module.exports = function (req, res, next) {
    if (req.user?.role === 'admin') return next();
    return res.status(403).json({ message: 'Access denied. Admins only.' });
};
