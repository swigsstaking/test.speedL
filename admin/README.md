# SWIGS CMS - Interface Admin

Interface d'administration moderne pour le système de gestion de contenu multi-sites SWIGS.

## 🎨 Fonctionnalités

- ✅ Authentification sécurisée (JWT)
- ✅ Gestion multi-sites
- ✅ Gestion des cours (CRUD complet)
- ✅ Optimisation SEO par page
- ✅ Interface moderne et responsive
- ✅ Design sombre avec logo SWIGS
- ✅ Notifications toast
- ✅ Gestion d'état avec React Query

## 🚀 Installation

### Prérequis

- Node.js 18+
- Backend API en cours d'exécution (port 3000)

### Configuration

1. Installer les dépendances :
```bash
cd admin
npm install
```

2. Créer le fichier `.env` :
```bash
cp .env.example .env
```

3. Modifier `.env` si nécessaire :
```env
VITE_API_URL=http://localhost:3000/api
```

## 🏃 Démarrage

### Mode développement
```bash
npm run dev
```

L'interface admin sera accessible sur `http://localhost:5174`

### Build pour production
```bash
npm run build
```

Les fichiers seront générés dans le dossier `dist/`.

## 🔐 Connexion

**Identifiants par défaut :**
- Email : `admin@swigs.online`
- Mot de passe : `Admin123!`

⚠️ **Important** : Changez ces identifiants après la première connexion !

## 📱 Pages disponibles

### Dashboard
- Vue d'ensemble des statistiques
- Cours actifs
- Actions rapides

### Gestion des cours
- Liste des cours
- Ajouter/Modifier/Supprimer des cours
- Gestion des dates et horaires
- Statuts (actif, complet, annulé, terminé)

### SEO
- Optimisation par page
- Titre et description
- Mots-clés
- Open Graph (réseaux sociaux)
- Aperçu Google

### Contenu (à venir)
- Gestion des textes
- Témoignages
- Sections personnalisées

### Médias (à venir)
- Upload d'images
- Galerie de médias
- Gestion des fichiers

## 🎨 Design

- **Couleurs** : Thème sombre avec accents rouge (#dc2626)
- **Logo** : SWIGS avec croix rouge
- **Police** : System fonts (optimisé)
- **Framework** : TailwindCSS

## 🛠️ Technologies

- **React 18** - Framework UI
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **React Query** - Gestion des données
- **React Hook Form** - Formulaires
- **Axios** - Requêtes HTTP
- **React Hot Toast** - Notifications
- **Lucide React** - Icônes

## 📁 Structure

```
admin/
├── src/
│   ├── components/      # Composants réutilisables
│   │   ├── Logo.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Layout.jsx
│   │   └── ...
│   ├── context/         # Contexts React
│   │   ├── AuthContext.jsx
│   │   └── SiteContext.jsx
│   ├── pages/           # Pages de l'application
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Courses.jsx
│   │   ├── SEO.jsx
│   │   └── ...
│   ├── services/        # Services API
│   │   └── api.js
│   ├── App.jsx          # Composant principal
│   ├── main.jsx         # Point d'entrée
│   └── index.css        # Styles globaux
├── public/
├── index.html
├── package.json
└── vite.config.js
```

## 🔒 Sécurité

- Authentification JWT
- Routes protégées
- Tokens stockés en localStorage
- Déconnexion automatique si token invalide
- Validation des formulaires

## 🚀 Déploiement

### Sur votre serveur Ubuntu

1. Builder l'application :
```bash
npm run build
```

2. Copier le dossier `dist/` sur votre serveur :
```bash
rsync -avz dist/ user@server:/var/www/admin-swigs/
```

3. Configurer Nginx :
```nginx
server {
    listen 80;
    server_name admin.swigs.online;

    root /var/www/admin-swigs;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Ajouter HTTPS :
```bash
sudo certbot --nginx -d admin.swigs.online
```

## 📝 Notes

- L'admin communique avec l'API backend sur le port 3000
- Les requêtes API sont automatiquement préfixées avec `/api`
- Le proxy Vite redirige `/api` vers `http://localhost:3000/api` en développement
- En production, configurez Nginx pour proxy les requêtes `/api`

## 🆘 Support

Pour toute question ou problème, consultez la documentation du backend ou contactez l'équipe SWIGS.
