# 🏗️ Architecture SWIGS CMS

## Vue d'ensemble

SWIGS CMS utilise une architecture moderne séparant complètement le backend (API), l'admin (interface de gestion) et les sites publics (statiques).

---

## 📊 Schéma Global

```
┌─────────────────────────────────────────────────────────────┐
│                         INTERNET                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy)                    │
│                         Port 80/443                         │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ api.swigs    │    │ admin.swigs  │    │ speedl.swigs │
│   .online    │    │   .online    │    │   .online    │
└──────────────┘    └──────────────┘    └──────────────┘
         │                    │                    │
         ▼                    │                    │
┌──────────────┐              │                    │
│   Backend    │◄─────────────┘                    │
│   Node.js    │                                   │
│   Port 3000  │                                   │
└──────────────┘                                   │
         │                                         │
         ▼                                         │
┌──────────────┐                                   │
│   MongoDB    │                                   │
│   Port 27017 │                                   │
└──────────────┘                                   │
                                                   │
         ┌─────────────────────────────────────────┘
         │
         ▼
┌──────────────┐
│ Static Files │
│ /var/www/    │
└──────────────┘
```

---

## 🎯 Composants Principaux

### 1. Backend API (Node.js + Express)
**URL** : `api.swigs.online`  
**Port** : 3000 (interne)  
**Rôle** : API REST centralisée

**Responsabilités** :
- Authentification JWT
- CRUD des données (sites, cours, SEO, etc.)
- Gestion des utilisateurs et permissions
- Upload de médias
- Envoi d'emails (formulaires)
- Génération SEO (DB → JSON)

**Technologies** :
- Express.js (serveur)
- Mongoose (ODM MongoDB)
- JWT (authentification)
- Nodemailer (emails)
- Multer (uploads)
- Helmet (sécurité)

### 2. Admin Panel (React SPA)
**URL** : `admin.swigs.online`  
**Rôle** : Interface de gestion

**Responsabilités** :
- Gestion des sites
- Gestion des cours
- Gestion du SEO
- Gestion des médias
- Gestion des utilisateurs (admin only)
- Gestion des contacts/formulaires
- Paramètres des sites

**Technologies** :
- React + Vite
- TailwindCSS
- React Query (cache)
- React Router (navigation)
- Axios (HTTP)
- React Hot Toast (notifications)

### 3. Sites Publics (React Static)
**URLs** : 
- Test : `speedl.swigs.online`
- Prod : `speedl.ch`

**Rôle** : Sites web publics

**Responsabilités** :
- Affichage du contenu
- SEO (meta tags)
- Formulaires de contact
- Formulaires bons cadeaux
- Affichage des cours (dynamique via API)

**Technologies** :
- React + Vite
- TailwindCSS
- React Helmet (SEO)
- Lazy Loading
- Code Splitting

### 4. Base de Données (MongoDB)
**Port** : 27017 (interne)  
**Rôle** : Stockage des données

**Collections** :
- `users` - Utilisateurs
- `sites` - Sites web
- `courses` - Cours/formations
- `seo` - Données SEO
- `content` - Contenus
- `contacts` - Formulaires reçus

### 5. Nginx (Reverse Proxy)
**Port** : 80 (HTTP), 443 (HTTPS)  
**Rôle** : Serveur web et proxy

**Responsabilités** :
- SSL/TLS (HTTPS)
- Reverse proxy vers l'API
- Servir les fichiers statiques
- Compression gzip
- Cache des assets
- CORS

---

## 🔄 Flux de Données

### Flux 1 : Admin modifie du contenu

```
Admin Panel (Browser)
    │
    │ POST /api/courses (JWT)
    ▼
Nginx (admin.swigs.online)
    │
    │ Proxy
    ▼
Backend API (localhost:3000)
    │
    │ Vérification JWT
    │ Vérification permissions
    ▼
MongoDB
    │
    │ Sauvegarde
    ▼
Réponse → Admin Panel
```

### Flux 2 : Utilisateur visite le site

```
Browser
    │
    │ GET https://speedl.swigs.online
    ▼
Nginx
    │
    │ Servir fichiers statiques
    ▼
/var/www/speedl-test/index.html
    │
    │ React charge
    │ Lit seo.json (statique)
    ▼
Affichage de la page
```

### Flux 3 : Site récupère les cours (dynamique)

```
Site Public (React)
    │
    │ GET /api/courses?siteId=xxx
    ▼
Nginx
    │
    │ Proxy
    ▼
Backend API
    │
    │ Query MongoDB
    ▼
Retour JSON → Site → Affichage
```

### Flux 4 : Formulaire de contact

```
Site Public (React)
    │
    │ POST /api/contact/submit
    ▼
Nginx
    │
    │ Proxy
    ▼
Backend API
    │
    ├─→ Sauvegarde en MongoDB
    │
    └─→ Envoi email (Nodemailer)
    │
    ▼
Réponse → Site → Message succès
```

### Flux 5 : Rebuild SEO

```
Admin Panel
    │
    │ POST /api/webhook/rebuild
    ▼
Backend API
    │
    ├─→ 1. Génère seo.json depuis MongoDB
    │   └─→ src/data/seo.json
    │
    ├─→ 2. Git commit (optionnel)
    │
    ├─→ 3. npm run build
    │
    └─→ 4. Copie vers /var/www/
    │
    ▼
Site mis à jour avec nouveau SEO
```

---

## 🔒 Sécurité

### Authentification
- **JWT** (JSON Web Tokens)
- Tokens stockés dans localStorage (admin)
- Expiration : 7 jours
- Refresh automatique

### Permissions
- **Middleware** `checkSiteAccess`
- Vérification à chaque requête
- Admin : accès total
- Editor : accès limité aux sites assignés

### CORS
- Configuré dans Nginx
- Autorise uniquement :
  - `*.swigs.online`
  - Domaines de production configurés
- Credentials autorisés

### Rate Limiting
- 100 requêtes/minute par IP (API globale)
- 5 soumissions/15min (formulaires)
- Protection anti-spam

### Headers de Sécurité
- Helmet.js (backend)
- CSP, X-Frame-Options, etc.
- HTTPS obligatoire (production)

---

## 📁 Structure des Dossiers

### Serveur

```
/home/swigs/
└── websites/
    └── speed-l/              # Repo Git
        ├── backend/          # API Node.js
        ├── admin/            # Admin React
        ├── src/              # Site public React
        ├── nginx-configs/    # Configs Nginx
        └── docs/             # Documentation

/var/www/
├── admin/                    # Admin buildé
├── speedl-test/              # Site test buildé
├── speedl-prod/              # Site prod buildé
└── speed-l/
    └── uploads/              # Médias uploadés
```

### Backend

```
backend/
├── src/
│   ├── controllers/          # Logique métier
│   ├── models/               # Schémas MongoDB
│   ├── routes/               # Routes Express
│   ├── middleware/           # Auth, permissions
│   ├── services/             # Email, etc.
│   ├── scripts/              # Scripts utilitaires
│   └── utils/                # Helpers
├── server.js                 # Point d'entrée
├── package.json
└── .env                      # Variables d'environnement
```

### Admin

```
admin/
├── src/
│   ├── components/           # Composants React
│   ├── pages/                # Pages
│   ├── context/              # Context API
│   ├── services/             # API calls
│   └── App.jsx
├── package.json
└── vite.config.js
```

### Site Public

```
src/
├── components/               # Composants
├── pages/                    # Pages
├── hooks/                    # Custom hooks
├── data/                     # Données statiques
│   └── seo.json              # SEO généré
├── App.jsx
└── main.jsx
```

---

## 🌐 Environnements

### Test (Sous-domaines)
- **API** : `api.swigs.online`
- **Admin** : `admin.swigs.online`
- **Sites** : `{slug}.swigs.online`
- **But** : Développement et tests

### Production (Domaines propres)
- **API** : `api.swigs.online` (partagée)
- **Admin** : `admin.swigs.online` (partagé)
- **Sites** : Domaine propre (ex: `speedl.ch`)
- **But** : Sites clients en production

---

## 🔄 Workflow Général

### 1. Développement
```bash
# Local
npm run dev (backend)
npm run dev (admin)
npm run dev (site)
```

### 2. Build
```bash
npm run build (admin)
npm run build (site)
```

### 3. Déploiement
```bash
git push origin main
# Sur le serveur
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/xxx/
pm2 restart swigs-api
```

### 4. Modification SEO
```
Admin → SEO → Modifier → Sauvegarder
Admin → Rebuild → Déclencher
Attendre 1-2 min
Site mis à jour
```

---

## 📊 Performance

### Sites Statiques
- **Temps de chargement** : < 1s
- **SEO** : Optimal (statique)
- **Cache** : 1 an (assets)

### API
- **Réponse moyenne** : < 100ms
- **Rate limiting** : 100 req/min
- **Compression** : gzip activé

### Base de Données
- **Index** : Sur tous les champs de recherche
- **Connexion** : Pool de connexions
- **Backup** : Quotidien (recommandé)

---

## 🎯 Avantages de cette Architecture

✅ **Scalabilité** : Facile d'ajouter de nouveaux sites  
✅ **Performance** : Sites statiques ultra-rapides  
✅ **SEO** : Optimal (contenu statique)  
✅ **Maintenance** : Un seul backend à maintenir  
✅ **Sécurité** : API centralisée, permissions granulaires  
✅ **Flexibilité** : Chaque site peut avoir son propre design  
✅ **Multi-environnements** : Test et production séparés  

---

**Prochaine étape** : [02-BACKEND-API.md](./02-BACKEND-API.md)
