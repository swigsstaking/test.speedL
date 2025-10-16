# 🚀 Commandes de déploiement

## 📤 Sur votre Mac (commit et push)

```bash
cd /Users/corentinflaction/CascadeProjects/windsurf-project-4

# Vérifier les fichiers modifiés
git status

# Ajouter tous les fichiers modifiés
git add admin/src/App.jsx
git add admin/src/components/Sidebar.jsx
git add admin/src/pages/Dashboard.jsx
git add admin/src/context/AuthContext.jsx
git add admin/.env.example
git add backend/server.js
git add CORRECTIONS-MVP.md
git add DEPLOY-COMMANDS.md

# Commit
git commit -m "Fix: Correction boucle infinie et erreurs 401/429/502 - MVP fonctionnel"

# Push sur GitHub
git push origin main
```

---

## 🖥️ Sur le serveur Ubuntu (déploiement)

```bash
# Se connecter au serveur
ssh swigs@VOTRE_IP

# Aller dans le projet
cd ~/websites/speed-l

# Pull les dernières modifications
git pull origin main

# Backend : Redémarrer l'API
cd backend
pm2 restart swigs-api

# Admin : Rebuilder
cd ../admin

# Créer le fichier .env (si pas déjà fait)
echo "VITE_API_URL=/api" > .env

# Nettoyer et rebuilder
rm -rf dist/ node_modules/.vite
npm run build

# Recharger Nginx
sudo systemctl reload nginx

# Vérifier que tout fonctionne
pm2 status
pm2 logs swigs-api --lines 10
```

---

## ✅ Vérification finale

```bash
# Sur le serveur, tester l'API
curl http://localhost:3000/api/health

# Tester le proxy
curl http://localhost:5174/api/health

# Depuis votre Mac, ouvrir dans le navigateur
# http://VOTRE_IP:5174
```

---

## 🔄 Pour les futures mises à jour

```bash
# Sur votre Mac
git add .
git commit -m "Description des changements"
git push

# Sur le serveur
cd ~/websites/speed-l
git pull
cd backend && pm2 restart swigs-api
cd ../admin && npm run build && sudo systemctl reload nginx
```

---

## 📝 Notes importantes

1. **Toujours créer le fichier .env** dans admin/ sur le serveur :
   ```bash
   echo "VITE_API_URL=/api" > ~/websites/speed-l/admin/.env
   ```

2. **Vérifier les logs** après chaque déploiement :
   ```bash
   pm2 logs swigs-api
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Vider le cache du navigateur** après chaque mise à jour :
   - Cmd + Shift + R (Mac)
   - Ctrl + Shift + R (Windows)
