// Service de gestion des cookies pour Feeti
// Conforme RGPD avec stockage local des préférences

export type CookieCategory = 'essential' | 'analytics' | 'marketing' | 'preferences';

export interface CookieConsent {
  essential: boolean;        // Toujours true (obligatoire)
  analytics: boolean;        // Google Analytics, mesures d'audience
  marketing: boolean;        // Publicités, tracking tiers
  preferences: boolean;      // Préférences utilisateur, personnalisation
  timestamp: number;         // Date du consentement
  version: string;           // Version de la politique
}

export interface CookieInfo {
  name: string;
  category: CookieCategory;
  description: string;
  expiry: string;
  provider: string;
}

class CookieServiceClass {
  private readonly STORAGE_KEY = 'feeti_cookie_consent';
  private readonly CONSENT_VERSION = '1.0';
  private readonly CONSENT_EXPIRY_DAYS = 365;

  // Liste des cookies utilisés par l'application
  private readonly COOKIES_INFO: CookieInfo[] = [
    {
      name: 'feeti_session',
      category: 'essential',
      description: 'Maintient votre session active et sécurise votre connexion',
      expiry: 'Session',
      provider: 'Feeti'
    },
    {
      name: 'feeti_user_prefs',
      category: 'essential',
      description: 'Stocke vos préférences de langue et d\'affichage',
      expiry: '1 an',
      provider: 'Feeti'
    },
    {
      name: 'feeti_cookie_consent',
      category: 'essential',
      description: 'Enregistre vos choix concernant les cookies',
      expiry: '1 an',
      provider: 'Feeti'
    },
    {
      name: '_ga',
      category: 'analytics',
      description: 'Google Analytics - Mesure d\'audience et comportement des visiteurs',
      expiry: '2 ans',
      provider: 'Google'
    },
    {
      name: '_gid',
      category: 'analytics',
      description: 'Google Analytics - Distingue les utilisateurs',
      expiry: '24 heures',
      provider: 'Google'
    },
    {
      name: '_gat',
      category: 'analytics',
      description: 'Google Analytics - Limitation du taux de requêtes',
      expiry: '1 minute',
      provider: 'Google'
    },
    {
      name: 'fbp',
      category: 'marketing',
      description: 'Facebook Pixel - Publicités ciblées',
      expiry: '3 mois',
      provider: 'Facebook'
    },
    {
      name: '_fbp',
      category: 'marketing',
      description: 'Facebook - Suivi des conversions publicitaires',
      expiry: '3 mois',
      provider: 'Facebook'
    },
    {
      name: 'feeti_theme',
      category: 'preferences',
      description: 'Mémorise votre préférence de thème (clair/sombre)',
      expiry: '1 an',
      provider: 'Feeti'
    },
    {
      name: 'feeti_country',
      category: 'preferences',
      description: 'Mémorise votre pays sélectionné',
      expiry: '1 an',
      provider: 'Feeti'
    }
  ];

  /**
   * Récupérer le consentement actuel
   */
  getConsent(): CookieConsent | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const consent = JSON.parse(stored) as CookieConsent;
      
      // Vérifier si le consentement est expiré (1 an)
      const consentDate = new Date(consent.timestamp);
      const expiryDate = new Date(consentDate.getTime() + (this.CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
      
      if (new Date() > expiryDate) {
        // Consentement expiré
        this.clearConsent();
        return null;
      }

      // Vérifier la version
      if (consent.version !== this.CONSENT_VERSION) {
        // Version différente, redemander le consentement
        this.clearConsent();
        return null;
      }

      return consent;
    } catch (error) {
      console.error('Erreur lecture consentement cookies:', error);
      return null;
    }
  }

  /**
   * Sauvegarder le consentement
   */
  saveConsent(consent: Omit<CookieConsent, 'timestamp' | 'version' | 'essential'>): void {
    const fullConsent: CookieConsent = {
      essential: true, // Toujours true
      ...consent,
      timestamp: Date.now(),
      version: this.CONSENT_VERSION
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(fullConsent));
      
      // Appliquer les préférences immédiatement
      this.applyConsent(fullConsent);
      
      // Émettre un événement personnalisé
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: fullConsent }));
    } catch (error) {
      console.error('Erreur sauvegarde consentement cookies:', error);
    }
  }

  /**
   * Accepter tous les cookies
   */
  acceptAll(): void {
    this.saveConsent({
      analytics: true,
      marketing: true,
      preferences: true
    });
  }

  /**
   * Refuser tous les cookies non essentiels
   */
  rejectAll(): void {
    this.saveConsent({
      analytics: false,
      marketing: false,
      preferences: false
    });
  }

  /**
   * Effacer le consentement
   */
  clearConsent(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      
      // Désactiver tous les tracking
      this.disableAllTracking();
      
      window.dispatchEvent(new CustomEvent('cookieConsentCleared'));
    } catch (error) {
      console.error('Erreur suppression consentement:', error);
    }
  }

  /**
   * Vérifier si une catégorie est acceptée
   */
  isAllowed(category: CookieCategory): boolean {
    if (category === 'essential') return true;
    
    const consent = this.getConsent();
    if (!consent) return false;

    return consent[category] === true;
  }

  /**
   * Obtenir toutes les informations sur les cookies
   */
  getCookiesInfo(): CookieInfo[] {
    return this.COOKIES_INFO;
  }

  /**
   * Obtenir les cookies par catégorie
   */
  getCookiesByCategory(category: CookieCategory): CookieInfo[] {
    return this.COOKIES_INFO.filter(cookie => cookie.category === category);
  }

  /**
   * Appliquer le consentement (activer/désactiver les services)
   */
  private applyConsent(consent: CookieConsent): void {
    // Analytics (Google Analytics)
    if (consent.analytics) {
      this.enableGoogleAnalytics();
    } else {
      this.disableGoogleAnalytics();
    }

    // Marketing
    if (consent.marketing) {
      this.enableMarketing();
    } else {
      this.disableMarketing();
    }

    // Préférences
    if (!consent.preferences) {
      this.clearPreferencesCookies();
    }
  }

  /**
   * Activer Google Analytics
   */
  private enableGoogleAnalytics(): void {
    if (typeof window === 'undefined') return;

    // Vérifier si GA est déjà chargé
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
      return;
    }

    // Charger Google Analytics
    const GA_MEASUREMENT_ID = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID 
      ? import.meta.env.VITE_GA_MEASUREMENT_ID 
      : null;
    if (!GA_MEASUREMENT_ID) return;

    // Script Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Configuration GA
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      'anonymize_ip': true,
      'cookie_flags': 'SameSite=None;Secure'
    });

    console.log('✅ Google Analytics activé');
  }

  /**
   * Désactiver Google Analytics
   */
  private disableGoogleAnalytics(): void {
    if (typeof window === 'undefined') return;

    // Désactiver GA
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }

    // Supprimer les cookies GA
    this.deleteCookie('_ga');
    this.deleteCookie('_gid');
    this.deleteCookie('_gat');
    const GA_ID = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID 
      ? import.meta.env.VITE_GA_MEASUREMENT_ID 
      : '';
    if (GA_ID) {
      this.deleteCookie('_gat_gtag_' + GA_ID);
    }

    console.log('❌ Google Analytics désactivé');
  }

  /**
   * Activer Marketing (Facebook Pixel, etc.)
   */
  private enableMarketing(): void {
    if (typeof window === 'undefined') return;

    const FB_PIXEL_ID = typeof import.meta !== 'undefined' && import.meta.env?.VITE_FB_PIXEL_ID 
      ? import.meta.env.VITE_FB_PIXEL_ID 
      : null;
    if (!FB_PIXEL_ID) return;

    // Charger Facebook Pixel
    if (!window.fbq) {
      (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', FB_PIXEL_ID);
      window.fbq('track', 'PageView');

      console.log('✅ Facebook Pixel activé');
    }
  }

  /**
   * Désactiver Marketing
   */
  private disableMarketing(): void {
    // Supprimer les cookies marketing
    this.deleteCookie('fbp');
    this.deleteCookie('_fbp');

    console.log('❌ Marketing désactivé');
  }

  /**
   * Supprimer les cookies de préférences
   */
  private clearPreferencesCookies(): void {
    this.deleteCookie('feeti_theme');
    this.deleteCookie('feeti_country');
  }

  /**
   * Désactiver tous les tracking
   */
  private disableAllTracking(): void {
    this.disableGoogleAnalytics();
    this.disableMarketing();
    this.clearPreferencesCookies();
  }

  /**
   * Supprimer un cookie
   */
  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
  }

  /**
   * Obtenir les statistiques d'utilisation
   */
  getUsageStats(): {
    totalCookies: number;
    activeCookies: number;
    byCategory: Record<CookieCategory, number>;
  } {
    const consent = this.getConsent();
    
    const stats = {
      totalCookies: this.COOKIES_INFO.length,
      activeCookies: 0,
      byCategory: {
        essential: 0,
        analytics: 0,
        marketing: 0,
        preferences: 0
      } as Record<CookieCategory, number>
    };

    this.COOKIES_INFO.forEach(cookie => {
      if (cookie.category === 'essential' || (consent && consent[cookie.category])) {
        stats.activeCookies++;
        stats.byCategory[cookie.category]++;
      }
    });

    return stats;
  }
}

// Type augmentation pour Window
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

// Export singleton
const CookieService = new CookieServiceClass();
export default CookieService;
