# 📋 Commandes de Déploiement - Multi-Sites SWIGS

**Date** : 24 Octobre 2025  
**Serveur** : sw4c-6 (swigs@serveur)  
**Repos GitHub** : swigsstaking/test.speedL

---

## 🎯 Résumé

Toutes les modifications ont été **committées et pushées sur GitHub**.

**Commit** : `e1d3953` - "feat: Implémentation complète du système multi-sites"

**Fichiers modifiés** : 15 fichiers
- ✨ 4 nouveaux fichiers
- ✏️ 11 fichiers modifiés

---

## 🚀 Option 1 : Script Automatisé (RECOMMANDÉ)

### Étape 1 : Copier le script sur le serveur

```bash
# Sur votre machine locale
scp deploy-multi-sites.sh swigs@serveur:~/
```

### Étape 2 : Exécuter le script

```bash
# Se connecter au serveur
ssh swigs@serveur

# Rendre le script exécutable
chmod +x ~/deploy-multi-sites.sh

# Exécuter le script
./deploy-multi-sites.sh
```

Le script va :
1. ✅ Faire des backups (MongoDB, sites, Nginx)
2. ✅ Déployer le Backend
3. ✅ Déployer l'Admin
4. ✅ Déployer le Control Center
5. ✅ Vérifier que tout fonctionne

**Temps estimé** : 5-10 minutes

---

## 🔧 Option 2 : Commandes Manuelles

Si vous préférez exécuter les commandes manuellement :

### 1. Se connecter au serveur

```bash
ssh swigs@serveur
```

### 2. Backup (IMPORTANT)

```bash
# Créer les dossiers de backup
mkdir -p ~/backups/mongodb ~/backups/sites ~/backups/nginx

# Backup MongoDB
mongodump --db swigs-cms --out ~/backups/mongodb/pre-multi-sites-$(date +%Y%m%d-%H%M)
mongodump --db swigs-monitoring --out ~/backups/mongodb/pre-multi-sites-$(date +%Y%m%d-%H%M)

# Backup sites
tar -czf ~/backups/sites/pre-multi-sites-$(date +%Y%m%d-%H%M).tar.gz /var/www/

# Backup Nginx
sudo tar -czf ~/backups/nginx/pre-multi-sites-$(date +%Y%m%d-%H%M).tar.gz /etc/nginx/sites-available/
```

### 3. Backend CMS

```bash
cd ~/swigs-apps/swigs-cms-backend
git pull origin main
npm install
pm2 restart swigs-cms-backend

# Vérifier
pm2 logs swigs-cms-backend --lines 30
curl http://localhost:3000/api/health
```

### 4. Admin CMS

```bash
cd ~/swigs-apps/swigs-cms-admin
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/admin/
sudo chown -R swigs:www-data /var/www/admin

# Vérifier
curl -I https://admin.swigs.online
```

### 5. Control Center

```bash
cd ~/swigs-apps/swigs-control-center
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/monitoring/
sudo chown -R swigs:www-data /var/www/monitoring

# Vérifier
curl -I https://monitoring.swigs.online
```

### 6. Vérifications

```bash
# Services
pm2 status

# Nginx
sudo nginx -t

# MongoDB
sudo systemctl status mongod

# Espace disque
df -h
```

---

## ✅ Tests Post-Déploiement

### 1. Admin CMS

Ouvrir https://admin.swigs.online dans le navigateur :

1. **Se connecter**
2. **Tester Médias** :
   - Aller dans Médias
   - Sélectionner un site
   - Uploader une image
   - Vérifier qu'elle apparaît uniquement pour ce site
3. **Tester SEO** :
   - Aller dans SEO
   - Cliquer sur "+" (Ajouter une page)
   - Créer une nouvelle page
   - Vérifier qu'elle apparaît dans la liste
4. **Tester Content** :
   - Aller dans Content
   - Cliquer sur "Nouvelle section"
   - Créer une nouvelle section
   - Cliquer sur "Nouveau contenu"
   - Créer du contenu pour cette section

### 2. Control Center

Ouvrir https://monitoring.swigs.online dans le navigateur :

1. **Aller dans Sites**
2. **Cliquer sur "Ajouter un site"**
3. **Remplir le formulaire** :
   - Nom: Test Site
   - URL: https://test.example.com
   - Externe: ☑️
4. **Enregistrer**
5. **Vérifier que le site apparaît**
6. **Tester Modifier et Supprimer**

### 3. Vérifier les Logs

```bash
# Backend (pas d'erreurs)
pm2 logs swigs-cms-backend --lines 50

# Nginx Admin (pas d'erreurs 500)
sudo tail -f /var/log/nginx/admin-error.log

# Nginx Monitoring (pas d'erreurs 500)
sudo tail -f /var/log/nginx/monitoring-error.log
```

---

## 🔄 Migration des Médias (Optionnel)

Si vous avez des médias existants dans `/var/www/speed-l/uploads/` :

### Vérifier

```bash
ls -la /var/www/speed-l/uploads/
```

### Migrer

```bash
# Créer la nouvelle structure
sudo mkdir -p /var/www/uploads/speed-l

# Déplacer les médias
sudo mv /var/www/speed-l/uploads/* /var/www/uploads/speed-l/

# Permissions
sudo chown -R swigs:www-data /var/www/uploads
sudo chmod -R 775 /var/www/uploads
```

### Créer les entrées MongoDB

Voir le script dans `docs/DEPLOIEMENT-MULTI-SITES.md` section "Migration des Médias"

### Mettre à jour Nginx

```bash
sudo nano /etc/nginx/sites-available/speed-l

# Ajouter/modifier:
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

## 🆘 Rollback (En Cas de Problème)

### Backend

```bash
cd ~/swigs-apps/swigs-cms-backend
git log --oneline -5  # Noter le commit précédent
git checkout c5ddafa  # Remplacer par le bon hash
pm2 restart swigs-cms-backend
```

### Admin

```bash
cd ~/swigs-apps/swigs-cms-admin
git checkout c5ddafa
npm install
npm run build
sudo cp -r dist/* /var/www/admin/
```

### Control Center

```bash
cd ~/swigs-apps/swigs-control-center
git checkout <commit-hash-precedent>
npm install
npm run build
sudo cp -r dist/* /var/www/monitoring/
```

### MongoDB

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
# Logs Backend en temps réel
pm2 logs swigs-cms-backend

# Logs Nginx
sudo tail -f /var/log/nginx/admin-error.log
sudo tail -f /var/log/nginx/monitoring-error.log

# Métriques serveur
htop
```

### Vérifier dans le Control Center

1. Ouvrir https://monitoring.swigs.online
2. Vérifier CPU, RAM, Disk
3. Vérifier que tous les sites sont en ligne
4. Vérifier qu'il n'y a pas d'augmentation des erreurs

---

## 📝 Checklist Finale

- [ ] Script de déploiement exécuté OU commandes manuelles terminées
- [ ] Backups créés
- [ ] Backend redémarré sans erreur
- [ ] Admin accessible et fonctionnel
- [ ] Control Center accessible et fonctionnel
- [ ] Tests upload médias OK
- [ ] Tests ajout pages SEO OK
- [ ] Tests ajout sections Content OK
- [ ] Tests gestion sites Control Center OK
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Monitoring actif pendant 24h

---

## 🎯 Résumé des URLs

| Service | URL | Statut |
|---------|-----|--------|
| **Admin CMS** | https://admin.swigs.online | ✅ À tester |
| **Control Center** | https://monitoring.swigs.online | ✅ À tester |
| **API Backend** | http://localhost:3000 | ✅ À vérifier |
| **Speed-L** | https://speed-l.swigs.online | ✅ Inchangé |

---

## 📚 Documentation Complète

- **ANALYSE-MULTI-SITES.md** : Analyse des problèmes et solutions
- **MODIFICATIONS-MULTI-SITES.md** : Résumé complet des modifications
- **DEPLOIEMENT-MULTI-SITES.md** : Guide de déploiement détaillé
- **Ce fichier** : Commandes rapides

---

## 🆘 Support

En cas de problème :

1. **Vérifier les logs** :
   ```bash
   pm2 logs swigs-cms-backend --lines 100
   sudo tail -f /var/log/nginx/admin-error.log
   ```

2. **Consulter la documentation** :
   - `docs/DEPLOIEMENT-MULTI-SITES.md`
   - Section "Dépannage"

3. **Rollback si nécessaire** :
   - Utiliser les backups créés
   - Revenir au commit précédent

4. **Vérifier l'état des services** :
   ```bash
   pm2 status
   sudo systemctl status nginx
   sudo systemctl status mongod
   ```

---

**✅ Tout est prêt pour le déploiement !**

**Prochaine étape** : Exécuter le script `deploy-multi-sites.sh` sur le serveur.

---

**Auteur** : Cascade AI  
**Date** : 24 Octobre 2025  
**Version** : 1.0
