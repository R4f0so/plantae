import express from 'express';
import HortaController from '../controllers/hortaController.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { 
  createHortaSchema, 
  updateHortaSchema 
} from '../validators/hortaValidator.js';

const router = express.Router();

// ==================== ROTAS PÚBLICAS ====================

/**
 * @swagger
 * /api/hortas:
 *   get:
 *     tags: [Hortas]
 *     summary: Listar todas as hortas
 *     description: Retorna lista de hortas cadastradas. Por padrão retorna apenas hortas ativas.
 *     parameters:
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar por hortas ativas (true) ou inativas (false)
 *         example: true
 *     responses:
 *       200:
 *         description: Lista de hortas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Número total de hortas encontradas
 *                   example: 3
 *                 hortas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Horta'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', HortaController.list);

/**
 * @swagger
 * /api/hortas/nearby:
 *   get:
 *     tags: [Hortas]
 *     summary: Buscar hortas próximas
 *     description: Retorna hortas em um raio específico de uma localização. Útil para encontrar hortas perto do usuário usando geolocalização.
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude do ponto de referência
 *         example: -23.5329
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude do ponto de referência
 *         example: -46.7918
 *       - in: query
 *         name: raio
 *         schema:
 *           type: integer
 *           minimum: 100
 *           maximum: 50000
 *           default: 5000
 *         description: Raio de busca em metros (100m a 50km)
 *         example: 5000
 *     responses:
 *       200:
 *         description: Hortas próximas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Número de hortas encontradas
 *                   example: 2
 *                 raio:
 *                   type: integer
 *                   description: Raio de busca utilizado (metros)
 *                   example: 5000
 *                 hortas:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Horta'
 *                       - type: object
 *                         properties:
 *                           distancia:
 *                             type: number
 *                             description: Distância em metros do ponto de referência
 *                             example: 1234.56
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/nearby', HortaController.nearby);

/**
 * @swagger
 * /api/hortas/{id}:
 *   get:
 *     tags: [Hortas]
 *     summary: Buscar horta por ID
 *     description: Retorna detalhes completos de uma horta específica, incluindo informações do gerenciador.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da horta
 *         example: 1
 *     responses:
 *       200:
 *         description: Detalhes da horta retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 horta:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Horta'
 *                     - type: object
 *                       properties:
 *                         gerenciador_email:
 *                           type: string
 *                           example: joao@plantae.com
 *                         gerenciador_telefone:
 *                           type: string
 *                           example: (11) 98765-1234
 *       404:
 *         description: Horta não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Horta não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
/**
 * @swagger
 * /api/hortas/minhas:
 *   get:
 *     tags: [Hortas]
 *     summary: Listar minhas hortas (gerenciador)
 *     description: Retorna todas as hortas que o usuário logado gerencia
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de hortas do gerenciador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 hortas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Horta'
 *       401:
 *         description: Não autorizado
 */
router.get('/minhas', authenticate, authorize('gerenciador', 'admin'), HortaController.minhasHortas);

router.get('/:id', HortaController.getById);

// ==================== ROTAS PROTEGIDAS ====================

/**
 * @swagger
 * /api/hortas:
 *   post:
 *     tags: [Hortas]
 *     summary: Criar nova horta
 *     description: Cria uma nova horta comunitária. Apenas usuários do tipo gerenciador ou admin podem criar hortas.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - endereco
 *               - latitude
 *               - longitude
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 description: Nome da horta
 *                 example: Horta Comunitária Central
 *               descricao:
 *                 type: string
 *                 description: Descrição detalhada da horta
 *                 example: Horta comunitária no centro de Osasco, com diversas opções de verduras e legumes frescos.
 *               endereco:
 *                 type: string
 *                 maxLength: 500
 *                 description: Endereço completo
 *                 example: Rua Antonio Agu, 255 - Centro, Osasco - SP
 *               latitude:
 *                 type: number
 *                 format: double
 *                 minimum: -90
 *                 maximum: 90
 *                 description: Latitude da localização
 *                 example: -23.5329
 *               longitude:
 *                 type: number
 *                 format: double
 *                 minimum: -180
 *                 maximum: 180
 *                 description: Longitude da localização
 *                 example: -46.7918
 *               horarioFuncionamento:
 *                 type: string
 *                 description: Horários de funcionamento
 *                 example: Segunda a Sábado 7h às 18h
 *               fotoCapa:
 *                 type: string
 *                 description: URL da foto de capa
 *                 example: https://exemplo.com/foto.jpg
 *     responses:
 *       201:
 *         description: Horta criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Horta criada com sucesso
 *                 horta:
 *                   $ref: '#/components/schemas/Horta'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas gerenciador ou admin)
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  '/',
  authenticate,
  authorize('gerenciador', 'admin'),
  validate(createHortaSchema),
  HortaController.create
);

/**
 * @swagger
 * /api/hortas/{id}:
 *   put:
 *     tags: [Hortas]
 *     summary: Atualizar horta
 *     description: Atualiza dados de uma horta existente. Apenas o gerenciador da horta ou admin podem atualizar.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da horta
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *               descricao:
 *                 type: string
 *               endereco:
 *                 type: string
 *                 maxLength: 500
 *               latitude:
 *                 type: number
 *                 format: double
 *                 minimum: -90
 *                 maximum: 90
 *               longitude:
 *                 type: number
 *                 format: double
 *                 minimum: -180
 *                 maximum: 180
 *               horarioFuncionamento:
 *                 type: string
 *               fotoCapa:
 *                 type: string
 *           examples:
 *             atualizarHorario:
 *               summary: Atualizar apenas horário
 *               value:
 *                 horarioFuncionamento: Segunda a Domingo 6h às 20h
 *             atualizarCompleto:
 *               summary: Atualizar múltiplos campos
 *               value:
 *                 nome: Horta Central Renovada
 *                 descricao: Nova descrição
 *                 horarioFuncionamento: Todos os dias 7h às 19h
 *     responses:
 *       200:
 *         description: Horta atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Horta atualizada com sucesso
 *                 horta:
 *                   $ref: '#/components/schemas/Horta'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão para editar esta horta
 *       404:
 *         description: Horta não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  '/:id',
  authenticate,
  authorize('gerenciador', 'admin'),
  validate(updateHortaSchema),
  HortaController.update
);

/**
 * @swagger
 * /api/hortas/{id}:
 *   delete:
 *     tags: [Hortas]
 *     summary: Desativar horta
 *     description: Desativa uma horta (soft delete). A horta não será excluída do banco, apenas marcada como inativa.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da horta
 *         example: 1
 *     responses:
 *       200:
 *         description: Horta desativada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Horta desativada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão para deletar esta horta
 *       404:
 *         description: Horta não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete(
  '/:id',
  authenticate,
  authorize('gerenciador', 'admin'),
  HortaController.delete
);

/**
 * @swagger
 * /api/hortas/{id}/permanent:
 *   delete:
 *     tags: [Hortas]
 *     summary: Deletar horta permanentemente
 *     description: Deleta uma horta permanentemente do banco de dados. ATENÇÃO - Esta ação é irreversível! Apenas admin pode executar.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da horta
 *         example: 1
 *     responses:
 *       200:
 *         description: Horta deletada permanentemente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Horta deletada permanentemente
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas admin)
 *       404:
 *         description: Horta não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete(
  '/:id/permanent',
  authenticate,
  authorize('admin'),
  HortaController.hardDelete
);

export default router;