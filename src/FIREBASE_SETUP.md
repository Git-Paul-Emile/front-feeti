# Configuration Firebase pour Feeti

Ce guide vous explique comment configurer Firebase pour votre plateforme de billetterie Feeti.

## 📋 Prérequis

- Un compte Google
- Node.js installé sur votre machine
- Le projet Feeti cloné localement

## 🚀 Étapes de Configuration

### 1. Créer un Projet Firebase

1. Rendez-vous sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Nommez votre projet "Feeti" (ou le nom de votre choix)
4. Acceptez les conditions et créez le projet

### 2. Activer les Services Nécessaires

#### A. Firestore Database (Base de données)

1. Dans le menu latéral, cliquez sur **"Firestore Database"**
2. Cliquez sur **"Créer une base de données"**
3. Sélectionnez le mode :
   - **Mode test** (pour le développement) : Accès ouvert pendant 30 jours
   - **Mode production** : Nécessite des règles de sécurité
4. Choisissez l'emplacement (ex: europe-west1 pour l'Europe)

#### B. Authentication (Authentification)

1. Dans le menu latéral, cliquez sur **"Authentication"**
2. Cliquez sur **"Commencer"**
3. Dans l'onglet **"Sign-in method"**, activez :
   - **Email/Password** : Pour l'inscription par email
   - **Google** (optionnel) : Pour la connexion Google

#### C. Storage (Stockage de fichiers)

1. Dans le menu latéral, cliquez sur **"Storage"**
2. Cliquez sur **"Commencer"**
3. Acceptez les règles par défaut (vous pourrez les modifier plus tard)
4. Sélectionnez l'emplacement (même que Firestore de préférence)

### 3. Obtenir les Credentials Firebase

1. Dans le menu latéral, cliquez sur **l'icône d'engrenage** ⚙️ puis **"Paramètres du projet"**
2. Dans l'onglet **"Général"**, descendez jusqu'à **"Vos applications"**
3. Cliquez sur l'icône **Web** `</>`
4. Donnez un surnom à votre application (ex: "Feeti Web")
5. Cochez **"Configurer également Firebase Hosting"** (optionnel)
6. Cliquez sur **"Enregistrer l'application"**
7. **Copiez la configuration** affichée :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "feeti-app.firebaseapp.com",
  projectId: "feeti-app",
  storageBucket: "feeti-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

### 4. Configurer le Projet Feeti

1. Ouvrez le fichier `/config/firebase.ts`
2. Remplacez les valeurs de `firebaseConfig` par vos propres credentials copiées précédemment :

```typescript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID",
  measurementId: "VOTRE_MEASUREMENT_ID"
};
```

### 5. Configurer les Règles de Sécurité

#### Règles Firestore

Dans **Firestore Database > Règles**, utilisez ces règles pour le développement :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour les événements
    match /events/{eventId} {
      allow read: if true; // Lecture publique
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin', 'organizer']);
    }
    
    // Règles pour les billets
    match /tickets/{ticketId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin']);
    }
    
    // Règles pour les transactions
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
  }
}
```

#### Règles Storage

Dans **Storage > Règles**, utilisez :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /events/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Structure de la Base de Données

Voici la structure des collections Firestore :

#### Collection `users`
```
{
  uid: string,
  name: string,
  email: string,
  phone?: string,
  avatar?: string,
  role: 'user' | 'organizer' | 'admin' | 'super_admin',
  adminRole?: 'super_admin' | 'admin' | 'moderator' | 'support' | 'organizer' | 'user',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Collection `events`
```
{
  title: string,
  description: string,
  date: string,
  time: string,
  location: string,
  image: string,
  price: number,
  currency: string,
  category: string,
  tags: string[],
  attendees: number,
  maxAttendees: number,
  isLive: boolean,
  organizer: string,
  organizerId: string,
  status: 'draft' | 'published' | 'cancelled' | 'completed',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Collection `tickets`
```
{
  eventId: string,
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
  userId: string,
  qrCode: string,
  status: 'valid' | 'used' | 'expired' | 'cancelled',
  purchaseDate: Timestamp,
  usedDate?: Timestamp,
  quantity: number,
  transactionId: string,
  createdAt: Timestamp
}
```

#### Collection `transactions`
```
{
  userId: string,
  eventId: string,
  amount: number,
  currency: string,
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  paymentMethod: 'stripe' | 'paystack' | 'mobile_money',
  tickets: number,
  createdAt: Timestamp,
  completedAt?: Timestamp
}
```

## 🔐 Sécurité et Bonnes Pratiques

### Variables d'Environnement (Production)

Pour la production, **NE JAMAIS** commiter les credentials Firebase dans le code. Utilisez des variables d'environnement :

1. Créez un fichier `.env.local` à la racine du projet :

```bash
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_auth_domain
VITE_FIREBASE_PROJECT_ID=votre_project_id
VITE_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
VITE_FIREBASE_MEASUREMENT_ID=votre_measurement_id
```

2. Modifiez `/config/firebase.ts` pour utiliser les variables d'environnement :

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```

3. Ajoutez `.env.local` dans votre `.gitignore`

### Règles de Sécurité Strictes (Production)

Les règles ci-dessus sont pour le développement. En production :

1. Activez **App Check** pour protéger contre les abus
2. Limitez les opérations de lecture/écriture
3. Validez les données avec des fonctions de validation
4. Utilisez Firebase Functions pour les opérations sensibles

## 📱 Accéder au Back Office

1. Lancez l'application : `npm run dev`
2. Connectez-vous avec un email contenant "admin" ou "superadmin"
3. Dans la navigation, accédez au **Back Office** via le menu administrateur
4. Vous aurez accès à :
   - **Vue d'ensemble** : Statistiques et graphiques
   - **Événements** : Créer, modifier, supprimer des événements
   - **Transactions** : Voir l'historique des paiements
   - **Paramètres** : Configuration système

## 🆘 Dépannage

### Erreur "Permission denied"
- Vérifiez que vos règles de sécurité sont correctement configurées
- Assurez-vous que l'utilisateur est authentifié

### Erreur "Firebase: No Firebase App"
- Vérifiez que les credentials sont correctement configurés dans `/config/firebase.ts`
- Redémarrez le serveur de développement

### Erreur "Quota exceeded"
- Vous avez dépassé le quota gratuit de Firebase
- Passez au plan Blaze (paiement à l'usage)

## 📚 Documentation Firebase

- [Documentation officielle Firebase](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Storage](https://firebase.google.com/docs/storage)

## 💰 Plans Tarifaires Firebase

### Plan Spark (Gratuit)
- Firestore : 1 GB stockage, 50k lectures/jour, 20k écritures/jour
- Authentication : Illimité
- Storage : 5 GB, 1 GB transfert/jour
- ✅ Parfait pour le développement et les petits projets

### Plan Blaze (Paiement à l'usage)
- Nécessaire pour :
  - Plus de trafic
  - Firebase Functions
  - Quotas plus élevés
- Tarification basée sur l'utilisation

## ✅ Checklist de Configuration

- [ ] Projet Firebase créé
- [ ] Firestore Database activé
- [ ] Authentication (Email/Password) activé
- [ ] Storage activé
- [ ] Credentials copiés dans `/config/firebase.ts`
- [ ] Règles de sécurité configurées
- [ ] Application testée localement
- [ ] Variables d'environnement configurées (production)

---

🎉 **Félicitations !** Votre back office Firebase est maintenant configuré et prêt à l'emploi.

Pour toute question, consultez la [documentation Firebase](https://firebase.google.com/docs) ou contactez le support technique.
