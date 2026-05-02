import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { auth } from "../../../config/firebase";
import AuthAPI, {
  type AuthUser,
  type ChangePasswordData,
  type RegisterData,
  type UpdateProfileData,
} from "../../api/AuthAPI";
import type { AuthProvider, AuthStateListener } from "../types";

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
    const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await firebaseUser.getIdToken();
    const user = await AuthAPI.loginProfile(idToken);
    if (!user) throw new Error("Erreur lors de la synchronisation du profil");
    return user;
  }

  async register(data: RegisterData): Promise<AuthUser> {
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
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async updateProfile(data: UpdateProfileData): Promise<AuthUser> {
    if (!auth.currentUser) throw new Error("Non authentifie");

    if (data.name) {
      await updateFirebaseProfile(auth.currentUser, { displayName: data.name });
    }

    if (data.email && data.email !== auth.currentUser.email) {
      await updateEmail(auth.currentUser, data.email);
    }

    const user = await AuthAPI.updateProfile(data);
    if (!user) throw new Error("Erreur lors de la mise à jour du profil backend");
    
    return user;
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    if (!auth.currentUser?.email) throw new Error("Non authentifie");

    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      data.currentPassword
    );

    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, data.newPassword);
  }

  async deleteAccount(password: string): Promise<void> {
    if (!auth.currentUser?.email) throw new Error("Non authentifie");

    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      password
    );

    await reauthenticateWithCredential(auth.currentUser, credential);
    await AuthAPI.deleteAccount();
    await signOut(auth);
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
