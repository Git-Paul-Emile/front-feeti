import { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import svgPaths from '../imports/svg-12mm8ldurx';

const SCROLL_THRESHOLD = 300; // px avant d'afficher sur Android
const IOS_DELAY_MS    = 3000; // délai avant d'afficher sur iOS (pas de scroll nécessaire)

function FeetiMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 73 69" fill="none">
      <path d={svgPaths.p121ed80}  fill="white" />
      <path d={svgPaths.p3cd33800} fill="#811AEC" />
      <path d={svgPaths.p3cb18100} fill="#F1C519" />
      <path d={svgPaths.p5e42700}  fill="#E43962" />
      <path d={svgPaths.p2c04e100} fill="#16BDA0" />
      <path d={svgPaths.p16f13700} fill="#811AEC" />
      <path d={svgPaths.p3276d900} fill="#F1C519" />
      <path d={svgPaths.p381ee072} fill="#E43962" />
      <path d={svgPaths.p1d65a100} fill="#16BDA0" />
    </svg>
  );
}

function IOSGuide({ isIPad, onClose }: { isIPad: boolean; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl"
        style={{ background: '#120820' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#811AEC] flex items-center justify-center">
            <FeetiMark size={28} />
          </div>
          <div>
            <p className="font-bold text-white text-base">Installer Fééti</p>
            <p className="text-white/50 text-xs">Accédez à vos billets depuis l'écran d'accueil</p>
          </div>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-4 rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="shrink-0 w-9 h-9 rounded-xl bg-[#811AEC]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#811AEC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">1. Appuyez sur Partager</p>
              <p className="text-white/40 text-xs mt-0.5">
                {isIPad ? 'Bouton en haut à droite de Safari' : 'Bouton en bas de Safari'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="shrink-0 w-9 h-9 rounded-xl bg-[#16BDA0]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#16BDA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">2. Sur l'écran d'accueil</p>
              <p className="text-white/40 text-xs mt-0.5">Faites défiler et sélectionnez cette option</p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #811AEC, #E43962)' }}
        >
          Compris
        </button>
      </div>
    </div>
  );
}

export function PWAInstallBanner() {
  const { canInstall, isIOS, isIPad, install, dismiss } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!canInstall) return;

    if (isIOS) {
      // Sur iOS on n'a pas de beforeinstallprompt — on affiche après un court délai
      const t = setTimeout(() => setVisible(true), IOS_DELAY_MS);
      return () => clearTimeout(t);
    } else {
      // Sur Android/desktop : afficher après scroll
      const onScroll = () => setVisible(window.scrollY >= SCROLL_THRESHOLD);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener('scroll', onScroll);
    }
  }, [canInstall, isIOS]);

  if (!canInstall) return null;

  const handleInstall = async () => {
    if (isIOS) { setShowIOSGuide(true); return; }
    setInstalling(true);
    const outcome = await install();
    if (outcome !== 'accepted') setInstalling(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    dismiss();
  };

  return (
    <>
      <div
        role="banner"
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: '#120820',
          borderBottom: '1px solid rgba(129,26,236,0.3)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          paddingTop: 'env(safe-area-inset-top)',
          transform: visible ? 'translateY(0)' : 'translateY(-110%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-2.5 max-w-2xl mx-auto">
          <div
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #811AEC, #5a12a8)' }}
          >
            <FeetiMark size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight">Fééti</p>
            <p className="text-white/60 text-xs leading-tight truncate">
              {isIOS
                ? 'Installez l\'app pour accéder à vos billets hors-ligne.'
                : 'Accédez à vos billets même sans connexion.'}
            </p>
          </div>
          <button
            onClick={handleInstall}
            disabled={installing}
            className="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: installing ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #811AEC, #E43962)',
              color: '#fff',
              boxShadow: installing ? 'none' : '0 2px 12px rgba(129,26,236,0.5)',
              opacity: installing ? 0.7 : 1,
            }}
          >
            {installing ? 'En cours…' : 'Installer'}
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Fermer"
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {showIOSGuide && (
        <IOSGuide
          isIPad={isIPad}
          onClose={() => { setShowIOSGuide(false); handleDismiss(); }}
        />
      )}
    </>
  );
}
