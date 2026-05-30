import { useState, useMemo } from 'react';
import { ArrowLeft, SlidersHorizontal, Sparkles, Crown } from 'lucide-react';
import { BestOffEventCard } from '../BestOffEventCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { isEventPromotionActive } from '../PromotionBadge';

// Types
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  attendees: number;
  maxAttendees: number;
  isLive: boolean;
  organizer: string;
  promotionType?: string | null;
  promotionStatus?: string | null;
  promotionStartDate?: string | null;
  promotionEndDate?: string | null;
}

interface BestOffPageProps {
  events: Event[];
  onEventSelect: (eventId: string) => void;
  onPurchase: (eventId: string) => void;
  onBack: () => void;
}

// Rang par type de pack pour le tri
const PROMO_RANK: Record<string, number> = { OR: 4, ARGENT: 3, BRONZE: 2, LITE: 1 };

export function BestOffPage({ events, onEventSelect, onPurchase, onBack }: BestOffPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rank' | 'date' | 'price'>('rank');

  // Seuls les événements avec un pack promotionnel actif
  const promoEvents = useMemo(() =>
    events.filter(event => isEventPromotionActive(event)),
    [events]
  );

  // Catégories disponibles parmi les événements promus
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(promoEvents.map(e => e.category).filter(Boolean))).sort();
    return cats;
  }, [promoEvents]);

  // Filtrage + tri
  const filteredEvents = useMemo(() => {
    let filtered = promoEvents;

    if (selectedCategory) {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rank': {
          const rankA = a.promotionType ? (PROMO_RANK[a.promotionType] ?? 0) : 0;
          const rankB = b.promotionType ? (PROMO_RANK[b.promotionType] ?? 0) : 0;
          if (rankB !== rankA) return rankB - rankA;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'price':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }, [promoEvents, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-[#4338ca] via-[#de0035] to-[#059669] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-amber-300" />
              <h1 className="text-white font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl">
                BEST OFF
              </h1>
              <Sparkles className="w-8 h-8 text-amber-300" />
            </div>

            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Sélection d'événements mis en avant par Feeti — packs OR, ARGENT, BRONZE et LITE.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 text-white/80">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{filteredEvents.length}</div>
                <div className="text-sm">Événements promus</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {filteredEvents.filter(e => e.isLive).length}
                </div>
                <div className="text-sm">En Live</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {promoEvents.filter(e => e.promotionType === 'OR').length}
                </div>
                <div className="text-sm">Pack OR</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">

            {/* Filtre catégorie */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-[#000441] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#000441] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Tri */}
            <div className="flex items-center gap-3 shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <div className="flex gap-2">
                {([
                  { key: 'rank',  label: 'Par pack' },
                  { key: 'date',  label: 'Date' },
                  { key: 'price', label: 'Prix' },
                ] as const).map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={sortBy === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucun événement promu{selectedCategory ? ` dans "${selectedCategory}"` : ''}
            </h3>
            <p className="text-gray-500 mb-6">
              {selectedCategory
                ? 'Essayez une autre catégorie.'
                : "Aucun événement n'a de pack promotionnel actif pour le moment."}
            </p>
            {selectedCategory && (
              <Button variant="outline" onClick={() => setSelectedCategory('')}>
                Voir toutes les catégories
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} en avant
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedCategory || 'Toutes catégories'} · trié{' '}
                  {sortBy === 'rank' ? 'par pack' : sortBy === 'date' ? 'par date' : 'par prix'}
                </p>
              </div>
            </div>

            <div className="best-off-grid">
              {filteredEvents.map((event) => (
                <BestOffEventCard
                  key={event.id}
                  event={event}
                  onPurchase={onPurchase}
                  onWishlist={() => {}}
                  onEventSelect={onEventSelect}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      {filteredEvents.length > 0 && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4">Vous cherchez d'autres événements ?</h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Explorez tous nos événements ou créez votre propre événement sur Feeti.
            </p>
            <Button
              onClick={onBack}
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              Voir tous les événements
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
