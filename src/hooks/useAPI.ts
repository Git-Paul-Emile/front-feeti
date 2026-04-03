// React Hooks pour utiliser les API facilement dans les composants

import { useState, useEffect, useCallback } from 'react';
import { APIResponse } from '../services/api/BaseAPI';

export interface UseAPIOptions {
  immediate?: boolean;
  cacheKey?: string;
}

export interface UseAPIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Hook générique pour les appels API
 */
export function useAPI<T>(
  apiCall: () => Promise<APIResponse<T>>,
  options: UseAPIOptions = {}
) {
  const { immediate = false } = options;

  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    loading: immediate,
    error: null,
    success: false
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiCall();

      if (response.success && response.data !== undefined) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true
        });
        return response.data;
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Une erreur est survenue',
          success: false
        });
        return null;
      }
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.message || 'Une erreur inattendue est survenue',
        success: false
      });
      return null;
    }
  }, [apiCall]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
    refetch: execute
  };
}

/**
 * Hook pour gérer les mutations (POST, PUT, DELETE)
 */
export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<APIResponse<TData>>
) {
  const [state, setState] = useState<UseAPIState<TData>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });

  const mutate = useCallback(
    async (variables: TVariables) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await mutationFn(variables);

        if (response.success && response.data !== undefined) {
          setState({
            data: response.data,
            loading: false,
            error: null,
            success: true
          });
          return { success: true, data: response.data };
        } else {
          setState({
            data: null,
            loading: false,
            error: response.error || 'Une erreur est survenue',
            success: false
          });
          return { success: false, error: response.error };
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Une erreur inattendue est survenue';
        setState({
          data: null,
          loading: false,
          error: errorMessage,
          success: false
        });
        return { success: false, error: errorMessage };
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
  }, []);

  return {
    ...state,
    mutate,
    reset
  };
}

/**
 * Hook pour gérer les requêtes avec polling
 */
export function usePolling<T>(
  apiCall: () => Promise<APIResponse<T>>,
  interval: number = 5000,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;

  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    loading: true,
    error: null,
    success: false
  });

  const fetchData = useCallback(async () => {
    try {
      const response = await apiCall();

      if (response.success && response.data !== undefined) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'Une erreur est survenue'
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Une erreur inattendue est survenue'
      }));
    }
  }, [apiCall]);

  useEffect(() => {
    if (!enabled) return;

    // Première exécution
    fetchData();

    // Polling
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [enabled, fetchData, interval]);

  return {
    ...state,
    refetch: fetchData
  };
}

/**
 * Hook pour gérer le cache local
 */
export function useLocalCache<T>(key: string, ttl: number = 5 * 60 * 1000) {
  const getCache = useCallback((): T | null => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }, [key, ttl]);

  const setCache = useCallback(
    (data: T) => {
      try {
        const cacheData = {
          data,
          timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(cacheData));
      } catch (error) {
        console.error('Error setting cache:', error);
      }
    },
    [key]
  );

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, [key]);

  return {
    getCache,
    setCache,
    clearCache
  };
}

/**
 * Hook pour gérer les requêtes avec dépendances
 */
export function useDependentAPI<T, TDeps extends any[]>(
  apiCall: (...deps: TDeps) => Promise<APIResponse<T>>,
  dependencies: TDeps,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;

  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });

  const execute = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiCall(...dependencies);

      if (response.success && response.data !== undefined) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Une erreur est survenue',
          success: false
        });
      }
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.message || 'Une erreur inattendue est survenue',
        success: false
      });
    }
  }, [enabled, apiCall, ...dependencies]);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    refetch: execute
  };
}
