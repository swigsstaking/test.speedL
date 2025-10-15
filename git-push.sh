#!/bin/bash

# Script de push rapide vers GitHub
# Usage: ./git-push.sh "Votre message de commit"

if [ -z "$1" ]; then
    echo "❌ Erreur: Veuillez fournir un message de commit"
    echo "Usage: ./git-push.sh \"Votre message\""
    exit 1
fi

echo "📦 Ajout des fichiers modifiés..."
git add .

echo "💾 Commit des changements..."
git commit -m "$1"

echo "🚀 Push vers GitHub..."
git push origin main

echo "✅ Mise à jour terminée !"
