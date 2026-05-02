import { Heart, ShoppingCart, Calendar, MapPin, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SocialShareButton } from './SocialShareButton';
import svgPaths from "../imports/svg-hfsthgh8or";
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
  eventType?: 'PRESENTIEL' | 'STREAMING_LIVE' | 'MIXTE';
  organizer: string;
  promotionType?: string | null;
  promotionStatus?: string | null;
  promotionStartDate?: string | null;
  promotionEndDate?: string | null;
}

interface BestOffEventCardProps {
  event: Event;
  onPurchase: (eventId: string) => void;
  onWishlist?: (eventId: string) => void;
  onEventSelect: (eventId: string) => void;
}

function EventImage({ event }: { event: Event }) {
  const formatDate = () => {
    const date = new Date(event.date);
    const day = date.getDate();
    const month = new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(date).toUpperCase();
    return { day, month };
  };

  const { day, month } = formatDate();

  return (
    <div className="relative w-full h-[335px] overflow-hidden rounded-[20px]">
      {/* Background Image */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat h-full left-0 top-0 w-full"
        style={{ backgroundImage: `url('${event.image}')` }}
      />
      
      {/* Premium gradient overlay inspired by Figma design */}
      <div className="absolute bg-gradient-to-t bottom-0 from-[#000000] from-[29.365%] h-[259px] left-1/2 mix-blend-multiply opacity-[0.84] to-[82.52%] to-[rgba(0,0,0,0)] translate-x-[-50%] via-[58.6%] via-[rgba(0,0,0,0.506)] w-full" />
      
      {/* Badge promotion dynamique */}
      <div className="absolute top-6 left-6">
        {isEventPromotionActive(event) && event.promotionType ? (
          <EventPromotionBadge promotionType={event.promotionType as any} size="sm" />
        ) : (
          <div className="flex items-center bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-[10px] best-off-badge-enhanced shadow-lg backdrop-blur-sm bg-opacity-95">
            BEST OFF
          </div>
        )}
      </div>

      {/* Top right section */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
        {/* Share button */}
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
          <SocialShareButton
            url={`https://feeti.com/events/${event.id}`}
            title={event.title}
            description={`${event.description} - ${event.isLive ? 'En direct maintenant' : `Le ${new Intl.DateTimeFormat('fr-FR').format(new Date(event.date))}`} à ${event.location}`}
            image={event.image}
            size="sm"
            variant="ghost"
          />
        </div>
        
        {/* Live streaming badge - premium style */}
        {(event.eventType === 'STREAMING_LIVE' || event.eventType === 'MIXTE' || (!event.eventType && event.isLive)) && (
          <div className="flex items-center bg-gradient-to-r from-[#de0035] to-[#ff1744] text-white px-4 py-2 rounded-full best-off-badge-enhanced shadow-lg backdrop-blur-sm bg-opacity-95 text-[11px]">
            <div className="w-2.5 h-2.5 bg-white rounded-full mr-2 animate-pulse" />
            EN LIVE
          </div>
        )}
      </div>

      {/* Date overlay - Figma inspired large format */}
      <div className="absolute bottom-[100px] left-6">
        <div className="text-white">
          <p className="text-[24px] best-off-date-enhanced leading-none tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {day} {month} |
          </p>
        </div>
      </div>

      {/* Title and organizer overlay - Figma position */}
      <div className="absolute bottom-[40px] left-6 right-6">
        <h3 className="text-white text-[16px] best-off-text-enhanced mb-1.5 line-clamp-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {event.title}
        </h3>
        <p className="text-white text-[12px] opacity-95 best-off-text-enhanced" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          By {event.organizer}
        </p>
      </div>
    </div>
  );
}

// Premium action buttons component inspired by Figma design
function PremiumActionButtons({ event, onPurchase, onWishlist }: { 
  event: Event; 
  onPurchase: (eventId: string) => void; 
  onWishlist?: (eventId: string) => void; 
}) {
  return (
    <div className="absolute bottom-[18px] left-[18px] right-[18px] flex gap-[14px]">
      {/* Acheter Button - Figma inspired */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPurchase(event.id);
        }}
        className="premium-button bg-[#de0035] hover:bg-gradient-to-r hover:from-[#de0035] hover:to-[#ff1744] transition-all duration-300 flex-1 h-[41px] flex items-center justify-center gap-1 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <div className="size-6 transition-transform group-hover:scale-110">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <path d={svgPaths.pf4b3a80} fill="white" />
          </svg>
        </div>
        <span className="text-[12px] tracking-[-0.28px]">Acheter</span>
      </button>
      
      {/* Wishlist Button - Figma inspired */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onWishlist?.(event.id);
        }}
        className="premium-button bg-[#de0035] hover:bg-gradient-to-r hover:from-[#de0035] hover:to-[#ff1744] transition-all duration-300 flex-1 h-[41px] flex items-center justify-center gap-1 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <div className="size-6 transition-transform group-hover:scale-110">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <path d={svgPaths.p2d9ecc00} fill="white" />
          </svg>
        </div>
        <span className="text-[12px] tracking-[-0.28px]">Wishlist</span>
      </button>
    </div>
  );
}

export function BestOffEventCard({ event, onPurchase, onWishlist, onEventSelect }: BestOffEventCardProps) {
  return (
    <div 
      className="best-off-premium-card relative bg-white rounded-[20px] border border-gray-200 transition-all duration-500 cursor-pointer group overflow-hidden w-full max-w-[410px] mx-auto hover:scale-[1.02]"
      onClick={() => onEventSelect(event.id)}
    >
      <EventImage event={event} />
      <PremiumActionButtons 
        event={event} 
        onPurchase={onPurchase} 
        onWishlist={onWishlist} 
      />
      
      {/* Premium hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#de0035]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[20px] pointer-events-none" />
      
      {/* Premium shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out rounded-[20px] pointer-events-none" />
    </div>
  );
}