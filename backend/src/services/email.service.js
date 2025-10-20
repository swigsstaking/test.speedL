import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// Configuration du transporteur email
const createTransporter = () => {
  // En production, utiliser un vrai service SMTP
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // En développement, utiliser Ethereal (emails de test)
  // Les emails ne sont pas vraiment envoyés
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER || 'test@ethereal.email',
      pass: process.env.ETHEREAL_PASS || 'test',
    },
  });
};

/**
 * Envoyer un email de formulaire de contact
 */
export const sendContactEmail = async ({ to, siteName, name, email, phone, message }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"SWIGS CMS" <noreply@swigs.online>',
      to,
      subject: `[${siteName}] Nouveau message de ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #6b7280; }
            .value { margin-top: 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📧 Nouveau message de contact</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Nom :</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email :</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              ${phone ? `
              <div class="field">
                <div class="label">Téléphone :</div>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Message :</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>Ce message a été envoyé depuis le formulaire de contact de ${siteName}</p>
              <p>Géré par SWIGS CMS</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Nouveau message de contact - ${siteName}

Nom: ${name}
Email: ${email}
${phone ? `Téléphone: ${phone}` : ''}

Message:
${message}

---
Ce message a été envoyé depuis le formulaire de contact de ${siteName}
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    logger.success(`Email de contact envoyé: ${info.messageId}`);
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Erreur envoi email contact:', error.message);
    throw error;
  }
};

/**
 * Envoyer un email de demande de bon cadeau
 */
export const sendGiftCardEmail = async ({ to, siteName, name, email, phone, amount, recipientName, recipientEmail, deliveryDate, message }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"SWIGS CMS" <noreply@swigs.online>',
      to,
      subject: `[${siteName}] Demande de bon cadeau - ${amount}€`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #6b7280; }
            .value { margin-top: 5px; }
            .amount { font-size: 24px; font-weight: bold; color: #dc2626; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎁 Demande de bon cadeau</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Montant :</div>
                <div class="value amount">${amount}€</div>
              </div>
              
              <h3 style="margin-top: 30px; color: #374151;">Acheteur</h3>
              <div class="field">
                <div class="label">Nom :</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email :</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              ${phone ? `
              <div class="field">
                <div class="label">Téléphone :</div>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              ` : ''}
              
              <h3 style="margin-top: 30px; color: #374151;">Bénéficiaire</h3>
              <div class="field">
                <div class="label">Nom :</div>
                <div class="value">${recipientName}</div>
              </div>
              ${recipientEmail ? `
              <div class="field">
                <div class="label">Email :</div>
                <div class="value"><a href="mailto:${recipientEmail}">${recipientEmail}</a></div>
              </div>
              ` : ''}
              ${deliveryDate ? `
              <div class="field">
                <div class="label">Date de livraison souhaitée :</div>
                <div class="value">${new Date(deliveryDate).toLocaleDateString('fr-FR')}</div>
              </div>
              ` : ''}
              
              ${message ? `
              <div class="field">
                <div class="label">Message :</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>Cette demande a été envoyée depuis le formulaire de bons cadeaux de ${siteName}</p>
              <p>Géré par SWIGS CMS</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Demande de bon cadeau - ${siteName}

Montant: ${amount}€

Acheteur:
Nom: ${name}
Email: ${email}
${phone ? `Téléphone: ${phone}` : ''}

Bénéficiaire:
Nom: ${recipientName}
${recipientEmail ? `Email: ${recipientEmail}` : ''}
${deliveryDate ? `Date de livraison: ${new Date(deliveryDate).toLocaleDateString('fr-FR')}` : ''}

${message ? `Message:\n${message}` : ''}

---
Cette demande a été envoyée depuis le formulaire de bons cadeaux de ${siteName}
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    logger.success(`Email bon cadeau envoyé: ${info.messageId}`);
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Erreur envoi email bon cadeau:', error.message);
    throw error;
  }
};
