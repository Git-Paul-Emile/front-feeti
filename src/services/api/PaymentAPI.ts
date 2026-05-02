import BaseAPIService, { APIResponse } from "./BaseAPI";
import { backendGateway } from "../backend";
import type {
  PaymentConfig,
  PaymentIntent,
  PaymentMethod,
  PaymentProvider,
} from "../backend";

export type { PaymentConfig, PaymentIntent, PaymentMethod, PaymentProvider };

class PaymentAPIService extends BaseAPIService {
  private config: PaymentConfig = {
    stripePublicKey: typeof import.meta !== "undefined" && import.meta.env?.VITE_STRIPE_PUBLIC_KEY
      ? import.meta.env.VITE_STRIPE_PUBLIC_KEY
      : "pk_test_...",
    paystackPublicKey: typeof import.meta !== "undefined" && import.meta.env?.VITE_PAYSTACK_PUBLIC_KEY
      ? import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
      : "pk_test_...",
    currency: "FCFA",
    supportedMethods: ["stripe", "paystack", "mobile_money"],
  };

  async createPaymentIntent(
    amount: number,
    provider: PaymentProvider,
    metadata?: Record<string, any>
  ): Promise<APIResponse<PaymentIntent>> {
    return this.request(
      `payment:intent:${provider}:${Date.now()}`,
      () => backendGateway.payments.createPaymentIntent(amount, provider, metadata),
      { cache: false, deduplicate: false }
    );
  }

  async confirmPayment(
    paymentIntentId: string,
    provider: PaymentProvider
  ): Promise<APIResponse<{ status: string; transactionId: string }>> {
    return this.request(
      `payment:confirm:${paymentIntentId}`,
      () => backendGateway.payments.confirmPayment(paymentIntentId, provider),
      { cache: false, deduplicate: false }
    );
  }

  async checkPaymentStatus(
    reference: string,
    provider: PaymentProvider
  ): Promise<APIResponse<{
    status: "pending" | "completed" | "failed" | "cancelled";
    amount?: number;
    currency?: string;
  }>> {
    return this.request(
      `payment:status:${reference}`,
      () => backendGateway.payments.checkPaymentStatus(reference, provider),
      { cache: false, retry: true }
    );
  }

  async refundPayment(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<APIResponse<{ refundId: string }>> {
    return this.request(
      `payment:refund:${transactionId}`,
      () => backendGateway.payments.refundPayment(transactionId, amount, reason),
      { cache: false, deduplicate: false }
    );
  }

  async savePaymentMethod(
    userId: string,
    paymentMethod: Omit<PaymentMethod, "id">
  ): Promise<APIResponse<string>> {
    return this.request(
      `payment:save-method:${userId}`,
      () => backendGateway.payments.savePaymentMethod(userId, paymentMethod),
      { cache: false, deduplicate: false }
    );
  }

  async getPaymentMethods(userId: string): Promise<APIResponse<PaymentMethod[]>> {
    return this.request(
      `payment:methods:${userId}`,
      () => backendGateway.payments.getPaymentMethods(userId),
      { cache: true }
    );
  }

  async deletePaymentMethod(methodId: string): Promise<APIResponse<void>> {
    return this.request(
      `payment:delete-method:${methodId}`,
      async () => {
        await backendGateway.payments.deletePaymentMethod(methodId);
      },
      { cache: false, deduplicate: false }
    );
  }

  calculateFees(amount: number, provider: PaymentProvider): { fees: number; total: number } {
    let feePercentage = 0;
    let fixedFee = 0;

    switch (provider) {
      case "stripe":
        feePercentage = 0.029;
        fixedFee = 100;
        break;
      case "paystack":
        feePercentage = 0.015;
        fixedFee = 50;
        break;
      case "mobile_money":
        feePercentage = 0.01;
        fixedFee = 0;
        break;
    }

    const fees = Math.round(amount * feePercentage + fixedFee);
    return { fees, total: amount + fees };
  }

  getConfig(): PaymentConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<PaymentConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

const PaymentAPI = new PaymentAPIService();
export default PaymentAPI;
