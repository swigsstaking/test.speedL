# ⚡ Référence Rapide - SWIGS CMS

## 🚀 Déploiement initial (première fois)

```bash
ssh swigs@VOTRE_IP
cd ~/websites/speed-l
git pull origin main
chmod +x clean-deploy.sh
./clean-deploy.sh
```

---

## 🔄 Mise à jour du code

### Sur votre Mac :
```bash
cd /Users/corentinflaction/CascadeProjects/windsurf-project-4
git add .
git commit -m "Description"
git push origin main
```

### Sur le serveur :
```bash
ssh swigs@VOTRE_IP
cd ~/websites/speed-l
git pull origin main
./clean-deploy.sh  # Déploiement CLEAN (recommandé)
# OU
./deploy.sh  # Déploiement rapide
```

---

## 🔧 Commandes utiles

### Backend
```bash
pm2 status                    # Statut
pm2 logs swigs-api           # Logs en temps réel
pm2 restart swigs-api        # Redémarrer
pm2 stop swigs-api           # Arrêter
pm2 start swigs-api          # Démarrer
```

### Nginx
```bash
sudo systemctl status nginx   # Statut
sudo systemctl reload nginx   # Recharger
sudo nginx -t                 # Tester la config
sudo tail -f /var/log/nginx/error.log  # Logs
```

### MongoDB
```bash
sudo systemctl status mongodb  # Statut
mongosh                       # Console MongoDB
use swigs-cms                 # Utiliser la DB
db.sites.find()              # Voir les sites
db.courses.find()            # Voir les cours
```

---

## 🌐 URLs

- **Site** : https://swigs.online
- **Admin** : https://admin.swigs.online
- **Login** : admin@swigs.online / Admin123!

---

## 🐛 Dépannage rapide

### Site ne charge pas
```bash
sudo systemctl status nginx
sudo nginx -t
ls -la /var/www/speed-l/
```

### Admin ne fonctionne pas
```bash
pm2 logs swigs-api
curl http://localhost:3000/api/health
ls -la /var/www/admin/
```

### Erreur 502
```bash
pm2 restart swigs-api
sudo systemctl status mongodb
```

### Tout réinitialiser
```bash
cd ~/websites/speed-l
./clean-deploy.sh
```

---

## 📁 Structure des dossiers

```
~/websites/speed-l/
├── backend/          # API Node.js
│   ├── .env         # Configuration (à créer)
│   └── uploads/     # Fichiers uploadés
├── admin/           # Interface admin
│   └── dist/        # Build (généré)
├── src/             # Site Speed-L
└── dist/            # Build (généré)

/var/www/
├── admin/           # Admin déployé
└── speed-l/         # Site déployé
```

---

## 🔒 SSL (HTTPS)

### Installer SSL
```bash
sudo certbot --nginx -d swigs.online -d www.swigs.online -d admin.swigs.online
```

### Renouveler SSL
```bash
sudo certbot renew
```

---

## 💾 Sauvegardes

### MongoDB
```bash
mongodump --db swigs-cms --out ~/backups/$(date +%Y%m%d)
```

### Uploads
```bash
tar -czf ~/backups/uploads-$(date +%Y%m%d).tar.gz ~/websites/speed-l/backend/uploads
```

---

## 📝 Fichiers importants

- `backend/.env` - Configuration backend
- `backend/uploads/` - Fichiers uploadés
- `/etc/nginx/sites-available/speed-l` - Config Nginx site
- `/etc/nginx/sites-available/admin` - Config Nginx admin

---

## ⚠️ À ne JAMAIS faire

- ❌ Utiliser `npm run dev` en production
- ❌ Commiter le fichier `.env`
- ❌ Oublier de faire `git pull` avant `./clean-deploy.sh`
- ❌ Modifier directement les fichiers dans `/var/www/`
- ❌ Exposer MongoDB sur internet

---

## ✅ Checklist avant chaque mise à jour

- [ ] Code committé et pushé sur GitHub
- [ ] `git pull` sur le serveur
- [ ] `./clean-deploy.sh` exécuté
- [ ] Vérifier https://swigs.online
- [ ] Vérifier https://admin.swigs.online
- [ ] Tester une fonctionnalité modifiée
- [ ] Vérifier les logs : `pm2 logs swigs-api`
