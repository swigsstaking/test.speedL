# 🚀 Déploiement et Test en Local (IP Locale)

## 📋 Prérequis
- Firewall configuré (ports 22, 80, 443, 3000)
- MongoDB installé et en cours d'exécution
- Node.js 18+ installé

---

## 1️⃣ Connexion au serveur

```bash
ssh corentin@swigs.online
# ou
ssh corentin@<IP_LOCALE>
```

---

## 2️⃣ Mise à jour du code depuis GitHub

```bash
# Aller dans le dossier du projet
cd ~/swigs-cms

# Récupérer les dernières modifications
git pull origin main
```

---

## 3️⃣ Backend - Installation et démarrage

```bash
# Aller dans le dossier backend
cd ~/swigs-cms/backend

# Installer les dépendances (si nouvelles)
npm install

# Vérifier que MongoDB tourne
sudo systemctl status mongod

# Si MongoDB n'est pas démarré
sudo systemctl start mongod

# Lancer le seed (première fois uniquement)
npm run seed

# Démarrer le backend avec PM2
pm2 restart swigs-api || pm2 start server.js --name swigs-api

# Vérifier les logs
pm2 logs swigs-api --lines 50
```

---

## 4️⃣ Admin Panel - Build et déploiement

```bash
# Aller dans le dossier admin
cd ~/swigs-cms/admin

# Installer les dépendances (si nouvelles)
npm install

# Build de production
npm run build

# Copier les fichiers buildés vers Nginx
sudo rm -rf /var/www/admin.swigs.online/html/*
sudo cp -r dist/* /var/www/admin.swigs.online/html/

# Vérifier les permissions
sudo chown -R www-data:www-data /var/www/admin.swigs.online/html
```

---

## 5️⃣ Configuration Nginx pour l'admin

Créer/modifier le fichier de configuration :

```bash
sudo nano /etc/nginx/sites-available/admin.swigs.online
```

Contenu :

```nginx
server {
    listen 80;
    server_name admin.swigs.online;

    root /var/www/admin.swigs.online/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing - toutes les routes vers index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy pour l'API backend
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Activer le site et recharger Nginx :

```bash
# Créer le lien symbolique (si pas déjà fait)
sudo ln -s /etc/nginx/sites-available/admin.swigs.online /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

---

## 6️⃣ Test via IP locale

### A. Trouver l'IP locale du serveur

```bash
# Sur le serveur
ip addr show | grep "inet " | grep -v 127.0.0.1
```

Exemple de sortie : `192.168.1.100`

### B. Ajouter l'entrée dans /etc/hosts (sur votre Mac)

```bash
# Sur votre Mac
sudo nano /etc/hosts
```

Ajouter :
```
192.168.1.100  admin.swigs.online
192.168.1.100  swigs.online
```

### C. Tester dans le navigateur

Ouvrir : `http://admin.swigs.online`

**Identifiants par défaut :**
- Email : `admin@swigs.com`
- Mot de passe : `Admin123!`

---

## 7️⃣ Vérifications et debugging

### Vérifier que le backend tourne

```bash
# Statut PM2
pm2 status

# Logs du backend
pm2 logs swigs-api --lines 100

# Tester l'API directement
curl http://localhost:3000/api/health
```

### Vérifier Nginx

```bash
# Statut Nginx
sudo systemctl status nginx

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Vérifier MongoDB

```bash
# Statut MongoDB
sudo systemctl status mongod

# Se connecter à MongoDB
mongosh

# Dans mongosh, vérifier les données
use swigs_cms
db.users.find()
db.sites.find()
```

---

## 8️⃣ Commandes utiles

```bash
# Redémarrer tout
pm2 restart all
sudo systemctl reload nginx

# Voir les processus qui écoutent sur les ports
sudo lsof -i :3000  # Backend
sudo lsof -i :80    # Nginx

# Nettoyer les logs PM2
pm2 flush

# Sauvegarder la config PM2
pm2 save
```

---

## 🎯 Checklist de test

- [ ] Backend accessible : `curl http://localhost:3000/api/health`
- [ ] MongoDB contient des données : `mongosh` → `use swigs_cms` → `db.sites.find()`
- [ ] Nginx configuré et en cours d'exécution
- [ ] Admin accessible via `http://admin.swigs.online`
- [ ] Login fonctionne
- [ ] Sélecteur de sites fonctionne
- [ ] Navigation entre les pages fonctionne
- [ ] API calls fonctionnent (pas d'erreurs 401/429/502)

---

## 🐛 Problèmes courants

### Erreur 502 Bad Gateway
→ Le backend ne tourne pas ou n'écoute pas sur le port 3000
```bash
pm2 restart swigs-api
pm2 logs swigs-api
```

### Erreur 404 sur les routes React
→ Nginx ne redirige pas vers index.html
```bash
# Vérifier la config Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Erreur de connexion MongoDB
→ MongoDB n'est pas démarré
```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

### Erreur 401 Unauthorized
→ Token JWT invalide ou expiré
```bash
# Vérifier les logs backend
pm2 logs swigs-api
# Se reconnecter dans l'admin
```

---

## 📝 Notes

- Le port 3000 est temporaire pour les tests
- Plus tard, on fermera le port 3000 dans le firewall
- Tout passera par Nginx (ports 80/443)
- Pour HTTPS, on utilisera Certbot après les tests
