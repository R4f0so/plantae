import Usuario from '../models/Usuario.js';
import Horta from '../models/Horta.js';
import pool from '../config/database.js';

class AdminController {
  // ==================== USUÁRIOS ====================

  // Listar todos os usuários
  static async listUsuarios(req, res) {
    try {
      const { tipo, busca } = req.query;
      const usuarios = await Usuario.findAll({ tipo, busca });

      res.json({
        total: usuarios.length,
        usuarios,
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  // Buscar usuário por ID com suas hortas
  static async getUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findById(id);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Buscar hortas do usuário se for gerenciador
      let hortas = [];
      if (usuario.tipo === 'gerenciador' || usuario.tipo === 'admin') {
        hortas = await Horta.findByGerenciador(id);
      }

      res.json({
        usuario,
        hortas,
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  // Alterar tipo do usuário (promover/rebaixar)
  static async updateTipoUsuario(req, res) {
    try {
      const { id } = req.params;
      const { tipo } = req.body;
      const adminId = req.user.id;

      // Não permitir alterar o próprio tipo
      if (parseInt(id) === adminId) {
        return res.status(400).json({ 
          error: 'Você não pode alterar seu próprio tipo de usuário' 
        });
      }

      const usuario = await Usuario.findById(id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const usuarioAtualizado = await Usuario.updateTipo(id, tipo);

      res.json({
        message: `Usuário ${usuarioAtualizado.nome} alterado para ${tipo}`,
        usuario: usuarioAtualizado,
      });
    } catch (error) {
      console.error('Erro ao alterar tipo do usuário:', error);
      res.status(500).json({ error: error.message || 'Erro ao alterar tipo do usuário' });
    }
  }

  // Ativar/Desativar usuário
  static async toggleAtivoUsuario(req, res) {
    try {
      const { id } = req.params;
      const { ativo } = req.body;
      const adminId = req.user.id;

      // Não permitir desativar a si mesmo
      if (parseInt(id) === adminId) {
        return res.status(400).json({ 
          error: 'Você não pode desativar sua própria conta' 
        });
      }

      const usuario = await Usuario.findById(id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const usuarioAtualizado = await Usuario.updateAtivo(id, ativo);

      res.json({
        message: `Usuário ${usuarioAtualizado.nome} ${ativo ? 'ativado' : 'desativado'} com sucesso`,
        usuario: usuarioAtualizado,
      });
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      res.status(500).json({ error: 'Erro ao alterar status do usuário' });
    }
  }

  // Deletar usuário permanentemente
  static async deleteUsuario(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      // Não permitir deletar a si mesmo
      if (parseInt(id) === adminId) {
        return res.status(400).json({ 
          error: 'Você não pode deletar sua própria conta' 
        });
      }

      const usuario = await Usuario.findById(id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Não permitir deletar outros admins
      if (usuario.tipo === 'admin') {
        return res.status(400).json({ 
          error: 'Não é permitido deletar outros administradores' 
        });
      }

      const deletado = await Usuario.delete(id);

      res.json({
        message: `Usuário ${deletado.nome} foi deletado permanentemente`,
        usuario: deletado,
      });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  }

  // Listar gerenciadores (para select)
  static async listGerenciadores(req, res) {
    try {
      const gerenciadores = await Usuario.findGerenciadores();
      res.json({ gerenciadores });
    } catch (error) {
      console.error('Erro ao listar gerenciadores:', error);
      res.status(500).json({ error: 'Erro ao listar gerenciadores' });
    }
  }

  // ==================== HORTAS ====================

  // Listar todas as hortas (com filtro por gerenciador)
  static async listHortas(req, res) {
    try {
      const { gerenciadorId, ativo } = req.query;

      let hortas;
      if (gerenciadorId) {
        hortas = await Horta.findByGerenciador(parseInt(gerenciadorId));
      } else {
        // Buscar todas (ativas e inativas) para admin
        const hortasAtivas = await Horta.findAll({ ativo: true });
        const hortasInativas = await Horta.findAll({ ativo: false });
        hortas = [...hortasAtivas, ...hortasInativas];
      }

      res.json({
        total: hortas.length,
        hortas,
      });
    } catch (error) {
      console.error('Erro ao listar hortas:', error);
      res.status(500).json({ error: 'Erro ao listar hortas' });
    }
  }

  // Criar nova horta
  static async createHorta(req, res) {
    try {
      const { nome, descricao, endereco, latitude, longitude, gerenciadorId, horarioFuncionamento } = req.body;

      if (!nome || !endereco) {
        return res.status(400).json({ error: 'Nome e endereço são obrigatórios' });
      }

      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude e longitude são obrigatórios' });
      }

      // Verificar se gerenciador existe (se fornecido)
      if (gerenciadorId) {
        const gerenciador = await Usuario.findById(gerenciadorId);
        if (!gerenciador) {
          return res.status(404).json({ error: 'Gerenciador não encontrado' });
        }
        if (gerenciador.tipo !== 'gerenciador' && gerenciador.tipo !== 'admin') {
          return res.status(400).json({ error: 'O usuário selecionado não é um gerenciador' });
        }
      }

      const horta = await Horta.create({
        nome,
        descricao,
        endereco,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        gerenciadorId: gerenciadorId || null,
        horarioFuncionamento,
        fotoCapa: null,
      });

      res.status(201).json({
        message: `Horta "${horta.nome}" criada com sucesso`,
        horta,
      });
    } catch (error) {
      console.error('Erro ao criar horta:', error);
      res.status(500).json({ error: 'Erro ao criar horta' });
    }
  }

  // Buscar horta por ID
  static async getHorta(req, res) {
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

  // Atualizar horta
  static async updateHorta(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, endereco, latitude, longitude, horarioFuncionamento, ativo } = req.body;

      const horta = await Horta.findById(id);
      if (!horta) {
        return res.status(404).json({ error: 'Horta não encontrada' });
      }

      const dadosAtualizacao = {};
      if (nome !== undefined) dadosAtualizacao.nome = nome;
      if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
      if (endereco !== undefined) dadosAtualizacao.endereco = endereco;
      if (latitude !== undefined && longitude !== undefined) {
        dadosAtualizacao.latitude = parseFloat(latitude);
        dadosAtualizacao.longitude = parseFloat(longitude);
      }
      if (horarioFuncionamento !== undefined) dadosAtualizacao.horarioFuncionamento = horarioFuncionamento;
      if (ativo !== undefined) dadosAtualizacao.ativo = ativo;

      const hortaAtualizada = await Horta.update(id, dadosAtualizacao);

      res.json({
        message: `Horta "${hortaAtualizada.nome}" atualizada com sucesso`,
        horta: hortaAtualizada,
      });
    } catch (error) {
      console.error('Erro ao atualizar horta:', error);
      res.status(500).json({ error: 'Erro ao atualizar horta' });
    }
  }

  // Deletar horta permanentemente
  static async deleteHorta(req, res) {
    try {
      const { id } = req.params;

      const horta = await Horta.findById(id);
      if (!horta) {
        return res.status(404).json({ error: 'Horta não encontrada' });
      }

      // Deletar horários associados primeiro
      await pool.query('DELETE FROM horarios_funcionamento WHERE horta_id = $1', [id]);
      
      // Deletar produtos associados
      await pool.query('DELETE FROM produtos WHERE horta_id = $1', [id]);

      // Deletar a horta
      await Horta.hardDelete(id);

      res.json({
        message: `Horta "${horta.nome}" foi deletada permanentemente`,
      });
    } catch (error) {
      console.error('Erro ao deletar horta:', error);
      res.status(500).json({ error: 'Erro ao deletar horta' });
    }
  }

  // Atribuir horta a um gerenciador
  static async atribuirHorta(req, res) {
    try {
      const { hortaId } = req.params;
      const { gerenciadorId } = req.body;

      // Verificar se horta existe
      const horta = await Horta.findById(hortaId);
      if (!horta) {
        return res.status(404).json({ error: 'Horta não encontrada' });
      }

      // Verificar se gerenciador existe e é do tipo correto
      const gerenciador = await Usuario.findById(gerenciadorId);
      if (!gerenciador) {
        return res.status(404).json({ error: 'Gerenciador não encontrado' });
      }
      if (gerenciador.tipo !== 'gerenciador' && gerenciador.tipo !== 'admin') {
        return res.status(400).json({ 
          error: 'O usuário selecionado não é um gerenciador' 
        });
      }

      // Atualizar gerenciador da horta
      const hortaAtualizada = await Horta.update(hortaId, { 
        gerenciador_id: gerenciadorId 
      });

      res.json({
        message: `Horta "${horta.nome}" atribuída a ${gerenciador.nome}`,
        horta: hortaAtualizada,
      });
    } catch (error) {
      console.error('Erro ao atribuir horta:', error);
      res.status(500).json({ error: 'Erro ao atribuir horta' });
    }
  }

  // ==================== ESTATÍSTICAS ====================

  // Dashboard com estatísticas gerais
  static async getDashboard(req, res) {
    try {
      // Contar usuários por tipo
      const usuariosPorTipo = await Usuario.countByTipo();
      
      // Contar hortas
      const hortasAtivas = await Horta.findAll({ ativo: true });
      const hortasInativas = await Horta.findAll({ ativo: false });

      res.json({
        usuarios: {
          porTipo: usuariosPorTipo,
          total: usuariosPorTipo.reduce((acc, u) => acc + parseInt(u.total), 0),
        },
        hortas: {
          ativas: hortasAtivas.length,
          inativas: hortasInativas.length,
          total: hortasAtivas.length + hortasInativas.length,
        },
      });
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }
}

export default AdminController;
