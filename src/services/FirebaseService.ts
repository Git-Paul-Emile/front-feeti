// Services Firebase pour la gestion des données Feeti
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint,
  onSnapshot,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, auth, storage } from '../config/firebase';

// Types
export interface Event {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  attendees: number;
  maxAttendees: number;
  isLive: boolean;
  organizer: string;
  organizerId: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserProfile {
  id?: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'organizer' | 'admin' | 'super_admin';
  adminRole?: 'super_admin' | 'admin' | 'moderator' | 'support' | 'organizer' | 'user';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Ticket {
  id?: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventImage: string;
  price: number;
  currency: string;
  holderName: string;
  holderEmail: string;
  holderPhone?: string;
  userId: string;
  qrCode: string;
  status: 'valid' | 'used' | 'expired' | 'cancelled';
  purchaseDate: Timestamp;
  usedDate?: Timestamp;
  quantity: number;
  transactionId: string;
  createdAt?: Timestamp;
}

export interface Transaction {
  id?: string;
  userId: string;
  eventId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'stripe' | 'paystack' | 'mobile_money';
  tickets: number;
  createdAt?: Timestamp;
  completedAt?: Timestamp;
}

// ===========================
// AUTHENTICATION SERVICES
// ===========================

export const AuthService = {
  // Inscription
  async register(email: string, password: string, name: string, role: 'user' | 'organizer' = 'user') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Mise à jour du profil Firebase
      await updateProfile(user, { displayName: name });

      // Création du profil utilisateur dans Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        name,
        email,
        role,
        adminRole: role === 'organizer' ? 'organizer' : 'user',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };

      await addDoc(collection(db, 'users'), userProfile);

      return { success: true, user: userProfile };
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      return { success: false, error: error.message };
    }
  },

  // Connexion
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Récupérer le profil utilisateur
      const userProfile = await this.getUserProfile(user.uid);

      return { success: true, user: userProfile };
    } catch (error: any) {
      console.error('Erreur connexion:', error);
      return { success: false, error: error.message };
    }
  },

  // Déconnexion
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error('Erreur déconnexion:', error);
      return { success: false, error: error.message };
    }
  },

  // Récupérer le profil utilisateur
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const q = query(collection(db, 'users'), where('uid', '==', uid), limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as UserProfile;
    } catch (error) {
      console.error('Erreur récupération profil:', error);
      return null;
    }
  },

  // Réinitialiser le mot de passe
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Erreur réinitialisation:', error);
      return { success: false, error: error.message };
    }
  },

  // Utilisateur actuel
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }
};

// ===========================
// EVENT SERVICES
// ===========================

export const EventService = {
  // Créer un événement
  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const event = {
        ...eventData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'events'), event);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Erreur création événement:', error);
      return { success: false, error: error.message };
    }
  },

  // Récupérer tous les événements
  async getAllEvents(filters?: { category?: string; isLive?: boolean; status?: string }): Promise<Event[]> {
    try {
      const constraints: QueryConstraint[] = [orderBy('date', 'desc')];

      if (filters?.category) {
        constraints.push(where('category', '==', filters.category));
      }
      if (filters?.isLive !== undefined) {
        constraints.push(where('isLive', '==', filters.isLive));
      }
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      const q = query(collection(db, 'events'), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
    } catch (error) {
      console.error('Erreur récupération événements:', error);
      return [];
    }
  },

  // Récupérer un événement par ID
  async getEventById(eventId: string): Promise<Event | null> {
    try {
      const docRef = doc(db, 'events', eventId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      return { id: docSnap.id, ...docSnap.data() } as Event;
    } catch (error) {
      console.error('Erreur récupération événement:', error);
      return null;
    }
  },

  // Mettre à jour un événement
  async updateEvent(eventId: string, updates: Partial<Event>) {
    try {
      const docRef = doc(db, 'events', eventId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erreur mise à jour événement:', error);
      return { success: false, error: error.message };
    }
  },

  // Supprimer un événement
  async deleteEvent(eventId: string) {
    try {
      const docRef = doc(db, 'events', eventId);
      await deleteDoc(docRef);

      return { success: true };
    } catch (error: any) {
      console.error('Erreur suppression événement:', error);
      return { success: false, error: error.message };
    }
  },

  // Récupérer les événements d'un organisateur
  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    try {
      const q = query(
        collection(db, 'events'),
        where('organizerId', '==', organizerId),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
    } catch (error) {
      console.error('Erreur récupération événements organisateur:', error);
      return [];
    }
  },

  // Incrémenter le nombre de participants
  async incrementAttendees(eventId: string, count: number = 1) {
    try {
      const docRef = doc(db, 'events', eventId);
      await updateDoc(docRef, {
        attendees: increment(count)
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erreur incrémentation participants:', error);
      return { success: false, error: error.message };
    }
  }
};

// ===========================
// TICKET SERVICES
// ===========================

export const TicketService = {
  // Créer des billets
  async createTickets(ticketsData: Omit<Ticket, 'id' | 'createdAt'>[]): Promise<string[]> {
    try {
      const ticketIds: string[] = [];

      for (const ticketData of ticketsData) {
        const ticket = {
          ...ticketData,
          createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'tickets'), ticket);
        ticketIds.push(docRef.id);
      }

      // Incrémenter le nombre de participants pour l'événement
      if (ticketsData.length > 0) {
        await EventService.incrementAttendees(ticketsData[0].eventId, ticketsData.length);
      }

      return ticketIds;
    } catch (error) {
      console.error('Erreur création billets:', error);
      return [];
    }
  },

  // Récupérer les billets d'un utilisateur
  async getUserTickets(userId: string): Promise<Ticket[]> {
    try {
      const q = query(
        collection(db, 'tickets'),
        where('userId', '==', userId),
        orderBy('purchaseDate', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ticket[];
    } catch (error) {
      console.error('Erreur récupération billets utilisateur:', error);
      return [];
    }
  },

  // Récupérer un billet par ID
  async getTicketById(ticketId: string): Promise<Ticket | null> {
    try {
      const docRef = doc(db, 'tickets', ticketId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      return { id: docSnap.id, ...docSnap.data() } as Ticket;
    } catch (error) {
      console.error('Erreur récupération billet:', error);
      return null;
    }
  },

  // Vérifier et utiliser un billet
  async verifyAndUseTicket(ticketId: string, qrCode: string) {
    try {
      const ticket = await this.getTicketById(ticketId);

      if (!ticket) {
        return { success: false, error: 'Billet introuvable' };
      }

      if (ticket.qrCode !== qrCode) {
        return { success: false, error: 'QR Code invalide' };
      }

      if (ticket.status === 'used') {
        return { success: false, error: 'Billet déjà utilisé', usedDate: ticket.usedDate };
      }

      if (ticket.status === 'expired') {
        return { success: false, error: 'Billet expiré' };
      }

      if (ticket.status === 'cancelled') {
        return { success: false, error: 'Billet annulé' };
      }

      // Marquer le billet comme utilisé
      const docRef = doc(db, 'tickets', ticketId);
      await updateDoc(docRef, {
        status: 'used',
        usedDate: serverTimestamp()
      });

      return { success: true, ticket };
    } catch (error: any) {
      console.error('Erreur vérification billet:', error);
      return { success: false, error: error.message };
    }
  },

  // Annuler un billet
  async cancelTicket(ticketId: string) {
    try {
      const docRef = doc(db, 'tickets', ticketId);
      await updateDoc(docRef, {
        status: 'cancelled'
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erreur annulation billet:', error);
      return { success: false, error: error.message };
    }
  }
};

// ===========================
// TRANSACTION SERVICES
// ===========================

export const TransactionService = {
  // Créer une transaction
  async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt'>) {
    try {
      const transaction = {
        ...transactionData,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'transactions'), transaction);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Erreur création transaction:', error);
      return { success: false, error: error.message };
    }
  },

  // Mettre à jour le statut d'une transaction
  async updateTransactionStatus(
    transactionId: string,
    status: Transaction['status']
  ) {
    try {
      const docRef = doc(db, 'transactions', transactionId);
      const updates: any = { status };

      if (status === 'completed') {
        updates.completedAt = serverTimestamp();
      }

      await updateDoc(docRef, updates);

      return { success: true };
    } catch (error: any) {
      console.error('Erreur mise à jour transaction:', error);
      return { success: false, error: error.message };
    }
  },

  // Récupérer les transactions d'un utilisateur
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
    } catch (error) {
      console.error('Erreur récupération transactions utilisateur:', error);
      return [];
    }
  },

  // Récupérer toutes les transactions
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, 'transactions'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
    } catch (error) {
      console.error('Erreur récupération transactions:', error);
      return [];
    }
  }
};

// ===========================
// STORAGE SERVICES
// ===========================

export const StorageService = {
  // Upload d'une image
  async uploadImage(file: File, path: string): Promise<string | null> {
    try {
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error('Erreur upload image:', error);
      return null;
    }
  },

  // Supprimer une image
  async deleteImage(imageUrl: string) {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);

      return { success: true };
    } catch (error: any) {
      console.error('Erreur suppression image:', error);
      return { success: false, error: error.message };
    }
  }
};

// ===========================
// ANALYTICS SERVICES
// ===========================

export const AnalyticsService = {
  // Statistiques des événements
  async getEventStats() {
    try {
      const events = await EventService.getAllEvents();

      const totalEvents = events.length;
      const liveEvents = events.filter(e => e.isLive).length;
      const publishedEvents = events.filter(e => e.status === 'published').length;
      const totalAttendees = events.reduce((sum, e) => sum + e.attendees, 0);

      return {
        totalEvents,
        liveEvents,
        publishedEvents,
        totalAttendees
      };
    } catch (error) {
      console.error('Erreur statistiques événements:', error);
      return null;
    }
  },

  // Statistiques des transactions
  async getTransactionStats() {
    try {
      const transactions = await TransactionService.getAllTransactions();

      const totalTransactions = transactions.length;
      const completedTransactions = transactions.filter(t => t.status === 'completed');
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);

      return {
        totalTransactions,
        completedTransactions: completedTransactions.length,
        totalRevenue
      };
    } catch (error) {
      console.error('Erreur statistiques transactions:', error);
      return null;
    }
  },

  // Statistiques des utilisateurs
  async getUserStats() {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => doc.data() as UserProfile);

      const totalUsers = users.length;
      const organizers = users.filter(u => u.role === 'organizer').length;
      const admins = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;

      return {
        totalUsers,
        organizers,
        admins,
        regularUsers: totalUsers - organizers - admins
      };
    } catch (error) {
      console.error('Erreur statistiques utilisateurs:', error);
      return null;
    }
  }
};

// Export par défaut de tous les services
export default {
  Auth: AuthService,
  Event: EventService,
  Ticket: TicketService,
  Transaction: TransactionService,
  Storage: StorageService,
  Analytics: AnalyticsService
};
