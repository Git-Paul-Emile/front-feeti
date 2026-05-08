import { usePWAUpdate } from '../hooks/usePWAUpdate';
import svgPaths from '../imports/svg-12mm8ldurx';

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

export function PWAUpdateNotification() {
  const { needsUpdate, updateServiceWorker, dismiss } = usePWAUpdate();
  if (!needsUpdate) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: '#120820',
        borderBottom: '1px solid rgba(241,197,25,0.3)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="flex items-center gap-3 px-4 py-2.5 max-w-2xl mx-auto">

        {/* Logo Fééti */}
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #811AEC, #5a12a8)' }}
        >
          <FeetiMark size={24} />
        </div>

        {/* Texte */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm leading-tight">Fééti</p>
          <p className="text-white/60 text-xs leading-tight">
            Une nouvelle version est disponible.
          </p>
        </div>

        {/* Bouton mettre à jour */}
        <button
          onClick={() => updateServiceWorker(true)}
          className="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold"
          style={{
            background: '#F1C519',
            color: '#0f0f1a',
            boxShadow: '0 2px 12px rgba(241,197,25,0.4)',
          }}
        >
          Mettre à jour
        </button>

        {/* Fermer */}
        <button
          onClick={dismiss}
          aria-label="Ignorer"
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-colors"
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
  );
}
