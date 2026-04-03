// Routes pour la gestion des codes d'accès streaming

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

// Configuration Email
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Générer un code d'accès streaming unique
 * POST /api/streaming/generate-access
 */
router.post('/generate-access', async (req, res) => {
  try {
    const {
      eventId,
      userId,
      ticketId,
      userEmail,
      userName,
      accessCode,
      accessPin
    } = req.body;

    // Validation
    if (!eventId || !userId || !ticketId || !accessCode || !accessPin) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes'
      });
    }

    // Vérifier que l'événement existe
    const eventDoc = await db.collection('events').doc(eventId).get();
    if (!eventDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Événement introuvable'
      });
    }

    const eventData = eventDoc.data();

    // Calculer la date d'expiration (24h après la fin de l'événement)
    const eventDate = new Date(`${eventData.date} ${eventData.time}`);
    const expiresAt = new Date(eventDate.getTime() + (24 * 60 * 60 * 1000));

    // Créer le code d'accès
    const accessData = {
      eventId,
      eventTitle: eventData.title,
      userId,
      ticketId,
      userEmail,
      userName,
      accessCode,
      accessPin,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      status: 'active',
      maxUses: 3, // Permet 3 connexions au cas où la connexion se coupe
      currentUses: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const accessRef = await db.collection('streaming_access').add(accessData);

    // Envoyer l'email avec le code d'accès
    await sendAccessCodeEmail(
      userEmail,
      userName,
      accessCode,
      accessPin,
      eventData.title,
      `${eventData.date} à ${eventData.time}`
    );

    res.json({
      success: true,
      data: {
        id: accessRef.id,
        ...accessData,
        expiresAt: expiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating access code:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la génération du code'
    });
  }
});

/**
 * Vérifier un code d'accès streaming
 * POST /api/streaming/verify-access
 */
router.post('/verify-access', async (req, res) => {
  try {
    const { eventId, accessCode, accessPin } = req.body;

    if (!eventId || !accessCode || !accessPin) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Code d\'accès ou PIN manquant'
      });
    }

    // Rechercher le code d'accès
    const accessSnapshot = await db.collection('streaming_access')
      .where('eventId', '==', eventId)
      .where('accessCode', '==', accessCode)
      .where('accessPin', '==', accessPin)
      .limit(1)
      .get();

    if (accessSnapshot.empty) {
      return res.json({
        success: false,
        valid: false,
        message: 'Code d\'accès invalide'
      });
    }

    const accessDoc = accessSnapshot.docs[0];
    const accessData = accessDoc.data();

    // Vérifier le statut
    if (accessData.status === 'expired' || accessData.status === 'revoked') {
      return res.json({
        success: false,
        valid: false,
        message: 'Code d\'accès expiré ou révoqué'
      });
    }

    // Vérifier l'expiration
    const now = new Date();
    const expiresAt = accessData.expiresAt.toDate();
    
    if (now > expiresAt) {
      // Marquer comme expiré
      await db.collection('streaming_access').doc(accessDoc.id).update({
        status: 'expired'
      });

      return res.json({
        success: false,
        valid: false,
        message: 'Code d\'accès expiré'
      });
    }

    // Vérifier le nombre d'utilisations
    if (accessData.currentUses >= accessData.maxUses) {
      return res.json({
        success: false,
        valid: false,
        message: 'Nombre maximum de connexions atteint'
      });
    }

    // Incrémenter le compteur d'utilisations
    await db.collection('streaming_access').doc(accessDoc.id).update({
      currentUses: admin.firestore.FieldValue.increment(1),
      lastUsedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      valid: true,
      message: 'Accès autorisé',
      accessData: {
        id: accessDoc.id,
        userName: accessData.userName,
        userEmail: accessData.userEmail,
        remainingUses: accessData.maxUses - accessData.currentUses - 1
      }
    });

  } catch (error) {
    console.error('Error verifying access:', error);
    res.status(500).json({
      success: false,
      valid: false,
      message: error.message || 'Erreur lors de la vérification'
    });
  }
});

/**
 * Obtenir les codes d'accès d'un utilisateur
 * GET /api/streaming/user-access/:userId
 */
router.get('/user-access/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const accessSnapshot = await db.collection('streaming_access')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const accessCodes = [];
    accessSnapshot.forEach(doc => {
      const data = doc.data();
      accessCodes.push({
        id: doc.id,
        ...data,
        expiresAt: data.expiresAt?.toDate?.().toISOString?.() || null,
        createdAt: data.createdAt?.toDate?.().toISOString?.() || null
      });
    });

    res.json({
      success: true,
      data: accessCodes
    });

  } catch (error) {
    console.error('Error fetching user access:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération'
    });
  }
});

/**
 * Révoquer un code d'accès
 * POST /api/streaming/revoke-access/:accessId
 */
router.post('/revoke-access/:accessId', async (req, res) => {
  try {
    const { accessId } = req.params;

    await db.collection('streaming_access').doc(accessId).update({
      status: 'revoked',
      revokedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Code d\'accès révoqué'
    });

  } catch (error) {
    console.error('Error revoking access:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la révocation'
    });
  }
});

/**
 * Marquer un code comme utilisé
 * POST /api/streaming/use-access/:accessId
 */
router.post('/use-access/:accessId', async (req, res) => {
  try {
    const { accessId } = req.params;

    await db.collection('streaming_access').doc(accessId).update({
      status: 'used',
      usedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Code marqué comme utilisé'
    });

  } catch (error) {
    console.error('Error marking access as used:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Envoyer le code d'accès par email
 * POST /api/streaming/send-access-email
 */
router.post('/send-access-email', async (req, res) => {
  try {
    const { accessCode, accessPin, email, eventTitle, eventDate } = req.body;

    await sendAccessCodeEmail(email, '', accessCode, accessPin, eventTitle, eventDate);

    res.json({
      success: true,
      message: 'Email envoyé'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Fonction helper pour envoyer l'email avec le code d'accès
 */
async function sendAccessCodeEmail(email, name, accessCode, accessPin, eventTitle, eventDate) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4338ca, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
    .code-box { background: #f3f4f6; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #4338ca; }
    .code { font-size: 28px; font-weight: bold; color: #4338ca; letter-spacing: 2px; font-family: 'Courier New', monospace; }
    .pin { font-size: 24px; font-weight: bold; color: #059669; letter-spacing: 3px; font-family: 'Courier New', monospace; margin-top: 15px; }
    .button { display: inline-block; padding: 12px 30px; background: #4338ca; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎬 Votre Code d'Accès Streaming</h1>
      <p>Feeti - Événement en ligne</p>
    </div>
    <div class="content">
      <p>Bonjour${name ? ` <strong>${name}</strong>` : ''},</p>
      <p>Votre achat a été confirmé ! Voici votre code d'accès unique pour rejoindre l'événement en streaming :</p>
      
      <div class="code-box">
        <h3 style="margin: 0 0 15px 0; color: #4338ca;">📅 Événement</h3>
        <p style="font-size: 18px; font-weight: bold; margin: 0;">${eventTitle}</p>
        <p style="color: #6b7280; margin: 5px 0 20px 0;">${eventDate}</p>
        
        <hr style="border: none; border-top: 1px solid #d1d5db; margin: 20px 0;">
        
        <h3 style="margin: 0 0 10px 0; color: #4338ca;">🔑 Code d'Accès</h3>
        <div class="code">${accessCode}</div>
        
        <h3 style="margin: 20px 0 10px 0; color: #059669;">🔒 Code PIN</h3>
        <div class="pin">${accessPin}</div>
      </div>

      <div style="text-align: center;">
        <p><strong>Comment rejoindre l'événement :</strong></p>
        <ol style="text-align: left; display: inline-block;">
          <li>Rendez-vous sur la page de l'événement sur Feeti</li>
          <li>Cliquez sur "Rejoindre le streaming"</li>
          <li>Entrez votre code d'accès et votre PIN</li>
          <li>Profitez de l'événement !</li>
        </ol>
      </div>

      <div class="warning">
        <strong>⚠️ Important :</strong><br>
        • Ce code est strictement personnel et non transférable<br>
        • Vous pouvez vous connecter jusqu'à 3 fois avec ce code<br>
        • Le code expire 24h après la fin de l'événement<br>
        • Ne partagez jamais votre code d'accès
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

      <p style="font-size: 14px; color: #6b7280;">
        <strong>Conseils techniques :</strong><br>
        • Assurez-vous d'avoir une bonne connexion Internet<br>
        • Nous recommandons une connexion d'au moins 5 Mbps<br>
        • Testez votre connexion avant le début de l'événement<br>
        • En cas de problème, contactez notre support
      </p>
    </div>
    <div class="footer">
      <p>© 2024 Feeti - Plateforme de billetterie en ligne</p>
      <p>
        <a href="https://feeti.com">Site web</a> | 
        <a href="https://feeti.com/support">Support</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Feeti" <noreply@feeti.com>',
    to: email,
    subject: `🎬 Votre code d'accès pour ${eventTitle}`,
    html
  };

  await emailTransporter.sendMail(mailOptions);
}

module.exports = router;
