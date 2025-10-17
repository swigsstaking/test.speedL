# 🚀 Déploiement Rapide - Corrections appliquées

## ✅ Corrections effectuées

1. **Boucle de redirection /login** → Corrigée avec route catch-all
2. **Analytics nettoyé** → Plus de références au contenu
3. **Guide Google Analytics** → Disponible dans `GOOGLE-ANALYTICS-SETUP.md`

---

## 📦 Commandes de déploiement

```bash
# 1. Connexion au serveur
ssh swigs@192.168.110.73

# 2. Mise à jour du code
cd ~/websites/speed-l
git stash
git pull origin main

# 3. Backend - Redémarrer
cd backend
pm2 restart swigs-api

# 4. Admin - Rebuilder
cd ../admin
npm run build

# 5. Site Speed-L - Rebuilder
cd ..
npm run build

# 6. Déployer
sudo cp -r admin/dist/* /var/www/admin/
sudo cp -r dist/* /var/www/speed-l/

# 7. Recharger Nginx
sudo systemctl reload nginx

# 8. Vérifier
pm2 logs swigs-api --lines 20
```

---

## 🧪 Tests

### 1. Tester le site Speed-L

Ouvrir : `http://192.168.110.73`

- ✅ La page d'accueil s'affiche
- ✅ Aller sur `/cours` → Les cours s'affichent
- ✅ Refresh la page → Pas de redirection vers `/login`
- ✅ Aller sur une URL inexistante (ex: `/test`) → Redirection vers `/`

### 2. Tester l'admin

Ouvrir : `http://admin.swigs.online` (ou via IP + /etc/hosts)

- ✅ Login fonctionne
- ✅ Dashboard s'affiche
- ✅ Analytics affiche 3 cartes (Formations, SEO, Médias)
- ✅ Pas de mention de "Blocs de contenu"

---

## 🎯 Prochaines étapes

### Google Analytics (Optionnel)

Suivre le guide `GOOGLE-ANALYTICS-SETUP.md` pour :
- Ajouter le tracking sur le site
- Voir les visiteurs en temps réel
- Obtenir des statistiques détaillées

### Fonctionnalités à venir

- [ ] Webhook auto-rebuild du site après modification
- [ ] Intégration Google Analytics dans l'admin
- [ ] Système de cache pour améliorer les performances
- [ ] HTTPS avec Certbot

---

## 🐛 Si problème persiste

### Le site redirige encore vers /login

```bash
# Vérifier que le nouveau build est bien déployé
ls -la /var/www/speed-l/
# Doit contenir index.html et assets/

# Vider le cache du navigateur
# Cmd + Shift + R (Mac) ou Ctrl + Shift + R (Windows)

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log
```

### L'admin ne charge pas

```bash
# Vérifier que le backend tourne
pm2 status
pm2 logs swigs-api

# Vérifier que Nginx proxy bien l'API
curl http://localhost/api/sites
```

---

**Tout est prêt ! Déployez et testez !** 🎉
