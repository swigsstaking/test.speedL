# 🔧 Correction boucle infinie page admin

## 🎯 Problème résolu

La page admin redirige en boucle vers `/login` même après une connexion réussie.

## ✅ Corrections appliquées

### 1. AuthContext.jsx
- ✅ Correction du `useEffect` avec flag `initialized`
- ✅ Évite les multiples appels à `checkAuth()`
- ✅ Ne s'exécute qu'une seule fois au montage

### 2. api.js
- ✅ Vérification du path avant redirection
- ✅ Pas de redirection si déjà sur `/login`
- ✅ Délai de 100ms pour éviter les boucles

### 3. Login.jsx
- ✅ Redirection automatique si déjà connecté
- ✅ Évite de rester bloqué sur la page de login

---

## 🚀 Déploiement de la correction

```bash
# Sur votre Mac
cd /Users/corentinflaction/CascadeProjects/windsurf-project-4
git pull origin main
git push origin main

# Sur le serveur
ssh swigs@VOTRE_IP
cd ~/websites/speed-l
git pull origin main
./clean-deploy.sh
```

---

## 🧪 Test après déploiement

### 1. Vider le cache et localStorage

**Dans le navigateur (F12 → Console) :**
```javascript
localStorage.clear()
sessionStorage.clear()
location.reload()
```

**OU en navigation privée :**
- `Cmd + Shift + N` (Mac)
- `Ctrl + Shift + N` (Windows)

### 2. Tester le login

1. Aller sur `https://admin.swigs.online`
2. ✅ Page de login s'affiche
3. Entrer : `admin@swigs.online` / `Admin123!`
4. Cliquer sur "Se connecter"
5. ✅ Redirection vers le dashboard
6. ✅ Pas de boucle !

### 3. Tester le refresh

1. Sur le dashboard, appuyer sur `F5` (refresh)
2. ✅ Le dashboard se recharge
3. ✅ Pas de redirection vers `/login`

### 4. Tester la déconnexion

1. Cliquer sur "Déconnexion"
2. ✅ Redirection vers `/login`
3. ✅ Pas de boucle

### 5. Tester avec token invalide

1. Dans la console (F12) :
```javascript
localStorage.setItem('token', 'invalid-token')
location.reload()
```
2. ✅ Redirection vers `/login`
3. ✅ Token supprimé
4. ✅ Pas de boucle

---

## 🐛 Si le problème persiste

### Diagnostic 1 : Vérifier les logs backend

```bash
# Sur le serveur
pm2 logs swigs-api --lines 50
```

**Cherchez :**
- Erreurs 401 répétées
- Erreurs de connexion MongoDB
- Erreurs JWT

### Diagnostic 2 : Vérifier la console navigateur

**Ouvrir la console (F12) et chercher :**
- Erreurs réseau (onglet Network)
- Erreurs JavaScript (onglet Console)
- Requêtes `/api/auth/me` qui échouent

### Diagnostic 3 : Vérifier le backend

```bash
# Tester l'API directement
curl -X POST https://admin.swigs.online/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@swigs.online","password":"Admin123!"}'

# Devrait retourner un token
```

### Diagnostic 4 : Vérifier MongoDB

```bash
# Sur le serveur
mongosh
use swigs-cms
db.users.find()

# Vérifier qu'il y a un utilisateur admin
```

**Si pas d'utilisateur :**
```bash
cd ~/websites/speed-l/backend
npm run seed
```

---

## 🔍 Causes possibles si ça ne marche toujours pas

### 1. Cache navigateur têtu

**Solution :**
```bash
# Vider COMPLÈTEMENT le cache
# Chrome : Cmd+Shift+Delete → Tout cocher → Effacer
# Firefox : Cmd+Shift+Delete → Tout cocher → Effacer
```

### 2. Token corrompu dans localStorage

**Solution (dans la console) :**
```javascript
localStorage.clear()
sessionStorage.clear()
// Fermer tous les onglets admin
// Rouvrir en navigation privée
```

### 3. CORS mal configuré

**Vérifier backend/.env :**
```bash
cat ~/websites/speed-l/backend/.env | grep CORS
```

**Devrait contenir :**
```
CORS_ORIGIN=https://swigs.online,https://www.swigs.online,https://admin.swigs.online,http://swigs.online,http://www.swigs.online,http://admin.swigs.online
```

**Si différent :**
```bash
nano ~/websites/speed-l/backend/.env
# Corriger CORS_ORIGIN
pm2 restart swigs-api
```

### 4. JWT_SECRET manquant ou invalide

**Vérifier :**
```bash
cat ~/websites/speed-l/backend/.env | grep JWT_SECRET
```

**Si vide ou "your-super-secret..." :**
```bash
cd ~/websites/speed-l
./setup-env.sh
pm2 restart swigs-api
```

---

## 📝 Checklist de résolution

- [ ] Code mis à jour (`git pull`)
- [ ] Admin rebuilder (`./clean-deploy.sh`)
- [ ] Cache navigateur vidé
- [ ] localStorage vidé
- [ ] Test en navigation privée
- [ ] Backend logs vérifiés
- [ ] MongoDB contient un utilisateur
- [ ] CORS configuré correctement
- [ ] JWT_SECRET configuré

---

## 🆘 Dernier recours

Si RIEN ne fonctionne :

```bash
# Sur le serveur
cd ~/websites/speed-l

# 1. Tout nettoyer
./clean-deploy.sh

# 2. Réinitialiser la DB
mongosh
use swigs-cms
db.dropDatabase()
exit

# 3. Reconfigurer
./setup-env.sh
./clean-deploy.sh

# 4. Sur votre Mac
# Ouvrir en navigation privée
# Tester https://admin.swigs.online
```

---

**Cette fois, la boucle DOIT être corrigée ! 🎯**
