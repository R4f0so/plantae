-- ============================================================
-- MIGRATION: Adicionar tabela de horários por dia
-- Data: Dezembro/2025
-- ============================================================

-- Criar tabela de horários de funcionamento
CREATE TABLE IF NOT EXISTS horarios_funcionamento (
    id SERIAL PRIMARY KEY,
    horta_id INTEGER NOT NULL REFERENCES hortas(id) ON DELETE CASCADE,
    dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    -- 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
    aberto BOOLEAN NOT NULL DEFAULT true,
    hora_abertura TIME,
    hora_fechamento TIME,
    observacao VARCHAR(255),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(horta_id, dia_semana)
);

-- Índices
CREATE INDEX idx_horarios_horta ON horarios_funcionamento(horta_id);
CREATE INDEX idx_horarios_dia ON horarios_funcionamento(dia_semana);

-- Adicionar coluna de status temporário nas hortas
ALTER TABLE hortas ADD COLUMN IF NOT EXISTS status_temporario VARCHAR(50) DEFAULT 'normal';
-- Valores: 'normal', 'fechado_temporariamente', 'ferias', 'manutencao'

ALTER TABLE hortas ADD COLUMN IF NOT EXISTS mensagem_status TEXT;
-- Mensagem opcional para explicar o status (ex: "Fechado para reforma até 15/01")

-- ============================================================
-- FUNÇÃO: Verificar se horta está aberta agora
-- ============================================================
CREATE OR REPLACE FUNCTION horta_aberta_agora(p_horta_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_dia_semana SMALLINT;
    v_hora_atual TIME;
    v_aberto BOOLEAN;
    v_hora_abertura TIME;
    v_hora_fechamento TIME;
    v_status VARCHAR(50);
BEGIN
    -- Verificar status temporário primeiro
    SELECT status_temporario INTO v_status FROM hortas WHERE id = p_horta_id;
    IF v_status != 'normal' THEN
        RETURN FALSE;
    END IF;

    -- Obter dia da semana atual (0 = Domingo no PostgreSQL com EXTRACT)
    v_dia_semana := EXTRACT(DOW FROM CURRENT_TIMESTAMP)::SMALLINT;
    v_hora_atual := CURRENT_TIME;

    -- Buscar horário do dia
    SELECT aberto, hora_abertura, hora_fechamento 
    INTO v_aberto, v_hora_abertura, v_hora_fechamento
    FROM horarios_funcionamento 
    WHERE horta_id = p_horta_id AND dia_semana = v_dia_semana;

    -- Se não encontrou registro, assume fechado
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Se marcado como não aberto nesse dia
    IF NOT v_aberto THEN
        RETURN FALSE;
    END IF;

    -- Verificar se está dentro do horário
    IF v_hora_atual >= v_hora_abertura AND v_hora_atual <= v_hora_fechamento THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- POPULAR HORÁRIOS PADRÃO (Seg-Sex 8h-17h) PARA HORTAS EXISTENTES
-- ============================================================
DO $$
DECLARE
    horta_record RECORD;
    dia INT;
BEGIN
    FOR horta_record IN SELECT id FROM hortas WHERE ativo = true LOOP
        -- Segunda a Sexta (1-5): 8h às 17h
        FOR dia IN 1..5 LOOP
            INSERT INTO horarios_funcionamento (horta_id, dia_semana, aberto, hora_abertura, hora_fechamento)
            VALUES (horta_record.id, dia, true, '08:00', '17:00')
            ON CONFLICT (horta_id, dia_semana) DO NOTHING;
        END LOOP;
        
        -- Sábado (6): Fechado por padrão
        INSERT INTO horarios_funcionamento (horta_id, dia_semana, aberto, hora_abertura, hora_fechamento)
        VALUES (horta_record.id, 6, false, NULL, NULL)
        ON CONFLICT (horta_id, dia_semana) DO NOTHING;
        
        -- Domingo (0): Fechado por padrão
        INSERT INTO horarios_funcionamento (horta_id, dia_semana, aberto, hora_abertura, hora_fechamento)
        VALUES (horta_record.id, 0, false, NULL, NULL)
        ON CONFLICT (horta_id, dia_semana) DO NOTHING;
    END LOOP;
END $$;

-- Verificar
SELECT 
    h.nome,
    hf.dia_semana,
    CASE hf.dia_semana 
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Segunda'
        WHEN 2 THEN 'Terça'
        WHEN 3 THEN 'Quarta'
        WHEN 4 THEN 'Quinta'
        WHEN 5 THEN 'Sexta'
        WHEN 6 THEN 'Sábado'
    END as dia_nome,
    hf.aberto,
    hf.hora_abertura,
    hf.hora_fechamento
FROM hortas h
JOIN horarios_funcionamento hf ON h.id = hf.horta_id
WHERE h.nome = 'Horta Raízes'
ORDER BY hf.dia_semana;
