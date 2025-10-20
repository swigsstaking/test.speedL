import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Globe, Wifi, TrendingUp, Clock, AlertCircle, CheckCircle, Shield, Calendar } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { monitoringApi } from '../services/api';

const SiteDetail = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();

  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: monitoringApi.getSites,
    refetchInterval: 30000,
  });

  const site = sitesData?.data?.find(s => s.id === siteId);

  if (!site) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">Site non trouvé</p>
      </div>
    );
  }

  // Générer données historiques (24h)
  const last24h = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date();
    hour.setHours(hour.getHours() - (23 - i));
    return {
      time: hour.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      latency: site.latency + Math.random() * 20 - 10,
      uptime: site.status === 'online' ? 100 : Math.random() * 100,
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
            125k
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Dernières 24h</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="metric-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Erreurs</span>
          </div>
          <div className="text-3xl font-bold text-red-600">
            {site.status === 'online' ? 12 : 1250}
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
            <h3 className="card-title">Latence (24h)</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">Temps de réponse</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={last24h}>
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
            <h3 className="card-title">Disponibilité (24h)</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">Uptime</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last24h}>
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
