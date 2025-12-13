import pool from '../config/database.js';

class Usuario {
  // Buscar todos os usuários (apenas admin)
  static async findAll(filtros = {}) {
    let query = `
      SELECT 
        id,
        nome,
        email,
        telefone,
        tipo,
        foto_perfil as avatar,
        criado_em,
        atualizado_em,
        (SELECT COUNT(*) FROM hortas WHERE gerenciador_id = usuarios.id AND ativo = true) as total_hortas
      FROM usuarios
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filtros.tipo) {
      query += ` AND tipo = $${paramIndex}`;
      params.push(filtros.tipo);
      paramIndex++;
    }

    if (filtros.busca) {
      query += ` AND (nome ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${filtros.busca}%`);
      paramIndex++;
    }

    query += ' ORDER BY nome ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Buscar usuário por ID
  static async findById(id) {
    const query = `
      SELECT 
        id,
        nome,
        email,
        telefone,
        tipo,
        foto_perfil as avatar,
        criado_em,
        atualizado_em
      FROM usuarios
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Atualizar tipo do usuário (promover/rebaixar)
  static async updateTipo(id, novoTipo) {
    const tiposValidos = ['comum', 'gerenciador', 'admin'];
    if (!tiposValidos.includes(novoTipo)) {
      throw new Error('Tipo de usuário inválido');
    }

    const query = `
      UPDATE usuarios 
      SET tipo = $1, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, nome, email, tipo
    `;
    const result = await pool.query(query, [novoTipo, id]);
    return result.rows[0];
  }

  // Buscar gerenciadores (para select de atribuição de horta)
  static async findGerenciadores() {
    const query = `
      SELECT 
        id,
        nome,
        email,
        (SELECT COUNT(*) FROM hortas WHERE gerenciador_id = usuarios.id AND ativo = true) as total_hortas
      FROM usuarios
      WHERE tipo IN ('gerenciador', 'admin')
      ORDER BY nome ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Contar usuários por tipo (estatísticas)
  static async countByTipo() {
    const query = `
      SELECT 
        tipo,
        COUNT(*) as total
      FROM usuarios
      GROUP BY tipo
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Atualizar status ativo do usuário
  static async updateAtivo(id, ativo) {
    const query = `
      UPDATE usuarios 
      SET ativo = $1, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, nome, email, tipo, ativo
    `;
    const result = await pool.query(query, [ativo, id]);
    return result.rows[0];
  }

  // Deletar usuário permanentemente
  static async delete(id) {
    // Primeiro, remover associações de hortas
    await pool.query(
      'UPDATE hortas SET gerenciador_id = NULL WHERE gerenciador_id = $1',
      [id]
    );
    
    // Depois, deletar o usuário
    const query = `
      DELETE FROM usuarios 
      WHERE id = $1
      RETURNING id, nome, email
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default Usuario;
