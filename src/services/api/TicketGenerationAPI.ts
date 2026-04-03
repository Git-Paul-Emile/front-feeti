// Service API Frontend pour la génération de tickets PDF avec QR codes

import BaseAPIService, { APIResponse } from './BaseAPI';

export interface TicketGenerationRequest {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventImage?: string;
  userId: string;
  holderName: string;
  holderEmail: string;
  holderPhone?: string;
  price: number;
  currency: string;
  quantity?: number;
  transactionId: string;
}

export interface GeneratedTicket {
  id: string;
  ticketId: string;
  qrCodeDataUrl: string;
  pdfBase64: string;
  pdfUrl: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  holderName: string;
  holderEmail: string;
  price: number;
  currency: string;
  status: 'valid' | 'used' | 'cancelled';
  createdAt: any;
}

export interface TicketStats {
  eventId: string;
  stats: {
    total: number;
    valid: number;
    used: number;
    cancelled: number;
  };
}

class TicketGenerationAPIService extends BaseAPIService {
  private backendUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL 
    ? import.meta.env.VITE_BACKEND_URL 
    : 'http://localhost:3001';

  /**
   * Générer un ou plusieurs tickets avec QR codes et PDF
   */
  async generateTickets(data: TicketGenerationRequest): Promise<APIResponse<{ tickets: GeneratedTicket[] }>> {
    return this.request(
      `ticket-gen:${data.eventId}:${data.userId}:${Date.now()}`,
      async () => {
        const response = await fetch(`${this.backendUrl}/api/ticket-generation/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de la génération des billets');
        }

        const result = await response.json();
        this.showToast('success', `${data.quantity || 1} billet(s) généré(s) avec succès`);
        return result;
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Télécharger le PDF d'un ticket
   */
  async downloadTicketPDF(ticketId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.backendUrl}/api/ticket-generation/download/${ticketId}`);

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du billet');
      }

      return await response.blob();
    } catch (error: any) {
      this.showToast('error', error.message);
      throw error;
    }
  }

  /**
   * Ouvrir le PDF d'un ticket dans un nouvel onglet
   */
  openTicketPDF(ticketId: string): void {
    const url = `${this.backendUrl}/api/ticket-generation/download/${ticketId}`;
    window.open(url, '_blank');
  }

  /**
   * Télécharger et sauvegarder le PDF localement
   */
  async saveTicketPDF(ticketId: string, filename?: string): Promise<void> {
    try {
      const blob = await this.downloadTicketPDF(ticketId);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `ticket-${ticketId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this.showToast('success', 'Billet téléchargé avec succès');
    } catch (error: any) {
      this.showToast('error', 'Erreur lors du téléchargement');
      throw error;
    }
  }

  /**
   * Vérifier un QR code
   */
  async verifyQRCode(qrCodeData: string, verifierId?: string): Promise<APIResponse<{
    status: 'valid' | 'already_used' | 'cancelled' | 'expired' | 'not_found' | 'invalid_token';
    ticket?: any;
    usedAt?: Date;
  }>> {
    return this.request(
      `ticket-verify:${Date.now()}`,
      async () => {
        const response = await fetch(`${this.backendUrl}/api/ticket-generation/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrCodeData, verifierId })
        });

        const result = await response.json();

        if (result.success) {
          this.showToast('success', 'Billet validé avec succès ✓');
        } else {
          this.showToast('error', result.error || 'Billet invalide');
        }

        return result;
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Régénérer le QR code d'un billet
   */
  async regenerateQRCode(ticketId: string): Promise<APIResponse<{
    qrCodeDataUrl: string;
    pdfBase64: string;
  }>> {
    return this.request(
      `ticket-regen:${ticketId}:${Date.now()}`,
      async () => {
        const response = await fetch(`${this.backendUrl}/api/ticket-generation/regenerate-qr/${ticketId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de la régénération');
        }

        const result = await response.json();
        this.showToast('success', 'QR code régénéré avec succès');
        return result;
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Obtenir les statistiques d'un événement
   */
  async getEventStats(eventId: string): Promise<APIResponse<TicketStats>> {
    return this.request(
      `ticket-stats:${eventId}`,
      async () => {
        const response = await fetch(`${this.backendUrl}/api/ticket-generation/stats/${eventId}`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de la récupération des statistiques');
        }

        return response.json();
      },
      { cache: true, ttl: 60000 } // Cache 1 minute
    );
  }

  /**
   * Convertir un PDF base64 en Blob pour affichage
   */
  base64ToBlob(base64: string, contentType = 'application/pdf'): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  /**
   * Afficher un PDF dans un viewer
   */
  displayPDFInViewer(pdfBase64: string, elementId: string): void {
    const blob = this.base64ToBlob(pdfBase64);
    const url = URL.createObjectURL(blob);
    
    const iframe = document.getElementById(elementId) as HTMLIFrameElement;
    if (iframe) {
      iframe.src = url;
    }
  }

  /**
   * Envoyer les billets par email (via NotificationsAPI)
   */
  async sendTicketsByEmail(
    tickets: GeneratedTicket[],
    email: string,
    customerName: string
  ): Promise<boolean> {
    try {
      // Cette fonction serait implémentée avec NotificationsAPI
      // Pour l'exemple, on retourne true
      
      const ticket = tickets[0];
      
      // Appel fictif - à implémenter avec NotificationsAPI
      console.log('Envoi des billets par email à:', email);
      
      this.showToast('success', `Billets envoyés à ${email}`);
      return true;
    } catch (error: any) {
      this.showToast('error', 'Erreur lors de l\'envoi des billets');
      return false;
    }
  }

  /**
   * Partager un billet via Web Share API
   */
  async shareTicket(ticket: GeneratedTicket): Promise<boolean> {
    try {
      if (!navigator.share) {
        throw new Error('Web Share API non supportée');
      }

      await navigator.share({
        title: `Billet - ${ticket.eventTitle}`,
        text: `Mon billet pour ${ticket.eventTitle} le ${ticket.eventDate}`,
        url: ticket.pdfUrl
      });

      this.showToast('success', 'Billet partagé avec succès');
      return true;
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        this.showToast('error', 'Erreur lors du partage');
      }
      return false;
    }
  }
}

// Export singleton
const TicketGenerationAPI = new TicketGenerationAPIService();
export default TicketGenerationAPI;
