import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader, CreditCard, Shield, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface StripePaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  metadata?: Record<string, any>;
}

export function StripePaymentForm({ amount, currency = 'FCFA', onSuccess, onError }: StripePaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCardNumber = (value: string) =>
    value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 16) {
      setError('Numéro de carte invalide');
      return;
    }
    if (expiry.length < 5) {
      setError('Date d\'expiration invalide');
      return;
    }
    if (cvv.length < 3) {
      setError('CVV invalide');
      return;
    }
    if (!cardholder.trim()) {
      setError('Nom du titulaire requis');
      return;
    }

    setLoading(true);
    // Simulation du traitement
    await new Promise(res => setTimeout(res, 1500));
    setLoading(false);

    const transactionId = `sim_stripe_${Date.now()}`;
    toast.success('Paiement par carte accepté !');
    onSuccess(transactionId);
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
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-linear-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Montant à payer</span>
              <span className="text-2xl font-bold text-indigo-600">
                {amount.toLocaleString()} {currency}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            <Shield className="w-4 h-4 inline mr-1" />
            Paiement sécurisé — vos données sont chiffrées
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Numéro de carte</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardholder">Nom du titulaire</Label>
            <Input
              id="cardholder"
              placeholder="JEAN DUPONT"
              value={cardholder}
              onChange={e => setCardholder(e.target.value.toUpperCase())}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Date d'expiration</Label>
              <Input
                id="expiry"
                placeholder="MM/AA"
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                type="password"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
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
            🔒 Paiement sécurisé — Mode démonstration
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
