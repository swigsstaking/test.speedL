import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Server, Cpu, Activity, HardDrive, Wifi, Clock, TrendingUp } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { monitoringApi } from '../services/api';
import DynamicLineChart from '../components/DynamicLineChart';

const ServerDetail = () => {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('24h');

  const { data: serversData } = useQuery({
    queryKey: ['servers'],
    queryFn: monitoringApi.getServers,
    refetchInterval: 10000,
  });

  // TODO: Récupérer l'historique depuis l'API
  const { data: historyData } = useQuery({
    queryKey: ['server-history', serverId, period],
    queryFn: () => monitoringApi.getServer(serverId, period),
    enabled: !!serverId,
    refetchInterval: 60000,
  });

  const server = serversData?.data?.find(s => s.serverId === serverId);
  const metrics = server?.metrics || {};
  const cpu = metrics.cpu || {};
  const ram = metrics.ram || {};
  const disk = metrics.disk?.[0] || {};
  const network = metrics.network || {};

  const periods = [
    { value: '1h', label: '1h' },
    { value: '24h', label: '24h' },
    { value: '7d', label: '7j' },
    { value: '30d', label: '30j' },
  ];

  if (!server) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">Serveur non trouvé</p>
      </div>
    );
  }

  // Utiliser uniquement les données réelles actuelles
  // Pas d'historique disponible pour l'instant
  const now = new Date();
  const cpuData = [{
    time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    value: cpu.usage || 0
  }];
  
  const ramData = [{
    time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    value: ram.percent || 0
  }];
  
  const diskData = [{
    time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    value: disk.percent || 0
  }];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/servers')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {server.name || server.serverId}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {server.ip} • {server.location}
          </p>
        </div>
        <span className={`status-badge ${
          server.status === 'online' ? 'status-online' : 'status-offline'
        }`}>
          {server.status === 'online' ? 'En ligne' : 'Hors ligne'}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* CPU */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="metric-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">CPU</span>
          </div>
          <div className={`text-3xl font-bold ${
            (cpu.usage || 0) > 80 ? 'text-red-600' : 
            (cpu.usage || 0) > 60 ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {(cpu.usage || 0).toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{cpu.cores || 0} cœurs</p>
        </motion.div>

        {/* RAM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="metric-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">RAM</span>
          </div>
          <div className={`text-3xl font-bold ${
            (ram.percent || 0) > 80 ? 'text-red-600' : 
            (ram.percent || 0) > 60 ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {(ram.percent || 0).toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {((ram.used || 0) / 1024 / 1024 / 1024).toFixed(1)}GB / {((ram.total || 0) / 1024 / 1024 / 1024).toFixed(1)}GB
          </p>
        </motion.div>

        {/* Disk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="metric-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Disque</span>
          </div>
          <div className={`text-3xl font-bold ${
            (disk.percent || 0) > 80 ? 'text-red-600' : 
            (disk.percent || 0) > 60 ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {(disk.percent || 0).toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {((disk.used || 0) / 1024 / 1024 / 1024).toFixed(1)}GB / {((disk.total || 0) / 1024 / 1024 / 1024).toFixed(1)}GB
          </p>
        </motion.div>

        {/* Network */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="metric-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Réseau</span>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              ↓ {((network.rx || 0) / 1024 / 1024).toFixed(2)} MB/s
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              ↑ {((network.tx || 0) / 1024 / 1024).toFixed(2)} MB/s
            </div>
          </div>
        </motion.div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Historique</h3>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">Utilisation CPU</h3>
          </div>
          <DynamicLineChart
            data={cpuData.length > 0 ? cpuData : [{ time: '00:00', value: 0 }]}
            dataKey="value"
            warningThreshold={60}
            dangerThreshold={80}
            yDomain={[0, 100]}
            unit="%"
            height={300}
          />
        </motion.div>

        {/* RAM Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">Utilisation RAM</h3>
          </div>
          <DynamicLineChart
            data={ramData.length > 0 ? ramData : [{ time: '00:00', value: 0 }]}
            dataKey="value"
            warningThreshold={60}
            dangerThreshold={80}
            yDomain={[0, 100]}
            unit="%"
            height={300}
          />
        </motion.div>

        {/* Disk Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">Utilisation Disque</h3>
          </div>
          <DynamicLineChart
            data={diskData.length > 0 ? diskData : [{ time: '00:00', value: 0 }]}
            dataKey="value"
            warningThreshold={70}
            dangerThreshold={85}
            yDomain={[0, 100]}
            unit="%"
            height={300}
          />
        </motion.div>

        {/* System Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">Informations Système</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
              <span className={`font-medium ${
                server.status === 'online' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {server.status === 'online' ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Serveur ID</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{server.serverId}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Adresse IP</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{server.ip || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Localisation</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{server.location || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Dernière mise à jour</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {new Date(server.lastSeen).toLocaleString('fr-FR')}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ServerDetail;
