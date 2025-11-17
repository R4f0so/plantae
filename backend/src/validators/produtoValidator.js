import Joi from 'joi';

// Validação para criar produto
export const createProdutoSchema = Joi.object({
  hortaId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID da horta deve ser um número',
    'any.required': 'ID da horta é obrigatório',
  }),
  nome: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter no mínimo 2 caracteres',
  }),
  descricao: Joi.string().optional().allow(''),
  categoria: Joi.string()
    .valid('fruta', 'verdura', 'legume', 'erva', 'outro')
    .required()
    .messages({
      'any.only': 'Categoria deve ser: fruta, verdura, legume, erva ou outro',
      'any.required': 'Categoria é obrigatória',
    }),
  preco: Joi.number().min(0).precision(2).optional().messages({
    'number.base': 'Preço deve ser um número',
    'number.min': 'Preço não pode ser negativo',
  }),
  unidade: Joi.string().max(20).optional().default('kg'),
  estoque: Joi.number().min(0).precision(2).optional().default(0),
  foto: Joi.string().uri().optional().allow(''),
});

// Validação para atualizar produto
export const updateProdutoSchema = Joi.object({
  nome: Joi.string().min(2).max(255).optional(),
  descricao: Joi.string().optional().allow(''),
  categoria: Joi.string()
    .valid('fruta', 'verdura', 'legume', 'erva', 'outro')
    .optional(),
  preco: Joi.number().min(0).precision(2).optional(),
  unidade: Joi.string().max(20).optional(),
  estoque: Joi.number().min(0).precision(2).optional(),
  foto: Joi.string().uri().optional().allow(''),
  disponivel: Joi.boolean().optional(),
}).min(1);

// Validação para atualizar estoque
export const updateEstoqueSchema = Joi.object({
  quantidade: Joi.number().min(0).precision(2).required().messages({
    'number.base': 'Quantidade deve ser um número',
    'number.min': 'Quantidade não pode ser negativa',
    'any.required': 'Quantidade é obrigatória',
  }),
  operacao: Joi.string().valid('add', 'subtract', 'set').default('set').messages({
    'any.only': 'Operação deve ser: add, subtract ou set',
  }),
});