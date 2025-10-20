import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Globe, Wifi, TrendingUp, Clock, AlertCircle, CheckCircle, Shield, Calendar } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { monitoringApi } from '../services/api';

const SiteDetail = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('24h');

  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: monitoringApi.getSites,
    refetchInterval: 30000,
  });

  const site = sitesData?.data?.find(s => s.id === siteId);

  const periods = [
    { value: '1h', label: '1h', points: 12 },
    { value: '24h', label: '24h', points: 24 },
    { value: '7d', label: '7j', points: 7 * 24 },
    { value: '30d', label: '30j', points: 30 },
  ];

  const selectedPeriod = periods.find(p => p.value === period);

  if (!site) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">Site non trouvé</p>
      </div>
    );
  }

  // Générer données historiques selon la période
  const historyData = Array.from({ length: selectedPeriod.points }, (_, i) => {
    const date = new Date();
    
    if (period === '1h') {
      date.setMinutes(date.getMinutes() - (selectedPeriod.points - 1 - i) * 5);
    } else if (period === '24h') {
      date.setHours(date.getHours() - (selectedPeriod.points - 1 - i));
    } else if (period === '7d') {
      date.setHours(date.getHours() - (selectedPeriod.points - 1 - i));
    } else if (period === '30d') {
      date.setDate(date.getDate() - (selectedPeriod.points - 1 - i));
    }
    
    return {
      time: period === '30d' 
        ? date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
        : date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      latency: site.latency + Math.random() * 20 - 10,
      uptime: site.status === 'online' ? 98 + Math.random() * 2 : Math.random() * 100,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/sites')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{site.name}</h2>
          <a 
            href={site.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 hover:underline mt-1 inline-block"
          >
            {site.url}
          </a>
        </div>
        <span className={`status-badge ${
          site.status === 'online' ? 'status-online' : 'status-offline'
        }`}>
          {site.status === 'online' ? (
            <><CheckCircle className="w-4 h-4" /> En ligne</>
          ) : (
            <><AlertCircle className="w-4 h-4" /> Hors ligne</>
          )}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="metric-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Latence</span>
          </div>
          <div className={`text-3xl font-bold ${
            site.latency < 50 ? 'text-emerald-600' : 
            site.latency < 100 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {site.latency}ms
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Temps de réponse moyen</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="metric-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Uptime</span>
          </div>
          <div className="text-3xl font-bold text-emerald-600">
            {site.uptime}%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Disponibilité 30 jours</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="metric-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Requêtes</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            0
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">TODO: Logs Nginx</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="metric-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Erreurs</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            0
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Dernières 24h</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">Latence</h3>
            <div className="flex gap-2">
              {periods.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    period === p.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
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
                }}
                formatter={(value) => `${value.toFixed(0)}ms`}
              />
              <Area 
                type="monotone" 
                dataKey="latency" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                fill="url(#colorLatency)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Uptime Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">Disponibilité</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">Uptime {period}</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
                formatter={(value) => `${value.toFixed(1)}%`}
              />
              <Line 
                type="monotone" 
                dataKey="uptime" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* SSL & Security Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="card-title">Sécurité & Certificat SSL</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SSL Status */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                site.ssl?.valid ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                <Shield className={`w-6 h-6 ${
                  site.ssl?.valid ? 'text-emerald-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  {site.ssl?.valid ? 'Certificat SSL Valide' : 'Certificat SSL Invalide'}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {site.ssl?.valid ? 'Connexion sécurisée' : 'Connexion non sécurisée'}
                </p>
              </div>
            </div>

            {site.ssl?.valid && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Émetteur</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {site.ssl.issuer || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Expire dans</span>
                  <span className={`font-medium ${
                    site.ssl.expiresIn > 30 ? 'text-emerald-600' : 
                    site.ssl.expiresIn > 7 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {site.ssl.expiresIn} jours
                  </span>
                </div>
                {site.ssl.expiryDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Date d'expiration</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {new Date(site.ssl.expiryDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                {site.ssl.subject && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Sujet</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {site.ssl.subject}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* HTTP Status */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                site.statusCode >= 200 && site.statusCode < 300 ? 'bg-emerald-100' : 'bg-amber-100'
              }`}>
                <Globe className={`w-6 h-6 ${
                  site.statusCode >= 200 && site.statusCode < 300 ? 'text-emerald-600' : 'text-amber-600'
                }`} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  HTTP {site.statusCode || 200}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {site.statusCode >= 200 && site.statusCode < 300 ? 'Réponse OK' : 
                   site.statusCode >= 300 && site.statusCode < 400 ? 'Redirection' : 'Erreur'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">URL</span>
                <a 
                  href={site.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-primary-600 hover:underline truncate max-w-[200px]"
                >
                  {site.url}
                </a>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Dernière vérification</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  Il y a quelques secondes
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SiteDetail;
