# 🚀 Configuration Backend Feeti (Node.js/Express)

Guide complet pour configurer et déployer le backend de votre plateforme de billetterie Feeti.

---

## 📋 Prérequis

- Node.js 16+ et npm 8+
- Compte Stripe (https://stripe.com)
- Compte Paystack (https://paystack.com)
- Compte Twilio pour SMS (https://twilio.com)
- Compte email SMTP (Gmail/SendGrid/Mailgun)
- Projet Firebase configuré

---

## ⚡ Installation Rapide

### 1. Installer les dépendances

```bash
cd backend
npm install
```

### 2. Configurer les variables d'environnement

Copiez `.env.example` vers `.env` :

```bash
cp .env.example .env
```

Remplissez toutes les variables :

```bash
# Server
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Stripe
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

# Paystack
PAYSTACK_SECRET_KEY=sk_test_YOUR_KEY
PAYSTACK_PUBLIC_KEY=pk_test_YOUR_KEY

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Feeti <noreply@feeti.com>"

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+242XXXXXXXXX
```

### 3. Démarrer le serveur

```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur **http://localhost:3001**

---

## 🔑 Configuration des Services

### Stripe

1. **Créer un compte** : https://dashboard.stripe.com/register
2. **Obtenir les clés API** :
   - Allez dans Developers > API keys
   - Copiez `Publishable key` (pk_test_...) et `Secret key` (sk_test_...)
3. **Configurer les webhooks** :
   - Allez dans Developers > Webhooks
   - Ajoutez l'endpoint : `https://your-domain.com/api/webhooks/stripe`
   - Sélectionnez les événements : `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copiez le `Signing secret` (whsec_...)

### Paystack

1. **Créer un compte** : https://dashboard.paystack.com/#/signup
2. **Obtenir les clés API** :
   - Allez dans Settings > API Keys & Webhooks
   - Copiez `Public Key` et `Secret Key`
3. **Configurer les webhooks** :
   - Ajoutez l'URL : `https://your-domain.com/api/webhooks/paystack`
   - Activez les événements : `charge.success`, `charge.failed`, `refund.processed`

### Twilio (SMS)

1. **Créer un compte** : https://www.twilio.com/try-twilio
2. **Obtenir les credentials** :
   - Account SID
   - Auth Token
   - Phone Number (acheter un numéro pour +242)
3. **Configurer dans `.env`**

### Email (Gmail)

1. **Activer l'authentification à 2 facteurs** sur votre compte Gmail
2. **Générer un mot de passe d'application** :
   - Allez dans Compte Google > Sécurité > Mots de passe des applications
   - Créez un nouveau mot de passe pour "Mail"
   - Utilisez ce mot de passe dans `SMTP_PASS`

**Alternative** : Utilisez SendGrid ou Mailgun pour plus de fiabilité en production.

---

## 📡 Endpoints API

### Paiements

```http
# Stripe
POST /api/payments/stripe/create-intent
POST /api/payments/stripe/confirm

# Paystack
POST /api/payments/paystack/initialize
GET  /api/payments/paystack/status/:reference

# Mobile Money
POST /api/payments/mobile-money/initialize
GET  /api/payments/mobile-money/status/:transactionId

# Remboursements
POST /api/payments/refund

# Moyens de paiement
POST   /api/payments/methods
GET    /api/payments/methods/:userId
DELETE /api/payments/methods/:methodId
```

### Notifications

```http
# Email
POST /api/notifications/email/send
POST /api/notifications/email/ticket-confirmation
POST /api/notifications/email/password-reset

# SMS
POST /api/notifications/sms/send
POST /api/notifications/sms/ticket-confirmation

# Push (FCM)
POST /api/notifications/push/send
POST /api/notifications/push/send-multiple
POST /api/notifications/push/subscribe
POST /api/notifications/push/unsubscribe
POST /api/notifications/push/send-to-topic
```

### Webhooks

```http
POST /api/webhooks/stripe
POST /api/webhooks/paystack
```

---

## 🧪 Tester les API

### Avec cURL

```bash
# Test de création de paiement Stripe
curl -X POST http://localhost:3001/api/payments/stripe/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "xaf",
    "metadata": {
      "eventId": "event-123",
      "userId": "user-456"
    }
  }'
```

### Avec Postman

Importez la collection dans `/backend/postman_collection.json` (à créer)

### Cartes de test Stripe

```
Succès : 4242 4242 4242 4242
Échec : 4000 0000 0000 0002
3D Secure : 4000 0027 6000 3184

CVV : N'importe quel 3 chiffres
Date : N'importe quelle date future
```

---

## 🔐 Sécurité

### En Production

1. **HTTPS Obligatoire** : Utilisez Let's Encrypt ou Cloudflare
2. **Rate Limiting** : Limiter à 100 req/15min (déjà configuré)
3. **CORS** : Restreindre les origins autorisées
4. **Helmet** : Headers de sécurité (déjà configuré)
5. **Secrets** : Ne JAMAIS commiter les clés API
6. **Validation** : Valider toutes les entrées utilisateur
7. **Logs** : Monitorer avec Sentry ou LogRocket

### Variables d'environnement en production

**Vercel** :
```bash
vercel env add STRIPE_SECRET_KEY
vercel env add PAYSTACK_SECRET_KEY
# etc.
```

**Heroku** :
```bash
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set PAYSTACK_SECRET_KEY=sk_live_...
```

---

## 🚀 Déploiement

### Option 1 : Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
cd backend
vercel

# Configurer les variables d'environnement
vercel env add STRIPE_SECRET_KEY
# ... etc
```

**vercel.json** :
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### Option 2 : Heroku

```bash
# Créer une app
heroku create feeti-backend

# Ajouter les variables
heroku config:set STRIPE_SECRET_KEY=sk_live_...

# Déployer
git push heroku main
```

**Procfile** :
```
web: node server.js
```

### Option 3 : DigitalOcean / AWS / GCP

1. Créer une instance/VM
2. Installer Node.js
3. Cloner le repo
4. Configurer `.env`
5. Installer pm2 : `npm i -g pm2`
6. Démarrer : `pm2 start server.js --name feeti-backend`
7. Configurer nginx comme reverse proxy

---

## 📊 Monitoring

### Logs

```bash
# Voir les logs en temps réel
npm run dev

# Avec PM2
pm2 logs feeti-backend
```

### Health Check

```http
GET http://your-domain.com/health

Response:
{
  "status": "ok",
  "timestamp": "2024-12-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Métriques

Utilisez des outils comme :
- **Sentry** : Tracking d'erreurs
- **LogRocket** : Session replay
- **New Relic** : Performance monitoring
- **DataDog** : Infrastructure monitoring

---

## 🐛 Dépannage

### Problème : "Cannot find module"

```bash
# Réinstaller les dépendances
rm -rf node_modules
npm install
```

### Problème : "EADDRINUSE" (Port déjà utilisé)

```bash
# Changer le port dans .env
PORT=3002

# Ou tuer le processus
kill -9 $(lsof -t -i:3001)
```

### Problème : Stripe webhook ne fonctionne pas

```bash
# Utiliser le CLI Stripe pour tester localement
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Récupérer le webhook secret
stripe listen --print-secret
```

### Problème : Email non envoyé

1. Vérifiez les credentials SMTP
2. Activez "Less secure app access" pour Gmail
3. Vérifiez les logs du serveur
4. Testez avec un service comme Mailtrap

---

## 📖 Documentation API

### Exemple : Créer un paiement

**Request** :
```http
POST /api/payments/stripe/create-intent
Content-Type: application/json

{
  "amount": 50000,
  "currency": "xaf",
  "metadata": {
    "eventId": "event-123",
    "userId": "user-456",
    "tickets": 2
  }
}
```

**Response** :
```json
{
  "success": true,
  "id": "pi_xxxxxxxxxxxxx",
  "client_secret": "pi_xxxxxx_secret_xxxxxx",
  "amount": 50000,
  "currency": "xaf"
}
```

---

## 🔄 Webhooks

### Test local avec ngrok

```bash
# Installer ngrok
npm i -g ngrok

# Exposer le port 3001
ngrok http 3001

# Utiliser l'URL https://xxxxx.ngrok.io/api/webhooks/stripe
```

### Vérification de signature

Le backend vérifie automatiquement les signatures des webhooks pour garantir la sécurité.

---

## 💡 Bonnes Pratiques

1. **Utilisez des transactions** : Pour garantir la cohérence des données
2. **Idempotence** : Gérez les requêtes dupliquées avec des ID uniques
3. **Retry logic** : Réessayez les webhooks échoués
4. **Logs structurés** : Utilisez un format JSON pour les logs
5. **Circuit breakers** : Protégez contre les services tiers défaillants
6. **Timeouts** : Configurez des timeouts pour toutes les requêtes externes
7. **Monitoring** : Surveillez les erreurs et les performances

---

## 📞 Support

- **Documentation Stripe** : https://stripe.com/docs
- **Documentation Paystack** : https://paystack.com/docs
- **Documentation Twilio** : https://www.twilio.com/docs
- **Support Feeti** : support@feeti.com

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Environnement** : Node.js + Express
