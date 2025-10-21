import axios from 'axios';

/**
 * Service pour mesurer les performances réelles des sites avec PageSpeed Insights
 */

const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY || ''; // Optionnel, mais recommandé

/**
 * Mesurer les performances d'un site avec PageSpeed Insights
 * @param {string} url - URL du site à tester
 * @param {string} strategy - 'mobile' ou 'desktop'
 * @returns {Promise<Object>} Métriques de performance
 */
export async function measurePageSpeed(url, strategy = 'mobile') {
  try {
    console.log(`📊 Mesure PageSpeed pour ${url} (${strategy})...`);
    
    const params = {
      url: url,
      strategy: strategy,
      category: 'performance'
    };
    
    // Ajouter la clé API si disponible (augmente la limite de requêtes)
    if (API_KEY) {
      params.key = API_KEY;
    }
    
    const response = await axios.get(PAGESPEED_API_URL, {
      params,
      timeout: 60000 // 60 secondes max
    });
    
    const lighthouse = response.data.lighthouseResult;
    const audits = lighthouse.audits;
    
    // Extraire les métriques importantes
    const metrics = {
      // Score global de performance (0-100)
      performanceScore: Math.round(lighthouse.categories.performance.score * 100),
      
      // Core Web Vitals
      lcp: Math.round(audits['largest-contentful-paint']?.numericValue || 0), // ms
      fid: Math.round(audits['max-potential-fid']?.numericValue || 0), // ms
      cls: parseFloat(audits['cumulative-layout-shift']?.numericValue || 0).toFixed(3),
      
      // Autres métriques importantes
      fcp: Math.round(audits['first-contentful-paint']?.numericValue || 0), // ms
      ttfb: Math.round(audits['server-response-time']?.numericValue || 0), // ms
      speedIndex: Math.round(audits['speed-index']?.numericValue || 0), // ms
      tti: Math.round(audits['interactive']?.numericValue || 0), // ms
      tbt: Math.round(audits['total-blocking-time']?.numericValue || 0), // ms
      
      // Temps de chargement total (estimation)
      loadTime: Math.round(audits['interactive']?.numericValue || 0) / 1000, // secondes
      
      // Métadonnées
      strategy,
      timestamp: new Date(),
      fetchTime: lighthouse.fetchTime
    };
    
    console.log(`✅ PageSpeed ${url}: ${metrics.performanceScore}/100, Load: ${metrics.loadTime}s`);
    
    return {
      success: true,
      metrics
    };
    
  } catch (error) {
    console.error(`❌ Erreur PageSpeed pour ${url}:`, error.message);
    
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      success: false,
      error: error.message,
      metrics: {
        performanceScore: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0,
        speedIndex: 0,
        tti: 0,
        tbt: 0,
        loadTime: 0,
        strategy,
        timestamp: new Date()
      }
    };
  }
}

/**
 * Évaluer si les performances sont bonnes selon les seuils Google
 */
export function evaluatePerformance(metrics) {
  const evaluation = {
    overall: 'good',
    issues: []
  };
  
  // LCP (Largest Contentful Paint)
  if (metrics.lcp > 4000) {
    evaluation.overall = 'poor';
    evaluation.issues.push('LCP trop élevé (> 4s)');
  } else if (metrics.lcp > 2500) {
    evaluation.overall = 'needs-improvement';
    evaluation.issues.push('LCP à améliorer (> 2.5s)');
  }
  
  // FID (First Input Delay)
  if (metrics.fid > 300) {
    evaluation.overall = 'poor';
    evaluation.issues.push('FID trop élevé (> 300ms)');
  } else if (metrics.fid > 100) {
    evaluation.overall = 'needs-improvement';
    evaluation.issues.push('FID à améliorer (> 100ms)');
  }
  
  // CLS (Cumulative Layout Shift)
  if (metrics.cls > 0.25) {
    evaluation.overall = 'poor';
    evaluation.issues.push('CLS trop élevé (> 0.25)');
  } else if (metrics.cls > 0.1) {
    evaluation.overall = 'needs-improvement';
    evaluation.issues.push('CLS à améliorer (> 0.1)');
  }
  
  // Temps de chargement total
  if (metrics.loadTime > 3) {
    evaluation.overall = 'poor';
    evaluation.issues.push('Temps de chargement > 3s');
  } else if (metrics.loadTime > 2) {
    if (evaluation.overall === 'good') {
      evaluation.overall = 'needs-improvement';
    }
    evaluation.issues.push('Temps de chargement > 2s (recommandation Google)');
  }
  
  return evaluation;
}

export default {
  measurePageSpeed,
  evaluatePerformance
};
