import { Router } from 'express';
import HorarioController from '../controllers/horarioController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /hortas/{hortaId}/horarios:
 *   get:
 *     summary: Listar horários de funcionamento de uma horta
 *     tags: [Horários]
 *     parameters:
 *       - in: path
 *         name: hortaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de horários
 */
router.get('/:hortaId/horarios', HorarioController.list);

/**
 * @swagger
 * /hortas/{hortaId}/horarios/status:
 *   get:
 *     summary: Verificar se horta está aberta agora
 *     tags: [Horários]
 *     parameters:
 *       - in: path
 *         name: hortaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status de abertura
 */
router.get('/:hortaId/horarios/status', HorarioController.checkAberta);

/**
 * @swagger
 * /hortas/{hortaId}/horarios/{diaSemana}:
 *   put:
 *     summary: Atualizar horário de um dia específico
 *     tags: [Horários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hortaId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: diaSemana
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               aberto:
 *                 type: boolean
 *               hora_abertura:
 *                 type: string
 *                 example: "08:00"
 *               hora_fechamento:
 *                 type: string
 *                 example: "17:00"
 *               observacao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Horário atualizado
 */
router.put(
  '/:hortaId/horarios/:diaSemana',
  authenticate,
  authorize('gerenciador', 'admin'),
  HorarioController.updateDia
);

/**
 * @swagger
 * /hortas/{hortaId}/horarios:
 *   put:
 *     summary: Atualizar todos os horários de uma horta
 *     tags: [Horários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hortaId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               horarios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dia_semana:
 *                       type: integer
 *                     aberto:
 *                       type: boolean
 *                     hora_abertura:
 *                       type: string
 *                     hora_fechamento:
 *                       type: string
 *     responses:
 *       200:
 *         description: Horários atualizados
 */
router.put(
  '/:hortaId/horarios',
  authenticate,
  authorize('gerenciador', 'admin'),
  HorarioController.updateAll
);

/**
 * @swagger
 * /hortas/{hortaId}/status:
 *   put:
 *     summary: Atualizar status temporário da horta
 *     tags: [Horários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hortaId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status_temporario:
 *                 type: string
 *                 enum: [normal, fechado_temporariamente, ferias, manutencao]
 *               mensagem_status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status atualizado
 */
router.put(
  '/:hortaId/status',
  authenticate,
  authorize('gerenciador', 'admin'),
  HorarioController.updateStatus
);

export default router;
