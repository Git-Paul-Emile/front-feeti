import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { CheckCircle2, CreditCard, Smartphone, Loader2, Building2, Tag, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import EstablishmentOwnerAPI, { type EstablishmentPricing, type PaymentMethod } from '../services/api/EstablishmentOwnerAPI';

type PaymentType = 'subscription' | 'bonplan';
type MethodType = 'card' | 'mobile_money' | 'paystack';
type Step = 'recap' | 'method' | 'form' | 'confirmed';

interface DealFormData {
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  validUntil: string;
  location: string;
  image?: string;
  merchantName?: string;
  tags?: string;
  contactPhone?: string;
  contactEmail?: string;
}

interface EstablishmentPaymentModalProps {
  open: boolean;
  onClose: () => void;
  type: PaymentType;
  pricing: EstablishmentPricing;
  leisureItemId: string;
  establishmentName: string;
  dealData?: DealFormData;
  onSuccess?: (result: { paymentRef: string; dealId?: string; subscriptionId?: string }) => void;
}

const DEAL_CATEGORIES = [
  { slug: 'restaurants', name: 'Restaurants' },
  { slug: 'hotels', name: 'Hôtels' },
  { slug: 'activities', name: 'Activités' },
  { slug: 'shopping', name: 'Shopping' },
  { slug: 'general', name: 'Général' },
  { slug: 'weekly', name: 'Hebdomadaire' },
  { slug: 'feeti-na-feeti', name: 'Feeti Na Feeti' },
];

export function EstablishmentPaymentModal({
  open,
  onClose,
  type,
  pricing,
  leisureItemId,
  establishmentName,
  dealData,
  onSuccess,
}: EstablishmentPaymentModalProps) {
  const [step, setStep] = useState<Step>('recap');
  const [method, setMethod] = useState<MethodType>('card');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');

  const amount = type === 'subscription' ? pricing.establishmentAnnualFee : pricing.bonplanCreationFee;
  const currency = pricing.currency;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(n) + ' ' + currency;

  const handleClose = () => {
    setStep('recap');
    setPhone('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setPaymentRef('');
    onClose();
  };

  const handleInitiatePayment = async () => {
    setLoading(true);
    try {
      const paymentMethod: PaymentMethod = { type: method, phone: method === 'mobile_money' ? phone : undefined };

      let initResult;
      if (type === 'subscription') {
        initResult = await EstablishmentOwnerAPI.initiateSubscription(leisureItemId, paymentMethod);
      } else {
        if (!dealData) throw new Error('Données bon plan manquantes');
        initResult = await EstablishmentOwnerAPI.initiateDealPayment(leisureItemId, dealData as any, paymentMethod);
      }

      setPaymentRef(initResult.paymentRef);

      if (method === 'mobile_money') {
        toast.info(initResult.message ?? 'Confirmez le paiement sur votre téléphone');
      }

      // Pour la simulation : attendre un bref instant puis confirmer
      setTimeout(async () => {
        try {
          let result;
          if (type === 'subscription') {
            const sub = await EstablishmentOwnerAPI.confirmSubscription(initResult.paymentRef, leisureItemId, method);
            result = { paymentRef: initResult.paymentRef, subscriptionId: sub.id };
          } else {
            const confirmed = await EstablishmentOwnerAPI.confirmDealPayment(initResult.paymentRef);
            result = { paymentRef: initResult.paymentRef, dealId: confirmed.deal.id };
          }
          setStep('confirmed');
          onSuccess?.(result);
        } catch (err: any) {
          toast.error(err?.response?.data?.message ?? 'Erreur lors de la confirmation du paiement');
          setStep('method');
        } finally {
          setLoading(false);
        }
      }, 2000);

    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erreur lors de l\'initiation du paiement');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'subscription' ? <Building2 className="w-5 h-5 text-indigo-600" /> : <Tag className="w-5 h-5 text-green-600" />}
            {type === 'subscription' ? 'Abonnement annuel' : 'Publication bon plan'}
          </DialogTitle>
        </DialogHeader>

        {/* ── Étape 1 : Récapitulatif ─────────────────────────────────────────── */}
        {step === 'recap' && (
          <div className="space-y-5">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Établissement</span>
                <span className="font-medium">{establishmentName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type</span>
                <span>{type === 'subscription' ? 'Abonnement annuel' : 'Publication bon plan'}</span>
              </div>
              {type === 'subscription' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Durée</span>
                  <span>{pricing.subscriptionDurationDays} jours</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Montant</span>
                <span className="text-indigo-700">{formatPrice(amount)}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Mode simulation — aucun débit réel ne sera effectué.</span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Annuler</Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => setStep('method')}>
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* ── Étape 2 : Choix méthode ─────────────────────────────────────────── */}
        {step === 'method' && (
          <div className="space-y-5">
            <p className="text-sm text-gray-600">Choisissez votre méthode de paiement :</p>

            <div className="space-y-2">
              {[
                { id: 'card' as MethodType, label: 'Carte bancaire', icon: <CreditCard className="w-4 h-4" /> },
                { id: 'mobile_money' as MethodType, label: 'Mobile Money (MTN/Orange)', icon: <Smartphone className="w-4 h-4" /> },
                { id: 'paystack' as MethodType, label: 'Paystack', icon: <span className="text-xs font-bold">P</span> },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left ${
                    method === m.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center ${method === m.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {m.icon}
                  </span>
                  <span className="font-medium text-sm">{m.label}</span>
                  {method === m.id && <CheckCircle2 className="w-4 h-4 text-indigo-600 ml-auto" />}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('recap')}>Retour</Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => setStep('form')}>
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* ── Étape 3 : Formulaire paiement ───────────────────────────────────── */}
        {step === 'form' && (
          <div className="space-y-5">
            {method === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Numéro de carte (simulation)</label>
                  <Input
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Expiration</label>
                    <Input placeholder="MM/AA" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} maxLength={5} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">CVV</label>
                    <Input placeholder="123" value={cardCvv} onChange={e => setCardCvv(e.target.value)} maxLength={3} type="password" />
                  </div>
                </div>
              </div>
            )}

            {method === 'mobile_money' && (
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Numéro de téléphone</label>
                <Input
                  placeholder="+242 06 XXX XX XX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Une notification sera envoyée à ce numéro pour confirmer.</p>
              </div>
            )}

            {method === 'paystack' && (
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                Vous serez redirigé vers la page de paiement sécurisée Paystack (simulation).
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-3 flex justify-between font-semibold text-sm">
              <span>Total à payer</span>
              <span className="text-indigo-700">{formatPrice(amount)}</span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('method')} disabled={loading}>Retour</Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                onClick={handleInitiatePayment}
                disabled={loading}
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Traitement...</> : `Payer ${formatPrice(amount)}`}
              </Button>
            </div>
          </div>
        )}

        {/* ── Étape 4 : Confirmation ───────────────────────────────────────────── */}
        {step === 'confirmed' && (
          <div className="space-y-5 text-center py-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {type === 'subscription' ? 'Abonnement activé !' : 'Bon plan publié !'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {type === 'subscription'
                  ? `Votre abonnement annuel pour "${establishmentName}" est actif.`
                  : `Votre bon plan est maintenant visible publiquement.`}
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono text-gray-500">
              Réf: {paymentRef.slice(0, 24)}…
            </Badge>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleClose}>
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
