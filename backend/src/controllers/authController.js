import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import redisClient from '../config/redis.js';

class AuthController {
  // Registro
  static async register(req, res) {
    try {
      const { nome, email, senha, tipo, telefone } = req.body;

      // Verificar se email já existe
      const userExists = await User.findByEmail(email);
      if (userExists) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Criar usuário
      const user = await User.create({ nome, email, senha, tipo, telefone });

      // Gerar tokens
      const accessToken = generateAccessToken({ 
        id: user.id, 
        email: user.email, 
        tipo: user.tipo 
      });
      
      const refreshToken = generateRefreshToken({ 
        id: user.id 
      });

      // Salvar refresh token no Redis (expira em 7 dias)
      await redisClient.setEx(
        `refresh_token:${user.id}`,
        7 * 24 * 60 * 60,
        refreshToken
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  // Login
  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Buscar usuário
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Verificar se está ativo
      if (!user.ativo) {
        return res.status(403).json({ error: 'Usuário desativado' });
      }

      // Comparar senha
      const senhaValida = await User.comparePassword(senha, user.senha_hash);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Atualizar último login
      await User.updateLastLogin(user.id);

      // Gerar tokens
      const accessToken = generateAccessToken({ 
        id: user.id, 
        email: user.email, 
        tipo: user.tipo 
      });
      
      const refreshToken = generateRefreshToken({ 
        id: user.id 
      });

      // Salvar refresh token no Redis
      await redisClient.setEx(
        `refresh_token:${user.id}`,
        7 * 24 * 60 * 60,
        refreshToken
      );

      res.json({
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  // Refresh Token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      // Verificar refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Verificar se existe no Redis
      const storedToken = await redisClient.get(`refresh_token:${decoded.id}`);
      if (!storedToken || storedToken !== refreshToken) {
        return res.status(401).json({ error: 'Refresh token inválido' });
      }

      // Buscar usuário
      const user = await User.findById(decoded.id);
      if (!user || !user.ativo) {
        return res.status(401).json({ error: 'Usuário não encontrado ou desativado' });
      }

      // Gerar novo access token
      const newAccessToken = generateAccessToken({ 
        id: user.id, 
        email: user.email, 
        tipo: user.tipo 
      });

      res.json({
        accessToken: newAccessToken,
      });
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      res.status(401).json({ error: 'Refresh token inválido ou expirado' });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      const userId = req.user.id; // Vem do middleware de autenticação

      // Remover refresh token do Redis
      await redisClient.del(`refresh_token:${userId}`);

      res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({ error: 'Erro ao fazer logout' });
    }
  }

  // Verificar token (rota protegida de exemplo)
  static async me(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          telefone: user.telefone,
          foto_perfil: user.foto_perfil,
        },
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }
}

export default AuthController;