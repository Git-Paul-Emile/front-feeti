import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, MapPin } from 'lucide-react';
import EventsBackendAPI from '../services/api/EventsBackendAPI';

interface ReplaySliderProps {
  onNavigate: (page: string) => void;
}

interface SlideEvent {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  image: string;
  isStreaming: boolean;
}

function adaptToSlide(e: { id: string; title: string; organizer?: { name: string }; date: string; time: string; location: string; image: string; isLive: boolean }): SlideEvent {
  return {
    id: e.id,
    title: e.title.toUpperCase(),
    subtitle: e.organizer?.name?.toUpperCase() || 'FEETI EVENTS',
    date: formatSlideDate(e.date) + ' | ' + new Date(e.date).getFullYear(),
    location: e.location,
    image: e.image,
    isStreaming: e.isLive,
  };
}

function formatSlideDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
  const months = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

export function ReplaySlider({ onNavigate }: ReplaySliderProps) {
  const [currentReplaySlide, setCurrentReplaySlide] = useState(0);
  const [slides, setSlides] = useState<SlideEvent[]>([]);

  useEffect(() => {
    EventsBackendAPI.getAllEvents()
      .then(data => {
        const now = new Date();
        // Prend les événements passés (ou tous si aucun passé), max 5
        const past = data.filter(e => new Date(e.date) < now);
        const source = past.length > 0 ? past : data;
        setSlides(source.slice(0, 5).map(adaptToSlide));
      })
      .catch(() => {});
  }, []);

  if (slides.length === 0) return null;

  const currentSlide = slides[currentReplaySlide];

  const nextReplaySlide = () => {
    setCurrentReplaySlide((prev) => (prev + 1) % slides.length);
  };

  const prevReplaySlide = () => {
    setCurrentReplaySlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 mx-4 sm:mx-6 lg:mx-8 xl:mx-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Slider Principal - Replay */}
        <div className="relative">
          <div className="relative h-[300px] sm:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden group">
            {/* Image de fond avec transition */}
            <div
              className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-all duration-700 ease-in-out"
              style={{ backgroundImage: `url('${currentSlide.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#03033b]/80 via-[#16bda0]/40 to-transparent" />

            {/* Navigation arrows */}
            {slides.length > 1 && (
              <>
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
              </>
            )}

            {/* Contenu textuel */}
            <div className="absolute inset-0 flex items-end p-6 sm:p-8 lg:p-12">
              <div className="w-full max-w-2xl">
                <p className="text-white/75 text-sm mb-2">{currentSlide.subtitle}</p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                  {currentSlide.title}
                </h2>
                <p className="text-[#16bea1] text-lg sm:text-xl font-semibold mb-3">{currentSlide.date}</p>

                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-[#16bda0]" />
                  <p className="text-[#16bea1] text-sm sm:text-base">{currentSlide.location}</p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentSlide.isStreaming && (
                    <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <Play className="w-3 h-3 text-[#de0035] mr-1.5 fill-current" />
                      <span className="text-white text-xs font-medium">EN LIVE STREAMING</span>
                    </div>
                  )}
                  <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <span className="text-white text-xs font-medium">Replay disponible</span>
                  </div>
                </div>

                {/* Bouton Play */}
                <button
                  onClick={() => onNavigate('replay')}
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
            {slides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, index) => (
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export { ReplaySlider };
