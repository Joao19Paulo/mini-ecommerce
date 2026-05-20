const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'camisas_secret_2024';

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  try {
    const token = auth.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.perfil !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado: apenas admins' });
  }
  next();
};

module.exports = { authenticate, requireAdmin, JWT_SECRET };
