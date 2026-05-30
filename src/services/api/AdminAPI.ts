import api from '../../routes/axiosConfig';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'organizer' | 'moderator' | 'admin' | 'super_admin';
  createdAt: string;
  updatedAt: string;
  _count: { events: number; tickets: number };
}

export interface TicketStats {
  totalSold: number;
  totalUsed: number;
  totalRefunded: number;
}

export interface AdminTicket {
  id: string;
  orderId: string;
  holderName: string;
  holderEmail: string;
  category: string;
  price: number;
  currency: string;
  status: string;
  usedAt: string | null;
  createdAt: string;
  event: { id: string; title: string };
  user: { id: string; name: string; email: string };
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditIntegrity {
  total: number;
  corrupted: number;
  corruptions: Array<{ id: string; expectedChecksum: string; storedChecksum: string }>;
}

const AdminAPI = {
  async getAllUsers(): Promise<AdminUser[]> {
    const res = await api.get('/api/admin/users');
    return res.data.data;
  },

  async updateUserRole(userId: string, role: string): Promise<{ id: string; name: string; email: string; role: string }> {
    const res = await api.patch(`/api/admin/users/${userId}/role`, { role });
    return res.data.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/api/admin/users/${userId}`);
  },

  async updateEventStatus(eventId: string, status: string, rejectionReason?: string): Promise<void> {
    await api.patch(`/api/admin/events/${eventId}/status`, { status, rejectionReason });
  },

  async getTicketsStats(): Promise<TicketStats> {
    const res = await api.get('/api/admin/tickets/stats');
    return res.data.data;
  },

  async getTickets(limit = 20): Promise<AdminTicket[]> {
    const res = await api.get(`/api/admin/tickets?limit=${limit}`);
    return res.data.data;
  },

  async getAuditLogs(params?: {
    action?: string;
    resource?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: AuditLogEntry[]; meta: { total: number; page: number; limit: number; pages: number } }> {
    const query = new URLSearchParams();
    if (params?.action) query.set('action', params.action);
    if (params?.resource) query.set('resource', params.resource);
    if (params?.userId) query.set('userId', params.userId);
    if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params?.dateTo) query.set('dateTo', params.dateTo);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`/reporting/audit${suffix}`);
    return { data: res.data.data, meta: res.data.meta };
  },

  async getAuditIntegrity(): Promise<AuditIntegrity> {
    const res = await api.get('/reporting/audit/integrity');
    return res.data.data;
  },

  async updateDealPromotion(dealId: string, data: {
    promotionType?: string | null;
    promotionStatus?: string;
    promotionStartDate?: string | null;
    promotionEndDate?: string | null;
  }): Promise<void> {
    await api.patch(`/api/admin/deals/${dealId}/promotion`, data);
  },

  async getDealPromotionSlots(): Promise<Array<{ type: string; limit: number; used: number; available: number }>> {
    const res = await api.get('/api/admin/deal-promotion-slots');
    return res.data.data;
  },
};

export default AdminAPI;
