import { verifyAccessToken } from '../utils/jwt.js';

// Middleware para verificar se usuário está autenticado
export const authenticate = (req, res, next) => {
  try {
    // Pegar token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Formato: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Formato de token inválido' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    // Verificar token
    const decoded = verifyAccessToken(token);
    
    // Adicionar dados do usuário na requisição
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// Middleware para verificar se usuário tem permissão (tipo)
export const authorize = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!allowedTypes.includes(req.user.tipo)) {
      return res.status(403).json({ 
        error: 'Você não tem permissão para acessar este recurso' 
      });
    }

    next();
  };
};

// Alias para compatibilidade
export const authMiddleware = authenticate;

// Middleware específico para admin
export const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  if (req.user.tipo !== 'admin') {
    return res.status(403).json({ 
      error: 'Acesso restrito a administradores' 
    });
  }

  next();
};

// Middleware específico para gerenciadores e admins
export const gerenciadorMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  if (req.user.tipo !== 'gerenciador' && req.user.tipo !== 'admin') {
    return res.status(403).json({ 
      error: 'Acesso restrito a gerenciadores' 
    });
  }

  next();
};