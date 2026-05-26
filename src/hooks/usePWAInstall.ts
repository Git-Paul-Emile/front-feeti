import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

interface PWAInstallState {
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isIPad: boolean;
  install: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  dismiss: () => void;
}

const DISMISSED_KEY = 'feeti_pwa_install_dismissed';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;
    return Date.now() - parseInt(raw, 10) < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

function isRunningStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function detectIPad(): boolean {
  // iPad iOS < 13
  if (/ipad/i.test(navigator.userAgent)) return true;
  // iPad iOS 13+ reports as "Macintosh" but has touch
  if (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1) return true;
  return false;
}

function detectIOS(): boolean {
  if (/iphone|ipod/i.test(navigator.userAgent)) return true;
  return detectIPad();
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isRunningStandalone);
  const [dismissed, setDismissed] = useState(isDismissed);
  const isIOS = detectIOS();
  const isIPad = detectIPad();

  useEffect(() => {
    if (isRunningStandalone()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => setIsInstalled(true);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const install = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome;
  };

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    } catch { /* storage unavailable */ }
    setDismissed(true);
    setDeferredPrompt(null);
  };

  const canInstall = !isInstalled && !dismissed && (!!deferredPrompt || isIOS);

  return { canInstall, isInstalled, isIOS, isIPad, install, dismiss };
}
