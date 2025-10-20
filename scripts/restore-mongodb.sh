#!/bin/bash

# ============================================
# Script de Restauration MongoDB
# ============================================
# Restaure un backup MongoDB
# Usage: ./restore-mongodb.sh <backup-file.tar.gz>
# ============================================

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier les arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Usage: $0 <backup-file.tar.gz>${NC}"
    echo ""
    echo "Backups disponibles:"
    ls -lh /home/swigs/backups/mongodb/*.tar.gz 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'
    exit 1
fi

BACKUP_FILE=$1
BACKUP_DIR="/home/swigs/backups/mongodb"
TEMP_DIR="/tmp/mongodb-restore-$$"
DB_NAME="swigs-cms"

# Vérifier que le fichier existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Fichier introuvable: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  ATTENTION: Cette opération va écraser la base de données actuelle!${NC}"
echo -e "${YELLOW}Base de données: $DB_NAME${NC}"
echo -e "${YELLOW}Backup: $BACKUP_FILE${NC}"
echo ""
read -p "Continuer? (oui/non): " CONFIRM

if [ "$CONFIRM" != "oui" ]; then
    echo -e "${RED}❌ Restauration annulée${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}🔄 Démarrage de la restauration...${NC}"

# Créer un dossier temporaire
mkdir -p "$TEMP_DIR"

# Décompresser le backup
echo -e "${YELLOW}📦 Décompression du backup...${NC}"
if tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"; then
    echo -e "${GREEN}✅ Backup décompressé${NC}"
else
    echo -e "${RED}❌ Erreur lors de la décompression${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Restaurer la base de données
echo -e "${YELLOW}🔄 Restauration de la base de données...${NC}"
if mongorestore --db="$DB_NAME" --drop "$TEMP_DIR"/*/"$DB_NAME" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Base de données restaurée avec succès!${NC}"
else
    echo -e "${RED}❌ Erreur lors de la restauration${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Nettoyage
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}✅ Restauration terminée!${NC}"
echo ""

exit 0
