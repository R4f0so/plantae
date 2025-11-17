import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // Criar usuário
  static async create({ nome, email, senha, tipo = 'comum', telefone = null }) {
    const senhaHash = await bcrypt.hash(senha, 10);
    
    const query = `
      INSERT INTO usuarios (nome, email, senha_hash, tipo, telefone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nome, email, tipo, telefone, ativo, criado_em
    `;
    
    const values = [nome, email, senhaHash, tipo, telefone];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  // Buscar por email
  static async findByEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    return result.rows[0];
  }

  // Buscar por ID
  static async findById(id) {
    const query = `
      SELECT id, nome, email, tipo, telefone, foto_perfil, ativo, criado_em, atualizado_em
      FROM usuarios 
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    
    return result.rows[0];
  }

  // Comparar senha
  static async comparePassword(senha, senhaHash) {
    return await bcrypt.compare(senha, senhaHash);
  }

  // Atualizar último login
  static async updateLastLogin(id) {
    const query = `
      UPDATE usuarios 
      SET atualizado_em = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    await pool.query(query, [id]);
  }
}

export default User;