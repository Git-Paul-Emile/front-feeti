import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface PWAUpdateState {
  needsUpdate: boolean;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  dismiss: () => void;
}

export function usePWAUpdate(): PWAUpdateState {
  const [dismissed, setDismissed] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Vérifie les mises à jour toutes les heures
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn('[PWA] Service Worker registration error:', error);
    },
  });

  const needsUpdate = needRefresh && !dismissed;

  const dismiss = () => setDismissed(true);

  return { needsUpdate, updateServiceWorker, dismiss };
}
