import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import pool from './src/config/database.js';
import redisClient from './src/config/redis.js';
import authRoutes from './src/routes/authRoutes.js';
import hortaRoutes from './src/routes/hortaRoutes.js';
import produtoRoutes from './src/routes/produtoRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// Middlewares para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ==================== ROTAS ====================

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Rotas de hortas
app.use('/api/hortas', hortaRoutes);

// Rotas de produtos
app.use('/api/produtos', produtoRoutes);

app.get('/', (req, res) => {
  res.json({ 
    app: process.env.APP_NAME,
    message: '🌱 Plantae API - Hortas Comunitárias de Osasco',
    status: 'online',
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    await redisClient.ping();
    
    res.json({ 
      status: 'healthy',
      services: {
        database: 'connected',
        redis: 'connected',
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// app.all('/*', (req, res) => {
//   res.status(404).json({
//     error: 'Rota não encontrada',
//     path: req.originalUrl,
//     method: req.method
//   });
// });

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
  console.log('\n🌱========================================');
  console.log(`   PLANTAE API`);
  console.log('========================================🌱');
  console.log(`🚀 Servidor: http://localhost:${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log('========================================\n');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exceção não capturada:', err);
  process.exit(1);
});