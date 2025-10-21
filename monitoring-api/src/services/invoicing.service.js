import Invoice from '../models/Invoice.js';
import SitePricing from '../models/SitePricing.js';

/**
 * Générer factures pour tous les sites du mois
 */
export async function generateMonthlyInvoices(year, month) {
  try {
    const sites = await SitePricing.find({ actualPrice: { $gt: 0 } });
    const invoices = [];
    
    for (const site of sites) {
      // Vérifier si facture existe déjà
      const existing = await Invoice.findOne({
        siteId: site.siteId,
        'period.year': year,
        'period.month': month
      });
      
      if (existing) {
        console.log(`⚠️ Facture déjà existante pour ${site.siteId} ${year}-${month}`);
        continue;
      }
      
      // Générer numéro facture
      const invoiceNumber = await Invoice.generateInvoiceNumber(year, month);
      
      // Calculer dates
      const issueDate = new Date(year, month - 1, 1);
      const dueDate = new Date(year, month - 1, 30); // 30 jours
      
      // Créer facture
      const invoice = await Invoice.create({
        invoiceNumber,
        siteId: site.siteId,
        siteName: site.siteId, // TODO: Récupérer vrai nom
        period: { year, month },
        amount: site.actualPrice,
        taxRate: 7.7, // TVA Suisse
        items: [{
          description: `Hébergement ${site.siteId} - ${month}/${year}`,
          quantity: 1,
          unitPrice: site.actualPrice,
          total: site.actualPrice
        }],
        issueDate,
        dueDate,
        status: 'draft'
      });
      
      invoices.push(invoice);
    }
    
    console.log(`✅ ${invoices.length} factures générées pour ${year}-${month}`);
    return invoices;
  } catch (error) {
    console.error('❌ Erreur génération factures:', error);
    throw error;
  }
}

/**
 * Récupérer factures avec filtres
 */
export async function getInvoices(filters = {}) {
  try {
    const query = {};
    
    if (filters.siteId) query.siteId = filters.siteId;
    if (filters.status) query.status = filters.status;
    if (filters.year) query['period.year'] = filters.year;
    if (filters.month) query['period.month'] = filters.month;
    
    const invoices = await Invoice.find(query).sort({ issueDate: -1 });
    return invoices;
  } catch (error) {
    console.error('❌ Erreur récupération factures:', error);
    throw error;
  }
}

/**
 * Marquer facture comme payée
 */
export async function markAsPaid(invoiceId, paymentData = {}) {
  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new Error('Facture non trouvée');
    
    invoice.status = 'paid';
    invoice.paidDate = paymentData.paidDate || new Date();
    invoice.paymentMethod = paymentData.paymentMethod || invoice.paymentMethod;
    invoice.paymentReference = paymentData.paymentReference || '';
    
    await invoice.save();
    
    console.log(`✅ Facture ${invoice.invoiceNumber} marquée comme payée`);
    return invoice;
  } catch (error) {
    console.error('❌ Erreur marquage paiement:', error);
    throw error;
  }
}

/**
 * Vérifier factures en retard
 */
export async function checkOverdueInvoices() {
  try {
    const now = new Date();
    const overdueInvoices = await Invoice.find({
      status: { $in: ['sent', 'draft'] },
      dueDate: { $lt: now }
    });
    
    for (const invoice of overdueInvoices) {
      invoice.status = 'overdue';
      await invoice.save();
    }
    
    console.log(`⚠️ ${overdueInvoices.length} factures en retard`);
    return overdueInvoices;
  } catch (error) {
    console.error('❌ Erreur vérification retards:', error);
    throw error;
  }
}

/**
 * Statistiques facturation
 */
export async function getInvoiceStats(year, month) {
  try {
    const query = month ? 
      { 'period.year': year, 'period.month': month } :
      { 'period.year': year };
    
    const invoices = await Invoice.find(query);
    
    const stats = {
      total: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      paid: invoices.filter(inv => inv.status === 'paid').length,
      paidAmount: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0),
      overdue: invoices.filter(inv => inv.status === 'overdue').length,
      overdueAmount: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.totalAmount, 0),
      pending: invoices.filter(inv => inv.status === 'sent').length,
      pendingAmount: invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.totalAmount, 0),
    };
    
    return stats;
  } catch (error) {
    console.error('❌ Erreur stats facturation:', error);
    throw error;
  }
}

export default {
  generateMonthlyInvoices,
  getInvoices,
  markAsPaid,
  checkOverdueInvoices,
  getInvoiceStats
};
