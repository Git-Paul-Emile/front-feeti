// Source de vérité unique pour les catégories d'événements
// Utilisée dans tous les formulaires et le seed

export const EVENT_CATEGORIES = [
  'Musique',
  'Concert',
  'Festival',
  'Jazz',
  'Théâtre',
  'Art & Culture',
  'Danse',
  'Cinéma',
  'Sport',
  'Compétition',
  'Conférence',
  'Formation',
  'Forum',
  'Tech',
  'Gastronomie',
  'Humour',
  'Soirée',
  'Culte',
  'Autre',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
