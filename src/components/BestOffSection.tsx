import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BestOffEventCard } from './BestOffEventCard';
import { toast } from 'sonner@2.0.3';
import svgPaths from "../imports/svg-573glktlpu";
import { isEventPromotionActive } from './PromotionBadge';

// Arrow Components
function ArrowButton({ direction, onClick, disabled = false }: { 
  direction: 'left' | 'right'; 
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`size-9 sm:size-10 lg:size-11 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
    >
      {direction === 'left' ? (
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
      ) : (
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
      )}
    </button>
  );
}

// Main BestOff Section Component
interface BestOffEvent {
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
  organizer: string;
  promotionType?: string | null;
  promotionStatus?: string | null;
  promotionStartDate?: string | null;
  promotionEndDate?: string | null;
}

interface BestOffSectionProps {
  events?: BestOffEvent[];
  onEventSelect?: (eventId: string) => void;
  onPurchase?: (eventId: string) => void;
  onNavigate?: (page: string, params?: any) => void;
}

export function BestOffSection({ events = [], onEventSelect, onPurchase, onNavigate }: BestOffSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(3);

  // Trier les événements par rang promotion, puis par date
  const PROMO_RANK: Record<string, number> = { OR: 4, ARGENT: 3, BRONZE: 2, LITE: 1 };
  const bestOffEvents = [...events].sort((a, b) => {
    const rankA = isEventPromotionActive(a) && a.promotionType ? (PROMO_RANK[a.promotionType] ?? 0) : 0;
    const rankB = isEventPromotionActive(b) && b.promotionType ? (PROMO_RANK[b.promotionType] ?? 0) : 0;
    if (rankB !== rankA) return rankB - rankA;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Update cards per slide based on screen size
  useEffect(() => {
    const updateCardsPerSlide = () => {
      if (typeof window !== 'undefined') {
        const screenWidth = window.innerWidth;
        if (screenWidth < 640) {
          setCardsPerSlide(1); // Mobile: 1 card
        } else if (screenWidth < 1024) {
          setCardsPerSlide(2); // Tablet: 2 cards  
        } else {
          setCardsPerSlide(3); // Desktop: 3 cards
        }
      }
    };

    updateCardsPerSlide();
    window.addEventListener('resize', updateCardsPerSlide);
    return () => window.removeEventListener('resize', updateCardsPerSlide);
  }, []);

  const maxSlides = Math.max(0, Math.ceil(bestOffEvents.length / cardsPerSlide) - 1);

  const handlePrevious = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide(prev => Math.min(maxSlides, prev + 1));
  };

  const handlePurchase = (eventId: string) => {
    onPurchase?.(eventId);
  };

  const handleWishlist = (eventId: string) => {
    toast.success('Ajouté à votre wishlist !');
  };

  const handleEventSelect = (eventId: string) => {
    onEventSelect?.(eventId);
  };

  const handleLearnMore = () => {
    // Navigate to the dedicated Best Off page
    onNavigate?.('best-off');
  };

  // Get the most common category from best off events to filter by
  const getMostCommonCategory = () => {
    const categoryCount: Record<string, number> = {};
    bestOffEvents.forEach(event => {
      categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
    });
    
    return Object.entries(categoryCount).reduce((a, b) => 
      categoryCount[a[0]] > categoryCount[b[0]] ? a : b
    )[0];
  };

  // Get visible events for current slide
  const getVisibleEvents = () => {
    const startIndex = currentSlide * cardsPerSlide;
    return bestOffEvents.slice(startIndex, startIndex + cardsPerSlide);
  };

  return (
    <section className="bg-white py-6 sm:py-8 lg:py-12" data-name="Best Off Section">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Best of Feeti du mois
            </h2>
            <p className="text-gray-600">
              Une sélection des événements les plus populaires et recommandés
            </p>
          </div>
          
          {/* Navigation Arrows - Desktop */}
          <div className="hidden sm:flex items-center gap-3 lg:gap-4">
            <ArrowButton 
              direction="left" 
              onClick={handlePrevious}
              disabled={currentSlide === 0}
            />
            <ArrowButton 
              direction="right" 
              onClick={handleNext}
              disabled={currentSlide >= maxSlides}
            />
            
            {/* Pagination Dots - Desktop */}
            <div className="flex items-center gap-2 ml-2 lg:ml-4">
              {Array.from({ length: maxSlides + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    index === currentSlide 
                      ? 'bg-primary scale-125' 
                      : 'bg-muted-foreground hover:bg-primary/70 hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="relative">
          <div className={`grid gap-6 transition-all duration-500 ease-in-out ${
            cardsPerSlide === 1 ? 'grid-cols-1' :
            cardsPerSlide === 2 ? 'grid-cols-1 sm:grid-cols-2' :
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {getVisibleEvents().map((event) => (
              <div key={event.id} className="w-full max-w-sm mx-auto">
                <BestOffEventCard
                  event={event}
                  onPurchase={handlePurchase}
                  onWishlist={handleWishlist}
                  onEventSelect={handleEventSelect}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows & Dots - Mobile */}
        <div className="flex sm:hidden items-center justify-center gap-4 mt-6">
          <ArrowButton 
            direction="left" 
            onClick={handlePrevious}
            disabled={currentSlide === 0}
          />
          
          <div className="flex items-center gap-2">
            {Array.from({ length: maxSlides + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  index === currentSlide 
                    ? 'bg-primary scale-125' 
                    : 'bg-muted-foreground hover:bg-primary/70 hover:scale-110'
                }`}
              />
            ))}
          </div>
          
          <ArrowButton 
            direction="right" 
            onClick={handleNext}
            disabled={currentSlide >= maxSlides}
          />
        </div>

        {/* See More Button */}
        <div className="flex justify-center mt-8 lg:mt-10">
          <button
            onClick={handleLearnMore}
            className="h-10 lg:h-11 px-6 lg:px-8 border border-[#000441] bg-transparent text-[#000441] rounded-lg flex items-center justify-center gap-3 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000441] focus-visible:ring-offset-2 relative overflow-hidden group transition-colors duration-300"
          >
            {/* Fill Animation Background */}
            <div className="absolute inset-0 bg-[#000441] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left rounded-lg"></div>
            
            {/* Button Content */}
            <span className="text-sm lg:text-base relative z-10 group-hover:text-white transition-colors duration-300">
              Voir plus
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
      </div>
    </section>
  );
}