/**
 * ArgentSlider — Slider Pack ARGENT
 * Affiché sous la bannière principale (hero slider), avant les catégories.
 * Selon le PDF : "Slider sous la bannière principale + top positions section En live ce mois"
 * Limité aux événements Pack ARGENT actifs (max 5).
 */
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Ticket, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  organizer: string;
  isLive: boolean;
  promotionType?: string | null;
  promotionStatus?: string | null;
  promotionStartDate?: string | null;
  promotionEndDate?: string | null;
}

interface ArgentSliderProps {
  events: Event[];
  onPurchase?: (eventId: string) => void;
}

export function ArgentSlider({ events, onPurchase }: ArgentSliderProps) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Filtrer les événements Pack ARGENT actifs uniquement
  const argentEvents = events.filter(
    e => isEventPromotionActive(e) && e.promotionType === 'ARGENT'
  );

  useEffect(() => {
    if (!isAutoPlaying || argentEvents.length <= 1) return;
    const id = setInterval(() => setCurrent(p => (p + 1) % argentEvents.length), 5000);
    return () => clearInterval(id);
  }, [isAutoPlaying, argentEvents.length]);

  // Reset si les events changent
  useEffect(() => {
    if (current >= argentEvents.length) setCurrent(0);
  }, [argentEvents.length]);

  const prev = useCallback(() => {
    setCurrent(p => (p - 1 + argentEvents.length) % argentEvents.length);
    setIsAutoPlaying(false);
  }, [argentEvents.length]);

  const next = useCallback(() => {
    setCurrent(p => (p + 1) % argentEvents.length);
    setIsAutoPlaying(false);
  }, [argentEvents.length]);

  if (argentEvents.length === 0) return null;

  const event = argentEvents[current];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatPrice = (price: number, currency: string) =>
    price === 0 ? 'Gratuit' : `${price.toLocaleString('fr-FR')} ${currency}`;

  return (
    <section className="bg-white py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Label section */}
        <div className="flex items-center gap-3 mb-3">
          <EventPromotionBadge promotionType="ARGENT" size="md" />
          <span className="text-sm text-gray-500 font-medium">Événements recommandés</span>
        </div>

        {/* Slider compact */}
        <div className="relative rounded-xl overflow-hidden group h-[180px] sm:h-[220px] lg:h-[260px]">
          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: event.image ? `url('${event.image}')` : undefined }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-800/50 to-transparent" />

          {/* Navigation */}
          {argentEvents.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-10"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-10"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </>
          )}

          {/* Contenu */}
          <div className="absolute inset-0 flex items-center p-5 sm:p-8">
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-xs sm:text-sm mb-1 uppercase tracking-wide">
                {event.organizer} · {event.category}
              </p>
              <h3 className="text-white text-lg sm:text-2xl lg:text-3xl font-bold leading-tight mb-2 truncate">
                {event.title}
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-slate-300 text-xs sm:text-sm">
                  {formatDate(event.date)} · {event.time}
                </span>
                <span className="flex items-center gap-1 text-slate-300 text-xs sm:text-sm">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </span>
                <span className="text-emerald-400 font-semibold text-sm sm:text-base">
                  {formatPrice(event.price, event.currency)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="hidden sm:flex flex-col gap-2 ml-6 shrink-0">
              <button
                onClick={() => onPurchase?.(event.id)}
                className="flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 transition-colors px-4 py-2 rounded-lg text-sm font-semibold shadow"
              >
                <Ticket className="w-4 h-4" />
                Acheter
              </button>
              <button
                onClick={() => navigate(`/events/${event.id}`)}
                className="text-center text-white/80 hover:text-white text-xs underline transition-colors"
              >
                Voir détails
              </button>
            </div>
          </div>

          {/* Indicateurs */}
          {argentEvents.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {argentEvents.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); setIsAutoPlaying(false); }}
                  className={`rounded-full transition-all duration-300 ${
                    i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
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
