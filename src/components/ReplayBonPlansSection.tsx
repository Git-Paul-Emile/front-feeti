import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Heart, MapPin } from 'lucide-react';
import EventsBackendAPI from '../services/api/EventsBackendAPI';
import type { BackendEvent } from '../services/api/EventsBackendAPI';
import DealsBackendAPI from '../services/api/DealsBackendAPI';
import type { BackendDeal } from '../services/api/DealsBackendAPI';

interface ReplayBonPlansSectionProps {
  onNavigate: (page: string) => void;
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
  const months = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} | ${date.getFullYear()}`;
}

export function ReplayBonPlansSection({ onNavigate }: ReplayBonPlansSectionProps) {
  const [currentReplaySlide, setCurrentReplaySlide] = useState(0);
  const [currentBonPlanSlide, setCurrentBonPlanSlide] = useState(0);
  const [liveEvents, setLiveEvents] = useState<BackendEvent[]>([]);
  const [deals, setDeals] = useState<BackendDeal[]>([]);

  useEffect(() => {
    EventsBackendAPI.getAllEvents()
      .then(data => setLiveEvents(data.filter(e => e.isLive)))
      .catch(() => {});
    DealsBackendAPI.getDeals({ limit: 5 })
      .then(res => setDeals(res.data))
      .catch(() => {});
  }, []);

  const nextReplaySlide = () => {
    setCurrentReplaySlide((prev) => (prev + 1) % liveEvents.length);
  };

  const prevReplaySlide = () => {
    setCurrentReplaySlide((prev) => (prev - 1 + liveEvents.length) % liveEvents.length);
  };

  const nextBonPlanSlide = () => {
    setCurrentBonPlanSlide((prev) =>
      prev + 1 >= deals.length - 2 ? 0 : prev + 1
    );
  };

  const prevBonPlanSlide = () => {
    setCurrentBonPlanSlide((prev) =>
      prev === 0 ? Math.max(0, deals.length - 3) : prev - 1
    );
  };

  if (liveEvents.length === 0 && deals.length === 0) return null;

  const currentEvent = liveEvents[currentReplaySlide];

  return (
    <section className="bg-[#f8f8f8] py-8 sm:py-12 lg:py-16 mx-4 sm:mx-6 lg:mx-8 xl:mx-12 rounded-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Slider Principal - Replay */}
        {liveEvents.length > 0 && currentEvent && (
          <div className="relative mb-8 lg:mb-12">
            <div className="relative h-[300px] sm:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden group">
              {/* Image de fond avec transition */}
              <div
                className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-all duration-700 ease-in-out"
                style={{ backgroundImage: `url('${currentEvent.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#03033b]/80 via-[#16bda0]/40 to-transparent" />

              {/* Navigation arrows */}
              <button
                onClick={prevReplaySlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              <button
                onClick={nextReplaySlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>

              {/* Contenu textuel */}
              <div className="absolute inset-0 flex items-end p-6 sm:p-8 lg:p-12">
                <div className="w-full max-w-2xl">
                  <p className="text-white/75 text-sm mb-2">{currentEvent.organizer?.name || 'Organisateur'}</p>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                    {currentEvent.title.toUpperCase()}
                  </h2>
                  <p className="text-[#16bea1] text-lg sm:text-xl font-semibold mb-3">{formatEventDate(currentEvent.date)}</p>

                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-[#16bda0]" />
                    <p className="text-[#16bea1] text-sm sm:text-base">{currentEvent.location}</p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentEvent.isLive && (
                      <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                        <Play className="w-3 h-3 text-[#de0035] mr-1.5 fill-current" />
                        <span className="text-white text-xs font-medium">EN LIVE STREAMING</span>
                      </div>
                    )}
                    {currentEvent.attendees < currentEvent.maxAttendees && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                        <span className="text-white text-xs font-medium">Places disponibles</span>
                      </div>
                    )}
                  </div>

                  {/* Bouton Play */}
                  <button
                    onClick={() => onNavigate('streaming')}
                    className="inline-flex items-center bg-white hover:scale-105 transition-all duration-300 shadow-lg rounded-lg overflow-hidden group/btn"
                  >
                    <div className="bg-[#de0035] w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center group-hover/btn:bg-[#c00030] transition-colors duration-200">
                      <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-white" />
                    </div>
                    <span className="px-3 py-2 text-sm font-semibold text-black">Voir la vidéo</span>
                  </button>
                </div>
              </div>

              {/* Indicateurs de slides */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {liveEvents.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentReplaySlide(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                      index === currentReplaySlide
                        ? 'bg-[#16bda0] scale-125'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section Bon Plans */}
        {deals.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">

            {/* Texte Bon Plans */}
            <div className="bg-[#000441] rounded-2xl p-8 sm:p-10 lg:p-12 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-2xl sm:text-3xl lg:text-4xl leading-tight mb-2">Consulter tous les</p>
                <p className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-8">
                  BON-PLANS<span className="text-3xl sm:text-4xl lg:text-5xl">.</span>
                </p>

                <button
                  onClick={() => onNavigate('events')}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#e43962] to-[#f54975] hover:from-[#d63356] hover:to-[#e73668] text-white font-bold rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Voir +
                </button>
              </div>
            </div>

            {/* Slider Bon Plans */}
            <div className="relative">
              <div className="flex gap-4 overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentBonPlanSlide * (200 + 16)}px)`,
                    width: `${deals.length * (200 + 16)}px`
                  }}
                >
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="w-[200px] h-[280px] flex-shrink-0 relative rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 mr-4"
                      onClick={() => onNavigate('events')}
                    >
                      <div
                        className="w-full h-full bg-center bg-cover bg-no-repeat"
                        style={{ backgroundImage: `url('${deal.image}')` }}
                      />

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      {/* Badge de réduction */}
                      <div className="absolute top-3 right-3 bg-[#de0035] text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{deal.discount}%
                      </div>

                      {/* Titre en bas */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h4 className="text-white font-semibold text-sm mb-1">{deal.title}</h4>
                        <p className="text-white/80 text-xs">Offre limitée</p>
                      </div>

                      {/* Icône coeur */}
                      <button className="absolute top-3 left-3 w-6 h-6 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/40 transition-colors duration-200">
                        <Heart className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation du slider */}
              <button
                onClick={prevBonPlanSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-10"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={nextBonPlanSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-10"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
