import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeisureAPI, { type LeisureItem } from '../services/api/LeisureAPI';
import { LeisurePromotionBadge, isLeisurePackActive } from './PromotionBadge';

interface LoisirsAlaUneSectionProps {
  onNavigate: (page: string, params?: any) => void;
}

export function LoisirsAlaUneSection({ onNavigate }: LoisirsAlaUneSectionProps) {
  const [featuredItems, setFeaturedItems] = useState<LeisureItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = (lat?: number, lng?: number) => {
      LeisureAPI.getItems({ lat, lng })
        .then(items => {
          const visible = items.filter(i => i.status === 'published' && (
            i.isFeatured ||
            i.leisureOfferType === 'PREMIUM' ||
            i.leisureOfferType === 'PRO' ||
            isLeisurePackActive(i)
          ));
          // Tri par rang : pack actif (CAMPAGNE_PREMIUM > BOOST > VISIBILITE_ACCUEIL) puis offre (PREMIUM > PRO)
          const PACK_RANK: Record<string, number> = { CAMPAGNE_PREMIUM: 6, BOOST: 5, VISIBILITE_ACCUEIL: 4 };
          const OFFER_RANK: Record<string, number> = { PREMIUM: 3, PRO: 2, BASIC: 1 };
          visible.sort((a, b) => {
            const rA = isLeisurePackActive(a) && a.leisurePackType ? (PACK_RANK[a.leisurePackType] ?? 0) : (OFFER_RANK[a.leisureOfferType ?? ''] ?? 0);
            const rB = isLeisurePackActive(b) && b.leisurePackType ? (PACK_RANK[b.leisurePackType] ?? 0) : (OFFER_RANK[b.leisureOfferType ?? ''] ?? 0);
            return rB - rA;
          });
          setFeaturedItems(visible);
        })
        .catch(() => {});
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchItems(pos.coords.latitude, pos.coords.longitude),
        () => fetchItems(), // permission refusée ou erreur : on charge sans coords
        { timeout: 5000 }
      );
    } else {
      fetchItems();
    }
  }, []);

  const nextSlide = () => setCurrentSlide(p => (p + 1) % featuredItems.length);
  const prevSlide = () => setCurrentSlide(p => (p - 1 + featuredItems.length) % featuredItems.length);

  const currentItem = featuredItems[currentSlide] ?? null;

  if (featuredItems.length === 0 || !currentItem) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Loisirs à la une
            </h2>
            <p className="text-gray-600">
              Découvrez nos établissements et activités loisirs en vedette
            </p>
          </div>
          <button
            onClick={() => onNavigate('leisure')}
            className="h-10 lg:h-11 px-6 lg:px-8 border border-[#000441] bg-transparent text-[#000441] rounded-lg flex items-center justify-center gap-3 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000441] focus-visible:ring-offset-2 relative overflow-hidden group transition-colors duration-300"
          >
            <div className="absolute inset-0 bg-[#000441] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left rounded-lg"></div>
            <span className="text-sm lg:text-base relative z-10 group-hover:text-white transition-colors duration-300">
              voir plus
            </span>
            <div className="w-4 h-4 lg:w-5 lg:h-5 relative z-10 group-hover:text-white transition-colors duration-300">
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
            style={{ backgroundImage: currentItem.image ? `url('${currentItem.image}')` : undefined }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#03033b]/80 via-[#16bda0]/40 to-transparent" />

          {/* Navigation arrows */}
          {featuredItems.length > 1 && (
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
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <LeisurePromotionBadge
                  offerType={currentItem.leisureOfferType as any}
                  packType={currentItem.leisurePackType as any}
                  packStatus={currentItem.leisurePackStatus}
                  size="sm"
                />
                <p className="text-white/75 text-sm">
                  {currentItem.category?.name ?? currentItem.categorySlug}
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                {currentItem.name}
              </h2>
              {currentItem.priceRange && (
                <p className="text-[#16bea1] text-lg sm:text-xl font-semibold mb-3">
                  {currentItem.priceRange}
                </p>
              )}
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-[#16bda0]" />
                <p className="text-[#16bea1] text-sm sm:text-base">{currentItem.location}</p>
              </div>
              {currentItem.openingHours && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <span className="text-white text-xs font-medium">{currentItem.openingHours}</span>
                  </div>
                </div>
              )}
              <button
                onClick={() => navigate(`/leisure/establishment/${currentItem.id}`)}
                className="inline-flex items-center bg-white hover:scale-105 transition-all duration-300 shadow-lg rounded-lg overflow-hidden group/btn"
              >
                <div className="bg-[#16bda0] w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center group-hover/btn:bg-[#12a88d] transition-colors duration-200">
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="px-3 py-2 text-sm font-semibold text-black">Voir le loisir</span>
              </button>
            </div>
          </div>

          {/* Indicateurs */}
          {featuredItems.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {featuredItems.map((_, index) => (
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
