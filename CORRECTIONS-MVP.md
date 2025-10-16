# Corrections appliquées pour le MVP fonctionnel

## 🐛 Problèmes résolus

### 1. Boucle infinie au chargement
**Cause :** Le `SiteContext` essayait de charger les sites avant l'authentification, créant des centaines de requêtes.

**Solution :**
- Retiré `SiteProvider` de `App.jsx`
- Simplifié `Sidebar.jsx` pour ne plus utiliser `useSite`
- Ajouté un flag `checking` dans `AuthContext` pour éviter les appels multiples

### 2. Erreur 401 (Unauthorized)
**Cause :** Tentative d'accès à `/api/sites` sans être authentifié.

**Solution :** Le `SiteContext` ne se charge plus au démarrage de l'app.

### 3. Erreur 429 (Too Many Requests)
**Cause :** Rate limiting trop strict (100 req/15min) déclenché par la boucle infinie.

**Solution :** Augmenté la limite à 1000 req/15min dans `server.js`.

### 4. Erreur 502 (Bad Gateway)
**Cause :** Configuration Nginx incorrecte pour le proxy API.

**Solution :** 
- Modifié `.env.example` pour utiliser `/api` au lieu de `http://localhost:3000/api`
- L'admin utilise maintenant le proxy Nginx

### 5. Écran noir après login
**Cause :** Le Dashboard utilisait `useSite` qui n'était plus disponible.

**Solution :** Simplifié le Dashboard pour afficher uniquement les infos utilisateur.

---

## 📁 Fichiers modifiés

### Frontend Admin
- ✅ `admin/src/App.jsx` - Retiré SiteProvider et routes inutilisées
- ✅ `admin/src/components/Sidebar.jsx` - Version simplifiée sans useSite
- ✅ `admin/src/pages/Dashboard.jsx` - Version MVP simple
- ✅ `admin/src/context/AuthContext.jsx` - Ajout flag checking
- ✅ `admin/.env.example` - Utilise /api au lieu de localhost:3000

### Backend
- ✅ `backend/server.js` - Rate limiting augmenté à 1000 req/15min

---

## 🚀 État actuel (MVP fonctionnel)

### ✅ Ce qui fonctionne
- Login/Logout
- Authentification JWT
- Dashboard simple avec infos utilisateur
- Navigation de base
- API backend opérationnelle
- Proxy Nginx configuré

### 🔜 À réimplémenter (prochaine étape)
- SiteContext (avec chargement conditionnel)
- Gestion des cours
- Gestion SEO
- Gestion du contenu
- Gestion des médias
- Sélecteur de sites

---

## 📝 Notes pour la suite

### Pour réactiver les fonctionnalités complètes :

1. **Réintégrer SiteProvider** dans App.jsx MAIS :
   - Le wrapper uniquement autour des routes protégées
   - Pas au niveau racine de l'app

2. **Corriger SiteContext** :
   - Ajouter un flag `loadingStarted` pour éviter les appels multiples
   - Ne charger les sites QUE si l'utilisateur est authentifié

3. **Réactiver les pages** :
   - Courses.jsx
   - SEO.jsx
   - Content (à créer)
   - Media (à créer)

4. **Restaurer le Dashboard complet** :
   - Statistiques
   - Cours récents
   - Actions rapides

---

## 🔧 Configuration serveur Ubuntu

### Fichiers à créer/modifier sur le serveur :

1. **Backend .env**
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/swigs-cms
JWT_SECRET=votre-secret-unique
CORS_ORIGIN=http://localhost:5174
```

2. **Admin .env**
```env
VITE_API_URL=/api
```

3. **Nginx config** (`/etc/nginx/sites-available/swigs-admin`)
```nginx
server {
    listen 5174;
    server_name _;
    root /home/swigs/websites/speed-l/admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## ✅ Checklist de déploiement

- [ ] Git commit des corrections
- [ ] Git push sur GitHub
- [ ] Pull sur le serveur Ubuntu
- [ ] npm install (backend + admin)
- [ ] npm run build (admin)
- [ ] pm2 restart swigs-api
- [ ] sudo systemctl reload nginx
- [ ] Test de connexion

---

Date des corrections : 16 octobre 2025
Version : MVP 1.0 (fonctionnel)
