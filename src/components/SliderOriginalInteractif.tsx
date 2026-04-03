import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Ticket, Heart, Play } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EventPromotionBadge, isEventPromotionActive } from './PromotionBadge';

// Nombre maximum d'événements visibles simultanément dans le slider
const MAX_SLIDE_VISIBLE = 5;
// Durée de rotation automatique (ms) quand il y a plus que MAX_SLIDE_VISIBLE événements en avant
const ROTATION_INTERVAL_MS = 35000;
// Durée de rotation standard (ms)
const DEFAULT_INTERVAL_MS = 7000;

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
  tags?: string[];
  attendees: number;
  maxAttendees: number;
  isLive: boolean;
  isFeatured?: boolean;
  isFavorite?: boolean;
  organizer: string;
  promotionType?: string | null;
  promotionStatus?: string | null;
  promotionStartDate?: string | null;
  promotionEndDate?: string | null;
}

interface SliderOriginalInteractifProps {
  events?: Event[];
  onEventSelect?: (eventId: string) => void;
  onPurchase?: (eventId: string) => void;
  onStreamWatch?: (eventId: string) => void;
  onWishlist?: (eventId: string) => void;
}

const SliderOriginalInteractif = memo(function SliderOriginalInteractif({
  events = [],
  onPurchase,
  onStreamWatch,
  onWishlist,
}: SliderOriginalInteractifProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Événements visibles dans le slider :
  // - isFeatured (marqué admin) OU Pack OR actif (accès automatique hero banner per PDF spec)
  // Seul OR a accès au slider principal — ARGENT/BRONZE/LITE ont leurs propres zones
  const PROMO_SLIDER_RANK: Record<string, number> = { OR: 4 };

  const allFeaturedEvents = useMemo(() =>
    events
      .filter(e => e.isFeatured || (isEventPromotionActive(e) && e.promotionType === 'OR'))
      .sort((a, b) => {
        const rankA = isEventPromotionActive(a) && a.promotionType ? (PROMO_SLIDER_RANK[a.promotionType] ?? 0) : 0;
        const rankB = isEventPromotionActive(b) && b.promotionType ? (PROMO_SLIDER_RANK[b.promotionType] ?? 0) : 0;
        if (rankB !== rankA) return rankB - rankA;
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }),
    [events]
  );

  const hasMoreThanMax = allFeaturedEvents.length > MAX_SLIDE_VISIBLE;

  // Fenêtre glissante de MAX_SLIDE_VISIBLE événements, gérée par windowOffset
  const [windowOffset, setWindowOffset] = useState(0);

  const sliderEvents = useMemo(() => {
    if (allFeaturedEvents.length === 0) return [];
    const start = windowOffset % allFeaturedEvents.length;
    // Prendre MAX_SLIDE_VISIBLE éléments en bouclant
    const result: typeof allFeaturedEvents = [];
    for (let i = 0; i < Math.min(MAX_SLIDE_VISIBLE, allFeaturedEvents.length); i++) {
      result.push(allFeaturedEvents[(start + i) % allFeaturedEvents.length]);
    }
    return result;
  }, [allFeaturedEvents, windowOffset]);

  // Rotation de la fenêtre toutes les ROTATION_INTERVAL_MS si > MAX_SLIDE_VISIBLE événements
  useEffect(() => {
    if (!hasMoreThanMax) return;
    const timer = setInterval(() => {
      setWindowOffset(prev => (prev + 1) % allFeaturedEvents.length);
      setCurrentSlide(0);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [hasMoreThanMax, allFeaturedEvents.length]);

  // Auto-play au sein de la fenêtre courante
  const autoPlayInterval = hasMoreThanMax ? ROTATION_INTERVAL_MS / MAX_SLIDE_VISIBLE : DEFAULT_INTERVAL_MS;

  useEffect(() => {
    if (!isAutoPlaying || sliderEvents.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderEvents.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, sliderEvents.length, autoPlayInterval]);

  // Reset slide index if events change - Fixed edge case
  useEffect(() => {
    if (sliderEvents.length > 0 && currentSlide >= sliderEvents.length) {
      setCurrentSlide(0);
    }
  }, [sliderEvents.length, currentSlide]);

  // Memoized handlers
  const nextSlide = useCallback(() => {
    if (sliderEvents.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % sliderEvents.length);
    setIsAutoPlaying(false);
  }, [sliderEvents.length]);

  const prevSlide = useCallback(() => {
    if (sliderEvents.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + sliderEvents.length) % sliderEvents.length);
    setIsAutoPlaying(false);
  }, [sliderEvents.length]);

  const handleSlideSelect = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  }, []);

  // Memoized date formatter
  const formatEventDate = useCallback((date: string) => {
    const eventDate = new Date(date);
    const weekdays = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
    const months = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];
    
    const weekday = weekdays[eventDate.getDay()];
    const day = eventDate.getDate();
    const month = months[eventDate.getMonth()];
    const year = eventDate.getFullYear();
    
    return { weekday, day, month, year };
  }, []);

  const handlePurchase = useCallback((event: Event) => {
    if (event.isLive && onStreamWatch) {
      onStreamWatch(event.id);
    } else if (onPurchase) {
      onPurchase(event.id);
    }
  }, [onPurchase, onStreamWatch]);

  // Image loading handlers
  const handleImageLoad = useCallback((eventId: string) => {
    setLoadedImages(prev => new Set([...prev, eventId]));
  }, []);

  const handleImageError = useCallback((_eventId: string) => {}, []);

  // Memoized current event and date info
  const currentEvent = useMemo(() => 
    sliderEvents[currentSlide],
    [sliderEvents, currentSlide]
  );

  const dateInfo = useMemo(() => 
    currentEvent ? formatEventDate(currentEvent.date) : null,
    [currentEvent, formatEventDate]
  );

  if (allFeaturedEvents.length === 0 || sliderEvents.length === 0 || !currentEvent || !dateInfo) {
    return null;
  }

  return (
    <div className="bg-[#f8f8f8] relative w-full h-[520px] sm:h-[620px] lg:h-[720px] xl:h-[770px] overflow-hidden slider-original-container" data-name="SLIDER SHOW INTERACTIF">
      {/* Background Images Stack */}
      <div className="absolute inset-0 w-full h-full slider-performance-mode">
        {sliderEvents.map((event, index) => (
          <div
            key={event.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out slider-performance-mode ${
              index === currentSlide 
                ? 'opacity-100 scale-105' 
                : 'opacity-0 scale-100'
            }`}
          >
            <ImageWithFallback
              src={event.image}
              alt={event.title}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                loadedImages.has(event.id) ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => handleImageLoad(event.id)}
              onError={() => handleImageError(event.id)}
            />
          </div>
        ))}
      </div>

      {/* Gradient Overlay - Optimized */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />

      {/* Navigation Arrows - Only show if multiple slides */}
      {sliderEvents.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 group hero-nav-button"
            aria-label="Événement précédent"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 group hero-nav-button"
            aria-label="Événement suivant"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* Main Content - Optimized layout */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Badge promotion + Organizer */}
            <div className="mb-3 sm:mb-4 hero-text-reveal flex items-center gap-3 flex-wrap">
              {isEventPromotionActive(currentEvent) && currentEvent.promotionType && (
                <EventPromotionBadge
                  promotionType={currentEvent.promotionType as any}
                  size="md"
                />
              )}
              <p className="text-white/80 text-sm sm:text-base font-medium tracking-wide uppercase best-off-text-enhanced">
                {currentEvent.organizer}
              </p>
            </div>

            {/* Title */}
            <div className="mb-4 sm:mb-6 hero-text-reveal-delayed">
              <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight best-off-text-enhanced hero-slider-title">
                {currentEvent.title.toUpperCase()}
              </h1>
            </div>

            {/* Date Section */}
            <div className="mb-4 sm:mb-6 hero-text-reveal-delayed">
              <div className="flex items-baseline gap-2 sm:gap-3">
                <p className="text-[#53e88b] text-lg sm:text-xl md:text-2xl font-bold tracking-wide best-off-date-enhanced">
                  {dateInfo.weekday} {dateInfo.day} {dateInfo.month} |
                </p>
                <p className="text-white text-lg sm:text-xl md:text-2xl font-bold best-off-text-enhanced">
                  {dateInfo.year}
                </p>
              </div>
            </div>

            {/* Availability Section */}
            <div className="mb-6 sm:mb-8 hero-text-reveal-delayed">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 sm:w-12 h-px bg-white/50"></div>
                  <span className="text-white/80 text-xs sm:text-sm font-medium best-off-text-enhanced">
                    {currentEvent.maxAttendees - currentEvent.attendees} places disponibles
                  </span>
                  <div className="w-8 sm:w-12 h-px bg-white/50"></div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center hero-slider-buttons">
                {/* Main Action Button */}
                <button
                  onClick={() => handlePurchase(currentEvent)}
                  className="flex items-center group cursor-pointer rounded-lg overflow-hidden transition-all duration-300 hover:scale-105"
                >
                  <div className="bg-white flex items-center justify-center px-4 py-3 hover:bg-gray-100 transition-colors">
                    <span className="text-black text-sm sm:text-base font-semibold">
                      {currentEvent.isLive ? 'VOIR LE LIVE' : 'ACHETER'}
                    </span>
                  </div>
                  <div className="bg-[#de0035] flex items-center justify-center px-3 py-3">
                    {currentEvent.isLive ? (
                      <Play className="w-5 h-5 text-white" />
                    ) : (
                      <Ticket className="w-5 h-5 text-white" />
                    )}
                  </div>
                </button>

                {/* Price Display */}
                <div className="text-white font-bold text-base sm:text-lg bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'decimal',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(currentEvent.price)} {currentEvent.currency}
                </div>

                {/* Add to Favorites */}
                <button
                  onClick={(e) => { e.stopPropagation(); onWishlist?.(currentEvent.id); }}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 group"
                >
                  <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${currentEvent.isFavorite ? 'fill-red-500 text-red-500' : 'group-hover:fill-white'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Preview Cards - Bottom slider - Hidden on mobile */}
      {sliderEvents.length > 1 && (
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 hidden lg:flex gap-4 xl:gap-6">
          {sliderEvents.map((event, index) => (
            <button
              key={event.id}
              onClick={() => handleSlideSelect(index)}
              className={`relative shrink-0 rounded-2xl overflow-hidden transition-all duration-300 ${
                index === currentSlide
                  ? 'w-20 h-28 xl:w-24 xl:h-32 ring-2 ring-[#53e88b] scale-110'
                  : 'w-16 h-24 xl:w-20 xl:h-28 opacity-70 hover:opacity-90 hover:scale-105'
              }`}
              aria-label={`Prévisualiser ${event.title}`}
            >
              <ImageWithFallback
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
                onLoad={() => handleImageLoad(event.id)}
                onError={() => handleImageError(event.id)}
              />
              {index === currentSlide && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Navigation Dots - Optimized */}
      {sliderEvents.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
          {sliderEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideSelect(index)}
              className={`transition-all duration-300 rounded-full hero-indicator ${
                index === currentSlide
                  ? 'w-8 sm:w-10 h-2 sm:h-2.5 bg-[#53e88b] hero-indicator-active'
                  : 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Aller à l'événement ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar - Only show during auto-play */}
      {isAutoPlaying && sliderEvents.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div
            className="h-1 bg-[#53e88b] transition-all duration-100 ease-linear"
            style={{
              animation: `progressBar${hasMoreThanMax ? '35s' : '7s'} ${autoPlayInterval / 1000}s linear infinite`
            }}
          />
        </div>
      )}
    </div>
  );
});

export { SliderOriginalInteractif };