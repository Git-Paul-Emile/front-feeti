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

  async updateEventStatus(eventId: string, status: string): Promise<void> {
    await api.patch(`/api/admin/events/${eventId}/status`, { status });
  },

  async getTicketsStats(): Promise<TicketStats> {
    const res = await api.get('/api/admin/tickets/stats');
    return res.data.data;
  },

  async getTickets(limit = 20): Promise<AdminTicket[]> {
    const res = await api.get(`/api/admin/tickets?limit=${limit}`);
    return res.data.data;
  },
};

export default AdminAPI;
