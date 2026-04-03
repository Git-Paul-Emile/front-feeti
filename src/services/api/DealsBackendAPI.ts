import api from '../../routes/axiosConfig';

export interface BackendDeal {
  id: string;
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  validUntil: string;
  location: string;
  image: string;
  isPopular: boolean;
  merchantName: string;
  tags: string; // JSON string
  availableQuantity?: number;
  maxQuantity?: number;
  rating?: number;
  reviewCount?: number;
  contactPhone?: string;
  contactEmail?: string;
  contactWebsite?: string;
  status: string;
  countryCode?: string;
  createdById: string;
  createdBy?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface DealFilters {
  search?: string;
  category?: string;
  location?: string;
  discountRange?: 'low' | 'medium' | 'high';
  priceRange?: 'low' | 'medium' | 'high';
  sortBy?: 'popularity' | 'discount-high' | 'discount-low' | 'price-low' | 'price-high' | 'ending-soon' | 'name';
  countryCode?: string;
  page?: number;
  limit?: number;
}

export interface DealsResponse {
  data: BackendDeal[];
  meta: { total: number; page: number; limit: number; hasMore: boolean };
}

export interface DealInput {
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  validUntil: string;
  location: string;
  image?: string;
  isPopular?: boolean;
  merchantName: string;
  tags?: string;
  availableQuantity?: number;
  maxQuantity?: number;
  rating?: number;
  reviewCount?: number;
  contactPhone?: string;
  contactEmail?: string;
  contactWebsite?: string;
  status?: string;
  countryCode?: string;
}

export interface DealCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  createdAt: string;
}

const DealsBackendAPI = {
  async getDeals(filters: DealFilters = {}): Promise<DealsResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (filters.search) params.search = filters.search;
    if (filters.category && filters.category !== 'all') params.category = filters.category;
    if (filters.location && filters.location !== 'all') params.location = filters.location;
    if (filters.discountRange) params.discountRange = filters.discountRange;
    if (filters.priceRange) params.priceRange = filters.priceRange;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.countryCode) params.countryCode = filters.countryCode;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    const res = await api.get('/api/deals', { params });
    return { data: res.data.data, meta: res.data.meta };
  },

  async getDealById(id: string): Promise<BackendDeal> {
    const res = await api.get(`/api/deals/${id}`);
    return res.data.data;
  },

  async getLocations(countryCode?: string): Promise<string[]> {
    const params = countryCode ? { countryCode } : {};
    const res = await api.get('/api/deals/locations', { params });
    return res.data.data;
  },

  // ── Admin endpoints ───────────────────────────────────────────────────────
  async getAllDealsAdmin(): Promise<BackendDeal[]> {
    const res = await api.get('/api/admin/deals');
    return res.data.data;
  },

  async createDeal(data: DealInput): Promise<BackendDeal> {
    const res = await api.post('/api/admin/deals', data);
    return res.data.data;
  },

  async updateDeal(id: string, data: Partial<DealInput>): Promise<BackendDeal> {
    const res = await api.put(`/api/admin/deals/${id}`, data);
    return res.data.data;
  },

  async deleteDeal(id: string): Promise<void> {
    await api.delete(`/api/admin/deals/${id}`);
  },

  // ── Deal categories ───────────────────────────────────────────────────────
  async getDealCategories(): Promise<DealCategory[]> {
    const res = await api.get('/api/deal-categories');
    return res.data.data;
  },

  async createDealCategory(data: { name: string; slug: string; icon?: string }): Promise<DealCategory> {
    const res = await api.post('/api/admin/deal-categories', data);
    return res.data.data;
  },

  async updateDealCategory(id: string, data: { name?: string; slug?: string; icon?: string }): Promise<DealCategory> {
    const res = await api.put(`/api/admin/deal-categories/${id}`, data);
    return res.data.data;
  },

  async deleteDealCategory(id: string): Promise<void> {
    await api.delete(`/api/admin/deal-categories/${id}`);
  },
};

export default DealsBackendAPI;
