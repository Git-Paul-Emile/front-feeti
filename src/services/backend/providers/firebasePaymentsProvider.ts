import { auth } from "../../../config/firebase";
import { TransactionService } from "../../FirebaseService";
import type {
  PaymentIntent,
  PaymentMethod,
  PaymentsProvider,
  PaymentProvider,
} from "../types";

const METHODS_KEY = "feeti_payment_methods";

function getStoredMethods(): Record<string, PaymentMethod[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(METHODS_KEY) || "{}");
  } catch {
    return {};
  }
}

function setStoredMethods(value: Record<string, PaymentMethod[]>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(METHODS_KEY, JSON.stringify(value));
}

export class FirebasePaymentsProvider implements PaymentsProvider {
  readonly mode = "firebase" as const;

  async createPaymentIntent(
    amount: number,
    provider: PaymentProvider,
    _metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    const id = `${provider}_${Date.now()}`;
    return {
      id,
      amount,
      currency: "FCFA",
      provider,
      reference: id,
      authorizationUrl: provider === "paystack" ? `https://paystack.local/${id}` : undefined,
      clientSecret: provider === "stripe" ? id : undefined,
    };
  }

  async confirmPayment(paymentIntentId: string, _provider: PaymentProvider): Promise<{ status: string; transactionId: string }> {
    return { status: "completed", transactionId: paymentIntentId };
  }

  async checkPaymentStatus(reference: string): Promise<{ status: "pending" | "completed" | "failed" | "cancelled"; amount?: number; currency?: string; }> {
    return { status: "completed", amount: undefined, currency: "FCFA" };
  }

  async refundPayment(transactionId: string, amount?: number): Promise<{ refundId: string }> {
    await TransactionService.updateTransactionStatus(transactionId, "failed");
    return { refundId: `refund_${amount ?? "full"}_${Date.now()}` };
  }

  async savePaymentMethod(userId: string, paymentMethod: Omit<PaymentMethod, "id">): Promise<string> {
    const methods = getStoredMethods();
    const id = `pm_${Date.now()}`;
    methods[userId] = [...(methods[userId] ?? []), { id, ...paymentMethod }];
    setStoredMethods(methods);
    return id;
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return getStoredMethods()[userId] ?? [];
  }

  async deletePaymentMethod(methodId: string): Promise<void> {
    const methods = getStoredMethods();
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    methods[userId] = (methods[userId] ?? []).filter((method) => method.id !== methodId);
    setStoredMethods(methods);
  }
}
