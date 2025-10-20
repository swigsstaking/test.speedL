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

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
