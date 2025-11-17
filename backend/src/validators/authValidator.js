import Joi from 'joi';

// Validação de Registro
export const registerSchema = Joi.object({
  nome: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter no mínimo 3 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email é obrigatório',
    'string.email': 'Email inválido',
  }),
  senha: Joi.string().min(6).required().messages({
    'string.empty': 'Senha é obrigatória',
    'string.min': 'Senha deve ter no mínimo 6 caracteres',
  }),
  tipo: Joi.string().valid('comum', 'gerenciador', 'admin').default('comum'),
  telefone: Joi.string().optional().allow(''),
});

// Validação de Login
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email é obrigatório',
    'string.email': 'Email inválido',
  }),
  senha: Joi.string().required().messages({
    'string.empty': 'Senha é obrigatória',
  }),
});

// Validação de Refresh Token
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.empty': 'Refresh token é obrigatório',
  }),
});