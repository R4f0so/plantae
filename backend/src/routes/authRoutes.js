import express from 'express';
import AuthController from '../controllers/authController.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/authValidator.js';

const router = express.Router();

// ==================== ROTAS PÚBLICAS ====================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar novo usuário
 *     description: Cria uma nova conta de usuário no sistema. Retorna tokens de autenticação imediatamente após o registro.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 description: Nome completo do usuário
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email válido (único no sistema)
 *                 example: joao@exemplo.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Senha com no mínimo 6 caracteres
 *                 example: senha123
 *               tipo:
 *                 type: string
 *                 enum: [comum, gerenciador, admin]
 *                 default: comum
 *                 description: Tipo de usuário (comum para usuários regulares)
 *                 example: comum
 *               telefone:
 *                 type: string
 *                 description: Telefone de contato (opcional)
 *                 example: (11) 98765-4321
 *           examples:
 *             usuarioComum:
 *               summary: Usuário comum
 *               value:
 *                 nome: Maria Santos
 *                 email: maria@exemplo.com
 *                 senha: senha123
 *                 tipo: comum
 *                 telefone: (11) 98765-1234
 *             gerenciador:
 *               summary: Gerenciador de horta
 *               value:
 *                 nome: Pedro Costa
 *                 email: pedro@exemplo.com
 *                 senha: senha123
 *                 tipo: gerenciador
 *                 telefone: (11) 98765-5678
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário criado com sucesso
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 *                 accessToken:
 *                   type: string
 *                   description: Token JWT para autenticação (válido por 15 minutos)
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   description: Token para renovar o access token (válido por 7 dias)
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Dados inválidos ou email já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               emailDuplicado:
 *                 value:
 *                   error: Email já cadastrado
 *               dadosInvalidos:
 *                 value:
 *                   error: Dados inválidos
 *                   details:
 *                     - field: email
 *                       message: Email inválido
 *                     - field: senha
 *                       message: Senha deve ter no mínimo 6 caracteres
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/register', validate(registerSchema), AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Fazer login
 *     description: Autentica um usuário e retorna tokens de acesso. Use o accessToken para requisições autenticadas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email cadastrado
 *                 example: joao@exemplo.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 description: Senha da conta
 *                 example: senha123
 *           examples:
 *             usuarioComum:
 *               summary: Login usuário comum
 *               value:
 *                 email: carlos@plantae.com
 *                 senha: senha123
 *             gerenciador:
 *               summary: Login gerenciador
 *               value:
 *                 email: joao@plantae.com
 *                 senha: senha123
 *             admin:
 *               summary: Login admin
 *               value:
 *                 email: admin@plantae.com
 *                 senha: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login realizado com sucesso
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 *                 accessToken:
 *                   type: string
 *                   description: Token JWT para autenticação (válido por 15 minutos)
 *                 refreshToken:
 *                   type: string
 *                   description: Token para renovar o access token (válido por 7 dias)
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Credenciais inválidas
 *       403:
 *         description: Usuário desativado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Usuário desativado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/login', validate(loginSchema), AuthController.login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Renovar access token
 *     description: Gera um novo access token usando o refresh token. Use quando o access token expirar (após 15 minutos).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token recebido no login
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Novo access token (válido por 15 minutos)
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Refresh token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Refresh token inválido ou expirado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/refresh-token', validate(refreshTokenSchema), AuthController.refreshToken);

// ==================== ROTAS PROTEGIDAS ====================

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Fazer logout
 *     description: Invalida o refresh token do usuário, efetivamente fazendo logout. O access token continuará válido até expirar.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout realizado com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token inválido ou expirado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Dados do usuário logado
 *     description: Retorna os dados completos do usuário autenticado. Use para verificar o token e obter informações do perfil.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 *             example:
 *               user:
 *                 id: 1
 *                 nome: João Silva
 *                 email: joao@exemplo.com
 *                 tipo: gerenciador
 *                 telefone: (11) 98765-4321
 *                 foto_perfil: null
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               examples:
 *                 tokenNaoFornecido:
 *                   value:
 *                     error: Token não fornecido
 *                 tokenInvalido:
 *                   value:
 *                     error: Token inválido ou expirado
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/me', authenticate, AuthController.me);

export default router;