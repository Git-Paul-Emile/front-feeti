import api from '../../routes/axiosConfig';

export interface CreatorProfile {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string; photoUrl?: string };
  bio?: string;
  niche?: string;
  audienceSize?: number;
  engagementRate?: number;
  rating?: number;
  reviewCount: number;
  socialLinks: Record<string, string>;
  portfolio?: string;
  isVerified: boolean;
  isActive: boolean;
  collaborationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorCampaign {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  organizer: { id: string; name: string; email?: string };
  budget: number;
  currency: string;
  niche?: string;
  minAudience?: number;
  requirements?: string;
  deliverables?: string;
  startDate?: string;
  endDate: string;
  status: string;
  selectedCount: number;
  maxCreators: number;
  rating?: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorApplication {
  id: string;
  campaignId: string;
  campaign: { id: string; title: string; endDate: string; status: string };
  creatorId: string;
  creator: { id: string; user: { id: string; name: string; email?: string; photoUrl?: string } };
  message?: string;
  status: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorCollaboration {
  id: string;
  campaignId: string;
  campaign: { id: string; title: string; endDate: string };
  creatorId: string;
  creator: { id: string; user: { id: string; name: string } };
  organizerId: string;
  organizer: { id: string; name: string };
  agreedFee: number;
  currency: string;
  deliverables?: string;
  status: string;
  rating?: number;
  review?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

const CreatorAPI = {
  // ── Profile ──────────────────────────────────────────────────────────

  async getMyProfile(): Promise<CreatorProfile> {
    const res = await api.get('/api/creators/me');
    return res.data.data;
  },

  async createProfile(data: {
    bio?: string;
    niche?: string;
    audienceSize?: number;
    engagementRate?: number;
    socialLinks?: Record<string, string>;
    portfolio?: string;
  }): Promise<CreatorProfile> {
    const res = await api.post('/api/creators/me', data);
    return res.data.data;
  },

  async updateMyProfile(data: Partial<CreatorProfile>): Promise<CreatorProfile> {
    const res = await api.put('/api/creators/me', data);
    return res.data.data;
  },

  async deleteMyProfile(): Promise<void> {
    await api.delete('/api/creators/me');
  },

  // ── Public catalog ──────────────────────────────────────────────────

  async listCreators(filters: { niche?: string; verified?: boolean; minAudience?: number } = {}): Promise<CreatorProfile[]> {
    const params = new URLSearchParams();
    if (filters.niche) params.set('niche', filters.niche);
    if (filters.verified !== undefined) params.set('verified', String(filters.verified));
    if (filters.minAudience) params.set('minAudience', String(filters.minAudience));
    const res = await api.get(`/api/creators?${params.toString()}`);
    return res.data.data;
  },

  async getCreatorById(id: string): Promise<CreatorProfile> {
    const res = await api.get(`/api/creators/${id}`);
    return res.data.data;
  },

  // ── Organizer: campaigns ─────────────────────────────────────────────

  async createCampaign(data: {
    title: string;
    description: string;
    budget: number;
    niche?: string;
    minAudience?: number;
    requirements?: string;
    deliverables?: string;
    startDate?: string;
    endDate: string;
    maxCreators?: number;
  }): Promise<CreatorCampaign> {
    const res = await api.post('/api/creators/campaigns', data);
    return res.data.data;
  },

  async getMyCampaigns(): Promise<CreatorCampaign[]> {
    const res = await api.get('/api/creators/campaigns/me');
    return res.data.data;
  },

  async getCampaignDetail(id: string): Promise<CreatorCampaign> {
    const res = await api.get(`/api/creators/campaigns/${id}`);
    return res.data.data;
  },

  async updateCampaignStatus(id: string, status: string): Promise<CreatorCampaign> {
    const res = await api.patch(`/api/creators/campaigns/${id}/status`, { status });
    return res.data.data;
  },

  async deleteCampaign(id: string): Promise<void> {
    await api.delete(`/api/creators/campaigns/${id}`);
  },

  // ── Creator: applications ────────────────────────────────────────────

  async applyToCampaign(campaignId: string, message?: string): Promise<CreatorApplication> {
    const res = await api.post('/api/creators/applications', { campaignId, message });
    return res.data.data;
  },

  async getMyApplications(): Promise<CreatorApplication[]> {
    const res = await api.get('/api/creators/applications/me');
    return res.data.data;
  },

  async getCampaignApplications(campaignId: string): Promise<CreatorApplication[]> {
    const res = await api.get(`/api/creators/campaigns/${campaignId}/applications`);
    return res.data.data;
  },

  async reviewApplication(applicationId: string, status: string): Promise<CreatorApplication> {
    const res = await api.patch(`/api/creators/applications/${applicationId}`, { status });
    return res.data.data;
  },

  // ── Creator: collaborations ──────────────────────────────────────────

  async createCollaboration(data: {
    campaignId: string;
    creatorId: string;
    agreedFee: number;
    deliverables?: string;
  }): Promise<CreatorCollaboration> {
    const res = await api.post('/api/creators/collaborations', data);
    return res.data.data;
  },

  async getMyCollaborations(): Promise<CreatorCollaboration[]> {
    const res = await api.get('/api/creators/collaborations/me');
    return res.data.data;
  },

  async updateCollaborationStatus(id: string, status: string): Promise<CreatorCollaboration> {
    const res = await api.patch(`/api/creators/collaborations/${id}/status`, { status });
    return res.data.data;
  },

  async rateCollaboration(id: string, rating: number, review: string): Promise<CreatorCollaboration> {
    const res = await api.post(`/api/creators/collaborations/${id}/rate`, { rating, review });
    return res.data.data;
  },

  // ── Admin: creators ──────────────────────────────────────────────────

  async adminListCreators(): Promise<CreatorProfile[]> {
    const res = await api.get('/api/creators/admin/all');
    return res.data.data;
  },

  async adminVerifyCreator(id: string, isVerified: boolean): Promise<CreatorProfile> {
    const res = await api.patch(`/api/creators/admin/${id}/verify`, { isVerified });
    return res.data.data;
  },

  async adminToggleCreatorActive(id: string, isActive: boolean): Promise<CreatorProfile> {
    const res = await api.patch(`/api/creators/admin/${id}/active`, { isActive });
    return res.data.data;
  },

  async adminGetAllStars(): Promise<CreatorCollaboration[]> {
    const res = await api.get('/api/creators/admin/stars');
    return res.data.data;
  },
};

export default CreatorAPI;
