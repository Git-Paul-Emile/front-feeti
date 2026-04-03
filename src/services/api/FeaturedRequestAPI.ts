import api from '../../routes/axiosConfig';

export interface FeaturedRequest {
  id: string;
  eventId: string;
  organizerId: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  event: {
    id: string;
    title: string;
    description: string;
    image: string;
    date: string;
    time: string;
    location: string;
    category: string;
    price: number;
    currency: string;
    attendees: number;
    maxAttendees: number;
    isLive: boolean;
    isFeatured: boolean;
    status: string;
  };
  organizer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

const FeaturedRequestAPI = {
  // Organisateur : soumettre une demande
  async submitRequest(eventId: string, message?: string): Promise<FeaturedRequest> {
    const res = await api.post(`/api/events/${eventId}/featured-request`, { message });
    return res.data.data;
  },

  // Organisateur : voir ses demandes
  async getMyRequests(): Promise<FeaturedRequest[]> {
    const res = await api.get('/api/events/my-featured-requests');
    return res.data.data;
  },

  // Admin : voir toutes les demandes
  async getAllRequests(): Promise<FeaturedRequest[]> {
    const res = await api.get('/api/admin/featured-requests');
    return res.data.data;
  },

  // Admin : approuver
  async approve(requestId: string, adminNote?: string): Promise<void> {
    await api.patch(`/api/admin/featured-requests/${requestId}/approve`, { adminNote });
  },

  // Admin : rejeter
  async reject(requestId: string, adminNote?: string): Promise<void> {
    await api.patch(`/api/admin/featured-requests/${requestId}/reject`, { adminNote });
  },
};

export default FeaturedRequestAPI;
