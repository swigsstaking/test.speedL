#!/bin/bash

# Script pour corriger les uploads sur le serveur

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔧 Correction des uploads${NC}"
echo ""

# 1. Créer le dossier uploads s'il n'existe pas
echo -e "${BLUE}1. Création du dossier uploads...${NC}"
mkdir -p ~/websites/speed-l/backend/uploads
chmod 755 ~/websites/speed-l/backend/uploads

# 2. Vérifier les permissions
echo -e "${BLUE}2. Vérification des permissions...${NC}"
ls -la ~/websites/speed-l/backend/uploads/

# 3. Créer un lien symbolique vers /var/www/speed-l/uploads
echo -e "${BLUE}3. Création du lien symbolique...${NC}"
sudo mkdir -p /var/www/speed-l/uploads
sudo ln -sf ~/websites/speed-l/backend/uploads/* /var/www/speed-l/uploads/ 2>/dev/null || true

# Ou copier les fichiers
sudo cp -r ~/websites/speed-l/backend/uploads/* /var/www/speed-l/uploads/ 2>/dev/null || true
sudo chown -R www-data:www-data /var/www/speed-l/uploads
sudo chmod -R 755 /var/www/speed-l/uploads

# 4. Vérifier la config Nginx
echo -e "${BLUE}4. Vérification de la config Nginx...${NC}"
if sudo grep -q "location /uploads" /etc/nginx/sites-available/swigs.online; then
    echo -e "${GREEN}✅ Config Nginx OK${NC}"
else
    echo -e "${YELLOW}⚠️  Config Nginx manquante${NC}"
    echo ""
    echo "Ajoutez cette section dans /etc/nginx/sites-available/swigs.online :"
    echo ""
    echo "    location /uploads {
        alias /var/www/speed-l/uploads;
        expires 30d;
        add_header Cache-Control \"public, immutable\";
    }"
fi

# 5. Recharger Nginx
echo -e "${BLUE}5. Rechargement de Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo -e "${GREEN}✅ Terminé !${NC}"
echo ""
echo -e "${YELLOW}Test :${NC}"
echo "1. Uploader une image dans l'admin"
echo "2. Vérifier l'URL : https://swigs.online/uploads/FICHIER.png"
echo "3. Tester : curl -I https://swigs.online/uploads/FICHIER.png"
