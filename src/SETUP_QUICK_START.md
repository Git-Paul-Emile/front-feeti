# 🚀 Démarrage Rapide - Feeti

Guide pour configurer et lancer votre application Feeti en 5 minutes.

---

## ⚡ Démarrage Ultra-Rapide (Sans Firebase)

Si vous voulez juste tester l'application sans configurer Firebase :

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer l'application
npm run dev
```

✅ **C'est tout !** L'application fonctionnera en mode "mock data" sans Firebase.

---

## 🔥 Configuration Complète avec Firebase

### Étape 1 : Créer un Projet Firebase

1. Allez sur https://console.firebase.google.com
2. Cliquez sur "Ajouter un projet"
3. Suivez l'assistant de création
4. Activez les services nécessaires :
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Storage**
   - **Analytics** (optionnel)

### Étape 2 : Obtenir les Clés Firebase

1. Dans votre projet Firebase, cliquez sur l'icône ⚙️ (Paramètres)
2. Allez dans "Paramètres du projet"
3. Descendez jusqu'à "Vos applications"
4. Cliquez sur "SDK Setup and configuration"
5. Sélectionnez "Config" (format JSON)
6. Copiez les valeurs

### Étape 3 : Configurer l'Application

```bash
# 1. Copier le fichier d'exemple
cp .env.example .env.local

# 2. Ouvrir .env.local et remplir avec vos clés Firebase
nano .env.local  # ou utilisez votre éditeur préféré
```

Exemple de `.env.local` :

```bash
# Firebase (OBLIGATOIRE pour le backend)
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=feeti-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=feeti-app
VITE_FIREBASE_STORAGE_BUCKET=feeti-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc...
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Paiements (OPTIONNEL pour commencer)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...

# Backend (OPTIONNEL pour commencer)
VITE_BACKEND_URL=http://localhost:3001
```

### Étape 4 : Lancer l'Application

```bash
# 1. Installer les dépendances (si pas déjà fait)
npm install

# 2. Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur http://localhost:5173

---

## 🎯 Tester les Fonctionnalités

### 1. Sans Connexion (Mock Data)
- Parcourez les événements
- Explorez les pages Loisirs, Replay, Blog
- Testez la navigation

### 2. Avec Connexion (Firebase requis)
```
Email: user@feeti.com
Password: n'importe quoi (mode démo)
```

### 3. En tant qu'Organisateur
```
Email: organizer@feeti.com
Password: n'importe quoi
```

### 4. En tant qu'Admin
```
Email: admin@feeti.com
Password: n'importe quoi
```

---

## 🔧 Configuration Backend (Optionnel)

Pour activer les paiements, notifications et génération de tickets :

```bash
# 1. Aller dans le dossier backend
cd backend

# 2. Copier la configuration
cp .env.example .env

# 3. Remplir les clés API
nano .env

# 4. Installer les dépendances
npm install

# 5. Lancer le serveur
npm run dev
```

Le backend démarre sur http://localhost:3001

---

## 📚 Documentation Complète

- **Firebase Setup** : `/FIREBASE_SETUP.md`
- **Backend Setup** : `/BACKEND_SETUP.md`
- **API Integration** : `/API_INTEGRATION_GUIDE.md`
- **Cookies Setup** : `/COOKIES_SETUP.md`
- **Architecture** : `/ARCHITECTURE.md`

---

## 🐛 Résolution des Problèmes

### Erreur : "Firebase API key not valid"

**Solution** : Firebase n'est pas configuré.

Options :
1. **Mode mock** : Ignorez l'erreur, l'app fonctionne sans Firebase
2. **Configurez Firebase** : Suivez les étapes ci-dessus

### Erreur : "Module not found"

**Solution** :
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install
```

### Le site ne charge pas

**Solution** :
```bash
# Vérifier que le port 5173 est libre
lsof -ti:5173 | xargs kill -9

# Relancer
npm run dev
```

### Erreur : "Failed to fetch"

**Solution** :
- Vérifiez votre connexion Internet
- Si vous utilisez un VPN, désactivez-le temporairement

---

## ✅ Checklist de Démarrage

- [ ] Node.js 18+ installé
- [ ] npm installé
- [ ] Dépendances installées (`npm install`)
- [ ] (Optionnel) Firebase configuré dans `.env.local`
- [ ] (Optionnel) Backend configuré et lancé
- [ ] Application lancée (`npm run dev`)
- [ ] Site accessible sur http://localhost:5173

---

## 💡 Conseils

1. **Commencez sans Firebase** : Testez d'abord l'app en mode mock
2. **Firebase plus tard** : Configurez Firebase quand vous êtes prêt
3. **Backend en dernier** : Le backend est pour les fonctionnalités avancées
4. **Un problème ?** : Consultez les documentations détaillées

---

## 🎉 C'est Parti !

Votre application Feeti est maintenant prête. Bon développement ! 🚀

**Support** : Consultez les fichiers de documentation pour plus d'aide.
