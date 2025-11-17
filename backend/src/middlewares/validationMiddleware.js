// Middleware para validar dados com Joi
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retorna todos os erros, não apenas o primeiro
      stripUnknown: true, // Remove campos não definidos no schema
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors,
      });
    }

    // Substituir req.body pelos dados validados
    req.body = value;
    next();
  };
};