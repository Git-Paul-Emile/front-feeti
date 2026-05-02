import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type AuthUser,
  type ChangePasswordData,
  type RegisterData,
  type UpdateProfileData,
} from "../services/api/AuthAPI";
import { backendGateway } from "../services/backend";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "user" | "organizer" | "controller";
  adminRole?: "super_admin" | "admin" | "moderator" | "support" | "organizer" | "controller" | "user";
  interests: string[];
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

function mapToAppUser(authUser: AuthUser): AppUser {
  const adminRoles = ["admin", "super_admin", "moderator", "support"] as const;
  const isAdminLike = (adminRoles as readonly string[]).includes(authUser.role);
  const isOrganizerLike = authUser.role === "organizer" || isAdminLike;
  const isController = authUser.role === "controller";

  let role: AppUser["role"] = "user";
  if (isController) role = "controller";
  else if (isOrganizerLike) role = "organizer";

  return {
    id: authUser.uid,
    name: authUser.name,
    email: authUser.email,
    phone: authUser.phone,
    role,
    adminRole: authUser.role as AppUser["adminRole"],
    interests: authUser.interests ?? [],
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = backendGateway.auth.subscribe((authUser) => {
      setUser(authUser ? mapToAppUser(authUser) : null);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AppUser> => {
    const authUser = await backendGateway.auth.login(email, password);
    const appUser = mapToAppUser(authUser);
    setUser(appUser);
    return appUser;
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<AppUser> => {
    const authUser = await backendGateway.auth.register(data);
    const appUser = mapToAppUser(authUser);
    setUser(appUser);
    return appUser;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await backendGateway.auth.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<AppUser> => {
    const authUser = await backendGateway.auth.updateProfile(data);
    const appUser = mapToAppUser(authUser);
    setUser(appUser);
    return appUser;
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordData): Promise<void> => {
    await backendGateway.auth.changePassword(data);
  }, []);

  const deleteAccount = useCallback(async (password: string): Promise<void> => {
    await backendGateway.auth.deleteAccount(password);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateProfile, changePassword, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit etre utilise dans un AuthProvider");
  return ctx;
}
