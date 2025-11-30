import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  console.log('🚀 Iniciando migrations...\n');

  try {
    const migrationPath = join(__dirname, 'migrations', '001_create_tables.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Executando: 001_create_tables.sql');
    await pool.query(migrationSQL);
    console.log('✅ Migration executada com sucesso!\n');

    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📊 Tabelas criadas:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n✨ Migrations concluídas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigrations();