#!/bin/bash

# Script de nettoyage et déploiement COMPLET - SWIGS CMS
# Supprime toutes les anciennes versions et redéploie proprement

set -e

echo "🧹 NETTOYAGE ET DÉPLOIEMENT COMPLET"
echo "===================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Confirmation
echo -e "${YELLOW}⚠️  ATTENTION : Ce script va :${NC}"
echo "  - Arrêter tous les processus Node.js et PM2"
echo "  - Supprimer tous les anciens builds"
echo "  - Nettoyer les dossiers /var/www"
echo "  - Rebuilder et redéployer tout"
echo ""
read -p "Êtes-vous sûr de vouloir continuer ? (oui/non) : " confirm

if [ "$confirm" != "oui" ]; then
    echo "Annulé."
    exit 0
fi

echo ""
echo -e "${BLUE}🛑 Étape 1/7 : Arrêt des processus...${NC}"

# Arrêter PM2
pm2 stop all || true
pm2 delete all || true

# Tuer tous les processus Node.js qui pourraient tourner
sudo pkill -f "node" || true
sudo pkill -f "vite" || true

# Libérer les ports
sudo fuser -k 3000/tcp || true
sudo fuser -k 5173/tcp || true
sudo fuser -k 5174/tcp || true

echo -e "${GREEN}✅ Processus arrêtés${NC}"
echo ""

echo -e "${BLUE}🗑️  Étape 2/7 : Nettoyage des anciens builds...${NC}"

cd ~/websites/speed-l

# Nettoyer le backend
cd backend
rm -rf node_modules/.cache
rm -rf uploads/*
echo "Backend nettoyé"

# Nettoyer l'admin
cd ../admin
rm -rf dist/
rm -rf node_modules/.vite
rm -rf node_modules/.cache
echo "Admin nettoyé"

# Nettoyer le site
cd ..
rm -rf dist/
rm -rf node_modules/.vite
rm -rf node_modules/.cache
echo "Site nettoyé"

echo -e "${GREEN}✅ Anciens builds supprimés${NC}"
echo ""

echo -e "${BLUE}🗑️  Étape 3/7 : Nettoyage des dossiers web...${NC}"

# Nettoyer complètement /var/www
sudo rm -rf /var/www/admin/*
sudo rm -rf /var/www/speed-l/*

echo -e "${GREEN}✅ Dossiers web nettoyés${NC}"
echo ""

echo -e "${BLUE}⚙️  Étape 4/7 : Configuration du backend...${NC}"

cd ~/websites/speed-l/backend

# Créer le .env s'il n'existe pas
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Fichier .env créé - PENSEZ À LE CONFIGURER !"
fi

# Créer le dossier uploads
mkdir -p uploads

echo -e "${GREEN}✅ Backend configuré${NC}"
echo ""

echo -e "${BLUE}🔨 Étape 5/7 : Build de l'admin...${NC}"

cd ~/websites/speed-l/admin

# Créer le .env
echo "VITE_API_URL=/api" > .env

# Build
npm run build

# Déployer
sudo cp -r dist/* /var/www/admin/
sudo chown -R www-data:www-data /var/www/admin

echo -e "${GREEN}✅ Admin buildé et déployé${NC}"
echo ""

echo -e "${BLUE}🔨 Étape 6/7 : Build du site Speed-L...${NC}"

cd ~/websites/speed-l

# Créer le .env
echo "VITE_API_URL=/api" > .env

# Build
npm run build

# Déployer
sudo cp -r dist/* /var/www/speed-l/
sudo chown -R www-data:www-data /var/www/speed-l

echo -e "${GREEN}✅ Site buildé et déployé${NC}"
echo ""

echo -e "${BLUE}🚀 Étape 7/7 : Démarrage des services...${NC}"

# Démarrer le backend avec PM2
cd ~/websites/speed-l/backend
pm2 start server.js --name swigs-api
pm2 save
pm2 startup

# Recharger Nginx
sudo nginx -t && sudo systemctl reload nginx

echo -e "${GREEN}✅ Services démarrés${NC}"
echo ""

echo -e "${GREEN}🎉 DÉPLOIEMENT TERMINÉ !${NC}"
echo ""
echo -e "${YELLOW}📋 Vérifications :${NC}"
echo ""

# Vérifier PM2
if pm2 list | grep -q "swigs-api.*online"; then
    echo -e "${GREEN}✅ Backend en ligne${NC}"
else
    echo -e "${RED}❌ Backend hors ligne${NC}"
fi

# Vérifier les fichiers
if [ -f /var/www/admin/index.html ]; then
    echo -e "${GREEN}✅ Admin déployé${NC}"
else
    echo -e "${RED}❌ Admin manquant${NC}"
fi

if [ -f /var/www/speed-l/index.html ]; then
    echo -e "${GREEN}✅ Site déployé${NC}"
else
    echo -e "${RED}❌ Site manquant${NC}"
fi

# Vérifier Nginx
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx actif${NC}"
else
    echo -e "${RED}❌ Nginx inactif${NC}"
fi

echo ""
echo -e "${YELLOW}🌐 URLs d'accès :${NC}"
echo "  Site : http://swigs.online"
echo "  Admin : http://admin.swigs.online"
echo ""
echo -e "${YELLOW}📝 Commandes utiles :${NC}"
echo "  Logs backend : pm2 logs swigs-api"
echo "  Logs Nginx : sudo tail -f /var/log/nginx/error.log"
echo "  Redémarrer backend : pm2 restart swigs-api"
echo "  Recharger Nginx : sudo systemctl reload nginx"
echo ""
echo -e "${YELLOW}🔒 IMPORTANT :${NC}"
echo "  1. Configurez le fichier backend/.env avec vos vraies valeurs"
echo "  2. Changez JWT_SECRET en production"
echo "  3. Installez SSL avec : sudo certbot --nginx -d swigs.online -d www.swigs.online -d admin.swigs.online"
echo ""
