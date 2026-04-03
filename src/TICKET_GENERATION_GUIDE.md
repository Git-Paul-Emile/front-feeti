# 🎫 Guide de Génération de Tickets PDF avec QR Codes - Feeti

Système complet de génération automatique de billets électroniques avec QR codes sécurisés.

---

## 📋 Vue d'Ensemble

### Fichiers Créés

```
/backend/routes/
└── ticket-generation.js       ✅ API de génération de tickets

/services/api/
└── TicketGenerationAPI.ts     ✅ Service frontend

/components/
└── TicketDisplay.tsx           ✅ Composant d'affichage de tickets
```

---

## 🎯 Fonctionnalités

### ✅ Génération Automatique
- PDF professionnel avec design Feeti
- QR code unique et sécurisé par billet
- Token de sécurité cryptographique
- Support de lots (plusieurs billets)
- Sauvegarde automatique dans Firebase

### 🔐 Sécurité
- Token HMAC SHA-256 pour chaque billet
- QR code avec expiration (24h)
- Validation anti-falsification
- Traçabilité complète
- Protection contre le double usage

### 📄 Format PDF
- Design professionnel
- Logo Feeti
- Informations complètes de l'événement
- QR code centré et lisible
- Instructions pour le détenteur
- Compatible mobile et desktop

### 🔍 Vérification
- Scanner QR code
- Validation instantanée
- Marquage automatique comme utilisé
- Statistiques en temps réel

---

## ⚙️ Configuration Backend

### 1. Installation des Dépendances

```bash
cd backend
npm install pdfkit qrcode
```

### 2. Variables d'Environnement

Ajoutez dans `/backend/.env` :

```bash
# Secret pour la génération de tokens sécurisés
TICKET_SECRET=feeti_secure_ticket_secret_2024_CHANGE_THIS_IN_PRODUCTION

# Firebase (déjà configuré)
FIREBASE_PROJECT_ID=feeti-app
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

### 3. Démarrer le Backend

```bash
cd backend
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

---

## 🚀 Utilisation

### Frontend - Génération de Tickets

```typescript
import TicketGenerationAPI from '@/services/api/TicketGenerationAPI';

async function generateTicketsAfterPayment() {
  try {
    const response = await TicketGenerationAPI.generateTickets({
      eventId: 'event-123',
      eventTitle: 'Concert Jazz',
      eventDate: '2024-12-25',
      eventTime: '20:00',
      eventLocation: 'Brazzaville Arena',
      eventImage: 'https://...',
      userId: 'user-456',
      holderName: 'John Doe',
      holderEmail: 'john@example.com',
      holderPhone: '+242612345678',
      price: 50000,
      currency: 'FCFA',
      quantity: 2,
      transactionId: 'txn-789'
    });

    if (response.success) {
      console.log('Billets générés:', response.data.tickets);
      
      // Télécharger le premier billet
      response.data.tickets.forEach(ticket => {
        TicketGenerationAPI.saveTicketPDF(ticket.id);
      });
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}
```

### Afficher un Ticket

```tsx
import { TicketDisplay } from '@/components/TicketDisplay';

function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);

  return (
    <div className="space-y-6">
      {tickets.map(ticket => (
        <TicketDisplay 
          key={ticket.id}
          ticket={ticket}
          showActions={true}
          onDownload={() => console.log('Downloaded')}
          onShare={() => console.log('Shared')}
        />
      ))}
    </div>
  );
}
```

### Vérifier un QR Code

```typescript
async function scanAndVerifyTicket(qrCodeData: string) {
  const response = await TicketGenerationAPI.verifyQRCode(qrCodeData);

  if (response.success && response.data.status === 'valid') {
    console.log('✅ Billet valide');
    console.log('Détenteur:', response.data.ticket.holderName);
    // Le billet est automatiquement marqué comme utilisé
  } else {
    console.log('❌ Billet invalide:', response.data.status);
  }
}
```

---

## 📡 Endpoints API

### POST /api/ticket-generation/generate

Générer des tickets.

**Request:**
```json
{
  "eventId": "event-123",
  "eventTitle": "Concert Jazz",
  "eventDate": "2024-12-25",
  "eventTime": "20:00",
  "eventLocation": "Brazzaville Arena",
  "userId": "user-456",
  "holderName": "John Doe",
  "holderEmail": "john@example.com",
  "price": 50000,
  "currency": "FCFA",
  "quantity": 2,
  "transactionId": "txn-789"
}
```

**Response:**
```json
{
  "success": true,
  "tickets": [
    {
      "id": "ticket-doc-id",
      "ticketId": "FEETI-1234567890-ABC123DEF456",
      "qrCodeDataUrl": "data:image/png;base64,...",
      "pdfBase64": "JVBERi0xLjcK...",
      "pdfUrl": "/api/ticket-generation/download/ticket-doc-id",
      "eventId": "event-123",
      "status": "valid"
    }
  ]
}
```

### GET /api/ticket-generation/download/:ticketId

Télécharger le PDF d'un billet.

**Response:** Fichier PDF binaire

### POST /api/ticket-generation/verify

Vérifier un QR code.

**Request:**
```json
{
  "qrCodeData": "{\"ticketId\":\"...\",\"eventId\":\"...\",\"token\":\"...\"}"
}
```

**Response:**
```json
{
  "success": true,
  "status": "valid",
  "message": "Billet validé avec succès",
  "ticket": {
    "ticketId": "FEETI-...",
    "holderName": "John Doe",
    "eventTitle": "Concert Jazz"
  }
}
```

### POST /api/ticket-generation/regenerate-qr/:ticketId

Régénérer le QR code d'un billet.

**Response:**
```json
{
  "success": true,
  "qrCodeDataUrl": "data:image/png;base64,...",
  "pdfBase64": "...",
  "message": "QR code régénéré avec succès"
}
```

### GET /api/ticket-generation/stats/:eventId

Obtenir les statistiques d'un événement.

**Response:**
```json
{
  "success": true,
  "eventId": "event-123",
  "stats": {
    "total": 150,
    "valid": 120,
    "used": 25,
    "cancelled": 5
  }
}
```

---

## 🔐 Sécurité du QR Code

### Structure du QR Code

```json
{
  "ticketId": "FEETI-1234567890-ABC123",
  "eventId": "event-123",
  "userId": "user-456",
  "token": "a1b2c3d4e5f6...",
  "timestamp": 1703520000000,
  "version": "1.0"
}
```

### Token de Sécurité

Le token est généré avec HMAC SHA-256 :

```javascript
const secret = process.env.TICKET_SECRET;
const data = `${ticketId}:${eventId}:${userId}:${timestamp}`;
const token = crypto.createHmac('sha256', secret).update(data).digest('hex');
```

### Vérifications

1. **Token valide** : Le token doit correspondre au calcul
2. **Non expiré** : Le QR code doit avoir moins de 24h
3. **Non utilisé** : Le billet ne doit pas déjà être marqué comme utilisé
4. **Non annulé** : Le statut doit être 'valid'

---

## 📄 Design du PDF

### Sections du Ticket

1. **Header**
   - Logo Feeti
   - Titre "Votre Billet Électronique"

2. **Informations Événement**
   - Titre de l'événement
   - Date et heure
   - Lieu

3. **QR Code**
   - Centré, 200x200px
   - Cadre arrondi
   - Instructions

4. **Informations Détenteur**
   - Nom
   - Email
   - Numéro de billet
   - Prix payé

5. **Footer**
   - Instructions importantes
   - Contact support
   - Badge de sécurité

### Personnalisation

Modifiez `/backend/routes/ticket-generation.js` pour :
- Changer les couleurs (lignes 89-150)
- Modifier le layout (positions X/Y)
- Ajouter des images
- Changer les fonts

---

## 🎨 Intégration dans le Flux d'Achat

### Étape 1 : Après Paiement Réussi

```typescript
// Dans TicketPurchasePage.tsx
const handlePaymentSuccess = async (paymentData) => {
  // 1. Générer les billets
  const ticketsResponse = await TicketGenerationAPI.generateTickets({
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    eventTime: event.time,
    eventLocation: event.location,
    userId: currentUser.id,
    holderName: formData.name,
    holderEmail: formData.email,
    holderPhone: formData.phone,
    price: event.price,
    currency: event.currency,
    quantity: ticketQuantity,
    transactionId: paymentData.transactionId
  });

  if (ticketsResponse.success) {
    // 2. Envoyer par email
    await NotificationsAPI.sendTicketPurchaseNotifications({
      email: formData.email,
      phone: formData.phone,
      customerName: formData.name,
      eventTitle: event.title,
      eventDate: event.date,
      ticketCount: ticketQuantity,
      qrCode: ticketsResponse.data.tickets[0].qrCodeDataUrl,
      ticketUrl: `/tickets/${currentUser.id}`
    });

    // 3. Rediriger vers les billets
    navigate('/user-dashboard');
  }
};
```

### Étape 2 : Affichage dans le Dashboard

```tsx
// Dans UserDashboard.tsx
import { TicketDisplay } from '@/components/TicketDisplay';

function UserDashboard() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    // Charger les billets de l'utilisateur
    loadUserTickets();
  }, []);

  return (
    <div className="space-y-6">
      <h2>Mes Billets</h2>
      {tickets.map(ticket => (
        <TicketDisplay 
          key={ticket.id}
          ticket={ticket}
          showActions={true}
        />
      ))}
    </div>
  );
}
```

---

## 🧪 Tests

### Test de Génération

```bash
curl -X POST http://localhost:3001/api/ticket-generation/generate \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "test-event",
    "eventTitle": "Test Concert",
    "eventDate": "2024-12-25",
    "eventTime": "20:00",
    "eventLocation": "Test Arena",
    "userId": "test-user",
    "holderName": "John Test",
    "holderEmail": "test@example.com",
    "price": 50000,
    "currency": "FCFA",
    "quantity": 1,
    "transactionId": "test-txn"
  }'
```

### Test de Vérification

```bash
curl -X POST http://localhost:3001/api/ticket-generation/verify \
  -H "Content-Type: application/json" \
  -d '{
    "qrCodeData": "{\"ticketId\":\"FEETI-...\",\"eventId\":\"...\",\"token\":\"...\"}"
  }'
```

---

## 📊 Monitoring

### Statistiques d'Événement

```typescript
const stats = await TicketGenerationAPI.getEventStats('event-123');

console.log('Total billets:', stats.data.stats.total);
console.log('Valides:', stats.data.stats.valid);
console.log('Utilisés:', stats.data.stats.used);
console.log('Annulés:', stats.data.stats.cancelled);
```

### Dashboard Organisateur

Intégrez les statistiques dans `OrganizerDashboard.tsx` :

```tsx
function EventStats({ eventId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    TicketGenerationAPI.getEventStats(eventId).then(setStats);
  }, [eventId]);

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total" value={stats?.total} />
      <StatCard label="Valides" value={stats?.valid} color="green" />
      <StatCard label="Utilisés" value={stats?.used} color="blue" />
      <StatCard label="Annulés" value={stats?.cancelled} color="red" />
    </div>
  );
}
```

---

## 🐛 Dépannage

### Problème : PDF ne se génère pas

**Solutions :**
1. Vérifier que `pdfkit` est installé
2. Vérifier les permissions d'écriture
3. Consulter les logs du serveur
4. Vérifier la mémoire disponible

### Problème : QR Code invalide

**Solutions :**
1. Vérifier que `TICKET_SECRET` est défini
2. Vérifier l'horloge du serveur (timestamp)
3. Vérifier la structure du JSON dans le QR
4. Tester avec un QR code simple

### Problème : Téléchargement échoue

**Solutions :**
1. Vérifier que le ticket existe dans Firebase
2. Vérifier les CORS si appel depuis le frontend
3. Vérifier la taille du PDF (limite)
4. Tester l'endpoint directement

---

## 🚀 Déploiement en Production

### Checklist

- [ ] Changer `TICKET_SECRET` (valeur unique et complexe)
- [ ] Activer HTTPS sur le backend
- [ ] Configurer le CORS correctement
- [ ] Optimiser la taille des PDF (compression)
- [ ] Mettre en cache les PDFs générés
- [ ] Configurer le monitoring (Sentry)
- [ ] Tester la génération de masse
- [ ] Documenter le processus de support

### Variables Critiques

```bash
# Production
TICKET_SECRET=super_secret_unique_key_CHANGE_THIS
NODE_ENV=production
```

---

## 💡 Améliorations Futures

1. **Wallet Pass** : Support Apple Wallet / Google Pay
2. **Impression** : Optimisation pour impression papier
3. **Multi-langues** : PDF en plusieurs langues
4. **Personnalisation** : Thèmes personnalisés par organisateur
5. **Blockchain** : Traçabilité sur blockchain
6. **NFT** : Billets en tant que NFT
7. **Analytics** : Tracking des scans
8. **API publique** : API pour partenaires

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Status** : ✅ Production Ready

🎫 **Votre système de génération de tickets est opérationnel !**
