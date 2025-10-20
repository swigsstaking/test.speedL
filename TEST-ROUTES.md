# ✅ Test des Routes API

## Routes Publiques (sans auth)

### Auth
- ✅ `POST /api/auth/register` - Inscription
- ✅ `POST /api/auth/login` - Connexion
- ✅ `GET /api/auth/me` - Profil (avec token)

### Sites
- ✅ `GET /api/sites` - Liste des sites (avec cache)
- ✅ `GET /api/sites/:id` - Détail site (avec cache)

### Courses (Contenus)
- ✅ `GET /api/courses?siteId=xxx` - Liste cours (avec cache)
- ✅ `GET /api/courses/:id` - Détail cours (avec cache)

### SEO
- ✅ `GET /api/seo?siteId=xxx&page=xxx` - SEO par page

### Content
- ✅ `GET /api/content?siteId=xxx` - Contenus
- ✅ `GET /api/content/:id` - Détail contenu

### Contact
- ✅ `POST /api/contact` - Envoyer message
- ✅ `GET /api/contact?siteId=xxx` - Liste contacts (protégé)

### Health
- ✅ `GET /api/health` - Santé de l'API

---

## Routes Protégées (avec auth)

### Users (Admin only)
- ✅ `GET /api/users` - Liste utilisateurs
- ✅ `POST /api/users` - Créer utilisateur
- ✅ `GET /api/users/:id` - Détail utilisateur
- ✅ `PUT /api/users/:id` - Modifier utilisateur
- ✅ `PUT /api/users/:id/password` - Changer mot de passe
- ✅ `DELETE /api/users/:id` - Supprimer utilisateur
- ✅ `PUT /api/users/:id/sites` - Assigner sites

### Sites (Admin only pour POST/PUT/DELETE)
- ✅ `POST /api/sites` - Créer site
- ✅ `PUT /api/sites/:id` - Modifier site
- ✅ `DELETE /api/sites/:id` - Supprimer site

### Courses (avec checkSiteAccess)
- ✅ `POST /api/courses` - Créer cours
- ✅ `PUT /api/courses/:id` - Modifier cours
- ✅ `PUT /api/courses/reorder` - Réorganiser
- ✅ `DELETE /api/courses/:id` - Supprimer cours

### SEO (avec checkSiteAccess)
- ✅ `POST /api/seo` - Créer/Modifier SEO
- ✅ `DELETE /api/seo/:id` - Supprimer SEO

### Content (avec checkSiteAccess)
- ✅ `POST /api/content` - Créer contenu
- ✅ `PUT /api/content/:id` - Modifier contenu
- ✅ `DELETE /api/content/:id` - Supprimer contenu

### Media (protégé)
- ✅ `POST /api/media/upload` - Upload fichier
- ✅ `GET /api/media` - Liste médias
- ✅ `DELETE /api/media/:filename` - Supprimer média

### Webhook (protégé)
- ✅ `POST /api/webhook` - Recevoir webhook

---

## Middleware

### Auth
- ✅ `protect` - Vérifie JWT token
- ✅ `authorize('admin')` - Vérifie rôle admin

### Permissions
- ✅ `checkSiteAccess` - Vérifie accès au site
- ✅ `requireAdmin` - Admin uniquement
- ✅ `canModifyUser` - Peut modifier utilisateur
- ✅ `filterSitesByPermissions` - Filtre sites par permissions

### Cache
- ✅ `cacheMiddleware(prefix, ttl)` - Cache Redis
- ✅ `invalidateCache(pattern)` - Invalide cache

---

## Cohérence Vérifiée

✅ **Toutes les routes sont définies**
✅ **Middleware de permissions appliqué**
✅ **Cache Redis intégré**
✅ **Invalidation cache sur modifications**
✅ **CORS configuré**
✅ **Rate limiting actif**
✅ **Error handling en place**

---

## Test Manuel

```bash
# Health check
curl https://speedl.swigs.online/api/health

# Login
curl -X POST https://speedl.swigs.online/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@swigs.online","password":"Admin123!"}'

# Sites (avec cache)
curl https://speedl.swigs.online/api/sites

# Courses
curl https://speedl.swigs.online/api/courses?siteId=SITE_ID
```

---

**Statut : ✅ TOUTES LES ROUTES FONCTIONNELLES**
