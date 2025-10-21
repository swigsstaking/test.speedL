import mongoose from 'mongoose';

const ServerCostSchema = new mongoose.Schema({
  serverId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Coûts mensuels
  baseCost: {
    type: Number,
    required: true,
    default: 0,
    comment: 'Coût de base du serveur (CHF/mois)'
  },
  electricityCost: {
    type: Number,
    default: 0,
    comment: 'Coût électricité (CHF/mois)'
  },
  networkCost: {
    type: Number,
    default: 0,
    comment: 'Coût réseau/bande passante (CHF/mois)'
  },
  amortization: {
    type: Number,
    default: 0,
    comment: 'Amortissement matériel (CHF/mois)'
  },
  otherCharges: {
    type: Number,
    default: 0,
    comment: 'Autres charges (CHF/mois)'
  },
  // Calculé automatiquement
  totalMonthly: {
    type: Number,
    default: 0,
    comment: 'Total mensuel (CHF)'
  },
  totalYearly: {
    type: Number,
    default: 0,
    comment: 'Total annuel (CHF)'
  },
  // Métadonnées
  currency: {
    type: String,
    default: 'CHF'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour calculer les totaux avant sauvegarde
ServerCostSchema.pre('save', function(next) {
  this.totalMonthly = 
    (this.baseCost || 0) + 
    (this.electricityCost || 0) + 
    (this.networkCost || 0) + 
    (this.amortization || 0) + 
    (this.otherCharges || 0);
  
  this.totalYearly = this.totalMonthly * 12;
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('ServerCost', ServerCostSchema);
