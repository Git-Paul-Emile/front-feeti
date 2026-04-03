import { useState } from 'react';
import { Button } from './ui/button';
import { EventCard } from './EventCard';
import { Badge } from './ui/badge';
import { Play, Users, Clock, Wifi, Zap, Monitor } from 'lucide-react';

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

interface LiveEventsSectionProps {
  events: Event[];
  onEventSelect: (eventId: string) => void;
  onNavigate: (page: string, params?: any) => void;
  onStreamWatch?: (eventId: string) => void;
  onPurchase?: (eventId: string) => void;
}

export function LiveEventsSection({ 
  events, 
  onEventSelect, 
  onNavigate, 
  onStreamWatch, 
  onPurchase 
}: LiveEventsSectionProps) {
  // Filter only live events
  const liveEvents = events.filter(event => event.isLive).slice(0, 6);

  if (liveEvents.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-indigo-50 via-emerald-50 to-indigo-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-emerald-400 to-indigo-400 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="font-medium text-sm">EN DIRECT</span>
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-emerald-600 to-indigo-700 bg-clip-text text-transparent mb-4">
            Événements en direct
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto">
            Participez en temps réel à des événements exclusifs depuis chez vous. 
            Streaming haute qualité et interaction live garantis !
          </p>

          {/* Live Statistics */}
          <div className="flex items-center justify-center space-x-8 mt-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-5 h-5 text-indigo-500" />
              <span className="font-medium">
                {liveEvents.reduce((sum, event) => sum + event.attendees, 0).toLocaleString()} spectateurs
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Monitor className="w-5 h-5 text-emerald-500" />
              <span className="font-medium">{liveEvents.length} événements live</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Zap className="w-5 h-5 text-indigo-500" />
              <span className="font-medium">HD/4K disponible</span>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {liveEvents.map((event) => (
            <div key={event.id} className="relative group">
              {/* Live indicator overlay */}
              <div className="absolute top-3 left-3 z-20">
                <Badge 
                  variant="destructive" 
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg animate-pulse"
                >
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
                  LIVE
                </Badge>
              </div>

              {/* Viewers count overlay */}
              <div className="absolute top-3 right-3 z-20">
                <div className="bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{event.attendees.toLocaleString()}</span>
                </div>
              </div>

              {/* Event Card with live styling */}
              <div className="relative overflow-hidden rounded-xl bg-white shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                {/* Live border animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                     style={{ padding: '2px' }}>
                  <div className="bg-white rounded-lg h-full w-full" />
                </div>

                <div className="relative z-10 bg-white rounded-xl">
                  <EventCard
                    event={event}
                    onSelect={onEventSelect}
                    onPurchase={onPurchase}
                    onWishlist={(eventId) => console.log('Wishlist:', eventId)}
                    variant="live-style"
                  />
                </div>
              </div>

              {/* Quick Stream Action */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                <Button
                  onClick={() => onStreamWatch?.(event.id)}
                  className="bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white shadow-lg"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Regarder maintenant
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20 shadow-xl">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Pourquoi choisir nos événements live ?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Monitor className="w-8 h-8 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Qualité HD/4K</h4>
              <p className="text-gray-600 text-sm">
                Streaming en haute définition avec son surround pour une expérience immersive
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Interaction en temps réel</h4>
              <p className="text-gray-600 text-sm">
                Chat live, Q&A, sondages et réactions pour interagir avec les autres spectateurs
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Replay disponible</h4>
              <p className="text-gray-600 text-sm">
                Revoyez l'événement jusqu'à 48h après la diffusion en direct
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            onClick={() => onNavigate('events', { typeFilter: 'live' })}
            className="bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white px-8 py-3 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            size="lg"
          >
            <Wifi className="w-5 h-5 mr-2" />
            voir plus
          </Button>
        </div>
      </div>
    </section>
  );
}