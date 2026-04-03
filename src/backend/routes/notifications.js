// Routes pour les notifications (Email, SMS, Push)

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const admin = require('firebase-admin');

// Configuration Email (SendGrid, Mailgun, ou SMTP)
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Configuration SMS (Twilio)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ========================================
// EMAIL NOTIFICATIONS
// ========================================

/**
 * Envoyer un email
 * POST /api/notifications/email/send
 */
router.post('/email/send', async (req, res) => {
  try {
    const { to, subject, html, text, from } = req.body;

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        success: false,
        error: 'Destinataire, sujet et contenu requis'
      });
    }

    const mailOptions = {
      from: from || process.env.SMTP_FROM || '"Feeti" <noreply@feeti.com>',
      to,
      subject,
      text,
      html
    };

    const info = await emailTransporter.sendMail(mailOptions);

    res.json({
      success: true,
      message_id: info.messageId,
      message: 'Email envoyé avec succès'
    });
  } catch (error) {
    console.error('Email Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'envoi de l\'email'
    });
  }
});

/**
 * Envoyer un email de confirmation de billet
 * POST /api/notifications/email/ticket-confirmation
 */
router.post('/email/ticket-confirmation', async (req, res) => {
  try {
    const { to, customerName, eventTitle, eventDate, ticketCount, qrCode, ticketUrl } = req.body;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4338ca, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
    .ticket-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .qr-code { text-align: center; margin: 20px 0; }
    .qr-code img { max-width: 200px; border: 2px solid #4338ca; border-radius: 8px; }
    .button { display: inline-block; padding: 12px 30px; background: #4338ca; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Votre billet Feeti</h1>
      <p>Confirmation de réservation</p>
    </div>
    <div class="content">
      <p>Bonjour <strong>${customerName}</strong>,</p>
      <p>Merci pour votre achat ! Votre billet est prêt. 🎫</p>
      
      <div class="ticket-info">
        <h3>📅 Détails de l'événement</h3>
        <p><strong>Événement :</strong> ${eventTitle}</p>
        <p><strong>Date :</strong> ${eventDate}</p>
        <p><strong>Nombre de billets :</strong> ${ticketCount}</p>
      </div>

      <div class="qr-code">
        <h3>🎫 Votre QR Code</h3>
        <img src="${qrCode}" alt="QR Code" />
        <p><small>Présentez ce code à l'entrée</small></p>
      </div>

      <div style="text-align: center;">
        <a href="${ticketUrl}" class="button">Voir mes billets</a>
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

      <p style="font-size: 14px; color: #6b7280;">
        <strong>Important :</strong><br>
        • Conservez ce code QR précieusement<br>
        • Arrivez 15 minutes avant le début<br>
        • Le code n'est valable qu'une seule fois<br>
        • En cas de problème, contactez-nous
      </p>
    </div>
    <div class="footer">
      <p>© 2024 Feeti - Plateforme de billetterie en ligne</p>
      <p>
        <a href="https://feeti.com">Site web</a> | 
        <a href="https://feeti.com/support">Support</a> | 
        <a href="https://feeti.com/legal">Mentions légales</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Feeti" <noreply@feeti.com>',
      to,
      subject: `🎫 Votre billet pour ${eventTitle}`,
      html
    };

    const info = await emailTransporter.sendMail(mailOptions);

    res.json({
      success: true,
      message_id: info.messageId,
      message: 'Email de confirmation envoyé'
    });
  } catch (error) {
    console.error('Ticket Email Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'envoi'
    });
  }
});

/**
 * Envoyer un email de réinitialisation de mot de passe
 * POST /api/notifications/email/password-reset
 */
router.post('/email/password-reset', async (req, res) => {
  try {
    const { to, name, resetLink } = req.body;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 12px 30px; background: #4338ca; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🔐 Réinitialisation de mot de passe</h2>
    <p>Bonjour ${name},</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe Feeti.</p>
    <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
    <p><a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a></p>
    <p><small>Ce lien expire dans 1 heure.</small></p>
    <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    <hr>
    <p style="color: #666; font-size: 12px;">© 2024 Feeti</p>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Feeti" <noreply@feeti.com>',
      to,
      subject: '🔐 Réinitialisation de mot de passe - Feeti',
      html
    };

    const info = await emailTransporter.sendMail(mailOptions);

    res.json({
      success: true,
      message_id: info.messageId
    });
  } catch (error) {
    console.error('Password Reset Email Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========================================
// SMS NOTIFICATIONS (Twilio)
// ========================================

/**
 * Envoyer un SMS
 * POST /api/notifications/sms/send
 */
router.post('/sms/send', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Numéro et message requis'
      });
    }

    // Formater le numéro (ajouter +242 pour le Congo)
    const phoneNumber = to.startsWith('+') ? to : `+242${to}`;

    const sms = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    res.json({
      success: true,
      message_id: sms.sid,
      status: sms.status
    });
  } catch (error) {
    console.error('SMS Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'envoi du SMS'
    });
  }
});

/**
 * Envoyer un SMS de confirmation de billet
 * POST /api/notifications/sms/ticket-confirmation
 */
router.post('/sms/ticket-confirmation', async (req, res) => {
  try {
    const { to, eventTitle, eventDate, ticketUrl } = req.body;

    const message = `🎫 Feeti: Votre billet pour "${eventTitle}" le ${eventDate} est confirmé! Accédez à vos billets: ${ticketUrl}`;

    const phoneNumber = to.startsWith('+') ? to : `+242${to}`;

    const sms = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    res.json({
      success: true,
      message_id: sms.sid
    });
  } catch (error) {
    console.error('Ticket SMS Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========================================
// PUSH NOTIFICATIONS (Firebase Cloud Messaging)
// ========================================

/**
 * Envoyer une notification push
 * POST /api/notifications/push/send
 */
router.post('/push/send', async (req, res) => {
  try {
    const { token, title, body, data, imageUrl } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Token, titre et message requis'
      });
    }

    const message = {
      notification: {
        title,
        body,
        ...(imageUrl && { imageUrl })
      },
      data: data || {},
      token
    };

    const response = await admin.messaging().send(message);

    res.json({
      success: true,
      message_id: response,
      message: 'Notification envoyée'
    });
  } catch (error) {
    console.error('Push Notification Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'envoi'
    });
  }
});

/**
 * Envoyer une notification push à plusieurs utilisateurs
 * POST /api/notifications/push/send-multiple
 */
router.post('/push/send-multiple', async (req, res) => {
  try {
    const { tokens, title, body, data } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Tokens requis (array)'
      });
    }

    const message = {
      notification: {
        title,
        body
      },
      data: data || {},
      tokens
    };

    const response = await admin.messaging().sendMulticast(message);

    res.json({
      success: true,
      success_count: response.successCount,
      failure_count: response.failureCount,
      message: `${response.successCount} notifications envoyées`
    });
  } catch (error) {
    console.error('Multicast Push Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========================================
// NOTIFICATIONS PAR SUJET (Topic)
// ========================================

/**
 * S'abonner à un sujet
 * POST /api/notifications/push/subscribe
 */
router.post('/push/subscribe', async (req, res) => {
  try {
    const { token, topic } = req.body;

    if (!token || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Token et sujet requis'
      });
    }

    await admin.messaging().subscribeToTopic(token, topic);

    res.json({
      success: true,
      message: `Abonné au sujet: ${topic}`
    });
  } catch (error) {
    console.error('Subscribe Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Se désabonner d'un sujet
 * POST /api/notifications/push/unsubscribe
 */
router.post('/push/unsubscribe', async (req, res) => {
  try {
    const { token, topic } = req.body;

    await admin.messaging().unsubscribeFromTopic(token, topic);

    res.json({
      success: true,
      message: `Désabonné du sujet: ${topic}`
    });
  } catch (error) {
    console.error('Unsubscribe Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Envoyer une notification à un sujet
 * POST /api/notifications/push/send-to-topic
 */
router.post('/push/send-to-topic', async (req, res) => {
  try {
    const { topic, title, body, data } = req.body;

    const message = {
      notification: {
        title,
        body
      },
      data: data || {},
      topic
    };

    const response = await admin.messaging().send(message);

    res.json({
      success: true,
      message_id: response,
      message: `Notification envoyée au sujet: ${topic}`
    });
  } catch (error) {
    console.error('Topic Push Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
