# 🚀 Installation Backup & Redis

Guide d'installation des améliorations : Backup automatisé et Redis Cache

---

## 1️⃣ Backup Automatisé MongoDB

### Installation sur le serveur

```bash
# Se connecter au serveur
ssh swigs@votre-serveur

# Créer le dossier des scripts
mkdir -p ~/scripts
mkdir -p ~/backups/mongodb

# Récupérer les scripts depuis Git
cd ~/websites/speed-l
git pull origin main

# Copier les scripts de backup
cp scripts/backup-mongodb.sh ~/scripts/
cp scripts/restore-mongodb.sh ~/scripts/

# Rendre les scripts exécutables
chmod +x ~/scripts/backup-mongodb.sh
chmod +x ~/scripts/restore-mongodb.sh
```

### Configuration du Cron (Backup quotidien à 3h)

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne (backup tous les jours à 3h du matin)
0 3 * * * /home/swigs/scripts/backup-mongodb.sh >> /home/swigs/backups/mongodb/backup.log 2>&1
```

### Test manuel

```bash
# Tester le backup
~/scripts/backup-mongodb.sh

# Vérifier que le backup est créé
ls -lh ~/backups/mongodb/

# Devrait afficher quelque chose comme:
# 20251020_150000.tar.gz (2.5M)
```

### Restauration d'un backup

```bash
# Lister les backups disponibles
ls -lh ~/backups/mongodb/

# Restaurer un backup spécifique
~/scripts/restore-mongodb.sh ~/backups/mongodb/20251020_150000.tar.gz

# ⚠️ ATTENTION: Cela va écraser la base de données actuelle!
```

---

## 2️⃣ Redis Cache

### Installation de Redis

```bash
# Installer Redis
sudo apt update
sudo apt install redis-server -y

# Vérifier que Redis est installé
redis-cli --version

# Démarrer Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Vérifier que Redis fonctionne
redis-cli ping
# Devrait répondre: PONG
```

### Configuration Redis (Optionnel)

```bash
# Éditer la config Redis
sudo nano /etc/redis/redis.conf

# Recommandations:
# - maxmemory 256mb (limite la RAM utilisée)
# - maxmemory-policy allkeys-lru (supprime les clés les moins utilisées)

# Redémarrer Redis après modification
sudo systemctl restart redis-server
```

### Installation des dépendances Node.js

```bash
cd ~/websites/speed-l/backend
npm install
```

### Démarrage du backend avec Redis

```bash
# Arrêter le backend
pm2 stop backend

# Redémarrer le backend
pm2 start backend

# Vérifier les logs
pm2 logs backend

# Devrait afficher:
# ✅ Redis connecté
# 🚀 Redis prêt
```

### Test du cache

```bash
# Première requête (MISS - va en base de données)
curl https://speedl.swigs.online/api/sites

# Deuxième requête (HIT - vient du cache, beaucoup plus rapide!)
curl https://speedl.swigs.online/api/sites

# Vérifier les logs du backend
pm2 logs backend --lines 20

# Devrait afficher:
# Cache MISS: sites:/api/sites
# Cache HIT: sites:/api/sites
```

### Monitoring Redis

```bash
# Se connecter à Redis
redis-cli

# Voir toutes les clés en cache
KEYS *

# Voir une clé spécifique
GET "sites:/api/sites"

# Voir les stats
INFO stats

# Vider tout le cache (si besoin)
FLUSHDB

# Quitter
exit
```

---

## 📊 Vérification

### Backup

```bash
# Vérifier que le cron est configuré
crontab -l

# Vérifier les logs de backup
tail -f ~/backups/mongodb/backup.log

# Vérifier l'espace disque
df -h ~/backups/mongodb/
```

### Redis

```bash
# Vérifier que Redis tourne
sudo systemctl status redis-server

# Vérifier la mémoire utilisée
redis-cli INFO memory | grep used_memory_human

# Vérifier le nombre de clés en cache
redis-cli DBSIZE
```

---

## 🔧 Dépannage

### Backup ne fonctionne pas

```bash
# Vérifier que MongoDB est accessible
mongosh --eval "db.version()"

# Vérifier les permissions
ls -la ~/scripts/backup-mongodb.sh

# Vérifier les logs
cat ~/backups/mongodb/backup.log
```

### Redis ne démarre pas

```bash
# Vérifier les logs Redis
sudo journalctl -u redis-server -n 50

# Vérifier le port
sudo netstat -tlnp | grep 6379

# Redémarrer Redis
sudo systemctl restart redis-server
```

### Cache ne fonctionne pas

```bash
# Vérifier que Redis est accessible depuis Node.js
redis-cli ping

# Vérifier les logs du backend
pm2 logs backend --lines 50

# Vider le cache et réessayer
redis-cli FLUSHDB
```

---

## 📈 Performance Attendue

### Avant Redis
- Requête `/api/sites`: ~50ms
- Requête `/api/courses`: ~80ms
- Charge MongoDB: Élevée

### Après Redis
- Requête `/api/sites` (cache HIT): ~5ms (10x plus rapide!)
- Requête `/api/courses` (cache HIT): ~8ms (10x plus rapide!)
- Charge MongoDB: Réduite de 80%

---

## 🎯 Résumé

✅ **Backup automatisé**:
- Sauvegarde quotidienne à 3h
- Compression automatique
- Rétention 7 jours
- Restauration en 1 commande

✅ **Redis Cache**:
- Cache automatique des requêtes GET
- Invalidation automatique lors des modifications
- Performance x10
- Transparent pour l'utilisateur

---

## 📞 Support

En cas de problème:
1. Vérifier les logs: `pm2 logs backend`
2. Vérifier Redis: `redis-cli ping`
3. Vérifier les backups: `ls -lh ~/backups/mongodb/`

---

*Installation complète en ~10 minutes* ⚡
