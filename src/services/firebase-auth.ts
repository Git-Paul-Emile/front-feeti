import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { firebaseClientErrorToUserMessage } from "../utils/firebaseUserFacingError";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return { success: true, user: result.user, idToken };
  } catch (error: unknown) {
    return {
      success: false,
      error: firebaseClientErrorToUserMessage(
        error,
        "Impossible de se connecter avec Google pour le moment ; réessayez ou utilisez votre e‑mail."
      ),
    };
  }
};

export const registerWithEmail = async (email: string, password: string, displayName?: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return { success: true, user: result.user, idToken };
  } catch (error: unknown) {
    return {
      success: false,
      error: firebaseClientErrorToUserMessage(error, "Impossible de finaliser l'inscription pour le moment."),
    };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    return { success: true, user: result.user, idToken };
  } catch (error: unknown) {
    return {
      success: false,
      error: firebaseClientErrorToUserMessage(
        error,
        "Connexion impossible pour le moment. Vérifiez votre connexion et réessayez."
      ),
    };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: firebaseClientErrorToUserMessage(error, "Impossible de vous déconnecter pour le moment."),
    };
  }
};

export const onAuthChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: firebaseClientErrorToUserMessage(error, "Impossible d'envoyer l'e‑mail de réinitialisation."),
    };
  }
};

export const getIdToken = async () => {
  const user = auth.currentUser;
  if (user) return await user.getIdToken();
  return null;
};

export const getCurrentUser = () => auth.currentUser;

export { auth };
