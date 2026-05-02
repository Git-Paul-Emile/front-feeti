import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import { EventService, TicketService, TransactionService, type Ticket as FirebaseTicket } from "../../FirebaseService";
import type {
  BackendTicket,
  ConfirmPaymentResult,
  PaymentProvider,
  PurchaseItem,
  PurchaseResult,
  TicketsProvider,
  VerifyResult,
} from "../types";

function toDateString(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (typeof value === "object" && "toDate" in (value as Record<string, unknown>)) {
    return ((value as { toDate: () => Date }).toDate()).toISOString();
  }
  return new Date().toISOString();
}

function adaptTicket(ticket: FirebaseTicket): BackendTicket {
  return {
    id: ticket.id ?? "",
    eventId: ticket.eventId,
    userId: ticket.userId,
    category: ticket.eventTitle || "standard",
    price: ticket.price,
    currency: ticket.currency,
    holderName: ticket.holderName,
    holderEmail: ticket.holderEmail,
    qrData: ticket.qrCode,
    status: ticket.status === "cancelled" ? "expired" : ticket.status,
    orderId: ticket.transactionId,
    usedAt: ticket.usedDate ? toDateString(ticket.usedDate) : null,
    createdAt: toDateString(ticket.createdAt),
  };
}

export class FirebaseTicketsProvider implements TicketsProvider {
  readonly mode = "firebase" as const;

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
    const paymentId = `pending_${Date.now()}`;
    const result = await this.confirmAndPurchase({
      eventId: data.eventId,
      holderName: data.holderName,
      holderEmail: data.holderEmail,
      items: data.items,
      delivery: data.delivery
        ? {
            method: data.delivery.method,
            recipientName: data.delivery.recipientName,
            recipientPhone: data.delivery.recipientPhone,
            additionalInfo: data.delivery.additionalInfo,
          }
        : undefined,
      paymentProvider: "mobile_money",
      paymentId,
    });

    return {
      orderId: result.orderId,
      tickets: result.tickets,
      deliveryFee: result.deliveryFee,
    };
  }

  async getMyTickets(): Promise<BackendTicket[]> {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];
    const tickets = await TicketService.getUserTickets(uid);
    return tickets.map(adaptTicket);
  }

  async getTicketById(id: string): Promise<BackendTicket> {
    const ticket = await TicketService.getTicketById(id);
    if (!ticket) throw new Error("Billet introuvable");
    return adaptTicket(ticket);
  }

  async verifyTicket(qrData: string): Promise<VerifyResult> {
    let payload: { ticketId?: string; eventId?: string } = {};
    try {
      payload = JSON.parse(qrData);
    } catch {
      throw new Error("QR Code invalide");
    }

    if (!payload.ticketId) throw new Error("QR Code invalide");

    const result = await TicketService.verifyAndUseTicket(payload.ticketId, qrData);
    if (!result.success || !result.ticket) throw new Error(result.error || "Verification impossible");

    const event = payload.eventId ? await EventService.getEventById(payload.eventId) : null;

    return {
      id: result.ticket.id ?? payload.ticketId,
      status: result.ticket.status,
      holderName: result.ticket.holderName,
      holderEmail: result.ticket.holderEmail,
      category: result.ticket.eventTitle,
      event: {
        title: event?.title ?? result.ticket.eventTitle,
        date: event?.date ?? result.ticket.eventDate,
        location: event?.location ?? result.ticket.eventLocation,
      },
      usedAt: result.ticket.usedDate ? toDateString(result.ticket.usedDate) : null,
    };
  }

  async getEventTickets(eventId: string): Promise<BackendTicket[]> {
    const snapshot = await getDocs(
      query(collection(db, "tickets"), where("eventId", "==", eventId), orderBy("purchaseDate", "desc"))
    );

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as FirebaseTicket;
      return adaptTicket({ ...data, id: docSnap.id });
    });
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
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Non authentifie");

    const event = await EventService.getEventById(data.eventId);
    if (!event) throw new Error("Evenement introuvable");

    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    await TransactionService.createTransaction({
      userId: uid,
      eventId: data.eventId,
      amount: totalAmount,
      currency: event.currency,
      status: "completed",
      paymentMethod: data.paymentProvider,
      tickets: data.items.reduce((sum, item) => sum + item.quantity, 0),
      completedAt: undefined,
    });

    const created = await TicketService.createTickets(
      data.items.flatMap((item) =>
        Array.from({ length: item.quantity }, () => ({
          eventId: data.eventId,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          eventLocation: event.location,
          eventImage: event.image,
          price: item.price,
          currency: event.currency,
          holderName: data.holderName,
          holderEmail: data.holderEmail,
          holderPhone: data.holderPhone,
          userId: uid,
          qrCode: JSON.stringify({
            ticketId: crypto.randomUUID(),
            orderId: data.paymentId,
            eventId: data.eventId,
            timestamp: Date.now(),
          }),
          status: "valid" as const,
          purchaseDate: new Date() as any,
          quantity: 1,
          transactionId: data.paymentId,
        }))
      )
    );

    const tickets = await Promise.all(created.map((id) => this.getTicketById(id)));

    return {
      orderId: data.paymentId,
      tickets,
      deliveryFee: 0,
      emailSent: false,
    };
  }
}
