# 🔧 Correction définitive de la boucle de redirection

## 🎯 Problème

Le site Speed-L redirige vers `/login` et crée une boucle infinie.

## 🔍 Causes possibles

1. **Fichiers mélangés** - Les fichiers de l'admin et du site sont mélangés
2. **Cache navigateur** - Le navigateur garde l'ancienne version
3. **localStorage partagé** - Admin et site partagent le même localStorage sur l'IP
4. **Nginx mal configuré** - Les routes ne sont pas bien séparées

## ✅ Solution définitive

### Étape 1 : Mettre à jour le code

```bash
# Sur votre serveur
ssh swigs@192.168.110.73
cd ~/websites/speed-l
git stash
git pull origin main
```

### Étape 2 : Rendre le script exécutable

```bash
chmod +x deploy.sh
```

### Étape 3 : Exécuter le script de déploiement

```bash
./deploy.sh
```

Ce script va :
- ✅ Nettoyer COMPLÈTEMENT les dossiers `/var/www/admin` et `/var/www/speed-l`
- ✅ Rebuilder l'admin et le site séparément
- ✅ Copier les bons fichiers aux bons endroits
- ✅ Redémarrer Nginx

### Étape 4 : Vérifier les configurations Nginx

```bash
# Copier la bonne config pour le site
sudo cp ~/websites/speed-l/nginx-configs/speed-l.conf /etc/nginx/sites-available/speed-l

# Copier la bonne config pour l'admin
sudo cp ~/websites/speed-l/nginx-configs/admin.conf /etc/nginx/sites-available/admin

# Créer les liens symboliques si pas déjà fait
sudo ln -sf /etc/nginx/sites-available/speed-l /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/admin /etc/nginx/sites-enabled/

# Tester et recharger
sudo nginx -t
sudo systemctl reload nginx
```

### Étape 5 : Nettoyer le navigateur

**Sur votre Mac :**

1. **Vider le cache** : `Cmd + Shift + R` (ou `Ctrl + Shift + R`)
2. **Ou mieux, ouvrir en navigation privée** : `Cmd + Shift + N`
3. **Ou encore mieux, vider complètement le localStorage** :
   - Ouvrir la console (F12)
   - Taper : `localStorage.clear()`
   - Taper : `sessionStorage.clear()`
   - Rafraîchir

### Étape 6 : Tester

1. **Site Speed-L** : `http://192.168.110.73`
   - ✅ Page d'accueil s'affiche
   - ✅ Aller sur `/cours` → Cours s'affichent
   - ✅ Refresh → Pas de redirection
   - ✅ URL inexistante → Redirection vers `/`

2. **Admin Panel** : `http://admin.swigs.online`
   - ✅ Page de login s'affiche
   - ✅ Login fonctionne
   - ✅ Dashboard s'affiche

---

## 🐛 Si le problème persiste

### Diagnostic 1 : Vérifier les fichiers déployés

```bash
# Vérifier le site
ls -la /var/www/speed-l/
# Doit contenir : index.html, assets/, vite.svg

# Vérifier l'admin
ls -la /var/www/admin/
# Doit contenir : index.html, assets/, vite.svg

# Vérifier qu'ils sont différents
diff /var/www/speed-l/index.html /var/www/admin/index.html
# Doit afficher des différences !
```

### Diagnostic 2 : Vérifier Nginx

```bash
# Voir quelle config est active
sudo nginx -T | grep -A 10 "server_name.*swigs.online"

# Vérifier les logs
sudo tail -f /var/log/nginx/speed-l-error.log
sudo tail -f /var/log/nginx/admin-error.log
```

### Diagnostic 3 : Vérifier le backend

```bash
# Statut PM2
pm2 status

# Logs
pm2 logs swigs-api --lines 50

# Tester l'API directement
curl http://localhost:3000/api/sites
```

### Diagnostic 4 : Tester avec curl

```bash
# Tester le site
curl -I http://192.168.110.73/
# Doit retourner 200 OK

# Tester l'admin
curl -I http://admin.swigs.online/
# Doit retourner 200 OK

# Tester une route inexistante du site
curl -I http://192.168.110.73/login
# Doit retourner 200 OK (redirigé vers index.html)
```

---

## 🔒 Solution alternative : Utiliser des sous-domaines différents

Si le problème persiste vraiment, c'est peut-être un conflit de localStorage.

**Solution** : Accéder au site via un sous-domaine différent

```bash
# Modifier /etc/hosts sur votre Mac
sudo nano /etc/hosts

# Ajouter :
192.168.110.73  swigs.online
192.168.110.73  admin.swigs.online
192.168.110.73  www.swigs.online
```

Puis accéder à :
- Site : `http://www.swigs.online`
- Admin : `http://admin.swigs.online`

Comme ça, le localStorage est séparé !

---

## 📝 Checklist finale

- [ ] Code mis à jour (`git pull`)
- [ ] Script `deploy.sh` exécuté
- [ ] Configurations Nginx copiées
- [ ] Nginx rechargé
- [ ] Cache navigateur vidé
- [ ] localStorage vidé
- [ ] Site testé : `http://192.168.110.73`
- [ ] Admin testé : `http://admin.swigs.online`
- [ ] Pas de redirection vers `/login` sur le site
- [ ] Login fonctionne sur l'admin

---

## 🆘 Dernier recours

Si VRAIMENT rien ne fonctionne :

```bash
# Tout supprimer et recommencer
sudo rm -rf /var/www/admin/*
sudo rm -rf /var/www/speed-l/*
cd ~/websites/speed-l
rm -rf admin/dist admin/node_modules/.vite
rm -rf dist node_modules/.vite
./deploy.sh
```

Puis vider COMPLÈTEMENT le cache du navigateur et tester en navigation privée.

---

**Cette fois, ça DOIT fonctionner !** 🎯
