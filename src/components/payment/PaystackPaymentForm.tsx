// Composant de paiement Paystack

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader, CheckCircle, XCircle, Wallet } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface PaystackPaymentFormProps {
  amount: number;
  currency?: string;
  email: string;
  onSuccess: (reference: string) => void;
  onError: (error: string) => void;
  metadata?: Record<string, any>;
}

export function PaystackPaymentForm({
  amount,
  currency = 'XAF',
  email,
  onSuccess,
  onError,
  metadata
}: PaystackPaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [reference, setReference] = useState<string>('');

  useEffect(() => {
    // Charger le SDK Paystack
    if (!window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => setSdkReady(true);
      script.onerror = () => {
        onError('Impossible de charger Paystack');
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    } else {
      setSdkReady(true);
    }
  }, []);

  const initializePayment = async () => {
    setLoading(true);

    try {
      // Initialiser le paiement sur le backend
      const response = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          email,
          metadata
        })
      });

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Erreur lors de l\'initialisation');
      }

      setReference(data.data.reference);
      openPaystack(data.data.reference, data.data.authorization_url);
    } catch (err: any) {
      console.error('Paystack Error:', err);
      onError(err.message);
      toast.error('Erreur lors de l\'initialisation du paiement');
    } finally {
      setLoading(false);
    }
  };

  const openPaystack = (ref: string, authUrl: string) => {
    if (!sdkReady || !window.PaystackPop) {
      // Fallback: ouvrir dans une nouvelle fenêtre
      window.open(authUrl, '_blank');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount * 100, // Paystack utilise les kobo
      currency,
      ref,
      metadata,
      onClose: () => {
        toast.error('Paiement annulé');
        setLoading(false);
      },
      callback: async (response: any) => {
        // Vérifier le paiement
        try {
          const verifyResponse = await fetch(`/api/payments/paystack/status/${response.reference}`);
          const verifyData = await verifyResponse.json();

          if (verifyData.success && verifyData.status === 'completed') {
            toast.success('Paiement réussi !');
            onSuccess(response.reference);
          } else {
            throw new Error('Paiement non confirmé');
          }
        } catch (err: any) {
          onError(err.message);
          toast.error('Erreur de vérification du paiement');
        }
      }
    });

    handler.openIframe();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Paiement Paystack
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Montant à payer</span>
            <span className="text-2xl font-bold text-green-600">
              {amount.toLocaleString()} FCFA
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="bg-gray-50"
          />
        </div>

        <Alert>
          <Wallet className="w-4 h-4" />
          <AlertDescription>
            Vous serez redirigé vers Paystack pour finaliser votre paiement en toute sécurité.
          </AlertDescription>
        </Alert>

        <Button
          onClick={initializePayment}
          disabled={loading || !sdkReady}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Initialisation...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Payer avec Paystack
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-500">
          🔒 Paiement sécurisé • Cartes Visa/Mastercard • Mobile Money
        </p>
      </CardContent>
    </Card>
  );
}
