import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase-config";

// Configuration Firebase - à remplacer par tes valeurs
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "feeti2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "feeti2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "feeti2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Providers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account" // Force la sélection de compte
});

// ── Authentification Google (Redirection) ─────────────────────────────────
export const signInWithGoogle = async () => {
  try {
    // Utiliser la redirection pour Google
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    
    return {
      success: true,
      user: result.user,
      idToken
    };
  } catch (error: any) {
    console.error("Erreur Google signIn:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la connexion Google"
    };
  }
};

// ── Authentification par email/mot de passe ───────────────────────────────
export const registerWithEmail = async (email: string, password: string, displayName?: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    
    // Mettre à jour le profil si un nom est fourni
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    
    return {
      success: true,
      user: result.user,
      idToken
    };
  } catch (error: any) {
    console.error("Erreur inscription:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de l'inscription"
    };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    
    return {
      success: true,
      user: result.user,
      idToken
    };
  } catch (error: any) {
    console.error("Erreur connexion:", error);
    return {
      success: false,
      error: error.message || "Email ou mot de passe incorrect"
    };
  }
};

// ── Déconnexion ─────────────────────────────────────────────────────────
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error("Erreur déconnexion:", error);
    return { success: false, error: error.message };
  }
};

// ── Observer l'état d'authentification ─────────────────────────────────
export const onAuthChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ── Reset mot de passe ─────────────────────────────────────────────────
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    console.error("Erreur reset password:", error);
    return { success: false, error: error.message };
  }
};

// ── Vérifier le token ID ───────────────────────────────────────────────
export const getIdToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export default app;