import { Server, Cpu, HardDrive, Activity, Wifi, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Servers = () => {
  const servers = [
    {
      id: 1,
      name: 'Production Server 1',
      ip: '192.168.1.100',
      location: 'Paris, France',
      cpu: { usage: 45, cores: 8 },
      ram: { used: 12, total: 16, percent: 75 },
      disk: { used: 250, total: 500, percent: 50 },
      network: { in: 125, out: 89 },
      uptime: '45 jours 12h',
      status: 'online',
    },
    {
      id: 2,
      name: 'Production Server 2',
      ip: '192.168.1.101',
      location: 'Amsterdam, NL',
      cpu: { usage: 78, cores: 8 },
      ram: { used: 14, total: 16, percent: 87 },
      disk: { used: 380, total: 500, percent: 76 },
      network: { in: 245, out: 178 },
      uptime: '32 jours 8h',
      status: 'warning',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Serveurs</h2>
        <p className="text-slate-500 mt-1">Monitoring détaillé de vos serveurs</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {servers.map((server, index) => (
          <motion.div
            key={server.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  server.status === 'online' ? 'bg-emerald-100' : 'bg-amber-100'
                }`}>
                  <Server className={`w-8 h-8 ${
                    server.status === 'online' ? 'text-emerald-600' : 'text-amber-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{server.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{server.ip} • {server.location}</p>
                </div>
              </div>
              <span className={`status-badge ${
                server.status === 'online' ? 'status-online' : 'status-warning'
              }`}>
                {server.status === 'online' ? 'En ligne' : 'Attention'}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CPU */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-slate-700">CPU</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-2">{server.cpu.usage}%</div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      server.cpu.usage > 80 ? 'bg-red-500' : 
                      server.cpu.usage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${server.cpu.usage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500">{server.cpu.cores} cœurs</p>
              </div>

              {/* RAM */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-slate-700">RAM</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-2">{server.ram.percent}%</div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      server.ram.percent > 80 ? 'bg-red-500' : 
                      server.ram.percent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${server.ram.percent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500">{server.ram.used}GB / {server.ram.total}GB</p>
              </div>

              {/* Disk */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-slate-700">Disque</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-2">{server.disk.percent}%</div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      server.disk.percent > 80 ? 'bg-red-500' : 
                      server.disk.percent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${server.disk.percent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500">{server.disk.used}GB / {server.disk.total}GB</p>
              </div>

              {/* Network */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Wifi className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-slate-700">Réseau</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>↓ Download</span>
                      <span className="font-medium text-slate-900">{server.network.in} MB/s</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-primary-500" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>↑ Upload</span>
                      <span className="font-medium text-slate-900">{server.network.out} MB/s</span>
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
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>Uptime: <span className="font-medium text-slate-900">{server.uptime}</span></span>
              </div>
              <button className="btn-secondary text-sm">
                Voir détails
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Servers;
