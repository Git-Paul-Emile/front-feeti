import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, MapPin, Users, Eye, Heart, ShoppingCart, Star, Play } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Tag } from './Tag';
import { LiveEventCard } from './LiveEventCard';
import { SocialShareButton } from './SocialShareButton';
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

interface EventCardProps {
  event: Event;
  onSelect: (eventId: string) => void;
  onPurchase?: (eventId: string) => void;
  onWishlist?: (eventId: string) => void;
  onStreamWatch?: (eventId: string) => void;
  variant?: 'default' | 'compact' | 'best-off';
}

interface EventInfoProps {
  event: Event;
  onPurchase?: (eventId: string) => void;
  onWishlist?: (eventId: string) => void;
  onStreamWatch?: (eventId: string) => void;
}

function EventImage({ event }: { event: Event }) {
  return (
    <div 
      className="relative w-full h-48 sm:h-56 lg:h-64 bg-center bg-no-repeat bg-cover overflow-hidden rounded-t-2xl"
      style={{ backgroundImage: `url('${event.image}')` }}
    >
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      
      {/* Top left: badge promotion */}
      {isEventPromotionActive(event) && event.promotionType && (
        <div className="absolute top-4 left-4">
          <EventPromotionBadge promotionType={event.promotionType as any} size="sm" />
        </div>
      )}

      {/* Top right badges and share button */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
        {/* Share button */}
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
          <SocialShareButton
            url={`https://feeti.com/events/${event.id}`}
            title={event.title}
            description={`${event.description} - ${new Intl.DateTimeFormat('fr-FR').format(new Date(event.date))} à ${event.location}`}
            image={event.image}
            size="sm"
            variant="ghost"
          />
        </div>

        {/* Live streaming badge */}
        {event.isLive && (
          <div className="flex items-center bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            EN LIVE
          </div>
        )}
      </div>

      {/* Date overlay */}
      <div className="absolute bottom-4 left-4">
        <div className="text-white">
          <p className="text-2xl sm:text-3xl font-bold">
            {new Date(event.date).getDate()}
          </p>
          <p className="text-sm sm:text-base font-medium -mt-1">
            {new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(new Date(event.date)).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}

function EventInfo({ event, onPurchase, onWishlist, onStreamWatch }: EventInfoProps) {
  return (
    <div className="p-4 sm:p-5 lg:p-6">
      {/* Category badge */}
      <div className="mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
          {event.category}
        </span>
      </div>

      {/* Title and organizer */}
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-1 line-clamp-2">
          {event.title}
        </h3>
        <p className="text-gray-600 text-sm">
          Par {event.organizer}
        </p>
      </div>

      {/* Event details */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center text-gray-600 text-sm">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>
            {new Intl.DateTimeFormat('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }).format(new Date(event.date))} à {event.time}
          </span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (event.isLive) {
              onStreamWatch?.(event.id);
            } else {
              onPurchase?.(event.id);
            }
          }}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {event.isLive ? (
            <Play className="w-4 h-4" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
          {event.isLive ? 'Voir le Live' : 'Acheter'}
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlist?.(event.id);
          }}
          className={`flex-shrink-0 border px-3 py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center ${
            event.isFavorite
              ? 'border-red-500 text-red-500'
              : 'border-gray-300 hover:border-red-600 hover:text-red-600 text-gray-700'
          }`}
        >
          <Heart className={`w-4 h-4 ${event.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}

export function EventCard({ event, onSelect, onPurchase, onWishlist, onStreamWatch, variant = 'default' }: EventCardProps) {
  // Use LiveEventCard for live events only on default/best-off variants
  if (event.isLive && variant === 'best-off') {
    return (
      <LiveEventCard
        event={event}
        onSelect={onSelect}
        onPurchase={onPurchase}
        onStreamWatch={onStreamWatch}
        onWishlist={onWishlist}
        isFavorite={event.isFavorite}
      />
    );
  }
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Compact variant for lists and smaller spaces
  if (variant === 'compact') {
    return (
      <Card 
        className="cursor-pointer transition-all duration-200 border-gray-200"
        onClick={() => onSelect(event.id)}
      >
        <div className="flex">
          <div className="w-24 h-24 flex-shrink-0">
            <ImageWithFallback
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>
          <div className="flex-1 p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{event.title}</h3>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 ml-2">
                <SocialShareButton
                  url={`https://feeti.com/events/${event.id}`}
                  title={event.title}
                  description={`${event.description} - ${formatDate(event.date)} à ${event.location}`}
                  image={event.image}
                  size="sm"
                  variant="ghost"
                />
                {event.isLive && (
                  <Badge variant="destructive" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    LIVE
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Best-off variant using the new design model
  if (variant === 'best-off' || variant === 'default') {
    return (
      <div 
        className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-pointer group overflow-hidden w-full max-w-sm mx-auto"
        onClick={() => onSelect(event.id)}
      >
        <EventImage event={event} />
        <EventInfo event={event} onPurchase={onPurchase} onWishlist={onWishlist} onStreamWatch={onStreamWatch} />
        
        {/* Subtle hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
      </div>
    );
  }

  // Fallback to old style if needed
  return (
    <Card 
      className="cursor-pointer transition-all duration-200 border-gray-200 group"
      onClick={() => onSelect(event.id)}
    >
      <div className="relative">
        <ImageWithFallback
          src={event.image}
          alt={event.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {event.isLive && (
          <Badge className="absolute top-3 left-3 bg-red-600 text-white">
            <Eye className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
            <SocialShareButton
              url={`https://feeti.com/events/${event.id}`}
              title={event.title}
              description={event.description}
              image={event.image}
              size="sm"
              variant="ghost"
            />
          </div>
          <Badge 
            variant="secondary" 
            className="bg-white/90 text-gray-700"
          >
            {event.category}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg group-hover:text-indigo-600 transition-colors">
            {event.title}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-2">
            {event.description}
          </p>
          
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(event.date)} à {event.time}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{event.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            <span>{event.attendees}/{event.maxAttendees} participants</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">par {event.organizer}</p>
        </div>
        
        <Button 
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Voir détails
        </Button>
      </CardFooter>
    </Card>
  );
}