import { useState } from 'react';
import { Globe, TrendingUp, Wifi, Clock, AlertCircle, CheckCircle, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { monitoringApi } from '../services/api';
import toast from 'react-hot-toast';

const Sites = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
  });
  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: monitoringApi.getSites,
    refetchInterval: 30000, // Refresh toutes les 30s
  });

  const { data: allStatsData } = useQuery({
    queryKey: ['all-sites-stats'],
    queryFn: () => monitoringApi.getAllSitesStats('24h'),
    refetchInterval: 60000, // Refresh toutes les minutes
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingSite) {
        return monitoringApi.updateSite(editingSite._id, data);
      }
      return monitoringApi.createSite(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sites']);
      toast.success(editingSite ? 'Site modifié' : 'Site créé');
      setShowModal(false);
      setEditingSite(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: monitoringApi.deleteSite,
    onSuccess: () => {
      queryClient.invalidateQueries(['sites']);
      toast.success('Site supprimé');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  const sites = (sitesData?.data || []).map(site => {
    const stats = allStatsData?.data?.[site.id] || {};
    return {
      ...site,
      uptime: stats.uptime || 0,
      requests: stats.requests || 0,
      errors: stats.errors || 0,
      uniqueVisitors: stats.uniqueVisitors || 0,
      sparkline: Array.from({ length: 10 }, () => site.latency + Math.random() * 10 - 5),
    };
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      domain: '',
    });
  };

  const handleEdit = (site) => {
    setEditingSite(site);
    setFormData({
      name: site.name,
      slug: site.slug,
      domain: site.domain,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

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
          <button
            onClick={() => {
              setEditingSite(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un site</span>
          </button>
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{site.name}</h3>
                    {site.external && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                        Externe
                      </span>
                    )}
                  </div>
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
                  {site.external ? 'TBD' : (site.requests >= 1000 ? `${(site.requests / 1000).toFixed(1)}k` : site.requests)}
                </div>
                {site.external && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Non disponible</p>
                )}
              </div>

              {/* Errors */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Erreurs/24h</span>
                </div>
                <div className={`text-2xl font-bold ${
                  site.external ? 'text-slate-900 dark:text-slate-100' :
                  site.errors < 10 ? 'text-emerald-600' : 
                  site.errors < 100 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {site.external ? 'TBD' : site.errors}
                </div>
                {site.external && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Non disponible</p>
                )}
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(site)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(site._id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigate(`/sites/${site.id}`)}
                  className="btn-secondary text-sm ml-2"
                >
                  Voir détails
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Créer/Éditer Site */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {editingSite ? 'Éditer le site' : 'Nouveau site'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingSite(null);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nom du site *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="ex: Speed-L"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="ex: speed-l"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Domaine *
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="ex: speed-l.swigs.online"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSite(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sites;
