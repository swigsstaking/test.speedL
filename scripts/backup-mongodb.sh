#!/bin/bash

# ============================================
# Script de Backup Automatisé MongoDB
# ============================================
# Sauvegarde quotidienne de la base de données
# Compression et nettoyage automatique
# ============================================

# Configuration
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/swigs/backups/mongodb"
DB_NAME="swigs-cms"
RETENTION_DAYS=7

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Démarrage du backup MongoDB...${NC}"
echo "Date: $(date)"
echo "Base de données: $DB_NAME"
echo ""

# Créer le dossier de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Vérifier que MongoDB est accessible
if ! mongosh --eval "db.version()" > /dev/null 2>&1; then
    echo -e "${RED}❌ Erreur: MongoDB n'est pas accessible${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Création du dump MongoDB...${NC}"

# Créer le dump MongoDB
if mongodump --db="$DB_NAME" --out="$BACKUP_DIR/$DATE" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Dump créé avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors de la création du dump${NC}"
    exit 1
fi

# Compression du dump
echo -e "${YELLOW}🗜️  Compression du backup...${NC}"
if tar -czf "$BACKUP_DIR/$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE" 2>/dev/null; then
    echo -e "${GREEN}✅ Backup compressé: $DATE.tar.gz${NC}"
    
    # Supprimer le dossier non compressé
    rm -rf "$BACKUP_DIR/$DATE"
    
    # Taille du backup
    SIZE=$(du -h "$BACKUP_DIR/$DATE.tar.gz" | cut -f1)
    echo -e "${GREEN}📊 Taille: $SIZE${NC}"
else
    echo -e "${RED}❌ Erreur lors de la compression${NC}"
    exit 1
fi

# Nettoyage des anciens backups
echo -e "${YELLOW}🧹 Nettoyage des backups > $RETENTION_DAYS jours...${NC}"
DELETED=$(find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo -e "${GREEN}✅ $DELETED ancien(s) backup(s) supprimé(s)${NC}"

# Liste des backups disponibles
echo ""
echo -e "${GREEN}📋 Backups disponibles:${NC}"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'

# Statistiques
TOTAL_BACKUPS=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)

echo ""
echo -e "${GREEN}✅ Backup terminé avec succès!${NC}"
echo -e "${GREEN}📊 Total: $TOTAL_BACKUPS backup(s) - $TOTAL_SIZE${NC}"
echo ""

# Optionnel: Upload vers S3 (décommenter si besoin)
# echo -e "${YELLOW}☁️  Upload vers S3...${NC}"
# aws s3 cp "$BACKUP_DIR/$DATE.tar.gz" s3://swigs-backups/mongodb/ --region eu-west-1
# if [ $? -eq 0 ]; then
#     echo -e "${GREEN}✅ Backup uploadé vers S3${NC}"
# else
#     echo -e "${RED}❌ Erreur lors de l'upload S3${NC}"
# fi

exit 0
