import express from 'express';
import upload, { handleMulterError } from '../config/upload.js';
import UploadController from '../controllers/uploadController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/upload/user/photo:
 *   post:
 *     tags: [Upload]
 *     summary: Upload de foto de perfil
 *     description: Faz upload da foto de perfil do usuário autenticado. Substitui a foto anterior.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem (JPEG, PNG, GIF, WebP - máx 5MB)
 *     responses:
 *       200:
 *         description: Foto atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Foto de perfil atualizada com sucesso
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nome:
 *                       type: string
 *                     email:
 *                       type: string
 *                     foto_perfil:
 *                       type: string
 *                       example: http://localhost:3000/uploads/users/1234567890-abc123.jpg
 *       400:
 *         description: Nenhum arquivo enviado ou formato inválido
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro no servidor
 */
router.post(
  '/user/photo',
  authenticate,
  upload.single('photo'),
  handleMulterError,
  UploadController.uploadUserPhoto
);

/**
 * @swagger
 * /api/upload/horta/{id}/photo:
 *   post:
 *     tags: [Upload]
 *     summary: Upload de foto da horta
 *     description: Faz upload da foto de capa de uma horta. Apenas o gerenciador da horta ou admin podem fazer upload.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da horta
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem (JPEG, PNG, GIF, WebP - máx 5MB)
 *     responses:
 *       200:
 *         description: Foto atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 horta:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nome:
 *                       type: string
 *                     foto_capa:
 *                       type: string
 *       400:
 *         description: Nenhum arquivo enviado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Horta não encontrada
 */
router.post(
  '/horta/:id/photo',
  authenticate,
  authorize('gerenciador', 'admin'),
  upload.single('photo'),
  handleMulterError,
  UploadController.uploadHortaPhoto
);

/**
 * @swagger
 * /api/upload/produto/{id}/photo:
 *   post:
 *     tags: [Upload]
 *     summary: Upload de foto do produto
 *     description: Faz upload da foto de um produto. Apenas o gerenciador da horta ou admin podem fazer upload.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem (JPEG, PNG, GIF, WebP - máx 5MB)
 *     responses:
 *       200:
 *         description: Foto atualizada com sucesso
 *       400:
 *         description: Nenhum arquivo enviado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Produto não encontrado
 */
router.post(
  '/produto/:id/photo',
  authenticate,
  authorize('gerenciador', 'admin'),
  upload.single('photo'),
  handleMulterError,
  UploadController.uploadProdutoPhoto
);

/**
 * @swagger
 * /api/upload/{type}/{id}/photo:
 *   delete:
 *     tags: [Upload]
 *     summary: Deletar foto
 *     description: Remove a foto de um usuário, horta ou produto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, horta, produto]
 *         description: Tipo de entidade
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da entidade
 *     responses:
 *       200:
 *         description: Foto deletada com sucesso
 *       400:
 *         description: Nenhuma foto para deletar
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Registro não encontrado
 */
router.delete(
  '/:type/:id/photo',
  authenticate,
  UploadController.deletePhoto
);

export default router;