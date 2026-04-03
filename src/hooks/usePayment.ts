// Hooks pour la gestion des paiements

import { useState, useCallback } from 'react';
import { useMutation } from './useAPI';
import PaymentAPI, { PaymentProvider, PaymentIntent, PaymentMethod } from '../services/api/PaymentAPI';

/**
 * Hook pour créer une intention de paiement
 */
export function useCreatePaymentIntent() {
  return useMutation<PaymentIntent, {
    amount: number;
    provider: PaymentProvider;
    metadata?: Record<string, any>;
  }>(
    ({ amount, provider, metadata }) => 
      PaymentAPI.createPaymentIntent(amount, provider, metadata)
  );
}

/**
 * Hook pour confirmer un paiement
 */
export function useConfirmPayment() {
  return useMutation<{ status: string; transactionId: string }, {
    paymentIntentId: string;
    provider: PaymentProvider;
  }>(
    ({ paymentIntentId, provider }) => 
      PaymentAPI.confirmPayment(paymentIntentId, provider)
  );
}

/**
 * Hook pour vérifier le statut d'un paiement
 */
export function usePaymentStatus() {
  return useMutation<{
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    amount?: number;
    currency?: string;
  }, {
    reference: string;
    provider: PaymentProvider;
  }>(
    ({ reference, provider }) => 
      PaymentAPI.checkPaymentStatus(reference, provider)
  );
}

/**
 * Hook pour rembourser un paiement
 */
export function useRefundPayment() {
  return useMutation<{ refundId: string }, {
    transactionId: string;
    amount?: number;
    reason?: string;
  }>(
    ({ transactionId, amount, reason }) => 
      PaymentAPI.refundPayment(transactionId, amount, reason)
  );
}

/**
 * Hook complet pour gérer le flux de paiement
 */
export function usePaymentFlow() {
  const [currentStep, setCurrentStep] = useState<'idle' | 'intent' | 'processing' | 'confirming' | 'success' | 'error'>('idle');
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createIntent = useCreatePaymentIntent();
  const confirmPayment = useConfirmPayment();

  /**
   * Initialiser le paiement
   */
  const initiatePayment = useCallback(async (
    amount: number,
    provider: PaymentProvider,
    metadata?: Record<string, any>
  ) => {
    setCurrentStep('intent');
    setError(null);

    const result = await createIntent.mutate({ amount, provider, metadata });

    if (result.success && result.data) {
      setPaymentIntent(result.data);
      setCurrentStep('processing');
      return { success: true, intent: result.data };
    } else {
      setError(result.error || 'Erreur lors de la création du paiement');
      setCurrentStep('error');
      return { success: false, error: result.error };
    }
  }, [createIntent]);

  /**
   * Confirmer le paiement
   */
  const finalize = useCallback(async () => {
    if (!paymentIntent) {
      setError('Aucune intention de paiement active');
      setCurrentStep('error');
      return { success: false };
    }

    setCurrentStep('confirming');

    const result = await confirmPayment.mutate({
      paymentIntentId: paymentIntent.id,
      provider: paymentIntent.provider
    });

    if (result.success && result.data) {
      setTransactionId(result.data.transactionId);
      setCurrentStep('success');
      return { success: true, transactionId: result.data.transactionId };
    } else {
      setError(result.error || 'Erreur lors de la confirmation du paiement');
      setCurrentStep('error');
      return { success: false, error: result.error };
    }
  }, [paymentIntent, confirmPayment]);

  /**
   * Réinitialiser le flux
   */
  const reset = useCallback(() => {
    setCurrentStep('idle');
    setPaymentIntent(null);
    setTransactionId(null);
    setError(null);
    createIntent.reset();
    confirmPayment.reset();
  }, [createIntent, confirmPayment]);

  /**
   * Calculer les frais
   */
  const calculateFees = useCallback((amount: number, provider: PaymentProvider) => {
    return PaymentAPI.calculateFees(amount, provider);
  }, []);

  return {
    currentStep,
    paymentIntent,
    transactionId,
    error,
    loading: createIntent.loading || confirmPayment.loading,
    initiatePayment,
    finalize,
    reset,
    calculateFees
  };
}

/**
 * Hook pour gérer les moyens de paiement sauvegardés
 */
export function useSavedPaymentMethods(userId: string | null) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charger les moyens de paiement
   */
  const loadMethods = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const response = await PaymentAPI.getPaymentMethods(userId);

    if (response.success && response.data) {
      setMethods(response.data);
    } else {
      setError(response.error || 'Erreur lors du chargement');
    }

    setLoading(false);
  }, [userId]);

  /**
   * Ajouter un moyen de paiement
   */
  const addMethod = useCallback(async (method: Omit<PaymentMethod, 'id'>) => {
    if (!userId) return { success: false };

    setLoading(true);

    const response = await PaymentAPI.savePaymentMethod(userId, method);

    if (response.success) {
      await loadMethods();
    }

    setLoading(false);
    return response;
  }, [userId, loadMethods]);

  /**
   * Supprimer un moyen de paiement
   */
  const removeMethod = useCallback(async (methodId: string) => {
    setLoading(true);

    const response = await PaymentAPI.deletePaymentMethod(methodId);

    if (response.success) {
      await loadMethods();
    }

    setLoading(false);
    return response;
  }, [loadMethods]);

  return {
    methods,
    loading,
    error,
    loadMethods,
    addMethod,
    removeMethod
  };
}

/**
 * Hook pour Stripe Elements
 */
export function useStripe() {
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [ready, setReady] = useState(false);

  const initialize = useCallback(async (clientSecret: string) => {
    if (typeof window === 'undefined') return;

    try {
      // Charger Stripe.js dynamiquement
      const stripeModule = await import('@stripe/stripe-js');
      const stripeInstance = await stripeModule.loadStripe(
        PaymentAPI.getConfig().stripePublicKey || ''
      );

      if (stripeInstance) {
        setStripe(stripeInstance);
        
        // Créer les Elements
        const elementsInstance = stripeInstance.elements({
          clientSecret
        });

        setElements(elementsInstance);
        setReady(true);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Stripe:', error);
    }
  }, []);

  return {
    stripe,
    elements,
    ready,
    initialize
  };
}

/**
 * Hook pour Paystack
 */
export function usePaystack() {
  const [ready, setReady] = useState(false);

  const initialize = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Charger le SDK Paystack
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openPayment = useCallback((config: {
    key: string;
    email: string;
    amount: number;
    ref: string;
    onSuccess: (reference: any) => void;
    onClose: () => void;
  }) => {
    if (!ready || !(window as any).PaystackPop) {
      console.error('Paystack not ready');
      return;
    }

    const handler = (window as any).PaystackPop.setup({
      ...config,
      key: PaymentAPI.getConfig().paystackPublicKey
    });

    handler.openIframe();
  }, [ready]);

  return {
    ready,
    initialize,
    openPayment
  };
}
