import api from '../../routes/axiosConfig';
import type { BackendEvent } from './EventsBackendAPI';

export interface EventControllerAssignment {
  id: string;
  eventId: string;
  controllerId: string;
  assignedAt: string;
  controller: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface ScanHistoryTicket {
  id: string;
  holderName: string;
  holderEmail: string;
  category: string;
  price: number;
  currency: string;
  status: string;
  usedAt: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
  };
}

const ControllerAPI = {
  // ── Organisateur : gérer les contrôleurs d'un événement ──────────────────

  /** Créer un nouveau compte contrôleur et l'affecter à l'événement */
  async createAndAssign(eventId: string, data: { name: string; email: string; password: string; phone?: string }): Promise<EventControllerAssignment> {
    const res = await api.post<{ data: EventControllerAssignment }>(`/api/controller/events/${eventId}/controllers`, data);
    return res.data.data!;
  },

  /** Affecter un contrôleur existant par email */
  async assignExisting(eventId: string, email: string): Promise<EventControllerAssignment> {
    const res = await api.post<{ data: EventControllerAssignment }>(`/api/controller/events/${eventId}/controllers/assign`, { email });
    return res.data.data!;
  },

  /** Lister les contrôleurs d'un événement */
  async listForEvent(eventId: string): Promise<EventControllerAssignment[]> {
    const res = await api.get<{ data: EventControllerAssignment[] }>(`/api/controller/events/${eventId}/controllers`);
    return res.data.data!;
  },

  /** Retirer un contrôleur d'un événement */
  async remove(eventId: string, controllerId: string): Promise<void> {
    await api.delete(`/api/controller/events/${eventId}/controllers/${controllerId}`);
  },

  // ── Contrôleur : son dashboard ────────────────────────────────────────────

  /** Événements assignés au contrôleur connecté */
  async getMyEvents(): Promise<BackendEvent[]> {
    const res = await api.get<{ data: BackendEvent[] }>('/api/controller/my-events');
    return res.data.data!;
  },

  /** Historique des billets scannés par le contrôleur connecté */
  async getMyScanHistory(): Promise<ScanHistoryTicket[]> {
    const res = await api.get<{ data: ScanHistoryTicket[] }>('/api/controller/my-scans');
    return res.data.data!;
  },

  /** Scanner/valider un billet (contrôleur) */
  async verifyTicket(qrData: string): Promise<{ id: string; holderName: string; category: string; status: string }> {
    const res = await api.post<{ data: any }>('/api/controller/verify', { qrData });
    return res.data.data!;
  },
};

export default ControllerAPI;
