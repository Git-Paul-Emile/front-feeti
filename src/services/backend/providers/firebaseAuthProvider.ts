import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  deleteUser,
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
import { auth, db } from "../../../config/firebase";
import { firebaseClientErrorToUserMessage } from "../../../utils/firebaseUserFacingError";
import type {
  AuthUser,
  ChangePasswordData,
  RegisterData,
  UpdateProfileData,
} from "../../api/AuthAPI";
import type { AuthProvider, AuthStateListener } from "../types";

type FirestoreUserRecord = {
  uid: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: AuthUser["role"];
  interests?: string[];
  createdAt?: Timestamp | string | null;
  updatedAt?: Timestamp | string | null;
};

function toIsoString(value: Timestamp | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  return value.toDate().toISOString();
}

function rethrowUserFacing(e: unknown): never {
  throw new Error(firebaseClientErrorToUserMessage(e));
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
const PENDING_GOOGLE_KEY = "feeti2_google_pending";
const PENDING_GOOGLE_REDIRECT_KEY = "feeti2_google_redirect_pending";

export class FirebaseAuthProvider implements AuthProvider {
  readonly mode = "firebase" as const;

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
      await signInWithEmailAndPassword(auth, email, password);
      return await this.requireProfile();
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
      await addDoc(collection(db, "users"), {
        uid: firebaseUser.uid,
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        role: data.role ?? "user",
        interests: data.interests ?? [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return await this.requireProfile();
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
        if (info?.isNewUser) {
          window.sessionStorage.setItem(PENDING_GOOGLE_KEY, "1");
          window.sessionStorage.removeItem(PENDING_GOOGLE_REDIRECT_KEY);
          return {
            requiresCompletion: true,
            prefill: {
              name: redirectResult.user.displayName ?? undefined,
              email: redirectResult.user.email ?? undefined,
            },
          };
        }
        window.sessionStorage.removeItem(PENDING_GOOGLE_REDIRECT_KEY);
        return { requiresCompletion: false, user: await this.requireProfile() };
      }

      // Essayer d'abord la popup
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const info = getAdditionalUserInfo(result);
        if (info?.isNewUser) {
          window.sessionStorage.setItem(PENDING_GOOGLE_KEY, "1");
          return {
            requiresCompletion: true,
            prefill: {
              name: result.user.displayName ?? undefined,
              email: result.user.email ?? undefined,
            },
          };
        }
        return { requiresCompletion: false, user: await this.requireProfile() };
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
          // La redirection va recharger la page, donc ce return n'est pas atteint
          return { requiresCompletion: false };
        }

        // Autres erreurs : relancer
        throw popupError;
      }
    } catch (e) {
      rethrowUserFacing(e);
    }
  }

  async completeGoogleRegistration(data: Omit<RegisterData, "email" | "password">): Promise<AuthUser> {
    const user = auth.currentUser;
    const pending = window.sessionStorage.getItem(PENDING_GOOGLE_KEY);
    if (!user || !pending) {
      throw new Error("Session Google expirée. Relancez l'inscription Google.");
    }

    try {
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name: data.name,
        email: user.email ?? "",
        phone: data.phone ?? null,
        role: data.role ?? "user",
        interests: data.interests ?? [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await updateFirebaseProfile(user, { displayName: data.name });
      window.sessionStorage.removeItem(PENDING_GOOGLE_KEY);
      return await this.requireProfile();
    } catch (e) {
      rethrowUserFacing(e);
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async updateProfile(data: UpdateProfileData): Promise<AuthUser> {
    if (!auth.currentUser) throw new Error("Non authentifie");

    const profileDoc = await this.getUserProfileDocument(auth.currentUser.uid);
    if (!profileDoc) throw new Error("Profil utilisateur introuvable");

    try {
      if (data.name) {
        await updateFirebaseProfile(auth.currentUser, { displayName: data.name });
      }

      if (data.email && data.email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, data.email);
      }

      await updateDoc(doc(db, "users", profileDoc.id), {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.interests !== undefined && { interests: data.interests }),
        updatedAt: serverTimestamp(),
      });

      return await this.requireProfile();
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

      const profileDoc = await this.getUserProfileDocument(auth.currentUser.uid);
      if (profileDoc) {
        await deleteDoc(doc(db, "users", profileDoc.id));
      }

      await deleteUser(auth.currentUser);
    } catch (e) {
      rethrowUserFacing(e);
    }
  }

  async getCurrentProfile(): Promise<AuthUser | null> {
    if (!auth.currentUser) return null;

    const profileDoc = await this.getUserProfileDocument(auth.currentUser.uid);
    if (!profileDoc) return null;

    return this.mapFirestoreUser(profileDoc.data() as FirestoreUserRecord);
  }

  private async requireProfile(): Promise<AuthUser> {
    const profile = await this.getCurrentProfile();
    if (!profile) throw new Error("Profil utilisateur introuvable");
    return profile;
  }

  private async getUserProfileDocument(uid: string) {
    const snapshot = await getDocs(
      query(collection(db, "users"), where("uid", "==", uid), limit(1))
    );

    if (snapshot.empty) return null;
    return snapshot.docs[0];
  }

  private mapFirestoreUser(user: FirestoreUserRecord): AuthUser {
    return {
      uid: user.uid,
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      role: user.role ?? "user",
      interests: user.interests ?? [],
      createdAt: toIsoString(user.createdAt),
      updatedAt: toIsoString(user.updatedAt),
    };
  }
}
