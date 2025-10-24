# 👋 Pour Toi - Guide Rapide de Déploiement

**Salut ! Voici tout ce que tu dois savoir pour déployer les modifications multi-sites sur ton serveur.**

---

## 🎯 Ce qui a été fait

J'ai **complètement implémenté le système multi-sites** pour SWIGS :

1. ✅ **Médias isolés par site** - Chaque site a ses propres médias
2. ✅ **Pages SEO dynamiques** - Tu peux ajouter des pages via l'Admin
3. ✅ **Sections Content dynamiques** - Tu peux ajouter des sections via l'Admin
4. ✅ **Gestion sites Control Center** - Tu peux créer/modifier/supprimer des sites

**Tout est committé sur GitHub** (4 commits) et **prêt à déployer**.

---

## 🚀 Comment Déployer (SUPER SIMPLE)

### Option 1 : Script Automatique (RECOMMANDÉ)

```bash
# 1. Copie le script sur ton serveur
scp deploy-multi-sites.sh swigs@ton-serveur:~/

# 2. Connecte-toi au serveur
ssh swigs@ton-serveur

# 3. Lance le script
chmod +x ~/deploy-multi-sites.sh
./deploy-multi-sites.sh
```

**C'est tout !** Le script fait tout automatiquement :
- Backup de MongoDB, sites, Nginx
- Déploiement Backend, Admin, Control Center
- Vérifications

**Temps** : 5-10 minutes

### Option 2 : Commandes Manuelles

Si tu préfères faire manuellement, ouvre le fichier `COMMANDES-SERVEUR.txt` et copie-colle les commandes.

---

## 📋 Après le Déploiement

### 1. Teste l'Admin

Ouvre https://admin.swigs.online (ou ton URL admin) :

1. **Médias** :
   - Va dans Médias
   - Sélectionne un site
   - Upload une image
   - Change de site → l'image ne doit pas apparaître ✅

2. **SEO** :
   - Va dans SEO
   - Clique sur le bouton "+" (Ajouter une page)
   - Crée une page "À propos"
   - Elle apparaît dans la liste ✅

3. **Content** :
   - Va dans Content
   - Clique sur "Nouvelle section"
   - Crée une section "Features"
   - Clique sur "Nouveau contenu"
   - Crée du contenu ✅

### 2. Teste le Control Center

Ouvre https://monitoring.swigs.online (ou ton URL monitoring) :

1. Va dans **Sites**
2. Clique sur **"Ajouter un site"**
3. Remplis le formulaire
4. Enregistre
5. Le site apparaît ✅
6. Teste les boutons Modifier et Supprimer

---

## 📚 Documentation Créée

J'ai créé **8 fichiers de documentation** pour toi :

| Fichier | Quand l'utiliser |
|---------|------------------|
| **POUR-TOI.md** (ce fichier) | Pour déployer rapidement |
| **RESUME-FINAL.md** | Pour comprendre tout ce qui a été fait |
| **COMMANDES-SERVEUR.txt** | Pour copier-coller les commandes |
| **COMMANDES-DEPLOIEMENT.md** | Guide complet de déploiement |
| **deploy-multi-sites.sh** | Script automatique |
| **docs/DEPLOIEMENT-MULTI-SITES.md** | Guide détaillé avec migration médias |
| **docs/MODIFICATIONS-MULTI-SITES.md** | Résumé technique des modifs |
| **docs/ANALYSE-MULTI-SITES.md** | Analyse des problèmes résolus |

**Conseil** : Commence par `RESUME-FINAL.md` pour avoir une vue d'ensemble.

---

## ⚠️ Points Importants

### 1. Backups Automatiques

Le script crée automatiquement des backups dans `~/backups/` :
- MongoDB (swigs-cms + swigs-monitoring)
- Sites web (/var/www/)
- Configs Nginx

**Tu peux rollback facilement** si besoin.

### 2. Compatibilité

✅ **Tout est rétrocompatible** :
- Les anciens médias continuent de fonctionner
- Pas de breaking changes
- Pas de migration obligatoire

### 3. Migration Médias (Optionnel)

Si tu as des médias existants dans `/var/www/speed-l/uploads/`, tu peux les migrer vers la nouvelle structure.

**Voir** : `docs/DEPLOIEMENT-MULTI-SITES.md` section "Migration des Médias"

**Mais ce n'est pas obligatoire** - les anciens médias continuent de fonctionner.

---

## 🆘 En Cas de Problème

### 1. Vérifier les Logs

```bash
# Logs Backend
pm2 logs swigs-cms-backend --lines 50

# Logs Nginx
sudo tail -f /var/log/nginx/admin-error.log
```

### 2. Rollback

```bash
# Backend
cd ~/swigs-apps/swigs-cms-backend
git log --oneline -5  # Voir les commits
git checkout c5ddafa  # Revenir au commit précédent
pm2 restart swigs-cms-backend

# Admin
cd ~/swigs-apps/swigs-cms-admin
git checkout c5ddafa
npm install && npm run build
sudo cp -r dist/* /var/www/admin/

# MongoDB (si nécessaire)
ls ~/backups/mongodb/
mongorestore --db swigs-cms ~/backups/mongodb/pre-multi-sites-YYYYMMDD-HHMM/swigs-cms/
```

### 3. Consulter la Doc

Ouvre `COMMANDES-DEPLOIEMENT.md` section "Rollback"

---

## 🎓 Architecture Finale

Voici comment ça fonctionne maintenant :

```
┌─────────────────────────────────────────┐
│         SWIGS Multi-Sites               │
├─────────────────────────────────────────┤
│                                         │
│  Site 1 ──┐                             │
│  Site 2 ──┼──► Backend API              │
│  Site 3 ──┘    │                        │
│                │                        │
│                ├──► MongoDB             │
│                │    - Sites             │
│                │    - Media (nouveau!)  │
│                │    - SEO               │
│                │                        │
│                ├──► Admin CMS           │
│                │    - Médias ✅         │
│                │    - SEO ✅            │
│                │    - Content ✅        │
│                │                        │
│                └──► Control Center      │
│                     - Gestion sites ✅  │
│                                         │
└─────────────────────────────────────────┘
```

**Chaque site est isolé** :
- Ses propres médias dans `/var/www/uploads/{slug}/`
- Ses propres pages SEO configurables
- Ses propres sections Content configurables

---

## 📊 Statistiques

- **17 fichiers** modifiés/créés
- **2,902 lignes** ajoutées
- **4 commits** sur GitHub
- **8 documents** de documentation
- **1 script** de déploiement automatique

---

## ✅ Checklist Rapide

Avant de déployer :
- [ ] Lire ce fichier (tu y es !)
- [ ] Vérifier que tu as accès au serveur SSH
- [ ] Vérifier l'espace disque sur le serveur (`df -h`)

Pendant le déploiement :
- [ ] Copier le script sur le serveur
- [ ] Exécuter `./deploy-multi-sites.sh`
- [ ] Attendre 5-10 minutes

Après le déploiement :
- [ ] Tester l'Admin (médias, SEO, content)
- [ ] Tester le Control Center (gestion sites)
- [ ] Vérifier les logs (pas d'erreurs)
- [ ] Surveiller pendant 24h

---

## 🎉 C'est Tout !

**Tu es prêt à déployer !**

Si tu as des questions, consulte :
1. `RESUME-FINAL.md` - Vue d'ensemble
2. `COMMANDES-DEPLOIEMENT.md` - Guide complet
3. `docs/DEPLOIEMENT-MULTI-SITES.md` - Guide détaillé

**Bon déploiement ! 🚀**

---

## 📞 Rappel des URLs

Après le déploiement, teste ces URLs :

- **Admin** : https://admin.swigs.online (ou ton URL)
- **Control Center** : https://monitoring.swigs.online (ou ton URL)
- **API** : http://localhost:3000/api/health (sur le serveur)

---

**PS** : Le script crée des backups automatiquement, donc **tu ne risques rien** ! En cas de problème, tu peux rollback en 2 minutes.

**Bonne chance ! 💪**
