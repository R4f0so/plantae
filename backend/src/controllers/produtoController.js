import Produto from '../models/Produto.js';
import Horta from '../models/Horta.js';

class ProdutoController {
  // Criar produto
  static async create(req, res) {
    try {
      const { hortaId, nome, descricao, categoria, preco, unidade, estoque, foto } = req.body;
      const userId = req.user.id;
      const userTipo = req.user.tipo;

      // Verificar se horta existe
      const horta = await Horta.findById(hortaId);
      if (!horta) {
        return res.status(404).json({ error: 'Horta não encontrada' });
      }

      // Verificar permissão (apenas gerenciador da horta ou admin)
      if (userTipo !== 'admin' && horta.gerenciador_id !== userId) {
        return res.status(403).json({ 
          error: 'Você não tem permissão para adicionar produtos nesta horta' 
        });
      }

      const produto = await Produto.create({
        hortaId,
        nome,
        descricao,
        categoria,
        preco,
        unidade,
        estoque,
        foto,
      });

      res.status(201).json({
        message: 'Produto criado com sucesso',
        produto,
      });
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }

  // Listar produtos de uma horta
  static async listByHorta(req, res) {
    try {
      const { hortaId } = req.params;
      const { disponivel } = req.query;

      const produtos = await Produto.findByHorta(hortaId, {
        disponivel: disponivel === 'false' ? false : true,
      });

      res.json({
        total: produtos.length,
        produtos,
      });
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({ error: 'Erro ao listar produtos' });
    }
  }

  // Listar todos os produtos
  static async list(req, res) {
    try {
      const { categoria, disponivel } = req.query;

      const produtos = await Produto.findAll({
        categoria,
        disponivel: disponivel === 'false' ? false : true,
      });

      res.json({
        total: produtos.length,
        produtos,
      });
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({ error: 'Erro ao listar produtos' });
    }
  }

  // Buscar produto por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const produto = await Produto.findById(id);

      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json({ produto });
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  // Buscar produtos por categoria
  static async getByCategoria(req, res) {
    try {
      const { categoria } = req.params;

      const produtos = await Produto.findByCategoria(categoria);

      res.json({
        total: produtos.length,
        categoria,
        produtos,
      });
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
  }

  // Atualizar produto
  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userTipo = req.user.tipo;

      // Verificar se produto existe
      const produto = await Produto.findById(id);
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      // Verificar permissão
      if (userTipo !== 'admin' && produto.gerenciador_id !== userId) {
        return res.status(403).json({ 
          error: 'Você não tem permissão para editar este produto' 
        });
      }

      const produtoAtualizado = await Produto.update(id, req.body);

      res.json({
        message: 'Produto atualizado com sucesso',
        produto: produtoAtualizado,
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  }

  // Atualizar estoque
  static async updateEstoque(req, res) {
    try {
      const { id } = req.params;
      const { quantidade, operacao } = req.body;
      const userId = req.user.id;
      const userTipo = req.user.tipo;

      // Verificar se produto existe
      const produto = await Produto.findById(id);
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      // Verificar permissão
      if (userTipo !== 'admin' && produto.gerenciador_id !== userId) {
        return res.status(403).json({ 
          error: 'Você não tem permissão para alterar o estoque deste produto' 
        });
      }

      const produtoAtualizado = await Produto.updateEstoque(id, quantidade, operacao);

      res.json({
        message: 'Estoque atualizado com sucesso',
        produto: produtoAtualizado,
      });
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      res.status(500).json({ error: 'Erro ao atualizar estoque' });
    }
  }

  // Deletar produto
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userTipo = req.user.tipo;

      // Verificar se produto existe
      const produto = await Produto.findById(id);
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      // Verificar permissão
      if (userTipo !== 'admin' && produto.gerenciador_id !== userId) {
        return res.status(403).json({ 
          error: 'Você não tem permissão para deletar este produto' 
        });
      }

      await Produto.delete(id);

      res.json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  }
}

export default ProdutoController;