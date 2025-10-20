# 📊 Comment récupérer les vraies données

## Données actuellement mockées

### 1. Uptime (Disponibilité)
**Actuellement** : Fixé à 99.9%

**Pour avoir les vraies données** :
- Créer une collection MongoDB `SiteMetrics` pour stocker l'historique
- Enregistrer chaque vérification (online/offline) avec timestamp
- Calculer l'uptime : `(temps online / temps total) * 100`

```javascript
// Modèle MongoDB
const SiteMetricSchema = new mongoose.Schema({
  siteId: String,
  status: String, // 'online' ou 'offline'
  latency: Number,
  timestamp: { type: Date, default: Date.now, index: true }
});

// Calculer uptime
async function calculateUptime(siteId, period = '30d') {
  const startDate = getStartDate(period);
  const metrics = await SiteMetric.find({
    siteId,
    timestamp: { $gte: startDate }
  });
  
  const onlineCount = metrics.filter(m => m.status === 'online').length;
  return (onlineCount / metrics.length) * 100;
}
```

### 2. Requêtes / 24h
**Actuellement** : Fixé à 125k

**Pour avoir les vraies données** :
- Option 1 : Intégrer avec vos logs Nginx/Apache
- Option 2 : Utiliser Google Analytics API
- Option 3 : Créer un middleware qui compte les requêtes

```bash
# Exemple avec logs Nginx
awk '$9 ~ /^2/ {print $1}' /var/log/nginx/access.log | wc -l
```

### 3. Erreurs / 24h
**Actuellement** : 12 si online, 1250 si offline

**Pour avoir les vraies données** :
- Parser les logs d'erreur (status 4xx, 5xx)
- Intégrer avec un service de monitoring (Sentry, etc.)

```bash
# Exemple avec logs Nginx (erreurs 4xx et 5xx)
awk '$9 ~ /^[45]/ {print $1}' /var/log/nginx/access.log | wc -l
```

### 4. Graphiques historiques
**Actuellement** : Données générées aléatoirement

**Pour avoir les vraies données** :
- Stocker chaque vérification dans MongoDB
- Créer une route API pour récupérer l'historique

```javascript
// Route API
app.get('/api/sites/:siteId/history', async (req, res) => {
  const { siteId } = req.params;
  const { period = '24h' } = req.query;
  
  const startDate = getStartDate(period);
  const metrics = await SiteMetric.find({
    siteId,
    timestamp: { $gte: startDate }
  }).sort({ timestamp: 1 });
  
  res.json({ success: true, data: metrics });
});
```

## 🚀 Implémentation recommandée

### Étape 1 : Créer le modèle SiteMetric
```javascript
// monitoring-api/models/SiteMetric.js
const SiteMetricSchema = new mongoose.Schema({
  siteId: { type: String, required: true, index: true },
  status: String,
  latency: Number,
  statusCode: Number,
  timestamp: { type: Date, default: Date.now, index: true }
});

// TTL Index : Supprimer automatiquement après 90 jours
SiteMetricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('SiteMetric', SiteMetricSchema);
```

### Étape 2 : Enregistrer chaque vérification
```javascript
// Dans server.js, après la vérification uptime
const siteMetric = new SiteMetric({
  siteId: site.slug,
  status: uptimeCheck.status,
  latency: uptimeCheck.latency,
  statusCode: uptimeCheck.statusCode
});
await siteMetric.save();
```

### Étape 3 : Créer les routes d'historique
```javascript
// Historique latence/uptime
app.get('/api/sites/:siteId/history', async (req, res) => {
  const { siteId } = req.params;
  const { period = '24h' } = req.query;
  
  const startDate = getStartDate(period);
  const metrics = await SiteMetric.find({
    siteId,
    timestamp: { $gte: startDate }
  }).sort({ timestamp: 1 });
  
  res.json({ success: true, data: metrics });
});

// Calculer uptime
app.get('/api/sites/:siteId/uptime', async (req, res) => {
  const { siteId } = req.params;
  const { period = '30d' } = req.query;
  
  const startDate = getStartDate(period);
  const metrics = await SiteMetric.find({
    siteId,
    timestamp: { $gte: startDate }
  });
  
  const onlineCount = metrics.filter(m => m.status === 'online').length;
  const uptime = (onlineCount / metrics.length) * 100;
  
  res.json({ success: true, uptime });
});
```

### Étape 4 : Intégrer dans le frontend
```javascript
// Dans SiteDetail.jsx
const { data: historyData } = useQuery({
  queryKey: ['site-history', siteId, period],
  queryFn: () => monitoringApi.getSiteHistory(siteId, period),
  refetchInterval: 60000
});

// Utiliser les vraies données au lieu des mockées
const chartData = historyData?.data || [];
```

## 📈 Logs Nginx pour requêtes/erreurs

### Parser les logs en temps réel
```javascript
import { exec } from 'child_process';

async function getNginxStats(domain) {
  return new Promise((resolve) => {
    const logFile = `/var/log/nginx/${domain}.access.log`;
    
    // Requêtes dernières 24h
    exec(`awk '$9 ~ /^2/ {print $1}' ${logFile} | wc -l`, (err, stdout) => {
      const requests = parseInt(stdout) || 0;
      
      // Erreurs dernières 24h
      exec(`awk '$9 ~ /^[45]/ {print $1}' ${logFile} | wc -l`, (err2, stdout2) => {
        const errors = parseInt(stdout2) || 0;
        
        resolve({ requests, errors });
      });
    });
  });
}
```

## 🎯 Résumé

| Donnée | Actuellement | Pour avoir les vraies données |
|--------|--------------|-------------------------------|
| **Uptime** | Fixé 99.9% | Stocker historique + calculer |
| **Requêtes** | Fixé 125k | Parser logs Nginx ou Analytics |
| **Erreurs** | Fixé 12/1250 | Parser logs erreurs |
| **Graphiques** | Random | Stocker métriques + API historique |

**Priorité** : Commencer par stocker les métriques dans MongoDB, le reste viendra naturellement.
