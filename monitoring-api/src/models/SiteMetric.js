import mongoose from 'mongoose';

const SiteMetricSchema = new mongoose.Schema({
  siteId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'warning', 'error'],
    required: true
  },
  latency: {
    type: Number,
    required: true
  },
  statusCode: Number,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index composé pour requêtes optimisées
SiteMetricSchema.index({ siteId: 1, timestamp: -1 });

// TTL Index : Supprimer automatiquement après 90 jours
SiteMetricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('SiteMetric', SiteMetricSchema);
