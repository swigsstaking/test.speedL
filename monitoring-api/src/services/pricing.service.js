import ServerMetric from '../models/ServerMetric.js';
import SiteMetric from '../models/SiteMetric.js';
import ServerCost from '../models/ServerCost.js';

/**
 * Calcule le prix suggéré pour un site basé sur son utilisation réelle
 */
export async function calculateSuggestedPrice(siteId, options = {}) {
  const {
    period = '30d', // Période d'analyse
    marginPercent = 20, // Marge bénéficiaire par défaut
  } = options;

  try {
    // 1. Récupérer les métriques du site sur la période
    const startDate = getStartDate(period);
    const siteMetrics = await SiteMetric.find({
      siteId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 });

    if (siteMetrics.length === 0) {
      return {
        suggestedPrice: 0,
        breakdown: {
          serverShare: 0,
          bandwidth: 0,
          storage: 0,
          requests: 0,
          margin: marginPercent
        },
        details: 'Pas de données disponibles'
      };
    }

    // 2. Identifier le serveur hébergeant le site
    // Pour l'instant, on suppose que le site est sur server-1
    // TODO: Récupérer depuis la config du site
    const serverId = 'server-1';

    // 3. Récupérer le coût du serveur
    const serverCost = await ServerCost.findOne({ serverId });
    if (!serverCost) {
      return {
        suggestedPrice: 0,
        breakdown: {
          serverShare: 0,
          bandwidth: 0,
          storage: 0,
          requests: 0,
          margin: marginPercent
        },
        details: 'Coût serveur non configuré'
      };
    }

    // 4. Récupérer les métriques du serveur pour calculer la part
    const serverMetrics = await ServerMetric.find({
      serverId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 }).limit(100);

    if (serverMetrics.length === 0) {
      return {
        suggestedPrice: 0,
        breakdown: {
          serverShare: 0,
          bandwidth: 0,
          storage: 0,
          requests: 0,
          margin: marginPercent
        },
        details: 'Pas de métriques serveur disponibles'
      };
    }

    // 5. Calculer les moyennes d'utilisation
    const avgServerCpu = serverMetrics.reduce((sum, m) => sum + (m.metrics?.cpu?.usage || 0), 0) / serverMetrics.length;
    const avgServerRam = serverMetrics.reduce((sum, m) => sum + (m.metrics?.ram?.percent || 0), 0) / serverMetrics.length;
    const avgServerDisk = serverMetrics.reduce((sum, m) => sum + (m.metrics?.disk?.[0]?.percent || 0), 0) / serverMetrics.length;

    // 6. Estimer la part du site (pour l'instant, on utilise une estimation simple)
    // TODO: Améliorer avec des données réelles par site
    const siteCpuShare = 10; // % du CPU utilisé par le site (à mesurer)
    const siteRamShare = 15; // % de la RAM utilisée par le site (à mesurer)
    const siteDiskShare = 5; // % du disque utilisé par le site (à mesurer)

    // 7. Calculer la part du coût serveur attribuable au site
    const avgResourceShare = (siteCpuShare + siteRamShare + siteDiskShare) / 3;
    const serverShareCost = (serverCost.totalMonthly * avgResourceShare) / 100;

    // 8. Calculer le coût de la bande passante
    // Estimer à partir des requêtes (moyenne 1MB par requête)
    const totalRequests = siteMetrics.length; // Nombre de checks
    const estimatedBandwidthGB = (totalRequests * 1) / 1024; // MB -> GB
    const bandwidthCostPerGB = 0.15; // CHF par GB (Suisse: +50% vs moyenne)
    const bandwidthCost = estimatedBandwidthGB * bandwidthCostPerGB;

    // 9. Calculer le coût du stockage
    // Estimation: 5GB par site en moyenne
    const estimatedStorageGB = 5;
    const storageCostPerGB = 0.08; // CHF par GB par mois (Suisse: +60% vs moyenne)
    const storageCost = estimatedStorageGB * storageCostPerGB;

    // 10. Calculer le coût des requêtes
    // Basé sur le nombre de requêtes (si disponible depuis Nginx logs)
    const requestsPerMonth = 50000; // Estimation (à remplacer par vraies données)
    const costPer1000Requests = 0.015; // CHF par 1000 requêtes (Suisse: +50%)
    const requestsCost = (requestsPerMonth / 1000) * costPer1000Requests;

    // 11. Calculer le coût total de base
    const baseCost = serverShareCost + bandwidthCost + storageCost + requestsCost;

    // 12. Appliquer la marge (Suisse: marge plus élevée recommandée)
    const suggestedPrice = baseCost * (1 + marginPercent / 100);

    return {
      suggestedPrice: parseFloat(suggestedPrice.toFixed(2)),
      breakdown: {
        serverShare: parseFloat(serverShareCost.toFixed(2)),
        bandwidth: parseFloat(bandwidthCost.toFixed(2)),
        storage: parseFloat(storageCost.toFixed(2)),
        requests: parseFloat(requestsCost.toFixed(2)),
        margin: marginPercent
      },
      details: {
        period,
        metricsCount: siteMetrics.length,
        serverMetricsCount: serverMetrics.length,
        avgServerCpu: avgServerCpu.toFixed(1),
        avgServerRam: avgServerRam.toFixed(1),
        avgServerDisk: avgServerDisk.toFixed(1),
        estimatedResourceShare: avgResourceShare.toFixed(1),
        estimatedBandwidthGB: estimatedBandwidthGB.toFixed(2),
        estimatedStorageGB,
        estimatedRequestsPerMonth: requestsPerMonth
      }
    };
  } catch (error) {
    console.error('❌ Erreur calcul prix suggéré:', error);
    throw error;
  }
}

/**
 * Calcule le prix suggéré pour tous les sites
 */
export async function calculateAllSuggestedPrices(options = {}) {
  try {
    // Récupérer tous les sites uniques depuis les métriques
    const uniqueSites = await SiteMetric.distinct('siteId');
    
    const results = await Promise.all(
      uniqueSites.map(async (siteId) => {
        const pricing = await calculateSuggestedPrice(siteId, options);
        return {
          siteId,
          ...pricing
        };
      })
    );

    return results;
  } catch (error) {
    console.error('❌ Erreur calcul prix suggérés:', error);
    throw error;
  }
}

/**
 * Met à jour automatiquement les prix suggérés pour tous les sites
 */
export async function updateAllSuggestedPrices(options = {}) {
  try {
    const SitePricing = (await import('../models/SitePricing.js')).default;
    const pricings = await calculateAllSuggestedPrices(options);
    
    const results = await Promise.all(
      pricings.map(async (pricing) => {
        let sitePricing = await SitePricing.findOne({ siteId: pricing.siteId });
        
        if (!sitePricing) {
          sitePricing = new SitePricing({ siteId: pricing.siteId });
        }
        
        sitePricing.suggestedPrice = pricing.suggestedPrice;
        sitePricing.suggestedBreakdown = pricing.breakdown;
        sitePricing.lastCalculated = new Date();
        
        await sitePricing.save();
        
        return sitePricing;
      })
    );

    console.log(`✅ ${results.length} prix suggérés mis à jour`);
    return results;
  } catch (error) {
    console.error('❌ Erreur mise à jour prix suggérés:', error);
    throw error;
  }
}

// Helper pour calculer la date de début selon la période
function getStartDate(period) {
  const now = new Date();
  switch (period) {
    case '1h':
      return new Date(now - 60 * 60 * 1000);
    case '24h':
      return new Date(now - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
  }
}

export default {
  calculateSuggestedPrice,
  calculateAllSuggestedPrices,
  updateAllSuggestedPrices
};
