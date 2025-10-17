#!/bin/bash

# 🚀 Script de déploiement SWIGS CMS
# À exécuter sur le serveur Ubuntu

set -e  # Arrêter en cas d'erreur

echo "🚀 Démarrage du déploiement SWIGS CMS..."
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Mise à jour du code
echo -e "${BLUE}📦 Mise à jour du code depuis GitHub...${NC}"
cd ~/swigs-cms
git pull origin main
echo -e "${GREEN}✅ Code mis à jour${NC}"
echo ""

# 2. Backend
echo -e "${BLUE}🔧 Configuration du Backend...${NC}"
cd ~/swigs-cms/backend

# Installer les dépendances
echo "Installation des dépendances backend..."
npm install

# Vérifier MongoDB
echo "Vérification de MongoDB..."
if ! systemctl is-active --quiet mongod; then
    echo -e "${RED}MongoDB n'est pas démarré. Démarrage...${NC}"
    sudo systemctl start mongod
fi
echo -e "${GREEN}✅ MongoDB actif${NC}"

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo -e "${RED}⚠️  Fichier .env manquant !${NC}"
    echo "Copiez .env.example vers .env et configurez-le"
    exit 1
fi

# Seed de la base de données (si première installation)
echo "Voulez-vous initialiser la base de données ? (o/N)"
read -r response
if [[ "$response" =~ ^([oO][uU][iI]|[oO])$ ]]; then
    npm run seed
    echo -e "${GREEN}✅ Base de données initialisée${NC}"
fi

# Démarrer/Redémarrer le backend avec PM2
echo "Démarrage du backend avec PM2..."
if pm2 describe swigs-api > /dev/null 2>&1; then
    pm2 restart swigs-api
    echo -e "${GREEN}✅ Backend redémarré${NC}"
else
    pm2 start server.js --name swigs-api
    pm2 save
    echo -e "${GREEN}✅ Backend démarré${NC}"
fi
echo ""

# 3. Admin Panel
echo -e "${BLUE}🎨 Build de l'Admin Panel...${NC}"
cd ~/swigs-cms/admin

# Installer les dépendances
echo "Installation des dépendances admin..."
npm install

# Build de production
echo "Build de production..."
npm run build
echo -e "${GREEN}✅ Build terminé${NC}"

# Déployer vers Nginx
echo "Déploiement vers Nginx..."
sudo rm -rf /var/www/admin.swigs.online/html/*
sudo cp -r dist/* /var/www/admin.swigs.online/html/
sudo chown -R www-data:www-data /var/www/admin.swigs.online/html
echo -e "${GREEN}✅ Admin déployé${NC}"
echo ""

# 4. Nginx
echo -e "${BLUE}🌐 Configuration Nginx...${NC}"

# Vérifier la configuration
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx rechargé${NC}"
else
    echo -e "${RED}❌ Erreur de configuration Nginx${NC}"
    exit 1
fi
echo ""

# 5. Vérifications
echo -e "${BLUE}🔍 Vérifications...${NC}"

# Backend
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo -e "${GREEN}✅ Backend accessible${NC}"
else
    echo -e "${RED}❌ Backend non accessible${NC}"
fi

# PM2
echo ""
echo "Statut PM2:"
pm2 status

echo ""
echo -e "${GREEN}🎉 Déploiement terminé !${NC}"
echo ""
echo "📊 Prochaines étapes:"
echo "1. Trouver l'IP locale: ip addr show | grep 'inet ' | grep -v 127.0.0.1"
echo "2. Ajouter dans /etc/hosts (sur votre Mac): <IP_LOCALE> admin.swigs.online"
echo "3. Ouvrir http://admin.swigs.online dans votre navigateur"
echo "4. Login: admin@swigs.com / Admin123!"
echo ""
echo "📝 Logs backend: pm2 logs swigs-api"
echo "📝 Logs Nginx: sudo tail -f /var/log/nginx/error.log"
