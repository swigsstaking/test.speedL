# 📚 SWIGS CMS - Documentation Complète

## 🎯 Vue d'ensemble

SWIGS CMS est un système de gestion de contenu multi-sites conçu pour gérer plusieurs sites web depuis un seul panel d'administration centralisé. Le système est construit avec une architecture moderne, scalable et sécurisée.

---

## 🏗️ Architecture du Système

### Composants Principaux

```
┌─────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Sites      │  │    Admin     │  │   Backend    │     │
│  │   Publics    │  │    Panel     │  │   API        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
│                    ┌──────────────┐                        │
│                    │   MongoDB    │                        │
│                    └──────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1. **Backend API Centralisé** (`api.swigs.online`)
- **Rôle** : Cœur du système, gère toutes les données
- **Technologies** : Node.js, Express.js, MongoDB, Mongoose
- **Port** : 3000 (interne)
- **Fonctionnalités** :
  - Authentification JWT
  - Gestion des utilisateurs et permissions
  - CRUD pour tous les contenus
  - Upload de fichiers
  - Génération automatique de SEO
  - Envoi d'emails (Nodemailer)
  - CORS configuré pour tous les domaines

### 2. **Panel Admin** (`admin.swigs.online`)
- **Rôle** : Interface de gestion centralisée
- **Technologies** : React.js, TailwindCSS, React Query
- **Fonctionnalités** :
  - Sélecteur de site (multi-sites)
  - Gestion des contenus dynamiques
  - Gestion SEO par page
  - Upload et gestion de médias
  - Réception des contacts
  - Gestion des utilisateurs (admin only)
  - Paramètres du site

### 3. **Sites Publics** (ex: `speedl.swigs.online`)
- **Rôle** : Sites web publics consommant l'API
- **Technologies** : React.js, TailwindCSS, React Helmet
- **Fonctionnalités** :
  - Affichage du contenu dynamique
  - SEO optimisé (meta tags, Open Graph)
  - Formulaire de contact
  - Responsive design
  - Performance optimisée

### 4. **Base de Données** (MongoDB)
- **Rôle** : Stockage centralisé de toutes les données
- **Collections** :
  - `users` : Utilisateurs et permissions
  - `sites` : Configuration des sites
  - `courses` : Contenus dynamiques
  - `seos` : Métadonnées SEO
  - `contacts` : Messages de contact
  - `contents` : Contenus génériques

---

## 🔐 Système de Permissions

### Rôles

#### **Admin** (Vous)
- ✅ Accès total à tous les sites
- ✅ Gestion des utilisateurs
- ✅ Création/modification/suppression de tout contenu
- ✅ Accès à la section "Utilisateurs"
- ✅ Gestion des paramètres globaux

#### **Editor** (Éditeurs)
- ✅ Accès uniquement aux sites assignés
- ✅ Création/modification de contenu
- ✅ Gestion SEO
- ✅ Upload de médias
- ❌ Pas d'accès à la gestion des utilisateurs
- ❌ Pas de suppression de sites

### Middleware de Sécurité

```javascript
// Vérification d'authentification
protect → Vérifie le token JWT

// Vérification d'accès au site
checkSiteAccess → Vérifie que l'utilisateur a accès au site

// Vérification admin
requireAdmin → Réservé aux administrateurs

// Vérification de modification d'utilisateur
canModifyUser → Permet de modifier son propre profil ou (admin) tous les profils
```

---

## 📋 Fonctionnalités du Panel Admin

### 1. **Dashboard**
- Vue d'ensemble des statistiques
- Sélecteur de site
- Accès rapide aux fonctionnalités

### 2. **Contenus** (ex-Formations)
- **CRUD complet** : Créer, lire, modifier, supprimer
- **Champs** :
  - Titre, numéro, description
  - Dates (début, fin, inscription)
  - Prix, places disponibles
  - Lieu, lien externe
  - Statut (actif, complet, annulé, terminé)
  - Ordre d'affichage
- **Réorganisation** : Drag & drop pour changer l'ordre
- **Filtrage** : Par statut, recherche

### 3. **SEO**
- **Gestion par page** : Accueil, À propos, Formations, Contact
- **Champs** :
  - Meta title, description
  - Keywords
  - Open Graph (og:title, og:description, og:image)
  - Twitter Cards
  - Canonical URL
- **Génération automatique** : Fichier `seo.json` pour performance

### 4. **Médias**
- **Upload** : Images, documents
- **Gestion** : Visualisation, suppression
- **Stockage** : `/var/www/speed-l/uploads/`
- **Accès** : `https://speedl.swigs.online/uploads/filename`

### 5. **Contacts**
- **Réception** : Messages du formulaire de contact
- **Affichage** : Liste avec nom, email, message, date
- **Notification** : Email automatique à l'admin
- **Gestion** : Marquage lu/non lu, suppression

### 6. **Utilisateurs** (Admin Only)
- **CRUD utilisateurs** : Créer, modifier, supprimer
- **Assignation de sites** : Sélection multiple
- **Gestion des rôles** : Admin ou Éditeur
- **Statut** : Actif/Inactif
- **Sécurité** : Mots de passe hashés (bcrypt)

### 7. **Paramètres**
- **Informations du site** : Nom, domaine, description
- **Logo** : Upload et gestion
- **Coordonnées** : Email, téléphone, adresse
- **Réseaux sociaux** : Facebook, Instagram, LinkedIn, etc.
- **Paramètres techniques** : API keys, configurations

---

## 🚀 Scalabilité et Performance

### Architecture Multi-Sites

#### **Avantages**
1. **Un seul backend** : Maintenance simplifiée
2. **Base de données centralisée** : Cohérence des données
3. **Permissions granulaires** : Contrôle d'accès par site
4. **Déploiement indépendant** : Chaque site peut être déployé séparément
5. **Réutilisation du code** : Composants partagés

#### **Scalabilité Horizontale**
```
┌─────────────────────────────────────────────────────────┐
│  Load Balancer (Nginx)                                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Backend  │  │ Backend  │  │ Backend  │              │
│  │ Instance │  │ Instance │  │ Instance │              │
│  │    1     │  │    2     │  │    3     │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                           │
│              ┌─────────────────┐                         │
│              │  MongoDB Cluster │                         │
│              └─────────────────┘                         │
└─────────────────────────────────────────────────────────┘
```

### Optimisations Actuelles

1. **Lazy Loading** : Chargement à la demande des pages
2. **React Query** : Cache intelligent des requêtes API
3. **Compression Gzip** : Réduction de la taille des fichiers
4. **Cache Nginx** : Assets statiques en cache
5. **SEO Statique** : Fichiers `seo.json` pré-générés
6. **CDN Ready** : Structure compatible avec CloudFlare, AWS CloudFront

### Performance

- **Backend** : ~50ms par requête (moyenne)
- **Admin Panel** : Chargement initial < 2s
- **Sites Publics** : First Contentful Paint < 1.5s
- **SEO Score** : 90+ (Google Lighthouse)

---

## 🔧 Workflow de Développement

### Ajout d'un Nouveau Site

```bash
# 1. Créer le site dans l'admin
# Via l'interface : Paramètres → Nouveau site

# 2. Configurer le DNS
# Ajouter un enregistrement A : nouveau-site.swigs.online → IP

# 3. Créer la config Nginx
sudo nano /etc/nginx/sites-available/nouveau-site
# Copier la config de speedl-test.conf et adapter

# 4. Activer le site
sudo ln -s /etc/nginx/sites-available/nouveau-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 5. Générer le certificat SSL
sudo certbot --nginx -d nouveau-site.swigs.online

# 6. Déployer le frontend
cd ~/websites/nouveau-site
npm run build
sudo cp -r dist/* /var/www/nouveau-site/
```

### Workflow Git

```bash
# Développement local
git checkout -b feature/nouvelle-fonctionnalite
# ... développement ...
git add -A
git commit -m "feat: Description"
git push origin feature/nouvelle-fonctionnalite

# Merge et déploiement
git checkout main
git merge feature/nouvelle-fonctionnalite
git push origin main

# Sur le serveur
cd ~/websites/speed-l
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/speed-l/
```

---

## 💡 Mon Analyse et Recommandations

### ✅ Points Forts

1. **Architecture Solide**
   - Séparation claire des responsabilités
   - API RESTful bien structurée
   - Permissions granulaires efficaces

2. **Scalabilité**
   - Multi-sites natif
   - Base de données centralisée
   - Facilité d'ajout de nouveaux sites

3. **Sécurité**
   - JWT pour l'authentification
   - Middleware de permissions
   - CORS configuré
   - Mots de passe hashés

4. **UX/UI**
   - Interface moderne et intuitive
   - Dark mode cohérent
   - Responsive design

### 🚀 Améliorations Recommandées

#### 1. **Performance & Caching**

**Problème** : Chaque requête interroge la base de données

**Solution** : Implémenter Redis pour le cache
```javascript
// Exemple
import Redis from 'ioredis';
const redis = new Redis();

// Cache des sites
const getCachedSites = async () => {
  const cached = await redis.get('sites:all');
  if (cached) return JSON.parse(cached);
  
  const sites = await Site.find();
  await redis.setex('sites:all', 3600, JSON.stringify(sites)); // 1h
  return sites;
};
```

**Impact** : 
- ⚡ Réduction de 80% du temps de réponse
- 📉 Moins de charge sur MongoDB
- 💰 Économie de ressources serveur

---

#### 2. **Monitoring & Logs**

**Problème** : Pas de visibilité sur les erreurs en production

**Solution** : Intégrer Sentry ou Winston
```javascript
// backend/src/utils/logger.js
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Utilisation
logger.error('Erreur lors de la création du cours', { error, userId, siteId });
```

**Impact** :
- 🔍 Détection rapide des bugs
- 📊 Analyse des performances
- 🚨 Alertes en temps réel

---

#### 3. **Tests Automatisés**

**Problème** : Risque de régression lors des modifications

**Solution** : Tests unitaires et E2E
```javascript
// backend/tests/courses.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('Courses API', () => {
  it('should create a course', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Course', siteId: '...' });
    
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Test Course');
  });
});
```

**Impact** :
- ✅ Confiance lors des déploiements
- 🐛 Détection précoce des bugs
- 📝 Documentation vivante du code

---

#### 4. **CI/CD Pipeline**

**Problème** : Déploiement manuel, risque d'erreurs

**Solution** : GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: swigs
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd ~/websites/speed-l
            git pull origin main
            npm install
            npm run build
            sudo cp -r dist/* /var/www/speed-l/
            sudo systemctl reload nginx
```

**Impact** :
- 🚀 Déploiement automatique
- ⏱️ Gain de temps
- 🔒 Moins d'erreurs humaines

---

#### 5. **Backup Automatisé**

**Problème** : Pas de sauvegarde régulière de la base de données

**Solution** : Script cron de backup
```bash
#!/bin/bash
# /home/swigs/scripts/backup-mongodb.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/swigs/backups/mongodb"
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/swigs-cms" --out="$BACKUP_DIR/$DATE"

# Compression
tar -czf "$BACKUP_DIR/$DATE.tar.gz" "$BACKUP_DIR/$DATE"
rm -rf "$BACKUP_DIR/$DATE"

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# Upload vers S3 (optionnel)
# aws s3 cp "$BACKUP_DIR/$DATE.tar.gz" s3://swigs-backups/
```

**Cron** :
```bash
# Backup quotidien à 3h du matin
0 3 * * * /home/swigs/scripts/backup-mongodb.sh
```

**Impact** :
- 🛡️ Protection contre la perte de données
- 🔄 Restauration rapide en cas de problème
- 💼 Conformité RGPD

---

#### 6. **Analytics Intégré**

**Problème** : Pas de données sur l'utilisation des sites

**Solution** : Plausible Analytics (RGPD-friendly)
```html
<!-- Dans le <head> de chaque site -->
<script defer data-domain="speedl.swigs.online" src="https://plausible.io/js/script.js"></script>
```

**Alternative** : API interne
```javascript
// backend/src/routes/analytics.routes.js
router.post('/track', async (req, res) => {
  const { event, page, siteId } = req.body;
  await Analytics.create({ event, page, siteId, timestamp: new Date() });
  res.json({ success: true });
});
```

**Impact** :
- 📊 Données sur les visiteurs
- 🎯 Optimisation du contenu
- 📈 Mesure du ROI

---

#### 7. **Gestion des Versions d'API**

**Problème** : Changements API peuvent casser les anciens sites

**Solution** : Versioning
```javascript
// backend/server.js
app.use('/api/v1', routesV1);
app.use('/api/v2', routesV2);

// Redirection par défaut vers la dernière version
app.use('/api', routesV2);
```

**Impact** :
- 🔄 Rétrocompatibilité
- 🚀 Innovation sans risque
- 📦 Migration progressive

---

#### 8. **Rate Limiting Avancé**

**Problème** : Vulnérable aux attaques DDoS

**Solution** : Rate limiting par utilisateur
```javascript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const limiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max
  message: 'Trop de requêtes, réessayez plus tard',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

**Impact** :
- 🛡️ Protection contre les abus
- 💰 Économie de bande passante
- ⚡ Meilleure disponibilité

---

#### 9. **Webhooks pour Intégrations**

**Problème** : Pas de notifications externes lors d'événements

**Solution** : Système de webhooks
```javascript
// backend/src/models/Webhook.js
const webhookSchema = new mongoose.Schema({
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
  url: String,
  events: [String], // ['course.created', 'contact.received']
  active: { type: Boolean, default: true },
});

// backend/src/utils/webhooks.js
export const triggerWebhook = async (event, data) => {
  const webhooks = await Webhook.find({ events: event, active: true });
  
  for (const webhook of webhooks) {
    await axios.post(webhook.url, { event, data, timestamp: new Date() });
  }
};

// Utilisation
await triggerWebhook('contact.received', { email, message });
```

**Impact** :
- 🔗 Intégration avec Zapier, Make, etc.
- 📧 Notifications Slack/Discord
- 🤖 Automatisations avancées

---

#### 10. **Environnements Multiples**

**Problème** : Tests en production risqués

**Solution** : Environnements dev/staging/prod
```
dev.speedl.swigs.online    → Développement
staging.speedl.swigs.online → Tests
speedl.swigs.online        → Production
```

**Configuration** :
```javascript
// backend/config/env.js
export const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    dbUrl: 'mongodb://localhost:27017/swigs-cms-dev',
  },
  staging: {
    apiUrl: 'https://api-staging.swigs.online',
    dbUrl: 'mongodb://localhost:27017/swigs-cms-staging',
  },
  production: {
    apiUrl: 'https://api.swigs.online',
    dbUrl: process.env.MONGODB_URI,
  },
};
```

**Impact** :
- 🧪 Tests sans risque
- 🚀 Déploiements sereins
- 👥 Démonstrations clients

---

## 📊 Priorités d'Implémentation

### ✅ IMPLÉMENTÉ
1. **Backup automatisé** → ✅ Scripts créés, voir `INSTALLATION-BACKUP-REDIS.md`
2. **Redis Cache** → ✅ Intégré dans l'API, voir `INSTALLATION-BACKUP-REDIS.md`

### 🟡 Important (Mois 1)
3. **Monitoring/Logs** → Sentry/Winston
4. **Tests automatisés** → Qualité
5. **CI/CD** → Productivité (planifié)

### 🟢 Nice to Have (Mois 2-3)
6. **Analytics** → Insights
7. **Webhooks** → Intégrations
8. **Versioning API** → Évolutivité
9. **Environnements** → Professionnalisme
10. **Rate limiting avancé** → Sécurité

---

## 🎯 Conclusion

### Ce qui est déjà excellent ✨

Votre système est **déjà très bien conçu** :
- Architecture propre et scalable
- Sécurité solide
- UX moderne et intuitive
- Multi-sites fonctionnel

### Prochaines étapes 🚀

Les améliorations proposées ne sont **pas urgentes** mais apporteront :
- Plus de **robustesse** (backups, monitoring)
- Meilleures **performances** (cache, CDN)
- Plus de **confiance** (tests, CI/CD)
- Plus de **données** (analytics)

### Mon verdict 💯

**9/10** - Système professionnel et bien pensé. Les améliorations proposées le feront passer à **10/10** niveau entreprise.

---

## 📞 Support

Pour toute question ou amélioration :
- **Documentation** : Ce fichier
- **Code** : Commentaires dans le code
- **Architecture** : Diagrammes dans `/docs`

---

*Dernière mise à jour : Octobre 2025*
*Version : 1.0.0*
