import mongoose from 'mongoose';

const MonthlyFinancialSchema = new mongoose.Schema({
  // Période
  year: {
    type: Number,
    required: true,
    index: true
  },
  month: {
    type: Number,
    required: true,
    index: true,
    min: 1,
    max: 12
  },
  // Revenus
  totalRevenue: {
    type: Number,
    default: 0,
    comment: 'Revenus totaux du mois (CHF)'
  },
  // Coûts
  totalCosts: {
    type: Number,
    default: 0,
    comment: 'Coûts serveurs totaux du mois (CHF)'
  },
  // Profit
  totalProfit: {
    type: Number,
    default: 0,
    comment: 'Profit du mois (CHF)'
  },
  // Marge
  profitMargin: {
    type: Number,
    default: 0,
    comment: 'Marge bénéficiaire moyenne (%)'
  },
  // Métriques
  serverCount: {
    type: Number,
    default: 0,
    comment: 'Nombre de serveurs actifs'
  },
  siteCount: {
    type: Number,
    default: 0,
    comment: 'Nombre de sites actifs'
  },
  // Détails par serveur
  serverBreakdown: [{
    serverId: String,
    cost: Number,
    revenue: Number,
    profit: Number,
    siteCount: Number
  }],
  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index composé pour recherche rapide
MonthlyFinancialSchema.index({ year: 1, month: 1 }, { unique: true });

// Middleware pour mettre à jour updatedAt
MonthlyFinancialSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('MonthlyFinancial', MonthlyFinancialSchema);
