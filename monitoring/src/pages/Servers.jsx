import { Server, Cpu, HardDrive, Activity, Wifi, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { monitoringApi } from '../services/api';

const Servers = () => {
  const { data: serversData } = useQuery({
    queryKey: ['servers'],
    queryFn: monitoringApi.getServers,
    refetchInterval: 10000,
  });

  const servers = serversData?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Serveurs</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Monitoring détaillé de vos serveurs</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {servers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            Aucun serveur connecté
          </div>
        ) : (
          servers.map((server, index) => {
            const metrics = server.metrics || {};
            const cpu = metrics.cpu || {};
            const ram = metrics.ram || {};
            const disk = metrics.disk?.[0] || {};
            const network = metrics.network || {};

            return (
              <motion.div
                key={server._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      server.status === 'online' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      <Server className={`w-8 h-8 ${
                        server.status === 'online' ? 'text-emerald-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{server.name || server.serverId}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{server.ip} • {server.location}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${
                    server.status === 'online' ? 'status-online' : 'status-offline'
                  }`}>
                    {server.status === 'online' ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CPU */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">CPU</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{(cpu.usage || 0).toFixed(1)}%</div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      (cpu.usage || 0) > 80 ? 'bg-red-500' : 
                      (cpu.usage || 0) > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${cpu.usage || 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{cpu.cores || 0} cœurs</p>
              </div>

              {/* RAM */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">RAM</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{(ram.percent || 0).toFixed(1)}%</div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      (ram.percent || 0) > 80 ? 'bg-red-500' : 
                      (ram.percent || 0) > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${ram.percent || 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{((ram.used || 0) / 1024 / 1024 / 1024).toFixed(1)}GB / {((ram.total || 0) / 1024 / 1024 / 1024).toFixed(1)}GB</p>
              </div>

              {/* Disk */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Disque</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{(disk.percent || 0).toFixed(1)}%</div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      (disk.percent || 0) > 80 ? 'bg-red-500' : 
                      (disk.percent || 0) > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${disk.percent || 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{((disk.used || 0) / 1024 / 1024 / 1024).toFixed(1)}GB / {((disk.total || 0) / 1024 / 1024 / 1024).toFixed(1)}GB</p>
              </div>

              {/* Network */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-3">
                  <Wifi className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Réseau</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>↓ Download</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{((network.rx || 0) / 1024 / 1024).toFixed(2)} MB/s</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-primary-500" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>↑ Upload</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{((network.tx || 0) / 1024 / 1024).toFixed(2)} MB/s</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                <span>Uptime: <span className="font-medium text-slate-900 dark:text-slate-100">En ligne</span></span>
              </div>
              <button className="btn-secondary text-sm">
                Voir détails
              </button>
            </div>
          </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Servers;
