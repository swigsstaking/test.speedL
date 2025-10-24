# 🆕 Créer un Nouveau Site - Guide Rapide

Guide simple pour créer et configurer un nouveau site dans le système SWIGS CMS.

---

## 📋 Étapes Rapides

### 1. Créer le Site dans l'Admin

1. **Aller sur l'Admin** : https://admin.swigs.online
2. **Se connecter** avec admin@swigs.online
3. **Paramètres** → Sites (si admin) ou demander à un admin
4. **Cliquer sur "Créer un site"**
5. **Remplir** :
   - **Nom** : Mon Nouveau Site
   - **Slug** : mon-site (utilisé pour les uploads)
   - **Domaine** : monsite.swigs.online
   - **Description** : Description du site

### 2. Configurer le Site

#### Pages SEO (optionnel)
- Les pages par défaut sont : home, cours, permis, bons-cadeaux, contact
- Pour ajouter des pages custom, modifier le site et ajouter dans `pages`:
  ```json
  [
    { "value": "about", "label": "À propos" },
    { "value": "services", "label": "Services" }
  ]
  ```

#### Sections Content (optionnel)
- Les sections par défaut sont : hero, about, services, testimonials, faq, footer
- Pour ajouter des sections custom, modifier le site et ajouter dans `sections`:
  ```json
  [
    { "value": "pricing", "label": "Tarifs" },
    { "value": "team", "label": "Équipe" }
  ]
  ```

### 3. Uploader le Logo

1. **Aller dans Médias**
2. **Sélectionner le site** dans le dropdown
3. **Uploader le logo** (PNG/SVG, max 5MB)
4. Les médias sont automatiquement isolés par site dans `/var/www/uploads/{slug}/`

### 4. Créer le SEO

1. **Aller dans SEO**
2. **Pour chaque page** :
   - Sélectionner la page
   - Remplir : title, description, keywords
   - Remplir Open Graph : ogTitle, ogDescription
   - Sauvegarder

### 5. Créer le Contenu

1. **Aller dans Content**
2. **Pour chaque section** :
   - Sélectionner la section
   - Cliquer "Nouveau contenu"
   - Remplir les données en JSON
   - Sauvegarder

### 6. Ajouter au Monitoring (optionnel)

1. **Aller sur Control Center** : https://monitoring.swigs.online
2. **Sites** → **Ajouter un site**
3. **Remplir** :
   - **Nom** : Mon Nouveau Site
   - **Slug** : mon-site
   - **Domaine** : monsite.swigs.online

---

## 🚀 Déploiement Serveur

### Créer les Dossiers

```bash
ssh swigs@serveur
sudo mkdir -p /var/www/mon-site
sudo mkdir -p /var/www/uploads/mon-site
sudo chown -R swigs:www-data /var/www/mon-site /var/www/uploads/mon-site
sudo chmod -R 775 /var/www/mon-site /var/www/uploads/mon-site
```

### Configurer Nginx

```bash
sudo nano /etc/nginx/sites-available/mon-site
```

```nginx
server {
    listen 80;
    server_name monsite.swigs.online;

    root /var/www/mon-site;
    index index.html;

    # Logs
    access_log /var/log/nginx/mon-site-access.log;
    error_log /var/log/nginx/mon-site-error.log;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # API
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads
    location /uploads {
        alias /var/www/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Activer et SSL

```bash
sudo ln -s /etc/nginx/sites-available/mon-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d monsite.swigs.online
```

### Déployer le Code

```bash
# Utiliser le même build que Speed-L ou un build custom
cd ~/CascadeProjects/windsurf-project-4
npm run build
sudo cp -r dist/* /var/www/mon-site/
sudo chown -R swigs:www-data /var/www/mon-site
```

---

## ✅ Vérifications

### Tester l'Upload de Médias

1. Admin → Médias
2. Sélectionner le nouveau site
3. Uploader une image
4. Vérifier l'URL : `https://monsite.swigs.online/uploads/mon-site/xxx.png`

### Tester le SEO

1. Admin → SEO → Page home
2. Remplir et sauvegarder
3. Ouvrir le site : https://monsite.swigs.online
4. Inspecter les meta tags (F12 → Elements → `<head>`)

### Tester le Content

1. Admin → Content → Section hero
2. Créer un contenu
3. Vérifier qu'il apparaît sur le site

---

## 🎯 Structure des Données

### Médias
- **Fichiers** : `/var/www/uploads/{slug}/`
- **MongoDB** : Collection `media` avec `siteId`
- **URL** : `https://{domain}/uploads/{slug}/{filename}`

### Pages SEO
- **Défaut** : home, cours, permis, bons-cadeaux, contact
- **Custom** : Ajouter dans `site.pages`

### Sections Content
- **Défaut** : hero, about, services, testimonials, faq, footer
- **Custom** : Ajouter dans `site.sections`

---

## 💡 Conseils

1. **Slug** : Utiliser le même slug partout (site, dossiers, configs)
2. **Domaines** : Configurer tous les domaines dans `site.domains`
3. **Logo** : Uploader en premier pour l'afficher dans l'admin
4. **SEO** : Remplir toutes les pages avant de déployer
5. **Uploads** : Les médias sont automatiquement dans le bon dossier

---

## 🐛 Problèmes Courants

### Upload ne fonctionne pas
- Vérifier que le site existe dans MongoDB
- Vérifier les permissions : `/var/www/uploads/{slug}/` doit être `775 swigs:www-data`
- Vérifier que le domaine est correct dans `site.domains`

### Pages SEO n'apparaissent pas
- Vérifier que `site.pages` est rempli OU utiliser les pages par défaut
- Vérifier qu'il y a au moins une entrée SEO pour chaque page

### Images ne chargent pas (ERR_CERT_COMMON_NAME_INVALID)
- Vérifier que le domaine SSL correspond
- Utiliser le domaine principal configuré dans `site.domains` avec `isPrimary: true`

---

**✅ Votre nouveau site est prêt !**

Pour plus de détails, voir `docs/07-NOUVEAU-SITE.md`
