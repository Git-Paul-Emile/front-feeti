import type {
  PaymentIntent,
  PaymentMethod,
  PaymentsProvider,
  PaymentProvider,
} from "../types";

async function readJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as { message?: string; error?: string }).message || (data as { error?: string }).error || fallbackMessage);
  return data as T;
}

export class ExpressPaymentsProvider implements PaymentsProvider {
  readonly mode = "express" as const;

  async createPaymentIntent(
    amount: number,
    provider: PaymentProvider,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    if (provider === "stripe") {
      const response = await fetch("/api/payments/stripe/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount * 100, currency: "fcfa", metadata }),
      });
      const data = await readJson<any>(response, "Erreur lors de la creation du paiement Stripe");
      return {
        id: data.id,
        amount,
        currency: "FCFA",
        provider,
        clientSecret: data.client_secret,
      };
    }

    if (provider === "paystack") {
      const response = await fetch("/api/payments/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount * 100, currency: "FCFA", metadata }),
      });
      const data = await readJson<any>(response, "Erreur lors de la creation du paiement Paystack");
      return {
        id: data.data.reference,
        amount,
        currency: "FCFA",
        provider,
        authorizationUrl: data.data.authorization_url,
        reference: data.data.reference,
      };
    }

    const response = await fetch("/api/payments/mobile-money/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency: "FCFA", metadata }),
    });
    const data = await readJson<any>(response, "Erreur lors de la creation du paiement Mobile Money");
    return {
      id: data.transaction_id,
      amount,
      currency: "FCFA",
      provider,
      reference: data.reference,
    };
  }

  async confirmPayment(paymentIntentId: string, provider: PaymentProvider): Promise<{ status: string; transactionId: string }> {
    const response = await fetch(`/api/payments/${provider}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId }),
    });
    const data = await readJson<any>(response, "Erreur lors de la confirmation du paiement");
    return { status: data.status, transactionId: data.transaction_id };
  }

  async checkPaymentStatus(reference: string, provider: PaymentProvider): Promise<{ status: "pending" | "completed" | "failed" | "cancelled"; amount?: number; currency?: string; }> {
    const response = await fetch(`/api/payments/${provider}/status/${reference}`);
    const data = await readJson<any>(response, "Erreur lors de la verification du statut");
    return { status: data.status, amount: data.amount, currency: data.currency };
  }

  async refundPayment(transactionId: string, amount?: number, reason?: string): Promise<{ refundId: string }> {
    const response = await fetch("/api/payments/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId, amount, reason }),
    });
    const data = await readJson<any>(response, "Erreur lors du remboursement");
    return { refundId: data.refund_id };
  }

  async savePaymentMethod(userId: string, paymentMethod: Omit<PaymentMethod, "id">): Promise<string> {
    const response = await fetch("/api/payments/methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...paymentMethod }),
    });
    const data = await readJson<any>(response, "Erreur lors de la sauvegarde du moyen de paiement");
    return data.method_id;
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const response = await fetch(`/api/payments/methods/${userId}`);
    const data = await readJson<any>(response, "Erreur lors de la recuperation des moyens de paiement");
    return data.methods || [];
  }

  async deletePaymentMethod(methodId: string): Promise<void> {
    const response = await fetch(`/api/payments/methods/${methodId}`, { method: "DELETE" });
    await readJson<any>(response, "Erreur lors de la suppression du moyen de paiement");
  }
}
