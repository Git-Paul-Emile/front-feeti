// Firebase Configuration for Feeti
// Pour activer Firebase, remplacez les valeurs par vos vraies clés Firebase

import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Configuration Firebase - Accès sécurisé aux variables d'environnement
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || '';
  }
  return '';
};

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID')
};

// Vérifier si Firebase est configuré
const isFirebaseConfigured = () => {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
    firebaseConfig.projectId !== 'YOUR_PROJECT_ID'
  );
};

// Variables pour les services Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

// Initialiser Firebase seulement si configuré
if (isFirebaseConfigured()) {
  try {
    // Éviter la double initialisation
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);

      // Initialiser Analytics seulement si supporté (pas en SSR)
      if (typeof window !== 'undefined') {
        isSupported().then((supported) => {
          if (supported && app) {
            analytics = getAnalytics(app);
          }
        }).catch((error) => {
          console.warn('Firebase Analytics not supported:', error);
        });
      }

      console.log('✅ Firebase initialized successfully');
    } else {
      app = getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    // Ne pas bloquer l'application si Firebase échoue
    app = null;
    auth = null;
    db = null;
    storage = null;
    analytics = null;
  }
} else {
  console.log('ℹ️ Feeti running in demo mode (Firebase not configured)');
}

// Exports avec vérifications
export { app, auth, db, storage, analytics };

// Export helper pour vérifier si Firebase est actif
export const isFirebaseActive = () => {
  return app !== null && auth !== null && db !== null;
};

// Export helper pour obtenir les services de manière sécurisée
export const getFirebaseServices = () => {
  if (!isFirebaseActive()) {
    throw new Error('Firebase is not configured. Please add your Firebase credentials to .env.local');
  }
  return { app: app!, auth: auth!, db: db!, storage: storage! };
};

// Export helper pour Analytics (optionnel)
export const getFirebaseAnalytics = () => {
  return analytics;
};

export default app;
