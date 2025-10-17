# 🔧 Fix DELETE 405 - Suppression de Médias

## 🐛 Problème
```
DELETE https://admin.swigs.online/api/media/FICHIER.png 405 (Not Allowed)
```

## 🔍 Cause
Nginx bloque la méthode DELETE, probablement dans le bloc HTTPS (port 443) créé par Certbot.

## ✅ Solution

### Étape 1 : Vérifier la config actuelle

```bash
# Sur le serveur
sudo cat /etc/nginx/sites-available/admin | grep -A 20 "listen 443"
```

Vous devriez voir un bloc comme :
```nginx
server {
    listen 443 ssl;
    server_name admin.swigs.online;
    
    # ... certificats SSL ...
    
    location / {
        # ...
    }
    
    # ⚠️ IL MANQUE LA SECTION location /api/ ICI !
}
```

### Étape 2 : Éditer la config

```bash
sudo nano /etc/nginx/sites-available/admin
```

### Étape 3 : Ajouter la section /api/ dans le bloc HTTPS

Cherchez le bloc `server {` avec `listen 443 ssl` et ajoutez AVANT le `location / {` :

```nginx
server {
    listen 443 ssl;
    server_name admin.swigs.online;
    
    # ... certificats SSL ...
    
    root /var/www/admin;
    index index.html;
    
    # ✅ AJOUTER CETTE SECTION ICI
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
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # ... reste de la config ...
}
```

**Sauvegarder** : `Ctrl+O`, `Enter`, `Ctrl+X`

### Étape 4 : Tester et recharger

```bash
# Tester la config
sudo nginx -t

# Si OK, recharger
sudo systemctl reload nginx
```

### Étape 5 : Vérifier

```bash
# Tester l'API
curl -I https://admin.swigs.online/api/media

# Devrait retourner HTTP/2 200
```

### Étape 6 : Tester la suppression

1. Ouvrir `https://admin.swigs.online`
2. Aller dans **Médias**
3. Cliquer sur l'icône **Poubelle** d'une image
4. ✅ Devrait se supprimer sans erreur 405

---

## 🔍 Debug

### Si ça ne fonctionne toujours pas

```bash
# 1. Vérifier les logs Nginx
sudo tail -f /var/log/nginx/admin-error.log

# 2. Vérifier les logs backend
pm2 logs swigs-api --lines 50

# 3. Tester DELETE directement
curl -X DELETE -H "Authorization: Bearer VOTRE_TOKEN" \
  https://admin.swigs.online/api/media/FICHIER.png

# 4. Vérifier la config complète
sudo nginx -T | grep -A 30 "admin.swigs.online"
```

### Vérifier les permissions

```bash
# Le fichier doit être accessible en écriture
ls -la /var/www/speed-l/uploads/

# Corriger si nécessaire
sudo chown -R swigs:www-data /var/www/speed-l/uploads
sudo chmod 775 /var/www/speed-l/uploads
sudo chmod 664 /var/www/speed-l/uploads/*
```

---

## 📋 Checklist

- [ ] Config Nginx a la section `/api/` dans le bloc HTTPS (port 443)
- [ ] `nginx -t` passe sans erreur
- [ ] Nginx rechargé (`systemctl reload nginx`)
- [ ] `curl -I https://admin.swigs.online/api/media` retourne 200
- [ ] Suppression fonctionne dans l'admin
- [ ] Pas d'erreur 405 dans la console

---

## 🎯 Config Nginx Complète (Référence)

```nginx
server {
    listen 80;
    server_name admin.swigs.online;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name admin.swigs.online;
    
    ssl_certificate /etc/letsencrypt/live/admin.swigs.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.swigs.online/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    root /var/www/admin;
    index index.html;
    
    access_log /var/log/nginx/admin-access.log;
    error_log /var/log/nginx/admin-error.log;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;
    
    # ✅ SECTION API - IMPORTANT !
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
    
    # SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Sécurité
    location ~ /\. {
        deny all;
    }
}
```
