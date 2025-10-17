# 🔧 Fix Upload Logo - Configuration

## 🐛 Problème

Les uploads retournent `http://admin.swigs.online/uploads/...` au lieu de `https://swigs.online/uploads/...`

## ✅ Solution

### 1. Configurer PUBLIC_URL sur le serveur

```bash
# Sur le serveur
ssh swigs@VOTRE_IP

# Éditer le .env du backend
cd ~/websites/speed-l/backend
nano .env

# Ajouter cette ligne (ou modifier si elle existe)
PUBLIC_URL=https://swigs.online

# Sauvegarder : Ctrl+O, Enter, Ctrl+X
```

### 2. Redémarrer le backend

```bash
pm2 restart swigs-api
pm2 logs swigs-api --lines 10
```

### 3. Tester

```bash
# Tester l'upload via curl
curl -X POST https://admin.swigs.online/api/media/upload \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -F "file=@/path/to/image.png"

# Devrait retourner:
# {
#   "success": true,
#   "url": "https://swigs.online/uploads/FICHIER.png"
# }
```

### 4. Vérifier dans l'admin

1. Ouvrir `https://admin.swigs.online`
2. Aller dans **Paramètres**
3. Uploader un logo
4. ✅ Le preview devrait s'afficher
5. ✅ L'URL devrait être `https://swigs.online/uploads/...`

---

## 📋 Checklist

- [ ] `PUBLIC_URL=https://swigs.online` dans le .env
- [ ] Backend redémarré (`pm2 restart swigs-api`)
- [ ] Upload fonctionne dans l'admin
- [ ] Logo s'affiche sur le site après rebuild

---

## 🔍 Debug

### Vérifier la variable d'environnement

```bash
pm2 env swigs-api | grep PUBLIC_URL
# Devrait afficher: PUBLIC_URL=https://swigs.online
```

### Vérifier les logs

```bash
pm2 logs swigs-api --lines 50
```

### Vérifier que les fichiers sont accessibles

```bash
# Tester l'accès direct
curl -I https://swigs.online/uploads/VOTRE_FICHIER.png
# Devrait retourner: HTTP/2 200
```

---

## 🎯 Résultat attendu

**Avant :**
```json
{
  "url": "http://admin.swigs.online/uploads/123.png"  // ❌ Mauvais domaine
}
```

**Après :**
```json
{
  "url": "https://swigs.online/uploads/123.png"  // ✅ Bon domaine
}
```
