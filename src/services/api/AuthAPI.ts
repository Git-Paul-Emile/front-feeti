import axios from "axios";
import api from "../../routes/axiosConfig";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "user" | "organizer" | "controller" | "moderator" | "admin" | "super_admin";
  interests: string[]; // slugs des catégories d'événements
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;                     // utilisé côté client pour Firebase Auth uniquement
  role?: "user" | "organizer";
  interests?: string[];
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string | null;
  interests?: string[];
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;
  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function handleError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data ?? {};
    throw new ApiError(
      data.message ?? "Erreur serveur",
      error.response?.status ?? 500,
      data.errors
    );
  }
  throw error;
}

// ── API ───────────────────────────────────────────────────────────────────────

const AuthAPI = {
  /**
   * Crée le profil Firestore après l'inscription Firebase Auth côté client.
   * Appelé avec l'ID Token Firebase dans le header Authorization.
   *
   * Corps : { name, phone?, role?, interests? }  (sans mot de passe)
   */
  async registerProfile(data: Omit<RegisterData, "email" | "password">, idToken: string): Promise<AuthUser> {
    try {
      const res = await api.post<{ data: { user: AuthUser & { id?: string }, accessToken: string } }>("/api/auth/firebase/register", {
        idToken,
        name: data.name,
        phone: data.phone,
        role: data.role,
        interests: data.interests,
      });
      const user = res.data.data.user;
      return { ...user, uid: user.uid || user.id || "" };
    } catch (e) {
      handleError(e);
    }
  },

  /**
   * Synchronise la connexion Firebase Auth avec le backend.
   */
  async loginProfile(idToken: string): Promise<AuthUser> {
    try {
      const res = await api.post<{ data: { user: AuthUser & { id?: string }, accessToken: string } }>("/api/auth/firebase/login", {
        idToken,
      });
      const user = res.data.data.user;
      return { ...user, uid: user.uid || user.id || "" };
    } catch (e) {
      handleError(e);
    }
  },

  /**
   * Récupère le profil complet depuis Firestore.
   * Le token est injecté automatiquement par l'interceptor axios.
   */
  async getMe(): Promise<AuthUser> {
    try {
      const res = await api.get<{ data: AuthUser & { id?: string } }>("/api/auth/me");
      const user = res.data.data;
      return { ...user, uid: user.uid || user.id || "" };
    } catch (e) {
      handleError(e);
    }
  },

  /**
   * Met à jour le profil (Firestore + Firebase Auth displayName/email).
   */
  async updateProfile(data: UpdateProfileData): Promise<AuthUser> {
    try {
      const res = await api.patch<{ data: AuthUser }>("/api/auth/profile", data);
      return res.data.data!;
    } catch (e) {
      handleError(e);
    }
  },

  /**
   * Supprime le compte côté serveur (Firestore + Firebase Auth).
   * Le client doit avoir ré-authentifié l'utilisateur via Firebase SDK
   * avant d'appeler cette méthode.
   */
  async deleteAccount(): Promise<void> {
    try {
      await api.delete("/api/auth/account");
    } catch (e) {
      handleError(e);
    }
  },
};

export default AuthAPI;
