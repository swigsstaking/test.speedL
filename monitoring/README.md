# 🚀 SWIGS Control Center

Dashboard de monitoring multi-serveurs avec design clair et futuriste.

## 📋 Fonctionnalités

### ✅ Phase 1 - MVP (Implémenté)
- **Dashboard** : Vue d'ensemble temps réel
- **Serveurs** : Monitoring détaillé (CPU, RAM, Disque, Réseau)
- **Sites** : Uptime, latence, SSL, erreurs
- **Analytics** : Coûts par site, répartition ressources

### 🎨 Design
- Mode clair futuriste
- Animations fluides (Framer Motion)
- Graphiques interactifs (Recharts)
- Responsive

## 🚀 Installation

```bash
cd monitoring
npm install
npm run dev
```

Accès : http://localhost:5175

## 📦 Stack Technique

- **Frontend** : React 18 + Vite
- **UI** : TailwindCSS
- **Charts** : Recharts
- **Animations** : Framer Motion
- **Icons** : Lucide React
- **Data** : React Query

## 🔜 Prochaines Étapes

### Phase 2 - Backend & Agent
1. Backend API (Node.js + Express)
2. Agent serveur (collecte métriques)
3. WebSocket temps réel
4. MongoDB (historique)

### Phase 3 - Avancé
5. Système d'alertes
6. Export rapports PDF
7. Multi-utilisateurs
8. Prédictions ML

## 📊 Structure

```
monitoring/
├── src/
│   ├── components/
│   │   └── Layout.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Servers.jsx
│   │   ├── Sites.jsx
│   │   └── Analytics.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
```

## 🎯 Données

Actuellement en mode démo avec données mockées.
À connecter avec l'API backend pour données réelles.

---

*SWIGS Control Center v1.0.0*
