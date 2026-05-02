import api from "../../../routes/axiosConfig";
import type {
  BackendTicket,
  ConfirmPaymentResult,
  PurchaseItem,
  PurchaseResult,
  TicketsProvider,
  VerifyResult,
  PaymentProvider,
} from "../types";

export class ExpressTicketsProvider implements TicketsProvider {
  readonly mode = "express" as const;

  async purchase(data: {
    eventId: string;
    holderName: string;
    holderEmail: string;
    items: PurchaseItem[];
    delivery?: {
      method: "email" | "physical";
      cityId?: string;
      recipientName?: string;
      recipientPhone?: string;
      street?: string;
      additionalInfo?: string;
    };
  }): Promise<PurchaseResult & { deliveryFee?: number }> {
    const res = await api.post("/api/tickets/purchase", data);
    return res.data.data;
  }

  async getMyTickets(): Promise<BackendTicket[]> {
    const res = await api.get("/api/tickets/my");
    return res.data.data;
  }

  async getTicketById(id: string): Promise<BackendTicket> {
    const res = await api.get(`/api/tickets/${id}`);
    return res.data.data;
  }

  async verifyTicket(qrData: string): Promise<VerifyResult> {
    const res = await api.post("/api/tickets/verify", { qrData });
    return res.data.data;
  }

  async getEventTickets(eventId: string): Promise<BackendTicket[]> {
    const res = await api.get(`/api/tickets/event/${eventId}`);
    return res.data.data;
  }

  async confirmAndPurchase(data: {
    eventId: string;
    holderName: string;
    holderEmail: string;
    holderPhone?: string;
    items: PurchaseItem[];
    delivery?: {
      method: "email" | "physical";
      zoneId?: string;
      recipientName?: string;
      recipientPhone?: string;
      additionalInfo?: string;
    };
    paymentProvider: PaymentProvider;
    paymentId: string;
  }): Promise<ConfirmPaymentResult> {
    const res = await api.post("/api/payments/confirm", data);
    return res.data.data;
  }
}
