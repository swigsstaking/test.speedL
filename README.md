# 🚀 SWIGS CMS

Système de gestion de contenu multi-sites centralisé.

## 📚 Documentation

### Essentiels
- **[SWIGS-CMS-GUIDE.md](./SWIGS-CMS-GUIDE.md)** - Guide complet d'utilisation
- **[INSTALLATION-BACKUP-REDIS.md](./INSTALLATION-BACKUP-REDIS.md)** - Installation backup & cache
- **[RESUME-AMELIORATIONS.md](./RESUME-AMELIORATIONS.md)** - Résumé des améliorations

### Technique
- **[SWIGS-CMS-DOCUMENTATION-COMPLETE.md](./SWIGS-CMS-DOCUMENTATION-COMPLETE.md)** - Documentation technique complète

## 🏗️ Architecture

```
├── backend/          # API Node.js/Express
├── admin/            # Panel admin React
├── src/              # Site public React
├── scripts/          # Scripts backup/deploy
└── nginx-configs/    # Configurations Nginx
```

## 🚀 Déploiement Rapide

### Sur le serveur

```bash
cd ~/websites/speed-l
git pull origin main

# Backend
cd backend
npm install
pm2 restart backend

# Admin
cd ../admin
npm run build
sudo cp -r dist/* /var/www/admin/

# Site public
cd ..
npm run build
sudo cp -r dist/* /var/www/speed-l/
```

## 🔧 Commandes Utiles

```bash
# Logs backend
pm2 logs backend

# Backup manuel
~/scripts/backup-mongodb.sh

# Vérifier Redis
redis-cli ping

# Nginx
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 URLs

- **Admin** : https://admin.swigs.online
- **Site** : https://speedl.swigs.online
- **API** : https://speedl.swigs.online/api

## 🔐 Credentials

- **Email** : admin@swigs.online
- **Password** : Admin123! (à changer)

---

*Pour plus de détails, consultez SWIGS-CMS-GUIDE.md*
