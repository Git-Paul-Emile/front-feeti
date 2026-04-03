// Composant de sélection de méthode de paiement

import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CreditCard, Wallet, Smartphone } from 'lucide-react';
import { StripePaymentForm } from './StripePaymentForm';
import { PaystackPaymentForm } from './PaystackPaymentForm';
import { MobileMoneyPaymentForm } from './MobileMoneyPaymentForm';

export type PaymentMethod = 'stripe' | 'paystack' | 'mobile_money';

interface PaymentSelectorProps {
  amount: number;
  currency?: string;
  email: string;
  defaultMethod?: PaymentMethod;
  enabledMethods?: PaymentMethod[];
  onSuccess: (transactionId: string, method: PaymentMethod) => void;
  onError: (error: string) => void;
  metadata?: Record<string, any>;
}

export function PaymentSelector({
  amount,
  currency = 'FCFA',
  email,
  defaultMethod = 'paystack',
  enabledMethods = ['stripe', 'paystack', 'mobile_money'],
  onSuccess,
  onError,
  metadata
}: PaymentSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(defaultMethod);

  const handleSuccess = (transactionId: string) => {
    onSuccess(transactionId, selectedMethod);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <Tabs value={selectedMethod} onValueChange={(val) => setSelectedMethod(val as PaymentMethod)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              {enabledMethods.includes('stripe') && (
                <TabsTrigger value="stripe" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden sm:inline">Carte</span>
                </TabsTrigger>
              )}
              
              {enabledMethods.includes('paystack') && (
                <TabsTrigger value="paystack" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">Paystack</span>
                </TabsTrigger>
              )}
              
              {enabledMethods.includes('mobile_money') && (
                <TabsTrigger value="mobile_money" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden sm:inline">Mobile</span>
                </TabsTrigger>
              )}
            </TabsList>

            {enabledMethods.includes('stripe') && (
              <TabsContent value="stripe">
                <StripePaymentForm
                  amount={amount}
                  currency={currency}
                  onSuccess={handleSuccess}
                  onError={onError}
                  metadata={metadata}
                />
              </TabsContent>
            )}

            {enabledMethods.includes('paystack') && (
              <TabsContent value="paystack">
                <PaystackPaymentForm
                  amount={amount}
                  currency={currency}
                  email={email}
                  onSuccess={handleSuccess}
                  onError={onError}
                  metadata={metadata}
                />
              </TabsContent>
            )}

            {enabledMethods.includes('mobile_money') && (
              <TabsContent value="mobile_money">
                <MobileMoneyPaymentForm
                  amount={amount}
                  currency={currency}
                  onSuccess={handleSuccess}
                  onError={onError}
                  metadata={metadata}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Trust badges */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
            🔒
          </div>
          <span>Paiement sécurisé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
            ✓
          </div>
          <span>Cryptage SSL</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
            💳
          </div>
          <span>PCI Compliant</span>
        </div>
      </div>
    </div>
  );
}
