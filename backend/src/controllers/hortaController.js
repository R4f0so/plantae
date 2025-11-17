import Horta from '../models/Horta.js';

class HortaController {
  // Criar horta (apenas gerenciador ou admin)
  static async create(req, res) {
    try {
      const { 
        nome, 
        descricao, 
        endereco, 
        latitude, 
        longitude,
        horarioFuncionamento,
        fotoCapa 
      } = req.body;

      const gerenciadorId = req.user.id;

      const horta = await Horta.create({
        nome,
        descricao,
        endereco,
        latitude,
        longitude,
        gerenciadorId,
        horarioFuncionamento,
        fotoCapa,
      });

      res.status(201).json({
        message: 'Horta criada com sucesso',
        horta,
      });
    } catch (error) {
      console.error('Erro ao criar horta:', error);
      res.status(500).json({ error: 'Erro ao criar horta' });
    }
  }

  // Listar todas as hortas
  static async list(req, res) {
    try {
      const { ativo } = req.query;
      
      const hortas = await Horta.findAll({ 
        ativo: ativo === 'false' ? false : true 
      });

      res.json({
        total: hortas.length,
        hortas,
      });
    } catch (error) {
      console.error('Erro ao listar hortas:', error);
      res.status(500).json({ error: 'Erro ao listar hortas' });
    }
  }

  // Buscar horta por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const horta = await Horta.findById(id);

      if (!horta) {
        return res.status(404).json({ error: 'Horta não encontrada' });
      }

      res.json({ horta });
    } catch (error) {
      console.error('Erro ao buscar horta:', error);
      res.status(500).json({ error: 'Erro ao buscar horta' });
    }
  }

  // Buscar hortas próximas
  static async nearby(req, res) {
    try {
      const { latitude, longitude, raio } = req.query;

      const hortas = await Horta.findNearby({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        raio: raio ? parseInt(raio) : 5000,
      });

      res.json({
        total: hortas.length,
        raio: raio || 5000,
        hortas,
      });
    } catch (error) {
      console.error('Erro ao buscar hortas próximas:', error);
      res.status(500).json({ error: 'Erro ao buscar hortas próximas' });
    }
  }

  // Atualizar horta
  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userTipo = req.user.tipo;

      // Verificar se horta existe
      const horta = await Horta.findById(id);

      if (!horta) {
        return res.status(404).json({ error: 'Horta não encontrada' });
      }

      // Verificar permissão (apenas o gerenciador da horta ou admin)
      if (userTipo !== 'admin' && horta.gerenciador_id !== userId) {
        return res.status(403).json({ 
          error: 'Você não tem permissão para editar esta horta' 
        });
      }

      const hortaAtualizada = await Horta.update(id, req.body);

      res.json({
        message: 'Horta atualizada com sucesso',
        horta: hortaAtualizada,
      });
    } catch (error) {
      console.error('Erro ao atualizar horta:', error);
      res.status(500).json({ error: 'Erro ao atualizar horta' });
    }
  }

  // Deletar horta (soft delete)
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userTipo = req.user.tipo;

      // Verificar se horta existe
      const horta = await Horta.findById(id);

      if (!horta) {
        return res.status(404).json({ error: 'Horta não encontrada' });
      }

      // Verificar permissão
      if (userTipo !== 'admin' && horta.gerenciador_id !== userId) {
        return res.status(403).json({ 
          error: 'Você não tem permissão para deletar esta horta' 
        });
      }

      await Horta.delete(id);

      res.json({ message: 'Horta desativada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar horta:', error);
      res.status(500).json({ error: 'Erro ao deletar horta' });
    }
  }

  // Deletar permanentemente (apenas admin)
  static async hardDelete(req, res) {
    try {
      const { id } = req.params;

      const horta = await Horta.findById(id);

      if (!horta) {
        return res.status(404).json({ error: 'Horta não encontrada' });
      }

      await Horta.hardDelete(id);

      res.json({ message: 'Horta deletada permanentemente' });
    } catch (error) {
      console.error('Erro ao deletar horta permanentemente:', error);
      res.status(500).json({ error: 'Erro ao deletar horta' });
    }
  }
}

export default HortaController;