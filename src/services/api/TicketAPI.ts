import api from '../../routes/axiosConfig';

export interface BackendTicket {
  id: string;
  eventId: string;
  userId: string;
  category: string;
  price: number;
  currency: string;
  holderName: string;
  holderEmail: string;
  qrData: string;
  status: 'valid' | 'used' | 'expired';
  orderId: string;
  usedAt: string | null;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    image: string;
    category: string;
    organizerId: string;
  };
}

export interface PurchaseItem {
  category: string;
  quantity: number;
  price: number;
}

export interface PurchaseResult {
  orderId: string;
  tickets: BackendTicket[];
}

export interface VerifyResult {
  id: string;
  status: string;
  holderName: string;
  holderEmail: string;
  category: string;
  event: { title: string; date: string; location: string };
  usedAt: string | null;
}

const TicketAPI = {
  async purchase(data: {
    eventId: string;
    holderName: string;
    holderEmail: string;
    items: PurchaseItem[];
    delivery?: {
      method: 'email' | 'physical';
      cityId?: string;
      recipientName?: string;
      recipientPhone?: string;
      street?: string;
      additionalInfo?: string;
    };
  }): Promise<PurchaseResult & { deliveryFee?: number }> {
    const res = await api.post('/api/tickets/purchase', data);
    return res.data.data;
  },

  async getMyTickets(): Promise<BackendTicket[]> {
    const res = await api.get('/api/tickets/my');
    return res.data.data;
  },

  async getTicketById(id: string): Promise<BackendTicket> {
    const res = await api.get(`/api/tickets/${id}`);
    return res.data.data;
  },

  async verifyTicket(qrData: string): Promise<VerifyResult> {
    const res = await api.post('/api/tickets/verify', { qrData });
    return res.data.data;
  },

  async getEventTickets(eventId: string): Promise<BackendTicket[]> {
    const res = await api.get(`/api/tickets/event/${eventId}`);
    return res.data.data;
  },
};

export default TicketAPI;
