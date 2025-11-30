import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSeeds() {
  console.log('🌱 Iniciando seeds...\n');

  try {
    const seedPath = join(__dirname, 'seeds', '002_seed_data.sql');
    const seedSQL = readFileSync(seedPath, 'utf8');

    console.log('📄 Executando: 002_seed_data.sql');
    await pool.query(seedSQL);
    console.log('✅ Seeds executados com sucesso!\n');

    const usuarios = await pool.query('SELECT COUNT(*) FROM usuarios');
    const hortas = await pool.query('SELECT COUNT(*) FROM hortas');
    const produtos = await pool.query('SELECT COUNT(*) FROM produtos');

    console.log('📊 Dados inseridos:');
    console.log(`   - Usuários: ${usuarios.rows[0].count}`);
    console.log(`   - Hortas: ${hortas.rows[0].count}`);
    console.log(`   - Produtos: ${produtos.rows[0].count}`);

    console.log('\n✨ Seeds concluídos com sucesso!');
    
    const users = await pool.query('SELECT nome, email, tipo FROM usuarios ORDER BY id');
    console.log('\n👥 Usuários cadastrados:');
    users.rows.forEach(user => {
      console.log(`   - ${user.nome} (${user.email}) - ${user.tipo}`);
    });
    console.log('\n🔑 Senha padrão para todos: senha123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runSeeds();