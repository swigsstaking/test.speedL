#!/usr/bin/env node

/**
 * 📊 SWIGS Monitoring - Collecteur de Métriques Serveur
 * 
 * Ce script collecte les métriques du serveur et les envoie à l'API
 * - CPU, RAM, Disque, Réseau
 * - Processus actifs
 * - Logs Nginx
 * - Uptime
 */

const os = require('os');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Configuration
let config = {
  serverId: process.env.SERVER_ID || 'server-unknown',
  apiUrl: process.env.API_URL || 'https://monitoring.swigs.online',
  collectInterval: parseInt(process.env.COLLECT_INTERVAL) || 60000, // 1 minute
  hostname: os.hostname(),
  location: process.env.LOCATION || 'Unknown'
};

// Charger config depuis fichier si existe
(async () => {
  try {
    const configFile = await fs.readFile('./config.json', 'utf8');
    config = { ...config, ...JSON.parse(configFile) };
    console.log('✅ Configuration chargée:', config.serverId);
  } catch (err) {
    console.log('⚠️  Fichier config.json non trouvé, utilisation variables env');
  }
})();

/**
 * Collecter métriques CPU
 */
async function getCpuMetrics() {
  const cpus = os.cpus();
  const loadAvg = os.loadavg();
  
  // Calculer usage CPU moyen
  let totalIdle = 0;
  let totalTick = 0;
  
  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });
  
  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - ~~(100 * idle / total);
  
  return {
    cores: cpus.length,
    model: cpus[0].model,
    speed: cpus[0].speed,
    usage: usage,
    loadAverage: {
      '1min': loadAvg[0],
      '5min': loadAvg[1],
      '15min': loadAvg[2]
    }
  };
}

/**
 * Collecter métriques RAM
 */
async function getMemoryMetrics() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  
  // Sur Linux, lire /proc/meminfo pour obtenir MemAvailable (RAM réellement disponible)
  let availableMem = freeMem;
  try {
    if (os.platform() === 'linux') {
      const meminfo = await fs.readFile('/proc/meminfo', 'utf8');
      const availableMatch = meminfo.match(/MemAvailable:\s+(\d+)\s+kB/);
      if (availableMatch) {
        availableMem = parseInt(availableMatch[1]) * 1024; // Convertir kB en bytes
      }
    }
  } catch (err) {
    // Si erreur, utiliser freeMem comme fallback
  }
  
  const usedMem = totalMem - availableMem;
  
  return {
    total: totalMem,
    used: usedMem,
    free: freeMem,
    available: availableMem,
    percent: (usedMem / totalMem) * 100
  };
}

/**
 * Collecter métriques disque
 */
async function getDiskMetrics() {
  try {
    const { stdout } = await execAsync('df -B1 / | tail -1');
    const parts = stdout.trim().split(/\s+/);
    
    const total = parseInt(parts[1]);
    const used = parseInt(parts[2]);
    const available = parseInt(parts[3]);
    const percent = parseFloat(parts[4]);
    
    return [{
      mount: '/',
      total,
      used,
      available,
      percent
    }];
  } catch (err) {
    console.error('❌ Erreur récupération disque:', err.message);
    return [];
  }
}

/**
 * Collecter métriques réseau
 */
async function getNetworkMetrics() {
  try {
    const interfaces = os.networkInterfaces();
    const stats = [];
    
    for (const [name, addrs] of Object.entries(interfaces)) {
      if (name === 'lo') continue; // Ignorer loopback
      
      const ipv4 = addrs.find(addr => addr.family === 'IPv4');
      if (ipv4) {
        stats.push({
          interface: name,
          address: ipv4.address,
          mac: ipv4.mac
        });
      }
    }
    
    return stats;
  } catch (err) {
    console.error('❌ Erreur récupération réseau:', err.message);
    return [];
  }
}

/**
 * Collecter métriques processus
 */
async function getProcessMetrics() {
  try {
    const { stdout } = await execAsync('ps aux --sort=-%mem | head -6 | tail -5');
    const lines = stdout.trim().split('\n');
    
    return lines.map(line => {
      const parts = line.trim().split(/\s+/);
      return {
        user: parts[0],
        cpu: parseFloat(parts[2]),
        mem: parseFloat(parts[3]),
        command: parts.slice(10).join(' ').substring(0, 50)
      };
    });
  } catch (err) {
    console.error('❌ Erreur récupération processus:', err.message);
    return [];
  }
}

/**
 * Collecter toutes les métriques
 */
async function collectMetrics() {
  const timestamp = new Date().toISOString();
  
  const [cpu, memory, disk, network, processes] = await Promise.all([
    getCpuMetrics(),
    getMemoryMetrics(),
    getDiskMetrics(),
    getNetworkMetrics(),
    getProcessMetrics()
  ]);
  
  return {
    serverId: config.serverId,
    hostname: config.hostname,
    location: config.location,
    timestamp,
    uptime: os.uptime(),
    metrics: {
      cpu,
      ram: memory,
      disk,
      network,
      processes
    }
  };
}

/**
 * Envoyer métriques à l'API
 */
async function sendMetrics(metrics) {
  try {
    const response = await fetch(`${config.apiUrl}/api/servers/${config.serverId}/metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metrics)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Métriques envoyées - CPU: ${metrics.metrics.cpu.usage.toFixed(1)}% | RAM: ${metrics.metrics.ram.percent.toFixed(1)}%`);
    return data;
  } catch (err) {
    console.error('❌ Erreur envoi métriques:', err.message);
    throw err;
  }
}

/**
 * Boucle principale
 */
async function main() {
  console.log('🚀 SWIGS Monitoring Collector démarré');
  console.log(`📊 Serveur: ${config.serverId}`);
  console.log(`🌐 API: ${config.apiUrl}`);
  console.log(`⏱️  Intervalle: ${config.collectInterval / 1000}s`);
  console.log('');
  
  // Collecter immédiatement
  try {
    const metrics = await collectMetrics();
    await sendMetrics(metrics);
  } catch (err) {
    console.error('❌ Erreur collecte initiale:', err.message);
  }
  
  // Puis à intervalle régulier
  setInterval(async () => {
    try {
      const metrics = await collectMetrics();
      await sendMetrics(metrics);
    } catch (err) {
      console.error('❌ Erreur collecte:', err.message);
    }
  }, config.collectInterval);
}

// Gestion des signaux
process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du collecteur...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Arrêt du collecteur...');
  process.exit(0);
});

// Démarrer
main().catch(err => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});
