// Events API Service
// Gestion complète des événements avec cache et optimisations

import BaseAPIService, { APIResponse } from './BaseAPI';
import FirebaseService, { Event as FirebaseEvent } from '../FirebaseService';

export interface Event extends FirebaseEvent {}

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
   */
  async getAllEvents(filters?: EventFilters): Promise<APIResponse<Event[]>> {
    const cacheKey = `events:all:${JSON.stringify(filters || {})}`;

    return this.request(
      cacheKey,
      async () => {
        const events = await FirebaseService.Event.getAllEvents(filters);
        
        // Trier par date
        return events.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
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
        const event = await FirebaseService.Event.getEventById(eventId);
        
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
  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<string>> {
    return this.request(
      'events:create',
      async () => {
        const result = await FirebaseService.Event.createEvent(eventData);
        
        if (!result.success || !result.id) {
          throw new Error(result.error || 'Erreur lors de la création');
        }

        // Invalider le cache
        this.invalidateCache('events:');

        this.showToast('success', 'Événement créé avec succès');
        return result.id;
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
        const result = await FirebaseService.Event.updateEvent(eventId, updates);
        
        if (!result.success) {
          throw new Error(result.error || 'Erreur lors de la mise à jour');
        }

        // Invalider le cache
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
        const result = await FirebaseService.Event.deleteEvent(eventId);
        
        if (!result.success) {
          throw new Error(result.error || 'Erreur lors de la suppression');
        }

        // Invalider le cache
        this.invalidateCache('events:');

        this.showToast('success', 'Événement supprimé avec succès');
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Récupérer les événements d'un organisateur
   */
  async getOrganizerEvents(organizerId: string): Promise<APIResponse<Event[]>> {
    const cacheKey = `events:organizer:${organizerId}`;

    return this.request(
      cacheKey,
      async () => {
        return await FirebaseService.Event.getEventsByOrganizer(organizerId);
      },
      { cache: true }
    );
  }

  /**
   * Récupérer les événements live
   */
  async getLiveEvents(): Promise<APIResponse<Event[]>> {
    return this.getAllEvents({ isLive: true, status: 'published' });
  }

  /**
   * Récupérer les événements à venir
   */
  async getUpcomingEvents(limit?: number): Promise<APIResponse<Event[]>> {
    const cacheKey = `events:upcoming:${limit || 'all'}`;

    return this.request(
      cacheKey,
      async () => {
        const events = await FirebaseService.Event.getAllEvents({ status: 'published' });
        const now = new Date();

        return events
          .filter(event => new Date(event.date) >= now)
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
        const events = await FirebaseService.Event.getAllEvents({ status: 'published' });
        const searchQuery = query.toLowerCase();

        return events.filter(event =>
          event.title.toLowerCase().includes(searchQuery) ||
          event.description?.toLowerCase().includes(searchQuery) ||
          event.location.toLowerCase().includes(searchQuery) ||
          event.category.toLowerCase().includes(searchQuery) ||
          event.tags.some(tag => tag.toLowerCase().includes(searchQuery))
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
        const stats = await FirebaseService.Analytics.getEventStats();
        
        if (!stats) {
          throw new Error('Impossible de récupérer les statistiques');
        }

        const events = await FirebaseService.Event.getAllEvents();
        
        // Calculer les catégories populaires
        const categoryCounts: Record<string, number> = {};
        events.forEach(event => {
          categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
        });

        const popularCategories = Object.entries(categoryCounts)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Calculer le prix moyen
        const totalPrice = events.reduce((sum, event) => sum + event.price, 0);
        const averagePrice = events.length > 0 ? totalPrice / events.length : 0;

        return {
          ...stats,
          averagePrice,
          popularCategories
        };
      },
      { cache: true, cacheDuration: 10 * 60 * 1000 } // 10 minutes
    );
  }

  /**
   * Incrémenter le nombre de participants
   */
  async incrementAttendees(eventId: string, count: number = 1): Promise<APIResponse<void>> {
    return this.request(
      `events:increment:${eventId}`,
      async () => {
        const result = await FirebaseService.Event.incrementAttendees(eventId, count);
        
        if (!result.success) {
          throw new Error(result.error || 'Erreur lors de la mise à jour');
        }

        // Invalider le cache pour cet événement
        this.invalidateCache(`events:${eventId}`);
        this.invalidateCache('events:all');
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Récupérer les événements par catégorie
   */
  async getEventsByCategory(category: string): Promise<APIResponse<Event[]>> {
    return this.getAllEvents({ category, status: 'published' });
  }

  /**
   * Récupérer les événements dans une plage de prix
   */
  async getEventsByPriceRange(minPrice: number, maxPrice: number): Promise<APIResponse<Event[]>> {
    const cacheKey = `events:price:${minPrice}-${maxPrice}`;

    return this.request(
      cacheKey,
      async () => {
        const events = await FirebaseService.Event.getAllEvents({ status: 'published' });
        
        return events.filter(event =>
          event.price >= minPrice && event.price <= maxPrice
        );
      },
      { cache: true }
    );
  }

  /**
   * Récupérer les événements gratuits
   */
  async getFreeEvents(): Promise<APIResponse<Event[]>> {
    return this.getEventsByPriceRange(0, 0);
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
        const event = await FirebaseService.Event.getEventById(eventId);
        
        if (!event) {
          throw new Error('Événement introuvable');
        }

        const remainingSeats = event.maxAttendees - event.attendees;
        const percentage = (event.attendees / event.maxAttendees) * 100;

        return {
          available: remainingSeats > 0,
          remainingSeats,
          percentage
        };
      },
      { cache: true, cacheDuration: 1 * 60 * 1000 } // 1 minute
    );
  }
}

// Export singleton
const EventsAPI = new EventsAPIService();
export default EventsAPI;
