# 🔍 Analyse Multi-Sites - État Actuel et Plan d'Action

**Date**: 24 Octobre 2025  
**Objectif**: Rendre le système complètement multi-sites

---

## 📊 État Actuel de l'Architecture

### ✅ Ce qui fonctionne déjà

#### Backend API (Port 3000)
- ✅ **Multi-sites natif** : Modèle `Site` avec support de domaines multiples
- ✅ **Permissions granulaires** : Middleware `checkSiteAccess` vérifie l'accès par site
- ✅ **Collections MongoDB** séparées par site :
  - `sites` : Configuration des sites
  - `courses` : Cours liés à `siteId`
  - `seo` : SEO lié à `siteId` et `page`
  - `content` : Contenus liés à `siteId`
  - `contacts` : Contacts liés à `siteId`

#### Monitoring API (Port 3001)
- ✅ **Récupère les sites** depuis le backend principal
- ✅ **Vérifie uptime/SSL** de chaque site
- ✅ **Métriques par site** : Latence, status, SSL
- ✅ **Analytics financiers** : Coûts serveurs, pricing sites

#### Admin Panel
- ✅ **Sélecteur de site** : Context `SiteContext` pour changer de site
- ✅ **Courses** : Déjà filtré par `currentSite`
- ✅ **Contacts** : Déjà filtré par `currentSite`
- ✅ **Settings** : Déjà filtré par `currentSite`

---

## ❌ Problèmes Identifiés

### 1. **Control Center - Pas de gestion des sites**

**Problème** : Le Control Center affiche les sites mais ne permet pas de les gérer.

**Fichier** : `monitoring/src/pages/Sites.jsx`
- Affiche uniquement les métriques (uptime, latence, SSL)
- Pas de bouton "Ajouter un site"
- Pas de modal pour modifier les URLs

**Solution requise** :
- Ajouter bouton "Ajouter un site"
- Modal pour créer/éditer un site avec :
  - Nom du site
  - Slug
  - URLs (test, staging, production)
  - Domaine principal
- Appeler l'API backend (`POST /api/sites`, `PUT /api/sites/:id`)

---

### 2. **Admin - Page SEO non multi-sites**

**Problème** : La page SEO utilise `currentSite` mais les pages sont hardcodées.

**Fichier** : `admin/src/pages/SEO.jsx` (lignes 21-27)
```javascript
const pages = [
  { value: 'home', label: 'Page d\'accueil' },
  { value: 'cours', label: 'Cours & Inscriptions' },
  { value: 'permis', label: 'Permis' },
  { value: 'bons-cadeaux', label: 'Bons cadeaux' },
  { value: 'contact', label: 'Contact' },
];
```

**Problème** :
- Les pages sont identiques pour tous les sites
- Impossible d'ajouter des pages spécifiques à un site
- Pas de gestion dynamique des pages

**Solution requise** :
- Stocker les pages dans le modèle `Site` (backend)
- Récupérer les pages depuis `currentSite.pages`
- Permettre d'ajouter/supprimer des pages par site

---

### 3. **Admin - Page Content non multi-sites**

**Problème** : La page Content filtre par `currentSite` mais les sections sont hardcodées.

**Fichier** : `admin/src/pages/Content.jsx` (ligne 54)
```javascript
const sections = ['all', 'hero', 'about', 'services', 'testimonials', 'faq', 'footer'];
```

**Problème** :
- Les sections sont identiques pour tous les sites
- Impossible d'ajouter des sections spécifiques
- Pas de modal pour créer/éditer du contenu

**Solution requise** :
- Stocker les sections dans le modèle `Site` (backend)
- Récupérer les sections depuis `currentSite.sections`
- Ajouter modal pour créer/éditer du contenu avec éditeur JSON

---

### 4. **Admin - Système de médias problématique**

**Problème** : Les médias sont globaux, pas par site.

**Fichier** : `backend/src/controllers/media.controller.js`
```javascript
const uploadsDir = process.env.UPLOAD_PATH || '/var/www/speed-l/uploads';
```

**Problèmes identifiés** :
1. **Dossier global** : Tous les sites partagent `/var/www/speed-l/uploads`
2. **Pas de filtrage par site** : Impossible de voir uniquement les médias d'un site
3. **Risque de conflit** : Deux sites peuvent avoir des fichiers avec le même nom
4. **Pas de relation** : Les médias ne sont pas liés à un `siteId`

**Solution requise** :
- Créer un modèle `Media` dans MongoDB :
  ```javascript
  {
    filename: String,
    originalName: String,
    url: String,
    siteId: ObjectId,
    mimetype: String,
    size: Number,
    uploadedBy: ObjectId,
    createdAt: Date
  }
  ```
- Modifier l'upload pour :
  - Sauvegarder dans `/var/www/uploads/{siteSlug}/`
  - Créer une entrée MongoDB avec `siteId`
- Modifier `getFiles` pour filtrer par `siteId`
- Ajouter `?siteId=xxx` dans les requêtes

---

## 🎯 Plan d'Action Détaillé

### Phase 1 : Control Center - Gestion des Sites

**Fichiers à modifier** :
1. `monitoring/src/pages/Sites.jsx`
   - Ajouter bouton "Ajouter un site"
   - Créer composant `SiteModal`
   - Ajouter formulaire avec :
     - Nom, slug, domaine principal
     - Liste des URLs (test/staging/prod)
     - Bouton "Ajouter URL"

2. `monitoring/src/services/api.js`
   - Ajouter `createSite(data)`
   - Ajouter `updateSite(id, data)`
   - Ajouter `deleteSite(id)`

**Appels API** :
- `POST http://localhost:3000/api/sites`
- `PUT http://localhost:3000/api/sites/:id`
- `DELETE http://localhost:3000/api/sites/:id`

---

### Phase 2 : Admin - SEO Multi-Sites

**Fichiers à modifier** :
1. `backend/src/models/Site.js`
   - Ajouter champ `pages` :
     ```javascript
     pages: [{
       value: String,
       label: String,
       order: Number
     }]
     ```

2. `admin/src/pages/SEO.jsx`
   - Remplacer `const pages = [...]` par `const pages = currentSite?.pages || []`
   - Ajouter bouton "Ajouter une page"
   - Modal pour créer une nouvelle page

3. `backend/src/controllers/sites.controller.js`
   - Ajouter route `PUT /api/sites/:id/pages`
   - Permettre d'ajouter/supprimer des pages

---

### Phase 3 : Admin - Content Multi-Sites

**Fichiers à modifier** :
1. `backend/src/models/Site.js`
   - Ajouter champ `sections` :
     ```javascript
     sections: [{
       value: String,
       label: String,
       order: Number
     }]
     ```

2. `admin/src/pages/Content.jsx`
   - Remplacer `const sections = [...]` par `const sections = currentSite?.sections || []`
   - Ajouter modal "Nouveau contenu" avec :
     - Section (dropdown)
     - Type (text, image, html, json)
     - Éditeur JSON pour `data`
     - Ordre d'affichage
     - Statut actif/inactif

3. `backend/src/controllers/sites.controller.js`
   - Ajouter route `PUT /api/sites/:id/sections`

---

### Phase 4 : Médias Multi-Sites (PRIORITAIRE)

**Fichiers à créer** :
1. `backend/src/models/Media.js`
   ```javascript
   const mediaSchema = new mongoose.Schema({
     filename: { type: String, required: true },
     originalName: { type: String, required: true },
     url: { type: String, required: true },
     siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
     mimetype: String,
     size: Number,
     uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   }, { timestamps: true });
   ```

**Fichiers à modifier** :
1. `backend/src/controllers/media.controller.js`
   - **uploadFile** :
     - Récupérer `siteId` depuis le body ou le token
     - Sauvegarder dans `/var/www/uploads/{siteSlug}/`
     - Créer entrée MongoDB avec `siteId`
   - **getFiles** :
     - Filtrer par `siteId` : `Media.find({ siteId })`
   - **deleteFile** :
     - Vérifier que le fichier appartient au site
     - Supprimer du disque ET de MongoDB

2. `backend/src/routes/media.routes.js`
   - Ajouter middleware `checkSiteAccess` avant upload
   - Modifier multer pour utiliser `req.body.siteId` ou `req.user.currentSite`

3. `admin/src/pages/Media.jsx`
   - Ajouter `siteId` dans FormData lors de l'upload
   - Filtrer les médias par `currentSite._id`

4. `admin/src/services/api.js`
   - Modifier `upload` pour envoyer `siteId` :
     ```javascript
     upload: (file, siteId) => {
       const formData = new FormData();
       formData.append('file', file);
       formData.append('siteId', siteId);
       return api.post('/media/upload', formData, { ... });
     }
     ```

---

## 📝 Modifications Backend Requises

### 1. Modèle Site (backend/src/models/Site.js)

```javascript
// Ajouter après le champ `settings`
pages: [{
  value: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 }
}],
sections: [{
  value: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 }
}],
```

### 2. Routes Sites (backend/src/routes/sites.routes.js)

```javascript
// Ajouter ces routes
router.put('/:id/pages', protect, checkSiteAccess, updateSitePages);
router.put('/:id/sections', protect, checkSiteAccess, updateSiteSections);
```

### 3. Controller Sites (backend/src/controllers/sites.controller.js)

```javascript
export const updateSitePages = async (req, res) => {
  const { id } = req.params;
  const { pages } = req.body;
  
  const site = await Site.findByIdAndUpdate(
    id,
    { pages },
    { new: true, runValidators: true }
  );
  
  res.json({ success: true, data: site });
};

export const updateSiteSections = async (req, res) => {
  const { id } = req.params;
  const { sections } = req.body;
  
  const site = await Site.findByIdAndUpdate(
    id,
    { sections },
    { new: true, runValidators: true }
  );
  
  res.json({ success: true, data: site });
};
```

---

## 🔧 Ordre d'Implémentation

### Priorité 1 (CRITIQUE) :
1. ✅ **Médias multi-sites** - Risque de conflit et perte de données
2. ✅ **Admin SEO** - Chaque site doit avoir ses propres pages
3. ✅ **Admin Content** - Chaque site doit avoir ses propres sections

### Priorité 2 (IMPORTANT) :
4. ✅ **Control Center** - Gestion des sites depuis le monitoring

---

## 🧪 Tests à Effectuer

### Après chaque modification :
- [ ] Créer un nouveau site dans Control Center
- [ ] Vérifier que le site apparaît dans Admin
- [ ] Ajouter des pages SEO spécifiques au site
- [ ] Ajouter des sections Content spécifiques au site
- [ ] Uploader un média et vérifier qu'il est lié au bon site
- [ ] Changer de site et vérifier que les médias sont filtrés
- [ ] Vérifier que les permissions fonctionnent (editor vs admin)

---

## 📊 Impact Estimé

| Modification | Fichiers | Temps | Complexité |
|--------------|----------|-------|------------|
| Control Center Sites | 2 | 2h | Moyenne |
| Admin SEO Multi-sites | 4 | 3h | Moyenne |
| Admin Content Multi-sites | 4 | 3h | Moyenne |
| Médias Multi-sites | 6 | 4h | Élevée |
| **TOTAL** | **16** | **12h** | - |

---

## ✅ Checklist Finale

- [ ] Control Center permet d'ajouter/modifier des sites
- [ ] Admin SEO utilise les pages du site actuel
- [ ] Admin Content utilise les sections du site actuel
- [ ] Médias sont filtrés par site
- [ ] Upload média crée une entrée MongoDB
- [ ] Permissions respectées pour tous les endpoints
- [ ] Documentation mise à jour
- [ ] Tests effectués sur tous les sites

---

**Prêt à commencer l'implémentation !** 🚀
