# 🌐 Guide Multi-Domaines

## Architecture Actuelle vs Future

### Avant (Architecture Simple)
```
swigs.online → Site Speed-L
admin.swigs.online → Admin Panel
```

### Après (Architecture Multi-Domaines)
```
# API Centralisée
api.swigs.online → Backend API (MongoDB)

# Admin
admin.swigs.online → Admin Panel

# Sites de Test (sous-domaines)
speedl.swigs.online → Speed-L (test)
site2.swigs.online → Site 2 (test)
site3.swigs.online → Site 3 (test)

# Sites de Production (domaines propres)
speedl.ch → Speed-L (production)
autresite.com → Site 2 (production)
```

---

## 📋 Étape 1 : Migrer l'Architecture

### 1.1 Migrer la Base de Données

```bash
# Sur le serveur
cd ~/websites/speed-l/backend
node src/scripts/migrate-domains.js
```

**Résultat :**
```javascript
// Site Speed-L aura maintenant:
{
  name: "Speed-L",
  slug: "speed-l",
  domain: "swigs.online", // Ancien (rétrocompatibilité)
  domains: [
    { url: "speedl.swigs.online", environment: "test", isPrimary: false },
    { url: "speedl.ch", environment: "production", isPrimary: true }
  ]
}
```

### 1.2 Configurer l'API Centralisée

```bash
# Copier la config Nginx
sudo cp ~/websites/speed-l/nginx-configs/api.conf /etc/nginx/sites-available/api

# Activer le site
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/

# Tester
sudo nginx -t

# Recharger
sudo systemctl reload nginx

# Configurer SSL avec Certbot
sudo certbot --nginx -d api.swigs.online
```

**Vérifier :**
```bash
curl https://api.swigs.online/health
# Devrait retourner: OK

curl https://api.swigs.online/api/sites
# Devrait retourner la liste des sites
```

### 1.3 Renommer swigs.online → speedl.swigs.online

```bash
# Backup de l'ancienne config
sudo cp /etc/nginx/sites-available/speed-l /etc/nginx/sites-available/speed-l.backup

# Copier la nouvelle config
sudo cp ~/websites/speed-l/nginx-configs/speedl-test.conf /etc/nginx/sites-available/speedl-test

# Activer
sudo ln -s /etc/nginx/sites-available/speedl-test /etc/nginx/sites-enabled/

# Tester
sudo nginx -t

# Recharger
sudo systemctl reload nginx

# Configurer SSL
sudo certbot --nginx -d speedl.swigs.online
```

**Important :** Garder `swigs.online` actif pendant la transition (redirection vers `speedl.swigs.online`)

---

## 📋 Étape 2 : Déployer un Nouveau Site

### 2.1 Créer le Site dans l'Admin

1. Aller sur `https://admin.swigs.online`
2. **Paramètres** → Créer un nouveau site
3. Remplir :
   - **Nom** : Mon Nouveau Site
   - **Slug** : mon-site (utilisé pour l'URL)
   - **Domaine principal** : monsite.ch
   - **Domaines** :
     - Test : `monsite.swigs.online`
     - Production : `monsite.ch`

### 2.2 Créer le Dossier du Site

```bash
# Sur le serveur
sudo mkdir -p /var/www/monsite-test
sudo mkdir -p /var/www/monsite-prod

# Permissions
sudo chown -R swigs:www-data /var/www/monsite-test
sudo chown -R swigs:www-data /var/www/monsite-prod
```

### 2.3 Configurer Nginx (Test)

```bash
# Créer la config (copier speedl-test.conf et adapter)
sudo nano /etc/nginx/sites-available/monsite-test
```

```nginx
server {
    listen 80;
    server_name monsite.swigs.online;
    root /var/www/monsite-test;
    
    # ... (même config que speedl-test.conf)
}
```

```bash
# Activer
sudo ln -s /etc/nginx/sites-available/monsite-test /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d monsite.swigs.online
```

### 2.4 Déployer le Code

**Option A : Copier depuis Speed-L (même code)**
```bash
cd ~/websites/speed-l
npm run build

# Copier vers le nouveau site
sudo cp -r dist/* /var/www/monsite-test/
```

**Option B : Code personnalisé**
```bash
# Créer un nouveau dossier
mkdir -p ~/websites/monsite
cd ~/websites/monsite

# Cloner le template ou créer from scratch
# ... build ...

sudo cp -r dist/* /var/www/monsite-test/
```

### 2.5 Configurer les Variables d'Environnement

```bash
# Dans le site
nano .env.production
```

```bash
VITE_API_URL=https://api.swigs.online/api
VITE_SITE_SLUG=mon-site
```

---

## 📋 Étape 3 : Passer en Production

### 3.1 Acheter et Configurer le Domaine

1. Acheter `monsite.ch` chez un registrar
2. Configurer les DNS :
   ```
   Type    Nom    Valeur
   A       @      IP_DU_SERVEUR
   A       www    IP_DU_SERVEUR
   ```

3. Attendre la propagation DNS (24-48h max)

### 3.2 Configurer Nginx (Production)

```bash
# Copier la config prod
sudo cp ~/websites/speed-l/nginx-configs/speedl-prod.conf /etc/nginx/sites-available/monsite-prod

# Adapter pour le nouveau site
sudo nano /etc/nginx/sites-available/monsite-prod
```

Modifier :
- `server_name monsite.ch www.monsite.ch;`
- `root /var/www/monsite-prod;`
- Logs : `/var/log/nginx/monsite-prod-*.log`

```bash
# Activer
sudo ln -s /etc/nginx/sites-available/monsite-prod /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d monsite.ch -d www.monsite.ch
```

### 3.3 Déployer en Production

```bash
cd ~/websites/monsite
npm run build

sudo cp -r dist/* /var/www/monsite-prod/
```

---

## 🔄 Workflow de Développement

### Pour Speed-L

```bash
# Développement local
npm run dev

# Build
npm run build

# Déployer sur test
sudo cp -r dist/* /var/www/speedl-test/

# Tester sur https://speedl.swigs.online

# Si OK, déployer en prod (quand speedl.ch sera actif)
sudo cp -r dist/* /var/www/speedl-prod/
```

### Pour un Nouveau Site

```bash
# 1. Créer dans l'admin
# 2. Créer les dossiers
# 3. Configurer Nginx (test)
# 4. Développer
# 5. Déployer sur test
# 6. Valider
# 7. Acheter domaine
# 8. Configurer Nginx (prod)
# 9. Déployer en prod
```

---

## 📊 Structure des Dossiers

```
/var/www/
├── admin/                    # Admin Panel
├── speedl-test/              # Speed-L (test)
├── speedl-prod/              # Speed-L (production)
├── monsite-test/             # Nouveau site (test)
├── monsite-prod/             # Nouveau site (production)
└── speed-l/
    └── uploads/              # Uploads partagés (via API)
```

---

## 🔐 CORS et Sécurité

### API Configuration

L'API (`api.swigs.online`) autorise :
- Tous les `*.swigs.online` (test)
- Tous les domaines de production configurés dans la DB

### Nginx CORS

```nginx
# Dans api.conf
if ($http_origin ~* ^https?://(.*\.)?swigs\.online$) {
    set $cors_origin $http_origin;
}
if ($http_origin ~* ^https?://(.*\.)?speedl\.ch$) {
    set $cors_origin $http_origin;
}
```

**Pour ajouter un nouveau domaine :**
```nginx
if ($http_origin ~* ^https?://(.*\.)?monsite\.ch$) {
    set $cors_origin $http_origin;
}
```

---

## 📝 Checklist Nouveau Site

- [ ] Créer le site dans l'admin
- [ ] Configurer les domaines (test + prod)
- [ ] Créer les dossiers `/var/www/`
- [ ] Configurer Nginx (test)
- [ ] Activer SSL (test)
- [ ] Déployer le code (test)
- [ ] Tester `https://monsite.swigs.online`
- [ ] Acheter le domaine de production
- [ ] Configurer les DNS
- [ ] Configurer Nginx (prod)
- [ ] Activer SSL (prod)
- [ ] Ajouter CORS dans `api.conf`
- [ ] Déployer le code (prod)
- [ ] Tester `https://monsite.ch`

---

## 🐛 Troubleshooting

### Site ne charge pas

```bash
# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Vérifier les logs
sudo tail -f /var/log/nginx/monsite-test-error.log

# Vérifier les permissions
ls -la /var/www/monsite-test/
```

### API ne répond pas

```bash
# Vérifier le backend
pm2 status
pm2 logs swigs-api

# Tester l'API directement
curl http://localhost:3000/api/health
curl https://api.swigs.online/health
```

### CORS Error

```bash
# Vérifier la config CORS dans api.conf
sudo nano /etc/nginx/sites-available/api

# Ajouter le domaine si nécessaire
# Recharger Nginx
sudo systemctl reload nginx
```

---

## 🎯 Avantages de cette Architecture

✅ **API Centralisée** : Une seule source de vérité  
✅ **Multi-sites** : Gérer plusieurs sites depuis un seul admin  
✅ **Environnements** : Test et production séparés  
✅ **Scalabilité** : Facile d'ajouter de nouveaux sites  
✅ **Maintenance** : Un seul backend à maintenir  
✅ **Sécurité** : CORS configuré par domaine  
✅ **Performance** : Sites statiques + API rapide  

---

**Prêt pour gérer des dizaines de sites ! 🚀**
