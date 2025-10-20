import mongoose from 'mongoose';

const ServerMetricSchema = new mongoose.Schema({
  serverId: {
    type: String,
    required: true,
    index: true
  },
  metrics: {
    cpu: {
      usage: Number,
      cores: Number
    },
    ram: {
      total: Number,
      used: Number,
      free: Number,
      percent: Number
    },
    disk: [{
      mount: String,
      total: Number,
      used: Number,
      free: Number,
      percent: Number
    }],
    network: {
      rx: Number,
      tx: Number
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index composé pour requêtes optimisées
ServerMetricSchema.index({ serverId: 1, timestamp: -1 });

// TTL Index : Supprimer automatiquement après 90 jours
ServerMetricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('ServerMetric', ServerMetricSchema);
