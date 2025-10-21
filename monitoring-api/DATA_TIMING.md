# ⏱️ Timing et Conservation des Données

## 📊 Fréquence de Collecte

### 1. Latence (Ping HTTP)
- **Fréquence** : Toutes les **30 secondes**
- **Source** : Vérification HTTP directe par l'API
- **Méthode** : `GET /api/sites` (automatique)
- **Stockage** : ✅ MongoDB (SiteMetric)
- **Conservation** : **90 jours** (TTL automatique)
- **Refresh Frontend** : 30 secondes

### 2. Uptime (Disponibilité)
- **Fréquence** : Calculé en temps réel depuis l'historique
- **Source** : Collection SiteMetric dans MongoDB
- **Méthode** : Calcul du ratio online/offline
- **Stockage** : ✅ Via SiteMetric
- **Conservation** : **90 jours**
- **Refresh Frontend** : 60 secondes

### 3. Requêtes & Erreurs (Logs Nginx)
- **Fréquence** : **Temps réel** (logs Nginx)
- **Source** : Parse de `/var/log/nginx/access.log`
- **Méthode** : Lecture incrémentale des logs
- **Stockage** : ❌ Non (lu directement depuis logs)
- **Conservation** : Selon config Nginx (généralement **7-30 jours**)
- **Refresh Frontend** : 60 secondes

### 4. PageSpeed (Performance Réelle)
- **Fréquence** : **Manuel** (bouton "Mesurer")
- **Cache** : **24 heures** (réutilise mesure récente)
- **Source** : Google PageSpeed Insights API
- **Méthode** : `POST /api/sites/:id/pagespeed`
- **Stockage** : ✅ MongoDB (PageSpeedMetric)
- **Conservation** : **90 jours**
- **Refresh Frontend** : 5 minutes (si données existent)

### 5. Métriques Serveur (CPU, RAM, Disk)
- **Fréquence** : Toutes les **10 secondes**
- **Source** : Agent monitoring sur serveur
- **Méthode** : `POST /api/metrics` (agent)
- **Stockage** : ✅ MongoDB (ServerMetric)
- **Conservation** : **90 jours**
- **Refresh Frontend** : 30 secondes

### 6. SSL Certificate
- **Fréquence** : Toutes les **30 secondes**
- **Source** : Vérification HTTPS directe
- **Méthode** : `GET /api/sites` (automatique)
- **Stockage** : ❌ Non (calculé à la volée)
- **Conservation** : N/A
- **Refresh Frontend** : 30 secondes

## 🗄️ Conservation MongoDB

### Collections et TTL

| Collection | Données | TTL | Index |
|------------|---------|-----|-------|
| `SiteMetric` | Latence, Status | 90 jours | `siteId`, `timestamp` |
| `ServerMetric` | CPU, RAM, Disk | 90 jours | `serverId`, `timestamp` |
| `PageSpeedMetric` | Performance | 90 jours | `siteId`, `strategy`, `timestamp` |

### Suppression Automatique
- **Mécanisme** : TTL Index MongoDB
- **Délai** : 90 jours après `timestamp`
- **Automatique** : Oui, géré par MongoDB
- **Configuration** : `expireAfterSeconds: 7776000` (90 jours)

## 🔄 Refresh Frontend

### Pages et Intervalles

| Page | Données | Intervalle |
|------|---------|------------|
| Dashboard | Latence, Status | 30s |
| Dashboard | Stats Nginx | 60s |
| Sites | Latence, Status | 30s |
| Sites | Stats Nginx | 60s |
| SiteDetail | Latence, Status | 30s |
| SiteDetail | Stats Nginx | 60s |
| SiteDetail | PageSpeed | 5min |
| Servers | Métriques | 30s |
| ServerDetail | Métriques | 30s |
| ServerDetail | Historique | 60s |

## 📈 Historique et Graphiques

### Périodes Disponibles
- **1h** : 60 points max (1 par minute)
- **24h** : 200 points max (~7 minutes entre points)
- **7j** : 200 points max (~50 minutes entre points)
- **30j** : 200 points max (~3.6 heures entre points)

### Limite de Points
- **Maximum** : 200 points par graphique
- **Raison** : Performance frontend
- **Optimisation** : MongoDB limite avec `.limit(200)`

## ⚡ Performance

### Optimisations Implémentées

1. **Cache PageSpeed** : 24h pour éviter quota API
2. **Lecture incrémentale** : Logs Nginx lus ligne par ligne
3. **Index MongoDB** : Requêtes optimisées
4. **Limite points** : 200 max par graphique
5. **TTL automatique** : Pas de nettoyage manuel

### Consommation Ressources

| Service | CPU | RAM | Disk |
|---------|-----|-----|------|
| Parse Logs Nginx | Faible | Faible | Lecture seule |
| MongoDB Queries | Faible | Moyenne | Lecture/Écriture |
| PageSpeed API | N/A | N/A | Externe |
| Agent Monitoring | Très faible | Très faible | Écriture |

## 🚀 Recommandations

### Pour Production

1. **Logs Nginx** : Configurer rotation (logrotate)
   ```bash
   # /etc/logrotate.d/nginx
   /var/log/nginx/*.log {
       daily
       rotate 30
       compress
       delaycompress
   }
   ```

2. **MongoDB** : Vérifier espace disque
   ```bash
   # Taille collections
   db.stats()
   db.SiteMetric.stats()
   ```

3. **PageSpeed** : Utiliser clé API (25k req/jour)
   ```bash
   # .env
   GOOGLE_PAGESPEED_API_KEY=votre_clé
   ```

4. **Monitoring** : Surveiller performances
   ```bash
   pm2 monit
   ```

## 📝 Notes Importantes

- **Logs Nginx** : Nécessite accès lecture `/var/log/nginx/access.log`
- **MongoDB** : Espace disque ~1-2 GB pour 90 jours
- **PageSpeed** : Cache 24h obligatoire sans clé API
- **Agent** : Doit tourner en continu sur serveurs
- **TTL** : Suppression automatique après 90 jours
