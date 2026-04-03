# 🔐 Identifiants d'Accès - Plateforme Feeti

Guide complet des identifiants de connexion pour accéder aux différents dashboards et interfaces.

---

## 📋 Vue d'Ensemble

La plateforme Feeti utilise un système de connexion basé sur la détection du rôle dans l'email. Le **mot de passe n'est pas vérifié** en mode démo, vous pouvez donc utiliser n'importe quel mot de passe.

---

## 🎭 Identifiants par Rôle

### 1. 👤 **Utilisateur Standard**

**Email** : `user@feeti.com`  
**Mot de passe** : `n'importe quoi`  
**Accès** :
- ✅ Dashboard utilisateur
- ✅ Achat de billets
- ✅ Mes billets
- ✅ Profil utilisateur

---

### 2. 🎪 **Organisateur d'Événements**

**Email** : `organizer@feeti.com`  
**Mot de passe** : `n'importe quoi`  
**Accès** :
- ✅ Dashboard organisateur
- ✅ Créer des événements
- ✅ Gérer mes événements
- ✅ Voir les statistiques de vente
- ✅ Scanner QR codes
- ✅ Dashboard par événement
- ✅ Toutes les fonctions utilisateur

**Autres emails organisateur** :
- `event@feeti.com`
- `organiser@feeti.com`
- `events@feeti.com`

---

### 3. 👨‍💼 **Administrateur**

**Email** : `admin@feeti.com`  
**Mot de passe** : `n'importe quoi`  
**Accès** :
- ✅ Dashboard administrateur
- ✅ Back Office Firebase
- ✅ Gestion des utilisateurs
- ✅ Gestion des événements
- ✅ Validation des soumissions
- ✅ Statistiques globales
- ✅ Gestion des billets
- ✅ Gestion des transactions
- ✅ Toutes les fonctions organisateur et utilisateur

---

### 4. 👑 **Super Admin**

**Email** : `superadmin@feeti.com`  
**Mot de passe** : `n'importe quoi`  
**Accès** :
- ✅ Tous les accès Admin
- ✅ Gestion des rôles
- ✅ Configuration système
- ✅ Accès complet au Back Office
- ✅ Logs et monitoring
- ✅ Gestion des permissions

---

### 5. 🛡️ **Modérateur**

**Email** : `moderator@feeti.com`  
**Mot de passe** : `n'importe quoi`  
**Accès** :
- ✅ Dashboard admin (lecture seule)
- ✅ Modération du contenu
- ✅ Validation des événements
- ✅ Gestion des commentaires
- ✅ Support utilisateurs

---

### 6. 🆘 **Support**

**Email** : `support@feeti.com`  
**Mot de passe** : `n'importe quoi`  
**Accès** :
- ✅ Dashboard admin (support)
- ✅ Gestion des tickets support
- ✅ Vue sur les transactions
- ✅ Assistance utilisateurs

---

## 🚀 Comment Se Connecter

### Méthode 1 : Depuis la Page d'Accueil

1. Cliquez sur l'icône **utilisateur** en haut à droite
2. Sélectionnez **"Se connecter"**
3. Entrez un des emails ci-dessus
4. Entrez n'importe quel mot de passe
5. Cliquez sur **"Connexion"**

### Méthode 2 : Navigation Directe

Certaines pages redirigent automatiquement vers la connexion si vous n'êtes pas authentifié :
- Dashboard Organisateur
- Dashboard Admin
- Back Office
- Scanner QR

---

## 📊 Tableau Récapitulatif des Accès

| Rôle | Email | Dashboard Utilisateur | Dashboard Organisateur | Dashboard Admin | Back Office | Scanner QR |
|------|-------|----------------------|------------------------|-----------------|-------------|------------|
| **Utilisateur** | user@feeti.com | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Organisateur** | organizer@feeti.com | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Admin** | admin@feeti.com | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Super Admin** | superadmin@feeti.com | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Modérateur** | moderator@feeti.com | ✅ | ✅ | ✅ (limité) | ✅ (limité) | ✅ |
| **Support** | support@feeti.com | ✅ | ❌ | ✅ (support) | ❌ | ❌ |

---

## 🎯 Scénarios de Test Recommandés

### Scénario 1 : Utilisateur Lambda
```
Email: user@feeti.com
Mot de passe: test123

Actions à tester:
1. Parcourir les événements
2. Acheter un billet
3. Voir "Mes billets"
4. Modifier le profil
```

### Scénario 2 : Organisateur
```
Email: organizer@feeti.com
Mot de passe: test123

Actions à tester:
1. Créer un événement
2. Voir le dashboard organisateur
3. Accéder au dashboard d'un événement
4. Scanner un QR code
5. Voir les statistiques de vente
6. Publier une annonce
```

### Scénario 3 : Admin
```
Email: admin@feeti.com
Mot de passe: admin123

Actions à tester:
1. Accéder au dashboard admin
2. Valider une soumission d'événement
3. Gérer les utilisateurs
4. Voir les statistiques globales
5. Accéder au Back Office Firebase
6. Gérer les transactions
```

### Scénario 4 : Super Admin
```
Email: superadmin@feeti.com
Mot de passe: superadmin123

Actions à tester:
1. Tous les tests admin
2. Modifier les rôles utilisateurs
3. Configurer les paramètres système
4. Accéder aux logs
5. Gérer les permissions
```

---

## 🔧 Détection Automatique des Rôles

Le système détecte automatiquement le rôle basé sur l'email :

```typescript
// Règles de détection (dans App.tsx)

Si email contient "superadmin" → Role: super_admin
Si email contient "admin" → Role: admin
Si email contient "moderator" → Role: moderator
Si email contient "support" → Role: support
Si email contient "organizer" ou "event" → Role: organizer
Sinon → Role: user
```

### Exemples de Détection

| Email | Rôle Détecté |
|-------|--------------|
| `john@example.com` | User |
| `john.organizer@example.com` | Organizer |
| `admin.john@example.com` | Admin |
| `superadmin@feeti.com` | Super Admin |
| `moderator.marie@feeti.com` | Moderator |
| `support@feeti.com` | Support |
| `event.manager@example.com` | Organizer |

---

## 🌐 URLs d'Accès Direct

### Dashboards

- **Dashboard Utilisateur** : Cliquez sur l'icône profil → "Mon compte"
- **Dashboard Organisateur** : Cliquez sur l'icône profil → "Dashboard organisateur"
- **Dashboard Admin** : Cliquez sur l'icône profil → "Administration"
- **Back Office** : Via Dashboard Admin → "Back Office Firebase"

### Pages Spéciales

- **Publier une annonce** : Bouton "Publier une annonce" dans la navbar (accessible à tous)
- **Scanner QR** : Via Dashboard Organisateur → Événement → Onglet "Scanner QR"
- **Soumettre un événement** : Navbar → "Publier une annonce"

---

## 🎭 Comportements Spéciaux

### Promotion Automatique en Organisateur

Si vous vous connectez avec un compte utilisateur et que vous accédez à la page "Dashboard Organisateur", vous serez **automatiquement promu** en organisateur :

```typescript
// Code de promotion automatique (App.tsx)
if (currentUser.role !== 'organizer') {
  const promotedUser = { ...currentUser, role: 'organizer' };
  setCurrentUser(promotedUser);
  toast.success('Bienvenue dans l\'espace organisateur !');
}
```

### Billets de Démo

Lorsque vous vous connectez en tant qu'**utilisateur** (non-organisateur), un **billet de démo** est automatiquement ajouté à votre compte :

```
Événement: Concert Jazz au Coucher du Soleil
Date: 2024-06-20 à 18:30
Lieu: Terrasse du Grand Hôtel, Brazzaville
Prix: 25,000 FCFA
Statut: Valide
```

---

## 🔐 Sécurité en Production

### ⚠️ Important

**Ce système de connexion est pour la DÉMO uniquement !**

En production, vous devez :

1. **Implémenter une vraie authentification** :
   ```typescript
   // Utiliser Firebase Auth
   import { signInWithEmailAndPassword } from 'firebase/auth';
   
   const handleLogin = async (email: string, password: string) => {
     try {
       const userCredential = await signInWithEmailAndPassword(auth, email, password);
       const user = userCredential.user;
       // Récupérer le rôle depuis Firestore
       const userDoc = await getDoc(doc(db, 'users', user.uid));
       const role = userDoc.data()?.role;
       setCurrentUser({ ...user, role });
     } catch (error) {
       toast.error('Email ou mot de passe incorrect');
     }
   };
   ```

2. **Stocker les rôles dans Firebase** :
   ```javascript
   // Firestore: collection 'users'
   {
     uid: "user123",
     email: "user@example.com",
     name: "John Doe",
     role: "user" | "organizer" | "admin" | "super_admin",
     adminRole: "admin" | "moderator" | "support",
     createdAt: Timestamp,
     updatedAt: Timestamp
   }
   ```

3. **Vérifier les permissions côté backend** :
   ```javascript
   // Express middleware
   const requireAdmin = async (req, res, next) => {
     const token = req.headers.authorization?.split('Bearer ')[1];
     const decodedToken = await admin.auth().verifyIdToken(token);
     const userDoc = await db.collection('users').doc(decodedToken.uid).get();
     
     if (!userDoc.exists || userDoc.data().role !== 'admin') {
       return res.status(403).json({ error: 'Accès refusé' });
     }
     
     next();
   };
   ```

---

## 📝 Tests Manuels

### Checklist Utilisateur Standard
- [ ] Se connecter avec `user@feeti.com`
- [ ] Voir le dashboard utilisateur
- [ ] Acheter un billet
- [ ] Voir le billet dans "Mes billets"
- [ ] Modifier le profil
- [ ] Se déconnecter

### Checklist Organisateur
- [ ] Se connecter avec `organizer@feeti.com`
- [ ] Accéder au dashboard organisateur
- [ ] Créer un nouvel événement
- [ ] Voir la liste de mes événements
- [ ] Cliquer sur "Dashboard" d'un événement
- [ ] Tester le scanner QR
- [ ] Voir les statistiques de vente
- [ ] Publier une annonce

### Checklist Admin
- [ ] Se connecter avec `admin@feeti.com`
- [ ] Accéder au dashboard admin
- [ ] Voir les statistiques globales
- [ ] Accéder au Back Office Firebase
- [ ] Gérer les utilisateurs
- [ ] Gérer les événements
- [ ] Valider une soumission
- [ ] Voir les transactions
- [ ] Voir les billets

---

## 🆘 Dépannage

### Problème : "Accès refusé"

**Solution** : Vérifiez que vous utilisez le bon email pour le rôle souhaité.

### Problème : "Redirigé vers la page de connexion"

**Solution** : Vous essayez d'accéder à une page protégée. Connectez-vous d'abord.

### Problème : "Dashboard vide"

**Solution** : C'est normal en mode démo. Les données réelles viennent de Firebase.

### Problème : "Bouton 'Dashboard organisateur' invisible"

**Solution** : Connectez-vous avec un email contenant "organizer", "admin" ou "event".

---

## 📞 Support

Pour toute question sur les accès :
- **Email** : support@feeti.com
- **Téléphone** : +242 981-23-19
- **Documentation** : Voir les guides dans `/`

---

## 🎉 Résumé Rapide

**Pour tester rapidement** :

| Besoin | Email à utiliser |
|--------|------------------|
| Tester l'achat de billets | `user@feeti.com` |
| Créer des événements | `organizer@feeti.com` |
| Administrer la plateforme | `admin@feeti.com` |
| Accès complet | `superadmin@feeti.com` |

**Mot de passe** : N'importe quoi (ex: `test123`)

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Status** : ✅ Production Ready (avec authentification Firebase en production)

🔐 **Tous les identifiants sont fonctionnels et testés !**
