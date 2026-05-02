import {
  AnalyticsService,
  EventService,
  type Event as FirebaseEvent,
} from "../../FirebaseService";
import type { APIResponse } from "../../api/BaseAPI";
import type {
  Event,
  EventFilters,
  EventStats,
} from "../../api/EventsAPI";
import type { EventsProvider } from "../types";

function createSuccess<T>(data: T): APIResponse<T> {
  return { success: true, data };
}

function createError<T>(message: string, code = "provider_error"): APIResponse<T> {
  return { success: false, error: message, code };
}

function toDateString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toDate" in (value as Record<string, unknown>)) {
    return ((value as { toDate: () => Date }).toDate()).toISOString();
  }
  return new Date().toISOString();
}

function adaptEvent(event: FirebaseEvent): Event {
  return {
    id: event.id ?? "",
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    location: event.location,
    image: event.image,
    price: event.price,
    currency: event.currency,
    category: event.category,
    maxAttendees: event.maxAttendees,
    attendees: event.attendees,
    isLive: event.isLive,
    organizerId: event.organizerId,
    status: event.status,
    createdAt: toDateString(event.createdAt),
    updatedAt: toDateString(event.updatedAt),
  };
}

function applyFilters(events: Event[], filters?: EventFilters): Event[] {
  if (!filters) return events;

  return events.filter((event) => {
    if (filters.category && event.category !== filters.category) return false;
    if (filters.isLive !== undefined && event.isLive !== filters.isLive) return false;
    if (filters.status && event.status !== filters.status) return false;
    if (filters.organizerId && event.organizerId !== filters.organizerId) return false;
    if (filters.location && !event.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.minPrice !== undefined && event.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && event.price > filters.maxPrice) return false;
    if (filters.startDate && new Date(event.date) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(event.date) > new Date(filters.endDate)) return false;
    return true;
  });
}

function buildStats(events: Event[]): EventStats {
  const categoryCounts = new Map<string, number>();
  for (const event of events) {
    categoryCounts.set(event.category, (categoryCounts.get(event.category) ?? 0) + 1);
  }

  return {
    totalEvents: events.length,
    liveEvents: events.filter((event) => event.isLive).length,
    publishedEvents: events.filter((event) => event.status === "published").length,
    totalAttendees: events.reduce((sum, event) => sum + event.attendees, 0),
    averagePrice: events.length
      ? events.reduce((sum, event) => sum + event.price, 0) / events.length
      : 0,
    popularCategories: [...categoryCounts.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export class FirebaseEventsProvider implements EventsProvider {
  readonly mode = "firebase" as const;

  async getAllEvents(filters?: EventFilters): Promise<APIResponse<Event[]>> {
    try {
      const events = await EventService.getAllEvents({
        category: filters?.category,
        isLive: filters?.isLive,
        status: filters?.status,
      });

      return createSuccess(
        applyFilters(events.map(adaptEvent), filters).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    } catch (error) {
      return createError((error as Error).message || "Impossible de charger les evenements");
    }
  }

  async getEventById(eventId: string): Promise<APIResponse<Event>> {
    try {
      const event = await EventService.getEventById(eventId);
      if (!event) return createError("Evenement introuvable", "not-found");
      return createSuccess(adaptEvent(event));
    } catch (error) {
      return createError((error as Error).message || "Impossible de charger l'evenement");
    }
  }

  async createEvent(
    eventData: Omit<Event, "id" | "createdAt" | "updatedAt" | "attendees" | "organizer">
  ): Promise<APIResponse<string>> {
    try {
      const result = await EventService.createEvent({
        ...eventData,
        attendees: 0,
      });

      if (!result.success || !result.id) {
        return createError(result.error || "Creation de l'evenement impossible");
      }

      return createSuccess(result.id);
    } catch (error) {
      return createError((error as Error).message || "Creation de l'evenement impossible");
    }
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<APIResponse<void>> {
    try {
      const result = await EventService.updateEvent(eventId, updates);
      if (!result.success) return createError(result.error || "Mise a jour impossible");
      return createSuccess(undefined);
    } catch (error) {
      return createError((error as Error).message || "Mise a jour impossible");
    }
  }

  async deleteEvent(eventId: string): Promise<APIResponse<void>> {
    try {
      const result = await EventService.deleteEvent(eventId);
      if (!result.success) return createError(result.error || "Suppression impossible");
      return createSuccess(undefined);
    } catch (error) {
      return createError((error as Error).message || "Suppression impossible");
    }
  }

  async getOrganizerEvents(organizerId?: string): Promise<APIResponse<Event[]>> {
    try {
      if (!organizerId) return createSuccess([]);
      const events = await EventService.getEventsByOrganizer(organizerId);
      return createSuccess(events.map(adaptEvent));
    } catch (error) {
      return createError((error as Error).message || "Impossible de charger les evenements");
    }
  }

  async getLiveEvents(): Promise<APIResponse<Event[]>> {
    return this.getAllEvents({ isLive: true });
  }

  async getUpcomingEvents(limit?: number): Promise<APIResponse<Event[]>> {
    const response = await this.getAllEvents();
    if (!response.success || !response.data) return response;

    const now = new Date();
    const upcoming = response.data
      .filter((event) => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return createSuccess(limit ? upcoming.slice(0, limit) : upcoming);
  }

  async searchEvents(searchQuery: string): Promise<APIResponse<Event[]>> {
    const response = await this.getAllEvents();
    if (!response.success || !response.data) return response;

    const normalized = searchQuery.toLowerCase();
    return createSuccess(
      response.data.filter((event) =>
        [event.title, event.description, event.location, event.category]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalized))
      )
    );
  }

  async getEventStats(): Promise<APIResponse<EventStats>> {
    try {
      const stats = await AnalyticsService.getEventStats();
      if (!stats) {
        const fallback = await this.getAllEvents();
        if (!fallback.success || !fallback.data) {
          return createError("Impossible de calculer les statistiques");
        }
        return createSuccess(buildStats(fallback.data));
      }

      const allEvents = await this.getAllEvents();
      const popularCategories = allEvents.success && allEvents.data
        ? buildStats(allEvents.data).popularCategories
        : [];

      return createSuccess({
        totalEvents: stats.totalEvents,
        liveEvents: stats.liveEvents,
        publishedEvents: stats.publishedEvents,
        totalAttendees: stats.totalAttendees,
        averagePrice: allEvents.success && allEvents.data?.length
          ? allEvents.data.reduce((sum, event) => sum + event.price, 0) / allEvents.data.length
          : 0,
        popularCategories,
      });
    } catch (error) {
      return createError((error as Error).message || "Impossible de calculer les statistiques");
    }
  }

  async checkAvailability(eventId: string): Promise<APIResponse<boolean>> {
    const response = await this.getEventById(eventId);
    if (!response.success || !response.data) {
      return createError("Evenement introuvable", "not-found");
    }

    const event = response.data;
    return createSuccess(event.status === "published" && event.attendees < event.maxAttendees);
  }
}
