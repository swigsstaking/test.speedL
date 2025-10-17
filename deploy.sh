#!/bin/bash

# Script de déploiement complet - SWIGS CMS
# Corrige définitivement les problèmes de boucle de redirection

set -e

echo "🚀 Démarrage du déploiement..."
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Backend
echo -e "${BLUE}📦 Backend - Redémarrage...${NC}"
cd ~/websites/speed-l/backend
pm2 restart swigs-api
echo -e "${GREEN}✅ Backend redémarré${NC}"
echo ""

# 2. Admin Panel
echo -e "${BLUE}🎨 Admin Panel - Build...${NC}"
cd ~/websites/speed-l/admin

# Nettoyer complètement
echo "Nettoyage des anciens fichiers..."
rm -rf dist/ node_modules/.vite

# Build
echo "Build en cours..."
npm run build

# Déployer - NETTOYER COMPLÈTEMENT avant de copier
echo "Déploiement vers /var/www/admin..."
sudo rm -rf /var/www/admin/*
sudo cp -r dist/* /var/www/admin/
sudo chown -R www-data:www-data /var/www/admin

echo -e "${GREEN}✅ Admin déployé${NC}"
echo ""

# 3. Site Speed-L
echo -e "${BLUE}🌐 Site Speed-L - Build...${NC}"
cd ~/websites/speed-l

# Créer le .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "VITE_API_URL=/api" > .env
    echo "Fichier .env créé"
fi

# Nettoyer complètement
echo "Nettoyage des anciens fichiers..."
rm -rf dist/ node_modules/.vite

# Build
echo "Build en cours..."
npm run build

# Déployer - NETTOYER COMPLÈTEMENT avant de copier
echo "Déploiement vers /var/www/speed-l..."
sudo rm -rf /var/www/speed-l/*
sudo cp -r dist/* /var/www/speed-l/
sudo chown -R www-data:www-data /var/www/speed-l

echo -e "${GREEN}✅ Site Speed-L déployé${NC}"
echo ""

# 4. Nginx
echo -e "${BLUE}🔄 Nginx - Rechargement...${NC}"
sudo nginx -t && sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx rechargé${NC}"
echo ""

# 5. Vérifications
echo -e "${BLUE}🔍 Vérifications...${NC}"

# Backend
if pm2 list | grep -q "swigs-api.*online"; then
    echo -e "${GREEN}✅ Backend en ligne${NC}"
else
    echo -e "${RED}❌ Backend hors ligne${NC}"
fi

# Fichiers Admin
if [ -f /var/www/admin/index.html ]; then
    echo -e "${GREEN}✅ Admin déployé${NC}"
else
    echo -e "${RED}❌ Admin manquant${NC}"
fi

# Fichiers Site
if [ -f /var/www/speed-l/index.html ]; then
    echo -e "${GREEN}✅ Site déployé${NC}"
else
    echo -e "${RED}❌ Site manquant${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Déploiement terminé !${NC}"
echo ""
echo -e "${YELLOW}📋 Prochaines étapes :${NC}"
echo "1. Ouvrir http://192.168.110.73 (Site Speed-L)"
echo "2. Ouvrir http://admin.swigs.online (Admin Panel)"
echo "3. Vider le cache du navigateur (Cmd+Shift+R)"
echo ""
echo -e "${YELLOW}📝 Logs :${NC}"
echo "Backend: pm2 logs swigs-api"
echo "Nginx: sudo tail -f /var/log/nginx/error.log"
