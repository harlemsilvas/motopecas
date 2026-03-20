# Deploy MotoSpeed na Hostinger via GitHub

## Visao Geral da Arquitetura de Deploy

```
                    Hostinger VPS
                    ┌─────────────────────────────────┐
                    │                                 │
  Visitante ──────► │  Nginx (porta 80/443)           │
                    │    │                            │
                    │    ├── /           → dist/      │ ◄── Frontend (arquivos estaticos)
                    │    ├── /admin      → backend/   │ ◄── Admin (arquivos estaticos)
                    │    ├── /api/*      → :5000      │ ◄── Proxy reverso para Node
                    │    └── /uploads/*  → :5000      │ ◄── Proxy reverso para Node
                    │                                 │
                    │  Node.js (porta 5000)           │
                    │    └── backend/server.js        │ ◄── PM2 gerencia o processo
                    │                                 │
                    │  MongoDB Atlas (externo)        │ ◄── Ja configurado
                    └─────────────────────────────────┘
```

## Pre-requisitos

1. **Plano Hostinger**: VPS (KVM) - necessario para rodar Node.js
   - Hospedagem compartilhada NAO suporta Node.js com Express
   - Minimo recomendado: VPS KVM 1 (1 vCPU, 4GB RAM)

2. **Dominio**: Configurado no painel Hostinger apontando para o IP do VPS

3. **MongoDB Atlas**: Ja configurado (cluster existente)

4. **GitHub**: Repositorio `harlemsilvas/motopecas` (ja configurado)

---

## Etapa 1: Preparar o VPS

### 1.1 Acessar o VPS via SSH

```bash
ssh root@SEU_IP_VPS
```

### 1.2 Atualizar sistema

```bash
apt update && apt upgrade -y
```

### 1.3 Instalar Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v  # Deve mostrar v20.x
npm -v
```

### 1.4 Instalar PM2 (gerenciador de processos)

```bash
npm install -g pm2
```

### 1.5 Instalar Nginx

```bash
apt install -y nginx
systemctl enable nginx
```

### 1.6 Instalar Git

```bash
apt install -y git
```

---

## Etapa 2: Clonar e Configurar o Projeto

### 2.1 Criar usuario para a aplicacao (seguranca)

```bash
adduser motopecas --disabled-password --gecos ""
usermod -aG sudo motopecas
su - motopecas
```

### 2.2 Clonar repositorio

```bash
cd /home/motopecas
git clone https://github.com/harlemsilvas/motopecas.git app
cd app
```

### 2.3 Instalar dependencias do backend

```bash
cd /home/motopecas/app/backend
npm install --production
```

### 2.4 Criar arquivo .env do backend

```bash
nano /home/motopecas/app/backend/.env
```

Conteudo:

```env
DATABASE_URL=mongodb+srv://harlemclaumann:SENHA@cluster0.69j3tzl.mongodb.net/motopecas
PORT=5000
NODE_ENV=production
```

> IMPORTANTE: Substitua SENHA pela senha real. NAO commite este arquivo.

### 2.5 Build do frontend

```bash
cd /home/motopecas/app/frontend
npm install
npm run build
```

Isso gera a pasta `frontend/dist/` com os arquivos estaticos.

### 2.6 Criar pasta de uploads (persistente)

```bash
mkdir -p /home/motopecas/app/backend/uploads/produtos
mkdir -p /home/motopecas/app/backend/uploads/categorias
```

---

## Etapa 3: Configurar PM2

### 3.1 Criar arquivo de configuracao PM2

```bash
nano /home/motopecas/app/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: "motopecas-api",
      cwd: "/home/motopecas/app/backend",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "/home/motopecas/logs/err.log",
      out_file: "/home/motopecas/logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      restart_delay: 5000,
      max_restarts: 10,
      watch: false,
    },
  ],
};
```

### 3.2 Criar pasta de logs

```bash
mkdir -p /home/motopecas/logs
```

### 3.3 Iniciar aplicacao

```bash
cd /home/motopecas/app
pm2 start ecosystem.config.js
pm2 save
```

### 3.4 Configurar PM2 para iniciar no boot

```bash
# Executar como root:
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u motopecas --hp /home/motopecas
```

### 3.5 Verificar status

```bash
pm2 status
pm2 logs motopecas-api
curl http://localhost:5000  # Deve retornar JSON
```

---

## Etapa 4: Configurar Nginx

### 4.1 Criar configuracao do site

```bash
sudo nano /etc/nginx/sites-available/motopecas
```

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    # Frontend (React build)
    root /home/motopecas/app/frontend/dist;
    index index.html;

    # SPA - todas as rotas do frontend vao para index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Admin (servido pelo backend, mas pode ser direto pelo Nginx)
    location /admin {
        alias /home/motopecas/app/backend/admin;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    # API - proxy reverso para Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }

    # Uploads - proxy para Node.js servir os arquivos
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4.2 Ativar o site

```bash
sudo ln -s /etc/nginx/sites-available/motopecas /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t          # Testar configuracao
sudo systemctl reload nginx
```

### 4.3 Verificar

```bash
curl http://seudominio.com        # Deve retornar HTML do React
curl http://seudominio.com/api/   # Deve retornar JSON da API
```

---

## Etapa 5: SSL com Let's Encrypt (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

Certbot configura automaticamente o redirect HTTP -> HTTPS.

### Renovacao automatica

```bash
sudo certbot renew --dry-run   # Testar renovacao
```

> Certbot ja cria um cron/timer para renovar automaticamente.

---

## Etapa 6: Deploy Automatico via GitHub (Webhook)

### Opcao A: Script manual de deploy

Criar script que sera executado apos `git pull`:

```bash
nano /home/motopecas/deploy.sh
```

```bash
#!/bin/bash
set -e

APP_DIR="/home/motopecas/app"
echo "=== Deploy MotoSpeed ==="
echo "$(date)"

cd $APP_DIR

# Atualizar codigo
git pull origin main

# Backend
echo ">> Instalando dependencias do backend..."
cd $APP_DIR/backend
npm install --production

# Frontend
echo ">> Build do frontend..."
cd $APP_DIR/frontend
npm install
npm run build

# Reiniciar backend
echo ">> Reiniciando backend..."
pm2 restart motopecas-api

echo "=== Deploy concluido! ==="
```

```bash
chmod +x /home/motopecas/deploy.sh
```

Para fazer deploy:

```bash
# No VPS:
/home/motopecas/deploy.sh
```

### Opcao B: Webhook automatico com GitHub Actions

Criar `.github/workflows/deploy.yml` no repositorio:

```yaml
name: Deploy to Hostinger VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: /home/motopecas/deploy.sh
```

**Configurar Secrets no GitHub** (Settings > Secrets and variables > Actions):

| Secret      | Valor                                         |
| ----------- | --------------------------------------------- |
| VPS_HOST    | IP do seu VPS Hostinger                       |
| VPS_USER    | motopecas                                     |
| VPS_SSH_KEY | Conteudo da chave SSH privada (~/.ssh/id_rsa) |

### Gerar chave SSH (no VPS):

```bash
su - motopecas
ssh-keygen -t ed25519 -C "deploy-motopecas" -f ~/.ssh/id_deploy -N ""
cat ~/.ssh/id_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Copiar a chave privada para o GitHub Secret:
cat ~/.ssh/id_deploy
```

---

## Etapa 7: Ajustes de Producao

### 7.1 Atualizar CSP do Helmet

Em `backend/server.js`, em producao o `connectSrc` precisa permitir o dominio:

```javascript
connectSrc: ["'self'", "https://seudominio.com"],
```

### 7.2 CORS em producao

Se frontend e backend estiverem no mesmo dominio (via Nginx proxy), CORS nao e necessario. Caso contrario, configurar dominio especifico:

```javascript
app.use(cors({ origin: "https://seudominio.com" }));
```

### 7.3 Frontend VITE_API_URL

Como Nginx faz proxy de `/api` e `/uploads` no mesmo dominio, **NAO precisa** de `VITE_API_URL`. O fallback `""` ja funciona.

### 7.4 Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

> Porta 5000 NAO deve ficar aberta ao publico (Nginx faz o proxy).

### 7.5 MongoDB Atlas - Whitelist IP

No painel Atlas, adicionar o IP do VPS na Network Access.

---

## Checklist de Deploy

- [ ] VPS criado e acessivel via SSH
- [ ] Node.js 20 instalado
- [ ] PM2 instalado e configurado para boot
- [ ] Nginx instalado e configurado
- [ ] Repositorio clonado em `/home/motopecas/app`
- [ ] `backend/.env` configurado com DATABASE_URL de producao
- [ ] `npm install` no backend (--production)
- [ ] `npm run build` no frontend
- [ ] PM2 rodando `motopecas-api`
- [ ] Nginx proxy reverso `/api` e `/uploads` -> porta 5000
- [ ] SSL/HTTPS com Let's Encrypt
- [ ] Firewall (ufw) configurado
- [ ] IP do VPS na whitelist do MongoDB Atlas
- [ ] GitHub Actions configurado para deploy automatico
- [ ] Pasta /uploads com permissoes corretas
- [ ] Testar: site, admin, API, upload de imagem

---

## Comandos Uteis no VPS

```bash
# Status da aplicacao
pm2 status
pm2 logs motopecas-api --lines 50

# Reiniciar
pm2 restart motopecas-api

# Deploy manual
/home/motopecas/deploy.sh

# Nginx
sudo nginx -t
sudo systemctl reload nginx

# SSL
sudo certbot renew --dry-run

# Espaco em disco
df -h
du -sh /home/motopecas/app/backend/uploads/

# Logs do Nginx
tail -f /var/log/nginx/error.log
```
