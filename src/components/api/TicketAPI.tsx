// Simulation d'API Backend pour le système de billetterie

interface TicketData {
  id: string;
  orderId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  category: string;
  price: number;
  currency: string;
  holderName: string;
  holderEmail: string;
  qrCode: string;
  status: 'valid' | 'used' | 'expired';
  purchaseDate: string;
  timestamp: number;
  signature: string;
}

interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  amount: number;
  currency: string;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PurchaseRequest {
  eventId: string;
  selectedTickets: { [categoryId: string]: number };
  customerInfo: CustomerInfo;
  paymentData: PaymentData;
}

interface PurchaseResponse {
  success: boolean;
  error?: string;
  orderId?: string;
  tickets?: TicketData[];
  transactionId?: string;
}

interface VerificationRequest {
  qrCode: string;
}

interface VerificationResponse {
  valid: boolean;
  reason?: string;
  ticketData?: TicketData;
  verificationTimestamp?: number;
}

// Base de données simulée
class MockTicketDatabase {
  private tickets: Map<string, TicketData> = new Map();
  private orders: Map<string, { orderId: string; tickets: string[]; customerInfo: CustomerInfo }> = new Map();

  // Ajouter des tickets de test
  constructor() {
    this.seedTestData();
  }

  private seedTestData() {
    const testTicket: TicketData = {
      id: 'ticket-test-001',
      orderId: 'ORDER_TEST_001',
      eventId: '1',
      eventTitle: 'Festival Électro Summer',
      eventDate: '2024-07-15',
      eventTime: '20:00',
      eventLocation: 'Brazzaville',
      category: 'VIP',
      price: 112500,
      currency: 'FCFA',
      holderName: 'John Doe',
      holderEmail: 'john@example.com',
      qrCode: JSON.stringify({
        orderId: 'ORDER_TEST_001',
        ticketId: 'ticket-test-001',
        timestamp: Date.now(),
        eventId: '1',
        signature: this.generateSignature('ORDER_TEST_001', 'ticket-test-001', Date.now())
      }),
      status: 'valid',
      purchaseDate: new Date().toISOString(),
      timestamp: Date.now(),
      signature: this.generateSignature('ORDER_TEST_001', 'ticket-test-001', Date.now())
    };

    this.tickets.set(`ORDER_TEST_001-ticket-test-001`, testTicket);
  }

  private generateSignature(orderId: string, ticketId: string, timestamp: number): string {
    // Simulation d'une signature HMAC
    return btoa(`${orderId}-${ticketId}-${timestamp}-SECRET_KEY`);
  }

  private generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  addTicket(ticket: TicketData): void {
    const key = `${ticket.orderId}-${ticket.id}`;
    this.tickets.set(key, ticket);
  }

  getTicket(orderId: string, ticketId: string): TicketData | undefined {
    const key = `${orderId}-${ticketId}`;
    return this.tickets.get(key);
  }

  updateTicketStatus(orderId: string, ticketId: string, status: 'valid' | 'used' | 'expired'): boolean {
    const ticket = this.getTicket(orderId, ticketId);
    if (ticket) {
      ticket.status = status;
      this.addTicket(ticket);
      return true;
    }
    return false;
  }

  getAllTickets(): TicketData[] {
    return Array.from(this.tickets.values());
  }
}

// Instance globale de la base de données
const ticketDB = new MockTicketDatabase();

// API Functions
export class TicketAPI {
  private static instance: TicketAPI;
  private db: MockTicketDatabase;

  private constructor() {
    this.db = ticketDB;
  }

  public static getInstance(): TicketAPI {
    if (!TicketAPI.instance) {
      TicketAPI.instance = new TicketAPI();
    }
    return TicketAPI.instance;
  }

  // Simulation du processus de paiement Stripe
  async processPayment(paymentData: PaymentData): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulation du délai de traitement
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Validation basique
    if (!paymentData.cardNumber || paymentData.cardNumber.length < 16) {
      return { success: false, error: 'Numéro de carte invalide' };
    }

    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      return { success: false, error: 'Code CVV invalide' };
    }

    if (!paymentData.expiryDate || !paymentData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      return { success: false, error: 'Date d\'expiration invalide' };
    }

    // Simulation d'échec de paiement (5% de chance)
    if (Math.random() < 0.05) {
      return { success: false, error: 'Paiement refusé par la banque' };
    }

    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    return { success: true, transactionId };
  }

  // Génération des billets après paiement réussi
  async generateTickets(request: PurchaseRequest, transactionId: string): Promise<PurchaseResponse> {
    try {
      const orderId = `ORDER_${Date.now()}`;
      const tickets: TicketData[] = [];

      // Categories de billets avec prix
      const ticketCategories = {
        'standard': { name: 'Standard', price: 45000 },
        'premium': { name: 'Premium', price: 81000 },
        'vip': { name: 'VIP', price: 112500 }
      };

      // Générer les billets pour chaque catégorie sélectionnée
      Object.entries(request.selectedTickets).forEach(([categoryId, quantity]) => {
        const category = ticketCategories[categoryId as keyof typeof ticketCategories];
        if (!category || quantity === 0) return;

        for (let i = 0; i < quantity; i++) {
          const ticketId = this.db['generateUniqueId']();
          const timestamp = Date.now();
          
          const qrData = {
            orderId,
            ticketId,
            timestamp,
            eventId: request.eventId,
            signature: this.db['generateSignature'](orderId, ticketId, timestamp)
          };

          const ticket: TicketData = {
            id: ticketId,
            orderId,
            eventId: request.eventId,
            eventTitle: 'Festival Électro Summer', // En production, récupérer depuis l'eventId
            eventDate: '2024-07-15',
            eventTime: '20:00',
            eventLocation: 'Brazzaville',
            category: category.name,
            price: category.price,
            currency: 'FCFA',
            holderName: `${request.customerInfo.firstName} ${request.customerInfo.lastName}`,
            holderEmail: request.customerInfo.email,
            qrCode: JSON.stringify(qrData),
            status: 'valid',
            purchaseDate: new Date().toISOString(),
            timestamp,
            signature: qrData.signature
          };

          tickets.push(ticket);
          this.db.addTicket(ticket);
        }
      });

      return {
        success: true,
        orderId,
        tickets,
        transactionId
      };

    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la génération des billets'
      };
    }
  }

  // Achat complet de billets
  async purchaseTickets(request: PurchaseRequest): Promise<PurchaseResponse> {
    try {
      // 1. Traiter le paiement
      const paymentResult = await this.processPayment(request.paymentData);
      
      if (!paymentResult.success) {
        return {
          success: false,
          error: paymentResult.error
        };
      }

      // 2. Générer les billets
      const ticketResult = await this.generateTickets(request, paymentResult.transactionId!);
      
      if (!ticketResult.success) {
        return ticketResult;
      }

      // 3. Envoyer l'email de confirmation (simulation)
      await this.sendConfirmationEmail(request.customerInfo, ticketResult.tickets!);

      return ticketResult;

    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors du traitement de la commande'
      };
    }
  }

  // Vérification d'un billet
  async verifyTicket(request: VerificationRequest): Promise<VerificationResponse> {
    try {
      // Simulation du délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));

      // Parser le QR code
      let qrData;
      try {
        qrData = JSON.parse(request.qrCode);
      } catch {
        return {
          valid: false,
          reason: 'QR code invalide ou corrompu'
        };
      }

      // Vérifier la signature
      const expectedSignature = this.db['generateSignature'](
        qrData.orderId, 
        qrData.ticketId, 
        qrData.timestamp
      );
      
      if (qrData.signature !== expectedSignature) {
        return {
          valid: false,
          reason: 'Signature invalide - ticket potentiellement falsifié'
        };
      }

      // Chercher le ticket dans la base de données
      const ticket = this.db.getTicket(qrData.orderId, qrData.ticketId);
      
      if (!ticket) {
        return {
          valid: false,
          reason: 'Ticket non trouvé dans la base de données'
        };
      }

      // Vérifier le statut
      if (ticket.status === 'used') {
        return {
          valid: false,
          reason: 'Ticket déjà utilisé',
          ticketData: ticket
        };
      }

      if (ticket.status === 'expired') {
        return {
          valid: false,
          reason: 'Ticket expiré',
          ticketData: ticket
        };
      }

      // Vérifier la date de l'événement
      const eventDate = new Date(ticket.eventDate);
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

      if (eventDate < threeDaysAgo) {
        return {
          valid: false,
          reason: 'Événement terminé depuis plus de 3 jours',
          ticketData: ticket
        };
      }

      // Ticket valide - marquer comme utilisé
      this.db.updateTicketStatus(qrData.orderId, qrData.ticketId, 'used');

      return {
        valid: true,
        ticketData: ticket,
        verificationTimestamp: Date.now()
      };

    } catch (error) {
      return {
        valid: false,
        reason: 'Erreur technique lors de la vérification'
      };
    }
  }

  // Envoi d'email de confirmation (simulation)
  private async sendConfirmationEmail(customerInfo: CustomerInfo, tickets: TicketData[]): Promise<void> {
    // Simulation de l'envoi d'email
    console.log(`📧 Email de confirmation envoyé à ${customerInfo.email}`);
    console.log(`📱 SMS de confirmation envoyé au ${customerInfo.phone}`);
    
    // En production, intégrer avec SendGrid, Mailgun, etc.
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Récupérer tous les billets (pour debug/admin)
  async getAllTickets(): Promise<TicketData[]> {
    return this.db.getAllTickets();
  }

  // Simuler la génération de PDF
  async generateTicketPDF(ticket: TicketData): Promise<{ success: boolean; pdfUrl?: string; error?: string }> {
    try {
      // Simulation du délai de génération PDF
      await new Promise(resolve => setTimeout(resolve, 1500));

      // En production, utiliser pdfkit, puppeteer, etc.
      const pdfUrl = `https://feeti.com/tickets/${ticket.orderId}/${ticket.id}.pdf`;
      
      return {
        success: true,
        pdfUrl
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la génération du PDF'
      };
    }
  }
}

// Export de l'instance singleton
export const ticketAPI = TicketAPI.getInstance();

// Types d'export pour utilisation dans les composants
export type { 
  TicketData, 
  PaymentData, 
  CustomerInfo, 
  PurchaseRequest, 
  PurchaseResponse, 
  VerificationRequest, 
  VerificationResponse 
};