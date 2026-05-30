import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Tag, MapPin } from 'lucide-react';
import DealsBackendAPI, { type BackendDeal } from '../services/api/DealsBackendAPI';
import { isDealPromotionActive, DealPromotionBadge } from './PromotionBadge';

const PROMO_RANK: Record<string, number> = { OR: 4, ARGENT: 3, BRONZE: 2, LITE: 1 };

interface TousNosBonPlansSectionProps {
  onNavigate: (page: string, params?: any) => void;
}

const MONTHS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];

function formatValidUntil(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `Valable jusqu'au ${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function TousNosBonPlansSection({ onNavigate }: TousNosBonPlansSectionProps) {
  const [sliderDeals, setSliderDeals] = useState<BackendDeal[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    DealsBackendAPI.getDeals({ sortBy: 'popularity', limit: 20 })
      .then(res => {
        const published = res.data.filter(d => d.status === 'published');
        // Promus en tête (triés par rang pack), puis populaires, puis le reste
        const sorted = [...published].sort((a, b) => {
          const aActive = isDealPromotionActive(a);
          const bActive = isDealPromotionActive(b);
          if (aActive && !bActive) return -1;
          if (!aActive && bActive) return 1;
          if (aActive && bActive) {
            const rA = PROMO_RANK[a.promotionType ?? ''] ?? 0;
            const rB = PROMO_RANK[b.promotionType ?? ''] ?? 0;
            if (rB !== rA) return rB - rA;
          }
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return 0;
        });
        setSliderDeals(sorted.slice(0, 10));
      })
      .catch(() => {});
  }, []);

  const nextSlide = () => setCurrentSlide(p => (p + 1) % sliderDeals.length);
  const prevSlide = () => setCurrentSlide(p => (p - 1 + sliderDeals.length) % sliderDeals.length);

  const currentDeal = sliderDeals[currentSlide] ?? null;

  if (sliderDeals.length === 0 || !currentDeal) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              Tous nos bons plans
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Découvrez nos meilleures offres et promotions
            </p>
          </div>
          <button
            onClick={() => onNavigate('deals-list')}
            className="self-start sm:self-auto shrink-0 h-9 sm:h-10 lg:h-11 px-4 sm:px-6 lg:px-8 border border-[#000441] bg-transparent text-[#000441] rounded-lg flex items-center justify-center gap-2 sm:gap-3 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000441] focus-visible:ring-offset-2 relative overflow-hidden group transition-colors duration-300"
          >
            <div className="absolute inset-0 bg-[#000441] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left rounded-lg"></div>
            <span className="text-xs sm:text-sm lg:text-base relative z-10 group-hover:text-white transition-colors duration-300">
              voir plus
            </span>
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 relative z-10 group-hover:text-white transition-colors duration-300">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 21">
                <path
                  d="M11.5 1L21 10.5M21 10.5L11.5 20M21 10.5H1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Slider */}
        <div className="relative h-[300px] sm:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden group">
          <div
            className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-all duration-700 ease-in-out"
            style={{ backgroundImage: currentDeal.image ? `url('${currentDeal.image}')` : undefined, backgroundColor: '#03033b' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#03033b]/85 via-[#16bda0]/35 to-transparent" />

          {/* Badge promotion pack */}
          {isDealPromotionActive(currentDeal) && currentDeal.promotionType && (
            <div className="absolute top-4 left-4 z-10">
              <DealPromotionBadge promotionType={currentDeal.promotionType} size="md" />
            </div>
          )}
          {/* Badge réduction */}
          {currentDeal.discount > 0 && (
            <div className="absolute top-4 right-4 z-10 bg-[#de0035] text-white font-bold text-xl px-4 py-2 rounded-xl shadow-lg">
              -{currentDeal.discount}%
            </div>
          )}

          {/* Navigation arrows */}
          {sliderDeals.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </>
          )}

          {/* Contenu */}
          <div className="absolute inset-0 flex items-end p-6 sm:p-8 lg:p-12">
            <div className="w-full max-w-2xl">
              <p className="text-white/75 text-sm mb-2">
                {currentDeal.merchantName}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                {currentDeal.title}
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-[#16bda0]" />
                <p className="text-[#16bea1] text-lg sm:text-xl font-semibold">
                  {currentDeal.discountedPrice.toLocaleString()} FCFA
                  {currentDeal.originalPrice > currentDeal.discountedPrice && (
                    <span className="ml-2 line-through text-white/50 text-base">
                      {currentDeal.originalPrice.toLocaleString()} FCFA
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-[#16bda0]" />
                <p className="text-[#16bea1] text-sm sm:text-base">{currentDeal.location}</p>
              </div>
              <p className="text-white/60 text-xs mb-4">
                {formatValidUntil(currentDeal.validUntil)}
              </p>
              <button
                onClick={() => onNavigate('deals-list')}
                className="inline-flex items-center bg-white hover:scale-105 transition-all duration-300 shadow-lg rounded-lg overflow-hidden group/btn"
              >
                <div className="bg-[#16bda0] w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center group-hover/btn:bg-[#13a88e] transition-colors duration-200">
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="px-3 py-2 text-sm font-semibold text-black">Voir ce bon plan</span>
              </button>
            </div>
          </div>

          {/* Indicateurs */}
          {sliderDeals.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {sliderDeals.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-[#16bda0] scale-125' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
