import { auth } from "../../../config/firebase";
import {
  EventService,
  StorageService,
  type Event as FirebaseEvent,
} from "../../FirebaseService";
import type {
  BackendEvent,
  CatalogEventsProvider,
  CreateBackendEventInput,
  PromotionSlots,
  PromotionStatus,
  PromotionType,
} from "../types";

const FAVORITES_KEY = "feeti_firebase_favorites";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(FAVORITES_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

function toDateString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toDate" in (value as Record<string, unknown>)) {
    return ((value as { toDate: () => Date }).toDate()).toISOString();
  }
  return new Date().toISOString();
}

function adaptEvent(event: FirebaseEvent): BackendEvent {
  const favorites = new Set(readFavorites());
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
    duration: undefined,
    salesBlocked: Boolean((event as FirebaseEvent & { salesBlocked?: boolean }).salesBlocked),
    isLive: event.isLive,
    isFeatured: Boolean((event as FirebaseEvent & { isFeatured?: boolean }).isFeatured),
    isFavorite: favorites.has(event.id ?? ""),
    status: event.status,
    streamUrl: (event as FirebaseEvent & { streamUrl?: string }).streamUrl,
    videoUrl: (event as FirebaseEvent & { videoUrl?: string }).videoUrl,
    countryCode: (event as FirebaseEvent & { countryCode?: string }).countryCode,
    organizerId: event.organizerId,
    organizer: event.organizer ? { name: event.organizer } : undefined,
    createdAt: toDateString(event.createdAt),
    updatedAt: toDateString(event.updatedAt),
    promotionType: ((event as FirebaseEvent & { promotionType?: PromotionType | null }).promotionType ?? null),
    promotionStatus: ((event as FirebaseEvent & { promotionStatus?: PromotionStatus | null }).promotionStatus ?? null),
    promotionStartDate: ((event as FirebaseEvent & { promotionStartDate?: string | null }).promotionStartDate ?? null),
    promotionEndDate: ((event as FirebaseEvent & { promotionEndDate?: string | null }).promotionEndDate ?? null),
  };
}

export class FirebaseCatalogEventsProvider implements CatalogEventsProvider {
  readonly mode = "firebase" as const;

  async uploadImage(file: File): Promise<string> {
    const url = await StorageService.uploadImage(file, "feeti/events");
    if (!url) throw new Error("Upload image impossible");
    return url;
  }

  async getMyEvents(): Promise<BackendEvent[]> {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];
    const events = await EventService.getEventsByOrganizer(uid);
    return events.map(adaptEvent);
  }

  async getAllEvents(countryCode?: string): Promise<BackendEvent[]> {
    const events = await EventService.getAllEvents();
    return events
      .map(adaptEvent)
      .filter((event) => !countryCode || event.countryCode === countryCode);
  }

  async getFeaturedEvents(countryCode?: string): Promise<BackendEvent[]> {
    const events = await this.getAllEvents(countryCode);
    return events.filter((event) => event.isFeatured);
  }

  async getEventById(id: string): Promise<BackendEvent> {
    const event = await EventService.getEventById(id);
    if (!event) throw new Error("Evenement introuvable");
    return adaptEvent(event);
  }

  async getAllEventsAdmin(): Promise<BackendEvent[]> {
    return this.getAllEvents();
  }

  async toggleHighlight(
    id: string,
    data: { isFeatured?: boolean; isFavorite?: boolean }
  ): Promise<BackendEvent> {
    const current = await this.getEventById(id);
    await EventService.updateEvent(id, {
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
    } as Partial<FirebaseEvent>);

    if (data.isFavorite !== undefined) {
      if (data.isFavorite !== current.isFavorite) {
        await this.toggleFavorite(id);
      }
    }

    return this.getEventById(id);
  }

  async createEvent(data: CreateBackendEventInput): Promise<BackendEvent> {
    const organizerId = auth.currentUser?.uid ?? "unknown";
    const result = await EventService.createEvent({
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time,
      location: data.location,
      image: data.image ?? "",
      price: data.price ?? 0,
      currency: data.currency ?? "FCFA",
      category: data.category,
      tags: [],
      attendees: 0,
      maxAttendees: data.maxAttendees,
      isLive: data.isLive ?? false,
      organizer: auth.currentUser?.displayName ?? "Organisateur",
      organizerId,
      status: (data.status as FirebaseEvent["status"]) ?? "draft",
      streamUrl: data.streamUrl,
      videoUrl: data.videoUrl,
      countryCode: data.countryCode,
      salesBlocked: false,
      isFeatured: false,
      duration: data.duration,
      vipPrice: data.vipPrice,
      ticketTypes: data.ticketTypes,
    } as FirebaseEvent & Record<string, unknown>);

    if (!result.success || !result.id) {
      throw new Error(result.error || "Creation evenement impossible");
    }

    return this.getEventById(result.id);
  }

  async deleteEvent(id: string): Promise<void> {
    const result = await EventService.deleteEvent(id);
    if (!result.success) throw new Error(result.error || "Suppression impossible");
  }

  async updateEvent(id: string, data: Partial<CreateBackendEventInput>): Promise<BackendEvent> {
    const result = await EventService.updateEvent(id, data as Partial<FirebaseEvent>);
    if (!result.success) throw new Error(result.error || "Mise a jour impossible");
    return this.getEventById(id);
  }

  async toggleFavorite(id: string): Promise<{ isFavorited: boolean }> {
    const favorites = new Set(readFavorites());
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    writeFavorites([...favorites]);
    return { isFavorited: favorites.has(id) };
  }

  async checkFavorite(id: string): Promise<boolean> {
    return new Set(readFavorites()).has(id);
  }

  async getMyFavorites(): Promise<BackendEvent[]> {
    const ids = readFavorites();
    const events = await Promise.all(ids.map(async (id) => this.getEventById(id).catch(() => null)));
    return events.filter((event): event is BackendEvent => Boolean(event));
  }

  async toggleSalesBlocked(id: string): Promise<{ salesBlocked: boolean }> {
    const current = await this.getEventById(id);
    const nextValue = !current.salesBlocked;
    await EventService.updateEvent(id, { salesBlocked: nextValue } as Partial<FirebaseEvent>);
    return { salesBlocked: nextValue };
  }

  async updatePromotion(
    id: string,
    data: {
      promotionType?: PromotionType | null;
      promotionStatus?: PromotionStatus;
      promotionStartDate?: string | null;
      promotionEndDate?: string | null;
    }
  ): Promise<BackendEvent> {
    const result = await EventService.updateEvent(id, data as Partial<FirebaseEvent>);
    if (!result.success) throw new Error(result.error || "Promotion impossible");
    return this.getEventById(id);
  }

  async getPromotionSlots(): Promise<PromotionSlots[]> {
    const events = await this.getAllEventsAdmin();
    const limits: Record<string, number> = {
      OR: 2,
      ARGENT: 4,
      BRONZE: 8,
      LITE: 20,
    };

    return Object.entries(limits).map(([type, limit]) => {
      const used = events.filter((event) => event.promotionType === type).length;
      return { type, limit, used, available: Math.max(limit - used, 0) };
    });
  }
}
