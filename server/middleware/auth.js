const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Неверный токен' });
  }
}

module.exports = auth;