// Routes pour la gestion des événements

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

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
 * Récupérer tous les événements
 * GET /api/events
 */
router.get('/', async (req, res) => {
  try {
    const { category, isLive, status } = req.query;

    let query = db.collection('events');

    if (category) {
      query = query.where('category', '==', category);
    }

    if (isLive !== undefined) {
      query = query.where('isLive', '==', isLive === 'true');
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('date', 'desc');

    const snapshot = await query.get();

    const events = [];
    snapshot.forEach(doc => {
      events.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des événements'
    });
  }
});

/**
 * Récupérer un événement par ID
 * GET /api/events/:eventId
 */
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const doc = await db.collection('events').doc(eventId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Événement introuvable'
      });
    }

    res.json({
      success: true,
      event: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération de l\'événement'
    });
  }
});

/**
 * Créer un événement
 * POST /api/events
 */
router.post('/', async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('events').add(eventData);

    res.json({
      success: true,
      eventId: docRef.id,
      message: 'Événement créé avec succès'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la création de l\'événement'
    });
  }
});

/**
 * Mettre à jour un événement
 * PUT /api/events/:eventId
 */
router.put('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('events').doc(eventId).update(updateData);

    res.json({
      success: true,
      message: 'Événement mis à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la mise à jour de l\'événement'
    });
  }
});

/**
 * Supprimer un événement
 * DELETE /api/events/:eventId
 */
router.delete('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    await db.collection('events').doc(eventId).delete();

    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la suppression de l\'événement'
    });
  }
});

module.exports = router;
