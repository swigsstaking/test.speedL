# 📊 Intégration Google Analytics

## 🎯 Option 1 : Google Analytics 4 (Recommandé)

### 1️⃣ Créer un compte Google Analytics

1. Aller sur https://analytics.google.com/
2. Créer un compte
3. Créer une propriété pour votre site
4. Récupérer votre **ID de mesure** (format: `G-XXXXXXXXXX`)

### 2️⃣ Ajouter le script dans le site Speed-L

Modifier `/index.html` :

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Speed-L Auto-école</title>
    
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Remplacez `G-XXXXXXXXXX` par votre vrai ID !**

### 3️⃣ Rebuilder et déployer

```bash
cd ~/websites/speed-l
npm run build
sudo cp -r dist/* /var/www/speed-l/
```

### 4️⃣ Vérifier dans Google Analytics

- Aller dans **Rapports** → **Temps réel**
- Ouvrir votre site
- Vous devriez voir votre visite en temps réel !

---

## 🎯 Option 2 : Afficher les stats dans l'admin (Avancé)

Pour afficher les données Google Analytics directement dans votre admin panel, il faut utiliser l'**API Google Analytics**.

### 1️⃣ Activer l'API Google Analytics

1. Aller sur https://console.cloud.google.com/
2. Créer un projet
3. Activer "Google Analytics Data API"
4. Créer des identifiants (Service Account)
5. Télécharger le fichier JSON des credentials

### 2️⃣ Installer les dépendances backend

```bash
cd ~/websites/speed-l/backend
npm install @google-analytics/data
```

### 3️⃣ Créer un endpoint API pour les stats

Créer `backend/src/controllers/analytics.controller.js` :

```javascript
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: './google-credentials.json', // Votre fichier JSON
});

const propertyId = 'VOTRE_PROPERTY_ID'; // Format: 123456789

exports.getVisitors = async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        {
          name: 'date',
        },
      ],
      metrics: [
        {
          name: 'activeUsers',
        },
        {
          name: 'screenPageViews',
        },
      ],
    });

    const data = response.rows.map(row => ({
      date: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value),
      pageViews: parseInt(row.metricValues[1].value),
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRealTimeUsers = async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [
        {
          name: 'activeUsers',
        },
      ],
    });

    const activeUsers = parseInt(response.rows?.[0]?.metricValues?.[0]?.value || 0);

    res.json({ success: true, data: { activeUsers } });
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### 4️⃣ Créer les routes

Créer `backend/src/routes/analytics.routes.js` :

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getVisitors, getRealTimeUsers } = require('../controllers/analytics.controller');

router.get('/visitors', protect, getVisitors);
router.get('/realtime', protect, getRealTimeUsers);

module.exports = router;
```

### 5️⃣ Ajouter les routes dans server.js

```javascript
// Dans backend/server.js
const analyticsRoutes = require('./src/routes/analytics.routes');
app.use('/api/analytics', analyticsRoutes);
```

### 6️⃣ Mettre à jour l'admin pour afficher les stats

Dans `admin/src/services/api.js`, ajouter :

```javascript
export const analyticsAPI = {
  getVisitors: () => api.get('/analytics/visitors'),
  getRealTimeUsers: () => api.get('/analytics/realtime'),
};
```

Dans `admin/src/pages/Analytics.jsx`, ajouter :

```javascript
import { analyticsAPI } from '../services/api';

// Dans le composant
const { data: visitorsData } = useQuery({
  queryKey: ['analytics-visitors'],
  queryFn: analyticsAPI.getVisitors,
  refetchInterval: 60000, // Rafraîchir toutes les minutes
});

const { data: realtimeData } = useQuery({
  queryKey: ['analytics-realtime'],
  queryFn: analyticsAPI.getRealTimeUsers,
  refetchInterval: 10000, // Rafraîchir toutes les 10 secondes
});

// Afficher
<StatCard
  title="Visiteurs en temps réel"
  value={realtimeData?.data?.activeUsers || 0}
  icon={Users}
  color="green"
  subtitle="Actuellement sur le site"
/>
```

---

## 🎯 Option 3 : Solution simple avec iframe

Vous pouvez aussi simplement **intégrer Google Analytics dans une iframe** :

1. Dans Google Analytics, aller dans **Admin** → **Partage de données**
2. Créer un rapport personnalisé
3. Obtenir le lien d'intégration
4. Dans votre admin, créer une page avec une iframe :

```jsx
<iframe 
  src="VOTRE_LIEN_GOOGLE_ANALYTICS" 
  width="100%" 
  height="800px"
  frameBorder="0"
/>
```

---

## 📊 Métriques disponibles avec Google Analytics

- **Visiteurs uniques** (par jour, semaine, mois)
- **Pages vues**
- **Durée moyenne des sessions**
- **Taux de rebond**
- **Sources de trafic** (Google, direct, réseaux sociaux)
- **Appareils** (mobile, desktop, tablette)
- **Localisation géographique**
- **Pages les plus visitées**
- **Conversions** (inscriptions aux cours)

---

## ✅ Recommandation

Pour commencer, utilisez **Option 1** (simple et rapide).

Plus tard, si vous voulez des stats dans l'admin, utilisez **Option 2** (plus complexe mais plus intégré).

---

## 🔒 Sécurité

- **Ne commitez JAMAIS** le fichier `google-credentials.json` sur GitHub
- Ajoutez-le au `.gitignore`
- Stockez-le uniquement sur le serveur

---

**Besoin d'aide pour l'implémentation ? Dites-moi quelle option vous préférez !** 📊
