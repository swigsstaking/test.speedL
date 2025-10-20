# 📚 SWIGS CMS - Documentation Complète

## Vue d'ensemble

SWIGS CMS est un système de gestion de contenu multi-sites conçu pour gérer plusieurs sites web depuis une seule interface d'administration. Le système utilise une architecture moderne avec API centralisée, sites statiques et admin panel React.

---

## 📖 Table des Matières

### 1. Architecture
- **[01-ARCHITECTURE.md](./01-ARCHITECTURE.md)** - Vue d'ensemble de l'architecture
  - Schéma global
  - Technologies utilisées
  - Flux de données
  - Sécurité

### 2. Backend API
- **[02-BACKEND-API.md](./02-BACKEND-API.md)** - Documentation complète de l'API
  - Routes et endpoints
  - Modèles de données
  - Authentification
  - Permissions
  - Exemples de requêtes

### 3. Admin Panel
- **[03-ADMIN-PANEL.md](./03-ADMIN-PANEL.md)** - Interface d'administration
  - Pages et fonctionnalités
  - Gestion des sites
  - Gestion des utilisateurs
  - Workflow

### 4. Site Public
- **[04-SITE-PUBLIC.md](./04-SITE-PUBLIC.md)** - Sites web publics
  - Structure
  - SEO hybride
  - Composants
  - Formulaires

### 5. Déploiement
- **[05-DEPLOIEMENT.md](./05-DEPLOIEMENT.md)** - Guide de déploiement complet
  - Configuration serveur
  - Nginx
  - SSL/Certbot
  - PM2
  - MongoDB

### 6. Multi-Domaines
- **[06-MULTI-DOMAINES.md](./06-MULTI-DOMAINES.md)** - Gestion multi-sites
  - Architecture multi-domaines
  - Environnements (test/prod)
  - Workflow nouveau site

### 7. Nouveau Site
- **[07-NOUVEAU-SITE.md](./07-NOUVEAU-SITE.md)** - Créer un nouveau site
  - Checklist complète
  - Étapes détaillées
  - Exemples de code
  - Troubleshooting

### 8. Maintenance
- **[08-MAINTENANCE.md](./08-MAINTENANCE.md)** - Maintenance et monitoring
  - Logs
  - Backup
  - Mises à jour
  - Performance

### 9. Développement
- **[09-DEVELOPPEMENT.md](./09-DEVELOPPEMENT.md)** - Guide développeur
  - Setup local
  - Conventions de code
  - Git workflow
  - Tests

### 10. FAQ & Troubleshooting
- **[10-FAQ.md](./10-FAQ.md)** - Questions fréquentes
  - Problèmes courants
  - Solutions
  - Astuces

---

## 🚀 Quick Start

### Pour Déployer un Nouveau Site

```bash
# 1. Lire la documentation
docs/07-NOUVEAU-SITE.md

# 2. Suivre la checklist
- Créer le site dans l'admin
- Configurer Nginx
- Déployer le code
- Tester
```

### Pour Comprendre l'Architecture

```bash
# Lire dans l'ordre
1. docs/01-ARCHITECTURE.md
2. docs/02-BACKEND-API.md
3. docs/03-ADMIN-PANEL.md
```

### Pour Résoudre un Problème

```bash
# Consulter
docs/10-FAQ.md
docs/08-MAINTENANCE.md
```

---

## 🎯 Concepts Clés

### Architecture Hybride
- **Sites statiques** (rapides, SEO optimal)
- **API centralisée** (une seule source de données)
- **Admin React** (interface moderne)

### Multi-Sites
- Un seul backend pour tous les sites
- Chaque site a ses propres données
- Environnements test/production séparés

### SEO Hybride
- SEO stocké en MongoDB
- Généré en JSON statique
- Sites lisent le JSON (pas d'API call)
- Rebuild automatique après modification

### Permissions
- **Admin** : Accès total
- **Editor** : Accès aux sites assignés
- Vérification à chaque requête

---

## 📊 Stack Technique

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer (emails)

### Admin
- React + Vite
- TailwindCSS
- React Query
- React Router

### Site Public
- React + Vite
- TailwindCSS
- React Helmet (SEO)
- Lazy Loading

### Infrastructure
- Nginx (reverse proxy)
- PM2 (process manager)
- Certbot (SSL)
- Ubuntu Server

---

## 🔗 Liens Utiles

- **Repo GitHub** : [swigsstaking/test.speedL](https://github.com/swigsstaking/test.speedL)
- **Admin Panel** : https://admin.swigs.online
- **API** : https://api.swigs.online
- **Site Speed-L (test)** : https://speedl.swigs.online

---

## 📝 Conventions

### Nommage
- **Sites** : `slug` en minuscules (ex: `speed-l`)
- **Domaines test** : `{slug}.swigs.online`
- **Domaines prod** : Domaine propre (ex: `speedl.ch`)

### Environnements
- **test** : Sous-domaines swigs.online
- **staging** : (optionnel)
- **production** : Domaines propres

### Rôles
- **admin** : Accès total
- **editor** : Accès limité aux sites assignés

---

## 🆘 Support

Pour toute question ou problème :
1. Consulter la FAQ : `docs/10-FAQ.md`
2. Vérifier les logs : `pm2 logs`, `nginx logs`
3. Consulter cette documentation

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Auteur** : SWIGS Team
