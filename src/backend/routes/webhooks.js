// Webhooks pour Stripe et Paystack

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

/**
 * Webhook Stripe
 * POST /api/webhooks/stripe
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les événements
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('💰 Payment succeeded:', paymentIntent.id);
      
      // Ici: Créer les billets dans Firebase
      // Envoyer email de confirmation
      // Mettre à jour la base de données
      
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('❌ Payment failed:', failedPayment.id);
      
      // Notifier l'utilisateur de l'échec
      
      break;

    case 'charge.refunded':
      const refund = event.data.object;
      console.log('💸 Refund processed:', refund.id);
      
      // Annuler les billets
      // Envoyer email de remboursement
      
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * Webhook Paystack
 * POST /api/webhooks/paystack
 */
router.post('/paystack', express.json(), async (req, res) => {
  // Vérifier la signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  // Gérer les événements
  switch (event.event) {
    case 'charge.success':
      console.log('💰 Paystack payment succeeded:', event.data.reference);
      
      // Créer les billets
      // Envoyer confirmations
      
      break;

    case 'charge.failed':
      console.log('❌ Paystack payment failed:', event.data.reference);
      break;

    case 'refund.processed':
      console.log('💸 Paystack refund processed:', event.data.reference);
      break;

    default:
      console.log(`Unhandled Paystack event: ${event.event}`);
  }

  res.json({ received: true });
});

module.exports = router;
