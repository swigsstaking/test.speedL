import MonthlyFinancial from '../models/MonthlyFinancial.js';
import ServerCost from '../models/ServerCost.js';
import SitePricing from '../models/SitePricing.js';

/**
 * Calculer et sauvegarder les stats financières du mois en cours
 */
export async function calculateCurrentMonth() {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12

    // Récupérer tous les coûts serveurs
    const serverCosts = await ServerCost.find();
    const totalCosts = serverCosts.reduce((sum, s) => sum + s.totalMonthly, 0);

    // Récupérer tous les pricings sites
    const sitePricings = await SitePricing.find();
    const totalRevenue = sitePricings.reduce((sum, s) => sum + s.actualPrice, 0);

    // Calculer profit et marge
    const totalProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Calculer breakdown par serveur
    const serverBreakdown = serverCosts.map(server => {
      // Sites sur ce serveur
      const sitesOnServer = sitePricings.filter(s => s.serverId === server.serverId);
      const serverRevenue = sitesOnServer.reduce((sum, s) => sum + s.actualPrice, 0);
      const serverProfit = serverRevenue - server.totalMonthly;

      return {
        serverId: server.serverId,
        cost: server.totalMonthly,
        revenue: serverRevenue,
        profit: serverProfit,
        siteCount: sitesOnServer.length
      };
    });

    // Sauvegarder ou mettre à jour
    const monthlyData = await MonthlyFinancial.findOneAndUpdate(
      { year, month },
      {
        year,
        month,
        totalRevenue,
        totalCosts,
        totalProfit,
        profitMargin,
        serverCount: serverCosts.length,
        siteCount: sitePricings.length,
        serverBreakdown
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Stats mensuelles ${year}-${month} sauvegardées`);
    return monthlyData;
  } catch (error) {
    console.error('❌ Erreur calcul stats mensuelles:', error);
    throw error;
  }
}

/**
 * Récupérer historique des N derniers mois
 */
export async function getMonthlyHistory(months = 12) {
  try {
    const history = await MonthlyFinancial.find()
      .sort({ year: -1, month: -1 })
      .limit(months);

    return history.reverse(); // Plus ancien → plus récent
  } catch (error) {
    console.error('❌ Erreur récupération historique:', error);
    throw error;
  }
}

/**
 * Récupérer rentabilité par serveur pour le mois en cours
 */
export async function getServerProfitability() {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const monthlyData = await MonthlyFinancial.findOne({ year, month });
    
    if (!monthlyData) {
      // Calculer si pas encore fait
      await calculateCurrentMonth();
      return getServerProfitability();
    }

    return monthlyData.serverBreakdown || [];
  } catch (error) {
    console.error('❌ Erreur rentabilité serveurs:', error);
    throw error;
  }
}

export default {
  calculateCurrentMonth,
  getMonthlyHistory,
  getServerProfitability
};
