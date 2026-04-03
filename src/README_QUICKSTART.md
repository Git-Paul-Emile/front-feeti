# 🚀 Guide de Démarrage Rapide - Feeti Backend (NoSQL)

## Architecture Choisie : Firebase (NoSQL)

Votre plateforme Feeti utilise **Firebase** avec **Firestore** (base de données NoSQL) pour un déploiement rapide et une scalabilité optimale.

---

## ⚡ Démarrage en 5 Minutes

### 1. Configuration Firebase (2 min)

```bash
# 1. Créez un compte sur Firebase Console
https://console.firebase.google.com/

# 2. Créez un nouveau projet "Feeti"

# 3. Activez ces services :
   - ✅ Firestore Database (mode test pour commencer)
   - ✅ Authentication (Email/Password)
   - ✅ Storage (pour les images)
   - ✅ Analytics (optionnel)
```

### 2. Copiez vos Credentials (1 min)

Dans Firebase Console :
1. Allez dans **⚙️ Paramètres du projet**
2. Descendez à **"Vos applications"**
3. Cliquez sur **`</>`** (Web)
4. Copiez la configuration

### 3. Configurez le Projet (1 min)

Ouvrez `/config/firebase.ts` et remplacez :

```typescript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY_ICI",
  authDomain: "feeti-xxxx.firebaseapp.com",
  projectId: "feeti-xxxx",
  storageBucket: "feeti-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx",
  measurementId: "G-XXXXXXXXXX"
};
```

### 4. Lancez l'Application (1 min)

```bash
npm run dev
```

---

## 🎯 Accéder au Back Office

### Connexion Administrateur

1. Allez sur votre application locale : `http://localhost:5173`
2. Cliquez sur **"Se connecter"**
3. Utilisez un email contenant **"admin"** :
   - Email : `admin@feeti.com`
   - Mot de passe : `n'importe quoi` (en mode dev)

### Navigation vers le Back Office

**Méthode 1** : Menu utilisateur
- Cliquez sur votre avatar (en haut à droite)
- Sélectionnez **"Back Office"**

**Méthode 2** : URL directe
- Naviguez vers `/back-office`

---

## 📊 Structure Firestore (NoSQL)

### Collections Principales

Votre base de données Firestore contient **4 collections** :

```
feeti-database/
├── users/               # Utilisateurs
│   └── {userId}
│       ├── uid: string
│       ├── name: string
│       ├── email: string
│       ├── role: string
│       └── createdAt: timestamp
│
├── events/              # Événements
│   └── {eventId}
│       ├── title: string
│       ├── date: string
│       ├── price: number
│       ├── isLive: boolean
│       └── status: string
│
├── tickets/             # Billets
│   └── {ticketId}
│       ├── eventId: string
│       ├── userId: string
│       ├── qrCode: string
│       └── status: string
│
└── transactions/        # Transactions
    └── {transactionId}
        ├── userId: string
        ├── amount: number
        ├── status: string
        └── createdAt: timestamp
```

### Avantages du NoSQL

✅ **Scalabilité automatique** : Firebase gère l'infrastructure
✅ **Temps réel** : Synchronisation instantanée des données
✅ **Pas de serveur** : Backend-as-a-Service (BaaS)
✅ **Sécurité intégrée** : Règles de sécurité Firebase
✅ **Gratuit pour démarrer** : Plan Spark inclus

---

## 🔑 Fonctionnalités Disponibles

### Dans le Back Office

| Fonctionnalité | Status | Description |
|----------------|--------|-------------|
| **Vue d'ensemble** | ✅ | Statistiques en temps réel |
| **Créer événement** | ✅ | Formulaire complet avec validation |
| **Modifier événement** | ✅ | Édition inline |
| **Supprimer événement** | ✅ | Avec confirmation |
| **Voir transactions** | ✅ | Historique complet |
| **Analytics** | ✅ | Graphiques interactifs (Recharts) |
| **Recherche** | ✅ | Filtrage en temps réel |

### Services Disponibles

Tous les services sont dans `/services/FirebaseService.ts` :

```typescript
// Authentification
import { AuthService } from '@/services/FirebaseService';
await AuthService.register(email, password, name);
await AuthService.login(email, password);

// Événements
import { EventService } from '@/services/FirebaseService';
await EventService.createEvent(eventData);
await EventService.getAllEvents();

// Billets
import { TicketService } from '@/services/FirebaseService';
await TicketService.createTickets(ticketsData);

// Transactions
import { TransactionService } from '@/services/FirebaseService';
await TransactionService.createTransaction(transactionData);

// Analytics
import { AnalyticsService } from '@/services/FirebaseService';
const stats = await AnalyticsService.getEventStats();
```

---

## 🔐 Règles de Sécurité Firestore

### Configuration Initiale (Mode Test - 30 jours)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 1, 15);
    }
  }
}
```

### Production (Règles Strictes)

Copiez ceci dans **Firestore Database > Règles** :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid))
        .data.role in ['admin', 'super_admin'];
    }
    
    // Users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Events
    match /events/{eventId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
    
    // Tickets
    match /tickets/{ticketId} {
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update: if isAdmin();
    }
    
    // Transactions
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update: if isAdmin();
    }
  }
}
```

---

## 📱 Tester le Système

### Test 1 : Créer un Événement

1. Connectez-vous en tant qu'admin
2. Allez dans **Back Office > Événements**
3. Cliquez **"+ Nouvel Événement"**
4. Remplissez le formulaire :
   - Titre : `Concert Test`
   - Date : `2024-12-25`
   - Heure : `20:00`
   - Prix : `5000`
5. Cliquez **"Enregistrer"**
6. ✅ L'événement apparaît dans la liste

### Test 2 : Voir les Statistiques

1. Allez dans **Back Office > Vue d'ensemble**
2. Vérifiez les cartes :
   - Événements Totaux : `1`
   - Revenus : `0 FCFA`
3. ✅ Les graphiques s'affichent

### Test 3 : Vérifier Firestore

1. Ouvrez **Firebase Console**
2. Allez dans **Firestore Database**
3. Vérifiez la collection `events`
4. ✅ Votre événement est visible

---

## 🎨 Interface du Back Office

### Pages Disponibles

```
Back Office
├── Vue d'ensemble          (Statistiques + Graphiques)
├── Événements              (CRUD complet)
├── Transactions            (Historique paiements)
└── Paramètres              (Configuration système)
```

### Design System

**Couleurs** :
- Primaire : Indigo `#4338ca`
- Secondaire : Vert `#059669`
- Accent : Jaune-vert `#cdff71`
- Danger : Rouge `#DE0035`

**Composants UI** :
- shadcn/ui (Buttons, Cards, Tables, Dialogs)
- Recharts (Graphiques)
- Lucide Icons (Icônes)

---

## 📈 Quotas Firebase (Plan Gratuit)

| Service | Quota Gratuit | Suffisant pour |
|---------|---------------|----------------|
| **Firestore** | 1 GB stockage | ~100 000 événements |
| **Firestore Reads** | 50k/jour | ~1600 utilisateurs/jour |
| **Firestore Writes** | 20k/jour | ~600 nouveaux billets/jour |
| **Authentication** | Illimité | ∞ utilisateurs |
| **Storage** | 5 GB | ~10 000 images |

**💡 Conseil** : Le plan gratuit est largement suffisant pour démarrer et tester.

---

## 🆘 Problèmes Courants

### Erreur : "Firebase App not initialized"

**Solution** :
```bash
# Vérifiez que vos credentials sont corrects dans /config/firebase.ts
# Redémarrez le serveur de développement
npm run dev
```

### Erreur : "Permission denied"

**Solution** :
1. Vérifiez vos règles Firestore (voir ci-dessus)
2. Assurez-vous d'être connecté
3. Vérifiez que votre rôle est `admin` ou `super_admin`

### Aucune donnée ne s'affiche

**Solution** :
```bash
# Cliquez sur le bouton "Actualiser" dans le back office
# Ou rechargez la page (F5)
```

### Firebase Console n'affiche rien

**Solution** :
1. Vérifiez que vous êtes dans le bon projet Firebase
2. Vérifiez que Firestore est activé (mode test)
3. Créez votre premier événement depuis le back office

---

## 📚 Documentation Complète

| Document | Description |
|----------|-------------|
| `FIREBASE_SETUP.md` | Configuration détaillée de Firebase |
| `BACKOFFICE_GUIDE.md` | Guide utilisateur du back office |
| `README_BACKEND.md` | Architecture technique complète |
| `database/schema.sql` | Référence SQL (si migration future) |

---

## 🎯 Prochaines Étapes

### Après le Setup Initial

1. **Créer des données de test**
   - [ ] 5-10 événements variés
   - [ ] Quelques utilisateurs
   - [ ] Transactions de test

2. **Configurer les règles de sécurité**
   - [ ] Passer en mode production
   - [ ] Tester les permissions

3. **Personnaliser le back office**
   - [ ] Ajouter votre logo
   - [ ] Ajuster les couleurs si besoin
   - [ ] Configurer les emails

4. **Intégrer les paiements** (optionnel)
   - [ ] Stripe ou Paystack
   - [ ] Webhooks Firebase Functions

---

## 💾 Backup et Sécurité

### Backup Automatique

Firebase offre des backups automatiques sur le plan Blaze (payant).

Pour le plan gratuit, exportez manuellement :

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter
firebase login

# Exporter les données
firebase firestore:export gs://votre-bucket/backup-$(date +%Y%m%d)
```

### Sécurité Best Practices

✅ **Activez App Check** (protection contre les abus)
✅ **Utilisez des variables d'environnement** en production
✅ **Activez 2FA** sur votre compte Firebase
✅ **Limitez les règles d'accès** au strict nécessaire
✅ **Auditez régulièrement** les accès et les logs

---

## 🌐 Déploiement en Production

### Avec Firebase Hosting (Gratuit)

```bash
# 1. Build de production
npm run build

# 2. Déployer sur Firebase Hosting
firebase deploy --only hosting

# 3. Votre site est en ligne !
# https://feeti-xxxx.web.app
```

### Avec Vercel/Netlify

```bash
# 1. Configurez les variables d'environnement
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# ... etc

# 2. Déployez normalement
vercel --prod
# ou
netlify deploy --prod
```

---

## ✅ Checklist Finale

Avant de considérer votre backend comme "prêt" :

- [ ] Firebase configuré et credentials copiés
- [ ] Firestore activé (mode test OK pour démarrer)
- [ ] Authentication activée (Email/Password)
- [ ] Storage activé
- [ ] Premier admin créé et connecté
- [ ] Back office accessible et fonctionnel
- [ ] Premier événement créé avec succès
- [ ] Statistiques s'affichent correctement
- [ ] Règles de sécurité comprises
- [ ] Documentation lue et comprise

---

## 🎉 Félicitations !

Votre backend Firebase (NoSQL) est maintenant opérationnel !

**Prochaines étapes suggérées** :
1. Créez quelques événements de test
2. Testez l'achat de billets (front office)
3. Vérifiez les transactions dans le back office
4. Explorez les analytics et graphiques
5. Personnalisez selon vos besoins

**Besoin d'aide ?**
- 📖 Consultez `BACKOFFICE_GUIDE.md` pour l'utilisation
- 🔧 Consultez `README_BACKEND.md` pour l'architecture
- 🔥 Consultez `FIREBASE_SETUP.md` pour la configuration

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Architecture** : Firebase (NoSQL)  
**Status** : ✅ Production Ready

---

🚀 **Bon développement avec Feeti !**
