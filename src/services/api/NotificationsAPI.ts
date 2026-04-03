// Notifications API Service
// Intégration avec le backend pour Email, SMS et Push notifications

import BaseAPIService, { APIResponse } from './BaseAPI';

export interface EmailData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface TicketConfirmationEmail {
  to: string;
  customerName: string;
  eventTitle: string;
  eventDate: string;
  ticketCount: number;
  qrCode: string;
  ticketUrl: string;
}

export interface SMSData {
  to: string;
  message: string;
}

export interface PushNotificationData {
  token: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
}

class NotificationsAPIService extends BaseAPIService {
  private backendUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL 
    ? import.meta.env.VITE_BACKEND_URL 
    : 'http://localhost:3001';

  /**
   * Envoyer un email générique
   */
  async sendEmail(emailData: EmailData): Promise<APIResponse<{ message_id: string }>> {
    return this.request(
      `notifications:email:${Date.now()}`,
      async () => {
        const response = await fetch(`${this.backendUrl}/api/notifications/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de l\'envoi de l\'email');
        }

        return response.json();
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Envoyer un email de confirmation de billet
   */
  async sendTicketConfirmation(data: TicketConfirmationEmail): Promise<APIResponse<{ message_id: string }>> {
    return this.request(
      `notifications:ticket-email:${Date.now()}`,
      async () => {
        const response = await fetch(`${this.backendUrl}/api/notifications/email/ticket-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de l\'envoi de la confirmation');
        }

        const result = await response.json();
        this.showToast('success', 'Email de confirmation envoyé');
        return result;
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Envoyer un SMS
   */
  async sendSMS(smsData: SMSData): Promise<APIResponse<{ message_id: string; status: string }>> {
    return this.request(
      `notifications:sms:${Date.now()}`,
      async () => {
        const response = await fetch(`${this.backendUrl}/api/notifications/sms/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(smsData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de l\'envoi du SMS');
        }

        const result = await response.json();
        this.showToast('success', 'SMS envoyé avec succès');
        return result;
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Envoyer un SMS de confirmation de billet
   */
  async sendTicketSMS(to: string, eventTitle: string, eventDate: string, ticketUrl: string): Promise<APIResponse<{ message_id: string }>> {
    return this.request(
      `notifications:ticket-sms:${Date.now()}`,
      async () => {
        const response = await fetch(`${this.backendUrl}/api/notifications/sms/ticket-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, eventTitle, eventDate, ticketUrl })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de l\'envoi du SMS');
        }

        return response.json();
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Envoyer une notification push
   */
  async sendPushNotification(data: PushNotificationData): Promise<APIResponse<{ message_id: string }>> {
    return this.request(
      `notifications:push:${Date.now()}`,
      async () => {
        const response = await fetch(`${this.backendUrl}/api/notifications/push/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de l\'envoi de la notification');
        }

        const result = await response.json();
        this.showToast('success', 'Notification envoyée');
        return result;
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Envoyer une notification push à plusieurs utilisateurs
   */
  async sendPushMultiple(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<APIResponse<{ success_count: number; failure_count: number }>> {
    return this.request(
      `notifications:push-multiple:${Date.now()}`,
      async () => {
        const response = await fetch(`${this.backendUrl}/api/notifications/push/send-multiple`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokens, title, body, data })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de l\'envoi des notifications');
        }

        const result = await response.json();
        this.showToast('success', `${result.success_count} notifications envoyées`);
        return result;
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * S'abonner à un sujet (topic)
   */
  async subscribeToTopic(token: string, topic: string): Promise<APIResponse<{ message: string }>> {
    return this.request(
      `notifications:subscribe:${topic}`,
      async () => {
        const response = await fetch(`${this.backendUrl}/api/notifications/push/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, topic })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de l\'abonnement');
        }

        return response.json();
      },
      { cache: false }
    );
  }

  /**
   * Se désabonner d'un sujet
   */
  async unsubscribeFromTopic(token: string, topic: string): Promise<APIResponse<{ message: string }>> {
    return this.request(
      `notifications:unsubscribe:${topic}`,
      async () => {
        const response = await fetch(`${this.backendUrl}/api/notifications/push/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, topic })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors du désabonnement');
        }

        return response.json();
      },
      { cache: false }
    );
  }

  /**
   * Envoyer une notification à un sujet
   */
  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<APIResponse<{ message_id: string }>> {
    return this.request(
      `notifications:topic:${topic}:${Date.now()}`,
      async () => {
        const response = await fetch(`${this.backendUrl}/api/notifications/push/send-to-topic`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, title, body, data })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de l\'envoi au sujet');
        }

        const result = await response.json();
        this.showToast('success', `Notification envoyée au sujet: ${topic}`);
        return result;
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Envoyer toutes les notifications pour un achat de billet
   */
  async sendTicketPurchaseNotifications(data: {
    email: string;
    phone?: string;
    customerName: string;
    eventTitle: string;
    eventDate: string;
    ticketCount: number;
    qrCode: string;
    ticketUrl: string;
    pushToken?: string;
  }): Promise<APIResponse<{ email: boolean; sms: boolean; push: boolean }>> {
    const results = {
      email: false,
      sms: false,
      push: false
    };

    try {
      // Envoyer l'email
      const emailResponse = await this.sendTicketConfirmation({
        to: data.email,
        customerName: data.customerName,
        eventTitle: data.eventTitle,
        eventDate: data.eventDate,
        ticketCount: data.ticketCount,
        qrCode: data.qrCode,
        ticketUrl: data.ticketUrl
      });

      results.email = emailResponse.success;

      // Envoyer le SMS si numéro fourni
      if (data.phone) {
        const smsResponse = await this.sendTicketSMS(
          data.phone,
          data.eventTitle,
          data.eventDate,
          data.ticketUrl
        );
        results.sms = smsResponse.success;
      }

      // Envoyer la notification push si token fourni
      if (data.pushToken) {
        const pushResponse = await this.sendPushNotification({
          token: data.pushToken,
          title: '🎫 Votre billet Feeti',
          body: `Votre billet pour "${data.eventTitle}" est prêt!`,
          data: {
            eventTitle: data.eventTitle,
            ticketUrl: data.ticketUrl
          }
        });
        results.push = pushResponse.success;
      }

      return {
        success: true,
        data: results
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: results
      };
    }
  }
}

// Export singleton
const NotificationsAPI = new NotificationsAPIService();
export default NotificationsAPI;
