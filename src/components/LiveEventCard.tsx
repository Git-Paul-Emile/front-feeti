import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, Heart, Ticket, Play } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SocialShareButton } from './SocialShareButton';

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
  organizer: string;
}

interface LiveEventCardProps {
  event: Event;
  onSelect: (eventId: string) => void;
  onPurchase?: (eventId: string) => void;
  onStreamWatch?: (eventId: string) => void;
  onWishlist?: (eventId: string) => void;
  isFavorite?: boolean;
}

export function LiveEventCard({ event, onSelect, onPurchase, onStreamWatch, onWishlist, isFavorite = false }: LiveEventCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(date).toUpperCase();
    return { day, month };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + event.currency;
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlist?.(event.id);
  };

  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPurchase?.(event.id);
  };

  const handleStreamClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStreamWatch?.(event.id);
  };

  const dateInfo = formatDate(event.date);

  return (
    <div 
      className="relative w-full max-w-sm mx-auto h-[432px] cursor-pointer group"
      onClick={() => onSelect(event.id)}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat rounded-[22px] overflow-hidden"
        style={{ backgroundImage: `url('${event.image}')` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#000000] from-[29.365%] via-[rgba(0,0,0,0.506)] via-[58.6%] to-[rgba(0,0,0,0)] to-[82.52%] rounded-[22px] mix-blend-multiply opacity-[0.84]" />
      
      {/* Top right section with share and live badge */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
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
        
        {/* Live badge */}
        <div className="flex items-center bg-[#de0035] text-white px-3 py-1.5 rounded-full text-sm font-semibold">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
          <Play className="w-3 h-3 mr-1 fill-white" />
          EN LIVE
        </div>
      </div>

      {/* Date Information */}
      <div className="absolute top-[274px] left-[17px] h-[48px] w-[285px]">
        <div className="absolute bottom-[6.7%] left-[15.62%] right-0 top-[0.2%]">
          <h3 className="font-bold text-white text-[16px] leading-[1.5] mb-0 best-off-text-enhanced">
            {event.title}
          </h3>
          <p className="font-normal text-white text-[16px] leading-[1.5] best-off-text-enhanced">
            Par {event.organizer}
          </p>
        </div>
        
        {/* Date Badge */}
        <div className="absolute bottom-0 left-0 right-[89.44%] top-0">
          <p className="absolute bottom-[68.63%] left-[0.35%] right-[90.14%] text-[#de0035] text-[11.372px] text-center top-0 font-bold best-off-badge-enhanced">
            {dateInfo.month}
          </p>
          <p className="absolute bottom-0 left-0 right-[89.44%] text-[28.429px] text-white top-[23.53%] font-bold best-off-date-enhanced">
            {dateInfo.day}
          </p>
        </div>
      </div>

      {/* Location Information */}
      <div className="absolute top-[332px] left-[17px] h-[23px] w-[285px]">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-[#de0035]" />
          <p className="text-[#dfe1e4] text-[16px] leading-normal font-normal best-off-text-enhanced line-clamp-1">
            {event.location}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-[38px] left-[38px] flex items-center gap-[34px] h-[40px] w-[243px]">
        {/* Main CTA Button */}
        <button
          onClick={event.isLive ? handleStreamClick : handlePurchaseClick}
          className="bg-[#de0035] hover:bg-[#c00030] h-[41px] w-[178px] flex items-center justify-center gap-[4px] transition-all duration-300 premium-button group/btn"
        >
          {event.isLive ? (
            <Play className="w-6 h-6 text-white" />
          ) : (
            <Ticket className="w-6 h-6 text-white" />
          )}
          <span className="font-semibold text-[14px] text-white tracking-[-0.28px] leading-[18px]">
            {event.isLive ? 'Voir le Live' : 'Acheter'}
          </span>
        </button>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`w-6 h-6 transition-all duration-200 hover:scale-110 ${
            isFavorite ? 'text-[#de0035]' : 'text-white hover:text-[#de0035]'
          }`}
        >
          <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Price Badge for Non-Live Events */}
      {!event.isLive && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="text-white text-xs font-semibold best-off-badge-enhanced">
              {formatPrice(event.price)}
            </span>
          </div>
        </div>
      )}

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#de0035]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[22px] pointer-events-none" />
    </div>
  );
}