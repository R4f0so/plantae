# 🚀 Deploy Gratuito - Plantae Backend

Este guia explica como fazer deploy gratuito do backend usando **Render + Neon + Upstash**.

## 📋 Passo a Passo

### 1️⃣ Criar Banco PostgreSQL no Neon (5 min)

1. Acesse [neon.tech](https://neon.tech) e crie uma conta (pode usar GitHub)
2. Clique em **"Create a project"**
3. Escolha:
   - **Project name:** `plantae`
   - **Database name:** `plantae_db`
   - **Region:** Escolha a mais próxima (São Paulo não tem, use `US East`)
4. Após criar, vá em **Dashboard** → **Connection Details**
5. Copie a **Connection string** (começa com `postgresql://`)
6. **IMPORTANTE:** Guarde essa string, você vai usar no Render

### 2️⃣ Criar Redis no Upstash (3 min)

1. Acesse [upstash.com](https://upstash.com) e crie uma conta
2. Clique em **"Create Database"**
3. Escolha:
   - **Name:** `plantae-redis`
   - **Type:** `Regional`
   - **Region:** `US-East-1` (ou mais próxima)
4. Após criar, vá em **Details**
5. Copie a **Redis URL** (começa com `rediss://`)

### 3️⃣ Subir Código no GitHub (se ainda não fez)

```bash
# Na pasta do projeto
cd backend
git init
git add .
git commit -m "Preparado para deploy"
git remote add origin https://github.com/SEU_USUARIO/plantae-backend.git
git push -u origin main
```

### 4️⃣ Deploy no Render (10 min)

1. Acesse [render.com](https://render.com) e crie uma conta (use GitHub)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Configure:
   - **Name:** `plantae-backend`
   - **Region:** `Oregon (US West)` ou `Ohio (US East)`
   - **Branch:** `main`
   - **Root Directory:** `backend` (se o backend estiver em subpasta)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

5. Em **Environment Variables**, adicione:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | (cole a string do Neon) |
| `REDIS_URL` | (cole a URL do Upstash) |
| `JWT_SECRET` | (crie uma senha forte de 32+ caracteres) |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | `*` |

6. Clique em **"Create Web Service"**
7. Aguarde o deploy (5-10 minutos na primeira vez)

### 5️⃣ Migrar o Banco de Dados

Após o deploy, você precisa criar as tabelas. No Neon:

1. Vá no dashboard do Neon → **SQL Editor**
2. Cole e execute o conteúdo do arquivo `src/database/migrations/neon_migration.sql`
   - ⚠️ **IMPORTANTE:** Use `neon_migration.sql` e NÃO o `001_create_tables.sql`! 
   - O Neon não suporta PostGIS no tier gratuito
   - O arquivo especial usa colunas `latitude`/`longitude` separadas
3. (Opcional) Execute também os seeds para dados iniciais

### 6️⃣ Atualizar Frontend

Após o deploy, o Render vai gerar uma URL tipo:
`https://plantae-backend.onrender.com`

Atualize o arquivo `frontend/src/services/api.js`:

```javascript
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api'; // Desenvolvimento web
  }
  
  // Produção - Render
  return 'https://plantae-backend.onrender.com/api';
};
```

---

## ⚠️ Limitações do Tier Gratuito

| Serviço | Limitação |
|---------|-----------|
| **Render** | Dorme após 15min sem uso. Primeira request demora ~30s para acordar |
| **Neon** | 0.5 GB de storage. Sem limite de conexões |
| **Upstash** | 10.000 requests/dia |

### Dica: Evitar "sleep" do Render

O serviço gratuito do Render dorme após 15 minutos sem requests. Para evitar isso em produção, você pode usar um serviço de "ping" gratuito como [UptimeRobot](https://uptimerobot.com) para fazer uma request a cada 14 minutos.

---

## 🔄 Workflow de Desenvolvimento

Após configurar:

1. **Desenvolvimento local:** Continue usando Docker (PostgreSQL + Redis locais)
2. **Teste no celular:** Use a URL do Render
3. **Deploy:** Faça push para o GitHub, Render atualiza automaticamente

```bash
# Fazer alterações e deploy
git add .
git commit -m "Nova feature"
git push origin main
# Render detecta e faz deploy automático!
```

---

## 🐛 Troubleshooting

### Erro de conexão com banco
- Verifique se a `DATABASE_URL` está correta
- No Neon, verifique se o IP do Render está permitido (por padrão permite todos)

### Erro de conexão com Redis
- Verifique se a `REDIS_URL` está correta
- Upstash usa `rediss://` (com dois 's' para SSL)

### Backend não acorda
- O tier gratuito do Render demora ~30s para acordar
- Aguarde ou configure UptimeRobot

### Erro de CORS
- Verifique se `CORS_ORIGIN` está configurado corretamente
- Para desenvolvimento, use `*`
