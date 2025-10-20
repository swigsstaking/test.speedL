import os from 'os';
import axios from 'axios';
import si from 'systeminformation';
import dotenv from 'dotenv';

dotenv.config();

const MONITORING_API = process.env.MONITORING_API || 'http://localhost:3001';
const SERVER_ID = process.env.SERVER_ID || 'server-1';
const SERVER_NAME = process.env.SERVER_NAME || os.hostname();
const SERVER_IP = process.env.SERVER_IP || 'unknown';
const SERVER_LOCATION = process.env.SERVER_LOCATION || 'Unknown';
const COLLECT_INTERVAL = parseInt(process.env.COLLECT_INTERVAL) || 10000; // 10s par défaut

console.log('🚀 SWIGS Monitoring Agent');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 Server ID: ${SERVER_ID}`);
console.log(`🖥️  Server Name: ${SERVER_NAME}`);
console.log(`🌐 API: ${MONITORING_API}`);
console.log(`⏱️  Interval: ${COLLECT_INTERVAL}ms`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

/**
 * Collecte les métriques système
 */
async function collectMetrics() {
  try {
    // Collecte en parallèle pour plus de rapidité
    const [cpu, mem, fsSize, networkStats] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats()
    ]);

    const metrics = {
      serverId: SERVER_ID,
      name: SERVER_NAME,
      ip: SERVER_IP,
      location: SERVER_LOCATION,
      timestamp: new Date(),
      cpu: {
        usage: Math.round(cpu.currentLoad * 100) / 100,
        cores: os.cpus().length,
        loadAvg: os.loadavg()
      },
      ram: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        percent: Math.round((mem.used / mem.total) * 100 * 100) / 100
      },
      disk: fsSize.map(disk => ({
        mount: disk.mount,
        total: disk.size,
        used: disk.used,
        percent: Math.round(disk.use * 100) / 100
      })),
      network: {
        rx: networkStats[0]?.rx_sec || 0,
        tx: networkStats[0]?.tx_sec || 0
      }
    };

    return metrics;
  } catch (error) {
    console.error('❌ Erreur collecte métriques:', error.message);
    return null;
  }
}

/**
 * Envoie les métriques à l'API
 */
async function sendMetrics(metrics) {
  try {
    await axios.post(`${MONITORING_API}/api/metrics`, metrics, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Log compact
    const cpuColor = metrics.cpu.usage > 80 ? '🔴' : metrics.cpu.usage > 60 ? '🟡' : '🟢';
    const ramColor = metrics.ram.percent > 80 ? '🔴' : metrics.ram.percent > 60 ? '🟡' : '🟢';
    
    console.log(
      `${cpuColor} CPU: ${metrics.cpu.usage.toFixed(1)}% | ` +
      `${ramColor} RAM: ${metrics.ram.percent.toFixed(1)}% | ` +
      `💾 Disk: ${metrics.disk[0]?.percent.toFixed(1)}% | ` +
      `📡 Net: ↓${(metrics.network.rx / 1024 / 1024).toFixed(2)}MB/s ↑${(metrics.network.tx / 1024 / 1024).toFixed(2)}MB/s`
    );
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ API non accessible:', MONITORING_API);
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏱️  Timeout API');
    } else {
      console.error('❌ Erreur envoi:', error.message);
    }
  }
}

/**
 * Boucle principale
 */
async function run() {
  const metrics = await collectMetrics();
  if (metrics) {
    await sendMetrics(metrics);
  }
}

// Premier envoi immédiat
console.log('📊 Démarrage de la collecte...\n');
run();

// Puis toutes les X secondes
setInterval(run, COLLECT_INTERVAL);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt de l\'agent...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt de l\'agent...');
  process.exit(0);
});
