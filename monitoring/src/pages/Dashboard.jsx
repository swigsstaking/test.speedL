import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Server, Globe, Activity, TrendingUp, Cpu, HardDrive, Wifi, AlertCircle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { monitoringApi } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

const Dashboard = () => {
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

  // Données pour les graphiques (placeholder pour l'instant)
  const mockCpuData = Array.from({ length: 20 }, (_, i) => ({
    time: `${i}:00`,
    value: Math.random() * 100,
  }));

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
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500 mt-1">
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
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                <p className={`text-sm mt-2 ${
                  stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">Utilisation CPU (Temps Réel)</h3>
            <span className="text-sm text-slate-500">Dernières 20 min</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockCpuData}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                fill="url(#colorCpu)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* RAM Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">Utilisation RAM (Temps Réel)</h3>
            <span className="text-sm text-slate-500">Dernières 20 min</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockCpuData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

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
              <div className="text-center py-8 text-slate-500">
                Aucun serveur connecté
              </div>
            ) : (
              servers.map((server) => {
                const metrics = server.metrics;
                const cpu = metrics?.cpu?.usage || 0;
                const ram = metrics?.ram?.percent || 0;
                const disk = metrics?.disk?.[0]?.percent || 0;
                
                return (
                  <div key={server._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          server.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'
                        } animate-pulse`}></div>
                        <span className="font-medium text-slate-900">{server.name || server.serverId}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {server.status === 'online' ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                          <Cpu className="w-3 h-3" />
                          CPU
                        </div>
                        <div className="text-sm font-semibold text-slate-900">{cpu.toFixed(1)}%</div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
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
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
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
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
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
              <div key={site.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-2 h-2 rounded-full ${
                      site.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{site.name}</div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Wifi className="w-3 h-3" />
                          {site.latency}ms
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {site.uptime}% uptime
                        </span>
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
