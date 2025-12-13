import HorarioFuncionamento from '../models/HorarioFuncionamento.js';
import Horta from '../models/Horta.js';

class HorarioController {
  // Listar horários de uma horta
  static async list(req, res) {
    try {
      const { hortaId } = req.params;

      const horarios = await HorarioFuncionamento.findByHortaId(hortaId);
      const abertaAgora = await HorarioFuncionamento.isAbertaAgora(hortaId);
      const proximaAbertura = !abertaAgora 
        ? await HorarioFuncionamento.getProximaAbertura(hortaId)
        : null;

      res.json({
        horta_id: parseInt(hortaId),
        aberta_agora: abertaAgora,
        proxima_abertura: proximaAbertura,
        horarios,
      });
    } catch (error) {
      console.error('Erro ao listar horários:', error);
      res.status(500).json({ error: 'Erro ao listar horários' });
    }
  }

  // Atualizar horário de um dia específico
  static async updateDia(req, res) {
    try {
      const { hortaId, diaSemana } = req.params;
      const userId = req.user.id;
      const userTipo = req.user.tipo;

      // Verificar se horta existe
      const horta = await Horta.findById(hortaId);
      if (!horta) {
        return res.status(404).json({ error: 'Horta não encontrada' });
      }

      // Verificar permissão
      if (userTipo !== 'admin' && horta.gerenciador_id !== userId) {
        return res.status(403).json({ 
          error: 'Você não tem permissão para editar os horários desta horta' 
        });
      }

      const horario = await HorarioFuncionamento.updateDia(
        hortaId,
        parseInt(diaSemana),
        req.body
      );

      res.json({
        message: 'Horário atualizado com sucesso',
        horario,
      });
    } catch (error) {
      console.error('Erro ao atualizar horário:', error);
      res.status(500).json({ error: 'Erro ao atualizar horário' });
    }
  }

  // Atualizar todos os horários de uma vez
  static async updateAll(req, res) {
    try {
      const { hortaId } = req.params;
      const { horarios } = req.body;
      const userId = req.user.id;
      const userTipo = req.user.tipo;

      // Verificar se horta existe
      const horta = await Horta.findById(hortaId);
      if (!horta) {
        return res.status(404).json({ error: 'Horta não encontrada' });
      }

      // Verificar permissão
      if (userTipo !== 'admin' && horta.gerenciador_id !== userId) {
        return res.status(403).json({ 
          error: 'Você não tem permissão para editar os horários desta horta' 
        });
      }

      const horariosAtualizados = await HorarioFuncionamento.updateAll(hortaId, horarios);

      res.json({
        message: 'Horários atualizados com sucesso',
        horarios: horariosAtualizados,
      });
    } catch (error) {
      console.error('Erro ao atualizar horários:', error);
      res.status(500).json({ error: 'Erro ao atualizar horários' });
    }
  }

  // Verificar se horta está aberta agora
  static async checkAberta(req, res) {
    try {
      const { hortaId } = req.params;

      const aberta = await HorarioFuncionamento.isAbertaAgora(hortaId);
      const proximaAbertura = !aberta 
        ? await HorarioFuncionamento.getProximaAbertura(hortaId)
        : null;

      res.json({
        horta_id: parseInt(hortaId),
        aberta_agora: aberta,
        proxima_abertura: proximaAbertura,
      });
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      res.status(500).json({ error: 'Erro ao verificar status' });
    }
  }

  // Atualizar status temporário da horta
  static async updateStatus(req, res) {
    try {
      const { hortaId } = req.params;
      const { status_temporario, mensagem_status } = req.body;
      const userId = req.user.id;
      const userTipo = req.user.tipo;

      // Verificar se horta existe
      const horta = await Horta.findById(hortaId);
      if (!horta) {
        return res.status(404).json({ error: 'Horta não encontrada' });
      }

      // Verificar permissão
      if (userTipo !== 'admin' && horta.gerenciador_id !== userId) {
        return res.status(403).json({ 
          error: 'Você não tem permissão para alterar o status desta horta' 
        });
      }

      // Validar status
      const statusValidos = ['normal', 'fechado_temporariamente', 'ferias', 'manutencao'];
      if (!statusValidos.includes(status_temporario)) {
        return res.status(400).json({ 
          error: `Status inválido. Use: ${statusValidos.join(', ')}` 
        });
      }

      const hortaAtualizada = await Horta.updateStatus(hortaId, status_temporario, mensagem_status);

      res.json({
        message: 'Status atualizado com sucesso',
        horta: hortaAtualizada,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }
}

export default HorarioController;
