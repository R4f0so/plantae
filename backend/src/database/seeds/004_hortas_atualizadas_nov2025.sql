-- ============================================================
-- ATUALIZAÇÃO DAS HORTAS COMUNITÁRIAS DE OSASCO
-- Baseado no comunicado oficial de Novembro/2025
-- Instagram da Secretaria de Assistência Social
-- ============================================================

-- Primeiro, desativar todas as hortas existentes para atualizar
UPDATE hortas SET ativo = false;

-- Limpar hortas antigas (opcional - comentado por segurança)
-- DELETE FROM produtos;
-- DELETE FROM hortas;

-- ============================================================
-- HORTAS ZONA SUL (8 hortas)
-- ============================================================

INSERT INTO hortas (nome, descricao, endereco, localizacao, gerenciador_id, horario_funcionamento, ativo) VALUES
(
    'Horta Alimentos',
    'Produção de alimentos orgânicos frescos. Produtos livres de agrotóxicos com preços acessíveis para a comunidade.',
    'Av. Pedro Pinho, 1.340 – Jardim Pestana, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7826, -23.5321), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Maná',
    'Horta comunitária gerida por agricultores locais. Produção orgânica e sustentável com foco em agricultura familiar.',
    'Rua Antônio Russo, 657 – Jardim Roberto, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7945, -23.5412), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Chico Mendes',
    'Homenagem ao ambientalista Chico Mendes. Foco em agricultura familiar, economia solidária e preservação ambiental.',
    'Rua Lázaro Suave, 15 – City Bussocaba, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7632, -23.5234), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Vicentina',
    'Horta comunitária do Jardim Vicentina. Integra o Programa Economia Solidária de Osasco.',
    'Rua Arlindo João Salgado, 2 – Jardim Vicentina, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7889, -23.5534), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Pedacinho do Céu (Audax I)',
    'Primeira unidade da Horta Audax. Produção diversificada de hortaliças, verduras e legumes frescos.',
    'Rua Magnólia, 37 – Vila Yolanda, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7723, -23.5289), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Cantinho do Sabiá (Audax II)',
    'Segunda unidade da Horta Audax. Especializada em verduras folhosas e temperos naturais.',
    'Rua Acácia, 475 – Vila Yolanda, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7734, -23.5298), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Morada dos Sonhos',
    'Horta comunitária inspiradora no Jardim Roberto. Produção orgânica certificada com variedade de produtos.',
    'Rua Morada dos Sonhos, 43 – Jardim Roberto, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7895, -23.5545), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Raízes',
    'Nova horta inaugurada em novembro/2025 nas dependências da Secretaria de Assistência Social. Conta com 12 canteiros de hortaliças e 9 canteiros elevados para cultivo de hortaliças, ervas e temperos.',
    'Rua Dom Ercílio Turco, 180 – Vila Osasco, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7756, -23.5328), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),

-- ============================================================
-- HORTAS ZONA NORTE (8 hortas)
-- ============================================================

(
    'Horta Cantinho Verde',
    'Espaço verde comunitário no bairro Canaã. Produção de temperos, ervas aromáticas e hortaliças diversas.',
    'Rua Calixto Barbieri, 136 – Canaã, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7612, -23.5445), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Simpatia',
    'Horta comunitária acolhedora no Mutinga. Foco em legumes, raízes e verduras frescas.',
    'Rua Rubi, 17 / Av. Esmeralda, 137 – Mutinga, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7978, -23.5356), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Modelo',
    'Horta referência em agricultura urbana de Osasco. Recebe visitas escolares e grupos comunitários.',
    'Av. João Del Papa, 580 – IAPI, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7801, -23.5401), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Cheirinho Verde',
    'Especializada em ervas aromáticas, temperos frescos e hortaliças orgânicas.',
    'Rua Fortunato Pulherini, 81 – Mutinga, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7989, -23.5378), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Passaredo I',
    'Primeira unidade Passaredo no Jardim Aliança. Produção diversificada de hortaliças e verduras.',
    'Av. Passaredo, 13 A – Jardim Aliança, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7567, -23.5489), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Passaredo II',
    'Segunda unidade Passaredo. Foco em hortaliças folhosas e produtos sazonais.',
    'Av. Passaredo, 13 B – Jardim Aliança, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7572, -23.5493), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Inclusiva',
    'Horta com acessibilidade e inclusão. Espaço adaptado para pessoas com deficiência participarem do cultivo.',
    'Av. Passaredo, s/n – Jardim Aliança, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7575, -23.5497), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Nova Vida',
    'Projeto de ressocialização e inclusão através da agricultura urbana. Cultivo sustentável e comunitário.',
    'Rua Calixto Barbieri, 129 – Jardim Canaã, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7618, -23.5451), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),

-- ============================================================
-- EIXO VERDE (5 hortas)
-- ============================================================

(
    'Horta Figueira',
    'Parte do Eixo Verde de Osasco. Cultivo de hortaliças variadas em área arborizada.',
    'Av. Bandeirantes, 86 – Jardim Aliança, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7545, -23.5465), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Amoreira',
    'Integrante do Eixo Verde. Especializada em frutas e hortaliças orgânicas.',
    'Av. Graciela Flores de Piteri, 294 – Jardim Aliança, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7552, -23.5472), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Jacarandá',
    'Parte do complexo Eixo Verde. Produção diversificada de verduras e legumes.',
    'Av. Graciela Flores de Piteri, 294 A – Jardim Aliança, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7555, -23.5475), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Mangueira',
    'Integrante do Eixo Verde. Foco em hortaliças e temperos frescos para a comunidade.',
    'Av. Graciela Flores de Piteri, 294 B – Jardim Aliança, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7558, -23.5478), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
),
(
    'Horta Flamboyant',
    'Última unidade do Eixo Verde. Produção orgânica com variedade de produtos sazonais.',
    'Av. Graciela Flores de Piteri, 294 C – Jardim Aliança, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7561, -23.5481), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h',
    true
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================

-- Contar total de hortas ativas
SELECT 
    'Total de hortas ativas' as info,
    COUNT(*) as quantidade 
FROM hortas 
WHERE ativo = true;

-- Listar todas as hortas por zona
SELECT 
    nome,
    endereco,
    CASE 
        WHEN endereco ILIKE '%Pestana%' OR endereco ILIKE '%Roberto%' OR endereco ILIKE '%Bussocaba%' 
             OR endereco ILIKE '%Vicentina%' OR endereco ILIKE '%Yolanda%' OR endereco ILIKE '%Vila Osasco%' THEN 'Zona Sul'
        WHEN endereco ILIKE '%Canaã%' OR endereco ILIKE '%Mutinga%' OR endereco ILIKE '%IAPI%' 
             OR endereco ILIKE '%Aliança%' THEN 'Zona Norte / Eixo Verde'
        ELSE 'Outras'
    END as zona
FROM hortas 
WHERE ativo = true
ORDER BY zona, nome;
