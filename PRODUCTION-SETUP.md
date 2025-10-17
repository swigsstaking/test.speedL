# 🚀 Guide de mise en production - swigs.online

## 📋 Prérequis

- ✅ Domaine `swigs.online` pointant vers votre serveur
- ✅ Ports 80 et 443 ouverts sur le firewall
- ✅ Serveur Ubuntu avec Node.js, MongoDB, Nginx installés
- ✅ Accès SSH au serveur

---

## 🎯 Étape 1 : Configuration DNS

### Chez votre registrar de domaine :

Créez les enregistrements DNS suivants :

```
Type    Nom     Valeur              TTL
A       @       VOTRE_IP_PUBLIQUE   3600
A       www     VOTRE_IP_PUBLIQUE   3600
A       admin   VOTRE_IP_PUBLIQUE   3600
```

**Vérification** (sur votre Mac) :
```bash
# Attendre 5-10 minutes que le DNS se propage
dig swigs.online
dig www.swigs.online
dig admin.swigs.online
```

---

## 🎯 Étape 2 : Première installation (CLEAN)

### Sur le serveur :

```bash
# 1. Connexion
ssh swigs@VOTRE_IP

# 2. Aller dans le projet
cd ~/websites/speed-l

# 3. Mettre à jour le code
git stash
git pull origin main

# 4. Rendre les scripts exécutables
chmod +x clean-deploy.sh
chmod +x deploy.sh

# 5. Copier les configs Nginx
sudo cp nginx-configs/speed-l.conf /etc/nginx/sites-available/speed-l
sudo cp nginx-configs/admin.conf /etc/nginx/sites-available/admin

# 6. Activer les sites
sudo ln -sf /etc/nginx/sites-available/speed-l /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/admin /etc/nginx/sites-enabled/

# 7. Supprimer la config par défaut de Nginx (si elle existe)
sudo rm -f /etc/nginx/sites-enabled/default

# 8. Configurer le backend
cd backend
cp .env.example .env
nano .env
```

**Dans le fichier `.env`, modifiez :**
```env
NODE_ENV=production
JWT_SECRET=CHANGEZ_MOI_PAR_UNE_VRAIE_CLE_SECRETE_LONGUE
CORS_ORIGIN=https://swigs.online,https://www.swigs.online,https://admin.swigs.online,http://swigs.online,http://www.swigs.online,http://admin.swigs.online
```

**Sauvegardez** : `Ctrl+X` → `Y` → `Enter`

```bash
# 9. Exécuter le script de déploiement clean
cd ~/websites/speed-l
./clean-deploy.sh
```

**Répondez `oui` quand demandé.**

---

## 🎯 Étape 3 : Installer SSL (HTTPS)

```bash
# Installer Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Obtenir les certificats SSL
sudo certbot --nginx -d swigs.online -d www.swigs.online -d admin.swigs.online

# Suivre les instructions :
# - Entrer votre email
# - Accepter les conditions
# - Choisir "2" pour rediriger HTTP vers HTTPS
```

**Certbot va automatiquement :**
- Obtenir les certificats SSL
- Modifier les configs Nginx
- Configurer le renouvellement automatique

**Vérifier le renouvellement automatique :**
```bash
sudo certbot renew --dry-run
```

---

## 🎯 Étape 4 : Vérifications

### 1. Vérifier les services

```bash
# Backend
pm2 status
pm2 logs swigs-api --lines 20

# Nginx
sudo systemctl status nginx
sudo nginx -t

# MongoDB
sudo systemctl status mongodb
```

### 2. Tester les URLs

**Sur votre Mac, ouvrir dans le navigateur :**

1. **Site** : https://swigs.online
   - ✅ Page d'accueil s'affiche
   - ✅ HTTPS actif (cadenas vert)
   - ✅ Redirection de http:// vers https://

2. **Site avec www** : https://www.swigs.online
   - ✅ Fonctionne aussi

3. **Admin** : https://admin.swigs.online
   - ✅ Page de login s'affiche
   - ✅ HTTPS actif
   - ✅ Login fonctionne avec `admin@swigs.online` / `Admin123!`

4. **Cours dynamiques** : https://swigs.online/cours
   - ✅ Les cours s'affichent
   - ✅ Pas d'erreur dans la console

### 3. Tester l'API

```bash
# Sur le serveur
curl http://localhost:3000/api/health
curl http://localhost:3000/api/sites

# Depuis l'extérieur (sur votre Mac)
curl https://swigs.online/api/sites
curl https://admin.swigs.online/api/sites
```

---

## 🔄 Étape 5 : Mises à jour futures (CLEAN)

### Quand vous modifiez le code :

**Sur votre Mac :**
```bash
cd /Users/corentinflaction/CascadeProjects/windsurf-project-4
git add .
git commit -m "Description des changements"
git push origin main
```

**Sur le serveur :**
```bash
ssh swigs@VOTRE_IP
cd ~/websites/speed-l

# Mise à jour CLEAN (recommandé)
git stash
git pull origin main
./clean-deploy.sh
```

**OU mise à jour rapide (si pas de gros changements) :**
```bash
git stash
git pull origin main
./deploy.sh
```

---

## 🔄 Workflow de mise à jour CLEAN (sans anciennes versions)

Le script `clean-deploy.sh` fait :

1. ✅ **Arrête TOUS les processus** (PM2, Node, Vite)
2. ✅ **Supprime tous les anciens builds** (dist/, node_modules/.vite, etc.)
3. ✅ **Nettoie /var/www** complètement
4. ✅ **Rebuild tout** (admin + site)
5. ✅ **Redéploie proprement**
6. ✅ **Redémarre les services**

**Avantages :**
- Aucune ancienne version ne peut traîner
- Pas de conflit de fichiers
- Pas de cache problématique
- Déploiement propre à 100%

---

## 🐛 Troubleshooting

### Le site ne charge pas

```bash
# Vérifier Nginx
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log

# Vérifier les fichiers
ls -la /var/www/speed-l/
ls -la /var/www/admin/
```

### L'admin ne se connecte pas à l'API

```bash
# Vérifier le backend
pm2 logs swigs-api
curl http://localhost:3000/api/health

# Vérifier CORS dans backend/.env
cat ~/websites/speed-l/backend/.env | grep CORS
```

### Erreur 502 Bad Gateway

```bash
# Le backend ne répond pas
pm2 restart swigs-api
pm2 logs swigs-api

# Vérifier MongoDB
sudo systemctl status mongodb
```

### Les cours ne s'affichent pas

```bash
# Vérifier la base de données
mongosh
use swigs-cms
db.sites.find()
db.courses.find()

# Si vide, réinitialiser
cd ~/websites/speed-l/backend
npm run seed
```

---

## 📊 Monitoring

### Logs en temps réel

```bash
# Backend
pm2 logs swigs-api

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MongoDB
sudo tail -f /var/log/mongodb/mongod.log
```

### Statistiques PM2

```bash
pm2 monit
```

---

## 🔒 Sécurité

### Checklist de sécurité :

- [ ] JWT_SECRET changé dans `backend/.env`
- [ ] HTTPS actif avec certificats SSL
- [ ] Firewall configuré (ports 80, 443, 22 seulement)
- [ ] Mot de passe admin changé après première connexion
- [ ] MongoDB accessible uniquement en local
- [ ] Sauvegardes régulières configurées

### Changer le mot de passe admin :

1. Se connecter à https://admin.swigs.online
2. Aller dans **Paramètres** → **Profil**
3. Changer le mot de passe

---

## 📦 Sauvegardes

### Sauvegarder MongoDB

```bash
# Créer une sauvegarde
mongodump --db swigs-cms --out ~/backups/$(date +%Y%m%d)

# Restaurer une sauvegarde
mongorestore --db swigs-cms ~/backups/20241017/swigs-cms
```

### Sauvegarder les uploads

```bash
# Copier les fichiers uploadés
tar -czf ~/backups/uploads-$(date +%Y%m%d).tar.gz ~/websites/speed-l/backend/uploads
```

---

## ✅ Checklist finale

- [ ] DNS configuré et propagé
- [ ] `clean-deploy.sh` exécuté avec succès
- [ ] SSL installé avec Certbot
- [ ] https://swigs.online fonctionne
- [ ] https://admin.swigs.online fonctionne
- [ ] Login admin fonctionne
- [ ] Cours s'affichent sur le site
- [ ] Backend répond à l'API
- [ ] Logs sans erreur
- [ ] Mot de passe admin changé
- [ ] Sauvegardes configurées

---

**Votre site est maintenant en production ! 🎉**
