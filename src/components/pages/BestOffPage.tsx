import { useState, useMemo } from 'react';
import { ArrowLeft, Star, Filter, SlidersHorizontal, Sparkles, Crown } from 'lucide-react';
import { BestOffEventCard } from '../BestOffEventCard';
import { CategorySelector } from '../CategorySelector';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

// Types
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

interface BestOffPageProps {
  events: Event[];
  onEventSelect: (eventId: string) => void;
  onPurchase: (eventId: string) => void;
  onBack: () => void;
}

export function BestOffPage({ events, onEventSelect, onPurchase, onBack }: BestOffPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popularity' | 'date' | 'price'>('popularity');

  // Critères pour identifier les événements Best Off
  const bestOffEvents = useMemo(() => {
    return events.filter(event => {
      // Critères pour être "Best Off":
      // 1. Plus de 500 participants OU prix > 50€ OU événement live
      // 2. Organisateur premium
      // 3. Catégories populaires
      const isPopular = event.attendees > 500 || event.price > 50 || event.isLive;
      const isPremiumOrganizer = ['MusicEvents Pro', 'TechEvents', 'Paris Fashion Group', 'PSG Officiel'].includes(event.organizer);
      const isPremiumCategory = ['Music', 'Fashion', 'Sport', 'Technology'].includes(event.category);
      
      return isPopular || isPremiumOrganizer || isPremiumCategory;
    });
  }, [events]);

  // Filtrage par catégorie
  const filteredEvents = useMemo(() => {
    let filtered = bestOffEvents;
    
    if (selectedCategory && selectedCategory !== 'Tous') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Tri
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.attendees - a.attendees;
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'price':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }, [bestOffEvents, selectedCategory, sortBy]);

  const handleWishlist = (eventId: string) => {
    // Mock wishlist functionality
    console.log('Added to wishlist:', eventId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-[#4338ca] via-[#de0035] to-[#059669] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Navigation Back */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </button>

          {/* Title Section */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-amber-300" />
              <h1 className="text-white font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl">
                BEST OFF
              </h1>
              <Sparkles className="w-8 h-8 text-amber-300" />
            </div>
            
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Découvrez notre sélection d'événements premium et exclusifs. 
              Les expériences les plus recherchées de Feeti.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 text-white/80">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{filteredEvents.length}</div>
                <div className="text-sm">Événements Premium</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {filteredEvents.filter(e => e.isLive).length}
                </div>
                <div className="text-sm">En Live</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {Math.round(filteredEvents.reduce((acc, e) => acc + e.attendees, 0) / filteredEvents.length)}
                </div>
                <div className="text-sm">Participants Moy.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Category Selector */}
            <div className="flex-1 w-full lg:w-auto">
              <CategorySelector
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                categories={['Tous', 'Music', 'Fashion', 'Sport', 'Technology', 'Art']}
              />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Trier par:</span>
              </div>
              
              <div className="flex gap-2">
                {[
                  { key: 'popularity', label: 'Popularité', icon: Star },
                  { key: 'date', label: 'Date', icon: null },
                  { key: 'price', label: 'Prix', icon: null }
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={sortBy === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy(key as any)}
                    className="flex items-center gap-1"
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    <span className="hidden sm:inline">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {selectedCategory && selectedCategory !== 'Tous' && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600">Filtres actifs:</span>
              <Badge 
                variant="secondary" 
                className="gap-1 cursor-pointer"
                onClick={() => setSelectedCategory('')}
              >
                {selectedCategory}
                <button className="ml-1 hover:bg-gray-300 rounded-full p-0.5">×</button>
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucun événement Best Off trouvé
            </h3>
            <p className="text-gray-500 mb-6">
              Essayez de modifier vos filtres pour découvrir plus d'événements premium.
            </p>
            <Button 
              onClick={() => {
                setSelectedCategory('');
                setSortBy('popularity');
              }}
              className="bg-gradient-to-r from-[#4338ca] to-[#de0035] hover:from-[#3730a3] hover:to-[#b91c3c]"
            >
              <Filter className="w-4 h-4 mr-2" />
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredEvents.length} Événement{filteredEvents.length > 1 ? 's' : ''} Premium
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedCategory && selectedCategory !== 'Tous' 
                    ? `Catégorie: ${selectedCategory}` 
                    : 'Toutes catégories'
                  } • Trié par {
                    sortBy === 'popularity' ? 'popularité' : 
                    sortBy === 'date' ? 'date' : 'prix'
                  }
                </p>
              </div>
            </div>

            {/* Events Grid */}
            <div className="best-off-grid">
              {filteredEvents.map((event) => (
                <BestOffEventCard
                  key={event.id}
                  event={event}
                  onPurchase={onPurchase}
                  onWishlist={handleWishlist}
                  onEventSelect={onEventSelect}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* CTA Section */}
      {filteredEvents.length > 0 && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4">
              Vous cherchez d'autres événements ?
            </h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Explorez tous nos événements ou créez votre propre événement premium sur Feeti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => onBack()}
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                Voir tous les événements
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900"
              >
                Créer un événement
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}