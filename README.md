# 🌱 Plantae - Hortas Comunitárias de Osasco

API REST para gerenciamento de hortas comunitárias da região de Osasco (SP).

## 🚀 Tecnologias

- **Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL + PostGIS (geolocalização)
- **Cache**: Redis
- **Autenticação**: JWT + Refresh Tokens
- **Validação**: Joi
- **Containerização**: Docker

## ✨ Funcionalidades

- ✅ Sistema de autenticação (JWT)
- ✅ CRUD de usuários (comum, gerenciador, admin)
- ✅ CRUD de hortas com geolocalização
- ✅ Busca de hortas próximas (raio em metros)
- ✅ CRUD de produtos/estoque
- ✅ Controle de permissões por tipo de usuário

## 📦 Como rodar

### Pré-requisitos

- Node.js 18+
- Docker Desktop

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/R4f0so/plantae.git
cd plantae
```

2. Suba os containers (PostgreSQL + Redis)
```bash
docker-compose up -d
```

3. Instale as dependências do backend
```bash
cd backend
npm install
```

4. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

5. Rode o servidor
```bash
npm run dev
```

## 📝 Licença

MIT

## 👨‍💻 Autor

Rafael Ferreira Martins