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
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { auth, db } from "../../../config/firebase";
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
    await signInWithEmailAndPassword(auth, email, password);
    return this.requireProfile();
  }

  async register(data: RegisterData): Promise<AuthUser> {
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

    return this.requireProfile();
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async updateProfile(data: UpdateProfileData): Promise<AuthUser> {
    if (!auth.currentUser) throw new Error("Non authentifie");

    const profileDoc = await this.getUserProfileDocument(auth.currentUser.uid);
    if (!profileDoc) throw new Error("Profil utilisateur introuvable");

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

    return this.requireProfile();
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

    const profileDoc = await this.getUserProfileDocument(auth.currentUser.uid);
    if (profileDoc) {
      await deleteDoc(doc(db, "users", profileDoc.id));
    }

    await deleteUser(auth.currentUser);
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
