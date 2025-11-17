import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on('connect', () => {
  console.log('✅ Redis conectado com sucesso');
});

redisClient.on('error', (err) => {
  console.error('❌ Erro no Redis:', err);
});

await redisClient.connect();

export default redisClient;