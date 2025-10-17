#!/bin/bash

# Script pour corriger la suppression de médias (405 Method Not Allowed)

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔧 Correction de la suppression de médias${NC}"
echo ""

# 1. Copier la config Nginx
echo -e "${BLUE}1. Copie de la config Nginx...${NC}"
sudo cp ~/websites/speed-l/nginx-configs/admin.conf /etc/nginx/sites-available/admin

# 2. Vérifier si Certbot a créé un bloc HTTPS
echo -e "${BLUE}2. Vérification du bloc HTTPS...${NC}"
if sudo grep -q "listen 443 ssl" /etc/nginx/sites-available/admin; then
    echo -e "${YELLOW}⚠️  Bloc HTTPS détecté (Certbot)${NC}"
    echo -e "${YELLOW}Il faut ajouter la config proxy dans le bloc HTTPS aussi${NC}"
    
    # Créer un backup
    sudo cp /etc/nginx/sites-available/admin /etc/nginx/sites-available/admin.backup
    
    echo ""
    echo -e "${YELLOW}Éditez manuellement le fichier :${NC}"
    echo "sudo nano /etc/nginx/sites-available/admin"
    echo ""
    echo "Cherchez le bloc 'server {' avec 'listen 443 ssl'"
    echo "Et ajoutez-y la section location /api/ (comme dans le bloc HTTP)"
    echo ""
    echo "Appuyez sur Entrée quand c'est fait..."
    read
else
    echo -e "${GREEN}✅ Pas de bloc HTTPS séparé${NC}"
fi

# 3. Tester la config
echo -e "${BLUE}3. Test de la config Nginx...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Config valide${NC}"
else
    echo -e "${RED}❌ Erreur dans la config${NC}"
    echo "Restauration du backup..."
    sudo cp /etc/nginx/sites-available/admin.backup /etc/nginx/sites-available/admin
    exit 1
fi

# 4. Recharger Nginx
echo -e "${BLUE}4. Rechargement de Nginx...${NC}"
sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx rechargé${NC}"

# 5. Tester l'API
echo -e "${BLUE}5. Test de l'API...${NC}"
echo "Test GET /api/media :"
curl -s -o /dev/null -w "%{http_code}" https://admin.swigs.online/api/media

echo ""
echo -e "${GREEN}✅ Terminé !${NC}"
echo ""
echo -e "${YELLOW}Testez maintenant la suppression dans l'admin${NC}"
echo "Si ça ne fonctionne toujours pas, vérifiez les logs :"
echo "  pm2 logs swigs-api --lines 50"
echo "  sudo tail -f /var/log/nginx/admin-error.log"
