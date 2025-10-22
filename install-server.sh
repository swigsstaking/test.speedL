#!/bin/bash

###############################################################################
# 🚀 SWIGS MONITORING - Installation Automatique Serveur
###############################################################################
# Ce script installe et configure automatiquement le monitoring sur un nouveau serveur
# Usage: curl -fsSL https://raw.githubusercontent.com/swigsstaking/test.speedL/main/install-server.sh | bash
###############################################################################

set -e  # Arrêter en cas d'erreur

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
REPO_URL="https://github.com/swigsstaking/test.speedL.git"
INSTALL_DIR="/opt/swigs-monitoring"
API_URL="https://monitoring.swigs.online"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🚀 SWIGS MONITORING - Installation Serveur            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Fonction pour afficher les étapes
step() {
    echo -e "${GREEN}▶${NC} $1"
}

error() {
    echo -e "${RED}✖${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}✔${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Vérifier si root
if [ "$EUID" -ne 0 ]; then 
    error "Ce script doit être exécuté en tant que root (sudo)"
fi

# Demander l'ID du serveur
echo ""
read -p "$(echo -e ${YELLOW}❓ Entrez l\'ID du serveur ${NC}(ex: server-2): ")" SERVER_ID
if [ -z "$SERVER_ID" ]; then
    error "L'ID du serveur est requis"
fi

echo ""
step "1/8 - Mise à jour du système..."
apt-get update -qq
apt-get upgrade -y -qq
success "Système mis à jour"

echo ""
step "2/8 - Installation des dépendances..."
apt-get install -y -qq \
    curl \
    git \
    build-essential \
    python3 \
    python3-pip \
    nginx \
    certbot \
    python3-certbot-nginx
success "Dépendances installées"

echo ""
step "3/8 - Installation de Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
success "Node.js $(node -v) installé"

echo ""
step "4/8 - Installation de PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
fi
success "PM2 installé"

echo ""
step "5/8 - Clonage du repository..."
if [ -d "$INSTALL_DIR" ]; then
    warning "Le répertoire $INSTALL_DIR existe déjà, mise à jour..."
    cd $INSTALL_DIR
    git pull
else
    git clone $REPO_URL $INSTALL_DIR
    cd $INSTALL_DIR
fi
success "Repository cloné"

echo ""
step "6/8 - Installation du collecteur de métriques..."
cd $INSTALL_DIR/server-collector

# Créer fichier de configuration
cat > config.json <<EOF
{
  "serverId": "$SERVER_ID",
  "apiUrl": "$API_URL",
  "collectInterval": 60000,
  "hostname": "$(hostname)",
  "location": "Suisse"
}
EOF

# Installer dépendances
npm install --production

# Démarrer avec PM2
pm2 delete swigs-collector-$SERVER_ID 2>/dev/null || true
pm2 start collector.js --name "swigs-collector-$SERVER_ID"
pm2 save

success "Collecteur de métriques installé et démarré"

echo ""
step "7/8 - Configuration Nginx (optionnel)..."
if [ ! -f /etc/nginx/sites-available/swigs-monitoring ]; then
    cat > /etc/nginx/sites-available/swigs-monitoring <<'EOF'
# Configuration Nginx pour sites hébergés
# À personnaliser selon vos besoins
server {
    listen 80;
    server_name _;
    
    # Logs pour monitoring
    access_log /var/log/nginx/access.log combined;
    error_log /var/log/nginx/error.log;
    
    location / {
        return 404;
    }
}
EOF
    ln -sf /etc/nginx/sites-available/swigs-monitoring /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
    success "Nginx configuré"
else
    warning "Configuration Nginx déjà existante"
fi

echo ""
step "8/8 - Vérification de l'installation..."
sleep 3

# Vérifier que PM2 tourne
if pm2 list | grep -q "swigs-collector-$SERVER_ID"; then
    success "Collecteur actif dans PM2"
else
    error "Le collecteur n'est pas actif"
fi

# Vérifier la connexion à l'API
if curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/health" | grep -q "200"; then
    success "Connexion à l'API réussie"
else
    warning "Impossible de contacter l'API (vérifiez le firewall)"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ INSTALLATION TERMINÉE !                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Serveur ID:${NC} $SERVER_ID"
echo -e "${BLUE}📁 Répertoire:${NC} $INSTALL_DIR"
echo -e "${BLUE}🔄 Collecteur:${NC} swigs-collector-$SERVER_ID"
echo ""
echo -e "${YELLOW}📝 PROCHAINES ÉTAPES:${NC}"
echo ""
echo "1. Vérifier les logs du collecteur:"
echo -e "   ${BLUE}pm2 logs swigs-collector-$SERVER_ID${NC}"
echo ""
echo "2. Ajouter le serveur dans le dashboard:"
echo -e "   ${BLUE}https://monitoring.swigs.online${NC}"
echo ""
echo "3. Configurer le coût mensuel du serveur"
echo ""
echo "4. Attribuer vos sites à ce serveur"
echo ""
echo -e "${GREEN}✨ Le serveur envoie maintenant ses métriques toutes les minutes !${NC}"
echo ""
