import type { PromotionType } from '../services/api/EventsBackendAPI';
import type { LeisureOfferType, LeisurePackType } from '../services/api/LeisureAPI';

// ── Configuration des badges événements ──────────────────────────────────────

const EVENT_BADGE_CONFIG: Record<PromotionType, {
  label: string;
  bg: string;
  text: string;
  border: string;
}> = {
  OR: {
    label: 'Événement Premium',
    bg: 'bg-gradient-to-r from-yellow-400 to-amber-500',
    text: 'text-white',
    border: 'border-yellow-300',
  },
  ARGENT: {
    label: 'Événement recommandé',
    bg: 'bg-gradient-to-r from-slate-300 to-slate-400',
    text: 'text-slate-900',
    border: 'border-slate-200',
  },
  BRONZE: {
    label: 'Événement en vedette',
    bg: 'bg-gradient-to-r from-orange-400 to-amber-600',
    text: 'text-white',
    border: 'border-orange-300',
  },
  LITE: {
    label: 'Sponsorisé',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
};

// ── Configuration des badges loisirs (offre annuaire) ────────────────────────

const LEISURE_OFFER_CONFIG: Record<LeisureOfferType, {
  label: string;
  bg: string;
  text: string;
}> = {
  PREMIUM: {
    label: 'Top établissement',
    bg: 'bg-gradient-to-r from-yellow-400 to-amber-500',
    text: 'text-white',
  },
  PRO: {
    label: 'Établissement recommandé',
    bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    text: 'text-white',
  },
  BASIC: {
    label: 'Annuaire',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
  },
};

// ── Configuration des badges loisirs (pack ponctuel) ─────────────────────────

const LEISURE_PACK_CONFIG: Record<LeisurePackType, {
  label: string;
  bg: string;
  text: string;
}> = {
  CAMPAGNE_PREMIUM: {
    label: 'Campagne Premium',
    bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
    text: 'text-white',
  },
  BOOST: {
    label: 'Boost',
    bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    text: 'text-white',
  },
  VISIBILITE_ACCUEIL: {
    label: 'Visibilité Accueil',
    bg: 'bg-gradient-to-r from-teal-400 to-cyan-500',
    text: 'text-white',
  },
};

// ── Composants ────────────────────────────────────────────────────────────────

interface EventPromotionBadgeProps {
  promotionType: PromotionType;
  size?: 'sm' | 'md';
}

export function EventPromotionBadge({ promotionType, size = 'sm' }: EventPromotionBadgeProps) {
  const config = EVENT_BADGE_CONFIG[promotionType];
  if (!config) return null;

  const padding = size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold shadow-md ${config.bg} ${config.text} ${padding}`}
    >
      {config.label}
    </span>
  );
}

interface LeisurePromotionBadgeProps {
  offerType?: LeisureOfferType | null;
  packType?: LeisurePackType | null;
  packStatus?: string | null;
  size?: 'sm' | 'md';
}

export function LeisurePromotionBadge({ offerType, packType, packStatus, size = 'sm' }: LeisurePromotionBadgeProps) {
  const padding = size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs';

  // Le pack ponctuel actif est prioritaire sur l'offre annuaire
  if (packType && packStatus === 'active') {
    const config = LEISURE_PACK_CONFIG[packType];
    if (config) {
      return (
        <span className={`inline-flex items-center rounded-full font-semibold shadow-md ${config.bg} ${config.text} ${padding}`}>
          {config.label}
        </span>
      );
    }
  }

  if (offerType && offerType !== 'BASIC') {
    const config = LEISURE_OFFER_CONFIG[offerType];
    if (config) {
      return (
        <span className={`inline-flex items-center rounded-full font-semibold shadow-md ${config.bg} ${config.text} ${padding}`}>
          {config.label}
        </span>
      );
    }
  }

  return null;
}

// Helper: est-ce qu'un événement a une promotion active ?
export function isEventPromotionActive(event: {
  promotionType?: string | null;
  promotionStatus?: string | null;
  promotionStartDate?: string | null;
  promotionEndDate?: string | null;
}): boolean {
  if (!event.promotionType || event.promotionStatus !== 'active') return false;
  const now = new Date();
  if (event.promotionStartDate && new Date(event.promotionStartDate) > now) return false;
  if (event.promotionEndDate && new Date(event.promotionEndDate) < now) return false;
  return true;
}

// Helper: est-ce qu'un loisir a un pack actif ?
export function isLeisurePackActive(item: {
  leisurePackType?: string | null;
  leisurePackStatus?: string | null;
  leisurePackStartDate?: string | null;
  leisurePackEndDate?: string | null;
}): boolean {
  if (!item.leisurePackType || item.leisurePackStatus !== 'active') return false;
  const now = new Date();
  if (item.leisurePackStartDate && new Date(item.leisurePackStartDate) > now) return false;
  if (item.leisurePackEndDate && new Date(item.leisurePackEndDate) < now) return false;
  return true;
}
