-- ============================================
-- PLANTAE - Seed Data para Neon (sem PostGIS)
-- ============================================
-- Execute após neon_migration.sql

-- Usuários de exemplo
-- Senhas: senha123 (hash bcrypt)
INSERT INTO usuarios (nome, email, senha_hash, tipo, telefone) VALUES
('Carlos Silva', 'carlos@example.com', '$2b$10$WiPV7icA1xZm0Or7GVirfeN6cMrHfzqTJe.rty9VEYBlf2kGFWfTS', 'admin', '(11) 99999-0001'),
('Maria Santos', 'maria@example.com', '$2b$10$WiPV7icA1xZm0Or7GVirfeN6cMrHfzqTJe.rty9VEYBlf2kGFWfTS', 'gerenciador', '(11) 99999-0002'),
('João Oliveira', 'joao@example.com', '$2b$10$WiPV7icA1xZm0Or7GVirfeN6cMrHfzqTJe.rty9VEYBlf2kGFWfTS', 'gerenciador', '(11) 99999-0003'),
('Ana Costa', 'ana@example.com', '$2b$10$WiPV7icA1xZm0Or7GVirfeN6cMrHfzqTJe.rty9VEYBlf2kGFWfTS', 'comum', '(11) 99999-0004')
ON CONFLICT (email) DO NOTHING;

-- Hortas de exemplo (região de São Paulo)
INSERT INTO hortas (nome, descricao, endereco, latitude, longitude, gerenciador_id, horario_funcionamento) VALUES
('Horta Comunitária Vila Madalena', 'Horta urbana com grande variedade de vegetais orgânicos', 'Rua Harmonia, 123 - Vila Madalena, São Paulo', -23.5534, -46.6897, 2, 'Seg-Sex: 7h-18h, Sáb: 7h-12h'),
('Horta do Parque Ibirapuera', 'Horta educativa aberta à comunidade', 'Av. Pedro Álvares Cabral, s/n - Ibirapuera, São Paulo', -23.5874, -46.6576, 2, 'Ter-Dom: 8h-17h'),
('Horta Comunitária Pinheiros', 'Produção de hortaliças e ervas medicinais', 'Rua dos Pinheiros, 456 - Pinheiros, São Paulo', -23.5679, -46.6903, 3, 'Seg-Sáb: 6h-16h'),
('Horta Urbana Mooca', 'Horta comunitária tradicional do bairro', 'Rua da Mooca, 789 - Mooca, São Paulo', -23.5599, -46.5986, 3, 'Todos os dias: 6h-18h'),
('Horta Escola Butantã', 'Horta pedagógica com foco em educação ambiental', 'Av. Prof. Lineu Prestes, 1234 - Butantã, São Paulo', -23.5688, -46.7254, 2, 'Seg-Sex: 8h-17h')
ON CONFLICT DO NOTHING;

-- Produtos de exemplo
INSERT INTO produtos (horta_id, nome, descricao, categoria, preco, unidade, estoque, disponivel) VALUES
-- Horta Vila Madalena (id=1)
(1, 'Alface Crespa', 'Alface fresca orgânica', 'verdura', 4.50, 'unidade', 50, true),
(1, 'Tomate Cereja', 'Tomates cereja doces', 'legume', 12.00, 'kg', 20, true),
(1, 'Manjericão', 'Manjericão fresco', 'erva', 3.00, 'maço', 30, true),
(1, 'Cenoura', 'Cenouras orgânicas', 'legume', 8.00, 'kg', 25, true),

-- Horta Ibirapuera (id=2)
(2, 'Couve', 'Couve manteiga orgânica', 'verdura', 3.50, 'maço', 40, true),
(2, 'Beterraba', 'Beterrabas frescas', 'legume', 7.00, 'kg', 15, true),
(2, 'Hortelã', 'Hortelã aromática', 'erva', 2.50, 'maço', 25, true),

-- Horta Pinheiros (id=3)
(3, 'Rúcula', 'Rúcula fresca e saborosa', 'verdura', 4.00, 'maço', 35, true),
(3, 'Pimentão', 'Pimentões coloridos', 'legume', 10.00, 'kg', 18, true),
(3, 'Alecrim', 'Alecrim fresco', 'erva', 3.50, 'maço', 20, true),

-- Horta Mooca (id=4)
(4, 'Espinafre', 'Espinafre baby', 'verdura', 5.00, 'maço', 28, true),
(4, 'Abobrinha', 'Abobrinhas italianas', 'legume', 9.00, 'kg', 22, true),
(4, 'Salsinha', 'Salsinha fresca', 'erva', 2.00, 'maço', 45, true),

-- Horta Butantã (id=5)
(5, 'Agrião', 'Agrião hidropônico', 'verdura', 4.00, 'maço', 32, true),
(5, 'Pepino', 'Pepinos frescos', 'legume', 6.00, 'kg', 30, true),
(5, 'Cebolinha', 'Cebolinha verde', 'erva', 2.50, 'maço', 40, true)
ON CONFLICT DO NOTHING;

-- Horários de funcionamento detalhados
INSERT INTO horarios_funcionamento (horta_id, dia_semana, hora_abertura, hora_fechamento) VALUES
-- Horta Vila Madalena (Seg-Sex: 7h-18h, Sáb: 7h-12h)
(1, 1, '07:00', '18:00'), -- Segunda
(1, 2, '07:00', '18:00'), -- Terça
(1, 3, '07:00', '18:00'), -- Quarta
(1, 4, '07:00', '18:00'), -- Quinta
(1, 5, '07:00', '18:00'), -- Sexta
(1, 6, '07:00', '12:00'), -- Sábado

-- Horta Ibirapuera (Ter-Dom: 8h-17h)
(2, 2, '08:00', '17:00'), -- Terça
(2, 3, '08:00', '17:00'), -- Quarta
(2, 4, '08:00', '17:00'), -- Quinta
(2, 5, '08:00', '17:00'), -- Sexta
(2, 6, '08:00', '17:00'), -- Sábado
(2, 0, '08:00', '17:00'), -- Domingo

-- Horta Pinheiros (Seg-Sáb: 6h-16h)
(3, 1, '06:00', '16:00'),
(3, 2, '06:00', '16:00'),
(3, 3, '06:00', '16:00'),
(3, 4, '06:00', '16:00'),
(3, 5, '06:00', '16:00'),
(3, 6, '06:00', '16:00')
ON CONFLICT DO NOTHING;
