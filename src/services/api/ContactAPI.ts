// Contact API Service
// Envoi du formulaire de la page Contact vers l'équipe Féeti

import BaseAPIService, { APIResponse } from './BaseAPI';
import { fetchWithBackendFallback } from '../../utils/backendConfig';

export type ContactReason = 'ticketing' | 'partnership' | 'advertising' | 'press' | 'support' | 'other';

export interface ContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  vertical: string;
  country: string;
  ticketsPerYear: string;
  averagePrice: string;
  reason: ContactReason;
  message: string;
  website?: string; // champ piège anti-robot
}

class ContactAPIService extends BaseAPIService {
  async send(data: ContactRequest): Promise<APIResponse<null>> {
    return this.request(
      `contact:send:${data.email}:${Date.now()}`,
      async () => {
        const response = await fetchWithBackendFallback('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(result?.message || "Impossible d'envoyer votre demande");
        }

        return result;
      },
      { cache: false, deduplicate: false }
    );
  }
}

export const contactAPI = new ContactAPIService();
export default contactAPI;
