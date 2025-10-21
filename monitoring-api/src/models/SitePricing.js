import mongoose from 'mongoose';

const SitePricingSchema = new mongoose.Schema({
  siteId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Prix suggéré (calculé automatiquement)
  suggestedPrice: {
    type: Number,
    default: 0,
    comment: 'Prix suggéré basé sur ressources (CHF/mois)'
  },
  suggestedBreakdown: {
    serverShare: { type: Number, default: 0, comment: 'Part serveur (CHF)' },
    bandwidth: { type: Number, default: 0, comment: 'Bande passante (CHF)' },
    storage: { type: Number, default: 0, comment: 'Stockage (CHF)' },
    requests: { type: Number, default: 0, comment: 'Requêtes (CHF)' },
    margin: { type: Number, default: 20, comment: 'Marge (%)' }
  },
  // Prix réel facturé
  actualPrice: {
    type: Number,
    default: 0,
    comment: 'Prix réel facturé au client (CHF/mois)'
  },
  // Calculs
  monthlyCost: {
    type: Number,
    default: 0,
    comment: 'Coût réel mensuel (CHF)'
  },
  monthlyProfit: {
    type: Number,
    default: 0,
    comment: 'Profit mensuel (CHF)'
  },
  profitMargin: {
    type: Number,
    default: 0,
    comment: 'Marge bénéficiaire (%)'
  },
  // Métadonnées
  currency: {
    type: String,
    default: 'CHF'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  lastCalculated: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour calculer profit et marge
SitePricingSchema.pre('save', function(next) {
  // Calculer le coût total suggéré
  if (this.suggestedBreakdown) {
    const breakdown = this.suggestedBreakdown;
    const baseCost = 
      (breakdown.serverShare || 0) + 
      (breakdown.bandwidth || 0) + 
      (breakdown.storage || 0) + 
      (breakdown.requests || 0);
    
    const marginMultiplier = 1 + ((breakdown.margin || 20) / 100);
    this.suggestedPrice = baseCost * marginMultiplier;
  }
  
  // Calculer profit et marge
  this.monthlyProfit = (this.actualPrice || 0) - (this.monthlyCost || 0);
  
  if (this.actualPrice > 0) {
    this.profitMargin = ((this.monthlyProfit / this.actualPrice) * 100);
  } else {
    this.profitMargin = 0;
  }
  
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('SitePricing', SitePricingSchema);
