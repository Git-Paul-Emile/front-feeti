import api from "../../../routes/axiosConfig";
import type {
  BackendEvent,
  CatalogEventsProvider,
  CreateBackendEventInput,
  PromotionSlots,
  PromotionStatus,
  PromotionType,
} from "../types";

export class ExpressCatalogEventsProvider implements CatalogEventsProvider {
  readonly mode = "express" as const;

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post("/api/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.url;
  }

  async getMyEvents(): Promise<BackendEvent[]> {
    const res = await api.get("/api/events/my");
    return res.data.data;
  }

  async getAllEvents(countryCode?: string): Promise<BackendEvent[]> {
    const params = countryCode ? { country: countryCode } : {};
    const res = await api.get("/api/events", { params });
    return res.data.data;
  }

  async getFeaturedEvents(countryCode?: string): Promise<BackendEvent[]> {
    const params: Record<string, string> = { featured: "true" };
    if (countryCode) params.country = countryCode;
    const res = await api.get("/api/events", { params });
    return res.data.data;
  }

  async getEventById(id: string): Promise<BackendEvent> {
    const res = await api.get(`/api/events/${id}`);
    return res.data.data;
  }

  async getAllEventsAdmin(): Promise<BackendEvent[]> {
    const res = await api.get("/api/admin/events");
    return res.data.data;
  }

  async toggleHighlight(
    id: string,
    data: { isFeatured?: boolean; isFavorite?: boolean }
  ): Promise<BackendEvent> {
    const res = await api.patch(`/api/admin/events/${id}/highlight`, data);
    return res.data.data;
  }

  async createEvent(data: CreateBackendEventInput): Promise<BackendEvent> {
    const res = await api.post("/api/events", data);
    return res.data.data;
  }

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/api/events/${id}`);
  }

  async updateEvent(id: string, data: Partial<CreateBackendEventInput>): Promise<BackendEvent> {
    const res = await api.put(`/api/events/${id}`, data);
    return res.data.data;
  }

  async toggleFavorite(id: string): Promise<{ isFavorited: boolean }> {
    const res = await api.post(`/api/events/${id}/favorite`);
    return res.data.data;
  }

  async checkFavorite(id: string): Promise<boolean> {
    const res = await api.get(`/api/events/${id}/favorite`);
    return res.data.data.isFavorited;
  }

  async getMyFavorites(): Promise<BackendEvent[]> {
    const res = await api.get("/api/events/favorites");
    return res.data.data;
  }

  async toggleSalesBlocked(id: string): Promise<{ salesBlocked: boolean }> {
    const res = await api.patch(`/api/events/${id}/toggle-sales-block`);
    return res.data.data;
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
    const res = await api.patch(`/api/admin/events/${id}/promotion`, data);
    return res.data.data;
  }

  async getPromotionSlots(): Promise<PromotionSlots[]> {
    const res = await api.get("/api/admin/promotion-slots");
    return res.data.data;
  }
}
