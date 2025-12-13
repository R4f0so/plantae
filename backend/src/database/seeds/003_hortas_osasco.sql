-- Limpar hortas antigas (se necessário)
-- DELETE FROM produtos WHERE horta_id IN (SELECT id FROM hortas);
-- DELETE FROM hortas;

-- Inserir as 16 hortas urbanas reais de Osasco
-- Coordenadas aproximadas baseadas nos endereços

INSERT INTO hortas (nome, descricao, endereco, localizacao, gerenciador_id, horario_funcionamento) VALUES
(
    'Horta Alimentos',
    'Produção de alimentos orgânicos frescos. Produtos livres de agrotóxicos com preços acessíveis.',
    'Avenida Pedro Pinho, 1.340 – Jardim Pestana, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7826, -23.5321), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h'
),
(
    'Horta Estufa',
    'Cultivo em estufa com controle de ambiente. Verduras e legumes frescos diariamente.',
    'Rua Nossa Senhora do Rosário, 506 – Km 18, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7512, -23.5178), 4326)::geography,
    2,
    'Segunda a Sábado: 7h às 16h'
),
(
    'Horta Maná',
    'Horta comunitária gerida por agricultores locais. Produção orgânica e sustentável.',
    'Rua Antônio Russo, 657 – Jardim Roberto, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7945, -23.5412), 4326)::geography,
    3,
    'Terça a Sábado: 8h às 17h'
),
(
    'Horta Chico Mendes',
    'Homenagem ao ambientalista. Foco em agricultura familiar e economia solidária.',
    'Rua Lázaro Suave, 15 – City Bussocaba, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7632, -23.5234), 4326)::geography,
    2,
    'Segunda a Sexta: 7h às 16h'
),
(
    'Horta Vicentina',
    'Horta comunitária do Jardim Vicentina. Integra o Programa Economia Solidária.',
    'Rua Arlindo João Salgado, 2 – Jardim Vicentina, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7889, -23.5534), 4326)::geography,
    3,
    'Segunda a Sexta: 8h às 17h'
),
(
    'Horta Audax I',
    'Primeira unidade da Horta Audax. Produção diversificada de hortaliças.',
    'Rua Magnólia, 37 – Vila Yolanda, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7723, -23.5289), 4326)::geography,
    2,
    'Segunda a Sábado: 7h às 17h'
),
(
    'Horta Audax II',
    'Segunda unidade da Horta Audax. Especializada em verduras folhosas.',
    'Rua Acácia, 475 – Vila Yolanda, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7734, -23.5298), 4326)::geography,
    2,
    'Segunda a Sábado: 7h às 17h'
),
(
    'Horta Cantinho Verde',
    'Espaço verde comunitário. Produção de temperos e ervas aromáticas.',
    'Rua Calixto Barbieri, 1 – Canaã, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7612, -23.5445), 4326)::geography,
    3,
    'Terça a Sexta: 8h às 16h'
),
(
    'Horta CAPS',
    'Horta terapêutica do Centro de Atenção Psicossocial. Cultivo inclusivo.',
    'Rua Anhanguera, 348 – Jardim Piratininga, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7856, -23.5267), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h'
),
(
    'Horta Simpatia',
    'Horta comunitária acolhedora. Foco em legumes e raízes.',
    'Rua Rubi, 17 – Mutinga, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7978, -23.5356), 4326)::geography,
    3,
    'Segunda a Sábado: 7h às 17h'
),
(
    'Horta Modelo',
    'Horta referência em agricultura urbana. Recebe visitas escolares.',
    'Avenida João Del Papa, 580 – IAPI, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7801, -23.5401), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 17h'
),
(
    'Horta Cheirinho Verde',
    'Especializada em ervas aromáticas e temperos frescos.',
    'Rua Fortunato Pulherini, 81 – Mutinga, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7989, -23.5378), 4326)::geography,
    3,
    'Terça a Sábado: 8h às 16h'
),
(
    'Horta Passaredo I',
    'Primeira unidade Passaredo. Produção diversificada.',
    'Avenida Passaredo, 13 A – Jardim Aliança, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7567, -23.5489), 4326)::geography,
    2,
    'Segunda a Sexta: 7h às 17h'
),
(
    'Horta Passaredo II',
    'Segunda unidade Passaredo. Foco em hortaliças folhosas.',
    'Avenida Passaredo, 13 B – Jardim Aliança, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7572, -23.5493), 4326)::geography,
    2,
    'Segunda a Sexta: 7h às 17h'
),
(
    'Horta Morada dos Sonhos',
    'Horta comunitária inspiradora. Produção orgânica certificada.',
    'Rua Morada dos Sonhos, em frente 63 – Jardim Vicentina, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7895, -23.5545), 4326)::geography,
    3,
    'Segunda a Sábado: 8h às 17h'
),
(
    'Horta Nova Vida',
    'Projeto de ressocialização através da agricultura urbana.',
    'Rua Calixto Barbieri, 129 – IAPI, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7618, -23.5451), 4326)::geography,
    2,
    'Segunda a Sexta: 8h às 16h'
)
ON CONFLICT DO NOTHING;

-- Verificar hortas inseridas
SELECT COUNT(*) as total_hortas FROM hortas WHERE ativo = true;