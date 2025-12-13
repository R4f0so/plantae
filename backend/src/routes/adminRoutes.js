import express from 'express';
import AdminController from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas as rotas requerem autenticação E ser admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// Usuários
router.get('/usuarios', AdminController.listUsuarios);
router.get('/usuarios/:id', AdminController.getUsuario);
router.put('/usuarios/:id/tipo', AdminController.updateTipoUsuario);
router.put('/usuarios/:id/ativo', AdminController.toggleAtivoUsuario);
router.delete('/usuarios/:id', AdminController.deleteUsuario);
router.get('/gerenciadores', AdminController.listGerenciadores);

// Hortas
router.get('/hortas', AdminController.listHortas);
router.post('/hortas', AdminController.createHorta);
router.get('/hortas/:id', AdminController.getHorta);
router.put('/hortas/:id', AdminController.updateHorta);
router.delete('/hortas/:id', AdminController.deleteHorta);
router.put('/hortas/:hortaId/atribuir', AdminController.atribuirHorta);

export default router;
