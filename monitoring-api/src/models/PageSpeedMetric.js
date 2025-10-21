import mongoose from 'mongoose';

const PageSpeedMetricSchema = new mongoose.Schema({
  siteId: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true
  },
  strategy: {
    type: String,
    enum: ['mobile', 'desktop'],
    default: 'mobile'
  },
  performanceScore: {
    type: Number,
    min: 0,
    max: 100
  },
  // Core Web Vitals
  lcp: Number, // Largest Contentful Paint (ms)
  fid: Number, // First Input Delay (ms)
  cls: Number, // Cumulative Layout Shift
  // Autres métriques
  fcp: Number, // First Contentful Paint (ms)
  ttfb: Number, // Time To First Byte (ms)
  speedIndex: Number, // Speed Index (ms)
  tti: Number, // Time To Interactive (ms)
  tbt: Number, // Total Blocking Time (ms)
  loadTime: Number, // Temps de chargement total (secondes)
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index composé pour requêtes optimisées
PageSpeedMetricSchema.index({ siteId: 1, timestamp: -1 });
PageSpeedMetricSchema.index({ siteId: 1, strategy: 1, timestamp: -1 });

// TTL Index : Supprimer automatiquement après 90 jours
PageSpeedMetricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('PageSpeedMetric', PageSpeedMetricSchema);
