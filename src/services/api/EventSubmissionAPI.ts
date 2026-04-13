// Service API pour la soumission d'événements

import BaseAPIService, { APIResponse } from './BaseAPI';
import { fetchWithBackendFallback } from '../../utils/backendConfig';

export interface EventSubmissionData {
  // Organisateur
  organizerName: string;
  organizerType: 'individual' | 'company';
  organizerEmail: string;
  organizerPhone: string;
  organizerWebsite: string;
  organizerLogo?: File;

  // Événement
  eventName: string;
  category: string;
  description: string;
  hashtags: string[];

  // Date/Horaire
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  recurrence: 'unique' | 'weekly' | 'monthly' | 'other';
  recurrenceDetails?: string;

  // Type d'événement
  eventType: 'PRESENTIEL' | 'STREAMING_LIVE' | 'MIXTE';

  // Lieu
  venueName: string;
  address: string;
  city: string;
  countryCode: string;
  googleMapsLink?: string;
  hasStreaming: boolean;

  // Billetterie
  accessType: 'free' | 'paid';
  tickets: {
    name: string;
    price: number;
    quantity: number;
  }[];
  salesStartDate?: string;
  salesEndDate?: string;

  // Médias
  mainPoster?: File;
  gallery?: File[];
  videoLink?: string;

  // Partenaires
  partners: {
    name: string;
    logo?: File;
  }[];

  // Promotion
  featuredHomepage: boolean;
  feetiAds: boolean;
  socialMediaShare: boolean;
  pushNotification: boolean;

  // Validation
  confirmAccuracy: boolean;
  acceptTerms: boolean;
}

export interface EventSubmission {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  eventId?: string;
  dashboardAccessCode?: string;
}

class EventSubmissionAPIService extends BaseAPIService {
  /**
   * Soumettre un nouvel événement
   */
  async submitEvent(data: EventSubmissionData): Promise<APIResponse<EventSubmission>> {
    return this.request(
      `event-submission:submit:${Date.now()}`,
      async () => {
        const formData = new FormData();
        
        // Ajouter les données JSON
        formData.append('data', JSON.stringify({
          organizerName: data.organizerName,
          organizerType: data.organizerType,
          organizerEmail: data.organizerEmail,
          organizerPhone: data.organizerPhone,
          organizerWebsite: data.organizerWebsite,
          eventName: data.eventName,
          category: data.category,
          description: data.description,
          hashtags: data.hashtags,
          startDate: data.startDate,
          startTime: data.startTime,
          endDate: data.endDate,
          endTime: data.endTime,
          recurrence: data.recurrence,
          recurrenceDetails: data.recurrenceDetails,
          eventType: data.eventType,
          venueName: data.venueName,
          address: data.address,
          city: data.city,
          countryCode: data.countryCode,
          googleMapsLink: data.googleMapsLink,
          hasStreaming: data.hasStreaming,
          accessType: data.accessType,
          tickets: data.tickets,
          salesStartDate: data.salesStartDate,
          salesEndDate: data.salesEndDate,
          videoLink: data.videoLink,
          partners: data.partners.map(p => ({ name: p.name })),
          featuredHomepage: data.featuredHomepage,
          feetiAds: data.feetiAds,
          socialMediaShare: data.socialMediaShare,
          pushNotification: data.pushNotification,
          confirmAccuracy: data.confirmAccuracy,
          acceptTerms: data.acceptTerms
        }));

        // Ajouter les fichiers
        if (data.organizerLogo) {
          formData.append('organizerLogo', data.organizerLogo);
        }

        if (data.mainPoster) {
          formData.append('mainPoster', data.mainPoster);
        }

        if (data.gallery && data.gallery.length > 0) {
          data.gallery.forEach(file => {
            formData.append('gallery', file);
          });
        }

        if (data.partners && data.partners.length > 0) {
          data.partners.forEach((partner, index) => {
            if (partner.logo) {
              formData.append('partnerLogos', partner.logo);
            }
          });
        }

        const response = await fetchWithBackendFallback('/api/event-submissions', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de la soumission');
        }

        const result = await response.json();
        this.showToast('success', 'Événement soumis avec succès ! Vous recevrez une réponse sous 24-48h.');
        return result;
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Obtenir les soumissions de l'utilisateur
   */
  async getUserSubmissions(userId: string): Promise<APIResponse<EventSubmission[]>> {
    return this.request(
      `event-submission:user:${userId}`,
      async () => {
        const response = await fetchWithBackendFallback(`/api/event-submissions?userId=${userId}`);

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
   * Obtenir toutes les soumissions (Admin)
   */
  async getAllSubmissions(status?: 'pending' | 'approved' | 'rejected'): Promise<APIResponse<EventSubmission[]>> {
    return this.request(
      `event-submission:all:${status || 'all'}`,
      async () => {
        const path = status
          ? `/api/event-submissions?status=${status}`
          : '/api/event-submissions';

        const response = await fetchWithBackendFallback(path);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de la récupération');
        }

        return response.json();
      },
      { cache: true, ttl: 60000 } // Cache 1 minute
    );
  }

  /**
   * Approuver une soumission (Admin)
   */
  async approveSubmission(
    submissionId: string,
    adminId: string,
    adminName: string
  ): Promise<APIResponse<{ eventId: string; accessCode: string }>> {
    return this.request(
      `event-submission:approve:${submissionId}:${Date.now()}`,
      async () => {
        const response = await fetchWithBackendFallback(`/api/event-submissions/${submissionId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminId, adminName })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de l\'approbation');
        }

        const result = await response.json();
        this.showToast('success', 'Événement approuvé et publié !');
        return result;
      },
      { cache: false, deduplicate: false }
    );
  }

  /**
   * Rejeter une soumission (Admin)
   */
  async rejectSubmission(
    submissionId: string,
    adminId: string,
    adminName: string,
    reason: string
  ): Promise<APIResponse<{ message: string }>> {
    return this.request(
      `event-submission:reject:${submissionId}:${Date.now()}`,
      async () => {
        const response = await fetchWithBackendFallback(`/api/event-submissions/${submissionId}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminId, adminName, reason })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors du rejet');
        }

        const result = await response.json();
        this.showToast('success', 'Soumission rejetée');
        return result;
      },
      { cache: false, deduplicate: false }
    );
  }
}

// Export singleton
const EventSubmissionAPI = new EventSubmissionAPIService();
export default EventSubmissionAPI;
