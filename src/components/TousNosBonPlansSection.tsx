import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, MapPin } from 'lucide-react';
import EventsBackendAPI, { type BackendEvent } from '../services/api/EventsBackendAPI';

interface TousNosBonPlansSectionProps {
  onNavigate: (page: string, params?: any) => void;
}

const WEEKDAYS = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
const MONTHS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];

function formatSliderDate(dateStr: string, time?: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const base = `${WEEKDAYS[d.getDay()]} ${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} | ${d.getFullYear()}`;
  return time ? `${base} · ${time}` : base;
}

export function TousNosBonPlansSection({ onNavigate }: TousNosBonPlansSectionProps) {
  const [sliderEvents, setSliderEvents] = useState<BackendEvent[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    EventsBackendAPI.getAllEvents()
      .then(evts => setSliderEvents(evts.filter(e => e.status === 'published' && e.isFeatured)))
      .catch(() => {});
  }, []);

  const nextSlide = () => setCurrentSlide(p => (p + 1) % sliderEvents.length);
  const prevSlide = () => setCurrentSlide(p => (p - 1 + sliderEvents.length) % sliderEvents.length);

  const currentEvent = sliderEvents[currentSlide] ?? null;

  if (sliderEvents.length === 0 || !currentEvent) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Tous nos bons plans
            </h2>
            <p className="text-gray-600">
              Découvrez nos meilleures offres et réductions
            </p>
          </div>
          <button
            onClick={() => onNavigate('deals-list')}
            className="h-10 lg:h-11 px-6 lg:px-8 border border-[#000441] bg-transparent text-[#000441] rounded-lg flex items-center justify-center gap-3 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000441] focus-visible:ring-offset-2 relative overflow-hidden group transition-colors duration-300"
          >
            <div className="absolute inset-0 bg-[#000441] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left rounded-lg"></div>
            <span className="text-sm lg:text-base relative z-10 group-hover:text-white transition-colors duration-300">
              voir plus
            </span>
            <div className="w-4 h-4 lg:w-5 lg:h-5 relative z-10 group-hover:text-white transition-colors duration-300">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 21">
                <path
                  d="M11.5 1L21 10.5M21 10.5L11.5 20M21 10.5H1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Slider */}
        <div className="relative h-[300px] sm:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden group">
          <div
            className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-all duration-700 ease-in-out"
            style={{ backgroundImage: currentEvent.image ? `url('${currentEvent.image}')` : undefined }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#03033b]/80 via-[#16bda0]/40 to-transparent" />

          {/* Navigation arrows */}
          {sliderEvents.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </>
          )}

          {/* Contenu */}
          <div className="absolute inset-0 flex items-end p-6 sm:p-8 lg:p-12">
            <div className="w-full max-w-2xl">
              <p className="text-white/75 text-sm mb-2">
                {currentEvent.organizer?.name || currentEvent.category}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                {currentEvent.title}
              </h2>
              <p className="text-[#16bea1] text-lg sm:text-xl font-semibold mb-3">
                {formatSliderDate(currentEvent.date, currentEvent.time)}
              </p>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-[#16bda0]" />
                <p className="text-[#16bea1] text-sm sm:text-base">{currentEvent.location}</p>
              </div>
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
              <button
                onClick={() => onNavigate('events')}
                className="inline-flex items-center bg-white hover:scale-105 transition-all duration-300 shadow-lg rounded-lg overflow-hidden group/btn"
              >
                <div className="bg-[#de0035] w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center group-hover/btn:bg-[#c00030] transition-colors duration-200">
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-white" />
                </div>
                <span className="px-3 py-2 text-sm font-semibold text-black">Voir l'événement</span>
              </button>
            </div>
          </div>

          {/* Indicateurs */}
          {sliderEvents.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {sliderEvents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-[#16bda0] scale-125' : 'bg-white/40 hover:bg-white/60'
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
