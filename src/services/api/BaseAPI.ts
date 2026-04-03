// Base API Service pour Feeti
// Gestion centralisée des appels API avec retry, cache et error handling

import { toast } from 'sonner@2.0.3';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface APIConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheDuration?: number;
}

class BaseAPIService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  
  private config: APIConfig = {
    timeout: 30000,
    retries: 3,
    cache: true,
    cacheDuration: 5 * 60 * 1000 // 5 minutes
  };

  constructor(config?: Partial<APIConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Gestion du cache
   */
  private getCachedData<T>(key: string): T | null {
    if (!this.config.cache) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.timestamp > (this.config.cacheDuration || 0);

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCachedData<T>(key: string, data: T): void {
    if (!this.config.cache) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Invalidation du cache
   */
  public invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Gestion des requêtes en cours (évite les duplicatas)
   */
  private async deduplicateRequest<T>(
    key: string,
    request: () => Promise<T>
  ): Promise<T> {
    // Si une requête identique est en cours, on attend son résultat
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // Sinon, on lance la requête et on la stocke
    const promise = request()
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Retry logic avec backoff exponentiel
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    retries: number = this.config.retries || 3
  ): Promise<T> {
    let lastError: any;

    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Ne pas retry sur certaines erreurs
        if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
          throw error;
        }

        // Attendre avant de réessayer (backoff exponentiel)
        if (i < retries - 1) {
          const delay = Math.min(1000 * Math.pow(2, i), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Timeout wrapper
   */
  private withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = this.config.timeout || 30000
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      )
    ]);
  }

  /**
   * Méthode principale pour les requêtes
   */
  protected async request<T>(
    key: string,
    requestFn: () => Promise<T>,
    options?: {
      cache?: boolean;
      retry?: boolean;
      timeout?: number;
      deduplicate?: boolean;
    }
  ): Promise<APIResponse<T>> {
    const opts = {
      cache: options?.cache ?? this.config.cache,
      retry: options?.retry ?? true,
      timeout: options?.timeout ?? this.config.timeout,
      deduplicate: options?.deduplicate ?? true
    };

    try {
      // Vérifier le cache
      if (opts.cache) {
        const cached = this.getCachedData<T>(key);
        if (cached) {
          return { success: true, data: cached };
        }
      }

      // Exécuter la requête
      const executeFn = async () => {
        let promise = requestFn();

        if (opts.timeout) {
          promise = this.withTimeout(promise, opts.timeout);
        }

        if (opts.retry) {
          return this.withRetry(() => promise);
        }

        return promise;
      };

      // Dédupliquer si nécessaire
      const data = opts.deduplicate
        ? await this.deduplicateRequest(key, executeFn)
        : await executeFn();

      // Mettre en cache
      if (opts.cache) {
        this.setCachedData(key, data);
      }

      return { success: true, data };
    } catch (error: any) {
      console.error(`API Error [${key}]:`, error);

      const errorMessage = this.getErrorMessage(error);
      const errorCode = error.code || 'unknown_error';

      return {
        success: false,
        error: errorMessage,
        code: errorCode
      };
    }
  }

  /**
   * Transformation des erreurs en messages lisibles
   */
  private getErrorMessage(error: any): string {
    // Erreurs Firebase
    if (error.code) {
      const firebaseErrors: Record<string, string> = {
        'permission-denied': 'Vous n\'avez pas les permissions nécessaires',
        'unauthenticated': 'Veuillez vous connecter pour continuer',
        'not-found': 'Ressource introuvable',
        'already-exists': 'Cette ressource existe déjà',
        'failed-precondition': 'Opération non autorisée dans l\'état actuel',
        'cancelled': 'Opération annulée',
        'data-loss': 'Perte de données détectée',
        'deadline-exceeded': 'Délai d\'attente dépassé',
        'resource-exhausted': 'Quota dépassé',
        'aborted': 'Opération interrompue',
        'out-of-range': 'Valeur hors limites',
        'internal': 'Erreur interne du serveur',
        'unavailable': 'Service temporairement indisponible'
      };

      return firebaseErrors[error.code] || error.message || 'Une erreur est survenue';
    }

    // Erreurs réseau
    if (error.message === 'Request timeout') {
      return 'La requête a pris trop de temps. Veuillez réessayer.';
    }

    if (error.message?.includes('network')) {
      return 'Erreur de connexion. Vérifiez votre connexion internet.';
    }

    return error.message || 'Une erreur inattendue est survenue';
  }

  /**
   * Afficher une notification toast
   */
  protected showToast(
    type: 'success' | 'error' | 'info' | 'warning',
    message: string
  ): void {
    toast[type](message);
  }

  /**
   * Méthodes utilitaires
   */
  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheSize(): number {
    return this.cache.size;
  }

  public getPendingRequestsCount(): number {
    return this.pendingRequests.size;
  }
}

export default BaseAPIService;
