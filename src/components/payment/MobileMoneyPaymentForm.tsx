// Composant de paiement Mobile Money (MTN, Orange, Airtel)

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type MobileOperator = 'mtn' | 'orange' | 'airtel';

interface MobileMoneyPaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  metadata?: Record<string, any>;
}

export function MobileMoneyPaymentForm({
  amount,
  currency = 'FCFA',
  onSuccess,
  onError,
  metadata
}: MobileMoneyPaymentFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState<MobileOperator>('mtn');
  const [loading, setLoading] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');

  const validatePhoneNumber = (phone: string) => {
    // Format: 06XXXXXXXX ou +24206XXXXXXXX
    const congolesePattern = /^(\+242)?0?6\d{8}$/;
    return congolesePattern.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Numéro de téléphone invalide');
      return;
    }

    setLoading(true);

    try {
      // Initialiser le paiement
      const response = await fetch('/api/payments/mobile-money/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          phone: phoneNumber,
          provider,
          metadata
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'initialisation');
      }

      setTransactionId(data.transaction_id);
      setPendingPayment(true);
      toast.success('Vérifiez votre téléphone pour confirmer le paiement');

      // Démarrer la vérification du statut
      checkPaymentStatus(data.transaction_id);
    } catch (err: any) {
      console.error('Mobile Money Error:', err);
      onError(err.message);
      toast.error('Erreur lors du paiement');
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (txId: string, attempts = 0) => {
    const maxAttempts = 60; // 5 minutes (5s * 60)
    
    try {
      const response = await fetch(`/api/payments/mobile-money/status/${txId}`);
      const data = await response.json();

      if (data.status === 'completed') {
        toast.success('Paiement confirmé !');
        onSuccess(txId);
        setPendingPayment(false);
        setLoading(false);
      } else if (data.status === 'failed') {
        throw new Error('Paiement échoué');
      } else if (attempts < maxAttempts) {
        // Réessayer dans 5 secondes
        setTimeout(() => checkPaymentStatus(txId, attempts + 1), 5000);
      } else {
        throw new Error('Délai d\'attente dépassé');
      }
    } catch (err: any) {
      onError(err.message);
      toast.error('Erreur de vérification du paiement');
      setPendingPayment(false);
      setLoading(false);
    }
  };

  const cancelPayment = () => {
    setPendingPayment(false);
    setLoading(false);
    toast.info('Paiement annulé');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Paiement Mobile Money
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingPayment ? (
          <div className="space-y-6">
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>En attente de confirmation</strong><br />
                Vérifiez votre téléphone et confirmez le paiement de {amount.toLocaleString()} {currency}
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="relative">
                  <Loader className="w-16 h-16 animate-spin text-indigo-600 mx-auto" />
                  <Smartphone className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600" />
                </div>
                <p className="mt-4 text-gray-600">En attente de votre confirmation...</p>
                <p className="text-sm text-gray-500 mt-2">Numéro: {phoneNumber}</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={cancelPayment}
              className="w-full"
            >
              Annuler
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Montant à payer</span>
                <span className="text-2xl font-bold text-amber-600">
                  {amount.toLocaleString()} {currency}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Sélectionnez votre opérateur</Label>
              <RadioGroup value={provider} onValueChange={(val) => setProvider(val as MobileOperator)}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="mtn" id="mtn" />
                  <Label htmlFor="mtn" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="font-bold text-black">MTN</span>
                      </div>
                      <div>
                        <p className="font-medium">MTN Mobile Money</p>
                        <p className="text-xs text-gray-500">*126#</p>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="orange" id="orange" />
                  <Label htmlFor="orange" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="font-bold text-white text-xs">OM</span>
                      </div>
                      <div>
                        <p className="font-medium">Orange Money</p>
                        <p className="text-xs text-gray-500">#144#</p>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="airtel" id="airtel" />
                  <Label htmlFor="airtel" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="font-bold text-white text-xs">AM</span>
                      </div>
                      <div>
                        <p className="font-medium">Airtel Money</p>
                        <p className="text-xs text-gray-500">*501#</p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="06 XXX XX XX XX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="text-lg"
              />
              <p className="text-xs text-gray-500">
                Format: 06XXXXXXXX ou +24206XXXXXXXX
              </p>
            </div>

            <Alert>
              <Smartphone className="w-4 h-4" />
              <AlertDescription>
                Vous recevrez une notification sur votre téléphone pour confirmer le paiement.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              disabled={loading || !phoneNumber}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Initialisation...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Payer {amount.toLocaleString()} {currency}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              🔒 Paiement sécurisé • Confirmez sur votre téléphone
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
