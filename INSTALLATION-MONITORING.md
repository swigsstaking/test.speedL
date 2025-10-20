# 🚀 Installation SWIGS Control Center

Guide complet d'installation du système de monitoring.

## 📋 Architecture

```
monitoring.swigs.online (Frontend)
         ↓
    Nginx (Proxy)
         ↓
monitoring-api (Backend - Port 3001)
         ↓
    MongoDB
         ↑
monitoring-agent (Sur chaque serveur)
```

---

## 🔧 Installation sur le Serveur

### 1️⃣ Backend API

```bash
# Se connecter au serveur
ssh swigs@votre-serveur

# Aller dans le projet
cd ~/websites/speed-l
git pull origin main

# Installer l'API
cd monitoring-api
npm install

# Créer .env
cp .env.example .env
nano .env
```

**Configurer `.env`** :
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/swigs-monitoring
JWT_SECRET=votre-secret-super-securise-changez-moi
CORS_ORIGIN=https://monitoring.swigs.online
NODE_ENV=production
```

**Démarrer avec PM2** :
```bash
pm2 start npm --name monitoring-api -- start
pm2 save
```

---

### 2️⃣ Frontend

```bash
cd ~/websites/speed-l/monitoring
npm install
npm run build

# Créer le dossier web
sudo mkdir -p /var/www/monitoring
sudo chown -R swigs:swigs /var/www/monitoring

# Copier les fichiers
sudo cp -r dist/* /var/www/monitoring/
```

---

### 3️⃣ Nginx

```bash
# Copier la config
sudo cp ~/websites/speed-l/nginx-configs/monitoring.swigs.online.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/monitoring.swigs.online.conf /etc/nginx/sites-enabled/

# Obtenir certificat SSL
sudo certbot --nginx -d monitoring.swigs.online

# Tester et recharger
sudo nginx -t
sudo systemctl reload nginx
```

---

### 4️⃣ Agent Serveur

**Sur chaque serveur à monitorer** :

```bash
cd ~/websites/speed-l/monitoring-agent
npm install

# Créer .env
cp .env.example .env
nano .env
```

**Configurer `.env`** :
```env
MONITORING_API=https://monitoring.swigs.online/api
SERVER_ID=server-1
SERVER_NAME=Production Server 1
SERVER_IP=192.168.1.100
SERVER_LOCATION=Paris, France
COLLECT_INTERVAL=10000
```

**Démarrer avec PM2** :
```bash
pm2 start npm --name monitoring-agent -- start
pm2 save
```

---

## ✅ Vérification

### Backend API
```bash
# Logs
pm2 logs monitoring-api

# Test
curl https://monitoring.swigs.online/api/health
```

### Agent
```bash
# Logs
pm2 logs monitoring-agent

# Doit afficher :
# 🟢 CPU: 45.2% | 🟢 RAM: 62.1% | 💾 Disk: 38.5% | 📡 Net: ↓1.25MB/s ↑0.89MB/s
```

### Frontend
```bash
# Ouvrir dans le navigateur
https://monitoring.swigs.online
```

---

## 📊 Utilisation

### Accès
- **URL** : https://monitoring.swigs.online
- **Auth** : À implémenter (JWT)

### Fonctionnalités
- ✅ Dashboard temps réel
- ✅ Monitoring serveurs (CPU, RAM, Disque, Réseau)
- ✅ Monitoring sites (Uptime, Latence, SSL)
- ✅ Analytics & Coûts
- ✅ WebSocket temps réel
- ✅ Historique 30 jours

---

## 🔄 Mise à Jour

```bash
# Backend
cd ~/websites/speed-l/monitoring-api
git pull origin main
npm install
pm2 restart monitoring-api

# Frontend
cd ~/websites/speed-l/monitoring
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/monitoring/

# Agent
cd ~/websites/speed-l/monitoring-agent
git pull origin main
npm install
pm2 restart monitoring-agent
```

---

## 🐛 Dépannage

### API ne démarre pas
```bash
# Vérifier MongoDB
sudo systemctl status mongod

# Vérifier les logs
pm2 logs monitoring-api --err

# Redémarrer
pm2 restart monitoring-api
```

### Agent n'envoie pas de données
```bash
# Vérifier les logs
pm2 logs monitoring-agent

# Tester l'API
curl https://monitoring.swigs.online/api/health

# Vérifier le .env
cat ~/websites/speed-l/monitoring-agent/.env
```

### Frontend ne charge pas
```bash
# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Vérifier les fichiers
ls -la /var/www/monitoring/

# Logs Nginx
sudo tail -f /var/log/nginx/monitoring.error.log
```

---

## 📈 Monitoring de Plusieurs Serveurs

Pour monitorer un 2ème serveur :

```bash
# Sur le 2ème serveur
git clone https://github.com/swigsstaking/test.speedL.git
cd test.speedL/monitoring-agent
npm install

# Créer .env avec SERVER_ID différent
cat > .env << 'EOF'
MONITORING_API=https://monitoring.swigs.online/api
SERVER_ID=server-2
SERVER_NAME=Production Server 2
SERVER_IP=192.168.1.101
SERVER_LOCATION=Amsterdam, NL
COLLECT_INTERVAL=10000
EOF

# Démarrer
pm2 start npm --name monitoring-agent -- start
pm2 save
```

---

## 🎯 Prochaines Améliorations

- [ ] Authentification JWT
- [ ] Alertes email/SMS
- [ ] Export rapports PDF
- [ ] Prédictions ML
- [ ] App mobile
- [ ] Intégration Slack/Discord

---

## 📞 Support

**En cas de problème** :
1. Vérifier les logs : `pm2 logs`
2. Vérifier MongoDB : `sudo systemctl status mongod`
3. Vérifier Nginx : `sudo nginx -t`

---

*SWIGS Control Center v1.0.0*
