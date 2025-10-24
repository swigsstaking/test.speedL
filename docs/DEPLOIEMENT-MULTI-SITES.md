# 🚀 Guide de Déploiement - Modifications Multi-Sites

**Date** : 24 Octobre 2025  
**Version** : 1.0  
**Serveur** : sw4c-6 (swigs@serveur)

---

## ⚠️ IMPORTANT - À Lire Avant de Déployer

### Modifications Effectuées

1. ✅ **Nouveau modèle MongoDB** : `Media` (backend)
2. ✅ **Modèle Site étendu** : Ajout `pages` et `sections`
3. ✅ **Controllers modifiés** : Media, Site
4. ✅ **Routes modifiées** : Media, Site
5. ✅ **Admin modifié** : Media, SEO, Content, SiteContext
6. ✅ **Control Center modifié** : Sites (gestion complète)

### Risques Identifiés

- ⚠️ **Nouveau modèle MongoDB** : Nécessite redémarrage backend
- ⚠️ **Structure médias changée** : Migration manuelle si médias existants
- ⚠️ **Modèle Site modifié** : Compatible avec données existantes (champs optionnels)

### Temps Estimé

- **Backend** : 5 minutes
- **Admin** : 5 minutes
- **Control Center** : 5 minutes
- **Migration médias** (si nécessaire) : 15-30 minutes
- **Total** : 15-45 minutes

---

## 📋 Checklist Pré-Déploiement

### 1. Vérifications Locales

```bash
# Vérifier que tous les fichiers sont commités
cd ~/CascadeProjects/windsurf-project-4
git status

# Vérifier qu'il n'y a pas d'erreurs de build
cd backend
npm install
# Vérifier qu'il n'y a pas d'erreurs

cd ../admin
npm install
npm run build
# Vérifier que le build réussit

cd ../monitoring
npm install
npm run build
# Vérifier que le build réussit
```

### 2. Backup Serveur

```bash
# Se connecter au serveur
ssh swigs@serveur

# Backup MongoDB
mongodump --db swigs-cms --out ~/backups/mongodb/pre-multi-sites-$(date +%Y%m%d-%H%M)
mongodump --db swigs-monitoring --out ~/backups/mongodb/pre-multi-sites-$(date +%Y%m%d-%H%M)

# Backup sites
tar -czf ~/backups/sites/pre-multi-sites-$(date +%Y%m%d-%H%M).tar.gz /var/www/

# Backup configs
tar -czf ~/backups/nginx/pre-multi-sites-$(date +%Y%m%d-%H%M).tar.gz /etc/nginx/sites-available/
```

### 3. Vérifier l'État Actuel

```bash
# Services PM2
pm2 status

# Nginx
sudo nginx -t
sudo systemctl status nginx

# MongoDB
sudo systemctl status mongod

# Espace disque
df -h
```

---

## 🚀 Procédure de Déploiement

### Étape 1 : Backend CMS (CRITIQUE)

```bash
# Sur le serveur
cd ~/swigs-apps/swigs-cms-backend

# Pull les changements
git pull origin main

# Installer les dépendances (au cas où)
npm install

# Redémarrer le service
pm2 restart swigs-cms-backend

# Vérifier les logs
pm2 logs swigs-cms-backend --lines 30

# Vérifier que l'API répond
curl http://localhost:3000/api/health

# Si erreur, vérifier les logs MongoDB
sudo journalctl -u mongod -n 50
```

**⚠️ Points de Vigilance** :
- Le nouveau modèle `Media` sera créé automatiquement par Mongoose
- Les champs `pages` et `sections` dans `Site` sont optionnels (pas de migration nécessaire)
- Si erreur "Cannot find module", faire `npm install` à nouveau

### Étape 2 : Admin CMS

```bash
# Sur le serveur
cd ~/swigs-apps/swigs-cms-admin

# Pull les changements
git pull origin main

# Installer les dépendances
npm install

# Builder l'application
npm run build

# Vérifier que le build a réussi
ls -la dist/

# Déployer
sudo cp -r dist/* /var/www/admin/

# Vérifier les permissions
sudo chown -R swigs:www-data /var/www/admin
sudo chmod -R 775 /var/www/admin

# Tester
curl -I https://admin.swigs.online
```

**⚠️ Points de Vigilance** :
- Si erreur de build, vérifier `npm install`
- Vider le cache du navigateur après déploiement (Ctrl+Shift+R)

### Étape 3 : Control Center

```bash
# Sur le serveur
cd ~/swigs-apps/swigs-control-center

# Pull les changements
git pull origin main

# Installer les dépendances
npm install

# Builder l'application
npm run build

# Vérifier que le build a réussi
ls -la dist/

# Déployer
sudo cp -r dist/* /var/www/monitoring/

# Vérifier les permissions
sudo chown -R swigs:www-data /var/www/monitoring
sudo chmod -R 775 /var/www/monitoring

# Tester
curl -I https://monitoring.swigs.online
```

---

## 🔄 Migration des Médias (Si Nécessaire)

### Vérifier s'il y a des médias existants

```bash
# Sur le serveur
ls -la /var/www/speed-l/uploads/
# ou
ls -la /var/www/uploads/
```

### Si des médias existent

**Option 1 : Laisser les anciens médias en place**
- Les anciens médias restent accessibles
- Les nouveaux médias iront dans `/var/www/uploads/{slug}/`
- Pas de migration nécessaire

**Option 2 : Migrer les médias (Recommandé)**

```bash
# Créer la nouvelle structure
sudo mkdir -p /var/www/uploads/speed-l

# Déplacer les médias existants
sudo mv /var/www/speed-l/uploads/* /var/www/uploads/speed-l/

# Permissions
sudo chown -R swigs:www-data /var/www/uploads
sudo chmod -R 775 /var/www/uploads
```

**Créer les entrées MongoDB** :

```javascript
// Script à exécuter dans mongo shell ou via Node.js
// ~/swigs-apps/swigs-cms-backend/scripts/migrate-media.js

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Se connecter à MongoDB
mongoose.connect('mongodb://localhost:27017/swigs-cms');

const Media = mongoose.model('Media', {
  filename: String,
  originalName: String,
  url: String,
  siteId: mongoose.Schema.Types.ObjectId,
  mimetype: String,
  size: Number,
  uploadedBy: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const Site = mongoose.model('Site', {
  name: String,
  slug: String,
});

async function migrateMedia() {
  // Récupérer le site Speed-L
  const speedL = await Site.findOne({ slug: 'speed-l' });
  if (!speedL) {
    console.error('Site Speed-L non trouvé');
    return;
  }

  // Récupérer un admin user (pour uploadedBy)
  const User = mongoose.model('User', { email: String });
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error('Admin user non trouvé');
    return;
  }

  const uploadsDir = '/var/www/uploads/speed-l';
  const files = fs.readdirSync(uploadsDir);

  for (const filename of files) {
    if (filename.startsWith('.')) continue;

    const filePath = path.join(uploadsDir, filename);
    const stats = fs.statSync(filePath);
    
    // Déterminer le mimetype
    const ext = path.extname(filename).toLowerCase();
    let mimetype = 'application/octet-stream';
    if (['.jpg', '.jpeg'].includes(ext)) mimetype = 'image/jpeg';
    else if (ext === '.png') mimetype = 'image/png';
    else if (ext === '.gif') mimetype = 'image/gif';
    else if (ext === '.webp') mimetype = 'image/webp';
    else if (ext === '.svg') mimetype = 'image/svg+xml';

    // Créer l'entrée
    await Media.create({
      filename,
      originalName: filename,
      url: `https://speed-l.swigs.online/uploads/speed-l/${filename}`,
      siteId: speedL._id,
      mimetype,
      size: stats.size,
      uploadedBy: admin._id,
    });

    console.log(`✅ Migré: ${filename}`);
  }

  console.log('✅ Migration terminée');
  mongoose.disconnect();
}

migrateMedia().catch(console.error);
```

**Exécuter le script** :

```bash
cd ~/swigs-apps/swigs-cms-backend
node scripts/migrate-media.js
```

### Mettre à jour Nginx (si migration)

```bash
# Éditer la config Speed-L
sudo nano /etc/nginx/sites-available/speed-l

# Ajouter ou modifier la location /uploads
location /uploads {
    alias /var/www/uploads;
    expires 30d;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}

# Tester et recharger
sudo nginx -t
sudo nginx -s reload
```

---

## ✅ Vérifications Post-Déploiement

### 1. Backend

```bash
# Vérifier que le service tourne
pm2 status

# Vérifier les logs (pas d'erreurs)
pm2 logs swigs-cms-backend --lines 50

# Tester l'API
curl http://localhost:3000/api/health
curl http://localhost:3000/api/sites

# Vérifier MongoDB
mongo swigs-cms --eval "db.sites.findOne()"
mongo swigs-cms --eval "db.media.findOne()"
```

### 2. Admin

```bash
# Tester l'accès
curl -I https://admin.swigs.online

# Vérifier dans le navigateur
# 1. Ouvrir https://admin.swigs.online
# 2. Se connecter
# 3. Aller dans Médias
# 4. Vérifier que le sélecteur de site fonctionne
# 5. Tester l'upload d'un média
# 6. Aller dans SEO
# 7. Cliquer sur "+" pour ajouter une page
# 8. Aller dans Content
# 9. Cliquer sur "Nouvelle section"
```

### 3. Control Center

```bash
# Tester l'accès
curl -I https://monitoring.swigs.online

# Vérifier dans le navigateur
# 1. Ouvrir https://monitoring.swigs.online
# 2. Aller dans Sites
# 3. Cliquer sur "Ajouter un site"
# 4. Remplir le formulaire
# 5. Vérifier que le site apparaît
```

### 4. Médias

```bash
# Vérifier la structure
ls -la /var/www/uploads/
ls -la /var/www/uploads/speed-l/

# Vérifier les permissions
# Doit être swigs:www-data avec 775
```

---

## 🆘 Rollback (En Cas de Problème)

### Backend

```bash
cd ~/swigs-apps/swigs-cms-backend
git log --oneline -5  # Noter le commit précédent
git checkout <commit-hash>
pm2 restart swigs-cms-backend
```

### Admin

```bash
cd ~/swigs-apps/swigs-cms-admin
git checkout <commit-hash>
npm install
npm run build
sudo cp -r dist/* /var/www/admin/
```

### Control Center

```bash
cd ~/swigs-apps/swigs-control-center
git checkout <commit-hash>
npm install
npm run build
sudo cp -r dist/* /var/www/monitoring/
```

### MongoDB (Restaurer le backup)

```bash
# Lister les backups
ls -la ~/backups/mongodb/

# Restaurer
mongorestore --db swigs-cms ~/backups/mongodb/pre-multi-sites-YYYYMMDD-HHMM/swigs-cms/
pm2 restart swigs-cms-backend
```

---

## 📊 Monitoring Post-Déploiement

### Surveiller pendant 24h

```bash
# Logs Backend
pm2 logs swigs-cms-backend

# Logs Nginx
sudo tail -f /var/log/nginx/admin-error.log
sudo tail -f /var/log/nginx/speed-l.error.log

# Logs MongoDB
sudo journalctl -u mongod -f

# Métriques serveur
htop
df -h
```

### Vérifier les Métriques

- **Control Center** : Vérifier CPU, RAM, Disk
- **Uptime** : Tous les sites doivent rester en ligne
- **Erreurs** : Pas d'augmentation des erreurs 500

---

## 📝 Notes Importantes

### Compatibilité Ascendante

✅ **Toutes les modifications sont rétrocompatibles** :
- Les champs `pages` et `sections` dans `Site` sont optionnels
- Le modèle `Media` est nouveau (pas de migration nécessaire)
- Les anciens médias continuent de fonctionner

### Nouveaux Comportements

1. **Upload de médias** :
   - Nécessite maintenant un `siteId`
   - Crée automatiquement le dossier `/var/www/uploads/{slug}/`
   - Sauvegarde en MongoDB

2. **Pages SEO** :
   - Si aucune page configurée, utilise les pages par défaut
   - Possibilité d'ajouter des pages via l'Admin

3. **Sections Content** :
   - Si aucune section configurée, utilise les sections par défaut
   - Possibilité d'ajouter des sections via l'Admin

### Prochaines Étapes (Optionnel)

1. **Migrer les médias existants** vers la nouvelle structure
2. **Configurer les pages** pour chaque site dans l'Admin SEO
3. **Configurer les sections** pour chaque site dans l'Admin Content
4. **Ajouter les sites** dans le Control Center

---

## 🎯 Résumé des Commandes

```bash
# 1. Backup
ssh swigs@serveur
mongodump --db swigs-cms --out ~/backups/mongodb/pre-multi-sites-$(date +%Y%m%d-%H%M)
tar -czf ~/backups/sites/pre-multi-sites-$(date +%Y%m%d-%H%M).tar.gz /var/www/

# 2. Backend
cd ~/swigs-apps/swigs-cms-backend
git pull origin main
npm install
pm2 restart swigs-cms-backend
pm2 logs swigs-cms-backend --lines 30

# 3. Admin
cd ~/swigs-apps/swigs-cms-admin
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/admin/

# 4. Control Center
cd ~/swigs-apps/swigs-control-center
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/monitoring/

# 5. Vérifications
curl http://localhost:3000/api/health
curl -I https://admin.swigs.online
curl -I https://monitoring.swigs.online
```

---

**✅ Déploiement Terminé !**

Surveiller les logs pendant 24h et vérifier que tout fonctionne correctement.

---

**Auteur** : Cascade AI  
**Date** : 24 Octobre 2025  
**Contact** : En cas de problème, vérifier les logs et consulter ce guide
