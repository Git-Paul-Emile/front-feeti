import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { LiveEventCard } from '../LiveEventCard';
import { Search, Filter, Calendar, MapPin, DollarSign, Monitor, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { SliderOriginalInteractif } from '../SliderOriginalInteractif';

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
  attendees: number;
  maxAttendees: number;
  isLive: boolean;
  isFeatured?: boolean;
  isFavorite?: boolean;
  createdAt?: string;
  organizer: string;
  tags?: string[];
}

interface EventsListPageProps {
  events: Event[];
  onEventSelect: (eventId: string) => void;
  onPurchase?: (eventId: string) => void;
  onStreamWatch?: (eventId: string) => void;
  onWishlist?: (eventId: string) => void;
  initialCategoryFilter?: string;
  initialTypeFilter?: 'all' | 'live' | 'in-person';
  initialFeaturedFilter?: boolean;
  initialMonthFilter?: boolean;
}

export function EventsListPage({
  events,
  onEventSelect,
  onPurchase,
  onStreamWatch,
  onWishlist,
  initialCategoryFilter,
  initialTypeFilter,
  initialFeaturedFilter,
  initialMonthFilter,
}: EventsListPageProps) {

  // ── Tous les filtres sont des states → modifiables + effaçables ──────────
  const [searchTerm,        setSearchTerm]        = useState('');
  const [selectedCategory,  setSelectedCategory]  = useState(initialCategoryFilter || 'all');
  const [selectedLocation,  setSelectedLocation]  = useState('all');
  const [typeFilter,        setTypeFilter]        = useState<'all' | 'live' | 'in-person'>(initialTypeFilter || 'all');
  const [priceRange,        setPriceRange]        = useState('all');
  const [sortBy,            setSortBy]            = useState('newest');
  const [showFeaturedOnly,  setShowFeaturedOnly]  = useState(initialFeaturedFilter ?? false);
  const [showMonthOnly,     setShowMonthOnly]     = useState(initialMonthFilter ?? false);

  // Mettre à jour si les props changent (navigation depuis le menu)
  useEffect(() => { setTypeFilter(initialTypeFilter || 'all'); },       [initialTypeFilter]);
  useEffect(() => { setShowFeaturedOnly(initialFeaturedFilter ?? false); }, [initialFeaturedFilter]);
  useEffect(() => { setShowMonthOnly(initialMonthFilter ?? false); },    [initialMonthFilter]);
  useEffect(() => { setSelectedCategory(initialCategoryFilter || 'all'); }, [initialCategoryFilter]);

  // ── Options dérivées de TOUS les events (pas pré-filtrés) ────────────────
  const categories = useMemo(
    () => ['all', ...Array.from(new Set(events.map(e => e.category))).sort()],
    [events]
  );
  const cities = useMemo(() => {
    // Extraire la ville depuis "Lieu, Ville" → dernier segment après la dernière virgule
    const citySet = new Set(
      events.map(e => {
        const parts = e.location.split(',');
        return parts.length > 1 ? parts[parts.length - 1].trim() : e.location.trim();
      })
    );
    return ['all', ...Array.from(citySet).sort()];
  }, [events]);

  // ── Filtrage + tri en un seul memo ────────────────────────────────────────
  const filteredAndSortedEvents = useMemo(() => {
    const now = new Date();
    const q = searchTerm.toLowerCase();

    const filtered = events.filter(event => {
      // Recherche
      if (q && !event.title.toLowerCase().includes(q) &&
               !event.description.toLowerCase().includes(q) &&
               !event.organizer.toLowerCase().includes(q)) return false;

      // Catégorie
      if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;

      // Ville
      if (selectedLocation !== 'all') {
        const city = event.location.includes(',')
          ? event.location.split(',').pop()!.trim()
          : event.location.trim();
        if (city !== selectedLocation) return false;
      }

      // Type
      if (typeFilter === 'live'       && !event.isLive)  return false;
      if (typeFilter === 'in-person'  &&  event.isLive)  return false;

      // À la une
      if (showFeaturedOnly && !event.isFeatured) return false;

      // Ce mois-ci
      if (showMonthOnly) {
        const d = new Date(event.date);
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
      }

      // Prix (comparaison numérique indépendante de la devise)
      if (priceRange === 'free'   && event.price !== 0)                                 return false;
      if (priceRange === 'low'    && !(event.price > 0     && event.price <= 25000))    return false;
      if (priceRange === 'medium' && !(event.price > 25000 && event.price <= 75000))    return false;
      if (priceRange === 'high'   && !(event.price > 75000))                             return false;

      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':     return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        case 'date':       return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'price-low':  return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'popularity': return b.attendees - a.attendees;
        case 'name':       return a.title.localeCompare(b.title);
        default:           return 0;
      }
    });

    return filtered;
  }, [events, searchTerm, selectedCategory, selectedLocation, typeFilter, showFeaturedOnly, showMonthOnly, priceRange, sortBy]);

  // ── Effacer tous les filtres ──────────────────────────────────────────────
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setTypeFilter('all');
    setPriceRange('all');
    setShowFeaturedOnly(false);
    setShowMonthOnly(false);
  }, []);

  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedLocation !== 'all',
    typeFilter        !== 'all',
    priceRange        !== 'all',
    showFeaturedOnly,
    showMonthOnly,
  ].filter(Boolean).length;

  // ── Titre dynamique ───────────────────────────────────────────────────────
  const pageTitle = typeFilter === 'live'
    ? showFeaturedOnly ? 'Événements live à la une' : 'Événements en live'
    : showFeaturedOnly ? 'Événements à la une'
    : showMonthOnly    ? 'Événements ce mois-ci'
    : 'Tous les événements';

  // ── Scroll horizontal ─────────────────────────────────────────────────────
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentPage,    setCurrentPage]    = useState(0);
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedEvents.length / 4));

  const checkScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    const progress = scrollLeft / (scrollWidth - clientWidth);
    setCurrentPage(Math.round(progress * (totalPages - 1)));
  }, [totalPages]);

  const scrollLeft = useCallback(() => {
    scrollContainerRef.current?.scrollBy({ left: -(scrollContainerRef.current.clientWidth * 0.8), behavior: 'smooth' });
  }, []);

  const scrollRight = useCallback(() => {
    scrollContainerRef.current?.scrollBy({ left: scrollContainerRef.current.clientWidth * 0.8, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScrollButtons();
    el.addEventListener('scroll', checkScrollButtons);
    const onResize = () => setTimeout(checkScrollButtons, 100);
    window.addEventListener('resize', onResize);
    return () => { el.removeEventListener('scroll', checkScrollButtons); window.removeEventListener('resize', onResize); };
  }, [checkScrollButtons]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Slider Original Interactif */}
      <SliderOriginalInteractif
        events={[...events].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())}
        onEventSelect={onEventSelect}
        onPurchase={onPurchase}
        onStreamWatch={onStreamWatch}
        onWishlist={onWishlist}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
            {typeFilter === 'live' && (
              <div className="flex items-center bg-[#de0035] text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                EN DIRECT
              </div>
            )}
            {showFeaturedOnly && (
              <div className="flex items-center bg-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                À la une
              </div>
            )}
          </div>
          <p className="text-gray-600">
          Explorez tous nos événements ( {filteredAndSortedEvents.length} disponible{filteredAndSortedEvents.length !== 1 ? 's' : ''} )
            {showMonthOnly && ' ce mois-ci'}
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">

          {/* Barre de recherche */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Rechercher par titre, description ou organisateur…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base bg-white border-gray-300 focus:border-indigo-500"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sélecteurs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* Catégorie */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Filter className="w-4 h-4" /> Catégorie
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.slice(1).map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ville */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Ville
              </label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Toutes les villes" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {cities.slice(1).map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Monitor className="w-4 h-4 text-red-500" /> Type
              </label>
              <Select value={typeFilter} onValueChange={(v: string) => setTypeFilter(v as 'all' | 'live' | 'in-person')}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="live">Live streaming</SelectItem>
                  <SelectItem value="in-person">En présentiel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prix */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Prix
              </label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Tous les prix" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Tous les prix</SelectItem>
                  <SelectItem value="free">Gratuit</SelectItem>
                  <SelectItem value="low">Petit budget (≤ 25 000)</SelectItem>
                  <SelectItem value="medium">Moyen (25 000 – 75 000)</SelectItem>
                  <SelectItem value="high">Premium (75 000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tri */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Trier par
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="newest">Plus récemment ajouté</SelectItem>
                  <SelectItem value="date">Date (prochain d'abord)</SelectItem>
                  <SelectItem value="price-low">Prix croissant</SelectItem>
                  <SelectItem value="price-high">Prix décroissant</SelectItem>
                  <SelectItem value="popularity">Popularité</SelectItem>
                  <SelectItem value="name">Nom A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtres actifs */}
          {(activeFiltersCount > 0 || searchTerm) && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Filtres actifs :</span>
                {searchTerm        && <Badge variant="secondary" className="bg-gray-100 text-gray-700">"{searchTerm}"</Badge>}
                {selectedCategory !== 'all' && <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">{selectedCategory}</Badge>}
                {selectedLocation !== 'all' && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">{selectedLocation}</Badge>}
                {typeFilter === 'live'       && <Badge variant="secondary" className="bg-red-100 text-red-700">Live</Badge>}
                {typeFilter === 'in-person'  && <Badge variant="secondary" className="bg-blue-100 text-blue-700">Présentiel</Badge>}
                {showFeaturedOnly && <Badge variant="secondary" className="bg-amber-100 text-amber-700">À la une</Badge>}
                {showMonthOnly    && <Badge variant="secondary" className="bg-purple-100 text-purple-700">Ce mois-ci</Badge>}
                {priceRange !== 'all' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {priceRange === 'free' ? 'Gratuit' : priceRange === 'low' ? '≤ 25k' : priceRange === 'medium' ? '25k–75k' : '75k+'}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-gray-800 shrink-0">
                <X className="w-4 h-4 mr-1" /> Tout effacer
              </Button>
            </div>
          )}
        </div>

        {/* Résultats */}
        {filteredAndSortedEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-500 mb-6">Modifiez vos critères de recherche ou effacez les filtres.</p>
            <Button onClick={clearFilters} variant="outline">Effacer tous les filtres</Button>
          </div>
        ) : (
          <div className="relative">
            {/* Flèches de navigation */}
            {filteredAndSortedEvents.length > 4 && (
              <>
                <button
                  onClick={scrollLeft}
                  disabled={!canScrollLeft}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/95 shadow-xl flex items-center justify-center ${
                    canScrollLeft ? 'text-gray-700 hover:text-[#de0035] cursor-pointer' : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={scrollRight}
                  disabled={!canScrollRight}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/95 shadow-xl flex items-center justify-center ${
                    canScrollRight ? 'text-gray-700 hover:text-[#de0035] cursor-pointer' : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Conteneur scroll horizontal */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto scrollbar-hide gap-4 sm:gap-6 lg:gap-8 pb-4 px-12"
            >
              {filteredAndSortedEvents.map(event => (
                <div key={event.id} className="shrink-0 w-72 sm:w-80 lg:w-[350px] xl:w-[380px]">
                  <LiveEventCard
                    event={event}
                    onSelect={onEventSelect}
                    onPurchase={onPurchase}
                    onStreamWatch={onStreamWatch}
                    onWishlist={onWishlist}
                    isFavorite={event.isFavorite}
                  />
                </div>
              ))}
            </div>

            {/* Indicateur de pagination */}
            {filteredAndSortedEvents.length > 4 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentPage === i ? 'bg-[#de0035] w-8' : 'bg-gray-300 w-2'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
