import pool from '../config/database.js';

class HorarioFuncionamento {
  // Buscar todos os horários de uma horta
  static async findByHortaId(hortaId) {
    const query = `
      SELECT 
        id,
        horta_id,
        dia_semana,
        CASE dia_semana 
          WHEN 0 THEN 'Domingo'
          WHEN 1 THEN 'Segunda'
          WHEN 2 THEN 'Terça'
          WHEN 3 THEN 'Quarta'
          WHEN 4 THEN 'Quinta'
          WHEN 5 THEN 'Sexta'
          WHEN 6 THEN 'Sábado'
        END as dia_nome,
        aberto,
        TO_CHAR(hora_abertura, 'HH24:MI') as hora_abertura,
        TO_CHAR(hora_fechamento, 'HH24:MI') as hora_fechamento,
        observacao
      FROM horarios_funcionamento
      WHERE horta_id = $1
      ORDER BY dia_semana
    `;
    const result = await pool.query(query, [hortaId]);
    return result.rows;
  }

  // Verificar se horta está aberta agora
  static async isAbertaAgora(hortaId) {
    const query = `SELECT horta_aberta_agora($1) as aberta`;
    const result = await pool.query(query, [hortaId]);
    return result.rows[0]?.aberta || false;
  }

  // Atualizar horário de um dia específico
  static async updateDia(hortaId, diaSemana, dados) {
    const { aberto, hora_abertura, hora_fechamento, observacao } = dados;
    
    const query = `
      INSERT INTO horarios_funcionamento (horta_id, dia_semana, aberto, hora_abertura, hora_fechamento, observacao)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (horta_id, dia_semana) 
      DO UPDATE SET 
        aberto = EXCLUDED.aberto,
        hora_abertura = EXCLUDED.hora_abertura,
        hora_fechamento = EXCLUDED.hora_fechamento,
        observacao = EXCLUDED.observacao,
        atualizado_em = CURRENT_TIMESTAMP
      RETURNING 
        id,
        horta_id,
        dia_semana,
        CASE dia_semana 
          WHEN 0 THEN 'Domingo'
          WHEN 1 THEN 'Segunda'
          WHEN 2 THEN 'Terça'
          WHEN 3 THEN 'Quarta'
          WHEN 4 THEN 'Quinta'
          WHEN 5 THEN 'Sexta'
          WHEN 6 THEN 'Sábado'
        END as dia_nome,
        aberto,
        TO_CHAR(hora_abertura, 'HH24:MI') as hora_abertura,
        TO_CHAR(hora_fechamento, 'HH24:MI') as hora_fechamento,
        observacao
    `;
    
    const result = await pool.query(query, [
      hortaId,
      diaSemana,
      aberto,
      aberto ? hora_abertura : null,
      aberto ? hora_fechamento : null,
      observacao || null
    ]);
    
    return result.rows[0];
  }

  // Atualizar todos os horários de uma horta de uma vez
  static async updateAll(hortaId, horarios) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const resultados = [];
      
      for (const horario of horarios) {
        const { dia_semana, aberto, hora_abertura, hora_fechamento, observacao } = horario;
        
        const query = `
          INSERT INTO horarios_funcionamento (horta_id, dia_semana, aberto, hora_abertura, hora_fechamento, observacao)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (horta_id, dia_semana) 
          DO UPDATE SET 
            aberto = EXCLUDED.aberto,
            hora_abertura = EXCLUDED.hora_abertura,
            hora_fechamento = EXCLUDED.hora_fechamento,
            observacao = EXCLUDED.observacao,
            atualizado_em = CURRENT_TIMESTAMP
          RETURNING *
        `;
        
        const result = await client.query(query, [
          hortaId,
          dia_semana,
          aberto,
          aberto ? hora_abertura : null,
          aberto ? hora_fechamento : null,
          observacao || null
        ]);
        
        resultados.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return resultados;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Obter próximo horário de abertura
  static async getProximaAbertura(hortaId) {
    const query = `
      WITH dias_ordenados AS (
        SELECT 
          dia_semana,
          aberto,
          hora_abertura,
          hora_fechamento,
          CASE 
            WHEN dia_semana >= EXTRACT(DOW FROM CURRENT_TIMESTAMP)::INT 
            THEN dia_semana - EXTRACT(DOW FROM CURRENT_TIMESTAMP)::INT
            ELSE 7 - EXTRACT(DOW FROM CURRENT_TIMESTAMP)::INT + dia_semana
          END as dias_ate
        FROM horarios_funcionamento
        WHERE horta_id = $1 AND aberto = true
        ORDER BY dias_ate
        LIMIT 1
      )
      SELECT 
        dia_semana,
        CASE dia_semana 
          WHEN 0 THEN 'Domingo'
          WHEN 1 THEN 'Segunda'
          WHEN 2 THEN 'Terça'
          WHEN 3 THEN 'Quarta'
          WHEN 4 THEN 'Quinta'
          WHEN 5 THEN 'Sexta'
          WHEN 6 THEN 'Sábado'
        END as dia_nome,
        TO_CHAR(hora_abertura, 'HH24:MI') as hora_abertura,
        dias_ate
      FROM dias_ordenados
    `;
    
    const result = await pool.query(query, [hortaId]);
    return result.rows[0] || null;
  }
}

export default HorarioFuncionamento;
