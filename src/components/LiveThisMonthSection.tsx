import { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { LiveEventCard } from './LiveEventCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import svgPaths from "../imports/svg-oz78jhj51j";
import imgImage from "figma:asset/882a53f0ca7adf2a39dc045a5a15da83b4cbdcfd.png";
import { isEventPromotionActive } from './PromotionBadge';

// Event interface to match the LiveEventCard props
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
  isFavorite?: boolean;
  organizer: string;
  promotionType?: string | null;
  promotionStatus?: string | null;
  promotionStartDate?: string | null;
  promotionEndDate?: string | null;
}

// Main Live This Month Section Component
interface LiveThisMonthSectionProps {
  events?: Event[];
  onEventSelect?: (eventId: string) => void;
  onPurchase?: (eventId: string) => void;
  onStreamWatch?: (eventId: string) => void;
  onWishlist?: (eventId: string) => void;
  onNavigate?: (page: string, params?: any) => void;
}

export function LiveThisMonthSection({ events = [], onEventSelect, onPurchase, onStreamWatch, onWishlist, onNavigate }: LiveThisMonthSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  // Filtrer et trier les events live — Pack ARGENT/BRONZE en top positions
  const LIVE_PROMO_RANK: Record<string, number> = { OR: 4, ARGENT: 3, BRONZE: 2, LITE: 1 };
  const liveEvents = useMemo(() =>
    events
      .filter(e => e.isLive)
      .sort((a, b) => {
        const rankA = isEventPromotionActive(a) && a.promotionType ? (LIVE_PROMO_RANK[a.promotionType] ?? 0) : 0;
        const rankB = isEventPromotionActive(b) && b.promotionType ? (LIVE_PROMO_RANK[b.promotionType] ?? 0) : 0;
        if (rankB !== rankA) return rankB - rankA;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }),
    [events]
  );

  const handleEventSelect = useCallback((eventId: string) => {
    onEventSelect?.(eventId);
  }, [onEventSelect]);

  const handlePurchase = useCallback((eventId: string) => {
    onPurchase?.(eventId);
  }, [onPurchase]);

  const handleStreamWatch = useCallback((eventId: string) => {
    onStreamWatch?.(eventId);
  }, [onStreamWatch]);

  const handleLearnMore = useCallback(() => {
    onNavigate?.('events', { typeFilter: 'live', showSlider: true });
  }, [onNavigate]);

  // Check scroll position
  const checkScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      
      // Calculate current page based on scroll position
      const scrollProgress = scrollLeft / (scrollWidth - clientWidth);
      const totalPages = Math.max(1, Math.ceil(liveEvents.length / 3));
      const currentPageIndex = Math.round(scrollProgress * (totalPages - 1));
      setCurrentPage(currentPageIndex);
    }
  }, []); // Remove dependency to prevent infinite loop

  // Scroll functions
  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const containerWidth = container.clientWidth;
      // Scroll by container width to show next set of cards
      container.scrollBy({
        left: -containerWidth * 0.8, // Scroll by 80% of container width
        behavior: 'smooth'
      });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const containerWidth = container.clientWidth;
      // Scroll by container width to show next set of cards
      container.scrollBy({
        left: containerWidth * 0.8, // Scroll by 80% of container width
        behavior: 'smooth'
      });
    }
  }, []);

  // Effect to check scroll buttons on mount and scroll
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      checkScrollButtons();
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      
      // Add resize observer to update scroll buttons on window resize
      const handleResize = () => {
        setTimeout(checkScrollButtons, 100); // Debounce resize
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []); // Empty dependency array to prevent infinite loop

  return (
    <section className="bg-white py-6 sm:py-8 lg:py-12" data-name="Live This Month Section">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-4">
          <h2 className="text-4xl font-bold text-[#000441] mb-2">
            En live ce mois
          </h2>
          
          {/* See More Button */}
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

        {/* Events Horizontal Scroll Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg border border-gray-200 flex items-center justify-center live-events-nav-btn ${
              canScrollLeft 
                ? 'text-gray-700 hover:bg-white hover:border-[#000441] cursor-pointer' 
                : 'text-gray-300 cursor-not-allowed opacity-50'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg border border-gray-200 flex items-center justify-center live-events-nav-btn ${
              canScrollRight 
                ? 'text-gray-700 hover:bg-white hover:border-[#000441] cursor-pointer' 
                : 'text-gray-300 cursor-not-allowed opacity-50'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Scrollable Events Container */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide gap-4 sm:gap-6 lg:gap-8 xl:gap-10 pb-4 live-events-scroll px-12"
          >
            {liveEvents.map((event, index) => (
              <div key={event.id} className="flex-shrink-0 w-72 sm:w-80 lg:w-[350px] xl:w-[380px]">
                <LiveEventCard
                  event={event}
                  onSelect={handleEventSelect}
                  onPurchase={handlePurchase}
                  onStreamWatch={handleStreamWatch}
                  onWishlist={onWishlist}
                  isFavorite={event.isFavorite}
                />
              </div>
            ))}
          </div>
          
          {/* Scroll Progress Indicator */}
          {liveEvents.length > 3 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: Math.ceil(liveEvents.length / 3) }, (_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentPage === index
                      ? 'bg-[#000441] w-8'
                      : 'bg-gray-300 w-2'
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