// Payment API Service
// Intégration Stripe et Paystack pour les paiements

import BaseAPIService, { APIResponse } from './BaseAPI';
import FirebaseService from '../FirebaseService';

export type PaymentProvider = 'stripe' | 'paystack' | 'mobile_money';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  clientSecret?: string;
  authorizationUrl?: string;
  reference?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_money' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  phoneNumber?: string;
}

export interface PaymentConfig {
  stripePublicKey?: string;
  paystackPublicKey?: string;
  currency: string;
  supportedMethods: PaymentProvider[];
}

class PaymentAPIService extends BaseAPIService {
  private config: PaymentConfig = {
    stripePublicKey: typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PUBLIC_KEY 
      ? import.meta.env.VITE_STRIPE_PUBLIC_KEY 
      : 'pk_test_...',
    paystackPublicKey: typeof import.meta !== 'undefined' && import.meta.env?.VITE_PAYSTACK_PUBLIC_KEY 
      ? import.meta.env.VITE_PAYSTACK_PUBLIC_KEY 
      : 'pk_test_...',
    currency: 'FCFA',
    supportedMethods: ['stripe', 'paystack', 'mobile_money']
  };

  /**
   * Créer une intention de paiement
   */
  async createPaymentIntent(
    amount: number,
    provider: PaymentProvider,
    metadata?: Record<string, any>
  ): Promise<APIResponse<PaymentIntent>> {
    return this.request(
      `payment:intent:${Date.now()}`,
      async () => {
        // En production, ceci appellerait votre backend
        // Pour l'instant, simulation avec Firebase Functions
        
        if (provider === 'stripe') {
          return this.createStripeIntent(amount, metadata);
        } else if (provider === 'paystack') {
          return this.createPaystackIntent(amount, metadata);
        } else {
          return this.createMobileMoneyIntent(amount, metadata);
        }
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Stripe Payment Intent
   */
  private async createStripeIntent(
    amount: number,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    // En production, appeler votre backend qui utilisera Stripe SDK
    // Backend endpoint: POST /api/payments/stripe/create-intent
    
    const response = await fetch('/api/payments/stripe/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount * 100, // Stripe utilise les centimes
        currency: this.config.currency.toLowerCase(),
        metadata
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du paiement Stripe');
    }

    const data = await response.json();

    return {
      id: data.id,
      amount,
      currency: this.config.currency,
      provider: 'stripe',
      clientSecret: data.client_secret
    };
  }

  /**
   * Paystack Payment Intent
   */
  private async createPaystackIntent(
    amount: number,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    // En production, appeler votre backend qui utilisera Paystack SDK
    // Backend endpoint: POST /api/payments/paystack/initialize
    
    const response = await fetch('/api/payments/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount * 100, // Paystack utilise les kobo/centimes
        currency: this.config.currency,
        metadata
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du paiement Paystack');
    }

    const data = await response.json();

    return {
      id: data.data.reference,
      amount,
      currency: this.config.currency,
      provider: 'paystack',
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference
    };
  }

  /**
   * Mobile Money Payment Intent
   */
  private async createMobileMoneyIntent(
    amount: number,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    // Intégration avec opérateurs mobiles (MTN, Orange, Airtel, etc.)
    // Backend endpoint: POST /api/payments/mobile-money/initialize
    
    const response = await fetch('/api/payments/mobile-money/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency: this.config.currency,
        metadata
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du paiement Mobile Money');
    }

    const data = await response.json();

    return {
      id: data.transaction_id,
      amount,
      currency: this.config.currency,
      provider: 'mobile_money',
      reference: data.reference
    };
  }

  /**
   * Confirmer un paiement
   */
  async confirmPayment(
    paymentIntentId: string,
    provider: PaymentProvider
  ): Promise<APIResponse<{ status: string; transactionId: string }>> {
    return this.request(
      `payment:confirm:${paymentIntentId}`,
      async () => {
        const response = await fetch(`/api/payments/${provider}/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId })
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la confirmation du paiement');
        }

        const data = await response.json();

        this.showToast('success', 'Paiement confirmé avec succès');

        return {
          status: data.status,
          transactionId: data.transaction_id
        };
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async checkPaymentStatus(
    reference: string,
    provider: PaymentProvider
  ): Promise<APIResponse<{
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    amount?: number;
    currency?: string;
  }>> {
    return this.request(
      `payment:status:${reference}`,
      async () => {
        const response = await fetch(`/api/payments/${provider}/status/${reference}`);

        if (!response.ok) {
          throw new Error('Erreur lors de la vérification du statut');
        }

        const data = await response.json();

        return {
          status: data.status,
          amount: data.amount,
          currency: data.currency
        };
      },
      { cache: false, retry: true }
    );
  }

  /**
   * Rembourser un paiement
   */
  async refundPayment(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<APIResponse<{ refundId: string }>> {
    return this.request(
      `payment:refund:${transactionId}`,
      async () => {
        const response = await fetch('/api/payments/refund', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId,
            amount,
            reason
          })
        });

        if (!response.ok) {
          throw new Error('Erreur lors du remboursement');
        }

        const data = await response.json();

        this.showToast('success', 'Remboursement effectué avec succès');

        return { refundId: data.refund_id };
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Sauvegarder un moyen de paiement
   */
  async savePaymentMethod(
    userId: string,
    paymentMethod: Omit<PaymentMethod, 'id'>
  ): Promise<APIResponse<string>> {
    return this.request(
      `payment:save-method:${userId}`,
      async () => {
        // Sauvegarder dans Firestore ou votre backend
        const response = await fetch('/api/payments/methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            ...paymentMethod
          })
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde du moyen de paiement');
        }

        const data = await response.json();

        this.showToast('success', 'Moyen de paiement sauvegardé');

        return data.method_id;
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Récupérer les moyens de paiement d'un utilisateur
   */
  async getPaymentMethods(userId: string): Promise<APIResponse<PaymentMethod[]>> {
    const cacheKey = `payment:methods:${userId}`;

    return this.request(
      cacheKey,
      async () => {
        const response = await fetch(`/api/payments/methods/${userId}`);

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des moyens de paiement');
        }

        const data = await response.json();
        return data.methods || [];
      },
      { cache: true }
    );
  }

  /**
   * Supprimer un moyen de paiement
   */
  async deletePaymentMethod(methodId: string): Promise<APIResponse<void>> {
    return this.request(
      `payment:delete-method:${methodId}`,
      async () => {
        const response = await fetch(`/api/payments/methods/${methodId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression du moyen de paiement');
        }

        this.showToast('success', 'Moyen de paiement supprimé');
        this.invalidateCache('payment:methods:');
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Calculer les frais de transaction
   */
  calculateFees(
    amount: number,
    provider: PaymentProvider
  ): { fees: number; total: number } {
    let feePercentage = 0;
    let fixedFee = 0;

    switch (provider) {
      case 'stripe':
        feePercentage = 0.029; // 2.9%
        fixedFee = 100; // 100 FCFA
        break;
      case 'paystack':
        feePercentage = 0.015; // 1.5%
        fixedFee = 50; // 50 FCFA
        break;
      case 'mobile_money':
        feePercentage = 0.01; // 1%
        fixedFee = 0;
        break;
    }

    const fees = Math.round(amount * feePercentage + fixedFee);
    const total = amount + fees;

    return { fees, total };
  }

  /**
   * Configuration
   */
  getConfig(): PaymentConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<PaymentConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton
const PaymentAPI = new PaymentAPIService();
export default PaymentAPI;
