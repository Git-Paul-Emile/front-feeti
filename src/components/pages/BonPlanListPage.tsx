import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import {
  Search,
  Calendar,
  MapPin,
  Gift,
  Clock,
  Star,
  ArrowLeft,
  Heart,
  Percent,
  Tag,
  ChevronLeft,
  ChevronRight,
  Play,
  Loader2,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { BonPlanCard } from '../BonPlanCard';
import { toast } from 'sonner';
import DealsBackendAPI, { type BackendDeal, type DealFilters, type DealCategory } from '../../services/api/DealsBackendAPI';
import EventsBackendAPI, { type BackendEvent } from '../../services/api/EventsBackendAPI';

interface BonPlan {
  id: string;
  title: string;
  description: string;
  category: 'weekly' | 'general' | 'feeti-na-feeti' | 'restaurants' | 'hotels' | 'activities' | 'shopping';
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  validUntil: string;
  location: string;
  image: string;
  isPopular: boolean;
  merchantName: string;
  tags: string[];
  availableQuantity?: number;
  maxQuantity?: number;
  rating?: number;
  reviewCount?: number;
}

interface BonPlanListPageProps {
  onBack: () => void;
  initialFilter?: string;
  onDealSelect?: (id: string) => void;
}

const DEAL_CATEGORIES_FALLBACK = [
  { slug: 'weekly', name: 'Hebdomadaire' },
  { slug: 'general', name: 'Général' },
  { slug: 'feeti-na-feeti', name: 'Feeti Na Feeti' },
  { slug: 'restaurants', name: 'Restaurants' },
  { slug: 'hotels', name: 'Hôtels' },
  { slug: 'activities', name: 'Activités' },
  { slug: 'shopping', name: 'Shopping' },
];

const PAGE_LIMIT = 12;

const WEEKDAYS = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
const MONTHS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];
function formatSliderDate(dateStr: string, time?: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const base = `${WEEKDAYS[d.getDay()]} ${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} | ${d.getFullYear()}`;
  return time ? `${base} · ${time}` : base;
}

function backendDealToBonPlan(d: BackendDeal): BonPlan {
  let tags: string[] = [];
  try { tags = JSON.parse(d.tags); } catch { tags = []; }
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    category: d.category as BonPlan['category'],
    originalPrice: d.originalPrice,
    discountedPrice: d.discountedPrice,
    discount: d.discount,
    validUntil: d.validUntil,
    location: d.location,
    image: d.image,
    isPopular: d.isPopular,
    merchantName: d.merchantName,
    tags,
    availableQuantity: d.availableQuantity ?? undefined,
    maxQuantity: d.maxQuantity ?? undefined,
    rating: d.rating ?? undefined,
    reviewCount: d.reviewCount ?? undefined,
  };
}

export function BonPlanListPage({ onBack, initialFilter, onDealSelect }: BonPlanListPageProps) {
  const [plans, setPlans] = useState<BonPlan[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [dealCategories, setDealCategories] = useState<Pick<DealCategory, 'slug' | 'name'>[]>(DEAL_CATEGORIES_FALLBACK);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialFilter || 'all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [discountRange, setDiscountRange] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentReplaySlide, setCurrentReplaySlide] = useState(0);
  const [sliderEvents, setSliderEvents] = useState<BackendEvent[]>([]);

  // Debounce search
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    DealsBackendAPI.getLocations().then(setLocations).catch(() => {});
    DealsBackendAPI.getDealCategories()
      .then(cats => setDealCategories(cats.map(c => ({ slug: c.slug, name: c.name }))))
      .catch(() => {});
    EventsBackendAPI.getAllEvents()
      .then(evts => setSliderEvents(evts.filter(e => e.status === 'published' && e.isFeatured)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchTerm]);

  const buildFilters = useCallback((currentPage: number): DealFilters => ({
    search: debouncedSearch || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    location: selectedLocation !== 'all' ? selectedLocation : undefined,
    discountRange: discountRange !== 'all' ? discountRange as DealFilters['discountRange'] : undefined,
    priceRange: priceRange !== 'all' ? priceRange as DealFilters['priceRange'] : undefined,
    sortBy: sortBy as DealFilters['sortBy'],
    page: currentPage,
    limit: PAGE_LIMIT,
  }), [debouncedSearch, selectedCategory, selectedLocation, discountRange, priceRange, sortBy]);

  // Reset to page 1 and reload when filters change
  useEffect(() => {
    setPage(1);
    setPlans([]);
    setLoading(true);
    DealsBackendAPI.getDeals(buildFilters(1))
      .then(({ data, meta }) => {
        setPlans(data.map(backendDealToBonPlan));
        setTotal(meta.total);
        setHasMore(meta.hasMore);
      })
      .catch(() => toast.error('Erreur lors du chargement des bons plans'))
      .finally(() => setLoading(false));
  }, [buildFilters]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    DealsBackendAPI.getDeals(buildFilters(nextPage))
      .then(({ data, meta }) => {
        setPlans(prev => [...prev, ...data.map(backendDealToBonPlan)]);
        setHasMore(meta.hasMore);
        setPage(nextPage);
      })
      .catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setLoadingMore(false));
  };

  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedLocation !== 'all',
    discountRange !== 'all',
    priceRange !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedLocation('all');
    setDiscountRange('all');
    setPriceRange('all');
    setSearchTerm('');
  };

  const nextReplaySlide = () => setCurrentReplaySlide(p => (p + 1) % sliderEvents.length);
  const prevReplaySlide = () => setCurrentReplaySlide(p => (p - 1 + sliderEvents.length) % sliderEvents.length);
  const currentSlide = sliderEvents[currentReplaySlide] ?? null;

  const formatPrice = (price: number) => new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';


  const getDaysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ));

  const handleCTAClick = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) toast.success(`Redirection vers l'achat de: ${plan.title}`);
  };

  const handleWishlistToggle = (planId: string, isAdded: boolean) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      isAdded ? toast.success(`${plan.title} ajouté à vos favoris`) : toast.info(`${plan.title} retiré de vos favoris`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="outline" size="sm" onClick={onBack} className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tous nos bons plans</h1>
          <p className="text-gray-600">
            {loading ? 'Chargement...' : `Découvrez ${total} offre${total > 1 ? 's' : ''} exceptionnelle${total > 1 ? 's' : ''} et économisez sur vos sorties`}
          </p>
        </div>

        {/* Slider Events */}
        {sliderEvents.length > 0 && currentSlide && (
          <div className="relative mb-8 lg:mb-12">
            <div className="relative h-[300px] sm:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-all duration-700 ease-in-out" style={{ backgroundImage: currentSlide.image ? `url('${currentSlide.image}')` : undefined }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[#03033b]/80 via-[#16bda0]/40 to-transparent" />

              <button onClick={prevReplaySlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10">
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              <button onClick={nextReplaySlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>

              <div className="absolute inset-0 flex items-end p-6 sm:p-8 lg:p-12">
                <div className="w-full max-w-2xl">
                  <p className="text-white/75 text-sm mb-2">{currentSlide.organizer?.name || currentSlide.category}</p>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">{currentSlide.title}</h2>
                  <p className="text-[#16bea1] text-lg sm:text-xl font-semibold mb-3">{formatSliderDate(currentSlide.date, currentSlide.time)}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-[#16bda0]" />
                    <p className="text-[#16bea1] text-sm sm:text-base">{currentSlide.location}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentSlide.isLive && (
                      <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                        <Play className="w-3 h-3 text-[#de0035] mr-1.5 fill-current" />
                        <span className="text-white text-xs font-medium">EN LIVE STREAMING</span>
                      </div>
                    )}
                    {currentSlide.attendees < currentSlide.maxAttendees && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                        <span className="text-white text-xs font-medium">Places disponibles</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => toast.info('Redirection vers l\'événement...')} className="inline-flex items-center bg-white hover:scale-105 transition-all duration-300 shadow-lg rounded-lg overflow-hidden group/btn">
                    <div className="bg-[#de0035] w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center group-hover/btn:bg-[#c00030] transition-colors duration-200">
                      <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-white" />
                    </div>
                    <span className="px-3 py-2 text-sm font-semibold text-black">Voir l'événement</span>
                  </button>
                </div>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {sliderEvents.map((_, index) => (
                  <button key={index} onClick={() => setCurrentReplaySlide(index)} className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === currentReplaySlide ? 'bg-[#16bda0] scale-125' : 'bg-white/40 hover:bg-white/60'}`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div style={{ backgroundColor: '#000441' }} className="rounded-xl border border-gray-200 p-6 mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
            <Input
              placeholder="Rechercher par nom, description, marchand ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <Tag className="w-4 h-4 mr-2" />Catégorie
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger><SelectValue placeholder="Toutes les catégories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {dealCategories.map(c => (
                    <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <MapPin className="w-4 h-4 mr-2" />Lieu
              </label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger><SelectValue placeholder="Tous les lieux" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les lieux</SelectItem>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <Percent className="w-4 h-4 mr-2" />Réduction
              </label>
              <Select value={discountRange} onValueChange={setDiscountRange}>
                <SelectTrigger><SelectValue placeholder="Toutes les réductions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les réductions</SelectItem>
                  <SelectItem value="low">Jusqu'à 25%</SelectItem>
                  <SelectItem value="medium">25% – 40%</SelectItem>
                  <SelectItem value="high">Plus de 40%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <Gift className="w-4 h-4 mr-2" />Prix final
              </label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger><SelectValue placeholder="Tous les prix" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les prix</SelectItem>
                  <SelectItem value="low">Moins de 20 000 FCFA</SelectItem>
                  <SelectItem value="medium">20 000 – 50 000 FCFA</SelectItem>
                  <SelectItem value="high">Plus de 50 000 FCFA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <Calendar className="w-4 h-4 mr-2" />Trier par
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularité</SelectItem>
                  <SelectItem value="discount-high">Réduction décroissante</SelectItem>
                  <SelectItem value="discount-low">Réduction croissante</SelectItem>
                  <SelectItem value="price-low">Prix croissant</SelectItem>
                  <SelectItem value="price-high">Prix décroissant</SelectItem>
                  <SelectItem value="ending-soon">Fin prochaine</SelectItem>
                  <SelectItem value="name">Nom A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Affichage</label>
              <div className="flex space-x-2">
                <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')} className="flex-1">Grille</Button>
                <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')} className="flex-1">Liste</Button>
              </div>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-sm text-white">Filtres actifs :</span>
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                    {dealCategories.find(c => c.slug === selectedCategory)?.name ?? selectedCategory}
                  </Badge>
                )}
                {selectedLocation !== 'all' && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">{selectedLocation}</Badge>}
                {discountRange !== 'all' && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    Réduction : {discountRange === 'low' ? '≤25%' : discountRange === 'medium' ? '25–40%' : '>40%'}
                  </Badge>
                )}
                {priceRange !== 'all' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Prix : {priceRange === 'low' ? '<20k' : priceRange === 'medium' ? '20k–50k' : '>50k'} FCFA
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white hover:bg-white/10">Effacer les filtres</Button>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {loading ? 'Chargement...' : `${total} bon${total > 1 ? 's' : ''} plan${total > 1 ? 's' : ''} trouvé${total > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun bon plan trouvé</h3>
            <p className="text-gray-600 mb-6">Essayez de modifier vos critères de recherche ou vos filtres</p>
            <Button onClick={clearFilters} variant="outline">Effacer tous les filtres</Button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center">
                {plans.map(plan => (
                  <BonPlanCard key={plan.id} plan={plan} variant="compact" onCTAClick={handleCTAClick} onWishlistToggle={handleWishlistToggle} onClick={onDealSelect} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map(plan => {
                  const daysRemaining = getDaysRemaining(plan.validUntil);
                  return (
                    <Card key={plan.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => onDealSelect?.(plan.id)}>
                      <div className="flex">
                        <div className="w-32 h-32 flex-shrink-0">
                          <ImageWithFallback src={plan.image} alt={plan.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg line-clamp-1">{plan.title}</h3>
                            <div className="flex items-center space-x-2">
                              {plan.isPopular && (
                                <Badge className="bg-red-500 text-white text-xs">
                                  <Star className="w-3 h-3 mr-1" />Populaire
                                </Badge>
                              )}
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">-{plan.discount}%</Badge>
                            </div>
                          </div>
                          {plan.rating !== undefined && (
                            <div className="flex items-center mb-2">
                              {renderStars(plan.rating)}
                              <span className="text-sm text-gray-600 ml-2">({plan.reviewCount} avis)</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" /><span>{plan.location}</span>
                            <Clock className="w-4 h-4 mr-1 ml-3" />
                            <span>{daysRemaining > 0 ? `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}` : 'Expiré'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl font-bold text-indigo-600">{formatPrice(plan.discountedPrice)}</span>
                              <span className="text-sm text-gray-500 line-through">{formatPrice(plan.originalPrice)}</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline"><Heart className="w-4 h-4" /></Button>
                              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => handleCTAClick(plan.id)}>Profiter</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />Chargement...
                    </>
                  ) : (
                    `Charger plus de bons plans (${plans.length} / ${total})`
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
