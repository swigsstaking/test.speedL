import { Server, Cpu, HardDrive, Activity, Wifi, Clock, Plus, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { monitoringApi } from '../services/api';

const Servers = () => {
  const navigate = useNavigate();
  const [showSetupModal, setShowSetupModal] = useState(false);
  
  const { data: serversData } = useQuery({
    queryKey: ['servers'],
    queryFn: monitoringApi.getServers,
    refetchInterval: 10000,
  });

  const servers = serversData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Serveurs</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitoring détaillé de vos serveurs</p>
        </div>
        <button
          onClick={() => setShowSetupModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Configurer nouveau serveur
        </button>
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
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">↓ Download</span>
                      <span className="text-sm font-bold text-emerald-600">{((network.rx || 0) / 1024 / 1024).toFixed(2)} MB/s</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">↑ Upload</span>
                      <span className="text-sm font-bold text-blue-600">{((network.tx || 0) / 1024 / 1024).toFixed(2)} MB/s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                <span>Uptime: <span className="font-medium text-slate-900 dark:text-slate-100">En ligne</span></span>
              </div>
              <button 
                onClick={() => navigate(`/servers/${server.serverId}`)}
                className="btn-secondary text-sm"
              >
                Voir détails
              </button>
            </div>
          </motion.div>
            );
          })
        )}
      </div>

      {/* Modal Configuration Nouveau Serveur */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSetupModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Terminal className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Configurer un Nouveau Serveur</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Installation automatique en une commande</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSetupModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Étape 1 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">1</div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Connectez-vous à votre serveur</h4>
                </div>
                <div className="ml-10 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg font-mono text-sm">
                  <code className="text-slate-900 dark:text-slate-100">ssh root@votre-serveur.com</code>
                </div>
              </div>

              {/* Étape 2 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">2</div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Exécutez la commande d'installation</h4>
                </div>
                <div className="ml-10 space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Cette commande va installer automatiquement toutes les dépendances et configurer le monitoring :
                  </p>
                  <div className="relative">
                    <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-lg font-mono text-sm text-emerald-400 overflow-x-auto">
                      <code>curl -fsSL https://raw.githubusercontent.com/swigsstaking/test.speedL/main/install-server.sh | sudo bash</code>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('curl -fsSL https://raw.githubusercontent.com/swigsstaking/test.speedL/main/install-server.sh | sudo bash');
                      }}
                      className="absolute top-2 right-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
                    >
                      Copier
                    </button>
                  </div>
                </div>
              </div>

              {/* Étape 3 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">3</div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Suivez les instructions</h4>
                </div>
                <div className="ml-10 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <p>Le script va vous demander :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>L'ID du serveur (ex: <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">server-2</code>)</li>
                  </ul>
                </div>
              </div>

              {/* Étape 4 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">✓</div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">C'est terminé !</h4>
                </div>
                <div className="ml-10 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <p>Le serveur va automatiquement :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Installer Node.js, PM2, Nginx</li>
                    <li>Configurer le collecteur de métriques</li>
                    <li>Démarrer l'envoi des données</li>
                    <li>Apparaître dans ce dashboard sous quelques secondes</li>
                  </ul>
                </div>
              </div>

              {/* Info supplémentaire */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Que fait le script ?</p>
                    <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Installe toutes les dépendances nécessaires</li>
                      <li>• Clone le repository GitHub</li>
                      <li>• Configure le collecteur de métriques</li>
                      <li>• Démarre le service avec PM2</li>
                      <li>• Envoie les métriques toutes les 60 secondes</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Prochaines étapes */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-2">📝 Après l'installation</h5>
                <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                  <li>Le serveur apparaîtra automatiquement dans ce dashboard</li>
                  <li>Allez dans <strong>Analytics Financiers</strong> pour configurer le coût mensuel</li>
                  <li>Attribuez vos sites à ce serveur dans la section <strong>Pricing Sites</strong></li>
                </ol>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Fermer
              </button>
              <a
                href="https://github.com/swigsstaking/test.speedL/blob/main/server-collector/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Documentation complète
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Servers;
