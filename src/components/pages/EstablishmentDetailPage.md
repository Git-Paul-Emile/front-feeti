# EstablishmentDetailPage

## Description
Page de description détaillée des établissements de loisirs basée sur le design Figma importé "Samba Lodge". Cette page présente les informations complètes d'un établissement avec galerie photos, description, services, et informations de contact.

## Fonctionnalités

### Design Figma Intégré
- Utilise le composant `LoisirsPageDescription` importé de Figma
- Préserve fidèlement le design original avec overlays personnalisés
- Responsive et optimisé pour tous les appareils

### Informations Établissement
- **En-tête avec image hero** : Grande image de présentation
- **Informations essentielles** : Nom, catégorie, note, prix
- **Contact** : Téléphone, email, site web avec liens directs
- **Localisation** : Adresse avec boutons d'action
- **Équipements** : Liste des services disponibles
- **Horaires** : Heures d'ouverture détaillées

### Actions Utilisateur
- **Favoris** : Ajouter/retirer des favoris avec feedback visuel
- **Partage** : Partage natif ou copie de lien
- **Réservation** : Bouton de réservation principal
- **Contact direct** : Liens téléphone, email, site web

### Galerie et Avis
- **Galerie photos** : Images supplémentaires cliquables
- **Avis clients** : Notes et commentaires avec dates
- **Informations pratiques** : Accès, transport, services

## Navigation

### Accès à la page
```typescript
// Depuis LeisurePage
onNavigate('establishment-detail', { establishmentId: 'samba-lodge' })

// Navigation programmatique
handleNavigate('establishment-detail', { establishmentId: id })
```

### Retour
- Bouton retour vers la page Loisirs
- Préserve le contexte de navigation

## Props Interface

```typescript
interface EstablishmentDetailPageProps {
  onBack: () => void;
  establishmentId?: string;
}
```

## État et Interactions

### État local
- `isBookmarked`: Statut favori de l'établissement
- `currentImageIndex`: Index de l'image active dans la galerie

### Callbacks optimisés
- `handleBookmark`: Gestion des favoris avec toast
- `handleShare`: Partage natif ou fallback copie
- `handleContact`: Actions de contact (tel, email, web)
- `handleReservation`: Processus de réservation

## Design System

### Couleurs
- **Primaire** : Indigo (boutons, liens)
- **Secondaire** : Vert (services, équipements)
- **Accent** : Jaune (notes, badges)
- **Erreur** : Rouge (actions importantes)

### Animations
- Transitions fluides sur hover
- Animations d'entrée pour les cartes
- Feedback visuel sur les interactions
- Optimisations performance avec will-change

### Responsive
- **Mobile** : Design empilé, boutons tactiles
- **Tablet** : Layout 2 colonnes
- **Desktop** : Layout pleine largeur avec sidebar

## Intégration App

### Lazy Loading
```typescript
const EstablishmentDetailPage = lazy(() => 
  import('./components/pages/index').then(module => ({ 
    default: module.EstablishmentDetailPage 
  }))
);
```

### Routing App.tsx
```typescript
case 'establishment-detail':
  return (
    <EstablishmentDetailPage
      onBack={() => handleNavigate('leisure')}
      establishmentId={navigationParams?.establishmentId}
    />
  );
```

### Hero Slider
- Inclus dans `pagesWithSlider` pour affichage automatique
- Slider contextualisé selon l'établissement

## Données Mock

### Structure Établissement
```typescript
{
  id: 'samba-lodge',
  name: 'Samba Lodge',
  category: 'Hôtel & Restaurant',
  rating: 4.8,
  reviewCount: 127,
  description: '...',
  address: 'Kingdom Tower, Brazzaville',
  phone: '+242 981-23-19',
  email: 'hello@samba-lodge.com',
  website: 'www.samba-lodge.com',
  amenities: ['WiFi Gratuit', 'Piscine', ...],
  openingHours: {...},
  priceRange: '25 000 - 85 000 FCFA',
  images: [...]
}
```

## Performance

### Optimisations
- Lazy loading des images avec `ImageWithFallback`
- Memoization des callbacks avec `useCallback`
- Minimisation des re-renders
- Gestion mémoire optimisée

### Accessibilité
- Support clavier complet
- Focus states visibles
- Aria labels appropriés
- Contrastes conformes WCAG

## Utilisation

### Navigation depuis Loisirs
1. Page Loisirs affiche les établissements
2. Bouton "Voir les détails" navigue vers EstablishmentDetailPage
3. Affichage du design Figma avec overlays interactifs
4. Actions utilisateur disponibles (favoris, partage, contact)

### Établissement vedette
- Card spéciale dans LeisurePage pour Samba Lodge
- Navigation directe vers la page de détails
- Design différencié pour mettre en valeur

### Extensions futures
- Support multi-établissements via `establishmentId`
- API backend pour données réelles
- Système de réservation intégré
- Géolocalisation et cartes interactives