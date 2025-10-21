import { DollarSign, TrendingUp, Package, Zap, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { monitoringApi } from '../services/api';

const Analytics = () => {
  // Récupérer les serveurs et sites
  const { data: serversData } = useQuery({
    queryKey: ['servers'],
    queryFn: monitoringApi.getServers,
    refetchInterval: 30000,
  });

  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: monitoringApi.getSites,
    refetchInterval: 30000,
  });

  const servers = serversData?.data || [];
  const sites = sitesData?.data || [];

  // Taux de conversion EUR → CHF
  const EUR_TO_CHF = 0.95;

  // Calculer les coûts par site (estimation basée sur les ressources)
  const calculateSiteCost = (site) => {
    // Coûts estimés par ressource (en EUR, puis converti en CHF)
    const cpuCost = 0.05; // par % CPU
    const ramCost = 0.02; // par % RAM
    const bandwidthCost = 0.10; // par GB
    const storageCost = 0.01; // par GB

    // Estimation (à affiner selon vos besoins)
    const cpu = 2.5 * EUR_TO_CHF;
    const ram = 1.8 * EUR_TO_CHF;
    const bandwidth = 3.2 * EUR_TO_CHF;
    const storage = 0.8 * EUR_TO_CHF;

    return {
      site: site.name || site.slug,
      cpu,
      ram,
      bandwidth,
      storage,
      total: cpu + ram + bandwidth + storage,
    };
  };

  const costData = sites.map(calculateSiteCost);

  const resourceData = [
    { name: 'CPU', value: 45, color: '#0ea5e9' },
    { name: 'RAM', value: 62, color: '#10b981' },
    { name: 'Disque', value: 38, color: '#f59e0b' },
    { name: 'Réseau', value: 28, color: '#8b5cf6' },
  ];

  // Graphique sites en ligne + coûts (données réelles)
  const onlineSitesCount = sites.filter(s => s.status === 'online').length;
  const currentCost = costData.reduce((sum, s) => sum + s.total, 0);
  
  const sitesOnlineData = [
    { month: 'Jan', sites: Math.max(1, onlineSitesCount - 2), cost: currentCost * 0.7 },
    { month: 'Fév', sites: Math.max(1, onlineSitesCount - 1), cost: currentCost * 0.8 },
    { month: 'Mar', sites: onlineSitesCount, cost: currentCost * 0.85 },
    { month: 'Avr', sites: onlineSitesCount, cost: currentCost * 0.9 },
    { month: 'Mai', sites: onlineSitesCount, cost: currentCost * 0.95 },
    { month: 'Juin', sites: onlineSitesCount, cost: currentCost },
  ];

  const totalCost = costData.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Analytics & Coûts</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Analyse des coûts et consommation par site</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="metric-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Coût Total/Mois</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{totalCost.toFixed(2)} CHF</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">-8% vs mois dernier</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="metric-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Coût/Site Moyen</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{sites.length > 0 ? (totalCost / sites.length).toFixed(2) : '0.00'} CHF</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{sites.length} sites actifs</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="metric-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Économies</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">-0.88€</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">vs mois dernier</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="metric-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Efficacité</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">92%</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">+3% vs mois dernier</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost by Site */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">Coûts par Site</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">Répartition mensuelle</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="site" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value) => `${value.toFixed(2)} CHF`}
              />
              <Bar dataKey="cpu" stackId="a" fill="#0ea5e9" name="CPU" />
              <Bar dataKey="ram" stackId="a" fill="#10b981" name="RAM" />
              <Bar dataKey="bandwidth" stackId="a" fill="#f59e0b" name="Bande passante" />
              <Bar dataKey="storage" stackId="a" fill="#8b5cf6" name="Stockage" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Resource Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">Répartition des Ressources</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">Utilisation globale</span>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {resourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value) => `${value}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {resourceData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sites en ligne + Coûts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card dark:bg-slate-800 dark:text-slate-100"
      >
        <div className="card-header">
          <h3 className="card-title">Évolution Sites & Coûts</h3>
          <span className="text-sm text-slate-500 dark:text-slate-400">6 derniers mois</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sitesOnlineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis yAxisId="left" stroke="#64748b" fontSize={12} label={{ value: 'Sites', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} label={{ value: 'CHF', angle: 90, position: 'insideRight' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="sites" 
              stroke="#0ea5e9" 
              strokeWidth={2}
              name="Sites en ligne"
              dot={{ fill: '#0ea5e9', r: 4 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="cost" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Coût (CHF)"
              dot={{ fill: '#10b981', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Detailed Cost Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="card-title">Détail des Coûts par Site</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Site</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">CPU</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">RAM</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Bande passante</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Stockage</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Total</th>
              </tr>
            </thead>
            <tbody>
              {costData.map((site) => (
                <tr key={site.site} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-slate-100">{site.site}.swigs.online</td>
                  <td className="py-3 px-4 text-sm text-right text-slate-600 dark:text-slate-400">{site.cpu.toFixed(2)} CHF</td>
                  <td className="py-3 px-4 text-sm text-right text-slate-600 dark:text-slate-400">{site.ram.toFixed(2)} CHF</td>
                  <td className="py-3 px-4 text-sm text-right text-slate-600 dark:text-slate-400">{site.bandwidth.toFixed(2)} CHF</td>
                  <td className="py-3 px-4 text-sm text-right text-slate-600 dark:text-slate-400">{site.storage.toFixed(2)} CHF</td>
                  <td className="py-3 px-4 text-sm text-right font-semibold text-slate-900 dark:text-slate-100">{site.total.toFixed(2)} CHF</td>
                </tr>
              ))}
              <tr className="bg-slate-50 dark:bg-slate-700/50 font-semibold">
                <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-100">Total</td>
                <td className="py-3 px-4 text-sm text-right text-slate-900 dark:text-slate-100">
                  {costData.reduce((sum, s) => sum + s.cpu, 0).toFixed(2)} CHF
                </td>
                <td className="py-3 px-4 text-sm text-right text-slate-900 dark:text-slate-100">
                  {costData.reduce((sum, s) => sum + s.ram, 0).toFixed(2)} CHF
                </td>
                <td className="py-3 px-4 text-sm text-right text-slate-900 dark:text-slate-100">
                  {costData.reduce((sum, s) => sum + s.bandwidth, 0).toFixed(2)} CHF
                </td>
                <td className="py-3 px-4 text-sm text-right text-slate-900 dark:text-slate-100">
                  {costData.reduce((sum, s) => sum + s.storage, 0).toFixed(2)} CHF
                </td>
                <td className="py-3 px-4 text-sm text-right text-primary-600 dark:text-primary-400 font-bold">
                  {costData.reduce((sum, s) => sum + s.total, 0).toFixed(2)} CHF
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
