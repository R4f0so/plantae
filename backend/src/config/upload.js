import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determinar pasta baseado na URL completa
    let folder = 'uploads/';
    
    const url = req.originalUrl || req.url;
    
    if (url.includes('/user/')) {
      folder += 'users/';
    } else if (url.includes('/horta/')) {
      folder += 'hortas/';
    } else if (url.includes('/produto/')) {
      folder += 'produtos/';
    } else {
      // Fallback para users se não conseguir identificar
      folder += 'users/';
    }
    
    cb(null, path.resolve(__dirname, '../../public', folder));
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

// Filtro de tipos de arquivo permitidos
const fileFilter = (req, file, cb) => {
  // Aceitar apenas imagens
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo não suportado. Use: JPEG, PNG, GIF ou WebP'), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
  }
});

// Middleware para tratar erros do multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Arquivo muito grande. Tamanho máximo: 5MB' 
      });
    }
    return res.status(400).json({ 
      error: `Erro no upload: ${err.message}` 
    });
  }
  
  if (err) {
    return res.status(400).json({ 
      error: err.message 
    });
  }
  
  next();
};

// Helper para obter URL pública do arquivo
export const getFileUrl = (req, filename) => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/${filename}`;
};

export default upload;