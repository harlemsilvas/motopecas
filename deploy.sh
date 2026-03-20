#!/bin/bash
set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "=== Deploy MotoSpeed ==="
echo "$(date)"

cd "$APP_DIR"

# Atualizar codigo
git pull origin main

# Backend
echo ">> Instalando dependencias do backend..."
cd "$APP_DIR/backend"
npm install --production

# Frontend
echo ">> Build do frontend..."
cd "$APP_DIR/frontend"
npm install
npm run build

# Reiniciar backend
echo ">> Reiniciando backend..."
pm2 restart motopecas-api || pm2 start "$APP_DIR/ecosystem.config.js"

echo "=== Deploy concluido! ==="
