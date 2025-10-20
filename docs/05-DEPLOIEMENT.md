# 🚀 Guide de Déploiement Complet

Guide détaillé pour déployer SWIGS CMS sur un serveur Ubuntu.

---

## 📋 Prérequis

- Serveur Ubuntu 20.04+ (VPS ou dédié)
- Accès root ou sudo
- Nom de domaine configuré
- Minimum 2GB RAM, 20GB disque

---

## 🔧 Installation du Serveur

### 1. Mise à jour du système

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Installer Node.js

```bash
# Installer NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Installer Node.js LTS
nvm install --lts
nvm use --lts

# Vérifier
node -v  # v20.x.x
npm -v   # 10.x.x
```

### 3. Installer MongoDB

```bash
# Import de la clé GPG
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Ajouter le repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Installer
sudo apt update
sudo apt install -y mongodb-org

# Démarrer
sudo systemctl start mongod
sudo systemctl enable mongod

# Vérifier
sudo systemctl status mongod
mongosh --eval "db.adminCommand('ping')"
```

### 4. Installer Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Vérifier
sudo systemctl status nginx
curl http://localhost
```

### 5. Installer PM2

```bash
npm install -g pm2
pm2 startup
# Exécuter la commande affichée
```

### 6. Installer Certbot (SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

---

## 📦 Déploiement du Backend

### 1. Créer l'utilisateur

```bash
sudo adduser swigs
sudo usermod -aG sudo swigs
sudo usermod -aG www-data swigs
su - swigs
```

### 2. Cloner le repository

```bash
mkdir -p ~/websites
cd ~/websites
git clone https://github.com/swigsstaking/test.speedL.git speed-l
cd speed-l
```

### 3. Configurer le Backend

```bash
cd backend
npm install

# Créer le fichier .env
cp .env.example .env
nano .env
```

**Configuration .env** :

```bash
# Server
PORT=3000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb://localhost:27017/swigs-cms

# JWT
JWT_SECRET=GENERER_UNE_CLE_SECRETE_LONGUE_ET_ALEATOIRE
JWT_EXPIRE=7d

# Admin
ADMIN_EMAIL=admin@swigs.online
ADMIN_PASSWORD=MotDePasseSecurise123!

# CORS
CORS_ORIGIN=https://swigs.online,https://admin.swigs.online,https://api.swigs.online

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/var/www/speed-l/uploads
PUBLIC_URL=https://swigs.online

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=mot-de-passe-app-gmail
SMTP_FROM="SWIGS CMS" <noreply@swigs.online>

# Rebuild
AUTO_GIT_PUSH=false
DEPLOY_PATH=/var/www/speed-l
```

### 4. Initialiser la base de données

```bash
npm run seed
```

### 5. Créer les dossiers uploads

```bash
sudo mkdir -p /var/www/speed-l/uploads
sudo chown -R swigs:www-data /var/www/speed-l/uploads
sudo chmod 775 /var/www/speed-l/uploads
```

### 6. Démarrer avec PM2

```bash
pm2 start server.js --name swigs-api
pm2 save
```

### 7. Vérifier

```bash
pm2 status
pm2 logs swigs-api
curl http://localhost:3000/api/health
```

---

## 🎨 Déploiement de l'Admin

### 1. Build l'admin

```bash
cd ~/websites/speed-l/admin
npm install
npm run build
```

### 2. Déployer

```bash
sudo mkdir -p /var/www/admin
sudo cp -r dist/* /var/www/admin/
sudo chown -R swigs:www-data /var/www/admin
```

---

## 🌐 Déploiement du Site

### 1. Build le site

```bash
cd ~/websites/speed-l
npm install
npm run build
```

### 2. Déployer

```bash
sudo mkdir -p /var/www/speedl-test
sudo cp -r dist/* /var/www/speedl-test/
sudo chown -R swigs:www-data /var/www/speedl-test
```

---

## ⚙️ Configuration Nginx

### 1. API

```bash
sudo cp ~/websites/speed-l/nginx-configs/api.conf /etc/nginx/sites-available/api
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
```

### 2. Admin

```bash
sudo cp ~/websites/speed-l/nginx-configs/admin-fixed.conf /etc/nginx/sites-available/admin
sudo ln -s /etc/nginx/sites-available/admin /etc/nginx/sites-enabled/
```

### 3. Site

```bash
sudo cp ~/websites/speed-l/nginx-configs/speedl-test.conf /etc/nginx/sites-available/speedl-test
sudo ln -s /etc/nginx/sites-available/speedl-test /etc/nginx/sites-enabled/
```

### 4. Tester et recharger

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Configuration SSL

### 1. Configurer DNS

Avant de lancer Certbot, configurer les DNS :

```
Type    Nom     Valeur
A       @       IP_DU_SERVEUR
A       api     IP_DU_SERVEUR
A       admin   IP_DU_SERVEUR
```

Attendre la propagation (quelques minutes à quelques heures).

### 2. Obtenir les certificats

```bash
# API
sudo certbot --nginx -d api.swigs.online

# Admin
sudo certbot --nginx -d admin.swigs.online

# Site
sudo certbot --nginx -d speedl.swigs.online
```

### 3. Renouvellement automatique

```bash
# Tester le renouvellement
sudo certbot renew --dry-run

# Cron automatique (déjà configuré par Certbot)
sudo systemctl status certbot.timer
```

---

## ✅ Vérifications Post-Déploiement

### 1. Backend

```bash
# Statut PM2
pm2 status

# Logs
pm2 logs swigs-api --lines 20

# API Health
curl https://api.swigs.online/health
# Doit retourner: OK

# API Sites
curl https://api.swigs.online/api/sites
```

### 2. Admin

```bash
# Vérifier les fichiers
ls -la /var/www/admin/

# Tester
curl -I https://admin.swigs.online
# Doit retourner: HTTP/2 200
```

### 3. Site

```bash
# Vérifier les fichiers
ls -la /var/www/speedl-test/

# Tester
curl -I https://speedl.swigs.online
# Doit retourner: HTTP/2 200
```

### 4. SSL

```bash
# Vérifier les certificats
sudo certbot certificates

# Tester HTTPS
curl -I https://api.swigs.online
curl -I https://admin.swigs.online
curl -I https://speedl.swigs.online
```

### 5. MongoDB

```bash
# Connexion
mongosh

# Lister les bases
show dbs

# Utiliser la base
use swigs-cms

# Lister les collections
show collections

# Compter les documents
db.sites.countDocuments()
db.users.countDocuments()
```

---

## 🔄 Workflow de Mise à Jour

### Backend

```bash
cd ~/websites/speed-l/backend
git pull origin main
npm install
pm2 restart swigs-api
pm2 logs swigs-api
```

### Admin

```bash
cd ~/websites/speed-l/admin
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/admin/
```

### Site

```bash
cd ~/websites/speed-l
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/speedl-test/
```

---

## 📊 Monitoring

### PM2

```bash
# Dashboard
pm2 monit

# Logs en temps réel
pm2 logs

# Métriques
pm2 describe swigs-api
```

### Nginx

```bash
# Logs access
sudo tail -f /var/log/nginx/access.log

# Logs erreurs
sudo tail -f /var/log/nginx/error.log

# Logs par site
sudo tail -f /var/log/nginx/admin-access.log
```

### Système

```bash
# Espace disque
df -h

# Mémoire
free -h

# CPU et processus
htop

# Connexions réseau
sudo netstat -tulpn
```

---

## 🔐 Sécurité

### 1. Firewall

```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
sudo ufw status
```

### 2. Fail2ban

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. SSH

```bash
# Désactiver le login root
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no

# Redémarrer SSH
sudo systemctl restart sshd
```

### 4. Mises à jour automatiques

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 💾 Backup

### Script de backup

```bash
nano ~/backup.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/home/swigs/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le dossier
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --out=$BACKUP_DIR/mongo_$DATE

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/speed-l/uploads

# Backup sites
tar -czf $BACKUP_DIR/sites_$DATE.tar.gz /var/www/speedl-test /var/www/admin

# Supprimer les backups > 7 jours
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup terminé: $DATE"
```

```bash
chmod +x ~/backup.sh

# Tester
~/backup.sh

# Automatiser (cron quotidien à 2h)
crontab -e
# Ajouter:
0 2 * * * /home/swigs/backup.sh >> /home/swigs/backup.log 2>&1
```

---

## 🐛 Troubleshooting

Voir [10-FAQ.md](./10-FAQ.md) pour les problèmes courants.

---

## ✅ Checklist Finale

- [ ] Node.js installé
- [ ] MongoDB installé et démarré
- [ ] Nginx installé et configuré
- [ ] PM2 installé
- [ ] Backend déployé et démarré
- [ ] Admin déployé
- [ ] Site déployé
- [ ] SSL configuré (Certbot)
- [ ] DNS configurés
- [ ] Firewall activé
- [ ] Backups configurés
- [ ] Monitoring en place
- [ ] Logs accessibles
- [ ] Tests effectués

---

**Félicitations ! SWIGS CMS est déployé ! 🎉**

**Prochaine étape** : [07-NOUVEAU-SITE.md](./07-NOUVEAU-SITE.md)
