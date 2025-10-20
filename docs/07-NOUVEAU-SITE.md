# 🆕 Créer un Nouveau Site - Guide Complet

Ce guide détaille toutes les étapes pour créer et déployer un nouveau site avec SWIGS CMS.

---

## 📋 Checklist Complète

### Phase 1 : Préparation
- [ ] Définir le nom du site
- [ ] Choisir le slug (ex: `mon-site`)
- [ ] Vérifier la disponibilité du domaine
- [ ] Préparer le contenu initial (textes, images)

### Phase 2 : Configuration Backend
- [ ] Créer le site dans l'admin
- [ ] Configurer les domaines (test + prod)
- [ ] Configurer l'email pour les formulaires
- [ ] Ajouter le logo et favicon
- [ ] Créer les données SEO initiales

### Phase 3 : Déploiement Test
- [ ] Créer les dossiers sur le serveur
- [ ] Configurer Nginx (test)
- [ ] Activer SSL (Certbot)
- [ ] Déployer le code
- [ ] Tester le site

### Phase 4 : Production (Optionnel)
- [ ] Acheter le domaine
- [ ] Configurer les DNS
- [ ] Configurer Nginx (prod)
- [ ] Activer SSL (prod)
- [ ] Ajouter CORS dans api.conf
- [ ] Déployer en production
- [ ] Tester

---

## 🚀 Étapes Détaillées

### ÉTAPE 1 : Créer le Site dans l'Admin

1. **Se connecter à l'admin**
   ```
   https://admin.swigs.online
   Email: admin@swigs.online
   ```

2. **Créer un nouveau site**
   - Aller dans **Paramètres** (si vous êtes admin)
   - Ou demander à un admin de créer le site

3. **Remplir les informations**
   ```
   Nom: Mon Nouveau Site
   Slug: mon-site
   Domaine principal: monsite.ch
   Description: Description du site
   ```

4. **Configurer les domaines**
   ```javascript
   Domaines:
   [
     { url: "monsite.swigs.online", environment: "test", isPrimary: false },
     { url: "monsite.ch", environment: "production", isPrimary: true }
   ]
   ```

5. **Configurer les contacts**
   ```
   Email: contact@monsite.ch
   Email formulaires: contact@monsite.ch
   Téléphone: +41 XX XXX XX XX
   Adresse: Rue Example 1, 1000 Ville
   ```

6. **Uploader le logo et favicon**
   - Aller dans **Médias**
   - Uploader le logo (format PNG/SVG, max 5MB)
   - Uploader le favicon (format ICO/PNG, 32x32px)
   - Retourner dans **Paramètres** → Assigner le logo et favicon

7. **Créer le SEO initial**
   - Aller dans **SEO**
   - Créer les pages : `home`, `courses`, `contact`, etc.
   - Remplir les meta tags pour chaque page

---

### ÉTAPE 2 : Préparer le Serveur

**Sur le serveur (SSH) :**

```bash
# Se connecter
ssh swigs@votre-serveur.com

# Créer les dossiers
sudo mkdir -p /var/www/monsite-test
sudo mkdir -p /var/www/monsite-prod

# Permissions
sudo chown -R swigs:www-data /var/www/monsite-test
sudo chown -R swigs:www-data /var/www/monsite-prod
sudo chmod -R 755 /var/www/monsite-test
sudo chmod -R 755 /var/www/monsite-prod
```

---

### ÉTAPE 3 : Configurer Nginx (Test)

1. **Créer la configuration**
   ```bash
   sudo nano /etc/nginx/sites-available/monsite-test
   ```

2. **Copier cette configuration**
   ```nginx
   server {
       listen 80;
       listen [::]:80;
       server_name monsite.swigs.online;

       root /var/www/monsite-test;
       index index.html;

       # Logs
       access_log /var/log/nginx/monsite-test-access.log;
       error_log /var/log/nginx/monsite-test-error.log;

       # Compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
       gzip_vary on;

       # Proxy API
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

       # Uploads
       location /uploads {
           alias /var/www/speed-l/uploads;
           expires 30d;
           add_header Cache-Control "public, immutable";
           try_files $uri =404;
       }

       # SPA
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache assets (exclure /api/)
       location ~* ^/(?!api/).+\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # Sécurité
       location ~ /\. {
           deny all;
       }
   }
   ```

3. **Activer le site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/monsite-test /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Configurer SSL**
   ```bash
   sudo certbot --nginx -d monsite.swigs.online
   ```

---

### ÉTAPE 4 : Déployer le Code

**Option A : Utiliser le même code que Speed-L**

```bash
# Sur votre machine locale
cd ~/CascadeProjects/windsurf-project-4

# Build le site
npm run build

# Copier vers le serveur
scp -r dist/* swigs@serveur:/tmp/monsite-build/

# Sur le serveur
ssh swigs@serveur
sudo cp -r /tmp/monsite-build/* /var/www/monsite-test/
sudo chown -R swigs:www-data /var/www/monsite-test
rm -rf /tmp/monsite-build
```

**Option B : Code personnalisé**

```bash
# Créer un nouveau projet
cd ~/websites
mkdir monsite
cd monsite

# Copier le template
cp -r ../speed-l/src .
cp -r ../speed-l/package.json .
cp -r ../speed-l/vite.config.js .
cp -r ../speed-l/tailwind.config.js .

# Personnaliser
# ... modifier les composants, couleurs, etc.

# Build
npm install
npm run build

# Déployer
sudo cp -r dist/* /var/www/monsite-test/
```

---

### ÉTAPE 5 : Générer le SEO

```bash
# Sur le serveur
cd ~/websites/speed-l/backend

# Générer le SEO pour tous les sites
npm run generate-seo

# Le fichier sera créé dans:
# ~/websites/speed-l/src/data/seo.json (pour speed-l)
# ~/websites/monsite/src/data/seo.json (pour monsite, si code séparé)
```

---

### ÉTAPE 6 : Tester le Site (Test)

1. **Vérifier le site**
   ```
   https://monsite.swigs.online
   ```

2. **Tester les pages**
   - [ ] Page d'accueil
   - [ ] Page cours
   - [ ] Page contact
   - [ ] Formulaire de contact (envoi email)
   - [ ] Formulaire bons cadeaux

3. **Vérifier le SEO**
   - Inspecter les meta tags (F12 → Elements → `<head>`)
   - Vérifier title, description, og:tags

4. **Vérifier les logs**
   ```bash
   # Nginx
   sudo tail -f /var/log/nginx/monsite-test-error.log
   
   # Backend
   pm2 logs swigs-api
   ```

---

### ÉTAPE 7 : Acheter le Domaine (Production)

1. **Acheter le domaine**
   - Aller sur un registrar (Infomaniak, Gandi, etc.)
   - Acheter `monsite.ch`

2. **Configurer les DNS**
   ```
   Type    Nom    Valeur              TTL
   A       @      IP_DU_SERVEUR       3600
   A       www    IP_DU_SERVEUR       3600
   ```

3. **Attendre la propagation**
   - Peut prendre 24-48h
   - Vérifier : `dig monsite.ch`

---

### ÉTAPE 8 : Configurer Nginx (Production)

1. **Créer la configuration**
   ```bash
   sudo nano /etc/nginx/sites-available/monsite-prod
   ```

2. **Configuration production**
   ```nginx
   # Redirection www → non-www
   server {
       listen 80;
       listen [::]:80;
       server_name www.monsite.ch;
       return 301 https://monsite.ch$request_uri;
   }

   server {
       listen 80;
       listen [::]:80;
       server_name monsite.ch;

       root /var/www/monsite-prod;
       index index.html;

       # Logs
       access_log /var/log/nginx/monsite-prod-access.log;
       error_log /var/log/nginx/monsite-prod-error.log;

       # Compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
       gzip_vary on;

       # Proxy API (vers API centralisée)
       location /api/ {
           proxy_pass https://api.swigs.online/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host api.swigs.online;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
           
           # CORS
           add_header 'Access-Control-Allow-Origin' 'https://monsite.ch' always;
           add_header 'Access-Control-Allow-Credentials' 'true' always;
       }

       # Uploads (via API)
       location /uploads {
           proxy_pass https://api.swigs.online/uploads;
           expires 30d;
           add_header Cache-Control "public, immutable";
       }

       # SPA
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache assets
       location ~* ^/(?!api/).+\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # Sécurité
       location ~ /\. {
           deny all;
       }

       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
   }
   ```

3. **Activer**
   ```bash
   sudo ln -s /etc/nginx/sites-available/monsite-prod /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **SSL**
   ```bash
   sudo certbot --nginx -d monsite.ch -d www.monsite.ch
   ```

---

### ÉTAPE 9 : Ajouter CORS (API)

**Important** : Autoriser le nouveau domaine dans l'API

```bash
sudo nano /etc/nginx/sites-available/api
```

Ajouter après les autres `if` :

```nginx
if ($http_origin ~* ^https?://(.*\.)?monsite\.ch$) {
    set $cors_origin $http_origin;
}
```

Recharger :
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### ÉTAPE 10 : Déployer en Production

```bash
# Build
cd ~/websites/monsite
npm run build

# Déployer
sudo cp -r dist/* /var/www/monsite-prod/
sudo chown -R swigs:www-data /var/www/monsite-prod
```

---

### ÉTAPE 11 : Tests Finaux

1. **Vérifier le site**
   ```
   https://monsite.ch
   ```

2. **Tests complets**
   - [ ] Toutes les pages chargent
   - [ ] SEO correct (meta tags)
   - [ ] Formulaires fonctionnent
   - [ ] Emails reçus
   - [ ] Images chargent
   - [ ] Pas d'erreurs console
   - [ ] Responsive (mobile/tablet)
   - [ ] Performance (Lighthouse > 90)

3. **Vérifier SSL**
   ```bash
   curl -I https://monsite.ch
   # Doit retourner HTTP/2 200
   ```

---

## 🔄 Workflow de Mise à Jour

### Modifier le Contenu

```
Admin → Modifier → Sauvegarder
```

### Modifier le SEO

```
Admin → SEO → Modifier → Sauvegarder
Admin → Rebuild → Déclencher
Attendre 1-2 min
```

### Modifier le Code

```bash
# Local
git pull
# Modifier le code
npm run build

# Serveur
git pull
npm run build
sudo cp -r dist/* /var/www/monsite-test/
# Tester

# Si OK, déployer en prod
sudo cp -r dist/* /var/www/monsite-prod/
```

---

## 🐛 Troubleshooting

### Site ne charge pas

```bash
# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/monsite-test-error.log

# Vérifier les fichiers
ls -la /var/www/monsite-test/
```

### Formulaires ne fonctionnent pas

```bash
# Vérifier l'email configuré
# Admin → Paramètres → Email pour les formulaires

# Vérifier les logs backend
pm2 logs swigs-api --lines 50

# Tester l'API
curl -X POST https://api.swigs.online/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{"siteId":"xxx","name":"Test","email":"test@test.com","message":"Test"}'
```

### SEO ne se met pas à jour

```bash
# Régénérer le SEO
cd ~/websites/speed-l/backend
npm run generate-seo

# Rebuild le site
npm run rebuild

# Vérifier le fichier
cat ~/websites/speed-l/src/data/seo.json
```

---

## 📊 Temps Estimé

| Étape | Durée |
|-------|-------|
| Préparation | 1-2h |
| Configuration backend | 30min |
| Déploiement test | 1h |
| Tests | 30min |
| **Total Test** | **3-4h** |
| Achat domaine | 15min |
| Configuration prod | 1h |
| Tests finaux | 30min |
| **Total Production** | **+2h** |

**Total complet** : 5-6h pour un nouveau site

---

## ✅ Checklist Finale

- [ ] Site accessible en test
- [ ] Site accessible en prod
- [ ] SEO configuré et fonctionnel
- [ ] Formulaires envoient des emails
- [ ] Logo et favicon affichés
- [ ] Pas d'erreurs console
- [ ] SSL actif (cadenas vert)
- [ ] Performance > 90 (Lighthouse)
- [ ] Responsive OK
- [ ] CORS configuré
- [ ] Backup configuré (recommandé)

---

**Félicitations ! Votre nouveau site est en ligne ! 🎉**

**Prochaine étape** : [08-MAINTENANCE.md](./08-MAINTENANCE.md)
