# 🚀 SWIGS CMS - Multi-Sites

Système de gestion de contenu multi-sites centralisé avec isolation complète des données.

## ✨ Nouveautés Multi-Sites (Oct 2025)

🎉 **Le système est maintenant complètement multi-sites !**

- ✅ **Médias isolés par site** - Chaque site a ses propres médias
- ✅ **Pages SEO dynamiques** - Configurables via l'Admin
- ✅ **Sections Content dynamiques** - Configurables via l'Admin
- ✅ **Gestion sites Control Center** - Interface complète de gestion

**📖 Guide de déploiement** : [POUR-TOI.md](./POUR-TOI.md) ← **Commence ici !**

## 📚 Documentation

### 🚀 Déploiement Multi-Sites
- **[POUR-TOI.md](./POUR-TOI.md)** - 👈 **Guide rapide pour déployer** (commence ici !)
- **[RESUME-FINAL.md](./RESUME-FINAL.md)** - Vue d'ensemble complète des modifications
- **[COMMANDES-SERVEUR.txt](./COMMANDES-SERVEUR.txt)** - Toutes les commandes en un fichier
- **[COMMANDES-DEPLOIEMENT.md](./COMMANDES-DEPLOIEMENT.md)** - Guide de déploiement complet
- **[deploy-multi-sites.sh](./deploy-multi-sites.sh)** - Script automatique de déploiement

### 📖 Documentation Technique
- **[docs/DEPLOIEMENT-MULTI-SITES.md](./docs/DEPLOIEMENT-MULTI-SITES.md)** - Guide détaillé avec migration
- **[docs/MODIFICATIONS-MULTI-SITES.md](./docs/MODIFICATIONS-MULTI-SITES.md)** - Résumé technique
- **[docs/ANALYSE-MULTI-SITES.md](./docs/ANALYSE-MULTI-SITES.md)** - Analyse des problèmes

### 📚 Documentation Générale
- **[SWIGS-CMS-GUIDE.md](./SWIGS-CMS-GUIDE.md)** - Guide complet d'utilisation
- **[INSTALLATION-BACKUP-REDIS.md](./INSTALLATION-BACKUP-REDIS.md)** - Installation backup & cache
- **[RESUME-AMELIORATIONS.md](./RESUME-AMELIORATIONS.md)** - Résumé des améliorations
- **[SWIGS-CMS-DOCUMENTATION-COMPLETE.md](./SWIGS-CMS-DOCUMENTATION-COMPLETE.md)** - Documentation technique complète

## 🏗️ Architecture

```
├── backend/          # API Node.js/Express
├── admin/            # Panel admin React
├── src/              # Site public React
├── scripts/          # Scripts backup/deploy
└── nginx-configs/    # Configurations Nginx
```

## 🚀 Déploiement Multi-Sites

### Option 1 : Script Automatique (RECOMMANDÉ)

```bash
# 1. Copier le script sur le serveur
scp deploy-multi-sites.sh swigs@serveur:~/

# 2. Se connecter et exécuter
ssh swigs@serveur
chmod +x ~/deploy-multi-sites.sh
./deploy-multi-sites.sh
```

Le script fait automatiquement :
- ✅ Backups (MongoDB, sites, Nginx)
- ✅ Déploiement Backend
- ✅ Déploiement Admin
- ✅ Déploiement Control Center
- ✅ Vérifications

**Temps estimé** : 5-10 minutes

### Option 2 : Commandes Manuelles

Voir [COMMANDES-SERVEUR.txt](./COMMANDES-SERVEUR.txt) pour les commandes détaillées.

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

## 📊 URLs Production

- **Admin CMS** : https://admin.swigs.online
- **Control Center** : https://monitoring.swigs.online
- **Speed-L** : https://speed-l.swigs.online
- **API Backend** : http://localhost:3000 (serveur)

## 🎯 Modifications Multi-Sites

### Backend
- ✨ Nouveau modèle `Media` avec `siteId`
- ✏️ Modèle `Site` étendu (`pages`, `sections`)
- ✏️ Controllers media/site modifiés
- ✏️ Routes avec création auto dossiers par site

### Admin
- ✏️ Page Media filtrée par site
- ✏️ Page SEO avec ajout dynamique de pages
- ✏️ Page Content avec ajout dynamique de sections
- ✏️ SiteContext avec `refreshSite()`

### Control Center
- ✏️ Page Sites avec gestion complète (CRUD)

**Total** : 17 fichiers modifiés/créés, 2,902 lignes ajoutées

## 🔐 Credentials

- **Email** : admin@swigs.online
- **Password** : Admin123! (à changer)

---

## 📞 Support

En cas de problème :
1. Consulter [POUR-TOI.md](./POUR-TOI.md)
2. Vérifier les logs : `pm2 logs swigs-cms-backend`
3. Voir la section Rollback dans [COMMANDES-DEPLOIEMENT.md](./COMMANDES-DEPLOIEMENT.md)

---

**🎉 Prêt pour le déploiement multi-sites !**

*Pour démarrer, ouvre [POUR-TOI.md](./POUR-TOI.md)*
