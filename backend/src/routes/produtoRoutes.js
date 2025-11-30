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

// ==================== ROTAS PÚBLICAS ====================

/**
 * @swagger
 * /api/produtos:
 *   get:
 *     tags: [Produtos]
 *     summary: Listar todos os produtos
 *     description: Retorna lista de produtos disponíveis em todas as hortas
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [fruta, verdura, legume, erva, outro]
 *         description: Filtrar por categoria
 *         example: verdura
 *       - in: query
 *         name: disponivel
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar por produtos disponíveis
 *         example: true
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Número total de produtos encontrados
 *                   example: 12
 *                 produtos:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Produto'
 *                       - type: object
 *                         properties:
 *                           horta_nome:
 *                             type: string
 *                             example: Horta Comunitária Central
 *                           horta_endereco:
 *                             type: string
 *                             example: Rua Antonio Agu, 255 - Centro, Osasco - SP
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', ProdutoController.list);

/**
 * @swagger
 * /api/produtos/categoria/{categoria}:
 *   get:
 *     tags: [Produtos]
 *     summary: Buscar produtos por categoria
 *     description: Retorna todos os produtos de uma categoria específica
 *     parameters:
 *       - in: path
 *         name: categoria
 *         required: true
 *         schema:
 *           type: string
 *           enum: [fruta, verdura, legume, erva, outro]
 *         description: Categoria dos produtos
 *         example: verdura
 *     responses:
 *       200:
 *         description: Produtos da categoria retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 categoria:
 *                   type: string
 *                   example: verdura
 *                 produtos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Produto'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/categoria/:categoria', ProdutoController.getByCategoria);

/**
 * @swagger
 * /api/produtos/horta/{hortaId}:
 *   get:
 *     tags: [Produtos]
 *     summary: Listar produtos de uma horta
 *     description: Retorna todos os produtos disponíveis em uma horta específica
 *     parameters:
 *       - in: path
 *         name: hortaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da horta
 *         example: 1
 *       - in: query
 *         name: disponivel
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar por produtos disponíveis
 *     responses:
 *       200:
 *         description: Produtos da horta retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 8
 *                 produtos:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Produto'
 *                       - type: object
 *                         properties:
 *                           horta_nome:
 *                             type: string
 *                             example: Horta Comunitária Central
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/horta/:hortaId', ProdutoController.listByHorta);

/**
 * @swagger
 * /api/produtos/{id}:
 *   get:
 *     tags: [Produtos]
 *     summary: Buscar produto por ID
 *     description: Retorna detalhes completos de um produto específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *         example: 1
 *     responses:
 *       200:
 *         description: Detalhes do produto retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 produto:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Produto'
 *                     - type: object
 *                       properties:
 *                         horta_nome:
 *                           type: string
 *                         horta_endereco:
 *                           type: string
 *                         gerenciador_id:
 *                           type: integer
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', ProdutoController.getById);

// ==================== ROTAS PROTEGIDAS ====================

/**
 * @swagger
 * /api/produtos:
 *   post:
 *     tags: [Produtos]
 *     summary: Criar novo produto
 *     description: Adiciona um novo produto a uma horta. Apenas o gerenciador da horta ou admin podem criar produtos.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hortaId
 *               - nome
 *               - categoria
 *             properties:
 *               hortaId:
 *                 type: integer
 *                 description: ID da horta onde o produto será cadastrado
 *                 example: 1
 *               nome:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *                 description: Nome do produto
 *                 example: Alface Americana
 *               descricao:
 *                 type: string
 *                 description: Descrição detalhada do produto
 *                 example: Alface fresca e crocante, ideal para saladas
 *               categoria:
 *                 type: string
 *                 enum: [fruta, verdura, legume, erva, outro]
 *                 description: Categoria do produto
 *                 example: verdura
 *               preco:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 description: Preço do produto
 *                 example: 4.50
 *               unidade:
 *                 type: string
 *                 maxLength: 20
 *                 default: kg
 *                 description: Unidade de medida
 *                 example: unidade
 *               estoque:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 default: 0
 *                 description: Quantidade em estoque
 *                 example: 25
 *               foto:
 *                 type: string
 *                 format: uri
 *                 description: URL da foto do produto
 *                 example: https://exemplo.com/alface.jpg
 *           examples:
 *             verdura:
 *               summary: Cadastrar verdura
 *               value:
 *                 hortaId: 1
 *                 nome: Couve Manteiga
 *                 descricao: Couve orgânica fresca
 *                 categoria: verdura
 *                 preco: 3.00
 *                 unidade: maço
 *                 estoque: 40
 *             fruta:
 *               summary: Cadastrar fruta
 *               value:
 *                 hortaId: 1
 *                 nome: Tomate Cereja
 *                 descricao: Tomates pequenos e doces
 *                 categoria: fruta
 *                 preco: 8.00
 *                 unidade: kg
 *                 estoque: 15
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Produto criado com sucesso
 *                 produto:
 *                   $ref: '#/components/schemas/Produto'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão para adicionar produtos nesta horta
 *       404:
 *         description: Horta não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  '/',
  authenticate,
  authorize('gerenciador', 'admin'),
  validate(createProdutoSchema),
  ProdutoController.create
);

/**
 * @swagger
 * /api/produtos/{id}:
 *   put:
 *     tags: [Produtos]
 *     summary: Atualizar produto
 *     description: Atualiza informações de um produto existente. Apenas o gerenciador da horta ou admin podem atualizar.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
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
 *                 minLength: 2
 *                 maxLength: 255
 *               descricao:
 *                 type: string
 *               categoria:
 *                 type: string
 *                 enum: [fruta, verdura, legume, erva, outro]
 *               preco:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *               unidade:
 *                 type: string
 *                 maxLength: 20
 *               estoque:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *               foto:
 *                 type: string
 *                 format: uri
 *               disponivel:
 *                 type: boolean
 *                 description: Marcar produto como disponível ou indisponível
 *           examples:
 *             atualizarPreco:
 *               summary: Atualizar apenas preço
 *               value:
 *                 preco: 5.50
 *             marcarIndisponivel:
 *               summary: Marcar como indisponível
 *               value:
 *                 disponivel: false
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Produto atualizado com sucesso
 *                 produto:
 *                   $ref: '#/components/schemas/Produto'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão para editar este produto
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  '/:id',
  authenticate,
  authorize('gerenciador', 'admin'),
  validate(updateProdutoSchema),
  ProdutoController.update
);

/**
 * @swagger
 * /api/produtos/{id}/estoque:
 *   patch:
 *     tags: [Produtos]
 *     summary: Atualizar estoque do produto
 *     description: Atualiza a quantidade em estoque de um produto. Suporta três operações - adicionar, subtrair ou definir valor absoluto.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantidade
 *             properties:
 *               quantidade:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 description: Quantidade a ser adicionada, subtraída ou definida
 *                 example: 10
 *               operacao:
 *                 type: string
 *                 enum: [add, subtract, set]
 *                 default: set
 *                 description: |
 *                   Tipo de operação:
 *                   - `add`: Adiciona a quantidade ao estoque atual
 *                   - `subtract`: Subtrai a quantidade do estoque atual (mínimo 0)
 *                   - `set`: Define a quantidade como valor absoluto
 *                 example: add
 *           examples:
 *             adicionar:
 *               summary: Adicionar 10 unidades
 *               value:
 *                 quantidade: 10
 *                 operacao: add
 *             subtrair:
 *               summary: Subtrair 5 unidades (venda)
 *               value:
 *                 quantidade: 5
 *                 operacao: subtract
 *             definir:
 *               summary: Definir estoque como 50
 *               value:
 *                 quantidade: 50
 *                 operacao: set
 *     responses:
 *       200:
 *         description: Estoque atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Estoque atualizado com sucesso
 *                 produto:
 *                   $ref: '#/components/schemas/Produto'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão para alterar estoque deste produto
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.patch(
  '/:id/estoque',
  authenticate,
  authorize('gerenciador', 'admin'),
  validate(updateEstoqueSchema),
  ProdutoController.updateEstoque
);

/**
 * @swagger
 * /api/produtos/{id}:
 *   delete:
 *     tags: [Produtos]
 *     summary: Deletar produto
 *     description: Remove permanentemente um produto do sistema. Esta ação é irreversível.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *         example: 1
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Produto deletado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão para deletar este produto
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete(
  '/:id',
  authenticate,
  authorize('gerenciador', 'admin'),
  ProdutoController.delete
);

export default router;