#!/bin/bash

# 🚀 Script de Déploiement Multi-Sites SWIGS
# Date: 24 Octobre 2025
# Auteur: Cascade AI

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        🚀 DÉPLOIEMENT MULTI-SITES SWIGS 🚀                ║"
echo "║                                                            ║"
echo "║  Backend + Admin + Control Center                          ║"
echo "║  Version: 1.0                                              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Demander confirmation
echo ""
log_warning "Ce script va déployer les modifications multi-sites sur le serveur."
log_warning "Assurez-vous d'avoir lu le guide DEPLOIEMENT-MULTI-SITES.md"
echo ""
read -p "Voulez-vous continuer ? (oui/non) " -r
echo
if [[ ! $REPLY =~ ^[Oo]ui$ ]]
then
    log_error "Déploiement annulé."
    exit 1
fi

# Vérifier qu'on est sur le serveur
if [ ! -d "$HOME/swigs-apps" ]; then
    log_error "Ce script doit être exécuté sur le serveur (~/swigs-apps introuvable)"
    exit 1
fi

# ============================================
# ÉTAPE 1: BACKUP
# ============================================
echo ""
log_info "═══════════════════════════════════════════════════════════"
log_info "ÉTAPE 1/5: Backup des données"
log_info "═══════════════════════════════════════════════════════════"

BACKUP_DATE=$(date +%Y%m%d-%H%M)
BACKUP_DIR="$HOME/backups"

# Créer les dossiers de backup
mkdir -p "$BACKUP_DIR/mongodb"
mkdir -p "$BACKUP_DIR/sites"
mkdir -p "$BACKUP_DIR/nginx"

log_info "Backup MongoDB..."
mongodump --db swigs-cms --out "$BACKUP_DIR/mongodb/pre-multi-sites-$BACKUP_DATE" --quiet
mongodump --db swigs-monitoring --out "$BACKUP_DIR/mongodb/pre-multi-sites-$BACKUP_DATE" --quiet
log_success "MongoDB sauvegardé"

log_info "Backup sites web..."
tar -czf "$BACKUP_DIR/sites/pre-multi-sites-$BACKUP_DATE.tar.gz" /var/www/ 2>/dev/null
log_success "Sites web sauvegardés"

log_info "Backup configs Nginx..."
sudo tar -czf "$BACKUP_DIR/nginx/pre-multi-sites-$BACKUP_DATE.tar.gz" /etc/nginx/sites-available/ 2>/dev/null
log_success "Configs Nginx sauvegardées"

log_success "Backups terminés dans $BACKUP_DIR"

# ============================================
# ÉTAPE 2: BACKEND
# ============================================
echo ""
log_info "═══════════════════════════════════════════════════════════"
log_info "ÉTAPE 2/5: Déploiement Backend CMS"
log_info "═══════════════════════════════════════════════════════════"

cd "$HOME/swigs-apps/swigs-cms-backend"

log_info "Pull des changements..."
git pull origin main

log_info "Installation des dépendances..."
npm install --production

log_info "Redémarrage du service..."
pm2 restart swigs-cms-backend

log_info "Attente de 5 secondes..."
sleep 5

log_info "Vérification du service..."
if pm2 status | grep -q "swigs-cms-backend.*online"; then
    log_success "Backend démarré avec succès"
else
    log_error "Erreur: Backend non démarré"
    log_info "Logs:"
    pm2 logs swigs-cms-backend --lines 20 --nostream
    exit 1
fi

log_info "Test de l'API..."
if curl -s http://localhost:3000/api/health | grep -q "ok"; then
    log_success "API répond correctement"
else
    log_warning "API ne répond pas comme attendu"
fi

# ============================================
# ÉTAPE 3: ADMIN
# ============================================
echo ""
log_info "═══════════════════════════════════════════════════════════"
log_info "ÉTAPE 3/5: Déploiement Admin CMS"
log_info "═══════════════════════════════════════════════════════════"

cd "$HOME/swigs-apps/swigs-cms-admin"

log_info "Pull des changements..."
git pull origin main

log_info "Installation des dépendances..."
npm install

log_info "Build de l'application..."
npm run build

if [ ! -d "dist" ]; then
    log_error "Erreur: Build échoué (dossier dist introuvable)"
    exit 1
fi

log_info "Déploiement..."
sudo cp -r dist/* /var/www/admin/

log_info "Permissions..."
sudo chown -R swigs:www-data /var/www/admin
sudo chmod -R 775 /var/www/admin

log_info "Test de l'accès..."
if curl -I https://admin.swigs.online 2>/dev/null | grep -q "200\|301\|302"; then
    log_success "Admin déployé avec succès"
else
    log_warning "Impossible de vérifier l'accès à l'Admin"
fi

# ============================================
# ÉTAPE 4: CONTROL CENTER
# ============================================
echo ""
log_info "═══════════════════════════════════════════════════════════"
log_info "ÉTAPE 4/5: Déploiement Control Center"
log_info "═══════════════════════════════════════════════════════════"

cd "$HOME/swigs-apps/swigs-control-center"

log_info "Pull des changements..."
git pull origin main

log_info "Installation des dépendances..."
npm install

log_info "Build de l'application..."
npm run build

if [ ! -d "dist" ]; then
    log_error "Erreur: Build échoué (dossier dist introuvable)"
    exit 1
fi

log_info "Déploiement..."
sudo cp -r dist/* /var/www/monitoring/

log_info "Permissions..."
sudo chown -R swigs:www-data /var/www/monitoring
sudo chmod -R 775 /var/www/monitoring

log_info "Test de l'accès..."
if curl -I https://monitoring.swigs.online 2>/dev/null | grep -q "200\|301\|302"; then
    log_success "Control Center déployé avec succès"
else
    log_warning "Impossible de vérifier l'accès au Control Center"
fi

# ============================================
# ÉTAPE 5: VÉRIFICATIONS
# ============================================
echo ""
log_info "═══════════════════════════════════════════════════════════"
log_info "ÉTAPE 5/5: Vérifications finales"
log_info "═══════════════════════════════════════════════════════════"

log_info "Services PM2..."
pm2 status

log_info "Nginx..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    log_success "Configuration Nginx valide"
else
    log_error "Erreur dans la configuration Nginx"
fi

log_info "MongoDB..."
if sudo systemctl is-active --quiet mongod; then
    log_success "MongoDB actif"
else
    log_error "MongoDB inactif"
fi

log_info "Espace disque..."
df -h | grep -E "Filesystem|/dev/sda"

# ============================================
# RÉSUMÉ
# ============================================
echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        ✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS ✅              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo ""
log_success "Backups sauvegardés dans: $BACKUP_DIR"
log_success "Backend CMS: Redémarré"
log_success "Admin CMS: Déployé"
log_success "Control Center: Déployé"

echo ""
log_info "═══════════════════════════════════════════════════════════"
log_info "PROCHAINES ÉTAPES"
log_info "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Vérifier l'Admin: https://admin.swigs.online"
echo "   - Tester l'upload de médias"
echo "   - Tester l'ajout de pages SEO"
echo "   - Tester l'ajout de sections Content"
echo ""
echo "2. Vérifier le Control Center: https://monitoring.swigs.online"
echo "   - Tester l'ajout de sites"
echo ""
echo "3. Surveiller les logs pendant 24h:"
echo "   pm2 logs swigs-cms-backend"
echo "   sudo tail -f /var/log/nginx/admin-error.log"
echo ""
echo "4. (Optionnel) Migrer les médias existants:"
echo "   Voir docs/DEPLOIEMENT-MULTI-SITES.md section 'Migration des Médias'"
echo ""

log_warning "En cas de problème, consulter docs/DEPLOIEMENT-MULTI-SITES.md"
log_warning "Pour rollback, utiliser les backups dans $BACKUP_DIR"

echo ""
log_success "Déploiement terminé ! 🎉"
echo ""
