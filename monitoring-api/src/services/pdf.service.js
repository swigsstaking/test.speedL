/**
 * Service de génération PDF pour factures
 * Utilise un template HTML simple converti en PDF
 */

export function generateInvoiceHTML(invoice) {
  const issueDate = new Date(invoice.issueDate).toLocaleDateString('fr-CH');
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('fr-CH');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .company { font-size: 24px; font-weight: bold; color: #2563eb; }
    .invoice-number { font-size: 18px; font-weight: bold; }
    .info { margin-bottom: 30px; }
    .info-row { margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    th { background: #f1f5f9; padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .total-section { margin-top: 20px; text-align: right; }
    .total-row { display: flex; justify-content: flex-end; margin: 8px 0; }
    .total-label { width: 150px; text-align: right; padding-right: 20px; }
    .total-value { width: 120px; text-align: right; font-weight: bold; }
    .grand-total { font-size: 18px; color: #2563eb; padding-top: 10px; border-top: 2px solid #cbd5e1; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-sent { background: #dbeafe; color: #1e40af; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    .status-draft { background: #f1f5f9; color: #475569; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">SWIGS</div>
      <div>Hébergement Web Professionnel</div>
      <div>Suisse</div>
    </div>
    <div>
      <div class="invoice-number">Facture ${invoice.invoiceNumber}</div>
      <div class="status status-${invoice.status}">
        ${invoice.status === 'paid' ? '✓ Payée' :
          invoice.status === 'sent' ? 'Envoyée' :
          invoice.status === 'overdue' ? 'En retard' : 'Brouillon'}
      </div>
    </div>
  </div>

  <div class="info">
    <div class="info-row"><strong>Client:</strong> ${invoice.siteName}</div>
    <div class="info-row"><strong>Période:</strong> ${invoice.period.month}/${invoice.period.year}</div>
    <div class="info-row"><strong>Date émission:</strong> ${issueDate}</div>
    <div class="info-row"><strong>Date échéance:</strong> ${dueDate}</div>
    ${invoice.paidDate ? `<div class="info-row"><strong>Date paiement:</strong> ${new Date(invoice.paidDate).toLocaleDateString('fr-CH')}</div>` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Quantité</th>
        <th class="text-right">Prix unitaire</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map(item => `
        <tr>
          <td>${item.description}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${item.unitPrice.toFixed(2)} CHF</td>
          <td class="text-right">${item.total.toFixed(2)} CHF</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-row">
      <div class="total-label">Sous-total HT:</div>
      <div class="total-value">${invoice.amount.toFixed(2)} CHF</div>
    </div>
    <div class="total-row">
      <div class="total-label">TVA (${invoice.taxRate}%):</div>
      <div class="total-value">${invoice.taxAmount.toFixed(2)} CHF</div>
    </div>
    <div class="total-row grand-total">
      <div class="total-label">Total TTC:</div>
      <div class="total-value">${invoice.totalAmount.toFixed(2)} CHF</div>
    </div>
  </div>

  <div class="footer">
    <p><strong>Modalités de paiement:</strong> Virement bancaire sous 30 jours</p>
    <p><strong>Coordonnées bancaires:</strong> IBAN CH00 0000 0000 0000 0000 0 | BIC: XXXXCHZZ</p>
    ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
    <p style="margin-top: 20px;">Merci pour votre confiance !</p>
  </div>
</body>
</html>
  `;
}

export default {
  generateInvoiceHTML
};
