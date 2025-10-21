import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Globe, Wifi, TrendingUp, Clock, AlertCircle, CheckCircle, Shield, Calendar, Zap, RefreshCw } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { monitoringApi } from '../services/api';
import DynamicLineChart from '../components/DynamicLineChart';

const SiteDetail = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('24h');

  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: monitoringApi.getSites,
    refetchInterval: 30000,
  });

  const { data: siteHistoryData } = useQuery({
    queryKey: ['site-history', siteId, period],
    queryFn: () => monitoringApi.getSite(siteId, period),
    enabled: !!siteId,
    refetchInterval: 60000,
  });

  const { data: pageSpeedData, refetch: refetchPageSpeed } = useQuery({
    queryKey: ['pagespeed', siteId],
    queryFn: () => monitoringApi.getPageSpeedHistory(siteId, '7d', 'mobile'),
    enabled: !!siteId,
    refetchInterval: 300000, // 5 minutes
  });

  const measurePageSpeedMutation = useMutation({
    mutationFn: (strategy) => monitoringApi.measurePageSpeed(siteId, strategy),
    onSuccess: (data) => {
      console.log('✅ PageSpeed mesure réussie:', data);
      refetchPageSpeed();
    },
    onError: (error) => {
      console.error('❌ Erreur PageSpeed:', error);
      alert(`Erreur lors de la mesure: ${error.message}`);
    }
  });

  const site = sitesData?.data?.find(s => s.id === siteId);
  const pageSpeed = pageSpeedData?.data?.latest;

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

  // Transformer les données d'historique pour les graphiques
  const historyData = siteHistoryData?.data?.metrics?.map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      ...(period === '7d' || period === '30d' ? { day: '2-digit', month: '2-digit' } : {})
    }),
    latency: m.latency || 0,
    uptime: m.status === 'online' ? 100 : 0,
  })) || [];

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

      {/* PageSpeed Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="card-title">Performance Réelle (PageSpeed)</h3>
          </div>
          <button
            onClick={() => {
              console.log('🔍 Lancement mesure PageSpeed pour:', siteId);
              measurePageSpeedMutation.mutate('mobile');
            }}
            disabled={measurePageSpeedMutation.isPending}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${measurePageSpeedMutation.isPending ? 'animate-spin' : ''}`} />
            {measurePageSpeedMutation.isPending ? 'Mesure en cours...' : 'Mesurer'}
          </button>
        </div>
        
        {pageSpeed ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Score Global */}
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className={`text-4xl font-bold ${
                pageSpeed.performanceScore >= 90 ? 'text-emerald-600' :
                pageSpeed.performanceScore >= 50 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {pageSpeed.performanceScore}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Score</div>
            </div>
            
            {/* Temps de chargement */}
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className={`text-2xl font-bold ${
                pageSpeed.loadTime <= 2 ? 'text-emerald-600' :
                pageSpeed.loadTime <= 3 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {pageSpeed.loadTime.toFixed(2)}s
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Chargement</div>
            </div>
            
            {/* LCP */}
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className={`text-2xl font-bold ${
                pageSpeed.lcp <= 2500 ? 'text-emerald-600' :
                pageSpeed.lcp <= 4000 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {(pageSpeed.lcp / 1000).toFixed(1)}s
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">LCP</div>
            </div>
            
            {/* FID */}
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className={`text-2xl font-bold ${
                pageSpeed.fid <= 100 ? 'text-emerald-600' :
                pageSpeed.fid <= 300 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {pageSpeed.fid}ms
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">FID</div>
            </div>
            
            {/* CLS */}
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className={`text-2xl font-bold ${
                pageSpeed.cls <= 0.1 ? 'text-emerald-600' :
                pageSpeed.cls <= 0.25 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {pageSpeed.cls}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">CLS</div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Dernière mesure : {new Date(pageSpeed.timestamp).toLocaleString('fr-FR')} • Mobile
          </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Aucune mesure disponible. Cliquez sur "Mesurer" pour analyser les performances réelles de ce site.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              La mesure prend environ 30 secondes et utilise Google PageSpeed Insights.
            </p>
          </div>
        )}
      </motion.div>

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
          <DynamicLineChart
            data={historyData}
            dataKey="latency"
            warningThreshold={100}
            dangerThreshold={200}
            yDomain={[0, 'auto']}
            unit="ms"
            height={300}
          />
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
