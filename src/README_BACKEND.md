# 🏗️ Architecture Backend - Feeti Platform

## Vue d'Ensemble

Cette documentation explique l'architecture backend complète de la plateforme de billetterie **Feeti**.

> **Note sur la réalité du code** : la source de vérité pour toutes les données métier (utilisateurs, événements, billets, transactions, wallets, etc.) est **PostgreSQL via Prisma**, servi par le backend Express réel du dossier `back/` (déployé sur Render). **Firebase Auth** gère exclusivement l'authentification (email/password, Google OAuth, mot de passe oublié). **Firestore n'est qu'un miroir optionnel** de synchronisation (activable/désactivable via `FIRESTORE_SYNC_ENABLED`, voir `back/src/services/firestore-sync.service.ts`) — ce n'est pas la base de données applicative. Le dossier `functions/` (Cloud Functions Firebase) a été retiré du projet, non utilisé en production. Les sections ci-dessous décrivant des "Collections Firestore" comme source de vérité, des règles de sécurité Firestore protégeant les données métier, ou un déploiement via `firebase deploy`, sont obsolètes et conservées uniquement à titre d'illustration historique du schéma logique — se référer à `back/prisma/schema.prisma` pour le schéma réel.

---

## 📚 Table des Matières

1. [Architecture Générale](#architecture-générale)
2. [Technologies Utilisées](#technologies-utilisées)
3. [Structure des Fichiers](#structure-des-fichiers)
4. [Services Firebase](#services-firebase)
5. [Schéma de Base de Données](#schéma-de-base-de-données)
6. [API et Services](#api-et-services)
7. [Sécurité](#sécurité)
8. [Déploiement](#déploiement)

---

## 🏛️ Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  User Pages  │  │ Back Office  │  │  Components  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
   ┌──────────────────────┐      ┌──────────────────────────┐
   │      Firebase Auth    │      │   API back/ (Express)     │
   │ (authentification uniquement) │  → Prisma → PostgreSQL   │
   └──────────────────────┘      │  (source de vérité)       │
                                  └─────────────┬─────────────┘
                                                │ (optionnel)
                                                ▼
                                    ┌──────────────────────┐
                                    │  Firestore (miroir)    │
                                    │  FIRESTORE_SYNC_ENABLED│
                                    └──────────────────────┘
```

Backend déployé sur **Render** (`back/render.yaml`), frontend sur **Vercel** (`front/vercel.json`).

---

## 🔧 Technologies Utilisées

### Backend

| Technologie | Usage |
|-------------|-------|
| **Express (Node.js)** | API backend réelle (`back/`), déployée sur Render |
| **Prisma** | ORM vers PostgreSQL (source de vérité des données) |
| **PostgreSQL** | Base de données applicative |
| **Firebase Auth** | Authentification uniquement (email/password, Google) |
| **Firestore** | Miroir de synchronisation optionnel (`FIRESTORE_SYNC_ENABLED`), pas la source de vérité |
| **Firebase Storage** | Stockage de fichiers (médias) |

Le dossier `functions/` (Cloud Functions Firebase) a été retiré du projet.

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **React** | 18.x | Framework UI |
| **TypeScript** | 5.x | Type safety |
| **Vite** | 5.x | Build tool |
| **Tailwind CSS** | 4.0 | Styling |

### Libraries

| Library | Usage |
|---------|-------|
| **Recharts** | Graphiques et analytics |
| **Lucide React** | Icônes |
| **Sonner** | Notifications toast |
| **shadcn/ui** | Composants UI |

---

## 📁 Structure des Fichiers

```
feeti-platform/
├── config/
│   └── firebase.ts              # Configuration Firebase
├── services/
│   └── FirebaseService.ts       # Services CRUD complets
├── components/
│   ├── pages/
│   │   ├── BackOfficeDashboard.tsx  # Back office principal
│   │   ├── AdminDashboard.tsx       # Dashboard admin
│   │   ├── OrganizerDashboard.tsx   # Dashboard organisateur
│   │   └── UserDashboard.tsx        # Dashboard utilisateur
│   └── ui/                      # Composants shadcn/ui
├── database/
│   └── schema.sql               # Schéma SQL (référence)
├── docs/
│   ├── FIREBASE_SETUP.md        # Guide configuration Firebase
│   ├── BACKOFFICE_GUIDE.md      # Guide utilisateur back office
│   └── README_BACKEND.md        # Ce fichier
├── App.tsx                      # Point d'entrée application
└── package.json                 # Dépendances
```

---

## 🔥 Services Firebase

### Configuration (`/config/firebase.ts`)

```typescript
// Initialisation Firebase avec protection contre les doubles initialisations
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "feeti-app.firebaseapp.com",
  projectId: "feeti-app",
  storageBucket: "feeti-app.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialisation sécurisée
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

export { auth, db, storage, analytics };
```

### Services Layer (`/services/FirebaseService.ts`)

Le fichier contient **6 modules principaux** :

#### 1. AuthService - Authentification
```typescript
AuthService.register()      // Inscription utilisateur
AuthService.login()         // Connexion
AuthService.logout()        // Déconnexion
AuthService.getUserProfile() // Récupérer profil
AuthService.resetPassword()  // Réinitialiser mot de passe
```

#### 2. EventService - Gestion des événements
```typescript
EventService.createEvent()          // Créer événement
EventService.getAllEvents()         // Liste tous les événements
EventService.getEventById()         // Détails d'un événement
EventService.updateEvent()          // Modifier événement
EventService.deleteEvent()          // Supprimer événement
EventService.getEventsByOrganizer() // Événements d'un organisateur
EventService.incrementAttendees()   // Incrémenter participants
```

#### 3. TicketService - Gestion des billets
```typescript
TicketService.createTickets()       // Créer des billets
TicketService.getUserTickets()      // Billets d'un utilisateur
TicketService.getTicketById()       // Détails d'un billet
TicketService.verifyAndUseTicket()  // Vérifier et utiliser billet
TicketService.cancelTicket()        // Annuler billet
```

#### 4. TransactionService - Gestion des transactions
```typescript
TransactionService.createTransaction()        // Nouvelle transaction
TransactionService.updateTransactionStatus()  // Mettre à jour statut
TransactionService.getUserTransactions()      // Transactions utilisateur
TransactionService.getAllTransactions()       // Toutes les transactions
```

#### 5. StorageService - Gestion du stockage
```typescript
StorageService.uploadImage()   // Upload image
StorageService.deleteImage()   // Supprimer image
```

#### 6. AnalyticsService - Analytics et statistiques
```typescript
AnalyticsService.getEventStats()       // Statistiques événements
AnalyticsService.getTransactionStats() // Statistiques transactions
AnalyticsService.getUserStats()        // Statistiques utilisateurs
```

---

## 🗄️ Schéma de Base de Données

### Modèles (schéma logique — la source de vérité réelle est Prisma/PostgreSQL, `back/prisma/schema.prisma`)

#### Collection `users`
```javascript
{
  uid: string,              // ID Firebase Auth
  name: string,
  email: string,
  phone?: string,
  avatar?: string,
  role: 'user' | 'organizer' | 'admin' | 'super_admin',
  adminRole?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Collection `events`
```javascript
{
  title: string,
  description: string,
  date: string,             // Format: YYYY-MM-DD
  time: string,             // Format: HH:MM
  location: string,
  image: string,            // URL
  price: number,
  currency: string,         // Ex: FCFA
  category: string,
  tags: string[],
  attendees: number,
  maxAttendees: number,
  isLive: boolean,
  organizer: string,
  organizerId: string,      // Reference to users
  status: 'draft' | 'published' | 'cancelled' | 'completed',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Collection `tickets`
```javascript
{
  eventId: string,          // Reference to events
  eventTitle: string,
  eventDate: string,
  eventTime: string,
  eventLocation: string,
  eventImage: string,
  price: number,
  currency: string,
  holderName: string,
  holderEmail: string,
  holderPhone?: string,
  userId: string,           // Reference to users
  qrCode: string,           // URL or encoded data
  status: 'valid' | 'used' | 'expired' | 'cancelled',
  purchaseDate: Timestamp,
  usedDate?: Timestamp,
  quantity: number,
  transactionId: string,    // Reference to transactions
  createdAt: Timestamp
}
```

#### Collection `transactions`
```javascript
{
  userId: string,           // Reference to users
  eventId: string,          // Reference to events
  amount: number,
  currency: string,
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  paymentMethod: 'stripe' | 'paystack' | 'mobile_money',
  tickets: number,          // Quantity
  createdAt: Timestamp,
  completedAt?: Timestamp
}
```

### Index Recommandés

```javascript
// Events
events: {
  indexes: [
    { fields: ['date'], order: 'desc' },
    { fields: ['category'] },
    { fields: ['isLive'] },
    { fields: ['organizerId', 'date'] }
  ]
}

// Tickets
tickets: {
  indexes: [
    { fields: ['userId', 'purchaseDate'], order: 'desc' },
    { fields: ['eventId'] },
    { fields: ['status'] }
  ]
}

// Transactions
transactions: {
  indexes: [
    { fields: ['userId', 'createdAt'], order: 'desc' },
    { fields: ['status'] },
    { fields: ['paymentMethod'] }
  ]
}
```

---

## 🔐 Sécurité

> Le contrôle d'accès réel sur les données métier est appliqué par les middlewares Express (`back/src/middlewares/`) sur PostgreSQL, pas par des règles Firestore. Les règles ci-dessous ne s'appliqueraient qu'au miroir Firestore optionnel (lecture), pas aux données de production.

### Règles de Sécurité Firestore (miroir optionnel uniquement)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid))
        .data.role in ['admin', 'super_admin'];
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) || isAdmin();
    }
    
    // Events collection
    match /events/{eventId} {
      allow read: if true;  // Public reading
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin() || 
        isOwner(resource.data.organizerId);
    }
    
    // Tickets collection
    match /tickets/{ticketId} {
      allow read: if isAuthenticated() && 
        (isOwner(resource.data.userId) || isAdmin());
      allow create: if isAuthenticated();
      allow update: if isAdmin();
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && 
        (isOwner(resource.data.userId) || isAdmin());
      allow create: if isAuthenticated();
      allow update: if isAdmin();
    }
  }
}
```

### Règles de Sécurité Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Event images
    match /events/{filename} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.resource.size < 5 * 1024 * 1024 && // 5MB max
        request.resource.contentType.matches('image/.*');
    }
    
    // User avatars
    match /users/{userId}/{filename} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.size < 2 * 1024 * 1024 && // 2MB max
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

### Validation des Données

Toutes les données sont validées côté client ET côté serveur :

```typescript
// Exemple de validation d'événement
function validateEvent(event: Partial<Event>): boolean {
  return (
    event.title && event.title.length >= 3 &&
    event.date && new Date(event.date) > new Date() &&
    event.price && event.price >= 0 &&
    event.maxAttendees && event.maxAttendees > 0
  );
}
```

---

## 🚀 Déploiement (réalité)

Le déploiement réel n'utilise pas `firebase deploy` pour le backend. Il repose sur :

- **Backend** (`back/`, Express + Prisma/PostgreSQL) : déployé sur **Render** via `back/render.yaml`
- **Frontend** (`front/`) : déployé sur **Vercel** via `front/vercel.json`
- **Firebase** : uniquement pour l'authentification (Firebase Auth), configurée via les variables `VITE_FIREBASE_*` côté front et `FIREBASE_PROJECT_ID`/`FIREBASE_CLIENT_EMAIL`/`FIREBASE_PRIVATE_KEY` côté back (vérification des ID tokens)

### Variables d'Environnement (Frontend)

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=https://api.feeti.com
```

### Variables d'Environnement (Backend `back/`)

```bash
DATABASE_URL=postgresql://...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
FIRESTORE_SYNC_ENABLED=true
JWT_SECRET=...
```

---

## 📊 Monitoring et Analytics

### Firebase Performance Monitoring

```typescript
import { getPerformance, trace } from 'firebase/performance';

const perf = getPerformance(app);

// Mesurer les performances
const t = trace(perf, 'load_events');
t.start();
// ... code à mesurer
t.stop();
```

### Firebase Analytics

```typescript
import { logEvent } from 'firebase/analytics';

// Tracker les événements
logEvent(analytics, 'event_view', {
  event_id: eventId,
  event_title: eventTitle
});
```

### Crashlytics

```typescript
import { crashlytics } from 'firebase/crashlytics';

// Logger les erreurs
crashlytics().log('Error occurred');
crashlytics().recordError(error);
```

---

## 🔄 Migrations et Backups (réalité : PostgreSQL/Prisma)

### Backup

La base PostgreSQL est sauvegardée via l'offre de l'hébergeur (PITR/snapshots) et/ou `pg_dump` planifié — pas via `gcloud firestore export` (Firestore n'étant qu'un miroir optionnel, il n'a pas besoin d'une stratégie de backup dédiée).

### Migration de Données

Les migrations de schéma passent par Prisma Migrate :

```bash
cd back
npx prisma migrate dev --name add_event_slug
```

---

## 🧪 Tests

### Tests Unitaires (Services)

```typescript
import { describe, it, expect } from 'vitest';
import { EventService } from './services/FirebaseService';

describe('EventService', () => {
  it('should create an event', async () => {
    const result = await EventService.createEvent({
      title: 'Test Event',
      date: '2024-12-25',
      // ... autres champs
    });
    
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });
});
```

### Tests d'Intégration

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { BackOfficeDashboard } from './components/pages/BackOfficeDashboard';

describe('BackOfficeDashboard', () => {
  it('should load and display events', async () => {
    render(<BackOfficeDashboard currentUser={mockAdmin} onBack={jest.fn()} />);
    
    // Attendre le chargement
    await screen.findByText('Événements Totaux');
    
    // Vérifier l'affichage
    expect(screen.getByText('Vue d\'ensemble')).toBeInTheDocument();
  });
});
```

---

## 📚 Ressources Supplémentaires

### Documentation

- **Firebase Docs** : https://firebase.google.com/docs
- **Firestore Guide** : https://firebase.google.com/docs/firestore
- **React Fire** : https://github.com/FirebaseExtended/reactfire

### Outils Utiles

- **Firebase Console** : https://console.firebase.google.com
- **Firestore Emulator** : Pour le développement local
- **Firebase Extensions** : Extensions prêtes à l'emploi

### Support

- **Stack Overflow** : Tag `firebase`
- **GitHub Issues** : Repos officiels Firebase
- **Discord Community** : Firebase Discord

---

## 🎯 Checklist de Production

Avant de déployer en production :

- [ ] Configuration Firebase complète
- [ ] Règles de sécurité strictes activées
- [ ] Variables d'environnement configurées
- [ ] SSL/HTTPS activé
- [ ] Backup automatique configuré
- [ ] Monitoring activé
- [ ] Tests passants
- [ ] Documentation à jour
- [ ] Plan de rollback préparé
- [ ] Support client prêt

---

## 📄 Licence

© 2024 Feeti Platform. Tous droits réservés.

---

**Version** : 1.0.0  
**Architecture réelle** : Firebase Auth (authentification) + Express/Prisma/PostgreSQL (`back/`, données métier), Firestore en miroir optionnel  
**Dernière mise à jour** : Juillet 2026  
**Auteur** : Équipe Technique Feeti
