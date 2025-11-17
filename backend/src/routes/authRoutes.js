import express from 'express';
import AuthController from '../controllers/authController.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/authValidator.js';

const router = express.Router();

// Rotas públicas
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh-token', validate(refreshTokenSchema), AuthController.refreshToken);

// Rotas protegidas (requerem autenticação)
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);

export default router;