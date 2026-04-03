# 🍪 Système de Gestion des Cookies Feeti

## ✅ Implémentation Complète

Le système de cookies conforme RGPD est maintenant complètement intégré dans votre application Feeti.

---

## 📦 Fichiers Créés

```
/services/
└── CookieService.ts              ✅ Service principal (classe singleton)

/components/
├── CookieBanner.tsx              ✅ Bannière de consentement
└── CookiePreferences.tsx         ✅ Modal de gestion détaillée

/hooks/
└── useCookies.ts                 ✅ Hook React personnalisé

/documentation/
├── COOKIES_SETUP.md              ✅ Guide complet de configuration
└── README_COOKIES.md             ✅ Ce fichier
```

---

## 🚀 Comment Utiliser

### 1. Configuration des Variables d'Environnement

Créez ou modifiez votre `.env.local` :

```bash
# Google Analytics (optionnel)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Facebook Pixel (optionnel)
VITE_FB_PIXEL_ID=123456789012345
```

### 2. Dans Votre Code

```typescript
import { useCookies } from './hooks/useCookies';
import CookieService from './services/CookieService';

// Dans un composant React
function MyComponent() {
  const { isAllowed, consent } = useCookies();

  // Vérifier avant de charger un script tiers
  useEffect(() => {
    if (isAllowed('analytics')) {
      // Charger Google Analytics ou autre
      console.log('Analytics autorisé');
    }
  }, [isAllowed]);

  return <div>...</div>;
}

// Ou directement avec le service
if (CookieService.isAllowed('marketing')) {
  // Charger Facebook Pixel
}
```

---

## 🎯 Fonctionnement

### Flux Utilisateur

1. **Première Visite**
   - La bannière de cookies apparaît après 1 seconde
   - L'utilisateur peut : Accepter tout, Refuser tout, ou Personnaliser
   - Le choix est sauvegardé pour 1 an

2. **Personnalisation**
   - Modal avec 4 onglets (Essentiels, Analytiques, Marketing, Préférences)
   - Liste détaillée de chaque cookie avec descriptions
   - Switches pour activer/désactiver par catégorie
   - Statistiques en temps réel

3. **Visites Suivantes**
   - La bannière ne s'affiche plus
   - Les préférences sont appliquées automatiquement
   - Lien "Gérer les Cookies" dans le footer

### Catégories de Cookies

| Catégorie | Description | Toujours Actif |
|-----------|-------------|----------------|
| **Essentiels** | Session, sécurité, fonctionnement de base | ✅ Oui |
| **Analytiques** | Google Analytics, mesures d'audience | ❌ Non |
| **Marketing** | Facebook Pixel, publicités ciblées | ❌ Non |
| **Préférences** | Thème, langue, pays | ❌ Non |

---

## 🔐 Conformité RGPD

### ✅ Points Conformes

- [x] Consentement explicite avant tout tracking
- [x] Refus possible sans pénalité
- [x] Catégorisation claire et transparente
- [x] Informations détaillées accessibles
- [x] Retrait du consentement facile
- [x] Expiration automatique (1 an)
- [x] Anonymisation des données (GA)
- [x] Politique accessible
- [x] Design accessible (ARIA)

### 🛡️ Sécurité

- Stockage local dans `localStorage`
- Pas de transmission de données sensibles
- Suppression complète des cookies tiers possible
- Désactivation immédiate du tracking

---

## 🎨 Interface Utilisateur

### Bannière de Cookies

**Design :**
- Card moderne avec dégradé indigo/violet
- Badge "RGPD Compliant"
- 3 boutons principaux
- Section détails dépliable
- Animation slide-up fluide

**Responsive :**
- Mobile : Boutons empilés
- Tablet : Boutons en ligne
- Desktop : Layout compact

### Modal de Préférences

**Fonctionnalités :**
- 4 onglets par catégorie
- Liste complète des cookies
- Switches interactifs
- Barre de statistiques
- Descriptions détaillées

**Actions :**
- Enregistrer les préférences
- Accepter tout
- Refuser tout
- Fermer (sans sauvegarder)

---

## 📊 Tracking Automatique

### Google Analytics

Si l'utilisateur accepte les cookies analytiques :

```typescript
// Chargement automatique avec :
// - Measurement ID depuis .env
// - IP anonymisé
// - Cookies SameSite=None;Secure
// - Consentement mode
```

### Facebook Pixel

Si l'utilisateur accepte les cookies marketing :

```typescript
// Initialisation automatique
// Tracking PageView
// Events personnalisés disponibles
```

### Exemple d'Événement Personnalisé

```typescript
import CookieService from './services/CookieService';

// Lors d'un achat
if (CookieService.isAllowed('analytics') && window.gtag) {
  window.gtag('event', 'purchase', {
    transaction_id: 'T123',
    value: 50000,
    currency: 'FCFA',
    items: [{
      item_name: 'Concert Jazz',
      quantity: 2
    }]
  });
}

// Marketing
if (CookieService.isAllowed('marketing') && window.fbq) {
  window.fbq('track', 'Purchase', {
    value: 50000,
    currency: 'FCFA'
  });
}
```

---

## 🧪 Tests

### Test Manuel

1. **Première Visite**
   ```
   - Ouvrir en navigation privée
   - Attendre 1 seconde
   - Vérifier que la bannière s'affiche
   ```

2. **Accepter Tout**
   ```
   - Cliquer "Accepter tout"
   - Rafraîchir la page
   - Vérifier que la bannière ne réapparaît pas
   - Vérifier dans DevTools : localStorage['feeti_cookie_consent']
   ```

3. **Personnaliser**
   ```
   - Cliquer "Personnaliser"
   - Activer seulement Analytics
   - Sauvegarder
   - Vérifier dans la console : CookieService.getConsent()
   ```

4. **Refuser Tout**
   ```
   - Cliquer "Refuser tout"
   - Vérifier que seuls les cookies essentiels sont actifs
   - Vérifier que GA ne charge pas
   ```

### Test Console

```javascript
// Dans la console du navigateur
import CookieService from './services/CookieService';

// Vérifier le consentement actuel
console.log('Consent:', CookieService.getConsent());

// Vérifier les autorisations
console.log('Analytics:', CookieService.isAllowed('analytics'));
console.log('Marketing:', CookieService.isAllowed('marketing'));

// Obtenir les statistiques
console.log('Stats:', CookieService.getUsageStats());

// Effacer le consentement
CookieService.clearConsent();

// Accepter tous
CookieService.acceptAll();
```

---

## 🔧 Personnalisation

### Ajouter un Nouveau Cookie

```typescript
// Dans /services/CookieService.ts
// Ajoutez dans COOKIES_INFO:

{
  name: 'mon_nouveau_cookie',
  category: 'analytics', // ou 'marketing', 'preferences'
  description: 'Description du cookie',
  expiry: '30 jours',
  provider: 'Mon Service'
}
```

### Modifier les Textes

Les textes sont dans :
- `/components/CookieBanner.tsx` : Bannière
- `/components/CookiePreferences.tsx` : Modal

### Changer les Couleurs

Modifiez les classes Tailwind dans les composants :
- `from-indigo-600 to-purple-600` : Dégradé principal
- `border-indigo-200` : Bordures
- `bg-indigo-50` : Backgrounds clairs

---

## 🐛 Problèmes Connus

### La bannière ne s'affiche pas

**Cause** : Consentement déjà donné  
**Solution** :
```javascript
localStorage.removeItem('feeti_cookie_consent');
// Rafraîchir
```

### Google Analytics ne charge pas

**Vérifications** :
1. `VITE_GA_MEASUREMENT_ID` défini ?
2. Cookies analytics acceptés ?
3. Bloqueur de pub désactivé ?
4. Console : erreurs GA ?

### Modal ne s'ouvre pas

**Vérifications** :
1. `showCookiePreferences` state mis à jour ?
2. Erreurs dans la console ?
3. CSS Tailwind chargé ?

---

## 📖 Documentation Complète

Pour plus de détails :
- **Setup complet** : `/COOKIES_SETUP.md`
- **Architecture** : `/ARCHITECTURE.md`
- **API Integration** : `/API_INTEGRATION_GUIDE.md`

---

## 🎯 Prochaines Étapes

### Configuration Immédiate

1. **Créer `.env.local`** avec vos IDs GA et FB
2. **Tester** en navigation privée
3. **Vérifier** que les cookies sont bien bloqués si refusés

### Configuration Avancée

1. **Ajouter votre propre tracker**
2. **Personnaliser les textes et couleurs**
3. **Ajouter des cookies spécifiques**
4. **Configurer les webhooks de consentement**

### Production

1. **Passer en mode production** (clés API live)
2. **Tester** le comportement complet
3. **Monitorer** les taux d'acceptation
4. **Optimiser** les messages selon les résultats

---

## 📞 Support

Si vous avez des questions ou des problèmes :

1. Consultez `/COOKIES_SETUP.md`
2. Vérifiez les console logs
3. Testez avec les commandes de débogage
4. Contactez le support technique

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Status** : ✅ Production Ready

🎉 **Votre système de cookies est prêt à l'emploi !**

---

## 💡 Tips & Astuces

### Afficher la bannière pour tester

```javascript
CookieService.clearConsent();
window.location.reload();
```

### Simuler un nouvel utilisateur

```javascript
// Ouvrir en navigation privée
// OU
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

### Forcer l'acceptation (dev uniquement)

```javascript
CookieService.acceptAll();
console.log('✅ Tous les cookies acceptés');
```

### Vérifier les cookies actifs

```javascript
const stats = CookieService.getUsageStats();
console.table({
  'Total': stats.totalCookies,
  'Actifs': stats.activeCookies,
  'Essentiels': stats.byCategory.essential,
  'Analytics': stats.byCategory.analytics,
  'Marketing': stats.byCategory.marketing,
  'Préférences': stats.byCategory.preferences
});
```

---

Profitez de votre système de cookies conforme RGPD ! 🍪✨
