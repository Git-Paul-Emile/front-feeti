import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import AuthAPI, { type AuthUser, type RegisterData, type UpdateProfileData, type ChangePasswordData } from "../services/api/AuthAPI";

// Forme du user dans l'app (compatible avec App.tsx)
export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "user" | "organizer" | "controller";
  adminRole?: "super_admin" | "admin" | "moderator" | "support" | "organizer" | "controller" | "user";
  interests: string[]; // slugs des catégories d'événements
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  register: (data: RegisterData) => Promise<AppUser>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<AppUser>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

// Mappe le rôle backend vers la structure User de l'app
function mapToAppUser(authUser: AuthUser): AppUser {
  const adminRoles = ["admin", "super_admin", "moderator", "support"] as const;
  const isAdminLike = (adminRoles as readonly string[]).includes(authUser.role);
  const isOrganizerLike = authUser.role === "organizer" || isAdminLike;
  const isController = authUser.role === "controller";

  let role: AppUser["role"] = "user";
  if (isController) role = "controller";
  else if (isOrganizerLike) role = "organizer";

  let interests: string[] = [];
  try {
    const parsed = JSON.parse(authUser.interests ?? "[]");
    if (Array.isArray(parsed)) interests = parsed;
  } catch { /* malformed JSON */ }

  return {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    phone: authUser.phone,
    role,
    adminRole: authUser.role as AppUser["adminRole"],
    interests,
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaure la session au montage via le token stocké
  useEffect(() => {
    const token = localStorage.getItem("feeti_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    AuthAPI.getMe()
      .then((authUser) => setUser(mapToAppUser(authUser)))
      .catch(() => localStorage.removeItem("feeti_token"))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AppUser> => {
    const { user: authUser, accessToken } = await AuthAPI.login(email, password);
    localStorage.setItem("feeti_token", accessToken);
    const appUser = mapToAppUser(authUser);
    setUser(appUser);
    return appUser;
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<AppUser> => {
    const { user: authUser, accessToken } = await AuthAPI.register(data);
    localStorage.setItem("feeti_token", accessToken);
    const appUser = mapToAppUser(authUser);
    setUser(appUser);
    return appUser;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try { await AuthAPI.logout(); } catch { /* ignore */ }
    localStorage.removeItem("feeti_token");
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<AppUser> => {
    const authUser = await AuthAPI.updateProfile(data);
    const appUser = mapToAppUser(authUser);
    setUser(appUser);
    return appUser;
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordData): Promise<void> => {
    await AuthAPI.changePassword(data);
  }, []);

  const deleteAccount = useCallback(async (password: string): Promise<void> => {
    await AuthAPI.deleteAccount(password);
    localStorage.removeItem("feeti_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, changePassword, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}
