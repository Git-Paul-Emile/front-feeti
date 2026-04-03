# 🍪 Guide de Configuration des Cookies - Feeti

Système complet de gestion des cookies conforme RGPD pour la plateforme Feeti.

---

## 📋 Vue d'Ensemble

### Composants Créés

```
/services/
└── CookieService.ts           # Service de gestion des cookies

/components/
├── CookieBanner.tsx           # Bannière de consentement
└── CookiePreferences.tsx      # Modal de préférences détaillées

/hooks/
└── useCookies.ts              # Hook React personnalisé
```

---

## 🎯 Fonctionnalités

### ✅ Conformité RGPD
- Consentement explicite pour les cookies non essentiels
- Possibilité de retirer le consentement à tout moment
- Expiration automatique du consentement (1 an)
- Gestion granulaire par catégorie

### 🔐 Catégories de Cookies

1. **Essentiels** (toujours actifs)
   - Session utilisateur
   - Préférences de base
   - Sécurité

2. **Analytiques** (optionnels)
   - Google Analytics
   - Mesures d'audience
   - Comportement des visiteurs

3. **Marketing** (optionnels)
   - Facebook Pixel
   - Publicités ciblées
   - Retargeting

4. **Préférences** (optionnels)
   - Thème (clair/sombre)
   - Langue
   - Pays sélectionné

---

## ⚙️ Configuration

### 1. Variables d'Environnement

Ajoutez dans votre `.env.local` :

```bash
# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Facebook Pixel
VITE_FB_PIXEL_ID=123456789012345

# Backend URL
VITE_BACKEND_URL=http://localhost:3001
```

### 2. Obtenir les Identifiants

**Google Analytics :**
1. Allez sur https://analytics.google.com
2. Créez une propriété GA4
3. Copiez le `Measurement ID` (G-XXXXXXXXXX)

**Facebook Pixel :**
1. Allez sur https://business.facebook.com/events_manager
2. Créez un pixel
3. Copiez l'ID du pixel

---

## 🚀 Utilisation

### Dans les Composants React

```typescript
import { useCookies } from './hooks/useCookies';

function MyComponent() {
  const { consent, isAllowed, acceptAll, rejectAll } = useCookies();

  // Vérifier si une catégorie est acceptée
  if (isAllowed('analytics')) {
    // Charger Google Analytics
  }

  // Accepter tous les cookies
  const handleAcceptAll = () => {
    acceptAll();
  };

  // Refuser tous les cookies non essentiels
  const handleRejectAll = () => {
    rejectAll();
  };

  return (
    <div>
      {consent ? (
        <p>Consentement donné le {new Date(consent.timestamp).toLocaleDateString()}</p>
      ) : (
        <p>Aucun consentement</p>
      )}
    </div>
  );
}
```

### Service Direct

```typescript
import CookieService from './services/CookieService';

// Vérifier si Analytics est autorisé
if (CookieService.isAllowed('analytics')) {
  // Initialiser Google Analytics
}

// Obtenir le consentement actuel
const consent = CookieService.getConsent();

// Sauvegarder un consentement personnalisé
CookieService.saveConsent({
  analytics: true,
  marketing: false,
  preferences: true
});

// Accepter tous les cookies
CookieService.acceptAll();

// Refuser tous les cookies non essentiels
CookieService.rejectAll();

// Effacer le consentement
CookieService.clearConsent();

// Obtenir les statistiques
const stats = CookieService.getUsageStats();
console.log(`${stats.activeCookies} / ${stats.totalCookies} cookies actifs`);
```

---

## 🎨 Interface Utilisateur

### Bannière de Cookies

La bannière s'affiche automatiquement si l'utilisateur n'a pas encore donné son consentement.

**Apparence :**
- Design moderne avec dégradé indigo/violet
- 3 boutons : Accepter tout, Personnaliser, Refuser
- Section détails dépliable
- Badge RGPD
- Responsive mobile/desktop

**Comportement :**
- Apparaît 1 seconde après le chargement
- Animation slide-up fluide
- Peut être fermée (X)
- Réapparaît si aucun choix n'est fait

### Modal de Préférences

Modal détaillé avec 4 onglets (un par catégorie).

**Fonctionnalités :**
- Liste complète des cookies avec descriptions
- Switches pour activer/désactiver par catégorie
- Informations détaillées (nom, provider, expiration)
- Statistiques en temps réel
- Boutons : Refuser tout, Accepter tout, Enregistrer

---

## 📊 Tracking et Analytics

### Google Analytics

Le service charge automatiquement GA si l'utilisateur accepte les cookies analytiques :

```typescript
// Automatiquement géré par CookieService
if (consent.analytics) {
  // GA est chargé avec :
  // - Anonymisation IP activée
  // - Cookies SameSite=None;Secure
  // - Respect RGPD
}
```

### Facebook Pixel

Chargé automatiquement si l'utilisateur accepte les cookies marketing :

```typescript
// Automatiquement géré par CookieService
if (consent.marketing) {
  // Facebook Pixel est initialisé
  // Tracking des pages et événements
}
```

### Tracking Personnalisé

```typescript
import CookieService from './services/CookieService';

// Vérifier avant de tracker
if (CookieService.isAllowed('analytics')) {
  // Envoyer un événement personnalisé
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: 'T123',
      value: 50000,
      currency: 'FCFA'
    });
  }
}

if (CookieService.isAllowed('marketing')) {
  // Envoyer un événement Facebook
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: 50000,
      currency: 'FCFA'
    });
  }
}
```

---

## 🔒 Sécurité et Confidentialité

### Bonnes Pratiques Implémentées

1. **Stockage Local Sécurisé**
   - Consentement stocké uniquement dans localStorage
   - Pas de cookies pour le consentement lui-même
   - Chiffrement non nécessaire (pas de données sensibles)

2. **Anonymisation**
   - Google Analytics avec IP anonymisé
   - Pas de données personnelles dans les cookies
   - Respect du RGPD et ePrivacy

3. **Expiration Automatique**
   - Consentement valide 1 an
   - Redemande automatique après expiration
   - Gestion des versions de politique

4. **Suppression Facile**
   - Bouton "Tout Refuser" disponible
   - Suppression complète des cookies tiers
   - Désactivation immédiate du tracking

---

## 📱 Responsive Design

### Mobile (< 640px)
- Bannière plein écran avec boutons empilés
- Modal scrollable avec navigation tactile
- Boutons tactiles optimisés (min 44px)

### Tablet (640px - 1024px)
- Bannière avec boutons en ligne
- Modal avec layout adapté
- Navigation par swipe

### Desktop (> 1024px)
- Bannière compacte en bas
- Modal large avec tous les détails
- Hover effects et animations

---

## 🧪 Tests

### Test du Consentement

```typescript
// Dans la console du navigateur
import CookieService from './services/CookieService';

// Test 1 : Accepter tous les cookies
CookieService.acceptAll();
console.log('Consent:', CookieService.getConsent());

// Test 2 : Vérifier les catégories
console.log('Analytics autorisé:', CookieService.isAllowed('analytics'));
console.log('Marketing autorisé:', CookieService.isAllowed('marketing'));

// Test 3 : Refuser tout
CookieService.rejectAll();
console.log('Consent après refus:', CookieService.getConsent());

// Test 4 : Statistiques
console.log('Stats:', CookieService.getUsageStats());

// Test 5 : Effacer
CookieService.clearConsent();
console.log('Après effacement:', CookieService.getConsent());
```

### Test de l'Interface

1. **Bannière**
   - Ouvrez l'app en navigation privée
   - La bannière doit apparaître après 1 seconde
   - Testez tous les boutons

2. **Modal de Préférences**
   - Cliquez sur "Personnaliser"
   - Testez les switches de chaque catégorie
   - Vérifiez la sauvegarde

3. **Persistance**
   - Acceptez tous les cookies
   - Rafraîchissez la page
   - La bannière ne doit pas réapparaître

4. **Expiration**
   - Modifiez manuellement le timestamp dans localStorage
   - Mettez une date > 1 an dans le passé
   - Rafraîchissez : la bannière doit réapparaître

---

## 🐛 Dépannage

### Problème : La bannière ne s'affiche pas

**Solution :**
```typescript
// Effacer le consentement pour forcer l'affichage
localStorage.removeItem('feeti_cookie_consent');
// Rafraîchir la page
```

### Problème : Google Analytics ne charge pas

**Vérifications :**
1. `VITE_GA_MEASUREMENT_ID` est défini dans `.env.local`
2. L'utilisateur a accepté les cookies analytiques
3. Pas de bloqueur de pub actif
4. Console : rechercher les erreurs GA

```typescript
// Vérifier dans la console
console.log('GA ID:', import.meta.env.VITE_GA_MEASUREMENT_ID);
console.log('Analytics autorisé:', CookieService.isAllowed('analytics'));
console.log('gtag function:', typeof window.gtag);
```

### Problème : Les préférences ne sont pas sauvegardées

**Solution :**
```typescript
// Vérifier localStorage
console.log('Consent stocké:', localStorage.getItem('feeti_cookie_consent'));

// Tester la sauvegarde manuelle
CookieService.saveConsent({
  analytics: true,
  marketing: false,
  preferences: true
});
```

---

## 📖 Références

- **RGPD** : https://www.cnil.fr/fr/reglement-europeen-protection-donnees
- **ePrivacy Directive** : https://ec.europa.eu/digital-single-market/en/privacy-and-electronic-communications
- **Google Analytics GDPR** : https://support.google.com/analytics/answer/9019185
- **Facebook Pixel GDPR** : https://www.facebook.com/business/gdpr

---

## ✅ Checklist de Conformité RGPD

- [x] Consentement explicite avant tout tracking
- [x] Possibilité de refuser les cookies
- [x] Catégorisation claire des cookies
- [x] Informations détaillées sur chaque cookie
- [x] Facilité de retirer le consentement
- [x] Expiration du consentement (1 an maximum)
- [x] Anonymisation des données (Google Analytics)
- [x] Politique de cookies accessible
- [x] Design responsive
- [x] Accessibilité (ARIA labels)

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Status** : ✅ RGPD Compliant

🎉 **Votre système de cookies est maintenant conforme et opérationnel !**
