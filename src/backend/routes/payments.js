// Routes pour les paiements (Stripe, Paystack, Mobile Money)

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const crypto = require('crypto');

// ========================================
// STRIPE ENDPOINTS
// ========================================

/**
 * Créer une intention de paiement Stripe
 * POST /api/payments/stripe/create-intent
 */
router.post('/stripe/create-intent', async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Montant invalide'
      });
    }

    // Créer l'intention de paiement
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe utilise les centimes
      currency: currency.toLowerCase() || 'xaf', // FCFA = XAF
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true
      }
    });

    res.json({
      success: true,
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la création du paiement'
    });
  }
});

/**
 * Confirmer un paiement Stripe
 * POST /api/payments/stripe/confirm
 */
router.post('/stripe/confirm', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'ID de paiement manquant'
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: true,
      status: paymentIntent.status,
      transaction_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    });
  } catch (error) {
    console.error('Stripe Confirm Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la confirmation'
    });
  }
});

// ========================================
// PAYSTACK ENDPOINTS
// ========================================

/**
 * Initialiser un paiement Paystack
 * POST /api/payments/paystack/initialize
 */
router.post('/paystack/initialize', async (req, res) => {
  try {
    const { amount, currency, email, metadata } = req.body;

    if (!amount || !email) {
      return res.status(400).json({
        success: false,
        error: 'Montant et email requis'
      });
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        amount: Math.round(amount * 100), // Paystack utilise les kobo
        currency: currency || 'XAF',
        email,
        metadata
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    console.error('Paystack Error:', error.response?.data || error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || 'Erreur Paystack'
    });
  }
});

/**
 * Vérifier le statut d'un paiement Paystack
 * GET /api/payments/paystack/status/:reference
 */
router.get('/paystack/status/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = response.data.data;

    res.json({
      success: true,
      status: data.status === 'success' ? 'completed' : data.status,
      amount: data.amount / 100,
      currency: data.currency,
      reference: data.reference
    });
  } catch (error) {
    console.error('Paystack Verify Error:', error.response?.data || error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || 'Erreur de vérification'
    });
  }
});

// ========================================
// MOBILE MONEY ENDPOINTS
// ========================================

/**
 * Initialiser un paiement Mobile Money
 * POST /api/payments/mobile-money/initialize
 */
router.post('/mobile-money/initialize', async (req, res) => {
  try {
    const { amount, currency, phone, provider, metadata } = req.body;

    if (!amount || !phone || !provider) {
      return res.status(400).json({
        success: false,
        error: 'Montant, téléphone et opérateur requis'
      });
    }

    // Générer un identifiant de transaction unique
    const transactionId = `MM-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    
    // Ici, vous intégreriez avec l'API de l'opérateur mobile
    // Pour l'exemple, on simule une réponse
    
    // MTN Money API
    if (provider === 'mtn') {
      // const response = await axios.post('https://api.mtn.com/collection/v1_0/requesttopay', {...});
    }
    
    // Orange Money API
    if (provider === 'orange') {
      // const response = await axios.post('https://api.orange.com/orange-money-webpay/v1/webpayment', {...});
    }

    // Airtel Money API
    if (provider === 'airtel') {
      // const response = await axios.post('https://openapiuat.airtel.africa/merchant/v1/payments/', {...});
    }

    // Simulation pour le développement
    res.json({
      success: true,
      transaction_id: transactionId,
      reference: transactionId,
      provider,
      amount,
      currency: currency || 'FCFA',
      phone,
      status: 'pending',
      message: 'Veuillez confirmer le paiement sur votre téléphone'
    });
  } catch (error) {
    console.error('Mobile Money Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur Mobile Money'
    });
  }
});

/**
 * Vérifier le statut d'un paiement Mobile Money
 * GET /api/payments/mobile-money/status/:transactionId
 */
router.get('/mobile-money/status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Ici, vous vérifieriez le statut auprès de l'opérateur
    // Pour l'exemple, on simule une réponse

    res.json({
      success: true,
      transaction_id: transactionId,
      status: 'completed', // ou 'pending', 'failed'
      amount: 50000,
      currency: 'FCFA'
    });
  } catch (error) {
    console.error('Mobile Money Status Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur de vérification'
    });
  }
});

// ========================================
// REMBOURSEMENTS
// ========================================

/**
 * Rembourser un paiement
 * POST /api/payments/refund
 */
router.post('/refund', async (req, res) => {
  try {
    const { transactionId, amount, reason, provider } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: 'ID de transaction requis'
      });
    }

    let refundResult;

    // Remboursement Stripe
    if (provider === 'stripe') {
      refundResult = await stripe.refunds.create({
        payment_intent: transactionId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason || 'requested_by_customer'
      });

      return res.json({
        success: true,
        refund_id: refundResult.id,
        status: refundResult.status,
        amount: refundResult.amount / 100
      });
    }

    // Remboursement Paystack
    if (provider === 'paystack') {
      const response = await axios.post(
        'https://api.paystack.co/refund',
        {
          transaction: transactionId,
          amount: amount ? Math.round(amount * 100) : undefined
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return res.json({
        success: true,
        refund_id: response.data.data.id,
        status: response.data.data.status
      });
    }

    // Remboursement Mobile Money
    if (provider === 'mobile_money') {
      // Implémenter selon l'opérateur
      return res.json({
        success: true,
        refund_id: `REFUND-${Date.now()}`,
        status: 'pending',
        message: 'Le remboursement sera traité sous 3-5 jours ouvrables'
      });
    }

    res.status(400).json({
      success: false,
      error: 'Fournisseur de paiement non supporté'
    });
  } catch (error) {
    console.error('Refund Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors du remboursement'
    });
  }
});

// ========================================
// MOYENS DE PAIEMENT SAUVEGARDÉS
// ========================================

/**
 * Sauvegarder un moyen de paiement
 * POST /api/payments/methods
 */
router.post('/methods', async (req, res) => {
  try {
    const { userId, type, ...methodData } = req.body;

    if (!userId || !type) {
      return res.status(400).json({
        success: false,
        error: 'userId et type requis'
      });
    }

    // Ici, sauvegarder dans Firestore ou votre base de données
    const methodId = `method-${Date.now()}`;

    res.json({
      success: true,
      method_id: methodId
    });
  } catch (error) {
    console.error('Save Payment Method Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur de sauvegarde'
    });
  }
});

/**
 * Récupérer les moyens de paiement d'un utilisateur
 * GET /api/payments/methods/:userId
 */
router.get('/methods/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Ici, récupérer depuis Firestore ou votre base de données
    const methods = []; // Exemple vide

    res.json({
      success: true,
      methods
    });
  } catch (error) {
    console.error('Get Payment Methods Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur de récupération'
    });
  }
});

/**
 * Supprimer un moyen de paiement
 * DELETE /api/payments/methods/:methodId
 */
router.delete('/methods/:methodId', async (req, res) => {
  try {
    const { methodId } = req.params;

    // Ici, supprimer de Firestore ou votre base de données

    res.json({
      success: true,
      message: 'Moyen de paiement supprimé'
    });
  } catch (error) {
    console.error('Delete Payment Method Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur de suppression'
    });
  }
});

module.exports = router;
