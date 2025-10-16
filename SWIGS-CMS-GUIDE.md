# 🚀 Guide complet SWIGS CMS

Guide de démarrage rapide pour le système de gestion de contenu multi-sites SWIGS.

## 📋 Vue d'ensemble

SWIGS CMS est un système de gestion de contenu moderne permettant de gérer plusieurs sites web depuis une seule interface d'administration.

### Architecture

```
SWIGS CMS
├── Backend API (Node.js + Express + MongoDB)
│   └── Port 3000
├── Interface Admin (React + Vite)
│   └── Port 5174
└── Sites Web (React statiques)
    └── Servis par Nginx
```

---

## 🛠️ Installation complète

### 1. Prérequis

```bash
# Vérifier les versions
node --version  # v18 ou supérieur
npm --version   # v9 ou supérieur
mongo --version # v6 ou supérieur
```

### 2. Installer MongoDB

```bash
# Sur Ubuntu
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 3. Installer le Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
nano .env  # Modifier les variables

# Créer le dossier uploads
mkdir uploads

# Initialiser la base de données
npm run seed

# Démarrer le serveur
npm run dev
```

Le backend sera accessible sur `http://localhost:3000/api`

### 4. Installer l'Interface Admin

```bash
cd admin

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env

# Démarrer l'interface
npm run dev
```

L'admin sera accessible sur `http://localhost:5174`

---

## 🎯 Premier démarrage

### 1. Connexion à l'admin

1. Ouvrez `http://localhost:5174`
2. Connectez-vous avec :
   - Email : `admin@swigs.online`
   - Mot de passe : `Admin123!`

### 2. Vérifier le site Speed-L

Le script de seed a créé automatiquement :
- ✅ Un utilisateur admin
- ✅ Le site Speed-L
- ✅ 3 cours (sensibilisation, moto, secours)
- ✅ 2 entrées SEO

### 3. Gérer les cours

1. Cliquez sur **"Cours"** dans la sidebar
2. Vous verrez les 3 cours créés
3. Cliquez sur **"Ajouter un cours"** pour en créer un nouveau
4. Modifiez ou supprimez des cours existants

### 4. Optimiser le SEO

1. Cliquez sur **"SEO"** dans la sidebar
2. Sélectionnez une page (Accueil, Cours, etc.)
3. Remplissez les champs :
   - Titre (max 60 caractères)
   - Description (max 160 caractères)
   - Mots-clés
   - Open Graph
4. Cliquez sur **"Enregistrer"**

---

## 📊 Utilisation quotidienne

### Ajouter un nouveau cours

1. **Cours** → **Ajouter un cours**
2. Remplir :
   - Titre (ex: "Cours de sensibilisation")
   - Numéro (ex: "N°609")
   - Description
   - Catégorie
   - Prix (CHF)
   - Durée (ex: "2 soirées")
3. Ajouter les dates :
   - Jour (ex: "Mercredi")
   - Date (sélecteur de date)
   - Heure (ex: "18h25")
4. **Enregistrer**

### Modifier le SEO d'une page

1. **SEO** → Sélectionner la page
2. Modifier les champs
3. Vérifier l'aperçu Google
4. **Enregistrer**

### Changer de site

1. Utiliser le sélecteur en haut de la sidebar
2. Tous les cours et SEO s'adapteront automatiquement

---

## 🚀 Déploiement en production

### 1. Préparer le serveur Ubuntu

```bash
# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installer MongoDB
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Installer PM2
sudo npm install -g pm2

# Installer Nginx
sudo apt install -y nginx
```

### 2. Déployer le Backend

```bash
# Sur votre serveur
cd ~/websites
git clone votre-repo swigs-cms
cd swigs-cms/backend

# Installer et configurer
npm install
cp .env.example .env
nano .env  # Configurer pour production

# Initialiser la DB
npm run seed

# Démarrer avec PM2
pm2 start server.js --name swigs-api
pm2 save
pm2 startup
```

### 3. Déployer l'Admin

```bash
# Sur votre Mac, builder l'admin
cd admin
npm run build

# Copier sur le serveur
rsync -avz dist/ user@server:/var/www/admin-swigs/
```

### 4. Configurer Nginx

```bash
# Sur le serveur
sudo nano /etc/nginx/sites-available/swigs-admin
```

```nginx
server {
    listen 80;
    server_name admin.swigs.online;

    root /var/www/admin-swigs;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer et recharger
sudo ln -s /etc/nginx/sites-available/swigs-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Ajouter HTTPS
sudo certbot --nginx -d admin.swigs.online
```

---

## 🔄 Workflow de mise à jour

### Mettre à jour les cours

1. Modifier dans l'admin
2. Les changements sont instantanés dans la DB
3. Rebuilder le site frontend si nécessaire

### Mettre à jour le SEO

1. Modifier dans l'admin
2. Rebuilder le site frontend pour appliquer les changements

### Déployer une mise à jour

```bash
# Backend
ssh user@server
cd ~/websites/swigs-cms/backend
git pull
npm install
pm2 restart swigs-api

# Admin
cd admin
npm run build
rsync -avz dist/ user@server:/var/www/admin-swigs/
```

---

## 🔐 Sécurité

### Changer le mot de passe admin

1. Se connecter à l'admin
2. Aller dans le profil (à venir)
3. Ou via MongoDB :

```bash
mongo
use swigs-cms
db.users.updateOne(
  { email: "admin@swigs.online" },
  { $set: { password: "nouveau-hash-bcrypt" } }
)
```

### Sauvegarder la base de données

```bash
# Backup
mongodump --db swigs-cms --out /backup/swigs-cms-$(date +%Y%m%d)

# Restore
mongorestore --db swigs-cms /backup/swigs-cms-20251016/swigs-cms
```

---

## 📞 Support

### Logs Backend

```bash
pm2 logs swigs-api
```

### Logs Nginx

```bash
sudo tail -f /var/log/nginx/error.log
```

### Problèmes courants

**Erreur de connexion à MongoDB**
```bash
sudo systemctl status mongodb
sudo systemctl restart mongodb
```

**API non accessible**
```bash
pm2 status
pm2 restart swigs-api
```

**Admin ne charge pas**
- Vérifier que l'API est accessible
- Vérifier les CORS dans le backend
- Vérifier la configuration Nginx

---

## 🎉 Félicitations !

Votre CMS SWIGS est maintenant opérationnel ! Vous pouvez :
- ✅ Gérer plusieurs sites depuis une interface
- ✅ Modifier les cours facilement
- ✅ Optimiser le SEO
- ✅ Uploader des médias (à venir)
- ✅ Gérer le contenu (à venir)

**Bon travail ! 🚀**
