import { useCallback, useMemo } from 'react';
import { useAPI, useMutation, useDependentAPI } from './useAPI';
import { backendGateway } from '../services/backend';
import type { Event, EventFilters } from '../services/api/EventsAPI';

export function useEvents(filters?: EventFilters) {
  return useAPI(
    () => backendGateway.events.getAllEvents(filters),
    { immediate: true }
  );
}

export function useEvent(eventId: string | null) {
  return useDependentAPI(
    (id: string) => backendGateway.events.getEventById(id),
    [eventId!],
    { enabled: !!eventId }
  );
}

export function useCreateEvent() {
  return useMutation<string, Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>(
    (eventData) => backendGateway.events.createEvent(eventData)
  );
}

export function useUpdateEvent() {
  return useMutation<void, { eventId: string; updates: Partial<Event> }>(
    ({ eventId, updates }) => backendGateway.events.updateEvent(eventId, updates)
  );
}

export function useDeleteEvent() {
  return useMutation<void, string>(
    (eventId) => backendGateway.events.deleteEvent(eventId)
  );
}

export function useLiveEvents() {
  return useAPI(
    () => backendGateway.events.getLiveEvents(),
    { immediate: true }
  );
}

export function useUpcomingEvents(limit?: number) {
  return useAPI(
    () => backendGateway.events.getUpcomingEvents(limit),
    { immediate: true }
  );
}

export function useSearchEvents(query: string) {
  return useDependentAPI(
    (searchQuery: string) => backendGateway.events.searchEvents(searchQuery),
    [query],
    { enabled: query.length >= 2 }
  );
}

export function useEventStats() {
  return useAPI(
    () => backendGateway.events.getEventStats(),
    { immediate: true }
  );
}

export function useOrganizerEvents(organizerId: string | null) {
  return useDependentAPI(
    (id: string) => backendGateway.events.getOrganizerEvents(id),
    [organizerId!],
    { enabled: !!organizerId }
  );
}

export function useEventAvailability(eventId: string | null) {
  return useDependentAPI(
    (id: string) => backendGateway.events.checkAvailability(id),
    [eventId!],
    { enabled: !!eventId }
  );
}

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
