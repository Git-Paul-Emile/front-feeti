import api from '../../routes/axiosConfig';

export interface LeisureCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export type LeisureOfferType = 'BASIC' | 'PRO' | 'PREMIUM';
export type LeisurePackType = 'VISIBILITE_ACCUEIL' | 'BOOST' | 'CAMPAGNE_PREMIUM';

export interface LeisureItem {
  id: string;
  name: string;
  description: string;
  categorySlug: string;
  category: LeisureCategory;
  location: string;
  address?: string;
  phone?: string;
  website?: string;
  priceRange?: string;
  openingHours?: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  features: string; // JSON array string
  tags: string;     // JSON array string
  status: string;
  countryCode?: string;
  isFeatured: boolean;
  latitude?: number;
  longitude?: number;
  createdById: string;
  createdBy?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
  // Système mise en avant loisirs
  leisureOfferType?: LeisureOfferType | null;
  leisurePackType?: LeisurePackType | null;
  leisurePackStatus?: string | null;
  leisurePackStartDate?: string | null;
  leisurePackEndDate?: string | null;
}

export interface LeisureItemInput {
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
  rating?: number;
  reviewCount?: number;
  features?: string;
  tags?: string;
  status?: string;
  countryCode?: string;
  isFeatured?: boolean;
}

const LeisureAPI = {
  async getCategories(): Promise<LeisureCategory[]> {
    const res = await api.get('/api/leisure/categories');
    return res.data.data;
  },

  async getItems(filters: { categorySlug?: string; countryCode?: string; search?: string; lat?: number; lng?: number } = {}): Promise<LeisureItem[]> {
    const params: Record<string, string> = {};
    if (filters.categorySlug && filters.categorySlug !== 'all') params.categorySlug = filters.categorySlug;
    if (filters.countryCode) params.countryCode = filters.countryCode;
    if (filters.search) params.search = filters.search;
    if (filters.lat !== undefined) params.lat = String(filters.lat);
    if (filters.lng !== undefined) params.lng = String(filters.lng);
    const res = await api.get('/api/leisure', { params });
    return res.data.data;
  },

  async getItemById(id: string): Promise<LeisureItem> {
    const res = await api.get(`/api/leisure/${id}`);
    return res.data.data;
  },

  async getMyFavorites(): Promise<LeisureItem[]> {
    const res = await api.get('/api/leisure/favorites');
    return res.data.data;
  },

  async checkFavorite(id: string): Promise<boolean> {
    const res = await api.get(`/api/leisure/${id}/favorite`);
    return res.data.data.isFavorited;
  },

  async toggleFavorite(id: string): Promise<{ isFavorited: boolean }> {
    const res = await api.post(`/api/leisure/${id}/favorite`);
    return res.data.data;
  },

  // Admin
  async getAllAdmin(): Promise<LeisureItem[]> {
    const res = await api.get('/api/admin/leisure');
    return res.data.data;
  },

  async createItem(data: LeisureItemInput): Promise<LeisureItem> {
    const res = await api.post('/api/admin/leisure', data);
    return res.data.data;
  },

  async updateItem(id: string, data: Partial<LeisureItemInput>): Promise<LeisureItem> {
    const res = await api.put(`/api/admin/leisure/${id}`, data);
    return res.data.data;
  },

  async deleteItem(id: string): Promise<void> {
    await api.delete(`/api/admin/leisure/${id}`);
  },

  async createCategory(data: { name: string; slug: string }): Promise<LeisureCategory> {
    const res = await api.post('/api/admin/leisure-categories', data);
    return res.data.data;
  },

  async updateCategory(id: string, data: { name?: string; slug?: string }): Promise<LeisureCategory> {
    const res = await api.put(`/api/admin/leisure-categories/${id}`, data);
    return res.data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/api/admin/leisure-categories/${id}`);
  },

  async updatePromotion(id: string, data: {
    leisureOfferType?: LeisureOfferType | null;
    leisurePackType?: LeisurePackType | null;
    leisurePackStatus?: string;
    leisurePackStartDate?: string | null;
    leisurePackEndDate?: string | null;
  }): Promise<LeisureItem> {
    const res = await api.patch(`/api/admin/leisure/${id}/promotion`, data);
    return res.data.data;
  },

  async getLeisurePromotionSlots(): Promise<Array<{ type: string; limit: number; used: number; available: number }>> {
    const res = await api.get('/api/admin/leisure-promotion-slots');
    return res.data.data;
  },
};

export default LeisureAPI;
