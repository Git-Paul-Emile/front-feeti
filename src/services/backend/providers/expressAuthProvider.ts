import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { auth } from "../../../config/firebase";
import { firebaseClientErrorToUserMessage } from "../../../utils/firebaseUserFacingError";
import AuthAPI, {
  ApiError,
  type AuthUser,
  type ChangePasswordData,
  type RegisterData,
  type UpdateProfileData,
} from "../../api/AuthAPI";
import type { AuthProvider, AuthStateListener } from "../types";

function rethrowUserFacing(e: unknown): never {
  throw new Error(firebaseClientErrorToUserMessage(e));
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
const PENDING_GOOGLE_TOKEN_KEY = "feeti2_google_pending_token";
const PENDING_GOOGLE_NAME_KEY  = "feeti2_google_pending_name";
const PENDING_GOOGLE_REDIRECT_KEY = "feeti2_google_redirect_pending";

export class ExpressAuthProvider implements AuthProvider {
  readonly mode = "express" as const;

  subscribe(listener: AuthStateListener): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        await listener(null);
        return;
      }

      try {
        const user = await this.getCurrentProfile();
        await listener(user);
      } catch {
        await listener(null);
      }
    });
  }

  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await firebaseUser.getIdToken();
      const user = await AuthAPI.loginProfile(idToken);
      if (!user) throw new Error("Erreur lors de la synchronisation du profil");
      return user;
    } catch (e) {
      rethrowUserFacing(e);
    }
  }

  async register(data: RegisterData): Promise<AuthUser> {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      await updateFirebaseProfile(firebaseUser, { displayName: data.name });

      const idToken = await firebaseUser.getIdToken();

      const user = await AuthAPI.registerProfile({
        name: data.name,
        phone: data.phone,
        role: data.role,
        interests: data.interests,
      }, idToken);

      if (!user) throw new Error("Erreur lors de la création du profil backend");

      return user;
    } catch (e) {
      rethrowUserFacing(e);
    }
  }

  async startGoogleAuth() {
    try {
      // Consommer d'abord un éventuel résultat de redirect précédent
      const redirectResult = await getRedirectResult(auth);
      if (redirectResult) {
        const info = getAdditionalUserInfo(redirectResult);
        const idToken = await redirectResult.user.getIdToken();
        const prefill = {
          name: redirectResult.user.displayName ?? undefined,
          email: redirectResult.user.email ?? undefined,
        };
        window.sessionStorage.removeItem(PENDING_GOOGLE_REDIRECT_KEY);

        const savePendingGoogle = (token: string, name?: string) => {
          window.sessionStorage.setItem(PENDING_GOOGLE_TOKEN_KEY, token);
          if (name) window.sessionStorage.setItem(PENDING_GOOGLE_NAME_KEY, name);
          else window.sessionStorage.removeItem(PENDING_GOOGLE_NAME_KEY);
        };

        if (info?.isNewUser) {
          savePendingGoogle(idToken, prefill.name);
          return { requiresCompletion: true, prefill };
        }

        try {
          const user = await AuthAPI.loginProfile(idToken);
          return { requiresCompletion: false, user };
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            // Profil backend absent (inscription précédemment abandonnée)
            savePendingGoogle(idToken, prefill.name);
            return { requiresCompletion: true, prefill };
          }
          throw err;
        }
      }

      const savePendingGoogle = (token: string, name?: string) => {
        window.sessionStorage.setItem(PENDING_GOOGLE_TOKEN_KEY, token);
        if (name) window.sessionStorage.setItem(PENDING_GOOGLE_NAME_KEY, name);
        else window.sessionStorage.removeItem(PENDING_GOOGLE_NAME_KEY);
      };

      // Essayer d'abord la popup
      let popupResult;
      try {
        popupResult = await signInWithPopup(auth, googleProvider);
      } catch (popupError: unknown) {
        const errorCode = (popupError as { code?: string }).code;
        // Si la popup est bloquée ou fermée, fallback sur la redirection
        if (
          errorCode === "auth/popup-blocked" ||
          errorCode === "auth/popup-closed-by-user" ||
          errorCode === "auth/cancelled-popup-request"
        ) {
          console.log("Popup bloquée ou fermée, passage à la redirection Google...");
          window.sessionStorage.setItem(PENDING_GOOGLE_REDIRECT_KEY, "1");
          await signInWithRedirect(auth, googleProvider);
          return { requiresCompletion: false };
        }
        throw popupError;
      }

      const info = getAdditionalUserInfo(popupResult);
      const idToken = await popupResult.user.getIdToken();
      const prefill = {
        name: popupResult.user.displayName ?? undefined,
        email: popupResult.user.email ?? undefined,
      };

      if (info?.isNewUser) {
        savePendingGoogle(idToken, prefill.name);
        return { requiresCompletion: true, prefill };
      }

      try {
        const user = await AuthAPI.loginProfile(idToken);
        return { requiresCompletion: false, user };
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          // Profil backend absent (inscription précédemment abandonnée)
          savePendingGoogle(idToken, prefill.name);
          return { requiresCompletion: true, prefill };
        }
        throw err;
      }
    } catch (e) {
      rethrowUserFacing(e);
    }
  }

  async completeGoogleRegistration(data: Omit<RegisterData, "email" | "password">): Promise<AuthUser> {
    const idToken = window.sessionStorage.getItem(PENDING_GOOGLE_TOKEN_KEY);
    if (!idToken) {
      throw new Error("Session Google expirée. Relancez l'inscription Google.");
    }
    try {
      const user = await AuthAPI.registerProfile(data, idToken);
      window.sessionStorage.removeItem(PENDING_GOOGLE_TOKEN_KEY);
      window.sessionStorage.removeItem(PENDING_GOOGLE_NAME_KEY);
      return user;
    } catch (e) {
      rethrowUserFacing(e);
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem("accessToken");
    await signOut(auth);
  }

  async updateProfile(data: UpdateProfileData): Promise<AuthUser> {
    if (!auth.currentUser) throw new Error("Non authentifie");

    try {
      if (data.name) {
        await updateFirebaseProfile(auth.currentUser, { displayName: data.name });
      }

      if (data.email && data.email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, data.email);
      }

      const user = await AuthAPI.updateProfile(data);
      if (!user) throw new Error("Erreur lors de la mise à jour du profil backend");

      return user;
    } catch (e) {
      rethrowUserFacing(e);
    }
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    if (!auth.currentUser?.email) throw new Error("Non authentifie");

    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      data.currentPassword
    );

    try {
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, data.newPassword);
    } catch (e) {
      rethrowUserFacing(e);
    }
  }

  async deleteAccount(password: string): Promise<void> {
    if (!auth.currentUser?.email) throw new Error("Non authentifie");

    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      password
    );

    try {
      await reauthenticateWithCredential(auth.currentUser, credential);
      await AuthAPI.deleteAccount();
      await signOut(auth);
    } catch (e) {
      rethrowUserFacing(e);
    }
  }

  async getCurrentProfile(): Promise<AuthUser | null> {
    if (!auth.currentUser) return null;
    try {
      return await AuthAPI.getMe();
    } catch {
      return null;
    }
  }

  private async requireProfile(): Promise<AuthUser> {
    const profile = await this.getCurrentProfile();
    if (!profile) throw new Error("Profil utilisateur introuvable");
    return profile;
  }
}
