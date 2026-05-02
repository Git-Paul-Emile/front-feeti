import EventsAPI, {
  type Event,
  type EventFilters,
  type EventStats,
} from "../../api/EventsAPI";
import type { APIResponse } from "../../api/BaseAPI";
import type { EventsProvider } from "../types";

export class ExpressEventsProvider implements EventsProvider {
  readonly mode = "express" as const;

  getAllEvents(filters?: EventFilters): Promise<APIResponse<Event[]>> {
    return EventsAPI.getAllEvents(filters);
  }

  getEventById(eventId: string): Promise<APIResponse<Event>> {
    return EventsAPI.getEventById(eventId);
  }

  createEvent(
    eventData: Omit<Event, "id" | "createdAt" | "updatedAt" | "attendees" | "organizer">
  ): Promise<APIResponse<string>> {
    return EventsAPI.createEvent(eventData);
  }

  updateEvent(eventId: string, updates: Partial<Event>): Promise<APIResponse<void>> {
    return EventsAPI.updateEvent(eventId, updates);
  }

  deleteEvent(eventId: string): Promise<APIResponse<void>> {
    return EventsAPI.deleteEvent(eventId);
  }

  getOrganizerEvents(organizerId?: string): Promise<APIResponse<Event[]>> {
    return EventsAPI.getOrganizerEvents(organizerId);
  }

  getLiveEvents(): Promise<APIResponse<Event[]>> {
    return EventsAPI.getLiveEvents();
  }

  getUpcomingEvents(limit?: number): Promise<APIResponse<Event[]>> {
    return EventsAPI.getUpcomingEvents(limit);
  }

  searchEvents(searchQuery: string): Promise<APIResponse<Event[]>> {
    return EventsAPI.searchEvents(searchQuery);
  }

  getEventStats(): Promise<APIResponse<EventStats>> {
    return EventsAPI.getEventStats();
  }

  checkAvailability(eventId: string): Promise<APIResponse<boolean>> {
    return EventsAPI.checkAvailability(eventId);
  }
}
