import express from 'express';
import ProdutoController from '../controllers/produtoController.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { 
  createProdutoSchema, 
  updateProdutoSchema,
  updateEstoqueSchema 
} from '../validators/produtoValidator.js';

const router = express.Router();

// Rotas públicas
router.get('/', ProdutoController.list); // Listar todos os produtos
router.get('/categoria/:categoria', ProdutoController.getByCategoria); // Buscar por categoria
router.get('/horta/:hortaId', ProdutoController.listByHorta); // Listar produtos de uma horta
router.get('/:id', ProdutoController.getById); // Buscar produto por ID

// Rotas protegidas (requerem autenticação)
router.post(
  '/',
  authenticate,
  authorize('gerenciador', 'admin'),
  validate(createProdutoSchema),
  ProdutoController.create
); // Criar produto

router.put(
  '/:id',
  authenticate,
  authorize('gerenciador', 'admin'),
  validate(updateProdutoSchema),
  ProdutoController.update
); // Atualizar produto

router.patch(
  '/:id/estoque',
  authenticate,
  authorize('gerenciador', 'admin'),
  validate(updateEstoqueSchema),
  ProdutoController.updateEstoque
); // Atualizar estoque

router.delete(
  '/:id',
  authenticate,
  authorize('gerenciador', 'admin'),
  ProdutoController.delete
); // Deletar produto

export default router;