import pool from '../config/database.js';

class Produto {
  // Criar produto
  static async create({ 
    hortaId, 
    nome, 
    descricao, 
    categoria, 
    preco, 
    unidade,
    estoque,
    foto 
  }) {
    const query = `
      INSERT INTO produtos (
        horta_id,
        nome,
        descricao,
        categoria,
        preco,
        unidade,
        estoque,
        foto
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      hortaId,
      nome,
      descricao,
      categoria,
      preco,
      unidade || 'kg',
      estoque || 0,
      foto
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Listar produtos por horta
  static async findByHorta(hortaId, { disponivel = true } = {}) {
    const query = `
      SELECT 
        p.*,
        h.nome as horta_nome
      FROM produtos p
      LEFT JOIN hortas h ON p.horta_id = h.id
      WHERE p.horta_id = $1 AND p.disponivel = $2
      ORDER BY p.categoria, p.nome
    `;
    
    const result = await pool.query(query, [hortaId, disponivel]);
    return result.rows;
  }

  // Listar todos os produtos
  static async findAll({ categoria, disponivel = true } = {}) {
    let query = `
      SELECT 
        p.*,
        h.nome as horta_nome,
        h.endereco as horta_endereco
      FROM produtos p
      LEFT JOIN hortas h ON p.horta_id = h.id
      WHERE p.disponivel = $1
    `;
    
    const values = [disponivel];
    
    if (categoria) {
      query += ` AND p.categoria = $2`;
      values.push(categoria);
    }
    
    query += ` ORDER BY p.criado_em DESC`;
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Buscar produto por ID
  static async findById(id) {
    const query = `
      SELECT 
        p.*,
        h.nome as horta_nome,
        h.endereco as horta_endereco,
        h.gerenciador_id
      FROM produtos p
      LEFT JOIN hortas h ON p.horta_id = h.id
      WHERE p.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Atualizar produto
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

    if (data.categoria !== undefined) {
      fields.push(`categoria = $${paramCount}`);
      values.push(data.categoria);
      paramCount++;
    }

    if (data.preco !== undefined) {
      fields.push(`preco = $${paramCount}`);
      values.push(data.preco);
      paramCount++;
    }

    if (data.unidade !== undefined) {
      fields.push(`unidade = $${paramCount}`);
      values.push(data.unidade);
      paramCount++;
    }

    if (data.estoque !== undefined) {
      fields.push(`estoque = $${paramCount}`);
      values.push(data.estoque);
      paramCount++;
    }

    if (data.foto !== undefined) {
      fields.push(`foto = $${paramCount}`);
      values.push(data.foto);
      paramCount++;
    }

    if (data.disponivel !== undefined) {
      fields.push(`disponivel = $${paramCount}`);
      values.push(data.disponivel);
      paramCount++;
    }

    fields.push(`atualizado_em = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE produtos
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Atualizar estoque
  static async updateEstoque(id, quantidade, operacao = 'add') {
    let query;
    
    if (operacao === 'add') {
      query = `
        UPDATE produtos
        SET estoque = estoque + $1, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
    } else if (operacao === 'subtract') {
      query = `
        UPDATE produtos
        SET estoque = GREATEST(estoque - $1, 0), atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
    } else {
      query = `
        UPDATE produtos
        SET estoque = $1, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
    }

    const result = await pool.query(query, [quantidade, id]);
    return result.rows[0];
  }

  // Deletar produto
  static async delete(id) {
    const query = 'DELETE FROM produtos WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Buscar produtos por categoria
  static async findByCategoria(categoria) {
    const query = `
      SELECT 
        p.*,
        h.nome as horta_nome,
        h.endereco as horta_endereco
      FROM produtos p
      LEFT JOIN hortas h ON p.horta_id = h.id
      WHERE p.categoria = $1 AND p.disponivel = true
      ORDER BY p.nome
    `;
    
    const result = await pool.query(query, [categoria]);
    return result.rows;
  }
}

export default Produto;