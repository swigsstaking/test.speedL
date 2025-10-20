# ❓ FAQ & Troubleshooting

Questions fréquentes et solutions aux problèmes courants.

---

## 🔧 Problèmes Courants

### 1. Le site ne charge pas (404)

**Symptômes** : Page blanche ou erreur 404

**Causes possibles** :
- Fichiers non déployés
- Mauvaise configuration Nginx
- Permissions incorrectes

**Solutions** :

```bash
# Vérifier que les fichiers existent
ls -la /var/www/monsite-test/

# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Vérifier les logs
sudo tail -f /var/log/nginx/monsite-test-error.log

# Redéployer si nécessaire
sudo cp -r dist/* /var/www/monsite-test/
sudo chown -R swigs:www-data /var/www/monsite-test/
```

---

### 2. Erreur 405 (Method Not Allowed)

**Symptômes** : DELETE ou POST retourne 405

**Cause** : Nginx bloque la méthode HTTP

**Solution** :

Vérifier que la config Nginx a bien la section `location /api/` :

```nginx
location /api/ {
    proxy_pass http://localhost:3000/api/;
    # ... autres headers
}
```

Et que la règle de cache des assets exclut `/api/` :

```nginx
location ~* ^/(?!api/).+\.(js|css|png|jpg)$ {
    expires 1y;
}
```

---

### 3. CORS Error

**Symptômes** : Erreur CORS dans la console

**Cause** : Domaine non autorisé dans l'API

**Solution** :

Ajouter le domaine dans `/etc/nginx/sites-available/api` :

```nginx
if ($http_origin ~* ^https?://(.*\.)?monsite\.ch$) {
    set $cors_origin $http_origin;
}
```

Recharger Nginx :
```bash
sudo systemctl reload nginx
```

---

### 4. Formulaires ne s'envoient pas

**Symptômes** : Erreur 400 "Email de réception non configuré"

**Cause** : Email non configuré dans l'admin

**Solution** :

1. Aller dans **Admin → Paramètres**
2. Remplir **"Email pour les formulaires"**
3. Sauvegarder

---

### 5. Emails non reçus

**Symptômes** : Formulaire soumis mais pas d'email

**Causes possibles** :
- SMTP mal configuré
- Email dans les spams
- Erreur Nodemailer

**Solutions** :

```bash
# Vérifier les logs backend
pm2 logs swigs-api --lines 50

# Vérifier la config SMTP
cat ~/websites/speed-l/backend/.env | grep SMTP

# Tester SMTP
cd ~/websites/speed-l/backend
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'email', pass: 'pass' }
});
transporter.verify().then(console.log).catch(console.error);
"
```

---

### 6. SEO ne se met pas à jour

**Symptômes** : Modifications SEO non visibles sur le site

**Cause** : Fichier `seo.json` non régénéré

**Solution** :

```bash
# Régénérer le SEO
cd ~/websites/speed-l/backend
npm run generate-seo

# Rebuild le site
npm run rebuild

# Ou via l'admin
# Admin → Webhook → Rebuild
```

---

### 7. Backend ne démarre pas

**Symptômes** : `pm2 status` montre "errored"

**Causes possibles** :
- Erreur de syntaxe
- MongoDB non accessible
- Port déjà utilisé

**Solutions** :

```bash
# Voir les logs
pm2 logs swigs-api --lines 50

# Vérifier MongoDB
sudo systemctl status mongod
mongo --eval "db.adminCommand('ping')"

# Vérifier le port
sudo lsof -i :3000

# Redémarrer
pm2 restart swigs-api
```

---

### 8. SSL ne fonctionne pas

**Symptômes** : Erreur de certificat ou "Not Secure"

**Cause** : Certbot non configuré ou certificat expiré

**Solutions** :

```bash
# Vérifier les certificats
sudo certbot certificates

# Renouveler
sudo certbot renew

# Reconfigurer
sudo certbot --nginx -d monsite.ch

# Vérifier Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

### 9. Images ne chargent pas

**Symptômes** : Images cassées (icône 🖼️❌)

**Causes possibles** :
- Mauvais chemin
- Permissions
- CORS

**Solutions** :

```bash
# Vérifier les uploads
ls -la /var/www/speed-l/uploads/

# Permissions
sudo chown -R swigs:www-data /var/www/speed-l/uploads/
sudo chmod 755 /var/www/speed-l/uploads/
sudo chmod 644 /var/www/speed-l/uploads/*

# Vérifier Nginx
sudo tail -f /var/log/nginx/error.log
```

---

### 10. Site lent

**Symptômes** : Temps de chargement > 3s

**Causes possibles** :
- Pas de compression
- Pas de cache
- Images non optimisées

**Solutions** :

```bash
# Vérifier la compression
curl -I -H "Accept-Encoding: gzip" https://monsite.ch

# Vérifier le cache
curl -I https://monsite.ch/assets/index.js
# Doit avoir: Cache-Control: public, max-age=...

# Optimiser les images
# Utiliser TinyPNG ou ImageOptim avant upload
```

---

## 💡 Questions Fréquentes

### Comment ajouter un utilisateur ?

**Admin uniquement** :

1. Admin → Utilisateurs (à venir)
2. Ou via API :

```bash
curl -X POST https://api.swigs.online/api/users \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau@example.com",
    "password": "MotDePasse123!",
    "name": "Nouveau User",
    "role": "editor",
    "sites": ["SITE_ID"]
  }'
```

---

### Comment changer le mot de passe d'un utilisateur ?

**Via l'admin** (à venir) ou **via API** :

```bash
curl -X PUT https://api.swigs.online/api/users/USER_ID/password \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "ancien",
    "newPassword": "nouveau"
  }'
```

---

### Comment supprimer un site ?

**Admin uniquement** :

⚠️ **Attention** : Suppression irréversible !

1. Sauvegarder les données importantes
2. Admin → Sites → Supprimer
3. Supprimer les fichiers sur le serveur :

```bash
sudo rm -rf /var/www/monsite-test
sudo rm -rf /var/www/monsite-prod
sudo rm /etc/nginx/sites-enabled/monsite-test
sudo rm /etc/nginx/sites-enabled/monsite-prod
sudo systemctl reload nginx
```

---

### Comment faire un backup ?

**MongoDB** :

```bash
# Backup
mongodump --out=/home/swigs/backups/$(date +%Y%m%d)

# Restore
mongorestore /home/swigs/backups/20250120
```

**Fichiers** :

```bash
# Backup uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz /var/www/speed-l/uploads

# Backup sites
tar -czf sites-backup-$(date +%Y%m%d).tar.gz /var/www/
```

**Automatiser** (cron) :

```bash
# Éditer crontab
crontab -e

# Ajouter (backup quotidien à 2h du matin)
0 2 * * * mongodump --out=/home/swigs/backups/$(date +\%Y\%m\%d)
0 2 * * * tar -czf /home/swigs/backups/uploads-$(date +\%Y\%m\%d).tar.gz /var/www/speed-l/uploads
```

---

### Comment voir les logs ?

**Backend** :
```bash
pm2 logs swigs-api
pm2 logs swigs-api --lines 100
pm2 logs swigs-api --err  # Erreurs uniquement
```

**Nginx** :
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/monsite-test-error.log
```

**MongoDB** :
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

---

### Comment mettre à jour le code ?

**Backend** :
```bash
cd ~/websites/speed-l/backend
git pull origin main
npm install
pm2 restart swigs-api
```

**Admin** :
```bash
cd ~/websites/speed-l/admin
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/admin/
```

**Site** :
```bash
cd ~/websites/speed-l
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/speedl-test/
```

---

### Comment tester l'API ?

**Health check** :
```bash
curl https://api.swigs.online/health
# Doit retourner: OK
```

**Liste des sites** :
```bash
curl https://api.swigs.online/api/sites
```

**Avec authentification** :
```bash
# 1. Login
TOKEN=$(curl -X POST https://api.swigs.online/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@swigs.online","password":"xxx"}' \
  | jq -r '.token')

# 2. Requête authentifiée
curl https://api.swigs.online/api/users \
  -H "Authorization: Bearer $TOKEN"
```

---

### Comment optimiser les performances ?

**1. Activer la compression** (déjà fait dans Nginx)

**2. Optimiser les images** :
- Utiliser WebP quand possible
- Compresser avec TinyPNG
- Lazy loading (déjà implémenté)

**3. Minimiser le JavaScript** :
- Code splitting (déjà fait avec lazy loading)
- Tree shaking (Vite le fait automatiquement)

**4. Utiliser un CDN** (optionnel) :
- Cloudflare
- AWS CloudFront

**5. Monitorer** :
```bash
# Lighthouse
npm install -g lighthouse
lighthouse https://monsite.ch --view
```

---

### Comment gérer plusieurs environnements ?

**Variables d'environnement** :

```bash
# .env.development
VITE_API_URL=http://localhost:3000/api

# .env.production
VITE_API_URL=https://api.swigs.online/api
```

**Build** :
```bash
# Dev
npm run dev

# Production
npm run build
```

---

### Comment débugger le frontend ?

**Console du navigateur** :
- F12 → Console
- Voir les erreurs JavaScript
- Voir les requêtes réseau (Network tab)

**React DevTools** :
- Installer l'extension Chrome/Firefox
- Inspecter les composants et leur état

**Logs** :
```javascript
// Ajouter temporairement
console.log('Debug:', variable);
```

---

### Comment sécuriser davantage ?

**1. Firewall** :
```bash
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw status
```

**2. Fail2ban** :
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

**3. Mots de passe forts** :
- Minimum 12 caractères
- Majuscules, minuscules, chiffres, symboles

**4. Mises à jour régulières** :
```bash
sudo apt update
sudo apt upgrade
```

**5. Backup réguliers** (voir plus haut)

---

## 🆘 Commandes Utiles

### Nginx
```bash
sudo nginx -t                    # Tester la config
sudo systemctl reload nginx      # Recharger
sudo systemctl restart nginx     # Redémarrer
sudo systemctl status nginx      # Statut
```

### PM2
```bash
pm2 status                       # Liste des process
pm2 restart swigs-api           # Redémarrer
pm2 logs swigs-api              # Logs
pm2 monit                       # Monitoring
pm2 save                        # Sauvegarder
```

### MongoDB
```bash
mongosh                         # Shell MongoDB
sudo systemctl status mongod    # Statut
sudo systemctl restart mongod   # Redémarrer
```

### Certbot
```bash
sudo certbot certificates       # Liste
sudo certbot renew             # Renouveler
sudo certbot delete            # Supprimer
```

### Système
```bash
df -h                          # Espace disque
free -h                        # Mémoire
top                            # Processus
htop                           # Processus (meilleur)
```

---

## 📞 Support

Si le problème persiste :

1. **Vérifier cette FAQ**
2. **Consulter les logs**
3. **Chercher dans la documentation**
4. **Contacter l'équipe SWIGS**

---

**Retour à l'index** : [00-INDEX.md](./00-INDEX.md)
