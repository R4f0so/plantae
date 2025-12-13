import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

// Suporta tanto DATABASE_URL (Neon/produção) quanto variáveis separadas (local)
const getPoolConfig = () => {
  if (process.env.DATABASE_URL) {
    // Produção - Neon (usa connection string)
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Necessário para Neon
      },
      max: 10, // Neon tem limite de conexões
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }
  
  // Desenvolvimento local - Docker
  return {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
};

const pool = new Pool(getPoolConfig());

pool.on('connect', () => {
  console.log('✅ PostgreSQL conectado com sucesso');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no PostgreSQL:', err);
  process.exit(-1);
});

export default pool;