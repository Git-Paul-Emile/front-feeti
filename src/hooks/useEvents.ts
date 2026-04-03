// Hooks spécifiques pour la gestion des événements

import { useCallback, useMemo } from 'react';
import { useAPI, useMutation, useDependentAPI } from './useAPI';
import EventsAPI, { Event, EventFilters } from '../services/api/EventsAPI';

/**
 * Hook pour récupérer tous les événements avec filtres
 */
export function useEvents(filters?: EventFilters) {
  return useAPI(
    () => EventsAPI.getAllEvents(filters),
    { immediate: true }
  );
}

/**
 * Hook pour récupérer un événement par ID
 */
export function useEvent(eventId: string | null) {
  return useDependentAPI(
    (id: string) => EventsAPI.getEventById(id),
    [eventId!],
    { enabled: !!eventId }
  );
}

/**
 * Hook pour créer un événement
 */
export function useCreateEvent() {
  return useMutation<string, Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>(
    (eventData) => EventsAPI.createEvent(eventData)
  );
}

/**
 * Hook pour mettre à jour un événement
 */
export function useUpdateEvent() {
  return useMutation<void, { eventId: string; updates: Partial<Event> }>(
    ({ eventId, updates }) => EventsAPI.updateEvent(eventId, updates)
  );
}

/**
 * Hook pour supprimer un événement
 */
export function useDeleteEvent() {
  return useMutation<void, string>(
    (eventId) => EventsAPI.deleteEvent(eventId)
  );
}

/**
 * Hook pour récupérer les événements live
 */
export function useLiveEvents() {
  return useAPI(
    () => EventsAPI.getLiveEvents(),
    { immediate: true }
  );
}

/**
 * Hook pour récupérer les événements à venir
 */
export function useUpcomingEvents(limit?: number) {
  return useAPI(
    () => EventsAPI.getUpcomingEvents(limit),
    { immediate: true }
  );
}

/**
 * Hook pour rechercher des événements
 */
export function useSearchEvents(query: string) {
  return useDependentAPI(
    (searchQuery: string) => EventsAPI.searchEvents(searchQuery),
    [query],
    { enabled: query.length >= 2 }
  );
}

/**
 * Hook pour récupérer les statistiques des événements
 */
export function useEventStats() {
  return useAPI(
    () => EventsAPI.getEventStats(),
    { immediate: true }
  );
}

/**
 * Hook pour récupérer les événements d'un organisateur
 */
export function useOrganizerEvents(organizerId: string | null) {
  return useDependentAPI(
    (id: string) => EventsAPI.getOrganizerEvents(id),
    [organizerId!],
    { enabled: !!organizerId }
  );
}

/**
 * Hook pour vérifier la disponibilité d'un événement
 */
export function useEventAvailability(eventId: string | null) {
  return useDependentAPI(
    (id: string) => EventsAPI.checkAvailability(id),
    [eventId!],
    { enabled: !!eventId }
  );
}

/**
 * Hook personnalisé avec filtres et tri combinés
 */
export function useEventsWithFilters(filters?: EventFilters, sortBy?: 'date' | 'price' | 'popularity') {
  const { data, loading, error, refetch } = useEvents(filters);

  const sortedEvents = useMemo(() => {
    if (!data) return [];

    const events = [...data];

    switch (sortBy) {
      case 'date':
        return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'price':
        return events.sort((a, b) => a.price - b.price);
      case 'popularity':
        return events.sort((a, b) => b.attendees - a.attendees);
      default:
        return events;
    }
  }, [data, sortBy]);

  return {
    events: sortedEvents,
    loading,
    error,
    refetch
  };
}

/**
 * Hook pour gérer les favoris (avec localStorage)
 */
export function useFavoriteEvents() {
  const getFavorites = useCallback((): string[] => {
    try {
      const favorites = localStorage.getItem('feeti_favorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch {
      return [];
    }
  }, []);

  const addFavorite = useCallback((eventId: string) => {
    const favorites = getFavorites();
    if (!favorites.includes(eventId)) {
      const newFavorites = [...favorites, eventId];
      localStorage.setItem('feeti_favorites', JSON.stringify(newFavorites));
      return true;
    }
    return false;
  }, [getFavorites]);

  const removeFavorite = useCallback((eventId: string) => {
    const favorites = getFavorites();
    const newFavorites = favorites.filter(id => id !== eventId);
    localStorage.setItem('feeti_favorites', JSON.stringify(newFavorites));
    return true;
  }, [getFavorites]);

  const isFavorite = useCallback((eventId: string) => {
    return getFavorites().includes(eventId);
  }, [getFavorites]);

  const toggleFavorite = useCallback((eventId: string) => {
    if (isFavorite(eventId)) {
      removeFavorite(eventId);
      return false;
    } else {
      addFavorite(eventId);
      return true;
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites: getFavorites(),
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite
  };
}
