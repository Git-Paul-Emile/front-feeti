// Hook personnalisé pour la gestion des cookies

import { useState, useEffect } from 'react';
import CookieService, { CookieConsent, CookieCategory } from '../services/CookieService';

export function useCookies() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Charger le consentement initial
    const currentConsent = CookieService.getConsent();
    setConsent(currentConsent);
    setHasConsent(currentConsent !== null);

    // Écouter les changements de consentement
    const handleConsentChange = (event: CustomEvent) => {
      setConsent(event.detail);
      setHasConsent(true);
    };

    const handleConsentClear = () => {
      setConsent(null);
      setHasConsent(false);
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener);
    window.addEventListener('cookieConsentCleared', handleConsentClear);

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener);
      window.removeEventListener('cookieConsentCleared', handleConsentClear);
    };
  }, []);

  return {
    consent,
    hasConsent,
    isAllowed: (category: CookieCategory) => CookieService.isAllowed(category),
    acceptAll: () => CookieService.acceptAll(),
    rejectAll: () => CookieService.rejectAll(),
    clearConsent: () => CookieService.clearConsent(),
    getStats: () => CookieService.getUsageStats()
  };
}
