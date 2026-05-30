/**
 * PromoteEventModal — Flow self-service de promotion d'un événement
 * Étapes : sélection pack → paiement simulé → confirmation
 */
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import PromotionAPI, { type PackConfig } from '../services/api/PromotionAPI';
import { toast } from 'sonner';

interface PromoteEventModalProps {
  open: boolean;
  onClose: () => void;
  event: { id: string; title: string };
  onSuccess?: () => void;
}

type Step = 'select' | 'payment' | 'confirmed';

// Couleurs et labels visuels par pack (sans icône)
const PACK_STYLE: Record<string, { border: string; header: string; badge: string; label: string }> = {
  OR:     { border: 'border-amber-400',  header: 'bg-amber-50',   badge: 'bg-amber-100 text-amber-800',  label: 'Pack OR' },
  ARGENT: { border: 'border-slate-400',  header: 'bg-slate-50',   badge: 'bg-slate-100 text-slate-700',  label: 'Pack ARGENT' },
  BRONZE: { border: 'border-orange-400', header: 'bg-orange-50',  badge: 'bg-orange-100 text-orange-800', label: 'Pack BRONZE' },
  LITE:   { border: 'border-blue-400',   header: 'bg-blue-50',    badge: 'bg-blue-100 text-blue-700',    label: 'Pack LITE' },
};

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency;
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function PromoteEventModal({ open, onClose, event, onSuccess }: PromoteEventModalProps) {
  const [step, setStep] = useState<Step>('select');
  const [configs, setConfigs] = useState<PackConfig[]>([]);
  const [selected, setSelected] = useState<PackConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<{
    packType: string; pricePaid: number; currency: string;
    promotionStartDate: string; promotionEndDate: string; durationDays: number;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setStep('select');
      setSelected(null);
      setConfirmed(null);
      PromotionAPI.getPackConfigs()
        .then(setConfigs)
        .catch(() => toast.error('Impossible de charger les packs'));
    }
  }, [open]);

  const handleSelect = (cfg: PackConfig) => {
    if (cfg.slots.available === 0) return; // slot plein : non sélectionnable
    setSelected(cfg);
  };

  const handlePay = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const result = await PromotionAPI.purchasePromotion(event.id, selected.type);
      setConfirmed(result);
      setStep('confirmed');
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erreur lors de l\'activation';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const style = selected ? PACK_STYLE[selected.type] : null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {step === 'select' && 'Mettre en avant : ' + event.title}
            {step === 'payment' && 'Récapitulatif & Paiement'}
            {step === 'confirmed' && 'Promotion activée'}
          </DialogTitle>
        </DialogHeader>

        {/* ── ÉTAPE 1 : Sélection du pack ── */}
        {step === 'select' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Choisissez un pack pour mettre en avant votre événement sur la plateforme Feeti.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {configs.map(cfg => {
                const s = PACK_STYLE[cfg.type];
                const isFull = cfg.slots.available === 0;
                const isSelected = selected?.type === cfg.type;

                return (
                  <button
                    key={cfg.type}
                    onClick={() => handleSelect(cfg)}
                    disabled={isFull}
                    className={[
                      'text-left rounded-xl border-2 transition-all duration-150 overflow-hidden',
                      isFull ? 'opacity-50 cursor-not-allowed border-gray-200' : 'cursor-pointer hover:shadow-md',
                      isSelected ? s?.border + ' shadow-md' : 'border-gray-200',
                    ].join(' ')}
                  >
                    {/* En-tête pack */}
                    <div className={['px-4 py-3', s?.header].join(' ')}>
                      <div className="flex items-center justify-between">
                        <span className={['text-xs font-semibold px-2 py-0.5 rounded-full', s?.badge].join(' ')}>
                          {s?.label}
                        </span>
                        {isFull && (
                          <span className="text-xs text-red-600 font-medium">Complet</span>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(cfg.price, cfg.currency)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">/ {cfg.durationDays} jours</span>
                      </div>
                    </div>

                    {/* Corps */}
                    <div className="px-4 py-3 bg-white">
                      <p className="text-xs text-gray-600 mb-3 leading-relaxed">{cfg.description}</p>
                      <ul className="space-y-1">
                        {cfg.advantages.map((adv, i) => (
                          <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Slots */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {isFull ? (
                          <SlotFullMessage packType={cfg.type} />
                        ) : (
                          <span className="text-xs text-gray-400">
                            {cfg.slots.available === 9999 ? 'Places illimitées' : `${cfg.slots.available} place${cfg.slots.available > 1 ? 's' : ''} disponible${cfg.slots.available > 1 ? 's' : ''}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose}>Annuler</Button>
              <Button
                disabled={!selected}
                onClick={() => setStep('payment')}
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : Paiement simulé ── */}
        {step === 'payment' && selected && style && (
          <div className="space-y-5">
            <div className={['rounded-xl border-2 p-5', style.border].join(' ')}>
              <div className="flex items-center justify-between mb-4">
                <span className={['text-sm font-semibold px-3 py-1 rounded-full', style.badge].join(' ')}>
                  {style.label}
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(selected.price, selected.currency)}
                </span>
              </div>

              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Événement</span>
                  <span className="font-medium truncate max-w-[200px]">{event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Durée</span>
                  <span>{selected.durationDays} jours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Paiement</span>
                  <span className="text-amber-600 font-medium">Simulation (test)</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Le paiement réel sera intégré ultérieurement. Cette simulation active immédiatement le pack.
                </p>
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => setStep('select')}>Retour</Button>
              <Button
                onClick={handlePay}
                disabled={loading}
                className="min-w-[160px]"
              >
                {loading ? 'Activation en cours...' : `Simuler le paiement — ${formatPrice(selected.price, selected.currency)}`}
              </Button>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : Confirmation ── */}
        {step === 'confirmed' && confirmed && (
          <div className="text-center space-y-5 py-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <span className="text-2xl">✓</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Pack activé avec succès</h3>
              <p className="text-sm text-gray-500">
                Votre événement est maintenant mis en avant sur Feeti.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Pack</span>
                <span className="font-semibold">{PACK_STYLE[confirmed.packType]?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Montant</span>
                <span>{formatPrice(confirmed.pricePaid, confirmed.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Début</span>
                <span>{formatDate(confirmed.promotionStartDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fin</span>
                <span>{formatDate(confirmed.promotionEndDate)}</span>
              </div>
            </div>

            <Button onClick={onClose} className="w-full">Fermer</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Affiche la date de prochaine libération de slot */
function SlotFullMessage({ packType }: { packType: string }) {
  const [info, setInfo] = useState<{ daysUntilRelease: number | null } | null>(null);

  useEffect(() => {
    PromotionAPI.getNextSlotRelease(packType)
      .then(setInfo)
      .catch(() => {});
  }, [packType]);

  if (!info) return <span className="text-xs text-gray-400">Calcul en cours...</span>;

  return (
    <span className="text-xs text-red-600 font-medium">
      {info.daysUntilRelease
        ? `Disponible dans ${info.daysUntilRelease} jour${info.daysUntilRelease > 1 ? 's' : ''}`
        : 'Complet — contactez le support'}
    </span>
  );
}
