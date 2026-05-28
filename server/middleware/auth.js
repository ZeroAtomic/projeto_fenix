import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'fenix_super_secret_key';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
    
    // Injeta o ID do usuário na requisição
    req.userId = user.id;
    next();
  });
}
