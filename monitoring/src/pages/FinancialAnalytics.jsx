import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, TrendingUp, TrendingDown, Server, Globe, Edit2, Save, X, RefreshCw, Info, FileText, Calendar, CheckCircle, AlertCircle as AlertCircleIcon, Download, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { monitoringApi } from '../services/api';

const FinancialAnalytics = () => {
  const queryClient = useQueryClient();
  const [editingServer, setEditingServer] = useState(null);
  const [editingSite, setEditingSite] = useState(null);

  // Récupérer données financières
  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-analytics'],
    queryFn: monitoringApi.getFinancialAnalytics,
    refetchInterval: 60000,
  });

  // Récupérer la liste des serveurs
  const { data: serversData } = useQuery({
    queryKey: ['servers'],
    queryFn: monitoringApi.getServers,
    refetchInterval: 30000,
  });

  // Récupérer historique mensuel
  const { data: monthlyHistoryData } = useQuery({
    queryKey: ['monthly-history'],
    queryFn: () => monitoringApi.getMonthlyHistory(12),
    refetchInterval: 300000, // 5 minutes
  });

  // Récupérer prévisions
  const { data: forecastsData } = useQuery({
    queryKey: ['forecasts'],
    queryFn: () => monitoringApi.getForecasts(6),
    refetchInterval: 300000,
  });

  // Récupérer factures
  const now = new Date();
  const { data: invoicesData } = useQuery({
    queryKey: ['invoices', now.getFullYear(), now.getMonth() + 1],
    queryFn: () => monitoringApi.getInvoices({ year: now.getFullYear(), month: now.getMonth() + 1 }),
    refetchInterval: 60000,
  });

  const financial = financialData?.data || {};
  const summary = financial.summary || {};
  const serverCosts = financial.servers?.details || [];
  const serverProfitability = financial.servers?.profitability || [];
  const sites = financial.sites?.details || [];
  const monthlyHistory = monthlyHistoryData?.data || [];
  const forecasts = forecastsData?.data?.forecasts || [];
  const invoices = invoicesData?.data || [];

  // Fusionner serveurs avec leurs coûts
  const allServers = (serversData?.data || []).map(server => {
    const cost = serverCosts.find(c => c.serverId === server.serverId) || {
      serverId: server.serverId,
      baseCost: 0,
      electricityCost: 0,
      networkCost: 0,
      amortization: 0,
      otherCharges: 0,
      totalMonthly: 0,
      totalYearly: 0
    };
    return cost;
  });

  // Mutation pour mettre à jour coûts serveur
  const updateServerCostMutation = useMutation({
    mutationFn: ({ serverId, data }) => monitoringApi.updateServerCost(serverId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['financial-analytics']);
      setEditingServer(null);
    },
  });

  // Mutation pour mettre à jour pricing site
  const updateSitePricingMutation = useMutation({
    mutationFn: ({ siteId, data }) => monitoringApi.updateSitePricing(siteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['financial-analytics']);
      setEditingSite(null);
    },
  });

  // Mutation pour recalculer prix suggérés
  const recalculatePricesMutation = useMutation({
    mutationFn: monitoringApi.recalculatePrices,
    onSuccess: () => {
      queryClient.invalidateQueries(['financial-analytics']);
    },
  });

  // Données pour graphique évolution mensuelle
  const monthlyChartData = monthlyHistory.map(m => {
    const isCurrentMonth = m.year === now.getFullYear() && m.month === (now.getMonth() + 1);
    
    return {
      name: `${m.month}/${m.year}`,
      Revenus: m.totalRevenue || 0,
      Coûts: m.totalCosts || 0,
      Profit: m.totalProfit || 0,
      isCurrentMonth
    };
  });

  // Données pour graphique prévisions (historique + prévisions)
  const forecastChartData = [
    ...monthlyHistory.slice(-6).map(m => ({
      name: `${m.month}/${m.year}`,
      Revenus: m.totalRevenue || 0,
      Profit: m.totalProfit || 0,
      type: 'historique'
    })),
    ...forecasts.map(f => ({
      name: f.monthName,
      Revenus: f.revenue,
      Profit: f.profit,
      type: 'prévision',
      confidence: f.confidence
    }))
  ];

  // Mutation pour générer factures
  const generateInvoicesMutation = useMutation({
    mutationFn: ({ year, month }) => monitoringApi.generateInvoices(year, month),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
    },
  });

  // Mutation pour marquer facture payée
  const markPaidMutation = useMutation({
    mutationFn: ({ invoiceId, paymentData }) => monitoringApi.markInvoiceAsPaid(invoiceId, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
    },
  });

  // Mutation pour changer statut facture
  const changeStatusMutation = useMutation({
    mutationFn: ({ invoiceId, status }) => monitoringApi.changeInvoiceStatus(invoiceId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Analytics Financiers</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Vue d'ensemble des revenus, coûts et marges</p>
        </div>
        <button
          onClick={() => recalculatePricesMutation.mutate({ period: '30d', marginPercent: 20 })}
          disabled={recalculatePricesMutation.isPending}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${recalculatePricesMutation.isPending ? 'animate-spin' : ''}`} />
          {recalculatePricesMutation.isPending ? 'Calcul...' : 'Recalculer Prix'}
        </button>
      </div>

      {/* Note explicative */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <p className="font-medium mb-2">💡 Comment utiliser :</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Coûts Serveurs</strong> : Entre tous les coûts mensuels (location, électricité, réseau, amortissement, maintenance)</li>
              <li><strong>Prix Réel</strong> : Le montant facturé au client chaque mois</li>
              <li><strong>Coût Site</strong> : La part du serveur + ressources utilisées par ce site</li>
              <li><strong>Profit Global</strong> : Revenus totaux - Coûts serveurs totaux</li>
              <li><strong>Prix ajustés Suisse</strong> : +50-60% vs moyenne européenne (électricité, bande passante, stockage)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Revenus Mensuels</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {summary.monthlyRevenue?.toFixed(2) || '0.00'} CHF
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {(summary.monthlyRevenue * 12)?.toFixed(2) || '0.00'} CHF/an
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Coûts Mensuels</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {summary.monthlyCosts?.toFixed(2) || '0.00'} CHF
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {(summary.monthlyCosts * 12)?.toFixed(2) || '0.00'} CHF/an
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Profit Mensuel</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {summary.monthlyProfit?.toFixed(2) || '0.00'} CHF
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {(summary.monthlyProfit * 12)?.toFixed(2) || '0.00'} CHF/an
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              summary.profitMargin >= 30 ? 'bg-emerald-100 dark:bg-emerald-900/30' :
              summary.profitMargin >= 15 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <TrendingUp className={`w-6 h-6 ${
                summary.profitMargin >= 30 ? 'text-emerald-600' :
                summary.profitMargin >= 15 ? 'text-amber-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Marge Globale</p>
              <p className={`text-2xl font-bold ${
                summary.profitMargin >= 30 ? 'text-emerald-600' :
                summary.profitMargin >= 15 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {summary.profitMargin?.toFixed(1) || '0.0'}%
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Objectif: 30%+
          </p>
        </motion.div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution Mensuelle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
            Évolution Mensuelle (12 mois)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData} barGap={2} barCategoryGap="15%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                formatter={(value) => `${value.toFixed(2)} CHF`}
              />
              <Legend 
                iconType="square"
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Bar dataKey="Revenus" fill="#10b981" radius={[4, 4, 0, 0]}>
                {monthlyChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-rev-${index}`} 
                    fill={entry.isCurrentMonth ? 'url(#revenuePattern)' : '#10b981'} 
                  />
                ))}
              </Bar>
              <Bar dataKey="Coûts" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Profit" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {monthlyChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-profit-${index}`} 
                    fill={entry.isCurrentMonth ? 'url(#profitPattern)' : '#3b82f6'} 
                  />
                ))}
              </Bar>
              <defs>
                <pattern id="revenuePattern" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#10b981" strokeWidth="4" />
                </pattern>
                <pattern id="profitPattern" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#3b82f6" strokeWidth="4" />
                </pattern>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Rentabilité par Serveur */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Rentabilité par Serveur</h3>
          <div className="space-y-3">
            {serverProfitability.length > 0 ? (
              serverProfitability.map((server) => (
                <div key={server.serverId} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{server.serverId}</span>
                    <span className={`text-sm font-bold ${
                      server.profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {server.profit >= 0 ? '+' : ''}{server.profit.toFixed(2)} CHF
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <div>
                      <span className="block">Revenus</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{server.revenue.toFixed(2)} CHF</span>
                    </div>
                    <div>
                      <span className="block">Coûts</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{server.cost.toFixed(2)} CHF</span>
                    </div>
                    <div>
                      <span className="block">Sites</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{server.siteCount}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Marge</span>
                      <span className={`font-medium ${
                        server.margin >= 30 ? 'text-emerald-600' :
                        server.margin >= 15 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {server.margin.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          server.margin >= 30 ? 'bg-emerald-600' :
                          server.margin >= 15 ? 'bg-amber-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min(Math.max(server.margin, 0), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                Aucune donnée de rentabilité disponible
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Coûts Serveurs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Coûts Serveurs</h3>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total: <span className="font-bold text-slate-900 dark:text-slate-100">
              {financial.servers?.totalMonthlyCost?.toFixed(2) || '0.00'} CHF/mois
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Serveur</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap" title="Coût de base (location, hardware, etc.)">Coût Base</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap" title="Consommation électrique mensuelle">Électricité</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap" title="Bande passante et internet">Réseau</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap" title="Amortissement hardware sur durée de vie">Amortissement</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap" title="Autres charges (maintenance, licences, etc.)">Autres</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Total/mois</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Total/an</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allServers.map((server) => (
                <ServerCostRow
                  key={server.serverId}
                  server={server}
                  isEditing={editingServer === server.serverId}
                  onEdit={() => setEditingServer(server.serverId)}
                  onCancel={() => setEditingServer(null)}
                  onSave={(data) => updateServerCostMutation.mutate({ serverId: server.serverId, data })}
                />
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pricing Sites */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Pricing Sites</h3>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total: <span className="font-bold text-slate-900 dark:text-slate-100">
              {financial.sites?.totalMonthlyRevenue?.toFixed(2) || '0.00'} CHF/mois
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Site</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap" title="Serveur hébergeant ce site">Serveur</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap" title="Prix calculé automatiquement selon ressources (Suisse)">Prix Suggéré</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap" title="Prix facturé au client (CHF/mois)">Prix Réel</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap" title="Coût mensuel pour héberger ce site (part serveur + ressources)">Coût Site</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap" title="Prix Réel - Coût Site">Profit</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap" title="(Profit / Prix Réel) × 100">Marge %</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <SitePricingRow
                  key={site.siteId}
                  site={site}
                  allServers={allServers}
                  isEditing={editingSite === site.siteId}
                  onEdit={() => setEditingSite(site.siteId)}
                  onCancel={() => setEditingSite(null)}
                  onSave={(data) => updateSitePricingMutation.mutate({ siteId: site.siteId, data })}
                />
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Prévisions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Prévisions 6 Mois</h3>
          </div>
          {forecastsData?.data?.trend && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              forecastsData.data.trend === 'growing' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
              forecastsData.data.trend === 'declining' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
              'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {forecastsData.data.trend === 'growing' ? '📈 Croissance' :
               forecastsData.data.trend === 'declining' ? '📉 Déclin' : '➡️ Stable'}
            </div>
          )}
        </div>

        {forecasts.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={forecastChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '8px',
                    color: 'var(--tooltip-text)'
                  }}
                  formatter={(value, name, props) => {
                    const confidence = props.payload.confidence;
                    return [
                      `${value.toFixed(2)} CHF${confidence ? ` (${confidence}% confiance)` : ''}`,
                      name
                    ];
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Revenus" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray={(entry) => entry.type === 'prévision' ? '5 5' : '0'}
                />
                <Line 
                  type="monotone" 
                  dataKey="Profit" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  strokeDasharray={(entry) => entry.type === 'prévision' ? '5 5' : '0'}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {forecasts.slice(0, 3).map((forecast) => (
                <div key={`${forecast.year}-${forecast.month}`} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{forecast.monthName}</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{forecast.revenue.toFixed(0)} CHF</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Profit: <span className={forecast.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {forecast.profit >= 0 ? '+' : ''}{forecast.profit.toFixed(0)} CHF
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Confiance: {forecast.confidence}%
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
            Pas assez de données historiques pour générer des prévisions (minimum 3 mois)
          </p>
        )}
      </motion.div>

      {/* Facturation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Facturation</h3>
          </div>
          <button
            onClick={() => generateInvoicesMutation.mutate({ year: now.getFullYear(), month: now.getMonth() + 1 })}
            disabled={generateInvoicesMutation.isPending}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Calendar className="w-4 h-4" />
            {generateInvoicesMutation.isPending ? 'Génération...' : 'Générer Factures Mois'}
          </button>
        </div>

        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">N° Facture</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Site</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Période</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Montant HT</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">TVA</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Total TTC</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Statut</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4 font-mono text-sm text-slate-900 dark:text-slate-100">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">{invoice.siteName}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{invoice.period.month}/{invoice.period.year}</td>
                    <td className="py-3 px-4 text-right text-slate-900 dark:text-slate-100">{invoice.amount.toFixed(2)} CHF</td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">{invoice.taxAmount.toFixed(2)} CHF</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">{invoice.totalAmount.toFixed(2)} CHF</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                        invoice.status === 'sent' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        invoice.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {invoice.status === 'paid' ? '✓ Payée' :
                         invoice.status === 'sent' ? '📤 Envoyée' :
                         invoice.status === 'overdue' ? '⚠️ Retard' : '📝 Brouillon'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`https://monitoring.swigs.online/api/invoices/${invoice._id}/html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                          title="Voir facture"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <a
                          href={`https://monitoring.swigs.online/api/invoices/${invoice._id}/html`}
                          download={`${invoice.invoiceNumber}.html`}
                          className="p-1 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                          title="Télécharger"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        {invoice.status === 'paid' ? (
                          <button
                            onClick={() => changeStatusMutation.mutate({ 
                              invoiceId: invoice._id, 
                              status: 'sent'
                            })}
                            disabled={changeStatusMutation.isPending}
                            className="p-1 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded"
                            title="Marquer en attente"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => markPaidMutation.mutate({ 
                              invoiceId: invoice._id, 
                              paymentData: { paidDate: new Date() }
                            })}
                            disabled={markPaidMutation.isPending}
                            className="p-1 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded"
                            title="Marquer payée"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Aucune facture pour ce mois
            </p>
            <button
              onClick={() => generateInvoicesMutation.mutate({ year: now.getFullYear(), month: now.getMonth() + 1 })}
              disabled={generateInvoicesMutation.isPending}
              className="btn-primary"
            >
              Générer les factures
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Composant ligne serveur
const ServerCostRow = ({ server, isEditing, onEdit, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    baseCost: server.baseCost || 0,
    electricityCost: server.electricityCost || 0,
    networkCost: server.networkCost || 0,
    amortization: server.amortization || 0,
    otherCharges: server.otherCharges || 0,
  });

  if (isEditing) {
    return (
      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{server.serverId}</td>
        <td className="py-3 px-4 text-right">
          <input
            type="number"
            value={formData.baseCost}
            onChange={(e) => setFormData({ ...formData, baseCost: parseFloat(e.target.value) || 0 })}
            className="w-full max-w-[90px] px-2 py-1 text-sm text-right border rounded dark:bg-slate-800 dark:border-slate-600"
            step="0.01"
          />
        </td>
        <td className="py-3 px-4 text-right">
          <input
            type="number"
            value={formData.electricityCost}
            onChange={(e) => setFormData({ ...formData, electricityCost: parseFloat(e.target.value) || 0 })}
            className="w-full max-w-[90px] px-2 py-1 text-sm text-right border rounded dark:bg-slate-800 dark:border-slate-600"
            step="0.01"
          />
        </td>
        <td className="py-3 px-4 text-right">
          <input
            type="number"
            value={formData.networkCost}
            onChange={(e) => setFormData({ ...formData, networkCost: parseFloat(e.target.value) || 0 })}
            className="w-full max-w-[90px] px-2 py-1 text-sm text-right border rounded dark:bg-slate-800 dark:border-slate-600"
            step="0.01"
          />
        </td>
        <td className="py-3 px-4 text-right">
          <input
            type="number"
            value={formData.amortization}
            onChange={(e) => setFormData({ ...formData, amortization: parseFloat(e.target.value) || 0 })}
            className="w-full max-w-[90px] px-2 py-1 text-sm text-right border rounded dark:bg-slate-800 dark:border-slate-600"
            step="0.01"
          />
        </td>
        <td className="py-3 px-4 text-right">
          <input
            type="number"
            value={formData.otherCharges}
            onChange={(e) => setFormData({ ...formData, otherCharges: parseFloat(e.target.value) || 0 })}
            className="w-full max-w-[90px] px-2 py-1 text-sm text-right border rounded dark:bg-slate-800 dark:border-slate-600"
            step="0.01"
          />
        </td>
        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
          {(formData.baseCost + formData.electricityCost + formData.networkCost + formData.amortization + formData.otherCharges).toFixed(2)}
        </td>
        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
          {((formData.baseCost + formData.electricityCost + formData.networkCost + formData.amortization + formData.otherCharges) * 12).toFixed(2)}
        </td>
        <td className="py-3 px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => onSave(formData)} className="p-1 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded">
              <Save className="w-4 h-4" />
            </button>
            <button onClick={onCancel} className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{server.serverId}</td>
      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">{server.baseCost?.toFixed(2) || '0.00'}</td>
      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">{server.electricityCost?.toFixed(2) || '0.00'}</td>
      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">{server.networkCost?.toFixed(2) || '0.00'}</td>
      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">{server.amortization?.toFixed(2) || '0.00'}</td>
      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">{server.otherCharges?.toFixed(2) || '0.00'}</td>
      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">{server.totalMonthly?.toFixed(2) || '0.00'}</td>
      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">{server.totalYearly?.toFixed(2) || '0.00'}</td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-center">
          <button onClick={onEdit} className="p-1 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Composant ligne site
const SitePricingRow = ({ site, isEditing, onEdit, onCancel, onSave, allServers }) => {
  const [formData, setFormData] = useState({
    actualPrice: site.actualPrice || 0,
    monthlyCost: site.monthlyCost || 0,
    serverId: site.serverId || 'server-1',
  });
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (isEditing) {
    return (
      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{site.siteId}</td>
        <td className="py-3 px-4">
          <select
            value={formData.serverId}
            onChange={(e) => setFormData({ ...formData, serverId: e.target.value })}
            className="w-full px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-slate-600"
          >
            {allServers.map((server) => (
              <option key={server.serverId} value={server.serverId}>
                {server.serverId}
              </option>
            ))}
          </select>
        </td>
        <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">{site.suggestedPrice?.toFixed(2) || '0.00'}</td>
        <td className="py-3 px-4 text-right">
          <input
            type="number"
            value={formData.actualPrice}
            onChange={(e) => setFormData({ ...formData, actualPrice: parseFloat(e.target.value) || 0 })}
            className="w-full max-w-[100px] px-2 py-1 text-sm text-right border rounded dark:bg-slate-800 dark:border-slate-600"
            step="0.01"
          />
        </td>
        <td className="py-3 px-4 text-right">
          <input
            type="number"
            value={formData.monthlyCost}
            onChange={(e) => setFormData({ ...formData, monthlyCost: parseFloat(e.target.value) || 0 })}
            className="w-full max-w-[100px] px-2 py-1 text-sm text-right border rounded dark:bg-slate-800 dark:border-slate-600"
            step="0.01"
          />
        </td>
        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
          {(formData.actualPrice - formData.monthlyCost).toFixed(2)}
        </td>
        <td className="py-3 px-4 text-right font-bold">
          <span className={
            ((formData.actualPrice - formData.monthlyCost) / formData.actualPrice * 100) >= 30 ? 'text-emerald-600' :
            ((formData.actualPrice - formData.monthlyCost) / formData.actualPrice * 100) >= 15 ? 'text-amber-600' : 'text-red-600'
          }>
            {formData.actualPrice > 0 ? (((formData.actualPrice - formData.monthlyCost) / formData.actualPrice * 100).toFixed(1)) : '0.0'}%
          </span>
        </td>
        <td className="py-3 px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => onSave(formData)} className="p-1 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded">
              <Save className="w-4 h-4" />
            </button>
            <button onClick={onCancel} className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  const breakdown = site.suggestedBreakdown || {};

  return (
    <>
      <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{site.siteId}</td>
        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{site.serverId || 'server-1'}</td>
        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="text-slate-600 dark:text-slate-400">{site.suggestedPrice?.toFixed(2) || '0.00'}</span>
            {site.suggestedPrice > 0 && (
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                title="Voir détails"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">{site.actualPrice?.toFixed(2) || '0.00'}</td>
        <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">{site.monthlyCost?.toFixed(2) || '0.00'}</td>
        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">{site.monthlyProfit?.toFixed(2) || '0.00'}</td>
        <td className="py-3 px-4 text-right font-bold">
          <span className={
            site.profitMargin >= 30 ? 'text-emerald-600' :
            site.profitMargin >= 15 ? 'text-amber-600' : 'text-red-600'
          }>
            {site.profitMargin?.toFixed(1) || '0.0'}%
          </span>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center justify-center">
            <button onClick={onEdit} className="p-1 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {showBreakdown && (
        <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
          <td colSpan="8" className="py-3 px-4">
            <div className="text-sm">
              <div className="font-medium text-slate-700 dark:text-slate-300 mb-2">Détail du prix suggéré :</div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Part serveur:</span>
                  <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">{breakdown.serverShare?.toFixed(2) || '0.00'} CHF</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Bande passante:</span>
                  <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">{breakdown.bandwidth?.toFixed(2) || '0.00'} CHF</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Stockage:</span>
                  <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">{breakdown.storage?.toFixed(2) || '0.00'} CHF</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Requêtes:</span>
                  <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">{breakdown.requests?.toFixed(2) || '0.00'} CHF</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Marge:</span>
                  <span className="ml-2 font-medium text-emerald-600">{breakdown.margin || 20}%</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default FinancialAnalytics;
