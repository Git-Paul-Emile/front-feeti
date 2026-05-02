import api from '../../routes/axiosConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EventZone {
  id: string;
  eventId: string;
  code: string;
  name: string;
  description?: string | null;
  color: string;
  isActive: boolean;
  maxCapacity?: number | null;
  currentCount: number;
  createdAt: string;
  updatedAt: string;
  accessRights?: ZoneAccessRight[];
}

export interface ParticipantCategory {
  id: string;
  eventId: string;
  name: string;
  description?: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  accessRights?: ZoneAccessRight[];
}

export type ZoneAccessLevel = 'OUI' | 'NON' | 'COND';

export interface ZoneAccessRight {
  id: string;
  categoryId: string;
  zoneId: string;
  accessLevel: ZoneAccessLevel;
  zone?: EventZone;
  category?: ParticipantCategory;
}

export type BadgeStatus = 'active' | 'revoked' | 'expired';

export interface AccessBadge {
  id: string;
  eventId: string;
  ticketId?: string | null;
  categoryId: string;
  holderName: string;
  holderEmail: string;
  holderPhone?: string | null;
  holderPhoto?: string | null;
  qrCode: string;
  status: BadgeStatus;
  sentAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: ParticipantCategory;
}

export type AccessResult = 'granted' | 'denied' | 'conditional';

export interface ScanResult {
  result: AccessResult;
  refusalReason?: string;
  holder?: {
    name: string;
    badgeId?: string;
    email?: string;
    phone?: string;
    photo?: string;
    category?: string;
    authorizedZones?: { zoneId: string; zoneName: string; level: string }[];
  };
}

export interface OfflineScan {
  qrCode: string;
  zoneId: string;
  scannedAt: string;
}

export interface AccessLog {
  id: string;
  badgeId: string;
  zoneId: string;
  eventId: string;
  scannedById: string;
  result: AccessResult;
  refusalReason?: string | null;
  offlineSync: boolean;
  scannedAt: string;
  badge?: {
    holderName: string;
    holderEmail: string;
    category?: { name: string } | null;
  };
  zone?: { name: string; code: string };
}

export interface ZoneTracking {
  zoneId: string;
  code: string;
  name: string;
  color: string;
  currentCount: number;
  totalEntries: number;
  maxCapacity?: number | null;
  isOverCapacity: boolean;
}

export interface SuspectReport {
  id: string;
  badgeId: string;
  reportedById: string;
  reason: string;
  resolved: boolean;
  createdAt: string;
  badge?: { holderName: string; holderEmail: string; category?: { name: string } | null };
}

// ─── API ──────────────────────────────────────────────────────────────────────

const AccessAPI = {

  // ── Zones ──────────────────────────────────────────────────────────────

  async getZones(eventId: string): Promise<EventZone[]> {
    const res = await api.get<{ data: EventZone[] }>(`/api/access/events/${eventId}/zones`);
    return res.data.data;
  },

  async applyDefaultZones(eventId: string): Promise<EventZone[]> {
    const res = await api.post<{ data: EventZone[] }>(`/api/access/events/${eventId}/zones/apply-defaults`);
    return res.data.data;
  },

  async createZone(eventId: string, data: { code: string; name: string; description?: string; color?: string; maxCapacity?: number }): Promise<EventZone> {
    const res = await api.post<{ data: EventZone }>(`/api/access/events/${eventId}/zones`, data);
    return res.data.data;
  },

  async updateZone(eventId: string, zoneId: string, data: Partial<{ name: string; description: string; color: string; isActive: boolean; maxCapacity: number }>): Promise<EventZone> {
    const res = await api.patch<{ data: EventZone }>(`/api/access/events/${eventId}/zones/${zoneId}`, data);
    return res.data.data;
  },

  async deleteZone(eventId: string, zoneId: string): Promise<void> {
    await api.delete(`/api/access/events/${eventId}/zones/${zoneId}`);
  },

  // ── Catégories ──────────────────────────────────────────────────────────

  async getCategories(eventId: string): Promise<ParticipantCategory[]> {
    const res = await api.get<{ data: ParticipantCategory[] }>(`/api/access/events/${eventId}/categories`);
    return res.data.data;
  },

  async applyDefaultCategories(eventId: string): Promise<ParticipantCategory[]> {
    const res = await api.post<{ data: ParticipantCategory[] }>(`/api/access/events/${eventId}/categories/apply-defaults`);
    return res.data.data;
  },

  async createCategory(eventId: string, data: { name: string; description?: string; color?: string }): Promise<ParticipantCategory> {
    const res = await api.post<{ data: ParticipantCategory }>(`/api/access/events/${eventId}/categories`, data);
    return res.data.data;
  },

  async updateCategory(eventId: string, categoryId: string, data: Partial<{ name: string; description: string; color: string }>): Promise<ParticipantCategory> {
    const res = await api.patch<{ data: ParticipantCategory }>(`/api/access/events/${eventId}/categories/${categoryId}`, data);
    return res.data.data;
  },

  async deleteCategory(eventId: string, categoryId: string): Promise<void> {
    await api.delete(`/api/access/events/${eventId}/categories/${categoryId}`);
  },

  // ── Droits d'accès ──────────────────────────────────────────────────────

  async getAccessMatrix(eventId: string): Promise<{ zones: EventZone[]; categories: ParticipantCategory[] }> {
    const res = await api.get<{ data: { zones: EventZone[]; categories: ParticipantCategory[] } }>(`/api/access/events/${eventId}/access-rights`);
    return res.data.data;
  },

  async setAccessRights(eventId: string, rights: { categoryId: string; zoneId: string; accessLevel: ZoneAccessLevel }[]): Promise<void> {
    await api.put(`/api/access/events/${eventId}/access-rights`, { rights });
  },

  async applyDefaultMatrix(eventId: string): Promise<{ applied: number }> {
    const res = await api.post<{ data: { applied: number } }>(`/api/access/events/${eventId}/access-rights/apply-defaults`);
    return res.data.data;
  },

  // ── Badges ──────────────────────────────────────────────────────────────

  async getBadges(eventId: string): Promise<AccessBadge[]> {
    const res = await api.get<{ data: AccessBadge[] }>(`/api/access/events/${eventId}/badges`);
    return res.data.data;
  },

  async generateBadge(eventId: string, data: { categoryId: string; holderName: string; holderEmail: string; holderPhone?: string; holderPhoto?: string; ticketId?: string }): Promise<AccessBadge> {
    const res = await api.post<{ data: AccessBadge }>(`/api/access/events/${eventId}/badges`, data);
    return res.data.data;
  },

  async sendBadge(eventId: string, badgeId: string): Promise<AccessBadge> {
    const res = await api.post<{ data: AccessBadge }>(`/api/access/events/${eventId}/badges/${badgeId}/send`);
    return res.data.data;
  },

  async sendBadgeSms(eventId: string, badgeId: string, phone?: string): Promise<{ provider: string; delivered: boolean; phone: string }> {
    const res = await api.post<{ data: { provider: string; delivered: boolean; phone: string } }>(
      `/api/access/events/${eventId}/badges/${badgeId}/send-sms`,
      { phone }
    );
    return res.data.data;
  },

  async revokeBadge(eventId: string, badgeId: string): Promise<AccessBadge> {
    const res = await api.post<{ data: AccessBadge }>(`/api/access/events/${eventId}/badges/${badgeId}/revoke`);
    return res.data.data;
  },

  async regenerateBadge(eventId: string, badgeId: string): Promise<AccessBadge> {
    const res = await api.post<{ data: AccessBadge }>(`/api/access/events/${eventId}/badges/${badgeId}/regenerate`);
    return res.data.data;
  },

  // ── Tracking & Logs ──────────────────────────────────────────────────────

  async getTracking(eventId: string): Promise<ZoneTracking[]> {
    const res = await api.get<{ data: ZoneTracking[] }>(`/api/access/events/${eventId}/tracking`);
    return res.data.data;
  },

  async getAccessLogs(eventId: string, filters?: { zoneId?: string; result?: AccessResult }): Promise<AccessLog[]> {
    const params = new URLSearchParams();
    if (filters?.zoneId) params.set('zoneId', filters.zoneId);
    if (filters?.result) params.set('result', filters.result);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get<{ data: AccessLog[] }>(`/api/access/events/${eventId}/logs${query}`);
    return res.data.data;
  },

  async getRefusedAttempts(eventId: string): Promise<AccessLog[]> {
    const res = await api.get<{ data: AccessLog[] }>(`/api/access/events/${eventId}/logs/refused`);
    return res.data.data;
  },

  async exportCsv(eventId: string): Promise<void> {
    const res = await api.get(`/api/access/events/${eventId}/export/csv`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `acces-rapport-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async exportBadgesCsv(eventId: string): Promise<void> {
    const res = await api.get(`/api/access/events/${eventId}/export/badges.csv`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `badges-acces-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async duplicateConfig(eventId: string, sourceEventId: string): Promise<{ zones: number; categories: number; rights: number }> {
    const res = await api.post<{ data: { zones: number; categories: number; rights: number } }>(
      `/api/access/events/${eventId}/duplicate-config`,
      { sourceEventId }
    );
    return res.data.data;
  },

  // ── Signalements ──────────────────────────────────────────────────────────

  async getSuspectReports(eventId: string): Promise<SuspectReport[]> {
    const res = await api.get<{ data: SuspectReport[] }>(`/api/access/events/${eventId}/reports/suspect`);
    return res.data.data;
  },

  async reportSuspectBadge(badgeId: string, reason: string): Promise<SuspectReport> {
    const res = await api.post<{ data: SuspectReport }>(`/api/access/badges/${badgeId}/report`, { reason });
    return res.data.data;
  },

  // ── Scan (web) ────────────────────────────────────────────────────────────

  async scanBadge(qrCode: string, zoneId: string, agentCode?: string): Promise<ScanResult> {
    const res = await api.post<{ data: ScanResult }>('/api/access/scan', { qrCode, zoneId, agentCode });
    return res.data.data;
  },

  async verifyAgentCode(code: string): Promise<{ valid: boolean }> {
    const res = await api.post<{ data: { valid: boolean } }>('/api/access/agent-code/verify', { code });
    return res.data.data;
  },

  async syncOfflineScans(scans: OfflineScan[]): Promise<{ synced: number }> {
    const res = await api.post<{ data: { synced: number } }>('/api/access/scan/sync', { scans });
    return res.data.data;
  },

  // ── QR rotatif ────────────────────────────────────────────────────────────

  async getCurrentQr(eventId: string, badgeId: string): Promise<{ qr: string; windowSeconds: number; nextRefreshAt: number }> {
    const res = await api.get<{ data: { qr: string; windowSeconds: number; nextRefreshAt: number } }>(
      `/api/access/events/${eventId}/badges/${badgeId}/qr`
    );
    return res.data.data;
  },
};

export default AccessAPI;
