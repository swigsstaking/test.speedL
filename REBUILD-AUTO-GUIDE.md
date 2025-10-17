# 🚀 Guide du Rebuild Automatique (Option C)

## 🎯 Comment ça fonctionne

Vous avez maintenant le **meilleur des deux mondes** :
- ✅ **Performance maximale** (site statique)
- ✅ **Mise à jour quasi-instantanée** (30-60 secondes)
- ✅ **SEO optimal**
- ✅ **Coût serveur minimal**

---

## 📦 Installation sur le serveur

```bash
# 1. Mise à jour du code
cd ~/websites/speed-l
git pull origin main

# 2. Rendre le script exécutable
chmod +x rebuild-site.sh

# 3. Redémarrer le backend
pm2 restart swigs-api

# 4. Rebuilder l'admin
cd admin
npm run build
sudo cp -r dist/* /var/www/admin/

# 5. Tester le système
# Ouvrir https://admin.swigs.online
```

---

## 🎨 Utilisation dans l'admin

### 1. Modifier du contenu

1. Ouvrir `https://admin.swigs.online`
2. Aller dans **Formations**
3. Modifier un cours (titre, prix, dates, etc.)
4. Cliquer sur **Enregistrer**

### 2. Publier les modifications

1. Retourner au **Dashboard**
2. Cliquer sur le bouton **"Publier les modifications"** en haut à droite
3. Un message apparaît : "Site en cours de mise à jour ! (30-60 secondes)"
4. Attendre 30-60 secondes

### 3. Vérifier sur le site

1. Ouvrir `https://swigs.online/cours`
2. Rafraîchir la page (`F5`)
3. ✅ Les modifications sont visibles !

---

## ⚙️ Comment ça marche techniquement

```
┌─────────────┐
│    ADMIN    │
│             │
│  Modifier   │
│   contenu   │
│             │
│  Cliquer    │
│  "Publier"  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   BACKEND   │
│             │
│  Webhook    │
│  /rebuild   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   SCRIPT    │
│             │
│  rebuild-   │
│  site.sh    │
│             │
│  1. Clean   │
│  2. Build   │
│  3. Deploy  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    SITE     │
│             │
│  swigs.     │
│  online     │
│             │
│  ✅ Mis à   │
│     jour    │
└─────────────┘
```

---

## 📝 Logs et débogage

### Voir les logs de rebuild

```bash
# Sur le serveur
cat ~/websites/speed-l/rebuild.log

# Suivre en temps réel
tail -f ~/websites/speed-l/rebuild.log
```

### Tester le rebuild manuellement

```bash
# Sur le serveur
cd ~/websites/speed-l
./rebuild-site.sh
```

### Vérifier que le webhook fonctionne

```bash
# Tester l'API directement
curl -X POST https://admin.swigs.online/api/webhook/rebuild \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

## 🔧 Personnalisation

### Modifier le temps de rebuild

Le rebuild prend environ **30-60 secondes**. Pour l'optimiser :

1. **Utiliser un cache npm** :
```bash
# Dans rebuild-site.sh, ajouter :
npm ci --prefer-offline
```

2. **Paralléliser les tâches** :
```bash
# Build en mode production optimisé
npm run build -- --mode production
```

### Ajouter des notifications

Vous pouvez ajouter des notifications (email, Slack, etc.) dans `rebuild-site.sh` :

```bash
# Exemple avec curl (webhook Slack)
if [ $? -eq 0 ]; then
    curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
      -d '{"text":"✅ Site Speed-L mis à jour !"}'
fi
```

---

## 🎯 Workflow quotidien

### Matin

1. Ouvrir l'admin
2. Vérifier les nouvelles inscriptions
3. Modifier les cours si nécessaire
4. Cliquer sur "Publier les modifications"
5. ☕ Prendre un café pendant le rebuild

### Après-midi

1. Ajouter un nouveau cours
2. Modifier le SEO d'une page
3. Uploader une nouvelle image
4. Cliquer sur "Publier les modifications"
5. Vérifier sur le site

---

## ⚠️ Important

### Quand publier ?

✅ **Publiez quand :**
- Vous modifiez un cours
- Vous ajoutez un nouveau cours
- Vous changez des prix
- Vous modifiez des dates

❌ **Pas besoin de publier pour :**
- Consulter les statistiques
- Voir les logs
- Naviguer dans l'admin

### Fréquence

- **Recommandé** : 1-2 fois par jour maximum
- **Éviter** : Publier toutes les 5 minutes
- **Raison** : Chaque rebuild consomme des ressources serveur

---

## 📊 Statistiques

### Temps de rebuild

- **Clean** : 2-3 secondes
- **Build** : 20-30 secondes
- **Deploy** : 2-3 secondes
- **Total** : ~30-40 secondes

### Ressources utilisées

- **CPU** : 50-80% pendant 30 secondes
- **RAM** : +200 MB temporairement
- **Disque** : Aucun impact (fichiers remplacés)

---

## 🆘 Dépannage

### Le rebuild ne se déclenche pas

```bash
# Vérifier les logs backend
pm2 logs swigs-api

# Vérifier les permissions
ls -la ~/websites/speed-l/rebuild-site.sh
# Doit être exécutable (x)

# Rendre exécutable si nécessaire
chmod +x ~/websites/speed-l/rebuild-site.sh
```

### Le rebuild échoue

```bash
# Voir les logs
cat ~/websites/speed-l/rebuild.log

# Tester manuellement
cd ~/websites/speed-l
./rebuild-site.sh

# Vérifier les dépendances
npm install
```

### Les modifications ne sont pas visibles

```bash
# Vider le cache du navigateur
# Cmd + Shift + R (Mac)
# Ctrl + Shift + R (Windows)

# Vérifier que le rebuild a réussi
cat ~/websites/speed-l/rebuild.log | tail -n 5

# Vérifier les fichiers déployés
ls -la /var/www/speed-l/
```

---

## ✅ Checklist

- [ ] Script `rebuild-site.sh` exécutable
- [ ] Backend redémarré avec les nouvelles routes
- [ ] Admin rebuilder avec le bouton
- [ ] Test : Modifier un cours
- [ ] Test : Cliquer sur "Publier"
- [ ] Test : Vérifier sur le site après 1 minute
- [ ] Logs de rebuild visibles

---

**Profitez du meilleur des deux mondes ! 🎉**
