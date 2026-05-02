import { backendGateway } from "../backend";
import type {
  BackendEvent,
  CreateBackendEventInput as CreateEventInput,
  PromotionSlots,
  PromotionStatus,
  PromotionType,
} from "../backend";

export type {
  BackendEvent,
  CreateEventInput,
  PromotionSlots,
  PromotionStatus,
  PromotionType,
};

const EventsBackendAPI = {
  uploadImage(file: File): Promise<string> {
    return backendGateway.catalogEvents.uploadImage(file);
  },

  getMyEvents(): Promise<BackendEvent[]> {
    return backendGateway.catalogEvents.getMyEvents();
  },

  getAllEvents(countryCode?: string): Promise<BackendEvent[]> {
    return backendGateway.catalogEvents.getAllEvents(countryCode);
  },

  getFeaturedEvents(countryCode?: string): Promise<BackendEvent[]> {
    return backendGateway.catalogEvents.getFeaturedEvents(countryCode);
  },

  getEventById(id: string): Promise<BackendEvent> {
    return backendGateway.catalogEvents.getEventById(id);
  },

  getAllEventsAdmin(): Promise<BackendEvent[]> {
    return backendGateway.catalogEvents.getAllEventsAdmin();
  },

  toggleHighlight(id: string, data: { isFeatured?: boolean; isFavorite?: boolean }): Promise<BackendEvent> {
    return backendGateway.catalogEvents.toggleHighlight(id, data);
  },

  createEvent(data: CreateEventInput): Promise<BackendEvent> {
    return backendGateway.catalogEvents.createEvent(data);
  },

  deleteEvent(id: string): Promise<void> {
    return backendGateway.catalogEvents.deleteEvent(id);
  },

  updateEvent(id: string, data: Partial<CreateEventInput>): Promise<BackendEvent> {
    return backendGateway.catalogEvents.updateEvent(id, data);
  },

  toggleFavorite(id: string): Promise<{ isFavorited: boolean }> {
    return backendGateway.catalogEvents.toggleFavorite(id);
  },

  checkFavorite(id: string): Promise<boolean> {
    return backendGateway.catalogEvents.checkFavorite(id);
  },

  getMyFavorites(): Promise<BackendEvent[]> {
    return backendGateway.catalogEvents.getMyFavorites();
  },

  toggleSalesBlocked(id: string): Promise<{ salesBlocked: boolean }> {
    return backendGateway.catalogEvents.toggleSalesBlocked(id);
  },

  updatePromotion(
    id: string,
    data: {
      promotionType?: PromotionType | null;
      promotionStatus?: PromotionStatus;
      promotionStartDate?: string | null;
      promotionEndDate?: string | null;
    }
  ): Promise<BackendEvent> {
    return backendGateway.catalogEvents.updatePromotion(id, data);
  },

  getPromotionSlots(): Promise<PromotionSlots[]> {
    return backendGateway.catalogEvents.getPromotionSlots();
  },
};

export default EventsBackendAPI;
