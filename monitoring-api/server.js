import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import SiteMetric from './src/models/SiteMetric.js';
import ServerMetric from './src/models/ServerMetric.js';
import PageSpeedMetric from './src/models/PageSpeedMetric.js';
import ServerCost from './src/models/ServerCost.js';
import SitePricing from './src/models/SitePricing.js';

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

const ServerModel = mongoose.model('Server', ServerSchema);
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

    // Sauvegarder métrique dans ServerMetric
    const serverMetric = new ServerMetric({
      serverId,
      metrics: metricData
    });
    await serverMetric.save();
    console.log(`💾 Métrique sauvegardée pour ${serverId}`);

    // Mettre à jour serveur
    await ServerModel.findOneAndUpdate(
      { serverId },
      { 
        serverId,
        lastSeen: new Date(),
        status: 'online',
        metrics: metricData
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
    const servers = await ServerModel.find();
    
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

    const server = await ServerModel.findOne({ serverId });
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

    const metrics = await ServerMetric.find({
      serverId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 }).limit(200); // Limiter à 200 points max

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

// Mesurer les performances PageSpeed d'un site
app.post('/api/sites/:siteId/pagespeed', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { strategy = 'mobile' } = req.body;
    
    console.log(`📊 Démarrage mesure PageSpeed pour ${siteId} (${strategy})...`);
    
    // Vérifier si une mesure récente existe (< 24h)
    const recentMeasure = await PageSpeedMetric.findOne({
      siteId,
      strategy,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).sort({ timestamp: -1 });
    
    if (recentMeasure) {
      console.log(`⏰ Mesure récente trouvée (${new Date(recentMeasure.timestamp).toLocaleString()}), réutilisation`);
      return res.json({
        success: true,
        cached: true,
        message: 'Mesure récente réutilisée (< 24h)',
        metrics: recentMeasure
      });
    }
    
    // Récupérer l'URL du site
    const axios = (await import('axios')).default;
    let siteUrl;
    
    try {
      const backendResponse = await axios.get('http://localhost:3000/api/sites', { timeout: 3000 });
      const site = backendResponse.data?.data?.find(s => s.slug === siteId);
      
      if (site) {
        const domain = site.domains?.[0] || `${site.slug.replace(/-/g, '')}.${site.domain}`;
        siteUrl = `https://${domain}`;
      } else {
        siteUrl = `https://${siteId}.swigs.online`;
      }
    } catch {
      siteUrl = `https://${siteId}.swigs.online`;
    }
    
    // Mesurer avec PageSpeed
    const { measurePageSpeed } = await import('./src/services/pagespeed.service.js');
    const result = await measurePageSpeed(siteUrl, strategy);
    
    if (result.success) {
      // Sauvegarder dans MongoDB
      await PageSpeedMetric.create({
        siteId,
        url: siteUrl,
        strategy,
        ...result.metrics
      });
      
      console.log(`✅ PageSpeed sauvegardé pour ${siteId}`);
    }
    
    res.json(result);
  } catch (error) {
    console.error('❌ Erreur mesure PageSpeed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer l'historique PageSpeed d'un site
app.get('/api/sites/:siteId/pagespeed', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { period = '7d', strategy = 'mobile' } = req.query;
    
    const now = Date.now();
    let startDate;
    
    switch (period) {
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
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
    }
    
    const metrics = await PageSpeedMetric.find({
      siteId,
      strategy,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 }).limit(50);
    
    // Récupérer la dernière métrique
    const latest = metrics[0] || null;
    
    res.json({
      success: true,
      data: {
        siteId,
        strategy,
        latest,
        history: metrics
      }
    });
  } catch (error) {
    console.error('❌ Erreur récupération PageSpeed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stats Nginx pour un site
app.get('/api/sites/:siteId/stats', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { period = '24h' } = req.query;
    
    console.log(`📊 Récupération stats Nginx pour ${siteId} (${period})`);
    
    // Récupérer le domaine du site
    const axios = (await import('axios')).default;
    let domain = `${siteId}.swigs.online`;
    
    try {
      const backendResponse = await axios.get('http://localhost:3000/api/sites', { timeout: 3000 });
      const site = backendResponse.data?.data?.find(s => s.slug === siteId);
      if (site) {
        domain = site.domains?.[0] || `${site.slug.replace(/-/g, '')}.${site.domain}`;
      }
    } catch (e) {
      console.log('⚠️ Backend non accessible, utilisation domaine par défaut');
    }
    
    // Calculer la date de début
    const now = Date.now();
    let since;
    switch (period) {
      case '1h':
        since = new Date(now - 60 * 60 * 1000);
        break;
      case '24h':
        since = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        since = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        since = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        since = new Date(now - 24 * 60 * 60 * 1000);
    }
    
    // Analyser les logs Nginx
    const { analyzeSiteLogs, calculateUptime } = await import('./src/services/nginx-logs.service.js');
    const nginxStats = await analyzeSiteLogs(domain, since);
    
    // Calculer l'uptime depuis MongoDB
    const metricsHistory = await SiteMetric.find({
      siteId,
      timestamp: { $gte: since }
    }).sort({ timestamp: 1 });
    
    const uptime = calculateUptime(metricsHistory);
    
    res.json({
      success: true,
      data: {
        siteId,
        domain,
        period,
        uptime: parseFloat(uptime),
        requests: nginxStats.requests,
        errors: nginxStats.errors,
        bandwidth: nginxStats.bandwidth,
        uniqueVisitors: nginxStats.uniqueVisitors,
        statusCodes: nginxStats.statusCodes,
        topPaths: nginxStats.topPaths
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Historique d'un site spécifique
app.get('/api/sites/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { period = '24h' } = req.query;
    
    console.log(`📊 Récupération historique site ${siteId} (${period})`);
    
    // Calculer la date de début selon la période
    const now = Date.now();
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

    const metrics = await SiteMetric.find({
      siteId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 }).limit(200);

    res.json({ 
      success: true, 
      data: {
        siteId,
        metrics
      }
    });
  } catch (error) {
    console.error('❌ Erreur récupération historique site:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stats Nginx pour tous les sites (optimisé)
app.get('/api/sites/stats/all', async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    console.log(`📊 Récupération stats tous sites (${period})`);
    
    // Récupérer la liste des sites
    const axios = (await import('axios')).default;
    let sites = [];
    
    try {
      const backendResponse = await axios.get('http://localhost:3000/api/sites', { timeout: 3000 });
      if (backendResponse.data?.data?.length > 0) {
        sites = backendResponse.data.data;
      }
    } catch (e) {
      console.log('⚠️ Backend non accessible');
    }
    
    // Calculer date de début
    const now = Date.now();
    let since;
    switch (period) {
      case '1h': since = new Date(now - 60 * 60 * 1000); break;
      case '24h': since = new Date(now - 24 * 60 * 60 * 1000); break;
      case '7d': since = new Date(now - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': since = new Date(now - 30 * 24 * 60 * 60 * 1000); break;
      default: since = new Date(now - 24 * 60 * 60 * 1000);
    }
    
    // Récupérer stats pour chaque site
    const { analyzeSiteLogs, calculateUptime } = await import('./src/services/nginx-logs.service.js');
    const allStats = {};
    
    for (const site of sites) {
      const domain = site.domains?.[0] || `${site.slug.replace(/-/g, '')}.${site.domain}`;
      const nginxStats = await analyzeSiteLogs(domain, since);
      
      // Uptime depuis MongoDB
      const metricsHistory = await SiteMetric.find({
        siteId: site.slug,
        timestamp: { $gte: since }
      });
      const uptime = calculateUptime(metricsHistory);
      
      allStats[site.slug] = {
        uptime: parseFloat(uptime),
        requests: nginxStats.requests,
        errors: nginxStats.errors,
        uniqueVisitors: nginxStats.uniqueVisitors
      };
    }
    
    res.json({
      success: true,
      data: allStats
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération stats tous sites:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sites - Version complète avec vérification uptime/SSL
app.get('/api/sites', async (req, res) => {
  try {
    console.log('📊 Récupération sites avec vérification...');
    
    const axios = (await import('axios')).default;
    
    // Liste des sites à vérifier
    let sitesToCheck = [
      { slug: 'speedl', name: 'Speed-L' },
      { slug: 'admin', name: 'Admin' },
      { slug: 'monitoring', name: 'Monitoring' },
      { slug: 'moontain', name: 'Moontain', domain: 'www.moontain.ch', external: true },
      { slug: 'adlr', name: 'ADLR Cosmetic Auto', domain: 'www.adlrcosmeticauto.ch', external: true }
    ];
    
    // Essayer de récupérer depuis le backend principal
    try {
      const backendResponse = await axios.get('http://localhost:3000/api/sites', { timeout: 3000 });
      console.log('📡 Backend response:', JSON.stringify(backendResponse.data, null, 2));
      
      if (backendResponse.data?.data?.length > 0) {
        sitesToCheck = backendResponse.data.data.map(s => {
          // Construire le domaine complet
          let fullDomain;
          
          if (s.domains && s.domains.length > 0) {
            // Utiliser le premier domaine custom si disponible
            fullDomain = s.domains[0];
          } else {
            // Construire slug.domain (sans tiret dans le slug)
            const cleanSlug = s.slug.replace(/-/g, ''); // Retirer les tirets
            fullDomain = `${cleanSlug}.${s.domain}`;
          }
          
          return {
            slug: s.slug,
            name: s.name || s.slug,
            domain: fullDomain
          };
        });
        
        // Ajouter les sites externes
        sitesToCheck.push(
          { slug: 'moontain', name: 'Moontain', domain: 'www.moontain.ch', external: true },
          { slug: 'adlr', name: 'ADLR Cosmetic Auto', domain: 'www.adlrcosmeticauto.ch', external: true }
        );
        
        console.log(`✅ ${sitesToCheck.length} sites récupérés depuis backend (+ externes):`, sitesToCheck);
      }
    } catch (backendError) {
      console.log('⚠️ Backend principal non accessible:', backendError.message);
      console.log('⚠️ Utilisation sites par défaut');
    }
    
    // Vérifier l'uptime et SSL de chaque site
    const { checkSiteUptime, checkSSL } = await import('./src/services/uptime.service.js');
    
    const sitesWithStatus = await Promise.all(
      sitesToCheck.map(async (site) => {
        // Construire l'URL correctement (gérer les tirets)
        const domain = site.domain || `${site.slug}.swigs.online`;
        const url = `https://${domain}`;
        
        try {
          const [uptimeCheck, sslCheck] = await Promise.all([
            checkSiteUptime(url).catch(e => ({ status: 'error', latency: 0, error: e.message })),
            checkSSL(url).catch(e => ({ valid: false, expiresIn: 0, error: e.message }))
          ]);
          
          console.log(`✅ ${site.slug}: ${uptimeCheck.status} (${uptimeCheck.latency}ms)`);
          console.log(`   SSL: ${sslCheck.valid ? 'Valide' : 'Invalide'}, expire dans ${sslCheck.expiresIn} jours`);
          
          // Sauvegarder la métrique dans MongoDB
          try {
            await SiteMetric.create({
              siteId: site.slug,
              status: uptimeCheck.status,
              latency: uptimeCheck.latency,
              statusCode: uptimeCheck.statusCode
            });
            console.log(`💾 Métrique site sauvegardée pour ${site.slug}`);
          } catch (saveError) {
            console.error(`❌ Erreur sauvegarde métrique ${site.slug}:`, saveError.message);
          }
          
          return {
            id: site.slug,
            name: site.name || domain,
            url,
            status: uptimeCheck.status,
            latency: uptimeCheck.latency,
            uptime: 0, // TODO: Calculer depuis historique MongoDB
            ssl: sslCheck,
            statusCode: uptimeCheck.statusCode,
            external: site.external || false,
          };
        } catch (error) {
          console.error(`❌ Erreur vérification ${site.slug}:`, error.message);
          return {
            id: site.slug,
            name: site.name || domain,
            url,
            status: 'error',
            latency: 0,
            uptime: 0,
            ssl: { valid: false, expiresIn: 0 },
            external: site.external || false,
          };
        }
      })
    );
    
    console.log(`✅ ${sitesWithStatus.length} sites vérifiés et retournés`);
    res.json({ success: true, data: sitesWithStatus });
  } catch (error) {
    console.error('❌ Erreur récupération sites:', error);
    res.json({ success: true, data: [] });
  }
});

// Vérifier serveurs inactifs (toutes les minutes)
setInterval(async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await ServerModel.updateMany(
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

// ==================== ROUTES FINANCIÈRES ====================

// Récupérer coûts serveur
app.get('/api/servers/:serverId/cost', async (req, res) => {
  try {
    const { serverId } = req.params;
    let cost = await ServerCost.findOne({ serverId });
    
    if (!cost) {
      // Créer entrée par défaut
      cost = await ServerCost.create({ serverId });
    }
    
    res.json({ success: true, data: cost });
  } catch (error) {
    console.error('❌ Erreur récupération coût serveur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mettre à jour coûts serveur
app.put('/api/servers/:serverId/cost', async (req, res) => {
  try {
    const { serverId } = req.params;
    const { baseCost, electricityCost, networkCost, amortization, otherCharges } = req.body;
    
    let cost = await ServerCost.findOne({ serverId });
    
    if (!cost) {
      cost = new ServerCost({ serverId });
    }
    
    if (baseCost !== undefined) cost.baseCost = baseCost;
    if (electricityCost !== undefined) cost.electricityCost = electricityCost;
    if (networkCost !== undefined) cost.networkCost = networkCost;
    if (amortization !== undefined) cost.amortization = amortization;
    if (otherCharges !== undefined) cost.otherCharges = otherCharges;
    
    await cost.save();
    
    res.json({ success: true, data: cost });
  } catch (error) {
    console.error('❌ Erreur mise à jour coût serveur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer pricing site
app.get('/api/sites/:siteId/pricing', async (req, res) => {
  try {
    const { siteId } = req.params;
    let pricing = await SitePricing.findOne({ siteId });
    
    if (!pricing) {
      // Créer entrée par défaut
      pricing = await SitePricing.create({ siteId });
    }
    
    res.json({ success: true, data: pricing });
  } catch (error) {
    console.error('❌ Erreur récupération pricing site:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mettre à jour pricing site
app.put('/api/sites/:siteId/pricing', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { actualPrice, monthlyCost, suggestedBreakdown } = req.body;
    
    let pricing = await SitePricing.findOne({ siteId });
    
    if (!pricing) {
      pricing = new SitePricing({ siteId });
    }
    
    if (actualPrice !== undefined) pricing.actualPrice = actualPrice;
    if (monthlyCost !== undefined) pricing.monthlyCost = monthlyCost;
    if (suggestedBreakdown) pricing.suggestedBreakdown = suggestedBreakdown;
    
    await pricing.save();
    
    res.json({ success: true, data: pricing });
  } catch (error) {
    console.error('❌ Erreur mise à jour pricing site:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vue d'ensemble financière (Analytics)
app.get('/api/analytics/financial', async (req, res) => {
  try {
    // Mettre à jour les prix suggérés avant de récupérer les données
    const { updateAllSuggestedPrices } = await import('./src/services/pricing.service.js');
    await updateAllSuggestedPrices({ period: '30d', marginPercent: 20 });
    
    // Récupérer tous les coûts serveurs
    const serverCosts = await ServerCost.find();
    const totalServerCosts = serverCosts.reduce((sum, s) => sum + s.totalMonthly, 0);
    
    // Récupérer tous les pricings sites
    const sitePricings = await SitePricing.find();
    const totalRevenue = sitePricings.reduce((sum, s) => sum + s.actualPrice, 0);
    const totalProfit = sitePricings.reduce((sum, s) => sum + s.monthlyProfit, 0);
    
    // Calculer marge globale
    const globalMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: {
        servers: {
          count: serverCosts.length,
          totalMonthlyCost: totalServerCosts,
          totalYearlyCost: totalServerCosts * 12,
          details: serverCosts
        },
        sites: {
          count: sitePricings.length,
          totalMonthlyRevenue: totalRevenue,
          totalYearlyRevenue: totalRevenue * 12,
          totalMonthlyProfit: totalProfit,
          totalYearlyProfit: totalProfit * 12,
          globalMargin: parseFloat(globalMargin),
          details: sitePricings
        },
        summary: {
          monthlyRevenue: totalRevenue,
          monthlyCosts: totalServerCosts,
          monthlyProfit: totalProfit,
          profitMargin: parseFloat(globalMargin)
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur récupération analytics financiers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Recalculer prix suggérés manuellement
app.post('/api/analytics/recalculate-prices', async (req, res) => {
  try {
    const { period = '30d', marginPercent = 20 } = req.body;
    const { updateAllSuggestedPrices } = await import('./src/services/pricing.service.js');
    
    const results = await updateAllSuggestedPrices({ period, marginPercent });
    
    res.json({
      success: true,
      data: {
        count: results.length,
        sites: results
      },
      message: `${results.length} prix suggérés recalculés`
    });
  } catch (error) {
    console.error('❌ Erreur recalcul prix suggérés:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM reçu, fermeture...');
  httpServer.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
