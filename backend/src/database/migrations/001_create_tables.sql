-- Habilitar extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

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
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);

-- Tabela de Hortas
CREATE TABLE IF NOT EXISTS hortas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    endereco VARCHAR(500) NOT NULL,
    localizacao GEOGRAPHY(POINT, 4326) NOT NULL,
    gerenciador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    horario_funcionamento TEXT,
    foto_capa TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para hortas
CREATE INDEX idx_hortas_gerenciador ON hortas(gerenciador_id);
CREATE INDEX idx_hortas_ativo ON hortas(ativo);
CREATE INDEX idx_hortas_localizacao ON hortas USING GIST(localizacao);

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
CREATE INDEX idx_produtos_horta ON produtos(horta_id);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_produtos_disponivel ON produtos(disponivel);

-- Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas
CREATE TRIGGER trigger_update_usuarios
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_update_hortas
    BEFORE UPDATE ON hortas
    FOR EACH ROW
    EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_update_produtos
    BEFORE UPDATE ON produtos
    FOR EACH ROW
    EXECUTE FUNCTION update_atualizado_em();

-- Comentários nas tabelas
COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema';
COMMENT ON TABLE hortas IS 'Tabela de hortas comunitárias';
COMMENT ON TABLE produtos IS 'Tabela de produtos disponíveis nas hortas';

-- Comentários nas colunas importantes
COMMENT ON COLUMN hortas.localizacao IS 'Coordenadas geográficas da horta (latitude, longitude)';
COMMENT ON COLUMN usuarios.tipo IS 'Tipo de usuário: comum, gerenciador ou admin';
COMMENT ON COLUMN produtos.categoria IS 'Categoria do produto: fruta, verdura, legume, erva ou outro';