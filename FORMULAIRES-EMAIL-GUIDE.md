# 📧 Guide des Formulaires Email

## ✅ Ce qui a été implémenté

### Backend

1. **Modèle Contact** (`backend/src/models/Contact.js`)
   - Historique de tous les formulaires
   - Types : `contact` et `gift-card`
   - Statuts : `new`, `read`, `replied`, `archived`
   - Tracking des emails envoyés

2. **Service Email** (`backend/src/services/email.service.js`)
   - Nodemailer configuré
   - Templates HTML professionnels
   - Support SMTP en production
   - Ethereal pour le développement (emails de test)

3. **Contrôleur Contact** (`backend/src/controllers/contact.controller.js`)
   - `POST /api/contact/submit` - Formulaire de contact
   - `POST /api/contact/gift-card` - Formulaire bon cadeau
   - `GET /api/contact` - Liste des contacts (admin)
   - `PATCH /api/contact/:id/status` - Changer le statut
   - `DELETE /api/contact/:id` - Supprimer

4. **Rate Limiting**
   - 5 soumissions max par IP toutes les 15 minutes
   - Protection anti-spam

5. **Modèle Site mis à jour**
   - Nouveau champ `contact.formsEmail`
   - Email configurable dans l'admin

### Admin Panel

1. **Interface Settings.jsx**
   - Nouveau champ "Email pour les formulaires"
   - Description claire de l'utilisation
   - Sauvegarde avec le reste des paramètres

### Site Public

1. **Formulaire Contact** (`src/pages/Contact.jsx`)
   - ✅ Connecté à l'API
   - ✅ Affichage des erreurs
   - ✅ État de loading
   - ✅ Message de succès
   - ✅ Récupération automatique du siteId

2. **Formulaire Bons Cadeaux** (`src/pages/GiftCards.jsx`)
   - ⚠️ À FAIRE (même logique que Contact)

---

## 🚀 Déploiement

### 1. Sur le serveur - Backend

```bash
cd ~/websites/speed-l/backend

# Installer nodemailer
npm install nodemailer

# Configurer les variables d'environnement
nano .env
```

Ajouter dans `.env` :

```bash
# Email Configuration (SMTP)
# Utilisez votre service SMTP (Gmail, SendGrid, Mailgun, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_FROM="Speed-L" <noreply@speedl.ch>
```

**⚠️ Pour Gmail :**
1. Activer la validation en 2 étapes
2. Générer un "Mot de passe d'application"
3. Utiliser ce mot de passe dans `SMTP_PASS`

```bash
# Redémarrer le backend
pm2 restart swigs-api

# Vérifier les logs
pm2 logs swigs-api
```

### 2. Configurer l'email dans l'admin

1. Aller sur `https://admin.swigs.online`
2. Se connecter
3. Aller dans **Paramètres**
4. Section **Coordonnées**
5. Remplir **"Email pour les formulaires"** : `info@speed-l.ch`
6. **Sauvegarder**

### 3. Déployer le site

```bash
cd ~/websites/speed-l
git pull origin main
npm run build
sudo cp -r dist/* /var/www/speed-l/
```

### 4. Tester

1. Aller sur `https://swigs.online/contact`
2. Remplir le formulaire
3. Envoyer
4. ✅ Vérifier l'email reçu à `info@speed-l.ch`

---

## 📋 Configuration SMTP Recommandée

### Option 1 : Gmail (Gratuit, simple)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=mot-de-passe-app  # Pas votre mot de passe normal !
```

**Limites :** 500 emails/jour

### Option 2 : SendGrid (Gratuit jusqu'à 100/jour)

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
```

### Option 3 : Mailgun (Gratuit jusqu'à 5000/mois)

```bash
SMTP_HOST=smtp.eu.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre-mot-de-passe-mailgun
```

### Option 4 : Service SMTP de votre hébergeur

Contactez votre hébergeur pour les paramètres SMTP.

---

## 🧪 Test en Développement

En développement, les emails ne sont PAS vraiment envoyés.  
Ils sont capturés par **Ethereal Email** (service de test).

```bash
# Lancer le backend en dev
npm run dev

# Soumettre un formulaire
# Les logs afficheront un lien "Preview URL"
# Cliquez dessus pour voir l'email
```

---

## 📊 Gestion des Contacts (À venir)

Dans une future version, l'admin aura une page **Contacts** pour :
- ✅ Voir tous les formulaires reçus
- ✅ Marquer comme lu/répondu
- ✅ Archiver
- ✅ Supprimer
- ✅ Exporter en CSV

Routes déjà prêtes :
- `GET /api/contact` - Liste
- `PATCH /api/contact/:id/status` - Changer statut
- `DELETE /api/contact/:id` - Supprimer

---

## 🎁 Formulaire Bons Cadeaux

**À FAIRE :** Même logique que le formulaire de contact.

Fichier à modifier : `src/pages/GiftCards.jsx`

```javascript
// Ajouter les mêmes imports et logique que Contact.jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  
  const response = await fetch(`${API_URL}/contact/gift-card`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      siteId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      amount: formData.amount,
      recipientName: formData.recipientName,
      recipientEmail: formData.recipientEmail,
      deliveryDate: formData.deliveryDate,
      message: formData.message,
    }),
  })
  
  // Gérer la réponse...
}
```

---

## ✅ Checklist de Déploiement

- [ ] `npm install nodemailer` dans le backend
- [ ] Configurer SMTP dans `.env`
- [ ] Redémarrer PM2 (`pm2 restart swigs-api`)
- [ ] Configurer l'email dans l'admin
- [ ] Déployer le site (`git pull` + `npm run build`)
- [ ] Tester le formulaire de contact
- [ ] Vérifier la réception de l'email
- [ ] (Optionnel) Implémenter le formulaire bons cadeaux

---

## 🐛 Troubleshooting

### Email non reçu

1. **Vérifier les logs backend :**
   ```bash
   pm2 logs swigs-api --lines 50
   ```

2. **Vérifier la config SMTP :**
   ```bash
   cat ~/websites/speed-l/backend/.env | grep SMTP
   ```

3. **Tester la connexion SMTP :**
   ```bash
   # Dans le backend
   node -e "
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransporter({
     host: 'smtp.gmail.com',
     port: 587,
     auth: { user: 'email', pass: 'pass' }
   });
   transporter.verify().then(console.log).catch(console.error);
   "
   ```

### Erreur 400 "Email de réception non configuré"

→ Configurer `formsEmail` dans l'admin (Paramètres → Coordonnées)

### Erreur 429 "Trop de soumissions"

→ Rate limiting activé (5 soumissions/15min)  
→ Attendre ou augmenter la limite dans `contact.routes.js`

---

## 📈 Prochaines Améliorations

1. ✅ Page admin pour gérer les contacts
2. ✅ Notifications email à l'admin
3. ✅ Export CSV des contacts
4. ✅ Réponse automatique au client
5. ✅ Intégration CRM (optionnel)
6. ✅ Statistiques des formulaires

---

**Tout est prêt ! Il ne reste plus qu'à configurer le SMTP et déployer ! 🚀**
