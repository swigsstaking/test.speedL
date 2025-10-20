import { Globe, TrendingUp, Wifi, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { monitoringApi } from '../services/api';

const Sites = () => {
  const navigate = useNavigate();
  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: monitoringApi.getSites,
    refetchInterval: 30000, // Refresh toutes les 30s
  });

  const sites = (sitesData?.data || []).map(site => ({
    ...site,
    requests: 125000, // TODO: À récupérer depuis analytics
    errors: site.status === 'online' ? 12 : 1250,
    sparkline: Array.from({ length: 10 }, () => site.latency + Math.random() * 10 - 5),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Sites Web</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitoring et performance de vos sites</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {sites.filter(s => s.status === 'online').length} / {sites.length} en ligne
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sites.map((site, index) => (
          <motion.div
            key={site.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  site.status === 'online' ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  <Globe className={`w-7 h-7 ${
                    site.status === 'online' ? 'text-emerald-600' : 'text-red-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{site.name}</h3>
                  <a 
                    href={site.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    {site.url}
                  </a>
                </div>
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

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Latency */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-600">Latence</span>
                </div>
                <div className={`text-2xl font-bold ${
                  site.latency === 0 ? 'text-red-600' : 
                  site.latency < 50 ? 'text-emerald-600' : 
                  site.latency < 100 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {site.latency}ms
                </div>
              </div>

              {/* Uptime */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-600">Uptime</span>
                </div>
                <div className={`text-2xl font-bold ${
                  site.uptime >= 99.9 ? 'text-emerald-600' : 
                  site.uptime >= 99 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {site.uptime}%
                </div>
              </div>

              {/* Requests */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Requêtes/24h</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {(site.requests / 1000).toFixed(0)}k
                </div>
              </div>

              {/* Errors */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Erreurs/24h</span>
                </div>
                <div className={`text-2xl font-bold ${
                  site.errors < 10 ? 'text-emerald-600' : 
                  site.errors < 100 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {site.errors}
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Performance (10 dernières minutes)</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Latence moyenne</p>
              </div>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={site.sparkline.map((v, i) => ({ value: v }))}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={site.status === 'online' ? '#10b981' : '#ef4444'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* SSL Status */}
                <div className={`flex items-center gap-2 text-sm ${
                  site.ssl?.valid ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {site.ssl?.valid ? (
                    <><CheckCircle className="w-4 h-4" /> SSL valide</>
                  ) : (
                    <><AlertCircle className="w-4 h-4" /> SSL invalide</>
                  )}
                </div>
                
                {/* SSL Expiration */}
                {site.ssl?.valid && site.ssl?.expiresIn !== undefined && (
                  <div className={`text-sm ${
                    site.ssl.expiresIn > 30 ? 'text-slate-600 dark:text-slate-400' : 
                    site.ssl.expiresIn > 7 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    Expire dans {site.ssl.expiresIn} jours
                  </div>
                )}
                
                {/* SSL Issuer */}
                {site.ssl?.issuer && (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Émetteur: {site.ssl.issuer}
                  </div>
                )}
                
                {/* Status Code */}
                {site.statusCode && (
                  <div className={`text-sm ${
                    site.statusCode >= 200 && site.statusCode < 300 ? 'text-emerald-600' :
                    site.statusCode >= 300 && site.statusCode < 400 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    HTTP {site.statusCode}
                  </div>
                )}
              </div>
              <button 
                onClick={() => navigate(`/sites/${site.id}`)}
                className="btn-secondary text-sm"
              >
                Voir détails
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Sites;
