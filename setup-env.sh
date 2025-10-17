#!/bin/bash

# Script de configuration automatique du .env
# Génère JWT_SECRET et vérifie MongoDB

set -e

echo "🔧 Configuration automatique du backend"
echo "========================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd ~/websites/speed-l/backend

# 1. Vérifier si .env existe déjà
if [ -f .env ]; then
    echo -e "${YELLOW}⚠️  Le fichier .env existe déjà.${NC}"
    read -p "Voulez-vous le recréer ? (oui/non) : " recreate
    if [ "$recreate" != "oui" ]; then
        echo "Annulé."
        exit 0
    fi
    mv .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "Ancien .env sauvegardé"
fi

# 2. Copier l'exemple
cp .env.example .env
echo -e "${GREEN}✅ Fichier .env créé${NC}"
echo ""

# 3. Générer JWT_SECRET
echo -e "${BLUE}🔑 Génération du JWT_SECRET...${NC}"
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
echo "JWT_SECRET généré : ${JWT_SECRET:0:20}... (tronqué pour l'affichage)"

# Remplacer dans le .env
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
echo -e "${GREEN}✅ JWT_SECRET configuré${NC}"
echo ""

# 4. Vérifier MongoDB
echo -e "${BLUE}🗄️  Vérification de MongoDB...${NC}"

# Vérifier si MongoDB est actif
if sudo systemctl is-active --quiet mongodb || sudo systemctl is-active --quiet mongod; then
    echo -e "${GREEN}✅ MongoDB est actif${NC}"
    
    # Détecter le port
    MONGO_PORT=$(sudo netstat -tlnp 2>/dev/null | grep mongo | grep -oP ':\K[0-9]+' | head -n 1)
    
    if [ -z "$MONGO_PORT" ]; then
        MONGO_PORT=27017
        echo -e "${YELLOW}⚠️  Port MongoDB non détecté, utilisation du port par défaut : 27017${NC}"
    else
        echo -e "${GREEN}✅ MongoDB écoute sur le port : $MONGO_PORT${NC}"
    fi
    
    # Mettre à jour l'URI MongoDB
    sed -i "s|MONGODB_URI=.*|MONGODB_URI=mongodb://localhost:$MONGO_PORT/swigs-cms|g" .env
    echo -e "${GREEN}✅ MONGODB_URI configuré${NC}"
    
else
    echo -e "${RED}❌ MongoDB n'est pas actif${NC}"
    echo ""
    read -p "Voulez-vous installer MongoDB maintenant ? (oui/non) : " install_mongo
    
    if [ "$install_mongo" = "oui" ]; then
        echo "Installation de MongoDB..."
        sudo apt update
        sudo apt install mongodb -y
        sudo systemctl start mongodb
        sudo systemctl enable mongodb
        echo -e "${GREEN}✅ MongoDB installé et démarré${NC}"
        
        # Configurer l'URI
        sed -i "s|MONGODB_URI=.*|MONGODB_URI=mongodb://localhost:27017/swigs-cms|g" .env
    else
        echo -e "${YELLOW}⚠️  MongoDB non installé. Configurez-le manuellement.${NC}"
    fi
fi

echo ""

# 5. Configurer NODE_ENV
echo -e "${BLUE}⚙️  Configuration de l'environnement...${NC}"
sed -i "s|NODE_ENV=.*|NODE_ENV=production|g" .env
echo -e "${GREEN}✅ NODE_ENV=production${NC}"
echo ""

# 6. Afficher le résumé
echo -e "${GREEN}🎉 Configuration terminée !${NC}"
echo ""
echo -e "${YELLOW}📋 Résumé de la configuration :${NC}"
echo ""
cat .env | grep -v "^#" | grep -v "^$"
echo ""

# 7. Créer le dossier uploads
mkdir -p uploads
echo -e "${GREEN}✅ Dossier uploads créé${NC}"
echo ""

# 8. Initialiser la base de données
echo -e "${BLUE}🌱 Initialisation de la base de données...${NC}"
read -p "Voulez-vous initialiser la base de données avec les données de test ? (oui/non) : " init_db

if [ "$init_db" = "oui" ]; then
    npm run seed
    echo -e "${GREEN}✅ Base de données initialisée${NC}"
else
    echo "Base de données non initialisée. Vous pourrez le faire plus tard avec : npm run seed"
fi

echo ""
echo -e "${GREEN}✅ Configuration complète !${NC}"
echo ""
echo -e "${YELLOW}🔒 IMPORTANT :${NC}"
echo "1. Le JWT_SECRET a été généré automatiquement"
echo "2. Ne partagez JAMAIS le fichier .env"
echo "3. Changez le mot de passe admin après la première connexion"
echo ""
echo -e "${YELLOW}📝 Prochaines étapes :${NC}"
echo "1. Vérifiez le fichier .env : nano ~/websites/speed-l/backend/.env"
echo "2. Lancez le déploiement : cd ~/websites/speed-l && ./clean-deploy.sh"
echo ""
