# 📊 SWIGS Monitoring - Collecteur Serveur

Collecteur de métriques pour envoyer les données du serveur au dashboard de monitoring.

## 🚀 Installation Automatique

**Sur le nouveau serveur**, exécutez simplement :

```bash
curl -fsSL https://raw.githubusercontent.com/swigsstaking/test.speedL/main/install-server.sh | sudo bash
```

Le script va :
1. ✅ Installer toutes les dépendances (Node.js, PM2, Nginx, etc.)
2. ✅ Cloner le repository
3. ✅ Configurer le collecteur
4. ✅ Démarrer le service automatiquement
5. ✅ Envoyer les métriques toutes les minutes

## 📋 Installation Manuelle

Si vous préférez installer manuellement :

### 1. Prérequis

```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# PM2
sudo npm install -g pm2
```

### 2. Configuration

Créez `config.json` :

```json
{
  "serverId": "server-2",
  "apiUrl": "https://monitoring.swigs.online",
  "collectInterval": 60000,
  "hostname": "mon-serveur",
  "location": "Suisse"
}
```

### 3. Installation

```bash
npm install
```

### 4. Démarrage

```bash
# Développement
npm start

# Production avec PM2
pm2 start collector.js --name "swigs-collector-server-2"
pm2 save
pm2 startup
```

## 📊 Métriques Collectées

- **CPU**: Usage, cores, load average
- **RAM**: Total, utilisé, libre, pourcentage
- **Disque**: Espace total, utilisé, disponible
- **Réseau**: Interfaces, adresses IP
- **Processus**: Top 5 processus par mémoire
- **Uptime**: Temps de fonctionnement

## 🔧 Configuration

### Variables d'environnement

```bash
SERVER_ID=server-2
API_URL=https://monitoring.swigs.online
COLLECT_INTERVAL=60000
LOCATION=Suisse
```

### Fichier config.json

```json
{
  "serverId": "server-2",
  "apiUrl": "https://monitoring.swigs.online",
  "collectInterval": 60000,
  "hostname": "mon-serveur",
  "location": "Suisse"
}
```

## 📝 Logs

```bash
# Voir les logs en temps réel
pm2 logs swigs-collector-server-2

# Voir les logs des dernières 24h
pm2 logs swigs-collector-server-2 --lines 1000

# Redémarrer
pm2 restart swigs-collector-server-2
```

## 🛠️ Dépannage

### Le collecteur ne démarre pas

```bash
# Vérifier les logs
pm2 logs swigs-collector-server-2

# Vérifier la configuration
cat config.json

# Tester manuellement
node collector.js
```

### Les métriques n'arrivent pas

```bash
# Vérifier la connexion à l'API
curl https://monitoring.swigs.online/api/health

# Vérifier le firewall
sudo ufw status

# Autoriser les connexions sortantes HTTPS
sudo ufw allow out 443/tcp
```

### Erreur de permissions

```bash
# Donner les droits d'exécution
chmod +x collector.js

# Exécuter avec sudo si nécessaire
sudo pm2 start collector.js --name "swigs-collector-server-2"
```

## 🔄 Mise à jour

```bash
cd /opt/swigs-monitoring
git pull
cd server-collector
pm2 restart swigs-collector-server-2
```

## 📚 API

Le collecteur envoie les données à :

```
POST /api/servers/{serverId}/metrics
```

Format :

```json
{
  "serverId": "server-2",
  "hostname": "mon-serveur",
  "location": "Suisse",
  "timestamp": "2025-10-22T06:00:00.000Z",
  "uptime": 86400,
  "metrics": {
    "cpu": { "usage": 25.5, "cores": 4 },
    "ram": { "total": 8589934592, "used": 4294967296, "percent": 50 },
    "disk": [{ "mount": "/", "total": 107374182400, "used": 53687091200, "percent": 50 }],
    "network": [{ "interface": "eth0", "address": "192.168.1.100" }],
    "processes": [{ "user": "www-data", "cpu": 5.2, "mem": 2.1, "command": "nginx" }]
  }
}
```

## 🎯 Prochaines Étapes

Après installation :

1. Vérifier que le collecteur tourne : `pm2 list`
2. Vérifier les logs : `pm2 logs swigs-collector-server-2`
3. Aller sur https://monitoring.swigs.online
4. Ajouter le coût mensuel du serveur
5. Attribuer vos sites à ce serveur

## 📞 Support

En cas de problème, vérifiez :
- Les logs PM2
- La connexion réseau
- La configuration
- Les permissions

---

**SWIGS Monitoring** - Surveillance serveur en temps réel 🚀
