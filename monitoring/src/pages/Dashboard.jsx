import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Server, Globe, Activity, TrendingUp, Cpu, HardDrive, Wifi, AlertCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { monitoringApi } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import HistoryChart from '../components/HistoryChart';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isConnected, latestMetric } = useWebSocket();

  // Récupérer les serveurs
  const { data: serversData, refetch: refetchServers } = useQuery({
    queryKey: ['servers'],
    queryFn: monitoringApi.getServers,
    refetchInterval: 10000, // Refresh toutes les 10s
  });

  // Récupérer les sites
  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: monitoringApi.getSites,
    refetchInterval: 30000, // Refresh toutes les 30s
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Refetch quand nouvelle métrique arrive via WebSocket
  useEffect(() => {
    if (latestMetric) {
      refetchServers();
    }
  }, [latestMetric, refetchServers]);

  const servers = serversData?.data || [];
  const sites = sitesData?.data || [];

  // Générer données graphiques depuis les serveurs (dernières métriques)
  const [cpuHistory, setCpuHistory] = useState([]);
  const [ramHistory, setRamHistory] = useState([]);

  useEffect(() => {
    if (servers.length > 0 && servers[0].metrics) {
      const now = new Date();
      const newCpuPoint = {
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        value: servers[0].metrics.cpu?.usage || 0
      };
      const newRamPoint = {
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        value: servers[0].metrics.ram?.percent || 0
      };

      setCpuHistory(prev => [...prev.slice(-19), newCpuPoint]);
      setRamHistory(prev => [...prev.slice(-19), newRamPoint]);
    }
  }, [servers]);

  // Calculer les stats depuis les vraies données
  const activeServers = servers.filter(s => s.status === 'online').length;
  const avgCpu = servers.length > 0 
    ? Math.round(servers.reduce((sum, s) => sum + (s.metrics?.cpu?.usage || 0), 0) / servers.length)
    : 0;
  const onlineSites = sites.filter(s => s.status === 'online').length;

  const stats = [
    {
      label: 'Serveurs Actifs',
      value: `${activeServers}`,
      change: '+0%',
      icon: Server,
      color: 'primary',
    },
    {
      label: 'Sites en Ligne',
      value: `${onlineSites}/${sites.length}`,
      change: sites.length > 0 ? `${Math.round((onlineSites / sites.length) * 100)}%` : '0%',
      icon: Globe,
      color: 'emerald',
    },
    {
      label: 'CPU Moyen',
      value: `${avgCpu}%`,
      change: '+5%',
      icon: Cpu,
      color: 'amber',
    },
    {
      label: 'Uptime Global',
      value: '99.9%',
      change: '+0.1%',
      icon: Activity,
      color: 'emerald',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {currentTime.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} - {currentTime.toLocaleTimeString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="metric-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{stat.value}</p>
                <p className={`text-sm mt-2 ${
                  stat.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.change} vs hier
                </p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row - Historique avec sélecteur de période */}
      {servers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <HistoryChart 
              serverId={servers[0].serverId} 
              metric="cpu"
              title="Utilisation CPU"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <HistoryChart 
              serverId={servers[0].serverId} 
              metric="ram"
              title="Utilisation RAM"
            />
          </motion.div>
        </div>
      )}

      {/* Servers & Sites Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Servers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">Serveurs</h3>
            <span className="status-badge status-online">
              {activeServers} actifs
            </span>
          </div>
          <div className="space-y-4">
            {servers.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Aucun serveur connecté
              </div>
            ) : (
              servers.map((server) => {
                const metrics = server.metrics;
                const cpu = metrics?.cpu?.usage || 0;
                const ram = metrics?.ram?.percent || 0;
                const disk = metrics?.disk?.[0]?.percent || 0;
                
                return (
                  <div 
                    key={server._id} 
                    onClick={() => navigate(`/servers/${server.serverId}`)}
                    className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          server.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'
                        } animate-pulse`}></div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{server.name || server.serverId}</span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {server.status === 'online' ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                          <Cpu className="w-3 h-3" />
                          CPU
                        </div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{cpu.toFixed(1)}%</div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 mt-1">
                          <div 
                            className={`h-1.5 rounded-full ${
                              cpu > 80 ? 'bg-red-500' : 
                              cpu > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${cpu}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                          <Activity className="w-3 h-3" />
                          RAM
                        </div>
                        <div className="text-sm font-semibold text-slate-900">{ram.toFixed(1)}%</div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 mt-1">
                          <div 
                            className={`h-1.5 rounded-full ${
                              ram > 80 ? 'bg-red-500' : 
                              ram > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${ram}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                          <HardDrive className="w-3 h-3" />
                          Disque
                        </div>
                        <div className="text-sm font-semibold text-slate-900">{disk.toFixed(1)}%</div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 mt-1">
                          <div 
                            className={`h-1.5 rounded-full ${
                              disk > 80 ? 'bg-red-500' : 
                              disk > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${disk}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Sites */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">Sites Web</h3>
            <span className={`status-badge ${
              sites.length - onlineSites > 0 ? 'status-warning' : 'status-online'
            }`}>
              {sites.length - onlineSites > 0 ? `${sites.length - onlineSites} hors ligne` : 'Tous en ligne'}
            </span>
          </div>
          <div className="space-y-3">
            {sites.map((site) => (
              <div 
                key={site.id} 
                onClick={() => navigate(`/sites/${site.id}`)}
                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-2 h-2 rounded-full ${
                      site.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{site.name}</div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Wifi className="w-3 h-3" />
                          {site.latency}ms
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {site.uptime}% uptime
                        </span>
                        {site.ssl?.valid && (
                          <span className={`flex items-center gap-1 ${
                            site.ssl.expiresIn > 30 ? 'text-emerald-600' : 
                            site.ssl.expiresIn > 7 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            <Lock className="w-3 h-3" />
                            SSL {site.ssl.expiresIn}j
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`status-badge ${
                    site.status === 'online' ? 'status-online' : 'status-offline'
                  }`}>
                    {site.status === 'online' ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Alerts */}
      {sites.some(s => s.status === 'offline') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900">Alerte : Site hors ligne</h4>
              <p className="text-sm text-red-700 mt-1">
                Le site autre-site.com est actuellement hors ligne. Dernière vérification il y a 2 minutes.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
