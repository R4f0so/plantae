import Joi from 'joi';

// Validação para criar horta
export const createHortaSchema = Joi.object({
  nome: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter no mínimo 3 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
  }),
  descricao: Joi.string().optional().allow(''),
  endereco: Joi.string().max(500).required().messages({
    'string.empty': 'Endereço é obrigatório',
    'string.max': 'Endereço deve ter no máximo 500 caracteres',
  }),
  latitude: Joi.number().min(-90).max(90).required().messages({
    'number.base': 'Latitude deve ser um número',
    'number.min': 'Latitude deve ser maior que -90',
    'number.max': 'Latitude deve ser menor que 90',
    'any.required': 'Latitude é obrigatória',
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    'number.base': 'Longitude deve ser um número',
    'number.min': 'Longitude deve ser maior que -180',
    'number.max': 'Longitude deve ser menor que 180',
    'any.required': 'Longitude é obrigatória',
  }),
  horarioFuncionamento: Joi.string().optional().allow(''),
  fotoCapa: Joi.string().optional().allow(''),
});

// Validação para atualizar horta
export const updateHortaSchema = Joi.object({
  nome: Joi.string().min(3).max(255).optional(),
  descricao: Joi.string().optional().allow(''),
  endereco: Joi.string().max(500).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  horarioFuncionamento: Joi.string().optional().allow(''),
  fotoCapa: Joi.string().optional().allow(''),
}).min(1); // Pelo menos um campo deve ser fornecido

// Validação para buscar hortas próximas
export const nearbyHortasSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  raio: Joi.number().min(100).max(50000).default(5000), // Raio em metros (100m a 50km)
});