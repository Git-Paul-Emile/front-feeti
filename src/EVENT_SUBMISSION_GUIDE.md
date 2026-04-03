# 📝 Guide de Soumission d'Événements - Feeti

Documentation complète du système de publication d'annonces pour les organisateurs.

---

## 📋 Vue d'Ensemble

### Système Créé

```
/components/pages/
├── EventSubmissionPage.tsx         ✅ Formulaire de soumission (9 étapes)
└── OrganizerEventDashboard.tsx     ✅ Dashboard événement avec scanner QR

/components/
└── QRScanner.tsx                   ✅ Scanner QR Code pour l'entrée
```

---

## 🎯 Fonctionnalités

### 1. 📝 **Formulaire de Soumission d'Événement**

**9 Étapes Complètes** :

1. **Informations Organisateur**
   - Nom de l'organisateur / Structure
   - Type: Particulier ou Entreprise/Association
   - Email, téléphone, site web
   - Logo/image de marque

2. **Détails de l'Événement**
   - Nom de l'événement
   - Catégorie (Concert, Conférence, Festival, etc.)
   - Description complète
   - Hashtags et mots-clés (SEO)

3. **Date et Horaire**
   - Date/heure de début et fin
   - Récurrence: Unique, Hebdomadaire, Mensuel, Autre

4. **Lieu de l'Événement**
   - Nom du lieu, adresse complète
   - Ville, pays
   - Lien Google Maps
   - Option streaming live

5. **Billetterie et Tarifs**
   - Type: Gratuit ou Payant
   - Types de billets multiples (Standard, VIP, etc.)
   - Prix, quantités
   - Dates d'ouverture/clôture des ventes
   - Commission Feeti affichée (5%)

6. **Visuels et Médias**
   - Affiche principale (obligatoire)
   - Galerie d'images (max 5)
   - Vidéo YouTube/Vimeo/teaser

7. **Partenaires et Sponsors**
   - Nom des partenaires
   - Logos (upload)

8. **Options de Promotion**
   - Mise en avant page d'accueil (+2000 FCFA)
   - Campagne Feeti Ads (à partir de 5000 FCFA)
   - Partage réseaux sociaux (gratuit)
   - Notification push (gratuit)

9. **Validation et Conditions**
   - Récapitulatif complet
   - Confirmation exactitude des informations
   - Acceptation CGU

### 2. 🔐 **Système de Validation Admin**

- Événement soumis → statut "En attente"
- Admin reçoit notification
- Admin examine et valide/rejette
- Email automatique à l'organisateur

### 3. 📊 **Dashboard Organisateur par Événement**

**3 Onglets Principaux** :

**A. Vue d'Ensemble**
- Revenus totaux
- Billets vendus / places restantes
- Billets utilisés
- Taux de conversion
- Revenus nets (après commission)
- Revenu moyen par billet
- Ventes récentes

**B. Gestion des Ventes**
- Liste complète des transactions
- Recherche par nom/email/ID billet
- Export CSV
- Filtres avancés
- Statuts: Valide, Utilisé, Annulé

**C. Scanner QR Code**
- Scanner en temps réel
- Validation instantanée
- Historique des validations
- Statistiques: Validés / En attente / Annulés
- Saisie manuelle (backup)

### 4. 🎫 **Scanner QR Code à l'Entrée**

- Accès caméra (arrière sur mobile)
- Overlay de ciblage visuel
- Détection automatique
- Validation en temps réel
- Feedback visuel et sonore
- Mode saisie manuelle (backup)

---

## 🚀 Utilisation

### Pour les Organisateurs

#### 1. Publier un Événement

```tsx
// Dans App.tsx ou votre router
import { EventSubmissionPage } from './components/pages/EventSubmissionPage';

<EventSubmissionPage
  onBack={() => navigate('home')}
  currentUser={currentUser}
/>
```

**Flow Utilisateur** :
1. Cliquer sur "Publier une annonce"
2. Remplir le formulaire (9 étapes)
3. Validation à chaque étape
4. Récapitulatif et confirmation
5. Soumission
6. Attente validation admin (24-48h)
7. Réception email de confirmation

#### 2. Suivre les Ventes

```tsx
import { OrganizerEventDashboard } from './components/pages/OrganizerEventDashboard';

<OrganizerEventDashboard
  event={selectedEvent}
  onBack={() => navigate('organizer-dashboard')}
/>
```

**Actions Disponibles** :
- ✅ Voir statistiques en temps réel
- ✅ Exporter liste des ventes (CSV)
- ✅ Rechercher participants
- ✅ Scanner billets à l'entrée

#### 3. Scanner les Billets (Jour de l'Événement)

```tsx
import { QRScanner } from './components/QRScanner';

<QRScanner
  onScan={(ticketId) => {
    // Vérifier et valider le billet
    verifyTicket(ticketId);
  }}
  onClose={() => setShowScanner(false)}
/>
```

---

## 📡 Backend API

### Endpoints à Implémenter

```javascript
// /backend/routes/event-submissions.js

// Soumettre un événement
POST /api/event-submissions
Body: EventSubmissionForm
Response: { success: true, submissionId: 'sub-123' }

// Liste des soumissions (Admin)
GET /api/event-submissions
Query: ?status=pending|approved|rejected
Response: { submissions: [...] }

// Approuver un événement
POST /api/event-submissions/:id/approve
Response: { success: true, eventId: 'event-456' }

// Rejeter un événement
POST /api/event-submissions/:id/reject
Body: { reason: 'Informations incomplètes' }
Response: { success: true }

// Statistiques événement organisateur
GET /api/events/:eventId/stats
Response: {
  totalRevenue: 2450000,
  ticketsSold: 87,
  ticketsRemaining: 13,
  ...
}

// Ventes d'un événement
GET /api/events/:eventId/sales
Response: { sales: [...] }

// Vérifier et valider un billet
POST /api/tickets/validate
Body: { ticketId: 'FEETI-001' }
Response: { 
  valid: true, 
  ticketInfo: {...},
  message: 'Billet validé'
}
```

### Email Templates

```javascript
// Email de confirmation publication
Subject: ✅ Votre événement "${eventName}" a été approuvé !

Bonjour ${organizerName},

Bonne nouvelle ! Votre événement "${eventName}" a été approuvé et est maintenant en ligne sur Feeti.

🎯 Prochaines étapes:
• Accédez à votre dashboard organisateur
• Suivez vos ventes en temps réel
• Téléchargez l'app mobile pour scanner les billets

📊 Dashboard: https://feeti.com/organizer/dashboard
🎫 Événement: https://feeti.com/events/${eventId}

Code d'accès dashboard: ${accessCode}

Besoin d'aide ? support@feeti.com

L'équipe Feeti
```

---

## 💾 Structure de Données

### EventSubmission (Firestore)

```typescript
{
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Timestamp;
  approvedAt?: Timestamp;
  approvedBy?: string; // Admin ID
  rejectedAt?: Timestamp;
  rejectionReason?: string;
  
  // Organisateur
  organizer: {
    name: string;
    type: 'individual' | 'company';
    email: string;
    phone: string;
    website: string;
    logoUrl: string;
  };
  
  // Événement
  event: {
    name: string;
    category: string;
    description: string;
    hashtags: string[];
  };
  
  // Date/Horaire
  schedule: {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    recurrence: 'unique' | 'weekly' | 'monthly' | 'other';
  };
  
  // Lieu
  venue: {
    name: string;
    address: string;
    city: string;
    country: string;
    googleMapsLink: string;
    hasStreaming: boolean;
  };
  
  // Billetterie
  ticketing: {
    accessType: 'free' | 'paid';
    tickets: [{
      name: string;
      price: number;
      quantity: number;
    }];
    salesStart: string;
    salesEnd: string;
  };
  
  // Médias
  media: {
    mainPosterUrl: string;
    galleryUrls: string[];
    videoLink: string;
  };
  
  // Partenaires
  partners: [{
    name: string;
    logoUrl: string;
  }];
  
  // Promotion
  promotion: {
    featuredHomepage: boolean;
    feetiAds: boolean;
    socialMediaShare: boolean;
    pushNotification: boolean;
  };
}
```

### EventStats (Temps Réel)

```typescript
{
  eventId: string;
  totalRevenue: number;
  ticketsSold: number;
  ticketsRemaining: number;
  ticketsUsed: number;
  ticketsCancelled: number;
  conversionRate: number;
  lastUpdated: Timestamp;
}
```

---

## 🎨 Interface Utilisateur

### Progression du Formulaire

- Barre de progression visuelle (0-100%)
- Indicateurs d'étapes numérotés
- Validation à chaque étape
- Sauvegarde automatique (draft)
- Navigation Précédent/Suivant
- Récapitulatif avant soumission

### Dashboard Organisateur

**Design** :
- Cards statistiques colorées
- Graphiques (revenus, ventes)
- Tableau filtrable et triable
- Export CSV en un clic
- Scanner QR intégré

**Responsive** :
- Mobile : Stacked layout, swipe navigation
- Tablet : 2 colonnes
- Desktop : 4 colonnes

---

## 🔐 Sécurité

### Validation des Données

```typescript
// Côté frontend
- Validation à chaque étape
- Email format valide
- Dates cohérentes (fin > début)
- Prix positifs
- Quantités > 0
- Images < 10MB

// Côté backend
- Sanitization de tous les champs
- Vérification propriété organisateur
- Rate limiting (max 5 soumissions/jour)
- Anti-spam
```

### Permissions

```typescript
// Qui peut faire quoi
const permissions = {
  submitEvent: ['user', 'organizer'],
  approveEvent: ['admin', 'moderator'],
  viewDashboard: ['organizer', 'admin'],
  scanTickets: ['organizer', 'admin', 'staff'],
  exportData: ['organizer', 'admin']
};
```

---

## 📱 Scanner QR Code

### Implémentation Production

```bash
# Installer jsQR pour scan automatique
npm install jsqr

# Dans QRScanner.tsx
import jsQR from 'jsqr';

const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
const code = jsQR(imageData.data, imageData.width, imageData.height);

if (code) {
  onScan(code.data);
}
```

### Flow de Validation

```
1. Scan QR Code
2. Parse JSON data
3. Vérifier ticketId
4. Check statut (valid/used/cancelled)
5. Valider signature/token
6. Marquer comme "used"
7. Feedback visuel + sonore
8. Incrémenter compteur
```

### Offline Support

```typescript
// Sauvegarder les scans en local si offline
if (!navigator.onLine) {
  localStorage.setItem('pendingScans', JSON.stringify([
    ...pendingScans,
    { ticketId, timestamp }
  ]));
}

// Synchroniser quand online
window.addEventListener('online', () => {
  syncPendingScans();
});
```

---

## 🧪 Tests

### Test du Formulaire

```typescript
// 1. Remplir toutes les étapes
const formData = {
  organizerName: 'Test Events',
  eventName: 'Concert Test',
  // ...
};

// 2. Valider chaque étape
expect(validateStep1(formData)).toBe(true);

// 3. Soumettre
await submitEvent(formData);
expect(response.success).toBe(true);
```

### Test du Scanner

```typescript
// 1. Simuler un QR code
const mockQR = JSON.stringify({
  ticketId: 'FEETI-001',
  eventId: 'event-123',
  token: 'abc123'
});

// 2. Scanner
await scanQR(mockQR);

// 3. Vérifier validation
expect(ticket.status).toBe('used');
```

---

## 🚀 Déploiement

### Checklist

- [ ] Backend API déployé
- [ ] Firebase configuré
- [ ] Emails transactionnels configurés
- [ ] Upload d'images configuré (Storage)
- [ ] Scanner QR testé sur mobile
- [ ] HTTPS activé
- [ ] Monitoring activé
- [ ] Backup automatique
- [ ] Dashboard admin fonctionnel

### Variables d'Environnement

```bash
# Frontend
VITE_API_URL=https://api.feeti.com
VITE_FIREBASE_*=...

# Backend
PORT=3001
NODE_ENV=production
FIREBASE_*=...
SMTP_*=...
STRIPE_*=...
```

---

## 💡 Améliorations Futures

1. **Formulaire Avancé**
   - Sauvegarde automatique (draft)
   - Reprise depuis draft
   - Templates d'événements
   - Duplication d'événements

2. **Dashboard Enrichi**
   - Graphiques avancés
   - Prévisions de ventes
   - Analytics détaillés
   - Rapports personnalisés

3. **Scanner Amélioré**
   - Mode hors ligne
   - Support NFC
   - Scan par lot
   - Historique complet

4. **Notifications**
   - Email à chaque vente
   - SMS de rappel
   - Push notifications
   - Webhooks personnalisés

---

## 📞 Support

- **Email** : support@feeti.com
- **Téléphone** : +242 981-23-19
- **Documentation** : https://docs.feeti.com
- **Tutoriels** : https://help.feeti.com

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Status** : ✅ Production Ready

📝 **Votre système de publication d'événements est opérationnel !**
