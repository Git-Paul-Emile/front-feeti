import type {
  AuthUser,
  ChangePasswordData,
  RegisterData,
  UpdateProfileData,
} from "../api/AuthAPI";
import type {
  Event,
  EventFilters,
  EventStats,
} from "../api/EventsAPI";
import type { APIResponse } from "../api/BaseAPI";

export type BackendProviderMode = "express" | "firebase";

export interface AuthStateListener {
  (user: AuthUser | null): void | Promise<void>;
}

export interface AuthProvider {
  readonly mode: BackendProviderMode;
  subscribe(listener: AuthStateListener): () => void;
  login(email: string, password: string): Promise<AuthUser>;
  register(data: RegisterData): Promise<AuthUser>;
  logout(): Promise<void>;
  updateProfile(data: UpdateProfileData): Promise<AuthUser>;
  changePassword(data: ChangePasswordData): Promise<void>;
  deleteAccount(password: string): Promise<void>;
  getCurrentProfile(): Promise<AuthUser | null>;
}

export interface EventsProvider {
  readonly mode: BackendProviderMode;
  getAllEvents(filters?: EventFilters): Promise<APIResponse<Event[]>>;
  getEventById(eventId: string): Promise<APIResponse<Event>>;
  createEvent(
    eventData: Omit<Event, "id" | "createdAt" | "updatedAt" | "attendees" | "organizer">
  ): Promise<APIResponse<string>>;
  updateEvent(eventId: string, updates: Partial<Event>): Promise<APIResponse<void>>;
  deleteEvent(eventId: string): Promise<APIResponse<void>>;
  getOrganizerEvents(organizerId?: string): Promise<APIResponse<Event[]>>;
  getLiveEvents(): Promise<APIResponse<Event[]>>;
  getUpcomingEvents(limit?: number): Promise<APIResponse<Event[]>>;
  searchEvents(searchQuery: string): Promise<APIResponse<Event[]>>;
  getEventStats(): Promise<APIResponse<EventStats>>;
  checkAvailability(eventId: string): Promise<APIResponse<boolean>>;
}

export type PromotionType = "OR" | "ARGENT" | "BRONZE" | "LITE";
export type PromotionStatus = "active" | "inactive" | "expired";

export interface BackendEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  price: number;
  vipPrice?: number;
  currency: string;
  category: string;
  maxAttendees: number;
  attendees: number;
  duration?: string;
  salesBlocked: boolean;
  isLive: boolean;
  isFeatured: boolean;
  isFavorite: boolean;
  status: string;
  streamUrl?: string;
  videoUrl?: string;
  countryCode?: string;
  organizerId: string;
  organizer?: { name: string };
  createdAt: string;
  updatedAt: string;
  promotionType?: PromotionType | null;
  promotionStatus?: PromotionStatus | null;
  promotionStartDate?: string | null;
  promotionEndDate?: string | null;
}

export interface CreateBackendEventInput {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  price?: number;
  vipPrice?: number;
  ticketTypes?: string;
  currency?: string;
  category: string;
  maxAttendees: number;
  duration?: string;
  isLive?: boolean;
  streamUrl?: string;
  videoUrl?: string;
  status?: string;
  countryCode?: string;
}

export interface PromotionSlots {
  type: string;
  limit: number;
  used: number;
  available: number;
}

export interface CatalogEventsProvider {
  readonly mode: BackendProviderMode;
  uploadImage(file: File): Promise<string>;
  getMyEvents(): Promise<BackendEvent[]>;
  getAllEvents(countryCode?: string): Promise<BackendEvent[]>;
  getFeaturedEvents(countryCode?: string): Promise<BackendEvent[]>;
  getEventById(id: string): Promise<BackendEvent>;
  getAllEventsAdmin(): Promise<BackendEvent[]>;
  toggleHighlight(id: string, data: { isFeatured?: boolean; isFavorite?: boolean }): Promise<BackendEvent>;
  createEvent(data: CreateBackendEventInput): Promise<BackendEvent>;
  deleteEvent(id: string): Promise<void>;
  updateEvent(id: string, data: Partial<CreateBackendEventInput>): Promise<BackendEvent>;
  toggleFavorite(id: string): Promise<{ isFavorited: boolean }>;
  checkFavorite(id: string): Promise<boolean>;
  getMyFavorites(): Promise<BackendEvent[]>;
  toggleSalesBlocked(id: string): Promise<{ salesBlocked: boolean }>;
  updatePromotion(
    id: string,
    data: {
      promotionType?: PromotionType | null;
      promotionStatus?: PromotionStatus;
      promotionStartDate?: string | null;
      promotionEndDate?: string | null;
    }
  ): Promise<BackendEvent>;
  getPromotionSlots(): Promise<PromotionSlots[]>;
}

export type PaymentProvider = "stripe" | "paystack" | "mobile_money";

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  clientSecret?: string;
  authorizationUrl?: string;
  reference?: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "mobile_money" | "bank_transfer";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  phoneNumber?: string;
}

export interface PaymentConfig {
  stripePublicKey?: string;
  paystackPublicKey?: string;
  currency: string;
  supportedMethods: PaymentProvider[];
}

export interface PaymentsProvider {
  readonly mode: BackendProviderMode;
  createPaymentIntent(
    amount: number,
    provider: PaymentProvider,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent>;
  confirmPayment(
    paymentIntentId: string,
    provider: PaymentProvider
  ): Promise<{ status: string; transactionId: string }>;
  checkPaymentStatus(
    reference: string,
    provider: PaymentProvider
  ): Promise<{
    status: "pending" | "completed" | "failed" | "cancelled";
    amount?: number;
    currency?: string;
  }>;
  refundPayment(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<{ refundId: string }>;
  savePaymentMethod(userId: string, paymentMethod: Omit<PaymentMethod, "id">): Promise<string>;
  getPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  deletePaymentMethod(methodId: string): Promise<void>;
}

export interface BackendTicket {
  id: string;
  eventId: string;
  userId: string;
  category: string;
  price: number;
  currency: string;
  holderName: string;
  holderEmail: string;
  qrData: string;
  status: "valid" | "used" | "expired";
  orderId: string;
  usedAt: string | null;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    image: string;
    category: string;
    organizerId: string;
  };
}

export interface PurchaseItem {
  category: string;
  quantity: number;
  price: number;
}

export interface PurchaseResult {
  orderId: string;
  tickets: BackendTicket[];
}

export interface ConfirmedTicket extends BackendTicket {
  qrDataUrl?: string;
}

export interface ConfirmPaymentResult {
  orderId: string;
  tickets: ConfirmedTicket[];
  deliveryFee?: number;
  emailSent: boolean;
}

export interface VerifyResult {
  id: string;
  status: string;
  holderName: string;
  holderEmail: string;
  category: string;
  event: { title: string; date: string; location: string };
  usedAt: string | null;
}

export interface TicketsProvider {
  readonly mode: BackendProviderMode;
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
  }): Promise<PurchaseResult & { deliveryFee?: number }>;
  getMyTickets(): Promise<BackendTicket[]>;
  getTicketById(id: string): Promise<BackendTicket>;
  verifyTicket(qrData: string): Promise<VerifyResult>;
  getEventTickets(eventId: string): Promise<BackendTicket[]>;
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
    paymentProvider: PaymentProvider;
    paymentId: string;
  }): Promise<ConfirmPaymentResult>;
}

export interface BackendGateway {
  readonly mode: BackendProviderMode;
  auth: AuthProvider;
  events: EventsProvider;
  catalogEvents: CatalogEventsProvider;
  payments: PaymentsProvider;
  tickets: TicketsProvider;
}
