import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Suporta tanto REDIS_URL (Upstash/produção) quanto variáveis separadas (local)
const getRedisConfig = () => {
  if (process.env.REDIS_URL) {
    // Produção - Upstash (usa URL completa com senha)
    return {
      url: process.env.REDIS_URL,
    };
  }
  
  // Desenvolvimento local - Docker
  return {
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    },
  };
};

const redisClient = redis.createClient(getRedisConfig());

redisClient.on('connect', () => {
  console.log('✅ Redis conectado com sucesso');
});

redisClient.on('error', (err) => {
  console.error('❌ Erro no Redis:', err);
});

// Conecta apenas se não estiver conectado
if (!redisClient.isOpen) {
  await redisClient.connect();
}

export default redisClient;