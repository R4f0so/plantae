import pool from '../config/database.js';

// Detecta se está usando Neon (sem PostGIS) ou PostgreSQL local (com PostGIS)
const usePostGIS = !process.env.DATABASE_URL;

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
    let query;
    let values;

    if (usePostGIS) {
      // PostgreSQL local com PostGIS
      query = `
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
      values = [nome, descricao, endereco, longitude, latitude, gerenciadorId, horarioFuncionamento, fotoCapa];
    } else {
      // Neon sem PostGIS - usa colunas lat/lng separadas
      query = `
        INSERT INTO hortas (
          nome, 
          descricao, 
          endereco, 
          latitude,
          longitude, 
          gerenciador_id, 
          horario_funcionamento,
          foto_capa
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING 
          id, 
          nome, 
          descricao, 
          endereco,
          latitude,
          longitude,
          gerenciador_id,
          horario_funcionamento,
          foto_capa,
          ativo,
          criado_em
      `;
      values = [nome, descricao, endereco, latitude, longitude, gerenciadorId, horarioFuncionamento, fotoCapa];
    }
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Listar todas as hortas
  static async findAll({ ativo = true } = {}) {
    const latLngSelect = usePostGIS 
      ? `ST_Y(h.localizacao::geometry) as latitude, ST_X(h.localizacao::geometry) as longitude`
      : `h.latitude, h.longitude`;

    const query = `
      SELECT 
        h.id,
        h.nome,
        h.descricao,
        h.endereco,
        ${latLngSelect},
        h.gerenciador_id,
        u.nome as gerenciador_nome,
        h.horario_funcionamento,
        h.foto_capa,
        h.ativo,
        h.status_temporario,
        h.mensagem_status,
        h.criado_em,
        h.atualizado_em,
        horta_aberta_agora(h.id) as aberta_agora
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
    const latLngSelect = usePostGIS 
      ? `ST_Y(h.localizacao::geometry) as latitude, ST_X(h.localizacao::geometry) as longitude`
      : `h.latitude, h.longitude`;

    const query = `
      SELECT 
        h.id,
        h.nome,
        h.descricao,
        h.endereco,
        ${latLngSelect},
        h.gerenciador_id,
        u.nome as gerenciador_nome,
        u.email as gerenciador_email,
        u.telefone as gerenciador_telefone,
        h.horario_funcionamento,
        h.foto_capa,
        h.ativo,
        h.status_temporario,
        h.mensagem_status,
        h.criado_em,
        h.atualizado_em,
        horta_aberta_agora(h.id) as aberta_agora
      FROM hortas h
      LEFT JOIN usuarios u ON h.gerenciador_id = u.id
      WHERE h.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Buscar hortas próximas (raio em metros)
  static async findNearby({ latitude, longitude, raio = 5000 }) {
    let query;
    
    if (usePostGIS) {
      // Com PostGIS - usa ST_Distance e ST_DWithin
      query = `
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
    } else {
      // Sem PostGIS (Neon) - usa função calcular_distancia (Haversine)
      query = `
        SELECT 
          h.id,
          h.nome,
          h.descricao,
          h.endereco,
          h.latitude,
          h.longitude,
          h.gerenciador_id,
          u.nome as gerenciador_nome,
          h.horario_funcionamento,
          h.foto_capa,
          h.ativo,
          calcular_distancia($1, $2, h.latitude, h.longitude) as distancia
        FROM hortas h
        LEFT JOIN usuarios u ON h.gerenciador_id = u.id
        WHERE h.ativo = true
          AND calcular_distancia($1, $2, h.latitude, h.longitude) <= $3
        ORDER BY distancia ASC
      `;
    }
    
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
      if (usePostGIS) {
        fields.push(`localizacao = ST_SetSRID(ST_MakePoint($${paramCount + 1}, $${paramCount}), 4326)::geography`);
        values.push(data.latitude, data.longitude);
        paramCount += 2;
      } else {
        fields.push(`latitude = $${paramCount}`);
        values.push(data.latitude);
        paramCount++;
        fields.push(`longitude = $${paramCount}`);
        values.push(data.longitude);
        paramCount++;
      }
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

    const latLngReturn = usePostGIS
      ? `ST_Y(localizacao::geometry) as latitude, ST_X(localizacao::geometry) as longitude`
      : `latitude, longitude`;

    const query = `
      UPDATE hortas
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id,
        nome,
        descricao,
        endereco,
        ${latLngReturn},
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

  // Atualizar status temporário
  static async updateStatus(id, statusTemporario, mensagemStatus = null) {
    const query = `
      UPDATE hortas 
      SET 
        status_temporario = $1, 
        mensagem_status = $2,
        atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING 
        id,
        nome,
        status_temporario,
        mensagem_status,
        atualizado_em
    `;
    
    const result = await pool.query(query, [statusTemporario, mensagemStatus, id]);
    return result.rows[0];
  }

  // Buscar hortas do gerenciador
  static async findByGerenciador(gerenciadorId) {
    const latLngSelect = usePostGIS 
      ? `ST_Y(h.localizacao::geometry) as latitude, ST_X(h.localizacao::geometry) as longitude`
      : `h.latitude, h.longitude`;

    const query = `
      SELECT 
        h.id,
        h.nome,
        h.descricao,
        h.endereco,
        ${latLngSelect},
        h.gerenciador_id,
        h.horario_funcionamento,
        h.foto_capa,
        h.ativo,
        h.status_temporario,
        h.mensagem_status,
        h.criado_em,
        h.atualizado_em,
        horta_aberta_agora(h.id) as aberta_agora
      FROM hortas h
      WHERE h.gerenciador_id = $1
      ORDER BY h.nome
    `;
    
    const result = await pool.query(query, [gerenciadorId]);
    return result.rows;
  }
}

export default Horta;