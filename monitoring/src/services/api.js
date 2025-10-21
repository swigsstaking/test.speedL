import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const monitoringApi = {
  // Récupérer tous les serveurs avec leurs métriques
  getServers: async () => {
    const response = await api.get('/servers');
    return response.data;
  },

  // Récupérer un serveur spécifique avec historique
  getServer: async (serverId, period = '24h') => {
    const response = await api.get(`/servers/${serverId}?period=${period}`);
    return response.data;
  },

  // Récupérer les sites
  getSites: async () => {
    const response = await api.get('/sites');
    return response.data;
  },

  // Récupérer un site spécifique avec historique
  getSite: async (siteId, period = '24h') => {
    const response = await api.get(`/sites/${siteId}?period=${period}`);
    return response.data;
  },

  // Mesurer PageSpeed d'un site
  measurePageSpeed: async (siteId, strategy = 'mobile') => {
    const response = await api.post(`/sites/${siteId}/pagespeed`, { strategy });
    return response.data;
  },

  // Récupérer historique PageSpeed
  getPageSpeedHistory: async (siteId, period = '7d', strategy = 'mobile') => {
    const response = await api.get(`/sites/${siteId}/pagespeed?period=${period}&strategy=${strategy}`);
    return response.data;
  },

  // Récupérer stats Nginx (uptime, requêtes, erreurs)
  getSiteStats: async (siteId, period = '24h') => {
    const response = await api.get(`/sites/${siteId}/stats?period=${period}`);
    return response.data;
  },

  // Récupérer stats de tous les sites
  getAllSitesStats: async (period = '24h') => {
    const response = await api.get(`/sites/stats/all?period=${period}`);
    return response.data;
  },

  // ==================== FINANCIER ====================

  // Serveur - Coûts
  getServerCost: async (serverId) => {
    const response = await api.get(`/servers/${serverId}/cost`);
    return response.data;
  },

  updateServerCost: async (serverId, costData) => {
    const response = await api.put(`/servers/${serverId}/cost`, costData);
    return response.data;
  },

  // Site - Pricing
  getSitePricing: async (siteId) => {
    const response = await api.get(`/sites/${siteId}/pricing`);
    return response.data;
  },

  updateSitePricing: async (siteId, pricingData) => {
    const response = await api.put(`/sites/${siteId}/pricing`, pricingData);
    return response.data;
  },

  // Analytics financiers
  getFinancialAnalytics: async () => {
    const response = await api.get('/analytics/financial');
    return response.data;
  },

  recalculatePrices: async (options = {}) => {
    const response = await api.post('/analytics/recalculate-prices', options);
    return response.data;
  },

  getMonthlyHistory: async (months = 12) => {
    const response = await api.get(`/analytics/monthly-history?months=${months}`);
    return response.data;
  },

  getServerProfitability: async () => {
    const response = await api.get('/analytics/server-profitability');
    return response.data;
  },

  calculateMonthly: async () => {
    const response = await api.post('/analytics/calculate-monthly');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
