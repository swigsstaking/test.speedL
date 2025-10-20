import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5175',
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5175',
  credentials: true
}));
app.use(express.json());

// MongoDB Models
const ServerSchema = new mongoose.Schema({
  serverId: { type: String, required: true, unique: true },
  name: String,
  ip: String,
  location: String,
  status: { type: String, default: 'online' },
  lastSeen: { type: Date, default: Date.now }
});

const MetricSchema = new mongoose.Schema({
  serverId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  cpu: {
    usage: Number,
    cores: Number,
    loadAvg: [Number]
  },
  ram: {
    total: Number,
    used: Number,
    free: Number,
    percent: Number
  },
  disk: [{
    mount: String,
    total: Number,
    used: Number,
    percent: Number
  }],
  network: {
    rx: Number,
    tx: Number
  }
});

// TTL Index: Supprime automatiquement les métriques > 30 jours
MetricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

const Server = mongoose.model('Server', ServerSchema);
const Metric = mongoose.model('Metric', MetricSchema);

// Store connected agents
const connectedAgents = new Map();

// Socket.IO pour temps réel
io.on('connection', (socket) => {
  console.log('✅ Client connecté:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client déconnecté:', socket.id);
  });
});

// Routes API

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SWIGS Monitoring API',
    timestamp: new Date().toISOString()
  });
});

// Recevoir métriques des agents
app.post('/api/metrics', async (req, res) => {
  try {
    const { serverId, ...metricData } = req.body;

    // Sauvegarder métrique
    const metric = new Metric({
      serverId,
      ...metricData
    });
    await metric.save();

    // Mettre à jour serveur
    await Server.findOneAndUpdate(
      { serverId },
      { 
        serverId,
        lastSeen: new Date(),
        status: 'online'
      },
      { upsert: true, new: true }
    );

    // Broadcast en temps réel via WebSocket
    io.emit('metric-update', { serverId, ...metricData });

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur sauvegarde métrique:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Liste des serveurs
app.get('/api/servers', async (req, res) => {
  try {
    const servers = await Server.find();
    
    // Récupérer dernières métriques pour chaque serveur
    const serversWithMetrics = await Promise.all(
      servers.map(async (server) => {
        const latestMetric = await Metric.findOne({ serverId: server.serverId })
          .sort({ timestamp: -1 })
          .limit(1);
        
        return {
          ...server.toObject(),
          metrics: latestMetric || null
        };
      })
    );

    res.json({ success: true, data: serversWithMetrics });
  } catch (error) {
    console.error('❌ Erreur récupération serveurs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Détail serveur avec historique
app.get('/api/servers/:serverId', async (req, res) => {
  try {
    const { serverId } = req.params;
    const { period = '24h' } = req.query;

    const server = await Server.findOne({ serverId });
    if (!server) {
      return res.status(404).json({ success: false, message: 'Serveur non trouvé' });
    }

    // Calculer la date de début selon la période
    const now = new Date();
    let startDate;
    switch (period) {
      case '1h':
        startDate = new Date(now - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 24 * 60 * 60 * 1000);
    }

    const metrics = await Metric.find({
      serverId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    res.json({ 
      success: true, 
      data: {
        server,
        metrics
      }
    });
  } catch (error) {
    console.error('❌ Erreur récupération serveur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sites (mock pour l'instant - à intégrer avec votre backend existant)
app.get('/api/sites', async (req, res) => {
  try {
    // TODO: Intégrer avec votre API backend existante
    const mockSites = [
      { id: 1, name: 'speedl.swigs.online', status: 'online', latency: 45, uptime: 99.9 },
      { id: 2, name: 'admin.swigs.online', status: 'online', latency: 32, uptime: 100 },
    ];
    res.json({ success: true, data: mockSites });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vérifier serveurs inactifs (toutes les minutes)
setInterval(async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await Server.updateMany(
      { lastSeen: { $lt: fiveMinutesAgo } },
      { status: 'offline' }
    );
  } catch (error) {
    console.error('❌ Erreur vérification serveurs:', error);
  }
}, 60000);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swigs-monitoring')
  .then(() => {
    console.log('✅ Connecté à MongoDB');
    
    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 SWIGS Monitoring API sur port ${PORT}`);
      console.log(`📊 WebSocket actif`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur connexion MongoDB:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM reçu, fermeture...');
  httpServer.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
