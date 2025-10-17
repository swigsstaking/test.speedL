# 🔄 Guide de mise à jour - Intégration Admin ↔ Site

## 🎯 Ce qui a changé

### ✅ Nouvelles fonctionnalités
1. **Site Speed-L dynamique** - Les cours sont maintenant récupérés depuis l'API
2. **Page Analytics** - Remplace "Contenu" avec graphiques et statistiques
3. **Intégration complète** - Les modifications dans l'admin apparaissent sur le site

### 🔧 Comment ça fonctionne maintenant

```
Admin Panel (port 3000/api)
     ↓
  MongoDB
     ↓
Site Speed-L (récupère les données via API)
```

---

## 📦 Commandes de déploiement sur le serveur

### 1️⃣ Se connecter et mettre à jour le code

```bash
ssh swigs@<IP>
cd ~/websites/speed-l
git stash  # Si modifications locales
git pull origin main
```

### 2️⃣ Backend - Redémarrer l'API

```bash
cd backend
pm2 restart swigs-api
pm2 logs swigs-api --lines 20
```

### 3️⃣ Admin Panel - Rebuilder

```bash
cd ../admin
npm install  # Si nouvelles dépendances
npm run build
```

### 4️⃣ Site Speed-L - Créer le .env et rebuilder

```bash
cd ..  # Retour à la racine du projet

# Créer le fichier .env pour le site
echo "VITE_API_URL=/api" > .env

# Installer les dépendances (si nécessaire)
npm install

# Build du site
npm run build
```

### 5️⃣ Déployer vers Nginx

```bash
# Copier l'admin
sudo cp -r admin/dist/* /var/www/admin.swigs.online/html/

# Copier le site Speed-L
sudo cp -r dist/* /var/www/swigs.online/html/

# Recharger Nginx
sudo systemctl reload nginx
```

---

## 🧪 Tester l'intégration

### 1. Ajouter un cours dans l'admin

1. Ouvrir `http://admin.swigs.online`
2. Login : `admin@swigs.com` / `Admin123!`
3. Aller dans **Formations**
4. Cliquer sur **Nouveau cours**
5. Remplir les informations :
   - Titre : `Test de cours dynamique`
   - Numéro : `N°999`
   - Description : `Ceci est un test`
   - Prix : `100`
   - Catégorie : `Test`
   - Statut : `active`
6. Sauvegarder

### 2. Rebuilder le site Speed-L

```bash
cd ~/websites/speed-l
npm run build
sudo cp -r dist/* /var/www/swigs.online/html/
```

### 3. Vérifier sur le site

1. Ouvrir `http://swigs.online/cours` (ou via IP locale)
2. Le nouveau cours devrait apparaître ! 🎉

---

## 📊 Utiliser Analytics

1. Dans l'admin, cliquer sur **Analytics**
2. Voir les statistiques :
   - Nombre total de formations
   - Formations actives
   - Pages SEO
   - Fichiers média
3. Graphiques par catégorie et statut
4. Activité récente

---

## 🔄 Workflow de mise à jour

### Quand vous modifiez un cours :

```bash
# Sur le serveur
cd ~/websites/speed-l

# 1. Rebuilder le site
npm run build

# 2. Déployer
sudo cp -r dist/* /var/www/swigs.online/html/

# 3. Vider le cache du navigateur
# Cmd + Shift + R (Mac) ou Ctrl + Shift + R (Windows)
```

### Pour automatiser (optionnel) :

Créer un script `rebuild-site.sh` :

```bash
#!/bin/bash
cd ~/websites/speed-l
npm run build
sudo cp -r dist/* /var/www/swigs.online/html/
echo "✅ Site Speed-L mis à jour !"
```

Rendre exécutable :
```bash
chmod +x rebuild-site.sh
```

Utiliser :
```bash
./rebuild-site.sh
```

---

## 🐛 Troubleshooting

### Les cours n'apparaissent pas sur le site

**Cause :** L'API n'est pas accessible ou le site n'a pas été rebuild

**Solution :**
```bash
# Vérifier que l'API fonctionne
curl http://localhost:3000/api/sites

# Vérifier que le .env existe
cat ~/websites/speed-l/.env
# Devrait afficher : VITE_API_URL=/api

# Rebuilder le site
cd ~/websites/speed-l
npm run build
sudo cp -r dist/* /var/www/swigs.online/html/
```

### Erreur CORS dans la console

**Cause :** Le backend n'autorise pas les requêtes depuis le site

**Solution :**
```bash
# Vérifier le .env du backend
cat ~/websites/speed-l/backend/.env
# CORS_ORIGIN devrait inclure votre domaine

# Si besoin, modifier :
nano ~/websites/speed-l/backend/.env
# Ajouter : CORS_ORIGIN=http://swigs.online,http://admin.swigs.online

# Redémarrer le backend
pm2 restart swigs-api
```

### Le site affiche "Aucun cours disponible"

**Causes possibles :**
1. Aucun cours avec `status: 'active'` dans la DB
2. Le slug du site n'est pas 'speed-l'
3. L'API ne répond pas

**Solution :**
```bash
# Vérifier dans MongoDB
mongosh
use swigs_cms
db.courses.find({ status: 'active' })
db.sites.find({ slug: 'speed-l' })

# Si le site n'existe pas, le créer via l'admin ou seed
cd ~/websites/speed-l/backend
npm run seed
```

---

## 📝 Notes importantes

1. **Rebuild obligatoire** - À chaque modification dans l'admin, il faut rebuilder le site Speed-L
2. **Cache navigateur** - Toujours vider le cache après un rebuild
3. **API publique** - L'API `/api/sites` et `/api/courses` doit être accessible sans authentification
4. **Performance** - Le site fait un appel API au chargement de la page Cours

---

## 🚀 Prochaines améliorations possibles

1. **Webhook automatique** - Rebuilder le site automatiquement après modification
2. **Cache côté serveur** - Mettre en cache les cours pour améliorer les performances
3. **SSR/SSG** - Utiliser Next.js pour générer les pages statiques
4. **CDN** - Utiliser un CDN pour servir les assets statiques

---

## ✅ Checklist de déploiement

- [ ] `git pull` sur le serveur
- [ ] Backend redémarré (`pm2 restart swigs-api`)
- [ ] Admin rebuilder (`cd admin && npm run build`)
- [ ] Site `.env` créé (`echo "VITE_API_URL=/api" > .env`)
- [ ] Site rebuilder (`npm run build`)
- [ ] Fichiers copiés vers Nginx
- [ ] Nginx rechargé (`sudo systemctl reload nginx`)
- [ ] Test admin : http://admin.swigs.online
- [ ] Test site : http://swigs.online/cours
- [ ] Cours ajouté dans l'admin
- [ ] Site rebuilder
- [ ] Nouveau cours visible sur le site

---

**Bon déploiement ! 🎉**
