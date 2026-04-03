import { Heart, MapPin, Ticket } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

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
}

interface UpcomingLiveEventsSectionProps {
  events: Event[];
  onEventSelect: (eventId: string) => void;
  onPurchase: (eventId: string) => void;
  onToggleFavorite?: (eventId: string) => void;
}

function EventCard({ 
  event, 
  onEventSelect, 
  onPurchase, 
  onToggleFavorite,
  animationDelay = 0
}: { 
  event: Event; 
  onEventSelect: (eventId: string) => void;
  onPurchase: (eventId: string) => void;
  onToggleFavorite?: (eventId: string) => void;
  animationDelay?: number;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
  };

  const { month, day } = formatDate(event.date);

  return (
    <div 
      className="relative w-full max-w-[308px] mx-auto group cursor-pointer"
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={() => onEventSelect(event.id)}
    >
      {/* Main card container */}
      <div className="relative h-[432px] rounded-[22px] overflow-hidden bg-gray-900">
        {/* Background image */}
        <ImageWithFallback
          src={event.image}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        
        {/* Date badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="text-center">
            <div 
              className="text-[#de0035] text-[11px] font-bold leading-none mb-1"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              {month}
            </div>
            <div 
              className="text-white text-[28px] font-bold leading-none"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              {day}
            </div>
          </div>
        </div>

        {/* Content container */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          {/* Event info */}
          <div className="mb-4">
            <h3 
              className="text-white text-[16px] font-bold leading-[1.5] mb-1"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              {event.title}
            </h3>
            <p 
              className="text-white/80 text-[14px] font-normal leading-[1.5]"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              By {event.organizer}
            </p>
          </div>

          {/* Location */}
          <div className="flex items-center mb-6">
            <MapPin className="w-4 h-4 text-[#de0035] mr-2 flex-shrink-0" />
            <p 
              className="text-[#dfe1e4] text-[14px] font-normal truncate"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              {event.location}
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center justify-between">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPurchase(event.id);
              }}
              className="bg-[#de0035] hover:bg-[#de0035]/90 text-white h-[41px] px-4 flex items-center gap-2 transition-all duration-300 hover:scale-105"
            >
              <Ticket className="w-6 h-6" />
              <span className="font-semibold text-[14px] tracking-[-0.28px]">
                Réservez
              </span>
            </Button>

            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(event.id);
                }}
                className="w-10 h-10 text-white hover:text-[#de0035] hover:bg-white/10 transition-colors"
              >
                <Heart className="w-6 h-6" />
              </Button>
            )}
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );
}

export function UpcomingLiveEventsSection({ 
  events, 
  onEventSelect, 
  onPurchase, 
  onToggleFavorite 
}: UpcomingLiveEventsSectionProps) {
  // Filter for live events only
  const liveEvents = events.filter(event => event.isLive).slice(0, 8);

  // If no live events, don't render the section
  if (liveEvents.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-[#000441] text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.005] max-w-4xl">
            Événements en live prochainement
          </h2>
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 place-items-center">
          {liveEvents.map((event, index) => (
            <div
              key={event.id}
              className="events-list-card w-full"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <EventCard
                event={event}
                onEventSelect={onEventSelect}
                onPurchase={onPurchase}
                onToggleFavorite={onToggleFavorite}
                animationDelay={index * 100}
              />
            </div>
          ))}
        </div>

        {/* Show more button if there are more events */}
        {events.filter(event => event.isLive).length > 8 && (
          <div className="flex justify-center mt-12">
            <Button
              onClick={() => onEventSelect('')} // Navigate to events page
              variant="outline"
              className="border-[#de0035] text-[#de0035] hover:bg-[#de0035] hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              voir plus
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}