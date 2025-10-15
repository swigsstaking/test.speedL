# Speed-L Auto-école - Site Web

Site web moderne et dynamique pour l'auto-école Speed-L située à Sion, Valais.

## 🚗 À propos

Speed-L est une auto-école établie depuis près de 30 ans à Sion, offrant des cours de conduite de qualité avec des instructeurs expérimentés et des véhicules modernes.

## ✨ Fonctionnalités

- **Page d'accueil** : Hero attractif, présentation des avantages, témoignages
- **Cours & Inscriptions** : Présentation détaillée des cours avec dates et formulaire d'inscription
- **Permis** : Informations complètes sur les différentes catégories de permis (B, BE, moto)
- **Bons cadeaux** : Système de commande de bons cadeaux en ligne
- **Contact** : Formulaire de contact, carte Google Maps, informations pratiques
- **Design responsive** : Optimisé pour tous les appareils (mobile, tablette, desktop)

## 🛠️ Technologies utilisées

- **React 18** - Framework JavaScript moderne
- **Vite** - Build tool rapide et performant
- **TailwindCSS** - Framework CSS utility-first
- **React Router** - Navigation entre les pages
- **Lucide React** - Icônes modernes et élégantes

## 🚀 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Lancer le serveur de développement :
```bash
npm run dev
```

3. Ouvrir votre navigateur à l'adresse : `http://localhost:5173`

## 📦 Build pour la production

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `dist/`.

## 🎨 Personnalisation

### Couleurs

Les couleurs principales sont définies dans `tailwind.config.js` :
- Rouge principal (primary) : utilisé pour les CTA et éléments importants
- Gris clair : pour les backgrounds et textes secondaires

### Contenu

Pour modifier le contenu :
- **Cours** : Éditer `src/pages/Courses.jsx`
- **Permis** : Éditer `src/pages/Permits.jsx`
- **Témoignages** : Éditer `src/pages/Home.jsx`
- **Coordonnées** : Éditer `src/components/Layout.jsx` et `src/pages/Contact.jsx`

## 📱 Réseaux sociaux

Le site inclut des liens vers :
- Facebook
- Instagram
- TikTok

Mettez à jour les liens dans `src/components/Layout.jsx` et `src/pages/Contact.jsx`.

## 📍 Carte Google Maps

La carte est intégrée dans la page Contact. Pour personnaliser l'emplacement, modifiez l'URL de l'iframe dans `src/pages/Contact.jsx`.

## 📞 Contact

**Speed-L**  
Place de la Gare 11  
1950 Sion  
Valais, Suisse

📞 079 212 3500  
✉️ info@speed-l.ch

## 📄 Licence

© 2025 Speed-L. Tous droits réservés.
