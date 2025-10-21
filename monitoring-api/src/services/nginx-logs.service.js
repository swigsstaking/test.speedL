import fs from 'fs';
import readline from 'readline';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

/**
 * Parser les logs Nginx pour extraire les métriques
 */

// Format log Nginx par défaut :
// 127.0.0.1 - - [21/Oct/2025:13:20:15 +0200] "GET /api/sites HTTP/1.1" 200 1234 "-" "Mozilla/5.0..."

const LOG_REGEX = /^(\S+) - - \[([^\]]+)\] "(\S+) (\S+) \S+" (\d{3}) (\d+)/;

/**
 * Parser une ligne de log Nginx
 */
function parseLogLine(line) {
  const match = line.match(LOG_REGEX);
  if (!match) return null;
  
  const [, ip, timestamp, method, path, status, bytes] = match;
  
  // Extraire le domaine du path si présent
  let domain = null;
  const hostMatch = line.match(/Host: ([^\s"]+)/);
  if (hostMatch) {
    domain = hostMatch[1];
  }
  
  return {
    ip,
    timestamp: new Date(timestamp.replace(':', ' ')),
    method,
    path,
    status: parseInt(status),
    bytes: parseInt(bytes),
    domain
  };
}

/**
 * Analyser les logs Nginx pour un site spécifique
 * @param {string} domain - Domaine du site (ex: speedl.swigs.online)
 * @param {Date} since - Date depuis laquelle analyser
 * @returns {Promise<Object>} Statistiques
 */
export async function analyzeSiteLogs(domain, since = new Date(Date.now() - 24 * 60 * 60 * 1000)) {
  const logPath = '/var/log/nginx/access.log';
  
  try {
    // Vérifier si le fichier existe
    await stat(logPath);
  } catch (error) {
    console.log(`⚠️ Fichier log non accessible: ${logPath}`);
    return {
      requests: 0,
      errors: 0,
      bandwidth: 0,
      statusCodes: {}
    };
  }
  
  const stats = {
    requests: 0,
    errors: 0,
    bandwidth: 0,
    statusCodes: {},
    paths: {},
    ips: new Set()
  };
  
  try {
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    for await (const line of rl) {
      const log = parseLogLine(line);
      if (!log) continue;
      
      // Filtrer par domaine et date
      if (log.domain && !log.domain.includes(domain)) continue;
      if (log.timestamp < since) continue;
      
      // Compter les requêtes
      stats.requests++;
      
      // Compter les erreurs (4xx, 5xx)
      if (log.status >= 400) {
        stats.errors++;
      }
      
      // Bandwidth
      stats.bandwidth += log.bytes;
      
      // Status codes
      stats.statusCodes[log.status] = (stats.statusCodes[log.status] || 0) + 1;
      
      // Paths populaires
      stats.paths[log.path] = (stats.paths[log.path] || 0) + 1;
      
      // IPs uniques
      stats.ips.add(log.ip);
    }
    
    // Convertir Set en nombre
    stats.uniqueVisitors = stats.ips.size;
    delete stats.ips;
    
    // Top 10 paths
    stats.topPaths = Object.entries(stats.paths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));
    delete stats.paths;
    
    console.log(`✅ Logs analysés pour ${domain}: ${stats.requests} requêtes, ${stats.errors} erreurs`);
    
    return stats;
    
  } catch (error) {
    console.error(`❌ Erreur analyse logs pour ${domain}:`, error.message);
    return {
      requests: 0,
      errors: 0,
      bandwidth: 0,
      statusCodes: {}
    };
  }
}

/**
 * Analyser tous les sites
 */
export async function analyzeAllSites(sites, period = '24h') {
  const now = Date.now();
  let since;
  
  switch (period) {
    case '1h':
      since = new Date(now - 60 * 60 * 1000);
      break;
    case '24h':
      since = new Date(now - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      since = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      since = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      since = new Date(now - 24 * 60 * 60 * 1000);
  }
  
  const results = {};
  
  for (const site of sites) {
    const domain = site.domain || `${site.slug}.swigs.online`;
    results[site.slug] = await analyzeSiteLogs(domain, since);
  }
  
  return results;
}

/**
 * Calculer l'uptime depuis l'historique MongoDB
 */
export function calculateUptime(metrics) {
  if (!metrics || metrics.length === 0) return 0;
  
  const onlineCount = metrics.filter(m => m.status === 'online').length;
  const totalCount = metrics.length;
  
  return ((onlineCount / totalCount) * 100).toFixed(2);
}

export default {
  analyzeSiteLogs,
  analyzeAllSites,
  calculateUptime
};
