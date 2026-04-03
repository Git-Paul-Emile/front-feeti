# 🎫 Guide du Système de Livraison de Billets - Feeti

Documentation complète pour le système de choix de livraison (digital vs physique) et les codes d'accès streaming.

---

## 📋 Vue d'Ensemble

### Deux Systèmes Distincts

1. **Événements en Présentiel (en salle)**
   - Choix entre billet digital (email) ou physique (livraison)
   - QR code pour l'entrée
   - Options de livraison personnalisées

2. **Événements en Ligne (streaming)**
   - Code d'accès unique + PIN sécurisé
   - Authentification pour rejoindre le stream
   - Limite d'utilisation (3 connexions)

---

## 🎭 Événements en Présentiel

### Fonctionnalités

#### 1. Choix du Type de Billet

**Billet Digital** (par défaut)
- ✅ Gratuit
- ✅ Envoi instantané par email
- ✅ QR code sur smartphone
- ✅ Écologique

**Billet Physique**
- 📦 Livraison à domicile
- 💰 Frais : 2,000 FCFA
- ⏱️ Délai : 2-3 jours ouvrables
- 📍 Nécessite une adresse complète

#### 2. Formulaire de Livraison Physique

Champs requis :
```typescript
- address: string         // Adresse complète
- city: string           // Ville (Brazzaville, Pointe-Noire...)
- postalCode?: string    // Code postal (optionnel)
```

#### 3. Calcul du Prix Total

```typescript
const totalPrice = 
  (event.price * quantity) + 
  (deliveryType === 'physical' ? 2000 : 0);
```

### Utilisation dans le Code

```tsx
import { TicketPurchasePage } from './components/pages/TicketPurchasePage';

// Le composant gère automatiquement :
// - L'affichage des options selon event.isLive
// - Le formulaire d'adresse si physique sélectionné
// - Le calcul des frais de livraison
<TicketPurchasePage
  event={event}
  onBack={() => navigate('back')}
  onPurchaseComplete={handleSuccess}
  currentUser={currentUser}
/>
```

### Flow Utilisateur

```
1. Sélection de la quantité
2. Saisie des informations personnelles
3. Choix du type de billet (si en présentiel)
   ├─ Digital → Email instantané
   └─ Physique → Formulaire adresse
4. Confirmation et paiement
5. Génération du billet
6. Envoi selon le choix
```

---

## 🎬 Événements en Ligne (Streaming)

### Code d'Accès Unique

Chaque achat de billet pour un événement en ligne génère :

```typescript
{
  accessCode: "ABCD-EFGH-IJKL",  // 12 caractères
  accessPin: "123456",            // 6 chiffres
  maxUses: 3,                     // 3 connexions max
  expiresAt: Date                 // 24h après l'événement
}
```

### Génération du Code

```typescript
import StreamingAccessAPI from '@/services/api/StreamingAccessAPI';

// Après paiement réussi pour événement en ligne
const accessResponse = await StreamingAccessAPI.generateAccessCode({
  eventId: event.id,
  userId: currentUser.id,
  ticketId: generatedTicketId,
  userEmail: currentUser.email,
  userName: currentUser.name
});

if (accessResponse.success) {
  const { accessCode, accessPin } = accessResponse.data;
  // Afficher dans un dialog
  // Envoyer par email automatiquement
}
```

### Affichage du Code d'Accès

```tsx
import { StreamingAccessDialog } from '@/components/StreamingAccessDialog';

<StreamingAccessDialog
  open={showAccessDialog}
  onOpenChange={setShowAccessDialog}
  accessCode="ABCD-EFGH-IJKL"
  accessPin="123456"
  eventTitle={event.title}
  eventDate={event.date}
  userEmail={currentUser.email}
/>
```

### Vérification du Code (Streaming)

```typescript
import StreamingAccessAPI from '@/services/api/StreamingAccessAPI';

// Sur la page de streaming
const verifyResponse = await StreamingAccessAPI.verifyAccessCode(
  eventId,
  accessCode,
  accessPin
);

if (verifyResponse.success && verifyResponse.data.valid) {
  // Autoriser l'accès au stream
  startStreaming();
} else {
  // Afficher l'erreur
  showError(verifyResponse.data.message);
}
```

### Sécurité du Système

1. **Code Unique**
   - Généré avec caractères non ambigus (pas de 0, O, 1, I)
   - Format : XXXX-XXXX-XXXX

2. **PIN Numérique**
   - 6 chiffres aléatoires
   - Hashé côté serveur

3. **Limitations**
   - Maximum 3 connexions
   - Expiration 24h après l'événement
   - Traçabilité complète

4. **Vérifications**
   ```typescript
   ✓ Code existe et correspond à l'événement
   ✓ PIN correct
   ✓ Statut = 'active' (pas expiré/révoqué)
   ✓ Date < expiresAt
   ✓ currentUses < maxUses
   ```

---

## 🔧 Configuration Backend

### Routes Créées

```javascript
// /backend/routes/streaming-access.js

POST   /api/streaming/generate-access     // Générer code
POST   /api/streaming/verify-access       // Vérifier code
GET    /api/streaming/user-access/:userId // Codes utilisateur
POST   /api/streaming/revoke-access/:id   // Révoquer
POST   /api/streaming/send-access-email   // Renvoyer email
```

### Ajout au Serveur

```javascript
// /backend/server.js
app.use('/api/streaming', require('./routes/streaming-access'));
```

### Variables d'Environnement

```bash
# Backend .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Feeti <noreply@feeti.com>"
```

---

## 📧 Email de Code d'Accès

Template HTML professionnel envoyé automatiquement :

```html
Subject: 🎬 Votre code d'accès pour [Événement]

Contenu:
- En-tête avec logo Feeti
- Détails de l'événement
- Code d'accès (grand, bien visible)
- PIN sécurisé
- Instructions étape par étape
- Avertissements de sécurité
- Conseils techniques
- Liens support
```

---

## 📊 Exemples d'Intégration

### 1. Flux Complet d'Achat (Présentiel)

```typescript
const handlePurchaseComplete = async (paymentData) => {
  // 1. Générer les billets
  const tickets = await TicketGenerationAPI.generateTickets({
    ...eventData,
    deliveryType: formData.deliveryType,
    address: formData.deliveryType === 'physical' ? {
      street: formData.address,
      city: formData.city,
      postalCode: formData.postalCode
    } : null
  });

  // 2. Envoyer par email (digital)
  if (formData.deliveryType === 'digital') {
    await NotificationsAPI.sendTicketPurchaseNotifications({
      email: formData.email,
      tickets: tickets.data
    });
  }

  // 3. Planifier livraison (physique)
  if (formData.deliveryType === 'physical') {
    await schedulePhysicalDelivery({
      tickets: tickets.data,
      address: formData.address,
      estimatedDelivery: '2-3 jours'
    });
  }
};
```

### 2. Flux Complet d'Achat (En Ligne)

```typescript
const handleOnlineEventPurchase = async (paymentData) => {
  // 1. Générer le billet
  const ticket = await TicketGenerationAPI.generateTickets({
    ...eventData
  });

  // 2. Générer le code d'accès streaming
  const accessResponse = await StreamingAccessAPI.generateAccessCode({
    eventId: event.id,
    userId: currentUser.id,
    ticketId: ticket.data.tickets[0].id,
    userEmail: currentUser.email,
    userName: currentUser.name
  });

  // 3. Afficher le code à l'utilisateur
  setAccessCode(accessResponse.data.accessCode);
  setAccessPin(accessResponse.data.accessPin);
  setShowAccessDialog(true);

  // 4. Email envoyé automatiquement par le backend
  
  // 5. Rediriger vers dashboard
  navigate('/user-dashboard');
};
```

### 3. Page de Streaming avec Authentification

```typescript
function StreamingPage({ event }) {
  const [accessCode, setAccessCode] = useState('');
  const [accessPin, setAccessPin] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    
    const response = await StreamingAccessAPI.verifyAccessCode(
      event.id,
      accessCode,
      accessPin
    );

    if (response.success && response.data.valid) {
      setVerified(true);
      // Charger le player vidéo
      initializeVideoPlayer();
    } else {
      toast.error(response.data.message);
    }
    
    setLoading(false);
  };

  if (!verified) {
    return (
      <div className="auth-form">
        <Input
          placeholder="Code d'accès (XXXX-XXXX-XXXX)"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
        />
        <Input
          type="password"
          placeholder="PIN (6 chiffres)"
          value={accessPin}
          onChange={(e) => setAccessPin(e.target.value)}
        />
        <Button onClick={handleVerify} disabled={loading}>
          {loading ? 'Vérification...' : 'Accéder au stream'}
        </Button>
      </div>
    );
  }

  return <VideoPlayer src={event.streamUrl} />;
}
```

---

## 🧪 Tests

### Test du Choix de Livraison

```typescript
// Test 1: Affichage des options
const event = { isLive: false, title: 'Concert' };
// → Devrait afficher les deux options (digital + physique)

// Test 2: Calcul du prix
const digital = calculateTotal(50000, 2, 'digital');
// → 100,000 FCFA

const physical = calculateTotal(50000, 2, 'physical');
// → 102,000 FCFA (+ 2000 frais)

// Test 3: Formulaire adresse
selectDeliveryType('physical');
// → Formulaire d'adresse doit apparaître avec animation
```

### Test des Codes d'Accès

```bash
# Test 1: Génération
curl -X POST http://localhost:3001/api/streaming/generate-access \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event-123",
    "userId": "user-456",
    "ticketId": "ticket-789",
    "userEmail": "test@example.com",
    "userName": "John Doe",
    "accessCode": "ABCD-EFGH-IJKL",
    "accessPin": "123456"
  }'

# Test 2: Vérification (valide)
curl -X POST http://localhost:3001/api/streaming/verify-access \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event-123",
    "accessCode": "ABCD-EFGH-IJKL",
    "accessPin": "123456"
  }'
# → {"success": true, "valid": true}

# Test 3: Vérification (invalide)
curl -X POST http://localhost:3001/api/streaming/verify-access \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event-123",
    "accessCode": "WRONG-CODE",
    "accessPin": "000000"
  }'
# → {"success": false, "valid": false, "message": "Code invalide"}
```

---

## 📱 Interface Utilisateur

### Choix du Type de Billet

**Design :**
- 2 cartes côte à côte (responsive)
- Icônes parlantes (📧 digital, 📦 physique)
- Badges (Gratuit, Instantané, Livraison)
- Animation au survol et à la sélection
- Checkmark sur le choix actif

**Responsive :**
- Mobile : Cartes empilées verticalement
- Desktop : 2 colonnes

### Dialog de Code d'Accès

**Contenu :**
- 🎭 Détails de l'événement
- 🔑 Code d'accès (avec copier)
- 🔒 PIN (masqué avec toggle)
- 📋 Instructions d'utilisation
- ⚠️ Avertissements de sécurité
- 📧 Bouton "Envoyer par email"

---

## 🐛 Dépannage

### Problème : Options de livraison ne s'affichent pas

**Vérifier :**
```typescript
// event.isLive doit être false
console.log('Is Live:', event.isLive);

// Le composant doit être dans TicketPurchasePage
// Ligne ~90-200 du fichier
```

### Problème : Code d'accès invalide

**Vérifier :**
1. Code et PIN corrects
2. Événement correspond
3. Code pas expiré
4. Utilisation < maxUses

**Debug :**
```javascript
// Dans la console backend
const access = await db.collection('streaming_access')
  .where('accessCode', '==', code)
  .get();
  
console.log('Access found:', !access.empty);
console.log('Status:', access.docs[0]?.data().status);
console.log('Uses:', access.docs[0]?.data().currentUses);
```

### Problème : Email non reçu

**Solutions :**
1. Vérifier SMTP configuré
2. Vérifier les spams
3. Tester avec l'endpoint direct
4. Vérifier les logs backend

---

## 🚀 Déploiement

### Checklist

- [ ] Variables SMTP configurées
- [ ] Route `/api/streaming` ajoutée
- [ ] Firebase Firestore collection `streaming_access` créée
- [ ] Tests des deux types de livraison
- [ ] Tests des codes d'accès
- [ ] Email templates validés
- [ ] UI responsive testée
- [ ] Sécurité vérifiée

---

## 💡 Améliorations Futures

1. **Livraison Physique**
   - Tracking de livraison en temps réel
   - Choix du transporteur
   - Points de retrait

2. **Codes d'Accès**
   - QR code en plus du code textuel
   - Notification push avant l'événement
   - Mode invité pour partager l'accès

3. **Analytics**
   - Taux de choix digital vs physique
   - Utilisation des codes d'accès
   - Abandon de panier par type

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Status** : ✅ Production Ready

🎫 **Votre système de livraison et d'accès streaming est opérationnel !**
