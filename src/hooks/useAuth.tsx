import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { 
  signInWithGoogle, 
  registerWithEmail, 
  signInWithEmail, 
  logout as firebaseLogout,
  onAuthChange,
  getIdToken,
  getCurrentUser
} from "./firebase-auth";
import api from "../api/axios";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  photoUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchroniser avec le backend après authentification Firebase
  const syncWithBackend = async (idToken: string, provider: "firebase" | "email") => {
    try {
      const endpoint = provider === "firebase" ? "/auth/firebase/login" : "/auth/login";
      
      // Pour l'inscription avec email, on utilise l'endpoint register
      const response = await api.post(endpoint, { idToken });
      
      if (response.data.data) {
        const { user: backendUser, accessToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        setUser(backendUser);
        return { success: true };
      }
    } catch (error: any) {
      console.error("Erreur sync backend:", error);
      return { success: false, error: error.response?.data?.message || "Erreur de synchronisation" };
    }
  };

  // Inscription Firebase
  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.success && result.idToken) {
      return await syncWithBackend(result.idToken, "firebase");
    }
    return { success: false, error: result.error };
  };

  // Inscription avec email (Firebase Auth + Backend)
  const handleRegister = async (email: string, password: string, name: string) => {
    const result = await registerWithEmail(email, password, name);
    if (result.success && result.idToken) {
      // Appeler le backend pour créer le profil
      try {
        const response = await api.post("/auth/firebase/register", {
          idToken: result.idToken,
          name,
          role: "user"
        });
        
        if (response.data.data) {
          const { user: backendUser, accessToken } = response.data.data;
          localStorage.setItem("accessToken", accessToken);
          setUser(backendUser);
          return { success: true };
        }
      } catch (error: any) {
        return { success: false, error: error.response?.data?.message || "Erreur d'inscription" };
      }
    }
    return { success: false, error: result.error };
  };

  // Connexion avec email
  const handleLogin = async (email: string, password: string) => {
    const result = await signInWithEmail(email, password);
    if (result.success && result.idToken) {
      return await syncWithBackend(result.idToken, "email");
    }
    return { success: false, error: result.error };
  };

  // Déconnexion
  const handleLogout = async () => {
    await firebaseLogout();
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  // Vérifier la session au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const response = await api.get("/auth/me");
          if (response.data.data) {
            setUser(response.data.data);
          }
        } catch {
          localStorage.removeItem("accessToken");
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Écouter les changements Firebase
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const token = await getIdToken();
        if (token) {
          try {
            const response = await api.post("/auth/firebase/verify", { idToken: token });
            if (!response.data.data) {
              // Token non reconnu, déconnecter
              await firebaseLogout();
              localStorage.removeItem("accessToken");
              setUser(null);
            }
          } catch {
            // Erreur, garder la session existante
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle: handleGoogleSignIn,
        register: handleRegister,
        login: handleLogin,
        logout: handleLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};