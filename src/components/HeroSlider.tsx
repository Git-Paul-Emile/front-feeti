import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, Ticket, Play } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EventPromotionBadge, isEventPromotionActive } from './PromotionBadge';

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

interface HeroSliderProps {
  events?: Event[];
  onEventSelect?: (eventId: string) => void;
  onPurchase?: (eventId: string) => void;
  onStreamWatch?: (eventId: string) => void;
  showSlider?: boolean;
}

export function HeroSlider({ events = [], onEventSelect, onPurchase, onStreamWatch, showSlider = true }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Slider: Pack OR en premier, puis live, puis les autres (max 3)
  const sliderEvents = [...events]
    .sort((a, b) => {
      const aOR = isEventPromotionActive(a) && a.promotionType === 'OR';
      const bOR = isEventPromotionActive(b) && b.promotionType === 'OR';
      if (aOR && !bOR) return -1;
      if (!aOR && bOR) return 1;
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })
    .slice(0, 3);

  // Auto-play functionality - Optimized
  useEffect(() => {
    if (!isAutoPlaying || sliderEvents.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextIndex = (prev + 1) % sliderEvents.length;
        return nextIndex;
      });
    }, 6000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, sliderEvents.length]);

  // Reset slide index if events change - Fixed edge case
  useEffect(() => {
    if (sliderEvents.length > 0 && currentSlide >= sliderEvents.length) {
      setCurrentSlide(0);
    }
  }, [sliderEvents.length, currentSlide]);

  const nextSlide = () => {
    if (sliderEvents.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % sliderEvents.length);
    setIsAutoPlaying(false);
    setImageLoaded(false);
  };

  const prevSlide = () => {
    if (sliderEvents.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + sliderEvents.length) % sliderEvents.length);
    setIsAutoPlaying(false);
    setImageLoaded(false);
  };

  const handleSlideSelect = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setImageLoaded(false);
  };

  const handlePurchase = (event: Event) => {
    if (onPurchase) {
      onPurchase(event.id);
    }
  };

  const handleEventSelect = (event: Event) => {
    if (onEventSelect) {
      onEventSelect(event.id);
    }
  };

  const formatEventDate = (date: string, time: string) => {
    const eventDate = new Date(date);
    const weekdays = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
    const months = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];
    
    const weekday = weekdays[eventDate.getDay()];
    const day = eventDate.getDate();
    const month = months[eventDate.getMonth()];
    const year = eventDate.getFullYear();
    
    return `${weekday} ${day} ${month} | ${year}`;
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' ' + currency;
  };

  if (!showSlider || sliderEvents.length === 0) {
    return null;
  }

  const currentEvent = sliderEvents[currentSlide];

  return (
    <div className="relative w-full h-[500px] sm:h-[600px] lg:h-[630px] overflow-hidden bg-gray-900">
      {/* Background Images Stack with Smooth Transition */}
      <div className="absolute inset-0">
        {sliderEvents.map((event, index) => (
          <div
            key={event.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-105' 
                : 'opacity-0 scale-100'
            }`}
          >
            <ImageWithFallback
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
      </div>

      {/* Navigation Arrows - Only show if multiple slides */}
      {sliderEvents.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 group hero-nav-button"
            aria-label="Événement précédent"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 group hero-nav-button"
            aria-label="Événement suivant"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Badge promotion + Organizer */}
            <div className="mb-4 sm:mb-6 hero-text-reveal flex items-center gap-3 flex-wrap">
              {isEventPromotionActive(currentEvent) && currentEvent.promotionType && (
                <EventPromotionBadge
                  promotionType={currentEvent.promotionType as any}
                  size="md"
                />
              )}
              <p className="text-white/80 text-sm sm:text-base font-medium tracking-wide uppercase">
                {currentEvent.organizer}
              </p>
            </div>

            {/* Title */}
            <div className="mb-4 sm:mb-6 hero-text-reveal-delayed">
              <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight hero-slider-title best-off-text-enhanced">
                {currentEvent.title.toUpperCase()}
              </h1>
              <p className="text-white/90 text-lg sm:text-xl mt-3 best-off-text-enhanced">
                {currentEvent.description}
              </p>
            </div>

            {/* Date & Event Details */}
            <div className="mb-6 sm:mb-8 hero-text-reveal-delayed">
              <p className="text-[#53e88b] text-xl sm:text-2xl font-bold tracking-wide best-off-date-enhanced">
                {formatEventDate(currentEvent.date, currentEvent.time)}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-white/70 text-sm">📍 {currentEvent.location}</span>
                <span className="text-[#53e88b] font-semibold text-lg">
                  {formatPrice(currentEvent.price, currentEvent.currency)}
                </span>
                {currentEvent.isLive && (
                  <span className="bg-[#de0035] text-white px-3 py-1 rounded-full text-xs font-bold live-badge-pulse best-off-badge-enhanced">
                    🔴 LIVE
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 hero-slider-buttons">
              <Button
                onClick={() => handlePurchase(currentEvent)}
                className="bg-[#de0035] hover:bg-[#c00030] text-white h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl group premium-button hero-button-float"
              >
                <Ticket className="w-5 h-5 sm:w-6 sm:h-6 mr-2 group-hover:scale-110 transition-transform" />
                Acheter des billets
              </Button>

              <Button
                onClick={() => handleEventSelect(currentEvent)}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm group hero-button-float"
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 group-hover:scale-110 transition-transform" />
                Voir détails
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators - Only show if multiple slides */}
      {sliderEvents.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
          {sliderEvents.map((event, index) => (
            <button
              key={event.id}
              onClick={() => handleSlideSelect(index)}
              className={`transition-all duration-300 hero-indicator ${
                index === currentSlide
                  ? 'w-8 sm:w-12 h-2 sm:h-3 bg-[#53e88b] hero-indicator-active'
                  : 'w-2 h-2 sm:w-3 sm:h-3 bg-white/50 hover:bg-white/80'
              } rounded-full`}
              aria-label={`Aller à ${event.title}`}
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
              animation: 'progressBar 6s linear infinite'
            }}
          />
        </div>
      )}

      {/* Event Cards Preview */}
      {sliderEvents.length > 1 && (
        <div className="absolute bottom-24 sm:bottom-32 right-4 sm:right-8 z-20 hidden lg:flex flex-col space-y-2">
          {sliderEvents.map((event, index) => (
            <button
              key={event.id}
              onClick={() => handleSlideSelect(index)}
              className={`w-16 h-12 rounded-lg overflow-hidden transition-all duration-300 ${
                index === currentSlide
                  ? 'ring-2 ring-[#53e88b] scale-110 opacity-100'
                  : 'opacity-60 hover:opacity-80 hover:scale-105'
              }`}
              aria-label={`Prévisualiser ${event.title}`}
            >
              <ImageWithFallback
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}