-- ============================================
-- PLANTAE - Migrations para Neon (sem PostGIS)
-- ============================================
-- Use este arquivo para criar as tabelas no Neon
-- PostGIS não está disponível no tier gratuito do Neon

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'comum' CHECK (tipo IN ('comum', 'gerenciador', 'admin')),
    telefone VARCHAR(20),
    foto_perfil TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- Tabela de Hortas (sem PostGIS - usa lat/lng separados)
CREATE TABLE IF NOT EXISTS hortas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    endereco VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    gerenciador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    horario_funcionamento TEXT,
    foto_capa TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para hortas
CREATE INDEX IF NOT EXISTS idx_hortas_gerenciador ON hortas(gerenciador_id);
CREATE INDEX IF NOT EXISTS idx_hortas_ativo ON hortas(ativo);
CREATE INDEX IF NOT EXISTS idx_hortas_lat_lng ON hortas(latitude, longitude);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    horta_id INTEGER NOT NULL REFERENCES hortas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('fruta', 'verdura', 'legume', 'erva', 'outro')),
    preco DECIMAL(10, 2),
    unidade VARCHAR(20) NOT NULL DEFAULT 'kg',
    estoque DECIMAL(10, 2) NOT NULL DEFAULT 0,
    foto TEXT,
    disponivel BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para produtos
CREATE INDEX IF NOT EXISTS idx_produtos_horta ON produtos(horta_id);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_disponivel ON produtos(disponivel);

-- Tabela de Horários de Funcionamento
CREATE TABLE IF NOT EXISTS horarios_funcionamento (
    id SERIAL PRIMARY KEY,
    horta_id INTEGER NOT NULL REFERENCES hortas(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
    hora_abertura TIME NOT NULL,
    hora_fechamento TIME NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(horta_id, dia_semana)
);

-- Índice para horários
CREATE INDEX IF NOT EXISTS idx_horarios_horta ON horarios_funcionamento(horta_id);

-- Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas
DROP TRIGGER IF EXISTS trigger_update_usuarios ON usuarios;
CREATE TRIGGER trigger_update_usuarios
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trigger_update_hortas ON hortas;
CREATE TRIGGER trigger_update_hortas
    BEFORE UPDATE ON hortas
    FOR EACH ROW
    EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trigger_update_produtos ON produtos;
CREATE TRIGGER trigger_update_produtos
    BEFORE UPDATE ON produtos
    FOR EACH ROW
    EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trigger_update_horarios ON horarios_funcionamento;
CREATE TRIGGER trigger_update_horarios
    BEFORE UPDATE ON horarios_funcionamento
    FOR EACH ROW
    EXECUTE FUNCTION update_atualizado_em();

-- ============================================
-- Função para calcular distância (substitui PostGIS)
-- ============================================
-- Fórmula de Haversine para calcular distância em metros
CREATE OR REPLACE FUNCTION calcular_distancia(
    lat1 DECIMAL, lng1 DECIMAL,
    lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    R DECIMAL := 6371000; -- Raio da Terra em metros
    phi1 DECIMAL;
    phi2 DECIMAL;
    delta_phi DECIMAL;
    delta_lambda DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    phi1 := RADIANS(lat1);
    phi2 := RADIANS(lat2);
    delta_phi := RADIANS(lat2 - lat1);
    delta_lambda := RADIANS(lng2 - lng1);
    
    a := SIN(delta_phi / 2) * SIN(delta_phi / 2) +
         COS(phi1) * COS(phi2) *
         SIN(delta_lambda / 2) * SIN(delta_lambda / 2);
    c := 2 * ATAN2(SQRT(a), SQRT(1 - a));
    
    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Dados iniciais (admin)
-- ============================================
-- Senha: admin123 (hash bcrypt)
INSERT INTO usuarios (nome, email, senha_hash, tipo)
VALUES ('Admin Plantae', 'admin@plantae.com', '$2b$10$WiPV7icA1xZm0Or7GVirfeN6cMrHfzqTJe.rty9VEYBlf2kGFWfTS', 'admin')
ON CONFLICT (email) DO NOTHING;
