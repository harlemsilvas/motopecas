# Deploy MotoSpeed na Hostinger via GitHub

## Visao Geral da Arquitetura de Deploy

```
                    Hostinger VPS (hrmmotos.com.br)
                    ┌────────────────────────────────────────┐
                    │                                        │
  Visitante ──────► │  Nginx (porta 80/443)                  │
                    │    │                                   │
                    │    ├── /motopecas/        → dist/      │ ◄── Frontend SPA (Vite)
                    │    ├── /motopecas/admin/  → backend/   │ ◄── Admin (arquivos estaticos)
                    │    ├── /motopecas/api/*   → :5000      │ ◄── Proxy reverso para Node
                    │    ├── /motopecas/uploads → uploads/   │ ◄── Servido direto pelo Nginx
                    │    └── /restaurante/...   → :3001      │ ◄── Outros apps no mesmo VPS
                    │                                        │
                    │  Node.js (porta 5000)                  │
                    │    └── backend/server.js               │ ◄── PM2 gerencia o processo
                    │                                        │
                    │  MongoDB Atlas (externo)               │ ◄── Ja configurado
                    └────────────────────────────────────────┘
```

> **Nota**: O motopecas roda sob o subpath `/motopecas/` no dominio
> compartilhado hrmmotos.com.br, junto com outros apps (restaurante, etc).

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

## Etapa 4: Configurar Nginx (subpath no dominio compartilhado)

O motopecas compartilha o dominio hrmmotos.com.br com outros apps.
A configuracao completa esta no arquivo `hrmmotos` na raiz do projeto.

### 4.1 Copiar a configuracao atualizada

```bash
# Como root ou com sudo:
sudo cp /home/motopecas/app/hrmmotos /etc/nginx/sites-available/hrmmotos
sudo ln -sf /etc/nginx/sites-available/hrmmotos /etc/nginx/sites-enabled/hrmmotos
```

### 4.2 Testar e recarregar

```bash
sudo nginx -t          # Testar configuracao
sudo systemctl reload nginx
```

### 4.3 Blocos adicionados para motopecas

O arquivo `hrmmotos` inclui os seguintes locations (em HTTP e HTTPS):

| Location                    | Destino                                     |
| --------------------------- | ------------------------------------------- |
| `/motopecas/`               | Frontend SPA (frontend/dist/) com try_files |
| `/motopecas/admin/`         | Admin panel (backend/admin/)                |
| `/motopecas/api/`           | Proxy → :5000 (strip /motopecas prefix)     |
| `/motopecas/uploads/`       | Serve direto do filesystem (sem proxy)      |
| `/motopecas/sem-imagem.png` | Imagem fallback (backend/public/)           |

### 4.4 Verificar

```bash
curl https://hrmmotos.com.br/motopecas/         # Frontend HTML
curl https://hrmmotos.com.br/motopecas/api/config  # API JSON
curl https://hrmmotos.com.br/motopecas/admin/    # Admin HTML
```

---

## Etapa 5: SSL com Let's Encrypt (HTTPS)

> SSL ja esta configurado no VPS para hrmmotos.com.br.
> O arquivo `hrmmotos` ja inclui o bloco HTTPS (porta 443) com os
> certificados Let's Encrypt existentes. Nao e necessario gerar novos.

### Renovacao automatica

```bash
sudo certbot renew --dry-run   # Testar renovacao
```

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
echo "=== Deploy HRMMotos ==="
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

### 7.1 CSP do Helmet (connectSrc)

O `connectSrc: ["'self'"]` em `backend/server.js` ja funciona corretamente
porque Nginx faz proxy no mesmo dominio. NAO precisa alterar.

Caso futuramente o frontend e API fiquem em dominios diferentes, seria
necessario adicionar o dominio externo:

```javascript
connectSrc: ["'self'", "https://outro-dominio.com"],
```

### 7.2 CORS em producao

Como frontend e backend estao no mesmo dominio (via Nginx proxy com subpath), CORS nao e necessario.

### 7.3 Frontend - Subpath (ja configurado)

O `vite.config.js` usa `base: '/motopecas/'` automaticamente no build.
O arquivo `frontend/.env.production` define `VITE_API_URL=/motopecas`
para que chamadas API incluam o prefixo do subpath.

O admin detecta o subpath automaticamente via `window.location.pathname`
no `menu.js` (ex: `/motopecas/admin/` → `API_URL = "/motopecas"`).

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
- [ ] Nginx com arquivo `hrmmotos` (blocos motopecas incluidos)
- [ ] Repositorio clonado em `/home/motopecas/app`
- [ ] `backend/.env` configurado com DATABASE_URL de producao
- [ ] `npm install` no backend (--production)
- [ ] `npm run build` no frontend (gera dist/ com base /motopecas/)
- [ ] PM2 rodando `motopecas-api` na porta 5000
- [ ] Nginx reload apos copiar hrmmotos
- [ ] SSL/HTTPS ja configurado (Let's Encrypt)
- [ ] Firewall (ufw) configurado (22, 80, 443)
- [ ] IP do VPS na whitelist do MongoDB Atlas
- [ ] Pasta /uploads com permissoes corretas
- [ ] Testar: hrmmotos.com.br/motopecas/ (frontend)
- [ ] Testar: hrmmotos.com.br/motopecas/admin/ (admin)
- [ ] Testar: hrmmotos.com.br/motopecas/api/config (API)
- [ ] Testar: upload de imagem via admin

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
