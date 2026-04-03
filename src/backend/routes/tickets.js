// Routes pour la gestion des billets

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const QRCode = require('qrcode');

// Initialiser Firebase Admin (si pas déjà fait)
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
 * Créer des billets après un paiement réussi
 * POST /api/tickets/create
 */
router.post('/create', async (req, res) => {
  try {
    const {
      eventId,
      userId,
      quantity,
      holderName,
      holderEmail,
      holderPhone,
      transactionId,
      price,
      currency
    } = req.body;

    // Validation
    if (!eventId || !userId || !quantity || !holderEmail) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes'
      });
    }

    // Récupérer les infos de l'événement
    const eventDoc = await db.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Événement introuvable'
      });
    }

    const eventData = eventDoc.data();

    // Créer les billets
    const tickets = [];
    const ticketIds = [];

    for (let i = 0; i < quantity; i++) {
      const ticketId = `FEETI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Générer le QR code
      const qrCodeData = JSON.stringify({
        ticketId,
        eventId,
        userId,
        timestamp: Date.now()
      });

      const qrCodeUrl = await QRCode.toDataURL(qrCodeData);

      const ticket = {
        eventId,
        eventTitle: eventData.title,
        eventDate: eventData.date,
        eventTime: eventData.time,
        eventLocation: eventData.location,
        eventImage: eventData.image,
        price,
        currency,
        holderName,
        holderEmail,
        holderPhone: holderPhone || '',
        userId,
        qrCode: qrCodeUrl,
        status: 'valid',
        purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
        quantity: 1,
        transactionId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Sauvegarder dans Firestore
      const ticketRef = await db.collection('tickets').add(ticket);
      ticketIds.push(ticketRef.id);
      tickets.push({ id: ticketRef.id, ...ticket });
    }

    // Incrémenter le nombre de participants
    await db.collection('events').doc(eventId).update({
      attendees: admin.firestore.FieldValue.increment(quantity)
    });

    res.json({
      success: true,
      tickets,
      ticketIds
    });
  } catch (error) {
    console.error('Error creating tickets:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la création des billets'
    });
  }
});

/**
 * Récupérer les billets d'un utilisateur
 * GET /api/tickets/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const ticketsSnapshot = await db.collection('tickets')
      .where('userId', '==', userId)
      .orderBy('purchaseDate', 'desc')
      .get();

    const tickets = [];
    ticketsSnapshot.forEach(doc => {
      tickets.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des billets'
    });
  }
});

/**
 * Vérifier un billet
 * POST /api/tickets/verify
 */
router.post('/verify', async (req, res) => {
  try {
    const { ticketId, qrCode } = req.body;

    if (!ticketId || !qrCode) {
      return res.status(400).json({
        success: false,
        error: 'ticketId et qrCode requis'
      });
    }

    // Récupérer le billet
    const ticketDoc = await db.collection('tickets').doc(ticketId).get();

    if (!ticketDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Billet introuvable'
      });
    }

    const ticket = ticketDoc.data();

    // Vérifier le QR code
    if (ticket.qrCode !== qrCode) {
      return res.json({
        success: false,
        error: 'QR Code invalide'
      });
    }

    // Vérifier le statut
    if (ticket.status === 'used') {
      return res.json({
        success: false,
        error: 'Billet déjà utilisé',
        ticket: { id: ticketDoc.id, ...ticket }
      });
    }

    if (ticket.status === 'cancelled') {
      return res.json({
        success: false,
        error: 'Billet annulé',
        ticket: { id: ticketDoc.id, ...ticket }
      });
    }

    // Marquer comme utilisé
    await db.collection('tickets').doc(ticketId).update({
      status: 'used',
      usedDate: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      ticket: { id: ticketDoc.id, ...ticket },
      message: 'Billet validé avec succès'
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
 * Annuler un billet
 * POST /api/tickets/:ticketId/cancel
 */
router.post('/:ticketId/cancel', async (req, res) => {
  try {
    const { ticketId } = req.params;

    await db.collection('tickets').doc(ticketId).update({
      status: 'cancelled',
      cancelledDate: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Billet annulé avec succès'
    });
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'annulation'
    });
  }
});

module.exports = router;
