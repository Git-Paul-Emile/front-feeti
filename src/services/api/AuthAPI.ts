import axios from 'axios';
import api from '../../routes/axiosConfig';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'organizer' | 'controller' | 'moderator' | 'admin' | 'super_admin';
  interests: string; // JSON array string of category slugs
  createdAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: 'user' | 'organizer';
  interests?: string[]; // slugs des catégories d'événements choisies à l'inscription
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
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
      data.message || 'Erreur serveur',
      error.response?.status ?? 500,
      data.errors
    );
  }
  throw error;
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

const AuthAPI = {
  async register(body: RegisterData): Promise<AuthResponse> {
    try {
      const res = await api.post<{ data: AuthResponse }>('/api/auth/register', body);
      return res.data.data!;
    } catch (e) { handleError(e); }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await api.post<{ data: AuthResponse }>('/api/auth/login', { email, password });
      return res.data.data!;
    } catch (e) { handleError(e); }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch { /* ignore */ }
  },

  async getMe(): Promise<AuthUser> {
    try {
      const res = await api.get<{ data: AuthUser }>('/api/auth/me');
      return res.data.data!;
    } catch (e) { handleError(e); }
  },

  async updateProfile(data: UpdateProfileData): Promise<AuthUser> {
    try {
      const res = await api.patch<{ data: AuthUser }>('/api/auth/profile', data);
      return res.data.data!;
    } catch (e) { handleError(e); }
  },

  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await api.patch('/api/auth/password', data);
    } catch (e) { handleError(e); }
  },

  async deleteAccount(password: string): Promise<void> {
    try {
      await api.delete('/api/auth/account', { data: { password } });
    } catch (e) { handleError(e); }
  },

  async refresh(): Promise<string> {
    try {
      const res = await api.post<{ data: { accessToken: string } }>('/api/auth/refresh');
      return res.data.data!.accessToken;
    } catch (e) { handleError(e); }
  },
};

export default AuthAPI;
