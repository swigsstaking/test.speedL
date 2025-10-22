#!/bin/bash

# Script de configuration des permissions pour le déploiement automatique
# À exécuter UNE SEULE FOIS sur le serveur

echo "🔧 Configuration des permissions de déploiement..."

# 1. Ajouter l'utilisateur au groupe www-data
echo "📝 Ajout de l'utilisateur au groupe www-data..."
sudo usermod -a -G www-data $USER

# 2. Changer le propriétaire du dossier de déploiement
echo "📝 Configuration propriétaire /var/www/speed-l..."
sudo chown -R $USER:www-data /var/www/speed-l

# 3. Permissions correctes
echo "📝 Configuration permissions..."
sudo chmod -R 775 /var/www/speed-l

# 4. Configurer Git
echo "📝 Configuration Git..."
git config --global user.email "admin@swigs.online"
git config --global user.name "SWIGS Auto Deploy"

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "⚠️  IMPORTANT: Déconnectez-vous et reconnectez-vous pour que les changements de groupe prennent effet :"
echo "   exit"
echo "   ssh swigs@votre-serveur"
echo ""
echo "Ensuite, testez avec :"
echo "   touch /var/www/speed-l/test.txt"
echo "   rm /var/www/speed-l/test.txt"
echo ""
