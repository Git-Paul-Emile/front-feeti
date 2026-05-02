import { backendGateway } from "../backend";
import type {
  BackendTicket,
  ConfirmPaymentResult,
  PurchaseItem,
  PurchaseResult,
  VerifyResult,
} from "../backend";

export type {
  BackendTicket,
  PurchaseItem,
  PurchaseResult,
  ConfirmPaymentResult,
  VerifyResult,
};

const TicketAPI = {
  purchase(data: {
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
    return backendGateway.tickets.purchase(data);
  },

  getMyTickets(): Promise<BackendTicket[]> {
    return backendGateway.tickets.getMyTickets();
  },

  getTicketById(id: string): Promise<BackendTicket> {
    return backendGateway.tickets.getTicketById(id);
  },

  verifyTicket(qrData: string): Promise<VerifyResult> {
    return backendGateway.tickets.verifyTicket(qrData);
  },

  getEventTickets(eventId: string): Promise<BackendTicket[]> {
    return backendGateway.tickets.getEventTickets(eventId);
  },

  confirmAndPurchase(data: {
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
    paymentProvider: "stripe" | "mobile_money" | "paystack";
    paymentId: string;
  }): Promise<ConfirmPaymentResult> {
    return backendGateway.tickets.confirmAndPurchase(data);
  },
};

export default TicketAPI;
