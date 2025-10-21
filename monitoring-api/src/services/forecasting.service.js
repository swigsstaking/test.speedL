import MonthlyFinancial from '../models/MonthlyFinancial.js';

/**
 * Calculer prévisions basées sur tendance historique
 */
export async function calculateForecasts(months = 6) {
  try {
    // Récupérer historique 12 derniers mois
    const history = await MonthlyFinancial.find()
      .sort({ year: -1, month: -1 })
      .limit(12);
    
    if (history.length < 3) {
      return {
        forecasts: [],
        trend: 'insufficient_data',
        message: 'Pas assez de données historiques (minimum 3 mois)'
      };
    }
    
    history.reverse(); // Plus ancien → plus récent
    
    // Calculer tendances (régression linéaire simple)
    const revenueTrend = calculateTrend(history.map(h => h.totalRevenue));
    const costTrend = calculateTrend(history.map(h => h.totalCosts));
    
    // Dernières valeurs
    const lastMonth = history[history.length - 1];
    const lastRevenue = lastMonth.totalRevenue;
    const lastCost = lastMonth.totalCosts;
    
    // Générer prévisions
    const forecasts = [];
    const now = new Date();
    
    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const year = forecastDate.getFullYear();
      const month = forecastDate.getMonth() + 1;
      
      // Prévision simple: dernière valeur + tendance * i
      const forecastRevenue = Math.max(0, lastRevenue + (revenueTrend * i));
      const forecastCost = Math.max(0, lastCost + (costTrend * i));
      const forecastProfit = forecastRevenue - forecastCost;
      const forecastMargin = forecastRevenue > 0 ? (forecastProfit / forecastRevenue) * 100 : 0;
      
      forecasts.push({
        year,
        month,
        monthName: `${month}/${year}`,
        revenue: parseFloat(forecastRevenue.toFixed(2)),
        cost: parseFloat(forecastCost.toFixed(2)),
        profit: parseFloat(forecastProfit.toFixed(2)),
        margin: parseFloat(forecastMargin.toFixed(2)),
        confidence: calculateConfidence(history.length, i)
      });
    }
    
    // Déterminer tendance globale
    const overallTrend = revenueTrend > 0 ? 'growing' : revenueTrend < 0 ? 'declining' : 'stable';
    
    return {
      forecasts,
      trend: overallTrend,
      revenueTrend: parseFloat(revenueTrend.toFixed(2)),
      costTrend: parseFloat(costTrend.toFixed(2)),
      historicalData: history.length,
      message: `Prévisions basées sur ${history.length} mois d'historique`
    };
  } catch (error) {
    console.error('❌ Erreur calcul prévisions:', error);
    throw error;
  }
}

/**
 * Calculer tendance (régression linéaire simple)
 */
function calculateTrend(values) {
  const n = values.length;
  if (n < 2) return 0;
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  
  // Pente de la droite de régression
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
}

/**
 * Calculer confiance de la prévision (diminue avec le temps)
 */
function calculateConfidence(historyLength, forecastMonth) {
  const baseConfidence = Math.min(historyLength * 8, 95); // Max 95%
  const decay = forecastMonth * 5; // -5% par mois
  return Math.max(baseConfidence - decay, 30); // Min 30%
}

/**
 * Calculer point d'équilibre (break-even)
 */
export async function calculateBreakEven() {
  try {
    const history = await MonthlyFinancial.find()
      .sort({ year: -1, month: -1 })
      .limit(12);
    
    if (history.length === 0) {
      return {
        breakEven: null,
        message: 'Pas de données historiques'
      };
    }
    
    history.reverse();
    
    // Trouver premier mois rentable
    const firstProfitable = history.find(h => h.totalProfit > 0);
    
    if (!firstProfitable) {
      // Calculer combien de revenus supplémentaires nécessaires
      const lastMonth = history[history.length - 1];
      const deficit = Math.abs(lastMonth.totalProfit);
      const requiredRevenue = lastMonth.totalRevenue + deficit;
      
      return {
        breakEven: null,
        currentDeficit: deficit,
        requiredRevenue: parseFloat(requiredRevenue.toFixed(2)),
        message: `Besoin de ${deficit.toFixed(2)} CHF de revenus supplémentaires pour atteindre l'équilibre`
      };
    }
    
    return {
      breakEven: {
        year: firstProfitable.year,
        month: firstProfitable.month,
        revenue: firstProfitable.totalRevenue,
        cost: firstProfitable.totalCosts
      },
      message: `Point d'équilibre atteint en ${firstProfitable.month}/${firstProfitable.year}`
    };
  } catch (error) {
    console.error('❌ Erreur calcul break-even:', error);
    throw error;
  }
}

/**
 * Calculer ROI par site
 */
export async function calculateSiteROI() {
  try {
    const SitePricing = (await import('../models/SitePricing.js')).default;
    const sites = await SitePricing.find();
    
    const roi = sites.map(site => {
      const monthlyProfit = site.monthlyProfit || 0;
      const monthlyCost = site.monthlyCost || 0;
      const roi = monthlyCost > 0 ? (monthlyProfit / monthlyCost) * 100 : 0;
      
      return {
        siteId: site.siteId,
        monthlyRevenue: site.actualPrice,
        monthlyCost: site.monthlyCost,
        monthlyProfit: site.monthlyProfit,
        roi: parseFloat(roi.toFixed(2)),
        paybackPeriod: monthlyProfit > 0 ? Math.ceil(monthlyCost / monthlyProfit) : null
      };
    });
    
    return roi.sort((a, b) => b.roi - a.roi);
  } catch (error) {
    console.error('❌ Erreur calcul ROI sites:', error);
    throw error;
  }
}

export default {
  calculateForecasts,
  calculateBreakEven,
  calculateSiteROI
};
