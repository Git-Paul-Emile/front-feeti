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

### Backend (réel)
```
back/ (Express + TypeScript, déployé sur Render)
├── Base de données : PostgreSQL via Prisma (source de vérité)
├── Authentication : Firebase Auth (email/password + Google OAuth + reset password)
├── Firestore : synchronisation optionnelle secondaire (FIRESTORE_SYNC_ENABLED),
│   désactivable — jamais la source de vérité
├── Storage : Firebase Storage (médias) ou équivalent
└── Analytics : Firebase Analytics
```

Le dossier `functions/` (Cloud Functions Firebase) a été retiré du projet — il n'était pas utilisé en production. Le backend réel est `back/`.

---

## Architecture des Données (réelle : PostgreSQL/Prisma)

La base de données applicative est PostgreSQL, gérée par Prisma (`back/prisma/schema.prisma`). Le schéma est riche et comprend notamment : `User`, `Event`, `Ticket`, `Transaction`, `Wallet`, `WalletLedger`, `Payout`, `LoyaltyProfile`, `Category`, `Deal`, `BlogPost`, `Creator`, `AuditLog`, etc. Les sections ci-dessous décrivent un ancien modèle "collections Firestore" conservé à titre d'illustration conceptuelle (forme des données), mais **Firestore n'est plus la source de vérité** : il ne sert qu'à une synchronisation optionnelle en lecture (miroir), activable/désactivable via `FIRESTORE_SYNC_ENABLED` (voir `back/src/services/firestore-sync.service.ts`).

### Firestore Collections (miroir optionnel — schéma logique équivalent, pas la source de vérité)

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

### Authentification (`front/src/services/firebase-auth.ts`)

Firebase Auth gère exclusivement l'authentification : inscription/connexion email + mot de passe, connexion Google, et mot de passe oublié via `sendPasswordResetEmail` (fonction `resetPassword()`). Il n'y a pas de flux de reset password fait-maison côté backend (JWT + email) — ce système mort a été supprimé.

### Backend applicatif (`back/src/`)

```
back/src/
├── controllers/    # Points d'entrée HTTP
├── services/       # Logique métier
├── repositories/    # Accès Prisma/PostgreSQL
├── routes/          # Définition des routes Express
└── middlewares/     # Auth (vérification Firebase ID token), rôles, etc.
```

Toutes les opérations CRUD (événements, billets, transactions, wallets, deals, blog, loyalty, etc.) passent par ces couches Express/Prisma — il n'y a pas d'accès direct du front à Firestore pour ces données métier.

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
API back/ (Express) → Prisma → PostgreSQL (+ Firestore en miroir optionnel)
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
API back/ (Express) → Prisma → tables "Transaction" + "Ticket" (PostgreSQL)
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
API back/ (Express) → Prisma update "Ticket" (status: used) en PostgreSQL
    ↓
Toast: "Billet validé ✅"
```

---

## Sécurité

### Contrôle d'accès (réalité : middlewares Express, pas de règles Firestore côté data métier)

Les données métier vivant dans PostgreSQL, le contrôle d'accès est réalisé par les middlewares Express (`back/src/middlewares/`) qui vérifient le token Firebase (authentification) puis le rôle de l'utilisateur avant d'exécuter les requêtes Prisma. Il n'y a pas de "Security Rules" Firestore protégeant ces données puisque Firestore n'en est qu'un miroir optionnel en lecture (`FIRESTORE_SYNC_ENABLED`).

### Authentication Flow

```
1. User visits app
2. Click "Se connecter"
3. LoginPage appears
4. Enter email/password
5. AuthService.login() → Firebase Auth (authentification uniquement)
6. Firebase Auth validates, renvoie un ID token
7. Le backend (Express) vérifie l'ID token et crée/récupère le profil utilisateur dans PostgreSQL (Prisma)
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

4. **Index PostgreSQL (Prisma)**
   - Index composites pour requêtes complexes (`back/prisma/schema.prisma`)
   - Pagination via `take`/`skip` Prisma
   - Cache applicatif côté API

5. **Images**
   - Lazy loading natif
   - Optimisation Unsplash
   - Formats WebP supportés

---

## Scalabilité

La donnée métier étant sur PostgreSQL (et non Firestore), les limites de quota Firestore ne s'appliquent pas au volume principal de données. Firestore n'est concerné que par le miroir optionnel (`FIRESTORE_SYNC_ENABLED`) et reste dimensionné en conséquence (volume réduit, lecture/écriture liées à la synchronisation uniquement). Firebase Auth reste illimité en usage (authentification uniquement).

### Passage à l'Échelle

1. **Base de données**
   - Scaling PostgreSQL (connexions, index, réplication en lecture)
   - Pagination stricte (max 50 items/page)

2. **Optimisations**
   - Lazy loading des images
   - CDN pour assets statiques
   - Cache applicatif côté API

3. **Firestore (miroir optionnel)**
   - Peut être désactivé (`FIRESTORE_SYNC_ENABLED=false`) sans impact sur la source de vérité
   - Sert uniquement de secours/replica, pas de scaling primaire

---

## Déploiement

### Environnements

Backend réel : `back/` (Express + Prisma/PostgreSQL) déployé sur Render. Le dossier `functions/` (Cloud Functions Firebase) a été retiré du projet, non utilisé en production.

```
Development
├── Local: npm run dev
├── Firebase: Auth (émulateur ou projet dev)
└── Database: PostgreSQL local

Staging
├── Vercel/Netlify Preview (frontend) + Render (backend)
├── Firebase: Auth projet staging
└── Database: PostgreSQL staging

Production
├── Vercel (frontend) + Render (backend `back/`)
├── Firebase: Auth projet production
└── Database: PostgreSQL production + Backups
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
    - Deploy frontend to Vercel (front/vercel.json) + backend to Render (back/render.yaml)
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
- [x] Backend Express + Prisma/PostgreSQL configuré (`back/`)
- [x] Firebase Auth pour l'authentification
- [x] Back office fonctionnel
- [x] CRUD événements
- [x] Système de billets, wallets, transactions
- [x] Analytics basiques

### Phase 2 : Intégrations
- [ ] Paiements Stripe/Paystack réels (actuellement en simulation intentionnelle, harmonisée avec FeetiPlayWeb)
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
**Architecture** : React (front) + Express/Prisma/PostgreSQL (back), Firebase Auth pour l'authentification, Firestore en miroir optionnel  
**Status** : ✅ Production Ready  
**Dernière mise à jour** : Juillet 2026
