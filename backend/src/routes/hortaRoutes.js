import express from 'express';
import HortaController from '../controllers/hortaController.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { 
  createHortaSchema, 
  updateHortaSchema,
  nearbyHortasSchema 
} from '../validators/hortaValidator.js';

const router = express.Router();

// Rotas públicas
router.get('/', HortaController.list); // Listar todas as hortas
router.get('/nearby', HortaController.nearby); // Buscar hortas próximas
router.get('/:id', HortaController.getById); // Buscar horta por ID

// Rotas protegidas (requerem autenticação)
router.post(
  '/',
  authenticate,
  authorize('gerenciador', 'admin'),
  validate(createHortaSchema),
  HortaController.create
); // Criar horta (apenas gerenciador ou admin)

router.put(
  '/:id',
  authenticate,
  authorize('gerenciador', 'admin'),
  validate(updateHortaSchema),
  HortaController.update
); // Atualizar horta (apenas gerenciador da horta ou admin)

router.delete(
  '/:id',
  authenticate,
  authorize('gerenciador', 'admin'),
  HortaController.delete
); // Deletar horta - soft delete (gerenciador ou admin)

router.delete(
  '/:id/permanent',
  authenticate,
  authorize('admin'),
  HortaController.hardDelete
); // Deletar permanentemente (apenas admin)

export default router;