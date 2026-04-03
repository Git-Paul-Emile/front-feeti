import axiosInstance from "./axiosConfig.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoyaltyProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  points: number;
  pointsEarned: number;
  pointsSpent: number;
  level: "Mobembo" | "Elengi" | "Momi" | "Mwana" | "Boboto";
  eventsAttended: number;
  totalSpent: number;
  referralCode: string;
  referrals: number;
  createdAt: string;
  badges?: AmbassadorBadge[];
}

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  image: string;
  stock: number;
  isActive: boolean;
}

export interface LoyaltyMission {
  id: string;
  title: string;
  description: string;
  points: number;
  actionType: string;
  target: number;
  isActive: boolean;
  progress: number;
  completed: boolean;
  rewardPaid: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  level: string;
  isCurrentUser: boolean;
}

export interface PointsLedgerEntry {
  id: string;
  action: string;
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface LoyaltyPartner {
  id: string;
  name: string;
  description: string;
  category: string;
  discount: string;
  discountByLevel: Record<string, string>;
  bonusPoints: number;
  logo: string;
  address: string;
  phone: string;
  website: string;
  isActive: boolean;
}

export interface PartnerDiscount {
  partner: { id: string; name: string; category: string };
  userLevel: string;
  discount: string;
  bonusPoints: number;
}

export interface PartnerSpending {
  id: string;
  userId: string;
  partnerId: string;
  partner?: { name: string; category: string };
  amountFCFA: number;
  pointsEarned: number;
  description: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  image: string;
  eventId?: string;
  likesCount: number;
  commentsCount: number;
  status: "pending" | "approved" | "rejected";
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  engagements?: CommunityEngagement[];
}

export interface CommunityEngagement {
  id: string;
  userId: string;
  postId: string;
  type: "like" | "comment";
  content: string;
  createdAt: string;
}

export interface AmbassadorBadge {
  id: string;
  userId: string;
  badgeType: string;
  title: string;
  description: string;
  earnedAt: string;
}

export interface LoyaltyBonus {
  id: string;
  title: string;
  description: string;
  bonusType: "multiplier" | "flat_bonus" | "activity_bonus" | "social_bonus";
  value: number;
  actionType?: string;
  minLevel?: string;
  conditions: Record<string, any>;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface PointsPaymentSimulation {
  pointsAvailable: number;
  pointsUsable: number;
  discountFCFA: number;
  amountToPay: number;
  amountFCFA: number;
  pointValueFCFA: number;
  maxPointsUsable: number;
}

export interface PointsPaymentResult {
  pointsUsed: number;
  discountFCFA: number;
  amountToPay: number;
}

export interface VipBenefits {
  level: string;
  points: number;
  nextLevel: string | null;
  pointsToNext: number;
  benefits: {
    partnerDiscounts: string[];
    eventAccess: string[];
    exclusivePerks: string[];
  };
}

export interface AmbassadorStatus {
  ambassadorTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  score: number;
  stats: { postCount: number; referralCount: number; eventsAttended: number; vipLogs: number };
  badges: AmbassadorBadge[];
  level: string;
  points: number;
}

export interface VipAccessLog {
  id: string;
  userId: string;
  eventId: string;
  accessType: string;
  ticketId?: string;
  grantedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  pointsDistributed: number;
  pointsUsed: number;
  activeUsers: number;
  levelCounts: { level: string; _count: { id: number } }[];
  communityStats: { status: string; _count: { id: number } }[];
  partnerSpendingTotal: number;
  partnerPointsTotal: number;
  partnerTransactions: number;
}

export interface FraudAlerts {
  shareAbuse: { id: string; userId: string; date: string; count: number }[];
  recentManual: any[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── API utilisateur ──────────────────────────────────────────────────────────

export const loyaltyApi = {
  getMyProfile: async (): Promise<LoyaltyProfile> => {
    const res = await axiosInstance.get("/loyalty/me");
    return res.data.data;
  },

  getMyLedger: async (page = 1, limit = 20): Promise<PaginatedResult<PointsLedgerEntry>> => {
    const res = await axiosInstance.get("/loyalty/me/ledger", { params: { page, limit } });
    return res.data.data;
  },

  getMyBadges: async (): Promise<AmbassadorBadge[]> => {
    const res = await axiosInstance.get("/loyalty/me/badges");
    return res.data.data;
  },

  getMyVipAccess: async (): Promise<PaginatedResult<VipAccessLog>> => {
    const res = await axiosInstance.get("/loyalty/me/vip");
    return res.data.data;
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const res = await axiosInstance.get("/loyalty/leaderboard");
    return res.data.data;
  },

  getRewards: async (): Promise<LoyaltyReward[]> => {
    const res = await axiosInstance.get("/loyalty/rewards");
    return res.data.data;
  },

  redeemReward: async (rewardId: string) => {
    const res = await axiosInstance.post("/loyalty/rewards/redeem", { rewardId });
    return res.data;
  },

  getMissions: async (): Promise<LoyaltyMission[]> => {
    const res = await axiosInstance.get("/loyalty/missions");
    return res.data.data;
  },

  shareEvent: async (eventId: string) => {
    const res = await axiosInstance.post("/loyalty/actions/share", { eventId });
    return res.data;
  },

  applyReferralCode: async (referralCode: string) => {
    const res = await axiosInstance.post("/loyalty/referral/apply", { referralCode });
    return res.data;
  },

  // Partenaires
  getPartners: async (): Promise<LoyaltyPartner[]> => {
    const res = await axiosInstance.get("/loyalty/partners");
    return res.data.data;
  },

  getPartnerDiscount: async (partnerId: string): Promise<PartnerDiscount> => {
    const res = await axiosInstance.get(`/loyalty/partners/${partnerId}/discount`);
    return res.data.data;
  },

  recordPartnerSpending: async (partnerId: string, amountFCFA: number, description?: string) => {
    const res = await axiosInstance.post("/loyalty/partners/spending", { partnerId, amountFCFA, description });
    return res.data;
  },

  // Communauté
  getCommunityPosts: async (page = 1, limit = 20): Promise<PaginatedResult<CommunityPost>> => {
    const res = await axiosInstance.get("/loyalty/community/posts", { params: { page, limit } });
    return res.data.data;
  },

  createCommunityPost: async (data: { title: string; content: string; image?: string; eventId?: string }) => {
    const res = await axiosInstance.post("/loyalty/community/posts", data);
    return res.data;
  },

  engageCommunityPost: async (postId: string, type: "like" | "comment", content?: string) => {
    const res = await axiosInstance.post(`/loyalty/community/posts/${postId}/engage`, { type, content });
    return res.data;
  },

  // Paiement partiel avec points
  simulatePointsPayment: async (amountFCFA: number): Promise<PointsPaymentSimulation> => {
    const res = await axiosInstance.get("/loyalty/points/simulate-payment", { params: { amount: amountFCFA } });
    return res.data.data;
  },

  applyPointsPayment: async (pointsToUse: number, ticketId: string, amountFCFA: number): Promise<PointsPaymentResult> => {
    const res = await axiosInstance.post("/loyalty/points/apply-payment", { pointsToUse, ticketId, amountFCFA });
    return res.data.data;
  },

  // Avantages VIP + ambassadeur
  getVipBenefits: async (): Promise<VipBenefits> => {
    const res = await axiosInstance.get("/loyalty/me/vip-benefits");
    return res.data.data;
  },

  getAmbassadorStatus: async (): Promise<AmbassadorStatus> => {
    const res = await axiosInstance.get("/loyalty/me/ambassador");
    return res.data.data;
  },

  // Bonus actifs
  getActiveBonuses: async (): Promise<LoyaltyBonus[]> => {
    const res = await axiosInstance.get("/loyalty/bonuses/active");
    return res.data.data;
  },

  // ─── Administration ────────────────────────────────────────────────────────

  getAdminStats: async (): Promise<AdminStats> => {
    const res = await axiosInstance.get("/loyalty/admin/stats");
    return res.data.data;
  },

  getFraudAlerts: async (): Promise<FraudAlerts> => {
    const res = await axiosInstance.get("/loyalty/admin/fraud-alerts");
    return res.data.data;
  },

  getAllUsers: async (params: { search?: string; level?: string; page?: number; limit?: number } = {}) => {
    const res = await axiosInstance.get("/loyalty/admin/users", { params });
    return res.data as { items: LoyaltyProfile[]; total: number; page: number; totalPages: number };
  },

  getAllLedger: async (params: { page?: number; limit?: number; action?: string } = {}) => {
    const res = await axiosInstance.get("/loyalty/admin/ledger", { params });
    return res.data as { items: any[]; total: number; page: number; totalPages: number };
  },

  manualAdjustPoints: async (profileId: string, delta: number, description: string) => {
    const res = await axiosInstance.post("/loyalty/admin/adjust", { profileId, delta, description });
    return res.data;
  },

  exportLedgerCSV: async (action?: string) => {
    const res = await axiosInstance.get("/loyalty/admin/export/ledger", {
      params: action ? { action } : {},
      responseType: "blob",
    });
    return res.data as Blob;
  },

  exportPartnerSpendingCSV: async () => {
    const res = await axiosInstance.get("/loyalty/admin/export/partner-spendings", { responseType: "blob" });
    return res.data as Blob;
  },

  // Admin Rewards
  getAdminRewards: async (): Promise<LoyaltyReward[]> => {
    const res = await axiosInstance.get("/loyalty/admin/rewards");
    return res.data.data;
  },

  createReward: async (data: Omit<LoyaltyReward, "id" | "isActive">) => {
    const res = await axiosInstance.post("/loyalty/admin/rewards", data);
    return res.data.data as LoyaltyReward;
  },

  updateReward: async (id: string, data: Partial<LoyaltyReward>) => {
    const res = await axiosInstance.put(`/loyalty/admin/rewards/${id}`, data);
    return res.data.data as LoyaltyReward;
  },

  deleteReward: async (id: string) => {
    await axiosInstance.delete(`/loyalty/admin/rewards/${id}`);
  },

  // Admin Partners
  getAdminPartners: async (): Promise<LoyaltyPartner[]> => {
    const res = await axiosInstance.get("/loyalty/admin/partners");
    return res.data.data;
  },

  createPartner: async (data: Omit<LoyaltyPartner, "id" | "isActive">) => {
    const res = await axiosInstance.post("/loyalty/admin/partners", data);
    return res.data.data as LoyaltyPartner;
  },

  updatePartner: async (id: string, data: Partial<LoyaltyPartner>) => {
    const res = await axiosInstance.put(`/loyalty/admin/partners/${id}`, data);
    return res.data.data as LoyaltyPartner;
  },

  deletePartner: async (id: string) => {
    await axiosInstance.delete(`/loyalty/admin/partners/${id}`);
  },

  getAdminPartnerSpendings: async (params: { page?: number; limit?: number; partnerId?: string } = {}) => {
    const res = await axiosInstance.get("/loyalty/admin/partners/spendings", { params });
    return res.data.data as PaginatedResult<PartnerSpending> & { totals: { amountFCFA: number; pointsEarned: number } };
  },

  // Admin Missions
  getAdminMissions: async (): Promise<LoyaltyMission[]> => {
    const res = await axiosInstance.get("/loyalty/admin/missions");
    return res.data.data;
  },

  createMission: async (data: Omit<LoyaltyMission, "id" | "isActive" | "progress" | "completed" | "rewardPaid">) => {
    const res = await axiosInstance.post("/loyalty/admin/missions", data);
    return res.data.data as LoyaltyMission;
  },

  updateMission: async (id: string, data: Partial<LoyaltyMission>) => {
    const res = await axiosInstance.put(`/loyalty/admin/missions/${id}`, data);
    return res.data.data as LoyaltyMission;
  },

  deleteMission: async (id: string) => {
    await axiosInstance.delete(`/loyalty/admin/missions/${id}`);
  },

  // Admin Bonus / campagnes
  getAllBonuses: async (): Promise<LoyaltyBonus[]> => {
    const res = await axiosInstance.get("/loyalty/admin/bonuses");
    return res.data.data;
  },

  createBonus: async (data: Omit<LoyaltyBonus, "id">) => {
    const res = await axiosInstance.post("/loyalty/admin/bonuses", data);
    return res.data.data as LoyaltyBonus;
  },

  updateBonus: async (id: string, data: Partial<LoyaltyBonus>) => {
    const res = await axiosInstance.put(`/loyalty/admin/bonuses/${id}`, data);
    return res.data.data as LoyaltyBonus;
  },

  deleteBonus: async (id: string) => {
    await axiosInstance.delete(`/loyalty/admin/bonuses/${id}`);
  },

  // Admin Communauté
  getAdminCommunityPosts: async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const res = await axiosInstance.get("/loyalty/admin/community/posts", { params });
    return res.data.data as PaginatedResult<CommunityPost>;
  },

  moderateCommunityPost: async (id: string, status: "approved" | "rejected") => {
    const res = await axiosInstance.put(`/loyalty/admin/community/posts/${id}/moderate`, { status });
    return res.data.data as CommunityPost;
  },

  adminDeleteCommunityPost: async (id: string) => {
    await axiosInstance.delete(`/loyalty/admin/community/posts/${id}`);
  },

  // Admin Badges
  getAdminBadges: async (params: { page?: number; limit?: number } = {}) => {
    const res = await axiosInstance.get("/loyalty/admin/badges", { params });
    return res.data.data as PaginatedResult<AmbassadorBadge>;
  },

  // Admin VIP
  getAdminVipLogs: async (params: { page?: number; limit?: number; eventId?: string } = {}) => {
    const res = await axiosInstance.get("/loyalty/admin/vip-logs", { params });
    return res.data.data as PaginatedResult<VipAccessLog>;
  },
};
