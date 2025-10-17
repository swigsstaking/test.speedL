#!/bin/bash

# Script de rebuild automatique du site Speed-L
# Appelé par le webhook après modification dans l'admin

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fichier de log
LOG_FILE=~/websites/speed-l/rebuild.log
echo "$(date '+%Y-%m-%d %H:%M:%S') - Début du rebuild" >> $LOG_FILE

echo -e "${BLUE}🔄 Rebuild automatique du site Speed-L${NC}"

# Aller dans le dossier du projet
cd ~/websites/speed-l

# Créer le .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "VITE_API_URL=/api" > .env
fi

# Nettoyer les anciens builds
echo -e "${BLUE}🗑️  Nettoyage...${NC}"
rm -rf dist/ node_modules/.vite 2>/dev/null || true

# Build du site
echo -e "${BLUE}🔨 Build en cours...${NC}"
npm run build >> $LOG_FILE 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build réussi${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Build réussi" >> $LOG_FILE
    
    # Déployer
    echo -e "${BLUE}📦 Déploiement...${NC}"
    sudo cp -r dist/* /var/www/speed-l/
    sudo chown -R www-data:www-data /var/www/speed-l
    
    echo -e "${GREEN}✅ Site mis à jour !${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Déploiement réussi" >> $LOG_FILE
    
    # Notification (optionnel)
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ✅ Rebuild terminé avec succès" >> $LOG_FILE
    
    exit 0
else
    echo -e "${RED}❌ Erreur lors du build${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ❌ Erreur lors du build" >> $LOG_FILE
    exit 1
fi
