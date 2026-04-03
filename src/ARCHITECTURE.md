# 🏗️ Architecture Feeti - Vue d'Ensemble

## Stack Technologique

### Frontend
```
React 18.x + TypeScript + Vite
├── UI Framework: Tailwind CSS v4.0
├── Components: shadcn/ui
├── Icons: Lucide React
├── Charts: Recharts
├── Notifications: Sonner
└── State: React Hooks (useState, useMemo, useCallback)
```

### Backend (NoSQL)
```
Firebase (Backend-as-a-Service)
├── Database: Firestore (NoSQL)
├── Authentication: Firebase Auth
├── Storage: Firebase Storage
├── Analytics: Firebase Analytics
└── Hosting: Firebase Hosting (optionnel)
```

---

## Architecture des Données (NoSQL)

### Firestore Collections

#### 1. Collection `users`
```javascript
users/{userId}
{
  uid: "firebase-auth-uid",
  name: "John Doe",
  email: "john@example.com",
  phone: "+242 6 12 34 56 78",
  avatar: "https://...",
  role: "user" | "organizer" | "admin" | "super_admin",
  adminRole: "user" | "organizer" | "moderator" | "admin" | "super_admin",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Index recommandés** :
- `email` (ASC)
- `role` (ASC)
- `createdAt` (DESC)

#### 2. Collection `events`
```javascript
events/{eventId}
{
  title: "Concert Jazz Live",
  description: "Soirée jazz intimiste...",
  date: "2024-12-25",
  time: "20:00",
  location: "Brazzaville",
  image: "https://...",
  price: 15000,
  currency: "FCFA",
  category: "Concert",
  tags: ["Music", "Jazz", "Live"],
  attendees: 120,
  maxAttendees: 500,
  isLive: true,
  organizer: "MusicEvents Pro",
  organizerId: "user-123",
  status: "published" | "draft" | "cancelled" | "completed",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Index recommandés** :
- `date` (DESC)
- `category` (ASC)
- `isLive` (ASC)
- `status` (ASC)
- `organizerId` + `date` (Composite)

#### 3. Collection `tickets`
```javascript
tickets/{ticketId}
{
  eventId: "event-123",
  eventTitle: "Concert Jazz Live",
  eventDate: "2024-12-25",
  eventTime: "20:00",
  eventLocation: "Brazzaville",
  eventImage: "https://...",
  price: 15000,
  currency: "FCFA",
  holderName: "John Doe",
  holderEmail: "john@example.com",
  holderPhone: "+242 6 12 34 56 78",
  userId: "user-123",
  qrCode: "https://feeti.com/verify/ticket-456",
  status: "valid" | "used" | "expired" | "cancelled",
  purchaseDate: Timestamp,
  usedDate: Timestamp | null,
  quantity: 1,
  transactionId: "tx-789",
  createdAt: Timestamp
}
```

**Index recommandés** :
- `userId` + `purchaseDate` (Composite, DESC)
- `eventId` (ASC)
- `status` (ASC)
- `qrCode` (ASC)

#### 4. Collection `transactions`
```javascript
transactions/{transactionId}
{
  userId: "user-123",
  eventId: "event-123",
  amount: 15000,
  currency: "FCFA",
  status: "pending" | "completed" | "failed" | "refunded",
  paymentMethod: "stripe" | "paystack" | "mobile_money",
  tickets: 1,
  createdAt: Timestamp,
  completedAt: Timestamp | null
}
```

**Index recommandés** :
- `userId` + `createdAt` (Composite, DESC)
- `status` (ASC)
- `paymentMethod` (ASC)

---

## Architecture des Services

### Services Layer (`/services/FirebaseService.ts`)

```typescript
FirebaseService
├── AuthService
│   ├── register()
│   ├── login()
│   ├── logout()
│   ├── getUserProfile()
│   └── resetPassword()
│
├── EventService
│   ├── createEvent()
│   ├── getAllEvents()
│   ├── getEventById()
│   ├── updateEvent()
│   ├── deleteEvent()
│   ├── getEventsByOrganizer()
│   └── incrementAttendees()
│
├── TicketService
│   ├── createTickets()
│   ├── getUserTickets()
│   ├── getTicketById()
│   ├── verifyAndUseTicket()
│   └── cancelTicket()
│
├── TransactionService
│   ├── createTransaction()
│   ├── updateTransactionStatus()
│   ├── getUserTransactions()
│   └── getAllTransactions()
│
├── StorageService
│   ├── uploadImage()
│   └── deleteImage()
│
└── AnalyticsService
    ├── getEventStats()
    ├── getTransactionStats()
    └── getUserStats()
```

---

## Architecture des Pages

### Structure des Pages (`/components/pages/`)

```
Pages
├── Public Pages
│   ├── HomePage              # Page d'accueil avec sliders
│   ├── EventsListPage        # Liste tous événements
│   ├── LiveEventsPage        # Événements live uniquement
│   ├── EventDetailPage       # Détails d'un événement
│   ├── ReplayPage           # Replays d'événements passés
│   ├── BlogPage             # Articles de blog
│   ├── BlogDetailPage       # Détail d'un article
│   └── LegalPages           # CGU, Politique, etc.
│
├── User Pages (Auth Required)
│   ├── LoginPage            # Connexion
│   ├── UserDashboard        # Dashboard utilisateur
│   ├── TicketPurchasePage   # Achat de billets
│   └── StreamingPage        # Streaming live
│
├── Organizer Pages (Role: organizer)
│   ├── OrganizerDashboard   # Dashboard organisateur
│   ├── BlogAdminPage        # Gestion blog
│   └── TicketVerificationPage # Vérification billets
│
├── Admin Pages (Role: admin/super_admin)
│   ├── AdminDashboard       # Dashboard admin classique
│   └── BackOfficeDashboard  # Back office Firebase
│
└── Leisure Pages
    ├── LeisurePage          # Hub loisirs
    ├── HotelsPage           # Hôtels
    ├── RestaurantsPage      # Restaurants
    ├── SportsWellnessPage   # Sport & Bien-être
    ├── LoisirsPage          # Activités loisirs
    ├── BarNightPage         # Bars & Vie nocturne
    ├── EnvoleePage          # Voyages
    ├── BonPlansPage         # Bons plans
    └── EstablishmentDetailPage # Détail établissement
```

---

## Flux de Données

### 1. Création d'Événement

```mermaid
User (Admin)
    ↓
BackOfficeDashboard
    ↓ (Click "Nouvel Événement")
Dialog Form
    ↓ (Submit)
EventService.createEvent()
    ↓
Firestore Collection "events"
    ↓ (Success)
Toast Notification + Reload Data
```

### 2. Achat de Billet

```mermaid
User
    ↓
EventDetailPage
    ↓ (Click "Acheter")
TicketPurchasePage
    ↓ (Submit Payment)
TransactionService.createTransaction()
    ↓
Firestore "transactions" + "tickets"
    ↓
Email avec QR Code
    ↓
UserDashboard (Mes Billets)
```

### 3. Vérification Billet

```mermaid
Organizer
    ↓
TicketVerificationPage
    ↓ (Scan QR Code)
TicketService.verifyAndUseTicket()
    ↓
Firestore Update "tickets" (status: used)
    ↓
Toast: "Billet validé ✅"
```

---

## Sécurité

### Règles Firestore

```javascript
// users - Lecture pour tous authentifiés, écriture par propriétaire
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId || isAdmin();
}

// events - Lecture publique, écriture admin/organizer
match /events/{eventId} {
  allow read: if true;
  allow create: if request.auth != null;
  allow update, delete: if isAdmin() || isOrganizer(resource.data.organizerId);
}

// tickets - Lecture par propriétaire, création par tous authentifiés
match /tickets/{ticketId} {
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid || isAdmin());
  allow create: if request.auth != null;
  allow update: if isAdmin();
}

// transactions - Lecture par propriétaire, création par tous
match /transactions/{transactionId} {
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid || isAdmin());
  allow create: if request.auth != null;
  allow update: if isAdmin();
}
```

### Authentication Flow

```
1. User visits app
2. Click "Se connecter"
3. LoginPage appears
4. Enter email/password
5. AuthService.login()
6. Firebase Auth validates
7. Create/Fetch user profile from Firestore
8. Store in App state (currentUser)
9. Redirect based on role:
   - user → UserDashboard
   - organizer → OrganizerDashboard
   - admin → BackOfficeDashboard
```

---

## Performance

### Optimisations Implémentées

1. **Lazy Loading**
   ```typescript
   const BackOfficeDashboard = lazy(() => 
     import('./components/pages/index').then(module => ({ 
       default: module.BackOfficeDashboard 
     }))
   );
   ```

2. **Memoization**
   ```typescript
   const events = useMemo(() => mockEvents, []);
   const selectedEvent = useMemo(() => 
     events.find(e => e.id === selectedEventId), 
     [selectedEventId, events]
   );
   ```

3. **Optimized Callbacks**
   ```typescript
   const handleNavigate = useCallback((page: string, params?: any) => {
     // ...
   }, [currentPage, measureRender, cleanupResources]);
   ```

4. **Firestore Indexes**
   - Index composite pour requêtes complexes
   - Pagination avec `limit()`
   - Cache local activé

5. **Images**
   - Lazy loading natif
   - Optimisation Unsplash
   - Formats WebP supportés

---

## Scalabilité

### Limites Firebase (Plan Gratuit)

| Ressource | Limite Gratuite | Recommandation |
|-----------|-----------------|----------------|
| Firestore Stockage | 1 GB | ~100k événements |
| Firestore Lectures | 50k/jour | Utilisez le cache |
| Firestore Écritures | 20k/jour | Batch operations |
| Storage | 5 GB | Optimisez les images |
| Auth | Illimité | ✅ OK |

### Passage à l'Échelle

**Si vous atteignez les limites** :

1. **Plan Blaze (Pay-as-you-go)**
   - Coût : ~$0.06 / 100k lectures
   - Recommandé à partir de 10k utilisateurs/mois

2. **Optimisations**
   - Activer le cache Firestore (offline)
   - Pagination stricte (max 50 items/page)
   - Lazy loading des images
   - CDN pour assets statiques

3. **Migration Progressive**
   - Garder Firestore pour données temps réel
   - Migrer analytics vers BigQuery
   - Utiliser Cloud Functions pour traitements lourds

---

## Déploiement

### Environnements

```
Development
├── Local: npm run dev
├── Firebase: Mode Emulator
└── Database: Mode Test

Staging
├── Vercel/Netlify Preview
├── Firebase: Projet staging
└── Database: Règles strictes

Production
├── Firebase Hosting / Vercel
├── Firebase: Projet production
└── Database: Règles production + Backups
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  deploy:
    - Checkout code
    - Install dependencies
    - Run tests
    - Build production
    - Deploy to Firebase Hosting
    - Send notification
```

---

## Monitoring

### Firebase Analytics

```typescript
import { logEvent } from 'firebase/analytics';

// Track user actions
logEvent(analytics, 'event_view', {
  event_id: eventId,
  event_title: eventTitle
});

logEvent(analytics, 'ticket_purchase', {
  event_id: eventId,
  amount: price,
  currency: 'FCFA'
});
```

### Error Tracking

```typescript
import { crashlytics } from 'firebase/crashlytics';

try {
  // Code
} catch (error) {
  crashlytics().log('Error in createEvent');
  crashlytics().recordError(error);
  toast.error('Erreur lors de la création');
}
```

---

## Tests

### Structure de Tests (Recommandé)

```
tests/
├── unit/
│   ├── services/
│   │   ├── AuthService.test.ts
│   │   ├── EventService.test.ts
│   │   └── TicketService.test.ts
│   └── components/
│       └── EventCard.test.tsx
│
├── integration/
│   ├── event-creation.test.ts
│   ├── ticket-purchase.test.ts
│   └── user-authentication.test.ts
│
└── e2e/
    ├── back-office-flow.spec.ts
    └── user-journey.spec.ts
```

---

## Roadmap

### Phase 1 : MVP (Actuel) ✅
- [x] Backend Firebase configuré
- [x] Back office fonctionnel
- [x] CRUD événements
- [x] Système de billets
- [x] Analytics basiques

### Phase 2 : Intégrations
- [ ] Paiements Stripe/Paystack
- [ ] Emails transactionnels (SendGrid)
- [ ] SMS confirmations (Twilio)
- [ ] Webhooks système

### Phase 3 : Fonctionnalités Avancées
- [ ] Recommandations ML
- [ ] Chatbot support
- [ ] Application mobile (React Native)
- [ ] API publique REST

### Phase 4 : Scale
- [ ] Multi-tenant
- [ ] Internationalisation (i18n)
- [ ] CDN global
- [ ] Infrastructure multi-région

---

## Contacts & Support

**Documentation** :
- Guide Backend : `README_BACKEND.md`
- Configuration : `FIREBASE_SETUP.md`
- Utilisation : `BACKOFFICE_GUIDE.md`
- Démarrage : `README_QUICKSTART.md`

**Support** :
- Email : support@feeti.com
- Documentation Firebase : https://firebase.google.com/docs
- Stack Overflow : Tag `firebase` + `feeti`

---

**Version** : 1.0.0  
**Architecture** : React + Firebase (NoSQL)  
**Status** : ✅ Production Ready  
**Dernière mise à jour** : Décembre 2024
