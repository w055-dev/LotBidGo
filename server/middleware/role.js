function role(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Требуется авторизация' });
    
    if (req.user.role === 'admin') return next();
    if (allowedRoles.includes('buyer') && req.user.is_buyer) return next();
    if (allowedRoles.includes('seller') && req.user.is_seller) return next();

    return res.status(403).json({ message: 'Доступ запрещён' });
  };
}

module.exports = role;