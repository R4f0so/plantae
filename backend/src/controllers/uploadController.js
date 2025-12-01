import { getFileUrl } from '../config/upload.js';
import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UploadController {
  // Upload de foto de perfil do usuário
  static async uploadUserPhoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const userId = req.user.id;
      const filename = `uploads/users/${req.file.filename}`;
      const fileUrl = getFileUrl(req, filename);

      // Buscar foto antiga para deletar
      const oldPhotoQuery = 'SELECT foto_perfil FROM usuarios WHERE id = $1';
      const oldPhotoResult = await pool.query(oldPhotoQuery, [userId]);
      const oldPhoto = oldPhotoResult.rows[0]?.foto_perfil;

      // Atualizar foto no banco
      const query = `
        UPDATE usuarios 
        SET foto_perfil = $1, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, nome, email, foto_perfil
      `;
      
      const result = await pool.query(query, [fileUrl, userId]);

      // Deletar foto antiga (se existir e for local)
      if (oldPhoto && oldPhoto.includes('/uploads/users/')) {
        const oldFilename = oldPhoto.split('/uploads/users/')[1];
        const oldFilePath = path.resolve(__dirname, '../../public/uploads/users', oldFilename);
        
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      res.json({
        message: 'Foto de perfil atualizada com sucesso',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      
      // Deletar arquivo enviado em caso de erro
      if (req.file) {
        const filePath = path.resolve(__dirname, '../../public/uploads/users', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      res.status(500).json({ error: 'Erro ao fazer upload da foto' });
    }
  }

  // Upload de foto de capa da horta
  static async uploadHortaPhoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const { id } = req.params;
      const userId = req.user.id;
      const userTipo = req.user.tipo;

      // Verificar se horta existe e se usuário tem permissão
      const hortaQuery = 'SELECT gerenciador_id, foto_capa FROM hortas WHERE id = $1';
      const hortaResult = await pool.query(hortaQuery, [id]);

      if (hortaResult.rows.length === 0) {
        // Deletar arquivo enviado
        const filePath = path.resolve(__dirname, '../../public/uploads/hortas', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return res.status(404).json({ error: 'Horta não encontrada' });
      }

      const horta = hortaResult.rows[0];

      // Verificar permissão
      if (userTipo !== 'admin' && horta.gerenciador_id !== userId) {
        // Deletar arquivo enviado
        const filePath = path.resolve(__dirname, '../../public/uploads/hortas', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return res.status(403).json({ 
          error: 'Você não tem permissão para editar esta horta' 
        });
      }

      const filename = `uploads/hortas/${req.file.filename}`;
      const fileUrl = getFileUrl(req, filename);

      // Atualizar foto no banco
      const updateQuery = `
        UPDATE hortas 
        SET foto_capa = $1, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, nome, foto_capa
      `;
      
      const result = await pool.query(updateQuery, [fileUrl, id]);

      // Deletar foto antiga
      if (horta.foto_capa && horta.foto_capa.includes('/uploads/hortas/')) {
        const oldFilename = horta.foto_capa.split('/uploads/hortas/')[1];
        const oldFilePath = path.resolve(__dirname, '../../public/uploads/hortas', oldFilename);
        
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      res.json({
        message: 'Foto da horta atualizada com sucesso',
        horta: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      
      // Deletar arquivo em caso de erro
      if (req.file) {
        const filePath = path.resolve(__dirname, '../../public/uploads/hortas', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      res.status(500).json({ error: 'Erro ao fazer upload da foto' });
    }
  }

  // Upload de foto do produto
  static async uploadProdutoPhoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const { id } = req.params;
      const userId = req.user.id;
      const userTipo = req.user.tipo;

      // Verificar se produto existe e permissão
      const produtoQuery = `
        SELECT p.*, h.gerenciador_id
        FROM produtos p
        LEFT JOIN hortas h ON p.horta_id = h.id
        WHERE p.id = $1
      `;
      const produtoResult = await pool.query(produtoQuery, [id]);

      if (produtoResult.rows.length === 0) {
        // Deletar arquivo
        const filePath = path.resolve(__dirname, '../../public/uploads/produtos', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      const produto = produtoResult.rows[0];

      // Verificar permissão
      if (userTipo !== 'admin' && produto.gerenciador_id !== userId) {
        // Deletar arquivo
        const filePath = path.resolve(__dirname, '../../public/uploads/produtos', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return res.status(403).json({ 
          error: 'Você não tem permissão para editar este produto' 
        });
      }

      const filename = `uploads/produtos/${req.file.filename}`;
      const fileUrl = getFileUrl(req, filename);

      // Atualizar foto no banco
      const updateQuery = `
        UPDATE produtos 
        SET foto = $1, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, nome, foto
      `;
      
      const result = await pool.query(updateQuery, [fileUrl, id]);

      // Deletar foto antiga
      if (produto.foto && produto.foto.includes('/uploads/produtos/')) {
        const oldFilename = produto.foto.split('/uploads/produtos/')[1];
        const oldFilePath = path.resolve(__dirname, '../../public/uploads/produtos', oldFilename);
        
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      res.json({
        message: 'Foto do produto atualizada com sucesso',
        produto: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      
      // Deletar arquivo em caso de erro
      if (req.file) {
        const filePath = path.resolve(__dirname, '../../public/uploads/produtos', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      res.status(500).json({ error: 'Erro ao fazer upload da foto' });
    }
  }

  // Deletar foto
  static async deletePhoto(req, res) {
    try {
      const { type, id } = req.params; // type: user, horta, produto
      const userId = req.user.id;
      const userTipo = req.user.tipo;

      let query, photoField, folder, tableName;

      switch(type) {
        case 'user':
          if (parseInt(id) !== userId && userTipo !== 'admin') {
            return res.status(403).json({ error: 'Sem permissão' });
          }
          query = 'SELECT foto_perfil FROM usuarios WHERE id = $1';
          photoField = 'foto_perfil';
          folder = 'users';
          tableName = 'usuarios';
          break;
        
        case 'horta':
          query = 'SELECT foto_capa, gerenciador_id FROM hortas WHERE id = $1';
          photoField = 'foto_capa';
          folder = 'hortas';
          tableName = 'hortas';
          break;
        
        case 'produto':
          query = `
            SELECT p.foto, h.gerenciador_id
            FROM produtos p
            LEFT JOIN hortas h ON p.horta_id = h.id
            WHERE p.id = $1
          `;
          photoField = 'foto';
          folder = 'produtos';
          tableName = 'produtos';
          break;
        
        default:
          return res.status(400).json({ error: 'Tipo inválido' });
      }

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }

      const record = result.rows[0];

      // Verificar permissão para horta e produto
      if (type !== 'user' && userTipo !== 'admin' && record.gerenciador_id !== userId) {
        return res.status(403).json({ error: 'Sem permissão' });
      }

      const photoUrl = record[photoField];

      if (!photoUrl || !photoUrl.includes(`/uploads/${folder}/`)) {
        return res.status(400).json({ error: 'Nenhuma foto para deletar' });
      }

      // Deletar arquivo
      const filename = photoUrl.split(`/uploads/${folder}/`)[1];
      const filePath = path.resolve(__dirname, `../../public/uploads/${folder}`, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Atualizar banco
      const updateQuery = `
        UPDATE ${tableName} 
        SET ${photoField} = NULL, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      await pool.query(updateQuery, [id]);

      res.json({ message: 'Foto deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      res.status(500).json({ error: 'Erro ao deletar foto' });
    }
  }
}

export default UploadController;