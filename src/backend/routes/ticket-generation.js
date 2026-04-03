// Routes pour la génération automatique de tickets PDF avec QR codes

const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const crypto = require('crypto');
const admin = require('firebase-admin');

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

/**
 * Générer un ID de ticket unique et sécurisé
 */
function generateSecureTicketId() {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(`${timestamp}-${randomBytes}`).digest('hex');
  return `FEETI-${timestamp}-${hash.substring(0, 12).toUpperCase()}`;
}

/**
 * Générer un token de sécurité pour le QR code
 */
function generateSecurityToken(ticketId, eventId, userId) {
  const secret = process.env.TICKET_SECRET || 'feeti_secure_ticket_secret_2024';
  const data = `${ticketId}:${eventId}:${userId}:${Date.now()}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Vérifier un token de sécurité
 */
function verifySecurityToken(token, ticketId, eventId, userId) {
  const secret = process.env.TICKET_SECRET || 'feeti_secure_ticket_secret_2024';
  const data = `${ticketId}:${eventId}:${userId}`;
  const expectedToken = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
}

/**
 * Générer le contenu du QR code
 */
async function generateQRCodeData(ticketId, eventId, userId, securityToken) {
  const qrData = {
    ticketId,
    eventId,
    userId,
    token: securityToken,
    timestamp: Date.now(),
    version: '1.0'
  };
  
  return JSON.stringify(qrData);
}

/**
 * Créer un PDF de ticket avec design professionnel
 */
async function createTicketPDF(ticketData, qrCodeDataUrl) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [595.28, 841.89], // A4 size
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // === HEADER ===
      // Logo et titre
      doc.fontSize(32)
         .fillColor('#4338ca')
         .font('Helvetica-Bold')
         .text('FEETI', 50, 50);

      doc.fontSize(10)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('Votre Billet Électronique', 50, 85);

      // Ligne de séparation
      doc.strokeColor('#e5e7eb')
         .lineWidth(2)
         .moveTo(50, 110)
         .lineTo(545, 110)
         .stroke();

      // === INFORMATIONS ÉVÉNEMENT ===
      doc.fontSize(24)
         .fillColor('#1f2937')
         .font('Helvetica-Bold')
         .text(ticketData.eventTitle, 50, 130, { width: 495, align: 'left' });

      // Date et heure
      doc.fontSize(14)
         .fillColor('#4338ca')
         .font('Helvetica-Bold')
         .text('📅 Date & Heure', 50, 180);

      doc.fontSize(12)
         .fillColor('#374151')
         .font('Helvetica')
         .text(`${ticketData.eventDate} à ${ticketData.eventTime}`, 50, 200);

      // Lieu
      doc.fontSize(14)
         .fillColor('#4338ca')
         .font('Helvetica-Bold')
         .text('📍 Lieu', 50, 230);

      doc.fontSize(12)
         .fillColor('#374151')
         .font('Helvetica')
         .text(ticketData.eventLocation, 50, 250);

      // === QR CODE SECTION ===
      const qrCodeSize = 200;
      const qrCodeX = (595.28 - qrCodeSize) / 2; // Centré
      const qrCodeY = 300;

      // Cadre autour du QR code
      doc.roundedRect(qrCodeX - 20, qrCodeY - 20, qrCodeSize + 40, qrCodeSize + 40, 10)
         .fillAndStroke('#f9fafb', '#e5e7eb');

      // QR Code (converti de data URL en buffer)
      const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
      doc.image(qrBuffer, qrCodeX, qrCodeY, { width: qrCodeSize, height: qrCodeSize });

      // Texte sous le QR code
      doc.fontSize(10)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('Présentez ce code à l\'entrée', 50, qrCodeY + qrCodeSize + 30, { 
           width: 495, 
           align: 'center' 
         });

      // === INFORMATIONS DÉTENTEUR ===
      const infoY = qrCodeY + qrCodeSize + 70;

      doc.fontSize(14)
         .fillColor('#4338ca')
         .font('Helvetica-Bold')
         .text('🎫 Informations du Billet', 50, infoY);

      // Grille d'informations
      const leftColumn = 50;
      const rightColumn = 320;
      let currentY = infoY + 25;

      // Nom
      doc.fontSize(10)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('Détenteur:', leftColumn, currentY);
      
      doc.fontSize(11)
         .fillColor('#1f2937')
         .font('Helvetica-Bold')
         .text(ticketData.holderName, leftColumn, currentY + 15);

      // Email
      doc.fontSize(10)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('Email:', rightColumn, currentY);
      
      doc.fontSize(11)
         .fillColor('#1f2937')
         .font('Helvetica-Bold')
         .text(ticketData.holderEmail, rightColumn, currentY + 15, { width: 225 });

      currentY += 50;

      // Numéro de billet
      doc.fontSize(10)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('N° de Billet:', leftColumn, currentY);
      
      doc.fontSize(11)
         .fillColor('#1f2937')
         .font('Helvetica-Bold')
         .text(ticketData.ticketId, leftColumn, currentY + 15);

      // Prix
      doc.fontSize(10)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('Prix:', rightColumn, currentY);
      
      doc.fontSize(11)
         .fillColor('#059669')
         .font('Helvetica-Bold')
         .text(`${ticketData.price.toLocaleString()} ${ticketData.currency}`, rightColumn, currentY + 15);

      // === FOOTER ===
      const footerY = 760;

      // Ligne de séparation
      doc.strokeColor('#e5e7eb')
         .lineWidth(1)
         .moveTo(50, footerY)
         .lineTo(545, footerY)
         .stroke();

      // Instructions
      doc.fontSize(9)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('⚠️ IMPORTANT:', 50, footerY + 15);

      doc.fontSize(8)
         .fillColor('#374151')
         .font('Helvetica')
         .text('• Ce billet est strictement personnel et non cessible', 50, footerY + 30);
      
      doc.text('• Arrivez 15 minutes avant le début de l\'événement', 50, footerY + 42);
      
      doc.text('• Le QR code ne peut être scanné qu\'une seule fois', 50, footerY + 54);

      // Contact
      doc.fontSize(8)
         .fillColor('#9ca3af')
         .font('Helvetica')
         .text('Support: support@feeti.com | www.feeti.com', 50, footerY + 70, { 
           width: 495, 
           align: 'center' 
         });

      // Badge de sécurité
      doc.fontSize(7)
         .fillColor('#10b981')
         .font('Helvetica-Bold')
         .text('✓ Billet Vérifié et Sécurisé', 400, footerY + 15, { 
           width: 145, 
           align: 'right' 
         });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Générer et sauvegarder un ticket
 * POST /api/ticket-generation/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      eventId,
      eventTitle,
      eventDate,
      eventTime,
      eventLocation,
      eventImage,
      userId,
      holderName,
      holderEmail,
      holderPhone,
      price,
      currency,
      quantity = 1,
      transactionId
    } = req.body;

    // Validation
    if (!eventId || !userId || !holderEmail) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes: eventId, userId et holderEmail requis'
      });
    }

    const tickets = [];

    for (let i = 0; i < quantity; i++) {
      // 1. Générer un ID de ticket sécurisé
      const ticketId = generateSecureTicketId();

      // 2. Générer le token de sécurité
      const securityToken = generateSecurityToken(ticketId, eventId, userId);

      // 3. Créer les données du QR code
      const qrCodeJsonData = await generateQRCodeData(ticketId, eventId, userId, securityToken);

      // 4. Générer le QR code en data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeJsonData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 1,
        margin: 2,
        color: {
          dark: '#000441',
          light: '#ffffff'
        },
        width: 400
      });

      // 5. Données du ticket
      const ticketData = {
        ticketId,
        eventId,
        eventTitle,
        eventDate,
        eventTime,
        eventLocation,
        eventImage,
        userId,
        holderName,
        holderEmail,
        holderPhone: holderPhone || '',
        price,
        currency,
        quantity: 1,
        transactionId,
        securityToken,
        qrCodeData: qrCodeJsonData,
        status: 'valid',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // 6. Générer le PDF
      const pdfBuffer = await createTicketPDF(ticketData, qrCodeDataUrl);

      // 7. Convertir le PDF en base64 pour le stocker/envoyer
      const pdfBase64 = pdfBuffer.toString('base64');

      // 8. Sauvegarder dans Firestore
      const ticketRef = await db.collection('tickets').add({
        ...ticketData,
        pdfBase64, // Optionnel: peut être régénéré à la demande
        qrCodeDataUrl
      });

      tickets.push({
        id: ticketRef.id,
        ticketId,
        qrCodeDataUrl,
        pdfBase64,
        pdfUrl: `/api/ticket-generation/download/${ticketRef.id}`,
        ...ticketData
      });
    }

    // Incrémenter le compteur de participants
    await db.collection('events').doc(eventId).update({
      attendees: admin.firestore.FieldValue.increment(quantity)
    });

    res.json({
      success: true,
      tickets,
      message: `${quantity} billet(s) généré(s) avec succès`
    });

  } catch (error) {
    console.error('Error generating tickets:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la génération des billets'
    });
  }
});

/**
 * Télécharger un PDF de ticket
 * GET /api/ticket-generation/download/:ticketId
 */
router.get('/download/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Récupérer le ticket depuis Firestore
    const ticketDoc = await db.collection('tickets').doc(ticketId).get();

    if (!ticketDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Billet introuvable'
      });
    }

    const ticketData = ticketDoc.data();

    // Si le PDF est stocké, le renvoyer directement
    if (ticketData.pdfBase64) {
      const pdfBuffer = Buffer.from(ticketData.pdfBase64, 'base64');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ticket-${ticketData.ticketId}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      return res.send(pdfBuffer);
    }

    // Sinon, régénérer le PDF
    const pdfBuffer = await createTicketPDF(ticketData, ticketData.qrCodeDataUrl);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${ticketData.ticketId}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error downloading ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors du téléchargement'
    });
  }
});

/**
 * Vérifier un QR code
 * POST /api/ticket-generation/verify
 */
router.post('/verify', async (req, res) => {
  try {
    const { qrCodeData } = req.body;

    if (!qrCodeData) {
      return res.status(400).json({
        success: false,
        error: 'QR code data requis'
      });
    }

    // Parser les données du QR code
    const qrData = JSON.parse(qrCodeData);
    const { ticketId, eventId, userId, token, timestamp } = qrData;

    // Vérifier que le QR code n'est pas trop vieux (24h)
    const age = Date.now() - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures
    
    if (age > maxAge) {
      return res.json({
        success: false,
        error: 'QR code expiré',
        status: 'expired'
      });
    }

    // Récupérer le ticket depuis Firestore
    const ticketsSnapshot = await db.collection('tickets')
      .where('ticketId', '==', ticketId)
      .limit(1)
      .get();

    if (ticketsSnapshot.empty) {
      return res.json({
        success: false,
        error: 'Billet introuvable',
        status: 'not_found'
      });
    }

    const ticketDoc = ticketsSnapshot.docs[0];
    const ticketData = ticketDoc.data();

    // Vérifier le statut
    if (ticketData.status === 'used') {
      return res.json({
        success: false,
        error: 'Billet déjà utilisé',
        status: 'already_used',
        usedAt: ticketData.usedAt?.toDate(),
        ticket: ticketData
      });
    }

    if (ticketData.status === 'cancelled') {
      return res.json({
        success: false,
        error: 'Billet annulé',
        status: 'cancelled',
        ticket: ticketData
      });
    }

    // Vérifier le token de sécurité
    const expectedToken = generateSecurityToken(ticketId, eventId, userId);
    
    if (token !== expectedToken) {
      return res.json({
        success: false,
        error: 'QR code invalide ou falsifié',
        status: 'invalid_token'
      });
    }

    // Marquer le billet comme utilisé
    await db.collection('tickets').doc(ticketDoc.id).update({
      status: 'used',
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
      verifiedBy: req.body.verifierId || 'system'
    });

    res.json({
      success: true,
      status: 'valid',
      message: 'Billet validé avec succès',
      ticket: {
        ticketId: ticketData.ticketId,
        holderName: ticketData.holderName,
        eventTitle: ticketData.eventTitle,
        eventDate: ticketData.eventDate,
        eventTime: ticketData.eventTime
      }
    });

  } catch (error) {
    console.error('Error verifying ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la vérification'
    });
  }
});

/**
 * Régénérer un QR code pour un billet existant
 * POST /api/ticket-generation/regenerate-qr/:ticketId
 */
router.post('/regenerate-qr/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticketDoc = await db.collection('tickets').doc(ticketId).get();

    if (!ticketDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Billet introuvable'
      });
    }

    const ticketData = ticketDoc.data();

    // Générer un nouveau token de sécurité
    const newSecurityToken = generateSecurityToken(
      ticketData.ticketId,
      ticketData.eventId,
      ticketData.userId
    );

    // Générer les nouvelles données du QR code
    const qrCodeJsonData = await generateQRCodeData(
      ticketData.ticketId,
      ticketData.eventId,
      ticketData.userId,
      newSecurityToken
    );

    // Générer le nouveau QR code
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeJsonData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 1,
      margin: 2,
      color: {
        dark: '#000441',
        light: '#ffffff'
      },
      width: 400
    });

    // Régénérer le PDF
    const pdfBuffer = await createTicketPDF({
      ...ticketData,
      securityToken: newSecurityToken,
      qrCodeData: qrCodeJsonData
    }, qrCodeDataUrl);

    const pdfBase64 = pdfBuffer.toString('base64');

    // Mettre à jour dans Firestore
    await db.collection('tickets').doc(ticketId).update({
      securityToken: newSecurityToken,
      qrCodeData: qrCodeJsonData,
      qrCodeDataUrl,
      pdfBase64,
      regeneratedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      qrCodeDataUrl,
      pdfBase64,
      message: 'QR code régénéré avec succès'
    });

  } catch (error) {
    console.error('Error regenerating QR code:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la régénération'
    });
  }
});

/**
 * Obtenir les statistiques d'un événement
 * GET /api/ticket-generation/stats/:eventId
 */
router.get('/stats/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const ticketsSnapshot = await db.collection('tickets')
      .where('eventId', '==', eventId)
      .get();

    const stats = {
      total: 0,
      valid: 0,
      used: 0,
      cancelled: 0
    };

    ticketsSnapshot.forEach(doc => {
      const ticket = doc.data();
      stats.total++;
      stats[ticket.status]++;
    });

    res.json({
      success: true,
      eventId,
      stats
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des statistiques'
    });
  }
});

module.exports = router;
