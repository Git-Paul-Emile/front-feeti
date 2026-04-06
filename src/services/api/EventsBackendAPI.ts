import api from '../../routes/axiosConfig';

export type PromotionType = 'OR' | 'ARGENT' | 'BRONZE' | 'LITE';
export type PromotionStatus = 'active' | 'inactive' | 'expired';

export interface BackendEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  price: number;
  vipPrice?: number;
  currency: string;
  category: string;
  maxAttendees: number;
  attendees: number;
  duration?: string;
  salesBlocked: boolean;
  isLive: boolean;
  isFeatured: boolean;
  isFavorite: boolean;
  status: string;
  streamUrl?: string;
  videoUrl?: string;
  countryCode?: string;
  organizerId: string;
  organizer?: { name: string };
  createdAt: string;
  updatedAt: string;
  // Système de mise en avant
  promotionType?: PromotionType | null;
  promotionStatus?: PromotionStatus | null;
  promotionStartDate?: string | null;
  promotionEndDate?: string | null;
}

export interface CreateEventInput {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  price?: number;
  vipPrice?: number;
  ticketTypes?: string;
  currency?: string;
  category: string;
  maxAttendees: number;
  duration?: string;
  isLive?: boolean;
  streamUrl?: string;
  videoUrl?: string;
  status?: string;
  countryCode?: string;
}

const EventsBackendAPI = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/api/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.url;
  },


  async getMyEvents(): Promise<BackendEvent[]> {
    const res = await api.get('/api/events/my');
    return res.data.data;
  },

  async getAllEvents(countryCode?: string): Promise<BackendEvent[]> {
    const params = countryCode ? { country: countryCode } : {};
    const res = await api.get('/api/events', { params });
    return res.data.data;
  },

  async getFeaturedEvents(countryCode?: string): Promise<BackendEvent[]> {
    const params: Record<string, string> = { featured: 'true' };
    if (countryCode) params.country = countryCode;
    const res = await api.get('/api/events', { params });
    return res.data.data;
  },

  async getEventById(id: string): Promise<BackendEvent> {
    const res = await api.get(`/api/events/${id}`);
    return res.data.data;
  },

  // ── Admin endpoints ───────────────────────────────────────────────────────
  async getAllEventsAdmin(): Promise<BackendEvent[]> {
    const res = await api.get('/api/admin/events');
    return res.data.data;
  },

  async toggleHighlight(id: string, data: { isFeatured?: boolean; isFavorite?: boolean }): Promise<BackendEvent> {
    const res = await api.patch(`/api/admin/events/${id}/highlight`, data);
    return res.data.data;
  },

  async createEvent(data: CreateEventInput): Promise<BackendEvent> {
    const res = await api.post('/api/events', data);
    return res.data.data;
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/api/events/${id}`);
  },

  async updateEvent(id: string, data: Partial<CreateEventInput>): Promise<BackendEvent> {
    const res = await api.put(`/api/events/${id}`, data);
    return res.data.data;
  },

  async toggleFavorite(id: string): Promise<{ isFavorited: boolean }> {
    const res = await api.post(`/api/events/${id}/favorite`);
    return res.data.data;
  },

  async checkFavorite(id: string): Promise<boolean> {
    const res = await api.get(`/api/events/${id}/favorite`);
    return res.data.data.isFavorited;
  },

  async getMyFavorites(): Promise<BackendEvent[]> {
    const res = await api.get('/api/events/favorites');
    return res.data.data;
  },

  async toggleSalesBlocked(id: string): Promise<{ salesBlocked: boolean }> {
    const res = await api.patch(`/api/events/${id}/toggle-sales-block`);
    return res.data.data;
  },

  // ── Promotion ─────────────────────────────────────────────────────────────
  async updatePromotion(id: string, data: {
    promotionType?: PromotionType | null;
    promotionStatus?: PromotionStatus;
    promotionStartDate?: string | null;
    promotionEndDate?: string | null;
  }): Promise<BackendEvent> {
    const res = await api.patch(`/api/admin/events/${id}/promotion`, data);
    return res.data.data;
  },

  async getPromotionSlots(): Promise<Array<{ type: string; limit: number; used: number; available: number }>> {
    const res = await api.get('/api/admin/promotion-slots');
    return res.data.data;
  },
};

export default EventsBackendAPI;
