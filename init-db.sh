#!/bin/bash

# Script d'initialisation de la base de données
# Crée l'utilisateur admin et le site Speed-L

set -e

echo "🌱 Initialisation de la base de données"
echo "========================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier MongoDB
echo -e "${BLUE}🗄️  Vérification de MongoDB...${NC}"
if ! sudo systemctl is-active --quiet mongodb && ! sudo systemctl is-active --quiet mongod; then
    echo -e "${RED}❌ MongoDB n'est pas actif${NC}"
    echo "Démarrage de MongoDB..."
    sudo systemctl start mongodb || sudo systemctl start mongod
fi

if sudo systemctl is-active --quiet mongodb || sudo systemctl is-active --quiet mongod; then
    echo -e "${GREEN}✅ MongoDB actif${NC}"
else
    echo -e "${RED}❌ Impossible de démarrer MongoDB${NC}"
    exit 1
fi

echo ""

# Vérifier si la DB existe déjà
echo -e "${BLUE}🔍 Vérification de la base de données...${NC}"
DB_EXISTS=$(mongosh --quiet --eval "db.getSiblingDB('swigs-cms').sites.countDocuments()" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  La base de données contient déjà $DB_EXISTS site(s)${NC}"
    read -p "Voulez-vous réinitialiser la base de données ? (oui/non) : " reset_db
    
    if [ "$reset_db" = "oui" ]; then
        echo "Suppression de la base de données..."
        mongosh --quiet --eval "db.getSiblingDB('swigs-cms').dropDatabase()"
        echo -e "${GREEN}✅ Base de données supprimée${NC}"
    else
        echo "Annulé. La base de données existante est conservée."
        exit 0
    fi
fi

echo ""

# Seed la base de données
echo -e "${BLUE}🌱 Initialisation des données...${NC}"
cd ~/websites/speed-l/backend

if [ ! -f "src/scripts/seed.js" ]; then
    echo -e "${RED}❌ Script seed.js introuvable${NC}"
    exit 1
fi

npm run seed

echo ""
echo -e "${GREEN}🎉 Base de données initialisée !${NC}"
echo ""
echo -e "${YELLOW}📋 Données créées :${NC}"
echo "  ✅ Utilisateur admin : admin@swigs.online / Admin123!"
echo "  ✅ Site Speed-L configuré"
echo ""
echo -e "${YELLOW}🔒 IMPORTANT :${NC}"
echo "  Changez le mot de passe admin après la première connexion !"
echo ""
echo -e "${YELLOW}🌐 Prochaines étapes :${NC}"
echo "  1. Ouvrir https://admin.swigs.online"
echo "  2. Se connecter avec admin@swigs.online / Admin123!"
echo "  3. Le site Speed-L devrait apparaître dans le sélecteur"
echo ""
