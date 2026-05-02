// Events API Service
// Gestion complète des événements via Express backend

import BaseAPIService, { APIResponse } from './BaseAPI';
import api from '../../routes/axiosConfig';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  price: number;
  vipPrice?: number;
  ticketTypes?: string;
  currency: string;
  category: string;
  maxAttendees: number;
  attendees: number;
  isLive: boolean;
  eventType?: 'PRESENTIEL' | 'STREAMING_LIVE' | 'MIXTE';
  streamUrl?: string;
  videoUrl?: string;
  countryCode?: string;
  organizerId: string;
  organizer?: { name: string };
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  isFeatured?: boolean;
  salesBlocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  category?: string;
  isLive?: boolean;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  organizerId?: string;
  country?: string;
  featured?: boolean;
}

export interface EventStats {
  totalEvents: number;
  liveEvents: number;
  publishedEvents: number;
  totalAttendees: number;
  averagePrice: number;
  popularCategories: Array<{ category: string; count: number }>;
}

class EventsAPIService extends BaseAPIService {
  /**
   * Récupérer tous les événements avec filtres
   * Le backend retourne toujours les événements publiés, le filtrage fin se fait côté client.
   */
  async getAllEvents(filters?: EventFilters): Promise<APIResponse<Event[]>> {
    const cacheKey = `events:all:${JSON.stringify(filters || {})}`;

    return this.request(
      cacheKey,
      async () => {
        const params: Record<string, string> = {};
        if (filters?.country) params.country = filters.country;
        if (filters?.featured) params.featured = 'true';

        const query = new URLSearchParams(params).toString();
        const res = await api.get<{ data: Event[] }>(`/api/events${query ? `?${query}` : ''}`);
        let events: Event[] = res.data.data ?? [];

        // Filtrage client-side
        if (filters?.category) {
          events = events.filter(e => e.category === filters.category);
        }
        if (filters?.isLive !== undefined) {
          events = events.filter(e => e.isLive === filters.isLive);
        }
        if (filters?.minPrice !== undefined) {
          events = events.filter(e => e.price >= filters.minPrice!);
        }
        if (filters?.maxPrice !== undefined) {
          events = events.filter(e => e.price <= filters.maxPrice!);
        }
        if (filters?.location) {
          events = events.filter(e =>
            e.location.toLowerCase().includes(filters.location!.toLowerCase())
          );
        }
        if (filters?.startDate) {
          events = events.filter(e => new Date(e.date) >= new Date(filters.startDate!));
        }
        if (filters?.endDate) {
          events = events.filter(e => new Date(e.date) <= new Date(filters.endDate!));
        }

        return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      { cache: true }
    );
  }

  /**
   * Récupérer un événement par ID
   */
  async getEventById(eventId: string): Promise<APIResponse<Event>> {
    const cacheKey = `events:${eventId}`;

    return this.request(
      cacheKey,
      async () => {
        const res = await api.get<{ data: Event }>(`/api/events/${eventId}`);
        const event = res.data.data;

        if (!event) {
          throw new Error('Événement introuvable');
        }

        return event;
      },
      { cache: true }
    );
  }

  /**
   * Créer un nouvel événement
   */
  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'attendees' | 'organizer'>): Promise<APIResponse<string>> {
    return this.request(
      'events:create',
      async () => {
        const res = await api.post<{ data: Event }>('/api/events', eventData);
        const created = res.data.data;

        if (!created?.id) {
          throw new Error('Erreur lors de la création');
        }

        this.invalidateCache('events:');
        this.showToast('success', 'Événement créé avec succès');
        return created.id;
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Mettre à jour un événement
   */
  async updateEvent(eventId: string, updates: Partial<Event>): Promise<APIResponse<void>> {
    return this.request(
      `events:update:${eventId}`,
      async () => {
        await api.put(`/api/events/${eventId}`, updates);
        this.invalidateCache('events:');
        this.showToast('success', 'Événement mis à jour avec succès');
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Supprimer un événement
   */
  async deleteEvent(eventId: string): Promise<APIResponse<void>> {
    return this.request(
      `events:delete:${eventId}`,
      async () => {
        await api.delete(`/api/events/${eventId}`);
        this.invalidateCache('events:');
        this.showToast('success', 'Événement supprimé avec succès');
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Récupérer les événements de l'organisateur connecté
   */
  async getOrganizerEvents(_organizerId?: string): Promise<APIResponse<Event[]>> {
    const cacheKey = 'events:organizer:my';

    return this.request(
      cacheKey,
      async () => {
        const res = await api.get<{ data: Event[] }>('/api/events/my');
        return res.data.data ?? [];
      },
      { cache: true }
    );
  }

  /**
   * Récupérer les événements live
   */
  async getLiveEvents(): Promise<APIResponse<Event[]>> {
    return this.getAllEvents({ isLive: true });
  }

  /**
   * Récupérer les événements à venir
   */
  async getUpcomingEvents(limit?: number): Promise<APIResponse<Event[]>> {
    const cacheKey = `events:upcoming:${limit || 'all'}`;

    return this.request(
      cacheKey,
      async () => {
        const res = await api.get<{ data: Event[] }>('/api/events');
        const events: Event[] = res.data.data ?? [];
        const now = new Date();

        return events
          .filter(e => new Date(e.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, limit);
      },
      { cache: true }
    );
  }

  /**
   * Rechercher des événements
   */
  async searchEvents(query: string): Promise<APIResponse<Event[]>> {
    const cacheKey = `events:search:${query}`;

    return this.request(
      cacheKey,
      async () => {
        const res = await api.get<{ data: Event[] }>('/api/events');
        const events: Event[] = res.data.data ?? [];
        const q = query.toLowerCase();

        return events.filter(e =>
          e.title.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
        );
      },
      { cache: true }
    );
  }

  /**
   * Récupérer les statistiques des événements
   */
  async getEventStats(): Promise<APIResponse<EventStats>> {
    const cacheKey = 'events:stats';

    return this.request(
      cacheKey,
      async () => {
        const res = await api.get<{ data: Event[] }>('/api/events');
        const events: Event[] = res.data.data ?? [];

        const categoryCounts: Record<string, number> = {};
        events.forEach(e => {
          categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
        });

        const popularCategories = Object.entries(categoryCounts)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const totalPrice = events.reduce((sum, e) => sum + e.price, 0);
        const averagePrice = events.length > 0 ? totalPrice / events.length : 0;
        const totalAttendees = events.reduce((sum, e) => sum + (e.attendees || 0), 0);

        return {
          totalEvents: events.length,
          liveEvents: events.filter(e => e.isLive).length,
          publishedEvents: events.filter(e => e.status === 'published').length,
          totalAttendees,
          averagePrice,
          popularCategories,
        };
      },
      { cache: true }
    );
  }

  /**
   * Incrémenter le nombre de participants (géré automatiquement par l'achat de billets)
   */
  async incrementAttendees(_eventId: string, _count: number = 1): Promise<APIResponse<void>> {
    // Les participants sont mis à jour côté backend lors de l'achat de billets
    return { success: true };
  }

  /**
   * Récupérer les événements par catégorie
   */
  async getEventsByCategory(category: string): Promise<APIResponse<Event[]>> {
    return this.getAllEvents({ category });
  }

  /**
   * Récupérer les événements dans une plage de prix
   */
  async getEventsByPriceRange(minPrice: number, maxPrice: number): Promise<APIResponse<Event[]>> {
    return this.getAllEvents({ minPrice, maxPrice });
  }

  /**
   * Récupérer les événements gratuits
   */
  async getFreeEvents(): Promise<APIResponse<Event[]>> {
    return this.getAllEvents({ minPrice: 0, maxPrice: 0 });
  }

  /**
   * Vérifier la disponibilité d'un événement
   */
  async checkAvailability(eventId: string): Promise<APIResponse<{
    available: boolean;
    remainingSeats: number;
    percentage: number;
  }>> {
    return this.request(
      `events:availability:${eventId}`,
      async () => {
        const res = await api.get<{ data: Event }>(`/api/events/${eventId}`);
        const event = res.data.data;

        if (!event) {
          throw new Error('Événement introuvable');
        }

        const remainingSeats = event.maxAttendees - (event.attendees || 0);
        const percentage = event.maxAttendees > 0
          ? ((event.attendees || 0) / event.maxAttendees) * 100
          : 0;

        return {
          available: remainingSeats > 0,
          remainingSeats,
          percentage,
        };
      },
      { cache: true }
    );
  }
}

// Export singleton
const EventsAPI = new EventsAPIService();
export default EventsAPI;
