import { memo, useMemo, useCallback } from 'react';
import { EventCard } from '../EventCard';
import { EventPromotionBadge, isEventPromotionActive } from '../PromotionBadge';
import { SliderOriginalInteractif } from '../SliderOriginalInteractif';
import { ArgentSlider } from '../ArgentSlider';
import { CategorySelector } from '../CategorySelector';

import { LiveThisMonthSection } from '../LiveThisMonthSection';
import { TousNosBonPlansSection } from '../TousNosBonPlansSection';
import { LoisirsAlaUneSection } from '../LoisirsAlaUneSection';
import { LoisirsADecouvrirSection } from '../LoisirsADecouvrirSection';
import { ReplayBonPlansSection } from '../ReplayBonPlansSection';
import { BonPlanEvasionSection } from '../BonPlanEvasionSection';

import { Zap, Shield, Smartphone } from 'lucide-react';
import svgPaths from "../../imports/svg-oz78jhj51j";

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
  attendees: number;
  maxAttendees: number;
  isLive: boolean;
  isFeatured?: boolean;
  isFavorite?: boolean;
  organizer: string;
  tags?: string[];
  promotionType?: string | null;
  promotionStatus?: string | null;
  promotionStartDate?: string | null;
  promotionEndDate?: string | null;
}

interface HomePageProps {
  events: Event[];
  onEventSelect: (eventId: string) => void;
  onNavigate: (page: string, params?: any) => void;
  onStreamWatch?: (eventId: string) => void;
  onPurchase?: (eventId: string) => void;
  onWishlist?: (eventId: string) => void;
}

const HomePage = memo(function HomePage({ events, onEventSelect, onNavigate, onStreamWatch, onPurchase, onWishlist }: HomePageProps) {
  // Événements live pour la section "En live ce mois"
  const liveEvents = useMemo(() => events.filter(e => e.isLive), [events]);

  // Événements "À la une" : isFeatured OU promotion active (OR/ARGENT/BRONZE)
  // Tri : 1. rang promo desc, 2. date événement asc (PDF spec)
  const FEATURED_PROMO_RANK: Record<string, number> = { OR: 4, ARGENT: 3, BRONZE: 2, LITE: 1 };
  const featuredEvents = useMemo(() =>
    events
      .filter(e => e.isFeatured || isEventPromotionActive(e))
      .sort((a, b) => {
        const rankA = isEventPromotionActive(a) && a.promotionType ? (FEATURED_PROMO_RANK[a.promotionType] ?? 0) : 0;
        const rankB = isEventPromotionActive(b) && b.promotionType ? (FEATURED_PROMO_RANK[b.promotionType] ?? 0) : 0;
        if (rankB !== rankA) return rankB - rankA;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }),
    [events]
  );

  // Memoized handlers
  const handleCategorySelect = useCallback((category: string | null) => {
    if (category) {
      console.log('Category selected:', category);
      onNavigate('events', { categoryFilter: category });
    } else {
      console.log('Category deselected - staying on current page to see badges below');
    }
  }, [onNavigate]);

  const handleSearch = useCallback((query: string, filters: any) => {
    console.log('Search:', query, 'Filters:', filters);
    const searchParams: any = {};
    if (query) searchParams.searchQuery = query;
    if (filters?.selectedCategory) searchParams.categoryFilter = filters.selectedCategory;
    onNavigate('events', searchParams);
  }, [onNavigate]);

  const handleViewAllEvents = useCallback(() => {
    onNavigate('events', { typeFilter: 'live', showSlider: true });
  }, [onNavigate]);

  const handleWishlist = useCallback((eventId: string) => {
    onWishlist?.(eventId);
  }, [onWishlist]);

  return (
    <div className="min-h-screen">
      {/* Slider Original Interactif */}
      <SliderOriginalInteractif
        events={events}
        onEventSelect={onEventSelect}
        onPurchase={onPurchase}
        onStreamWatch={onStreamWatch}
        onWishlist={handleWishlist}
      />

      {/* Slider Pack ARGENT — sous la bannière principale */}
      <ArgentSlider events={events} onPurchase={onPurchase} />

      {/* Enhanced Category Selector */}
      <CategorySelector
        onCategorySelect={handleCategorySelect}
        onSearch={handleSearch}
      />

      {/* Live This Month Section */}
      <LiveThisMonthSection
        events={liveEvents}
        onEventSelect={onEventSelect}
        onPurchase={onPurchase}
        onStreamWatch={onStreamWatch}
        onWishlist={handleWishlist}
        onNavigate={onNavigate}
      />

      {/* Tous nos bons plans Section */}
      <TousNosBonPlansSection onNavigate={onNavigate} />

      {/* Featured Events - uniquement si l'admin a mis des événements en avant */}
      {featuredEvents.length > 0 && <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Événements à la une
              </h2>
              <p className="text-gray-600">
                Les événements en salle les plus populaires du moment
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-500">Événements en présentiel uniquement</span>
              </div>
            </div>
            <button
              onClick={handleViewAllEvents}
              className="h-10 lg:h-11 px-6 lg:px-8 border border-[#000441] bg-transparent text-[#000441] rounded-lg flex items-center justify-center gap-3 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000441] focus-visible:ring-offset-2 relative overflow-hidden group transition-colors duration-300"
            >
              {/* Fill Animation Background */}
              <div className="absolute inset-0 bg-[#000441] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left rounded-lg"></div>
              
              {/* Button Content */}
              <span className="text-sm lg:text-base relative z-10 group-hover:text-white transition-colors duration-300">
                voir plus
              </span>
              <div className="w-4 h-4 lg:w-5 lg:h-5 relative z-10 group-hover:text-white transition-colors duration-300">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 21">
                  <path 
                    d={svgPaths.p1a3da900} 
                    fill="currentColor"
                  />
                </svg>
              </div>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="relative">
                {isEventPromotionActive(event) && event.promotionType && (
                  <div className="absolute top-3 left-3 z-10">
                    <EventPromotionBadge promotionType={event.promotionType as any} size="sm" />
                  </div>
                )}
                <EventCard
                  event={event}
                  onSelect={onEventSelect}
                  onPurchase={onPurchase}
                  onStreamWatch={onStreamWatch}
                  onWishlist={handleWishlist}
                  variant="best-off"
                />
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Feeti ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une plateforme complète pour découvrir, réserver et vivre vos événements préférés
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
                <Zap className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Réservation instantanée
              </h3>
              <p className="text-gray-600">
                Réservez vos billets en quelques clics et recevez-les immédiatement
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition-colors">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Paiement sécurisé
              </h3>
              <p className="text-gray-600">
                Vos transactions sont protégées par les dernières technologies de sécurité
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
                <Smartphone className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Application mobile
              </h3>
              <p className="text-gray-600">
                Accédez à tous vos événements depuis votre smartphone où que vous soyez
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Loisirs à la une Section */}
      <LoisirsAlaUneSection onNavigate={onNavigate} />

      {/* Loisirs À découvrir — PREMIUM / CAMPAGNE_PREMIUM / BOOST */}
      <LoisirsADecouvrirSection onNavigate={onNavigate} />

      {/* Bon Plan Evasion Section */}
      <BonPlanEvasionSection onNavigate={onNavigate} />

      {/* Replay Bon Plans Section */}
      <ReplayBonPlansSection onNavigate={onNavigate} />

    </div>
  );
});

export { HomePage };