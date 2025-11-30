-- Dados de exemplo para testes
-- ATENÇÃO: Usar apenas em ambiente de desenvolvimento!

-- Inserir usuários de exemplo
-- Senha para todos: "senha123" (hash bcrypt)
INSERT INTO usuarios (nome, email, senha_hash, tipo, telefone) VALUES
('Admin Sistema', 'admin@plantae.com', '$2a$10$rOyqUj7AqK5LZ3kY5YxGPOKpZ7qXmH9Z8Y6BvZ9xqN5yJKHOZyYWe', 'admin', '(11) 98765-4321'),
('João Silva', 'joao@plantae.com', '$2a$10$rOyqUj7AqK5LZ3kY5YxGPOKpZ7qXmH9Z8Y6BvZ9xqN5yJKHOZyYWe', 'gerenciador', '(11) 98765-1234'),
('Maria Santos', 'maria@plantae.com', '$2a$10$rOyqUj7AqK5LZ3kY5YxGPOKpZ7qXmH9Z8Y6BvZ9xqN5yJKHOZyYWe', 'gerenciador', '(11) 98765-5678'),
('Carlos Oliveira', 'carlos@plantae.com', '$2a$10$rOyqUj7AqK5LZ3kY5YxGPOKpZ7qXmH9Z8Y6BvZ9xqN5yJKHOZyYWe', 'comum', '(11) 98765-9876')
ON CONFLICT (email) DO NOTHING;

-- Inserir hortas de exemplo em Osasco
-- Coordenadas reais de Osasco/SP
INSERT INTO hortas (nome, descricao, endereco, localizacao, gerenciador_id, horario_funcionamento) VALUES
(
    'Horta Comunitária Central',
    'Horta comunitária no centro de Osasco, com diversas opções de verduras e legumes frescos.',
    'Rua Antonio Agu, 255 - Centro, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7918, -23.5329), 4326)::geography,
    2,
    'Segunda a Sábado: 7h às 18h'
),
(
    'Horta do Jardim das Flores',
    'Horta familiar gerida pela comunidade local, especializada em ervas aromáticas.',
    'Avenida dos Autonomistas, 1000 - Jardim das Flores, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7856, -23.5412), 4326)::geography,
    3,
    'Terça a Domingo: 8h às 17h'
),
(
    'Horta Orgânica Bela Vista',
    'Produção 100% orgânica de hortaliças e frutas da estação.',
    'Rua Narciso Sturlini, 500 - Bela Vista, Osasco - SP',
    ST_SetSRID(ST_MakePoint(-46.7724, -23.5289), 4326)::geography,
    2,
    'Segunda a Sexta: 6h às 16h'
)
ON CONFLICT DO NOTHING;

-- Inserir produtos de exemplo
INSERT INTO produtos (horta_id, nome, descricao, categoria, preco, unidade, estoque) VALUES
-- Horta Central
(1, 'Alface Crespa', 'Alface fresca e crocante', 'verdura', 3.50, 'unidade', 50),
(1, 'Tomate Cereja', 'Tomates pequenos e doces', 'fruta', 8.00, 'kg', 30),
(1, 'Cenoura', 'Cenouras orgânicas', 'legume', 5.00, 'kg', 25),
(1, 'Rúcula', 'Rúcula fresca', 'verdura', 4.00, 'maço', 40),

-- Horta Jardim das Flores
(2, 'Manjericão', 'Manjericão fresco para tempero', 'erva', 3.00, 'maço', 60),
(2, 'Hortelã', 'Hortelã para chás e sucos', 'erva', 2.50, 'maço', 45),
(2, 'Alecrim', 'Alecrim aromático', 'erva', 3.50, 'maço', 35),
(2, 'Pimentão', 'Pimentão verde', 'legume', 6.00, 'kg', 20),

-- Horta Bela Vista
(3, 'Couve', 'Couve manteiga orgânica', 'verdura', 3.00, 'maço', 70),
(3, 'Espinafre', 'Espinafre fresco', 'verdura', 5.50, 'maço', 40),
(3, 'Abóbora', 'Abóbora cabotiá', 'legume', 4.50, 'kg', 15),
(3, 'Limão', 'Limão tahiti', 'fruta', 7.00, 'kg', 25)
ON CONFLICT DO NOTHING;

-- Verificar inserções
SELECT 'Usuários cadastrados:' as info, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'Hortas cadastradas:', COUNT(*) FROM hortas
UNION ALL
SELECT 'Produtos cadastrados:', COUNT(*) FROM produtos;