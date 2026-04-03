# 🔌 Guide d'Intégration API - Feeti Platform

Guide complet pour connecter le frontend au backend et utiliser toutes les API disponibles.

---

## 📚 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Configuration](#configuration)
3. [Services API Disponibles](#services-api-disponibles)
4. [Utilisation dans le Dashboard](#utilisation-dans-le-dashboard)
5. [Hooks React](#hooks-react)
6. [Composants de Paiement](#composants-de-paiement)
7. [Exemples Pratiques](#exemples-pratiques)

---

## 🎯 Vue d'Ensemble

### Architecture Complète

```
Frontend (React)
├── Hooks (/hooks/)
│   ├── useEvents.ts         # Hooks pour événements
│   ├── usePayment.ts        # Hooks pour paiements
│   └── useAPI.ts            # Hooks génériques
│
├── Services API (/services/api/)
│   ├── BaseAPI.ts           # Service de base
│   ├── EventsAPI.ts         # API Événements
│   ├── PaymentAPI.ts        # API Paiements
│   └── NotificationsAPI.ts  # API Notifications
│
├── Components (/components/payment/)
│   ├── StripePaymentForm.tsx
│   ├── PaystackPaymentForm.tsx
│   ├── MobileMoneyPaymentForm.tsx
│   └── PaymentSelector.tsx
│
└── Pages (/components/pages/)
    └── BackOfficeDashboard.tsx  # Dashboard connecté aux API

Backend (Node.js/Express)
├── server.js                # Serveur principal
└── routes/
    ├── payments.js          # Routes paiements
    ├── notifications.js     # Routes notifications
    ├── webhooks.js          # Webhooks
    ├── tickets.js           # Routes billets
    └── events.js            # Routes événements
```

---

## ⚙️ Configuration

### 1. Variables d'Environnement Frontend

Créez `/frontend/.env.local` :

```bash
# Backend API
VITE_BACKEND_URL=http://localhost:3001

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...

# Firebase (déjà configuré)
VITE_FIREBASE_API_KEY=...
```

### 2. Variables d'Environnement Backend

Créez `/backend/.env.local` (voir `.env.local.example`) :

```bash
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

STRIPE_SECRET_KEY=sk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
SMTP_USER=...
TWILIO_ACCOUNT_SID=...
FIREBASE_PROJECT_ID=...
```

### 3. Démarrage

```bash
# Terminal 1 : Backend
cd backend
npm install
npm run dev

# Terminal 2 : Frontend
cd ..
npm run dev
```

---

## 🔧 Services API Disponibles

### EventsAPI

```typescript
import EventsAPI from '@/services/api/EventsAPI';

// Récupérer tous les événements
const response = await EventsAPI.getAllEvents();
if (response.success) {
  console.log(response.data); // Event[]
}

// Créer un événement
const createResponse = await EventsAPI.createEvent({
  title: 'Concert Jazz',
  date: '2024-12-25',
  time: '20:00',
  location: 'Brazzaville',
  price: 50000,
  // ... autres champs
});

// Mettre à jour
await EventsAPI.updateEvent(eventId, { price: 45000 });

// Supprimer
await EventsAPI.deleteEvent(eventId);

// Rechercher
const searchResults = await EventsAPI.searchEvents('jazz');

// Statistiques
const stats = await EventsAPI.getEventStats();
```

### PaymentAPI

```typescript
import PaymentAPI from '@/services/api/PaymentAPI';

// Créer une intention de paiement
const intent = await PaymentAPI.createPaymentIntent(
  50000,           // montant
  'paystack',      // provider
  { eventId: '123', userId: '456' }  // metadata
);

// Confirmer un paiement
const confirmation = await PaymentAPI.confirmPayment(
  intent.data.id,
  'paystack'
);

// Vérifier le statut
const status = await PaymentAPI.checkPaymentStatus(
  reference,
  'paystack'
);

// Rembourser
const refund = await PaymentAPI.refundPayment(
  transactionId,
  amount,
  'Remboursement demandé par le client'
);
```

### NotificationsAPI

```typescript
import NotificationsAPI from '@/services/api/NotificationsAPI';

// Envoyer un email
await NotificationsAPI.sendEmail({
  to: 'user@example.com',
  subject: 'Votre billet Feeti',
  html: '<h1>Merci pour votre achat!</h1>'
});

// Confirmation de billet (email + SMS + push)
await NotificationsAPI.sendTicketPurchaseNotifications({
  email: 'user@example.com',
  phone: '+242612345678',
  customerName: 'John Doe',
  eventTitle: 'Concert Jazz',
  eventDate: '2024-12-25',
  ticketCount: 2,
  qrCode: 'https://...',
  ticketUrl: 'https://feeti.com/tickets/123',
  pushToken: 'fcm_token...'
});

// SMS uniquement
await NotificationsAPI.sendSMS({
  to: '+242612345678',
  message: 'Votre billet est prêt!'
});

// Notification push
await NotificationsAPI.sendPushNotification({
  token: 'fcm_token...',
  title: 'Nouveau billet',
  body: 'Votre billet pour Concert Jazz est disponible'
});
```

---

## 📊 Utilisation dans le Dashboard

### BackOfficeDashboard (Intégration Complète)

Le dashboard utilise maintenant les nouveaux services API :

```typescript
// /components/pages/BackOfficeDashboard.tsx

import EventsAPI from '../../services/api/EventsAPI';
import PaymentAPI from '../../services/api/PaymentAPI';
import NotificationsAPI from '../../services/api/NotificationsAPI';

export function BackOfficeDashboard({ currentUser, onBack }) {
  // Charger les données avec EventsAPI
  const loadDashboardData = async () => {
    // Utilise le cache automatique
    const eventsResponse = await EventsAPI.getAllEvents();
    if (eventsResponse.success) {
      setEvents(eventsResponse.data);
    }

    // Statistiques optimisées
    const statsResponse = await EventsAPI.getEventStats();
    if (statsResponse.success) {
      setStats(statsResponse.data);
    }
  };

  // Créer un événement
  const handleSaveEvent = async () => {
    const response = await EventsAPI.createEvent(eventForm);
    if (response.success) {
      toast.success('Événement créé!');
      // Le cache est automatiquement invalidé
      EventsAPI.invalidateCache('events:');
      loadDashboardData();
    }
  };

  // Supprimer
  const handleDeleteEvent = async (eventId) => {
    const response = await EventsAPI.deleteEvent(eventId);
    if (response.success) {
      EventsAPI.invalidateCache('events:');
      loadDashboardData();
    }
  };
}
```

---

## 🎣 Hooks React

### useEvents (Gestion des Événements)

```typescript
import { useEvents, useCreateEvent, useDeleteEvent } from '@/hooks/useEvents';

function EventsManagement() {
  // Charger tous les événements (avec cache)
  const { data: events, loading, error, refetch } = useEvents();

  // Créer un événement
  const createEvent = useCreateEvent();

  const handleCreate = async () => {
    const result = await createEvent.mutate({
      title: 'Nouveau Concert',
      date: '2024-12-25',
      // ...
    });

    if (result.success) {
      refetch(); // Recharger la liste
    }
  };

  // Supprimer
  const deleteEvent = useDeleteEvent();

  return (
    <div>
      {loading && <p>Chargement...</p>}
      {error && <p>Erreur: {error}</p>}
      {events?.map(event => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <button onClick={() => deleteEvent.mutate(event.id)}>
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}
```

### usePayment (Gestion des Paiements)

```typescript
import { usePaymentFlow } from '@/hooks/usePayment';

function CheckoutPage() {
  const payment = usePaymentFlow();

  const handlePayment = async () => {
    // 1. Créer l'intention
    const intent = await payment.initiatePayment(
      50000,
      'paystack',
      { eventId: '123' }
    );

    if (intent.success) {
      // 2. Afficher le formulaire de paiement
      // ... L'utilisateur paie ...

      // 3. Confirmer
      const confirmation = await payment.finalize();
      if (confirmation.success) {
        console.log('Transaction ID:', confirmation.transactionId);
      }
    }
  };

  return (
    <div>
      <p>Étape: {payment.currentStep}</p>
      {payment.loading && <p>Traitement...</p>}
      {payment.error && <p>Erreur: {payment.error}</p>}
      <button onClick={handlePayment}>Payer</button>
    </div>
  );
}
```

---

## 💳 Composants de Paiement

### PaymentSelector (Composant Unifié)

```typescript
import { PaymentSelector } from '@/components/payment/PaymentSelector';

function TicketPurchasePage() {
  return (
    <PaymentSelector
      amount={50000}
      currency="FCFA"
      email="user@example.com"
      defaultMethod="paystack"
      enabledMethods={['stripe', 'paystack', 'mobile_money']}
      onSuccess={(transactionId, method) => {
        console.log('Paiement réussi:', transactionId, method);
        // Créer les billets, envoyer notifications, etc.
      }}
      onError={(error) => {
        console.error('Erreur:', error);
      }}
      metadata={{
        eventId: '123',
        userId: '456',
        tickets: 2
      }}
    />
  );
}
```

### Composants Individuels

```typescript
// Stripe
import { StripePaymentForm } from '@/components/payment/StripePaymentForm';

<StripePaymentForm
  amount={50000}
  currency="FCFA"
  onSuccess={(transactionId) => {}}
  onError={(error) => {}}
/>

// Paystack
import { PaystackPaymentForm } from '@/components/payment/PaystackPaymentForm';

<PaystackPaymentForm
  amount={50000}
  currency="FCFA"
  email="user@example.com"
  onSuccess={(reference) => {}}
  onError={(error) => {}}
/>

// Mobile Money
import { MobileMoneyPaymentForm } from '@/components/payment/MobileMoneyPaymentForm';

<MobileMoneyPaymentForm
  amount={50000}
  currency="FCFA"
  onSuccess={(transactionId) => {}}
  onError={(error) => {}}
/>
```

---

## 🔥 Exemples Pratiques

### Exemple 1 : Flux Complet d'Achat

```typescript
import EventsAPI from '@/services/api/EventsAPI';
import PaymentAPI from '@/services/api/PaymentAPI';
import NotificationsAPI from '@/services/api/NotificationsAPI';

async function purchaseTickets(
  eventId: string,
  userId: string,
  quantity: number,
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  }
) {
  try {
    // 1. Vérifier disponibilité
    const availability = await EventsAPI.checkAvailability(eventId);
    if (!availability.data?.available) {
      throw new Error('Plus de places disponibles');
    }

    // 2. Récupérer l'événement
    const eventResponse = await EventsAPI.getEventById(eventId);
    const event = eventResponse.data;
    if (!event) throw new Error('Événement introuvable');

    // 3. Calculer le prix total
    const amount = event.price * quantity;

    // 4. Créer l'intention de paiement
    const intent = await PaymentAPI.createPaymentIntent(
      amount,
      'paystack',
      { eventId, userId, tickets: quantity }
    );

    // 5. L'utilisateur paie (via le composant PaymentSelector)
    // ...

    // 6. Confirmer le paiement
    const confirmation = await PaymentAPI.confirmPayment(
      intent.data!.id,
      'paystack'
    );

    if (confirmation.success) {
      // 7. Créer les billets
      const ticketsResponse = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          userId,
          quantity,
          holderName: customerInfo.name,
          holderEmail: customerInfo.email,
          holderPhone: customerInfo.phone,
          transactionId: confirmation.data!.transactionId,
          price: event.price,
          currency: event.currency
        })
      });

      const ticketsData = await ticketsResponse.json();

      // 8. Envoyer les notifications
      await NotificationsAPI.sendTicketPurchaseNotifications({
        email: customerInfo.email,
        phone: customerInfo.phone,
        customerName: customerInfo.name,
        eventTitle: event.title,
        eventDate: event.date,
        ticketCount: quantity,
        qrCode: ticketsData.tickets[0].qrCode,
        ticketUrl: `https://feeti.com/tickets/${userId}`
      });

      return {
        success: true,
        tickets: ticketsData.tickets,
        transactionId: confirmation.data!.transactionId
      };
    }
  } catch (error: any) {
    console.error('Erreur achat:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Exemple 2 : Dashboard en Temps Réel

```typescript
import { useEvents, useEventStats } from '@/hooks/useEvents';
import { usePolling } from '@/hooks/useAPI';

function RealTimeDashboard() {
  // Charger les événements une fois
  const { data: events } = useEvents();

  // Polling des statistiques toutes les 30 secondes
  const { data: stats } = usePolling(
    () => EventsAPI.getEventStats(),
    30000,  // 30 secondes
    { enabled: true }
  );

  return (
    <div>
      <h2>Statistiques en Temps Réel</h2>
      <p>Événements totaux: {stats?.totalEvents}</p>
      <p>Événements live: {stats?.liveEvents}</p>
      <p>Participants: {stats?.totalAttendees}</p>
    </div>
  );
}
```

### Exemple 3 : Gestion du Cache

```typescript
import EventsAPI from '@/services/api/EventsAPI';

// Invalider tout le cache des événements
EventsAPI.invalidateCache('events:');

// Invalider un événement spécifique
EventsAPI.invalidateCache('events:123');

// Vider complètement le cache
EventsAPI.clearCache();

// Obtenir la taille du cache
const cacheSize = EventsAPI.getCacheSize();
console.log('Éléments en cache:', cacheSize);
```

---

## 🔐 Sécurité

### En Production

1. **HTTPS Obligatoire** : Toutes les requêtes doivent passer par HTTPS
2. **CORS** : Restreindre les origins autorisées
3. **API Keys** : Ne jamais exposer les clés secrètes dans le frontend
4. **Validation** : Valider toutes les données côté backend
5. **Rate Limiting** : Déjà configuré (100 req/15min)

### Exemple de Configuration CORS

```javascript
// backend/server.js
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://feeti.com'
    : 'http://localhost:5173',
  credentials: true
}));
```

---

## 🐛 Débogage

### Activer les Logs Détaillés

```typescript
// Dans le navigateur (console)
localStorage.setItem('DEBUG', 'true');
```

### Surveiller les Requêtes API

```typescript
// BaseAPI inclut des logs automatiques
// Tous les appels API sont loggés dans la console
```

### Tester les Webhooks Localement

```bash
# Utiliser ngrok
ngrok http 3001

# Puis configurer l'URL dans Stripe/Paystack
https://xxxxx.ngrok.io/api/webhooks/stripe
```

---

## 📖 Documentation Complémentaire

- **Backend Setup** : `/BACKEND_SETUP.md`
- **Firebase Config** : `/FIREBASE_SETUP.md`
- **Back Office Guide** : `/BACKOFFICE_GUIDE.md`
- **Architecture** : `/ARCHITECTURE.md`

---

## ✅ Checklist d'Intégration

- [ ] Backend démarré (`npm run dev` dans `/backend`)
- [ ] Frontend démarré (`npm run dev` à la racine)
- [ ] Variables d'environnement configurées (`.env.local`)
- [ ] Firebase configuré
- [ ] Stripe/Paystack configurés
- [ ] Premier événement créé via le dashboard
- [ ] Premier paiement testé
- [ ] Notifications testées (email/SMS)
- [ ] Webhooks configurés

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Status** : ✅ Production Ready

🎉 **Votre système est maintenant complètement intégré !**
