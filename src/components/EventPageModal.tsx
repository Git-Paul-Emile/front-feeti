import { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import axiosInstance from '../api/axiosConfig';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import './EventPageModal.css';

/** Réponse de GET/PATCH /api/organizer/event-pages/:eventId */
type EventPageConfig = {
  id: string;
  eventId: string;
  slug: string;
  status: 'draft' | 'published' | 'paused' | 'archived';
  showOnMainSite: boolean;
  url: string;
  rootDomain: string;
  canPublish: boolean;
  publicationBlockers: string[];
  event: { id: string; title: string; date: string; time: string; location: string };
};

type SlugCheck = { state: 'idle' | 'checking' | 'ok' | 'error'; message?: string };

const STATUS_LABEL: Record<EventPageConfig['status'], string> = {
  draft: 'Brouillon',
  published: 'En ligne',
  paused: 'En pause (ventes suspendues)',
  archived: 'Archivée',
};

function apiError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { message?: string } } };
  return e.response?.data?.message || fallback;
}

function shareMessage(cfg: EventPageConfig): string {
  const d = new Date(`${cfg.event.date}T12:00:00Z`);
  const date = Number.isNaN(d.getTime())
    ? cfg.event.date
    : new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d);
  return `Je serai à ${cfg.event.title} le ${date} à ${cfg.event.location}. Prends ta place ici : ${cfg.url}`;
}

type Props = { eventId: string | null; onClose: () => void };

export function EventPageModal({ eventId, onClose }: Props) {
  const [cfg, setCfg] = useState<EventPageConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugInput, setSlugInput] = useState('');
  const [slugCheck, setSlugCheck] = useState<SlugCheck>({ state: 'idle' });
  const qrCanvasWrap = useRef<HTMLDivElement>(null);
  const qrSvgWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    setLoading(true);
    setCfg(null);
    axiosInstance
      .get(`/organizer/event-pages/${eventId}`)
      .then((res) => {
        if (cancelled) return;
        setCfg(res.data.data);
        setSlugInput(res.data.data.slug);
        setSlugCheck({ state: 'idle' });
      })
      .catch((err) => !cancelled && toast.error(apiError(err, 'Impossible de charger la page événement')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  // Vérification de disponibilité en direct (debounce 400 ms)
  useEffect(() => {
    if (!cfg || !eventId) return;
    const candidate = slugInput.trim().toLowerCase();
    if (candidate === cfg.slug) {
      setSlugCheck({ state: 'idle' });
      return;
    }
    setSlugCheck({ state: 'checking' });
    const t = setTimeout(() => {
      axiosInstance
        .get('/organizer/event-pages/slug-available', { params: { slug: candidate, eventId } })
        .then((res) => {
          const d = res.data.data as { available: boolean; reason?: string };
          setSlugCheck(d.available ? { state: 'ok', message: 'Disponible' } : { state: 'error', message: d.reason });
        })
        .catch(() => setSlugCheck({ state: 'error', message: 'Vérification impossible' }));
    }, 400);
    return () => clearTimeout(t);
  }, [slugInput, cfg, eventId]);

  const patch = useCallback(
    async (body: Record<string, unknown>, success: string) => {
      if (!eventId) return;
      setSaving(true);
      try {
        const res = await axiosInstance.patch(`/organizer/event-pages/${eventId}`, body);
        setCfg(res.data.data);
        setSlugInput(res.data.data.slug);
        toast.success(success);
      } catch (err) {
        toast.error(apiError(err, 'Enregistrement impossible'));
      } finally {
        setSaving(false);
      }
    },
    [eventId],
  );

  async function openPreview() {
    if (!eventId) return;
    try {
      const res = await axiosInstance.post(`/organizer/event-pages/${eventId}/preview-token`);
      window.open(res.data.data.url, '_blank', 'noopener');
    } catch (err) {
      toast.error(apiError(err, "Impossible de créer le lien d'aperçu"));
    }
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label);
    } catch {
      window.prompt('Copiez ce texte :', text);
    }
  }

  function download(href: string, filename: string) {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();
  }

  function downloadQrPng() {
    const canvas = qrCanvasWrap.current?.querySelector('canvas');
    if (canvas && cfg) download(canvas.toDataURL('image/png'), `qr-${cfg.slug}.png`);
  }

  function downloadQrSvg() {
    const svg = qrSvgWrap.current?.querySelector('svg');
    if (!svg || !cfg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    download(url, `qr-${cfg.slug}.svg`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const message = cfg ? shareMessage(cfg) : '';
  const isOnline = cfg?.status === 'published' || cfg?.status === 'paused';

  return (
    <Dialog open={!!eventId} onOpenChange={(v: boolean) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Page événement</DialogTitle>
        </DialogHeader>

        {loading && <p className="epm-muted">Chargement…</p>}

        {cfg && (
          <div className="epm">
            {/* ── Statut ─────────────────────────────────────────── */}
            <section className="epm-section">
              <div className="epm-row">
                <span className={`epm-status epm-status-${cfg.status}`}>{STATUS_LABEL[cfg.status]}</span>
                <a className="epm-link" href={cfg.url} target="_blank" rel="noopener noreferrer">
                  {cfg.url.replace(/^https?:\/\//, '')}
                </a>
              </div>

              {!cfg.canPublish && cfg.status === 'draft' && (
                <p className="epm-warning">
                  Avant de publier, il manque : {cfg.publicationBlockers.join(', ')}.
                </p>
              )}

              <div className="epm-actions">
                {cfg.status === 'draft' && (
                  <button type="button" className="epm-btn epm-btn-primary" disabled={saving || !cfg.canPublish}
                    onClick={() => patch({ status: 'published' }, 'Page publiée')}>
                    Publier la page
                  </button>
                )}
                {cfg.status === 'published' && (
                  <button type="button" className="epm-btn" disabled={saving}
                    onClick={() => patch({ status: 'paused' }, 'Page mise en pause : ventes suspendues')}>
                    Mettre en pause
                  </button>
                )}
                {cfg.status === 'paused' && (
                  <button type="button" className="epm-btn epm-btn-primary" disabled={saving}
                    onClick={() => patch({ status: 'published' }, 'Ventes réactivées sur la page')}>
                    Reprendre les ventes
                  </button>
                )}
                {isOnline && (
                  <button type="button" className="epm-btn" disabled={saving}
                    onClick={() => patch({ status: 'draft' }, 'Page retirée (brouillon)')}>
                    Dépublier
                  </button>
                )}
                <button type="button" className="epm-btn" onClick={openPreview}>
                  Aperçu privé (24 h)
                </button>
              </div>
            </section>

            {/* ── Lien ───────────────────────────────────────────── */}
            <section className="epm-section">
              <label htmlFor="epm-slug" className="epm-label">Lien de la page</label>
              <div className="epm-slug">
                <input
                  id="epm-slug"
                  className="epm-input"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  maxLength={40}
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby="epm-slug-help"
                />
                <span className="epm-suffix">.{cfg.rootDomain}</span>
              </div>
              <p id="epm-slug-help" className={`epm-help epm-help-${slugCheck.state}`} aria-live="polite">
                {slugCheck.state === 'checking' && 'Vérification…'}
                {slugCheck.state === 'ok' && slugCheck.message}
                {slugCheck.state === 'error' && slugCheck.message}
                {slugCheck.state === 'idle' && '3 à 40 caractères : lettres minuscules, chiffres et tirets. L’ancien lien restera redirigé.'}
              </p>
              <button type="button" className="epm-btn" disabled={saving || slugCheck.state !== 'ok'}
                onClick={() => patch({ slug: slugInput.trim().toLowerCase() }, 'Lien mis à jour')}>
                Enregistrer le lien
              </button>
            </section>

            {/* ── Visibilité ─────────────────────────────────────── */}
            <section className="epm-section">
              <label className="epm-check">
                <input
                  type="checkbox"
                  checked={cfg.showOnMainSite}
                  disabled={saving}
                  onChange={(e) =>
                    patch(
                      { showOnMainSite: e.target.checked },
                      e.target.checked ? 'Événement visible sur Feeti' : 'Événement masqué du site principal',
                    )
                  }
                />
                <span>Afficher aussi sur Feeti (liste des événements du site principal)</span>
              </label>
            </section>

            {/* ── Partage ────────────────────────────────────────── */}
            <section className="epm-section">
              <h3 className="epm-label">Partager</h3>
              {!isOnline && <p className="epm-muted">La page n’est visible qu’une fois publiée.</p>}
              <textarea className="epm-input epm-message" readOnly value={message} rows={3} aria-label="Message prérédigé" />
              <div className="epm-actions">
                <button type="button" className="epm-btn" onClick={() => copy(cfg.url, 'Lien copié')}>Copier le lien</button>
                <a className="epm-btn" target="_blank" rel="noopener noreferrer"
                  href={`https://wa.me/?text=${encodeURIComponent(message)}`}>WhatsApp</a>
                <a className="epm-btn" target="_blank" rel="noopener noreferrer"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cfg.url)}`}>Facebook</a>
                <a className="epm-btn" target="_blank" rel="noopener noreferrer"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(message.replace(cfg.url, '').trim())}&url=${encodeURIComponent(cfg.url)}`}>X</a>
                <button type="button" className="epm-btn" onClick={() => copy(message, 'Légende copiée : collez-la dans Instagram')}>
                  Instagram (copier la légende)
                </button>
              </div>
            </section>

            {/* ── QR code ────────────────────────────────────────── */}
            <section className="epm-section epm-qr">
              <div ref={qrSvgWrap} className="epm-qr-box">
                <QRCodeSVG value={cfg.url} size={160} level="M" marginSize={2} title={`QR code vers ${cfg.url}`} />
              </div>
              {/* Version haute définition pour le téléchargement PNG */}
              <div ref={qrCanvasWrap} hidden>
                <QRCodeCanvas value={cfg.url} size={1024} level="M" marginSize={4} />
              </div>
              <div className="epm-actions epm-actions-col">
                <p className="epm-muted">À imprimer sur vos affiches et flyers.</p>
                <button type="button" className="epm-btn" onClick={downloadQrPng}>Télécharger le QR (PNG)</button>
                <button type="button" className="epm-btn" onClick={downloadQrSvg}>Télécharger le QR (SVG)</button>
              </div>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EventPageModal;
