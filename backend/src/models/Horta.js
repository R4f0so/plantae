import pool from '../config/database.js';

class Horta {
  // Criar horta
  static async create({ 
    nome, 
    descricao, 
    endereco, 
    latitude, 
    longitude, 
    gerenciadorId,
    horarioFuncionamento,
    fotoCapa 
  }) {
    const query = `
      INSERT INTO hortas (
        nome, 
        descricao, 
        endereco, 
        localizacao, 
        gerenciador_id, 
        horario_funcionamento,
        foto_capa
      )
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6, $7, $8)
      RETURNING 
        id, 
        nome, 
        descricao, 
        endereco,
        ST_Y(localizacao::geometry) as latitude,
        ST_X(localizacao::geometry) as longitude,
        gerenciador_id,
        horario_funcionamento,
        foto_capa,
        ativo,
        criado_em
    `;
    
    const values = [
      nome, 
      descricao, 
      endereco, 
      longitude, 
      latitude, 
      gerenciadorId,
      horarioFuncionamento,
      fotoCapa
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Listar todas as hortas
  static async findAll({ ativo = true } = {}) {
    const query = `
      SELECT 
        h.id,
        h.nome,
        h.descricao,
        h.endereco,
        ST_Y(h.localizacao::geometry) as latitude,
        ST_X(h.localizacao::geometry) as longitude,
        h.gerenciador_id,
        u.nome as gerenciador_nome,
        h.horario_funcionamento,
        h.foto_capa,
        h.ativo,
        h.criado_em,
        h.atualizado_em
      FROM hortas h
      LEFT JOIN usuarios u ON h.gerenciador_id = u.id
      WHERE h.ativo = $1
      ORDER BY h.criado_em DESC
    `;
    
    const result = await pool.query(query, [ativo]);
    return result.rows;
  }

  // Buscar por ID
  static async findById(id) {
    const query = `
      SELECT 
        h.id,
        h.nome,
        h.descricao,
        h.endereco,
        ST_Y(h.localizacao::geometry) as latitude,
        ST_X(h.localizacao::geometry) as longitude,
        h.gerenciador_id,
        u.nome as gerenciador_nome,
        u.email as gerenciador_email,
        u.telefone as gerenciador_telefone,
        h.horario_funcionamento,
        h.foto_capa,
        h.ativo,
        h.criado_em,
        h.atualizado_em
      FROM hortas h
      LEFT JOIN usuarios u ON h.gerenciador_id = u.id
      WHERE h.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Buscar hortas próximas (raio em metros)
  static async findNearby({ latitude, longitude, raio = 5000 }) {
    const query = `
      SELECT 
        h.id,
        h.nome,
        h.descricao,
        h.endereco,
        ST_Y(h.localizacao::geometry) as latitude,
        ST_X(h.localizacao::geometry) as longitude,
        h.gerenciador_id,
        u.nome as gerenciador_nome,
        h.horario_funcionamento,
        h.foto_capa,
        h.ativo,
        ST_Distance(
          h.localizacao,
          ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
        ) as distancia
      FROM hortas h
      LEFT JOIN usuarios u ON h.gerenciador_id = u.id
      WHERE h.ativo = true
        AND ST_DWithin(
          h.localizacao,
          ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
          $3
        )
      ORDER BY distancia ASC
    `;
    
    const result = await pool.query(query, [latitude, longitude, raio]);
    return result.rows;
  }

  // Atualizar horta
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.nome !== undefined) {
      fields.push(`nome = $${paramCount}`);
      values.push(data.nome);
      paramCount++;
    }

    if (data.descricao !== undefined) {
      fields.push(`descricao = $${paramCount}`);
      values.push(data.descricao);
      paramCount++;
    }

    if (data.endereco !== undefined) {
      fields.push(`endereco = $${paramCount}`);
      values.push(data.endereco);
      paramCount++;
    }

    if (data.latitude !== undefined && data.longitude !== undefined) {
      fields.push(`localizacao = ST_SetSRID(ST_MakePoint($${paramCount + 1}, $${paramCount}), 4326)::geography`);
      values.push(data.latitude, data.longitude);
      paramCount += 2;
    }

    if (data.horarioFuncionamento !== undefined) {
      fields.push(`horario_funcionamento = $${paramCount}`);
      values.push(data.horarioFuncionamento);
      paramCount++;
    }

    if (data.fotoCapa !== undefined) {
      fields.push(`foto_capa = $${paramCount}`);
      values.push(data.fotoCapa);
      paramCount++;
    }

    fields.push(`atualizado_em = CURRENT_TIMESTAMP`);

    values.push(id);

    const query = `
      UPDATE hortas
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id,
        nome,
        descricao,
        endereco,
        ST_Y(localizacao::geometry) as latitude,
        ST_X(localizacao::geometry) as longitude,
        gerenciador_id,
        horario_funcionamento,
        foto_capa,
        ativo,
        atualizado_em
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Deletar horta (soft delete)
  static async delete(id) {
    const query = `
      UPDATE hortas 
      SET ativo = false, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Deletar permanentemente (apenas admin)
  static async hardDelete(id) {
    const query = 'DELETE FROM hortas WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default Horta;