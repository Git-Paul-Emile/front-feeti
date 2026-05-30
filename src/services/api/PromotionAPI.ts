import api from '../../routes/axiosConfig';

export interface PackConfig {
  type: string;
  price: number;
  currency: string;
  description: string;
  advantages: string[];
  durationDays: number;
  slots: { used: number; limit: number; available: number };
  updatedAt: string;
}

export interface NextSlotRelease {
  slotsFull: boolean;
  nextRelease: string | null;
  daysUntilRelease: number | null;
}

export interface PromotionPurchase {
  id: string;
  eventId: string;
  organizerId: string;
  packType: string;
  pricePaid: number;
  currency: string;
  status: string;
  paymentSimulated: boolean;
  promotionStartDate: string;
  promotionEndDate: string;
  deactivatedAt: string | null;
  notes: string | null;
  createdAt: string;
  event?: { id: string; title: string; status: string; promotionStatus: string | null };
  organizer?: { id: string; name: string; email: string };
}

export interface PromotionPurchaseResult {
  purchaseId: string;
  packType: string;
  pricePaid: number;
  currency: string;
  promotionStartDate: string;
  promotionEndDate: string;
  durationDays: number;
}

export interface AdminPromotionStats {
  totalRevenue: number;
  monthRevenue: number;
  activePurchases: number;
  byPack: Array<{ packType: string; count: number; revenue: number }>;
}

const PromotionAPI = {
  /** Configs publiques des packs + slots disponibles */
  async getPackConfigs(): Promise<PackConfig[]> {
    const res = await api.get('/api/promotion/pack-configs');
    return res.data.data;
  },

  /** Prochain slot libre pour un type de pack */
  async getNextSlotRelease(packType: string): Promise<NextSlotRelease> {
    const res = await api.get(`/api/promotion/slots/${packType}/next-release`);
    return res.data.data;
  },

  /** Organisateur achète un pack pour son événement */
  async purchasePromotion(eventId: string, packType: string): Promise<PromotionPurchaseResult> {
    const res = await api.post(`/api/promotion/events/${eventId}/promote`, { packType });
    return res.data.data;
  },

  /** Historique des promotions de l'organisateur connecté */
  async getMyPromotions(): Promise<PromotionPurchase[]> {
    const res = await api.get('/api/promotion/my-promotions');
    return res.data.data;
  },

  // ── Admin ─────────────────────────────────────────────────────────────────

  /** Liste toutes les promotions achetées (admin) */
  async adminGetPromotions(params?: {
    packType?: string; status?: string; dateFrom?: string; dateTo?: string;
    page?: number; limit?: number;
  }): Promise<{ data: PromotionPurchase[]; meta: { total: number; page: number; pages: number } }> {
    const q = new URLSearchParams();
    if (params?.packType) q.set('packType', params.packType);
    if (params?.status) q.set('status', params.status);
    if (params?.dateFrom) q.set('dateFrom', params.dateFrom);
    if (params?.dateTo) q.set('dateTo', params.dateTo);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const res = await api.get(`/api/admin/promotions?${q.toString()}`);
    return { data: res.data.data, meta: res.data.meta };
  },

  /** Statistiques globales (admin) */
  async adminGetStats(): Promise<AdminPromotionStats> {
    const res = await api.get('/api/admin/promotions/stats');
    return res.data.data;
  },

  /** Désactiver manuellement une promotion (admin) */
  async adminDeactivate(purchaseId: string, notes?: string): Promise<void> {
    await api.patch(`/api/admin/promotions/${purchaseId}/deactivate`, { notes });
  },

  /** Configs des packs (admin, même endpoint public) */
  async adminGetPackConfigs(): Promise<PackConfig[]> {
    const res = await api.get('/api/admin/promotion-pack-configs');
    return res.data.data;
  },

  /** Mettre à jour la config d'un pack (admin) */
  async adminUpdatePackConfig(type: string, data: {
    price?: number; description?: string; advantages?: string[]; durationDays?: number;
  }): Promise<PackConfig> {
    const res = await api.put(`/api/admin/promotion-pack-configs/${type}`, data);
    return res.data.data;
  },
};

export default PromotionAPI;
