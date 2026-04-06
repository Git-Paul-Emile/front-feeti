// Service API pour la gestion des codes d'accès streaming

import BaseAPIService, { APIResponse } from './BaseAPI';
import crypto from 'crypto';
import { fetchWithBackendFallback } from '../../utils/backendConfig';

export interface StreamingAccess {
  id: string;
  eventId: string;
  userId: string;
  accessCode: string;
  accessPin: string;
  expiresAt: Date;
  usedAt?: Date;
  status: 'active' | 'used' | 'expired';
  maxUses: number;
  currentUses: number;
  createdAt: Date;
}

export interface StreamingAccessRequest {
  eventId: string;
  userId: string;
  ticketId: string;
  userEmail: string;
  userName: string;
}

class StreamingAccessAPIService extends BaseAPIService {
  /**
   * Générer un code d'accès unique pour un événement en ligne
   */
  async generateAccessCode(data: StreamingAccessRequest): Promise<APIResponse<StreamingAccess>> {
    return this.request(
      `streaming-access:generate:${data.eventId}:${data.userId}:${Date.now()}`,
      async () => {
        // Générer un code d'accès unique
        const accessCode = this.generateUniqueCode(12);
        const accessPin = this.generateNumericPin(6);

        const response = await fetchWithBackendFallback('/api/streaming/generate-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            accessCode,
            accessPin
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de la génération du code d\'accès');
        }

        const result = await response.json();
        this.showToast('success', 'Code d\'accès généré avec succès');
        return result;
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Vérifier et valider un code d'accès streaming
   */
  async verifyAccessCode(
    eventId: string,
    accessCode: string,
    accessPin: string
  ): Promise<APIResponse<{ valid: boolean; accessData?: StreamingAccess; message: string }>> {
    return this.request(
      `streaming-access:verify:${eventId}:${Date.now()}`,
      async () => {
        const response = await fetchWithBackendFallback('/api/streaming/verify-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            accessCode,
            accessPin
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de la vérification');
        }

        const result = await response.json();
        
        if (result.valid) {
          this.showToast('success', 'Accès autorisé ! Bienvenue 🎉');
        } else {
          this.showToast('error', result.message || 'Code d\'accès invalide');
        }

        return result;
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Obtenir les codes d'accès d'un utilisateur
   */
  async getUserAccessCodes(userId: string): Promise<APIResponse<StreamingAccess[]>> {
    return this.request(
      `streaming-access:user:${userId}`,
      async () => {
        const response = await fetchWithBackendFallback(`/api/streaming/user-access/${userId}`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de la récupération');
        }

        return response.json();
      },
      { cache: true, ttl: 300000 } // Cache 5 minutes
    );
  }

  /**
   * Révoquer un code d'accès
   */
  async revokeAccessCode(accessId: string): Promise<APIResponse<{ message: string }>> {
    return this.request(
      `streaming-access:revoke:${accessId}:${Date.now()}`,
      async () => {
        const response = await fetchWithBackendFallback(`/api/streaming/revoke-access/${accessId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de la révocation');
        }

        const result = await response.json();
        this.showToast('success', 'Code d\'accès révoqué');
        return result;
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Marquer un code comme utilisé
   */
  async markAccessAsUsed(accessId: string): Promise<APIResponse<{ message: string }>> {
    return this.request(
      `streaming-access:use:${accessId}:${Date.now()}`,
      async () => {
        const response = await fetchWithBackendFallback(`/api/streaming/use-access/${accessId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de l\'utilisation');
        }

        return response.json();
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Générer un code alphanumérique unique
   */
  private generateUniqueCode(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Évite les caractères ambigus (0, O, 1, I)
    let code = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }

    // Format: XXXX-XXXX-XXXX
    return code.match(/.{1,4}/g)?.join('-') || code;
  }

  /**
   * Générer un PIN numérique
   */
  private generateNumericPin(length: number): string {
    let pin = '';
    for (let i = 0; i < length; i++) {
      pin += Math.floor(Math.random() * 10).toString();
    }
    return pin;
  }

  /**
   * Formater le code d'accès pour l'affichage
   */
  formatAccessCode(code: string): string {
    // Retirer les tirets existants et reformater
    const cleanCode = code.replace(/-/g, '');
    return cleanCode.match(/.{1,4}/g)?.join('-') || code;
  }

  /**
   * Copier le code d'accès dans le presse-papiers
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('success', 'Code copié dans le presse-papiers');
      return true;
    } catch (error) {
      this.showToast('error', 'Erreur lors de la copie');
      return false;
    }
  }

  /**
   * Envoyer le code d'accès par email
   */
  async sendAccessCodeByEmail(
    accessCode: string,
    accessPin: string,
    email: string,
    eventTitle: string,
    eventDate: string
  ): Promise<boolean> {
    try {
      const response = await fetchWithBackendFallback('/api/streaming/send-access-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessCode,
          accessPin,
          email,
          eventTitle,
          eventDate
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'email');
      }

      this.showToast('success', 'Code d\'accès envoyé par email');
      return true;
    } catch (error) {
      this.showToast('error', 'Erreur lors de l\'envoi de l\'email');
      return false;
    }
  }
}

// Export singleton
const StreamingAccessAPI = new StreamingAccessAPIService();
export default StreamingAccessAPI;
