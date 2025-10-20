import { DollarSign, TrendingUp, Package, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const Analytics = () => {
  const costData = [
    { site: 'speedl', cpu: 2.5, ram: 1.8, bandwidth: 3.2, storage: 0.8, total: 8.3 },
    { site: 'admin', cpu: 0.8, ram: 0.5, bandwidth: 0.9, storage: 0.3, total: 2.5 },
    { site: 'autre', cpu: 0, ram: 0, bandwidth: 0, storage: 0.2, total: 0.2 },
  ];

  const resourceData = [
    { name: 'CPU', value: 45, color: '#0ea5e9' },
    { name: 'RAM', value: 62, color: '#10b981' },
    { name: 'Disque', value: 38, color: '#f59e0b' },
    { name: 'Réseau', value: 28, color: '#8b5cf6' },
  ];

  const monthlyTrend = [
    { month: 'Jan', cost: 8.5 },
    { month: 'Fév', cost: 9.2 },
    { month: 'Mar', cost: 8.8 },
    { month: 'Avr', cost: 10.1 },
    { month: 'Mai', cost: 11.0 },
    { month: 'Juin', cost: 10.8 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Analytics & Coûts</h2>
        <p className="text-slate-500 mt-1">Analyse des coûts et consommation par site</p>
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
              <p className="text-sm text-slate-500 font-medium">Coût Total/Mois</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">11.00€</p>
              <p className="text-sm text-emerald-600 mt-2">-8% vs mois dernier</p>
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
              <p className="text-sm text-slate-500 font-medium">Coût/Site Moyen</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">3.67€</p>
              <p className="text-sm text-slate-600 mt-2">3 sites actifs</p>
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
              <p className="text-sm text-slate-500 font-medium">Économies</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">-0.88€</p>
              <p className="text-sm text-emerald-600 mt-2">vs mois dernier</p>
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
              <p className="text-sm text-slate-500 font-medium">Efficacité</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">92%</p>
              <p className="text-sm text-emerald-600 mt-2">+3% vs mois dernier</p>
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
            <span className="text-sm text-slate-500">Répartition mensuelle</span>
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
                formatter={(value) => `${value}€`}
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
            <span className="text-sm text-slate-500">Utilisation globale</span>
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
                <span className="text-sm text-slate-600">{item.name}</span>
                <span className="text-sm font-semibold text-slate-900 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

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
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Site</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">CPU</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">RAM</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Bande passante</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Stockage</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {costData.map((site) => (
                <tr key={site.site} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-medium text-slate-900">{site.site}.swigs.online</td>
                  <td className="py-3 px-4 text-sm text-right text-slate-600">{site.cpu}€</td>
                  <td className="py-3 px-4 text-sm text-right text-slate-600">{site.ram}€</td>
                  <td className="py-3 px-4 text-sm text-right text-slate-600">{site.bandwidth}€</td>
                  <td className="py-3 px-4 text-sm text-right text-slate-600">{site.storage}€</td>
                  <td className="py-3 px-4 text-sm text-right font-semibold text-slate-900">{site.total}€</td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-semibold">
                <td className="py-3 px-4 text-sm text-slate-900">Total</td>
                <td className="py-3 px-4 text-sm text-right text-slate-900">
                  {costData.reduce((sum, s) => sum + s.cpu, 0).toFixed(1)}€
                </td>
                <td className="py-3 px-4 text-sm text-right text-slate-900">
                  {costData.reduce((sum, s) => sum + s.ram, 0).toFixed(1)}€
                </td>
                <td className="py-3 px-4 text-sm text-right text-slate-900">
                  {costData.reduce((sum, s) => sum + s.bandwidth, 0).toFixed(1)}€
                </td>
                <td className="py-3 px-4 text-sm text-right text-slate-900">
                  {costData.reduce((sum, s) => sum + s.storage, 0).toFixed(1)}€
                </td>
                <td className="py-3 px-4 text-sm text-right text-primary-600 font-bold">
                  {costData.reduce((sum, s) => sum + s.total, 0).toFixed(1)}€
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
