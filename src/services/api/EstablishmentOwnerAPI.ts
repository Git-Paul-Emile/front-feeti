import api from '../../routes/axiosConfig';
import type { LeisureItem } from './LeisureAPI';
import type { BackendDeal, DealInput } from './DealsBackendAPI';

export interface EstablishmentPricing {
  establishmentAnnualFee: number;
  bonplanCreationFee: number;
  subscriptionDurationDays: number;
  currency: string;
}

export interface EstablishmentSubscription {
  id: string;
  userId: string;
  leisureItemId: string;
  leisureItem?: { id: string; name: string };
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  paymentMethod?: string;
  paymentRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealPayment {
  id: string;
  dealId?: string;
  deal?: { id: string; title: string };
  userId: string;
  leisureItemId: string;
  leisureItem?: { id: string; name: string };
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  paymentRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  type: 'card' | 'mobile_money' | 'paystack';
  phone?: string;
  email?: string;
}

export interface PaymentInitResult {
  paymentRef: string;
  amount: number;
  currency: string;
  method: string;
  simulation: boolean;
  clientSecret?: string;
  message?: string;
  authorizationUrl?: string;
  dealPaymentId?: string;
}

export interface MyEstablishmentWithSub extends LeisureItem {
  subscriptions?: EstablishmentSubscription[];
}

export interface CreateEstablishmentInput {
  name: string;
  description: string;
  categorySlug: string;
  location: string;
  address?: string;
  phone?: string;
  website?: string;
  priceRange?: string;
  openingHours?: string;
  image?: string;
  countryCode?: string;
  tags?: string[];
  features?: string[];
}

const EstablishmentOwnerAPI = {
  // ── Tarification ────────────────────────────────────────────────────────────

  async getPricing(): Promise<EstablishmentPricing> {
    const res = await api.get('/api/establishment/pricing');
    return res.data.data;
  },

  // ── Mes établissements ───────────────────────────────────────────────────────

  async createEstablishment(data: CreateEstablishmentInput): Promise<MyEstablishmentWithSub> {
    const res = await api.post('/api/establishment/create', data);
    return res.data.data;
  },

  async getMyEstablishments(): Promise<MyEstablishmentWithSub[]> {
    const res = await api.get('/api/establishment/my');
    return res.data.data;
  },

  // ── Abonnements ──────────────────────────────────────────────────────────────

  async getSubscriptionStatus(leisureItemId: string): Promise<{ isActive: boolean; subscription: EstablishmentSubscription | null }> {
    const res = await api.get(`/api/establishment/subscription/status/${leisureItemId}`);
    return res.data.data;
  },

  async initiateSubscription(leisureItemId: string, method: PaymentMethod): Promise<PaymentInitResult> {
    const res = await api.post('/api/establishment/subscription/initiate', {
      leisureItemId,
      method: method.type,
      phone: method.phone,
      email: method.email,
    });
    return res.data.data;
  },

  async confirmSubscription(paymentRef: string, leisureItemId: string, method: 'card' | 'mobile_money' | 'paystack'): Promise<EstablishmentSubscription> {
    const res = await api.post('/api/establishment/subscription/confirm', { paymentRef, leisureItemId, method });
    return res.data.data;
  },

  // ── Bon plans ────────────────────────────────────────────────────────────────

  async initiateDealPayment(leisureItemId: string, dealData: Partial<DealInput>, method: PaymentMethod): Promise<PaymentInitResult> {
    const res = await api.post('/api/establishment/deals/payment/initiate', {
      leisureItemId,
      dealData,
      method: method.type,
      phone: method.phone,
      email: method.email,
    });
    return res.data.data;
  },

  async confirmDealPayment(paymentRef: string): Promise<{ deal: BackendDeal; dealPayment: DealPayment }> {
    const res = await api.post('/api/establishment/deals/payment/confirm', { paymentRef });
    return res.data.data;
  },

  async getMyDeals(): Promise<BackendDeal[]> {
    const res = await api.get('/api/establishment/deals');
    return res.data.data;
  },

  async updateDeal(id: string, data: Partial<DealInput>): Promise<BackendDeal> {
    const res = await api.put(`/api/establishment/deals/${id}`, data);
    return res.data.data;
  },

  async deleteDeal(id: string): Promise<void> {
    await api.delete(`/api/establishment/deals/${id}`);
  },

  // ── Historique paiements ─────────────────────────────────────────────────────

  async getMyPaymentHistory(): Promise<{ subscriptions: EstablishmentSubscription[]; dealPayments: DealPayment[] }> {
    const res = await api.get('/api/establishment/my/payment-history');
    return res.data.data;
  },
};

export default EstablishmentOwnerAPI;
