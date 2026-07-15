// Newsletter API Service
// Inscription au formulaire newsletter du footer (envoi hebdomadaire "Les Fééties de la semaine")

import BaseAPIService, { APIResponse } from './BaseAPI';
import { fetchWithBackendFallback } from '../../utils/backendConfig';

class NewsletterAPIService extends BaseAPIService {
  /**
   * Inscrire un email à la newsletter (formulaire du footer)
   */
  async subscribe(email: string): Promise<APIResponse<null>> {
    return this.request(
      `newsletter:subscribe:${email}:${Date.now()}`,
      async () => {
        const response = await fetchWithBackendFallback('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(result?.message || 'Adresse email invalide');
        }

        return result;
      },
      { cache: false, deduplicate: false }
    );
  }
}

export const newsletterAPI = new NewsletterAPIService();
export default newsletterAPI;
