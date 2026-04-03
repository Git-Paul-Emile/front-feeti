// Composant de paiement Stripe avec Elements

import { useState, useEffect } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface StripePaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  metadata?: Record<string, any>;
}

function CheckoutForm({ amount, currency, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required'
      });

      if (submitError) {
        setError(submitError.message || 'Erreur lors du paiement');
        onError(submitError.message || 'Erreur lors du paiement');
        toast.error('Paiement échoué');
      } else {
        toast.success('Paiement réussi !');
        onSuccess('stripe-payment-id');
      }
    } catch (err: any) {
      setError(err.message);
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Montant à payer</span>
          <span className="text-2xl font-bold text-indigo-600">
            {amount.toLocaleString()} {currency}
          </span>
        </div>
      </div>

      <PaymentElement />

      {error && (
        <Alert variant="destructive">
          <XCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Payer {amount.toLocaleString()} {currency}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        🔒 Paiement sécurisé par Stripe
      </p>
    </form>
  );
}

export function StripePaymentForm({ amount, currency = 'FCFA', onSuccess, onError, metadata }: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Créer l'intention de paiement
    fetch('/api/payments/stripe/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency, metadata })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.client_secret) {
          setClientSecret(data.client_secret);
        } else {
          onError(data.error || 'Erreur lors de la création du paiement');
        }
      })
      .catch(err => {
        console.error('Error:', err);
        onError('Erreur de connexion');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [amount, currency, metadata]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-gray-600">Initialisation du paiement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <XCircle className="w-4 h-4" />
            <AlertDescription>
              Impossible d'initialiser le paiement. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#4338ca',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px'
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Paiement par Carte Bancaire
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            amount={amount}
            currency={currency}
            onSuccess={onSuccess}
            onError={onError}
            metadata={metadata}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}
