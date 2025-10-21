import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  // Numéro facture
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Client/Site
  siteId: {
    type: String,
    required: true,
    index: true
  },
  siteName: {
    type: String,
    required: true
  },
  // Période
  period: {
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 }
  },
  // Montants
  amount: {
    type: Number,
    required: true,
    comment: 'Montant HT (CHF)'
  },
  taxRate: {
    type: Number,
    default: 7.7,
    comment: 'Taux TVA Suisse (%)'
  },
  taxAmount: {
    type: Number,
    default: 0,
    comment: 'Montant TVA (CHF)'
  },
  totalAmount: {
    type: Number,
    required: true,
    comment: 'Montant TTC (CHF)'
  },
  // Détails
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  // Statut
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
    index: true
  },
  // Dates
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date
  },
  // Paiement
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'card', 'paypal', 'other'],
    default: 'bank_transfer'
  },
  paymentReference: {
    type: String
  },
  // Notes
  notes: {
    type: String
  },
  // Métadonnées
  currency: {
    type: String,
    default: 'CHF'
  },
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
InvoiceSchema.index({ 'period.year': 1, 'period.month': 1 });
InvoiceSchema.index({ status: 1, dueDate: 1 });

// Middleware pour calculer TVA et total
InvoiceSchema.pre('save', function(next) {
  this.taxAmount = (this.amount * this.taxRate) / 100;
  this.totalAmount = this.amount + this.taxAmount;
  this.updatedAt = new Date();
  next();
});

// Méthode pour générer numéro facture
InvoiceSchema.statics.generateInvoiceNumber = async function(year, month) {
  const prefix = `INV-${year}${String(month).padStart(2, '0')}`;
  const lastInvoice = await this.findOne({
    invoiceNumber: new RegExp(`^${prefix}`)
  }).sort({ invoiceNumber: -1 });
  
  if (!lastInvoice) {
    return `${prefix}-001`;
  }
  
  const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
  return `${prefix}-${String(lastNumber + 1).padStart(3, '0')}`;
};

export default mongoose.model('Invoice', InvoiceSchema);
