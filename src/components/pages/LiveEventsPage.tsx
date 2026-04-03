import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, Play, Pause, Volume2, Settings, Maximize, Share, MapPin, Video, Music, Brush, Star, Users, Clock } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import imgImage from "figma:asset/9642a472e265d7dba7788f22c0c3a3264707bf05.png";
import imgImage1 from "figma:asset/9389257a4ecca2067419f928c95ebd912fdb4108.png";
import imgImage2 from "figma:asset/1c01af871b4aec1a5f99c8d43d12cb57caf4a34a.png";
import imgImage3 from "figma:asset/f223555fb04d576a7a9ff4191817d63db7d110a8.png";
import imgImage4 from "figma:asset/0d23ccb8f22ce6b0632355075fe579927c44df21.png";
import imgBackground from "figma:asset/19536bec16c0d6075d4e7f275621f79f40795d59.png";

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

interface LiveEventsPageProps {
  events: Event[];
  onBack: () => void;
  onEventSelect: (eventId: string) => void;
  onStreamWatch: (eventId: string) => void;
  onPurchase: (eventId: string) => void;
  onWishlist?: (eventId: string) => void;
  currentUser: any;
}

interface CategoryTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

// SVG Icon Components
function VideoIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="video">
        <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="sound">
        <path d="M3 8.25V15.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M7.5 5.75V18.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M12 3.25V20.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M16.5 5.75V18.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M21 8.25V15.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function BrushIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="brush">
        <path d="M21 12H14L12 21L10 12H3L12 3L21 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M12 3V21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M8 7L16 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function MusicnoteIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="musicnote">
        <path d="M9 18V5L21 3V16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M11.97 18V4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M6 15.27A2.5 2.5 0 1 1 9 18.27V5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function SportIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="sport">
        <path d="M6.5 6.5H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M8 6.5V4.5C8 3.95 8.45 3.5 9 3.5H15C15.55 3.5 16 3.95 16 4.5V6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M4 8.5V18.5C4 19.05 4.45 19.5 5 19.5H19C19.55 19.5 20 19.05 20 18.5V8.5C20 7.95 19.55 7.5 19 7.5H5C4.45 7.5 4 7.95 4 8.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

// Category Tab Component pour LiveEventsPage
function CategoryTab({ icon, label, isSelected, onClick }: {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group box-border flex items-center justify-center px-[20px] py-[12px] relative rounded-[100px] shrink-0 transition-all duration-300 hover:scale-105 active:scale-95 min-h-[48px] touch-manipulation ${
        isSelected 
          ? 'bg-[#cdff71] shadow-lg shadow-[#cdff71]/25 ring-2 ring-[#000441]/20' 
          : 'bg-white hover:bg-gray-50 hover:shadow-md'
      }`}
      data-name="Selector Tab"
      title={isSelected ? `${label} - Catégorie active (cliquer pour désélectionner)` : `Sélectionner ${label}`}
    >
      {!isSelected && (
        <div aria-hidden="true" className="absolute border-[#dfe1e4] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      )}
      
      {/* Active indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#000441] rounded-full animate-pulse" />
      )}
      
      <div className="flex gap-[8px] items-center justify-center relative shrink-0">
        <div className="relative shrink-0 size-[24px]" data-name={label.toLowerCase()}>
          {icon}
        </div>
        <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center relative shrink-0 text-[#000441] text-[14px] text-nowrap">
          <p className="leading-[normal] whitespace-pre">{label}</p>
        </div>
      </div>
    </button>
  );
}

const categoryTabs: CategoryTab[] = [
  { id: 'cinema', label: 'Cinema', icon: <VideoIcon />, isActive: true },
  { id: 'concert', label: 'Concert', icon: <SoundIcon /> },
  { id: 'art', label: 'Art', icon: <BrushIcon /> },
  { id: 'music', label: 'Music', icon: <MusicnoteIcon /> },
  { id: 'sport', label: 'Sport', icon: <SportIcon /> },
  { id: 'theatre', label: 'Théâtre', icon: <BrushIcon /> },
  { id: 'danse', label: 'Danse', icon: <MusicnoteIcon /> },
  { id: 'comedy', label: 'Comédie', icon: <VideoIcon /> },
  { id: 'festival', label: 'Festival', icon: <SoundIcon /> },
  { id: 'outdoor', label: 'Outdoor', icon: <SportIcon /> },
  { id: 'family', label: 'Famille', icon: <VideoIcon /> },
  { id: 'nightlife', label: 'Nightlife', icon: <SoundIcon /> }
];

export function LiveEventsPage({ 
  events, 
  onBack, 
  onEventSelect, 
  onStreamWatch, 
  onPurchase,
  currentUser 
}: LiveEventsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const categorySliderRef = useRef<HTMLDivElement>(null);
  
  // États pour gérer les sliders de chaque rangée
  const [rowSliderIndices, setRowSliderIndices] = useState<{[key: number]: number}>({});
  const rowSliderRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

  // Filtre les événements en direct depuis les props
  const liveEvents = useMemo(() => 
    events.filter(event => event.isLive),
    [events]
  );

  // Mapper les catégories des événements aux onglets de catégorie
  const mapEventCategoryToTab = (eventCategory: string) => {
    const categoryMap: { [key: string]: string } = {
      'Music': 'Music',
      'Concert': 'Concert', 
      'Art': 'Art',
      'Theatre': 'Théâtre',
      'Dance': 'Danse',
      'Comedy': 'Comédie',
      'Festival': 'Festival',
      'Sport': 'Sport',
      'Cinema': 'Cinema',
      'Business': 'Cinema', // Map business to cinema for now
      'Outdoor': 'Outdoor',
      'Family': 'Famille',
      'Nightlife': 'Nightlife'
    };
    return categoryMap[eventCategory] || 'Cinema';
  };

  const filteredEvents = useMemo(() => {
    if (!selectedCategory || selectedCategory === '') {
      return liveEvents;
    }
    
    return liveEvents.filter(event => {
      const mappedCategory = mapEventCategoryToTab(event.category);
      return mappedCategory.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [selectedCategory, liveEvents]);

  // Category selection handler avec scroll automatique
  const handleCategoryClick = (categoryLabel: string) => {
    if (selectedCategory === categoryLabel) {
      setSelectedCategory(''); // Désélectionner
    } else {
      setSelectedCategory(categoryLabel);
      
      // Scroll automatique vers la catégorie sélectionnée
      if (categorySliderRef.current) {
        const categoryIndex = categoryTabs.findIndex(cat => cat.label === categoryLabel);
        const categoryContainer = categorySliderRef.current.children[0] as HTMLElement;
        
        if (categoryContainer && categoryIndex >= 0) {
          const categoryElement = categoryContainer.children[categoryIndex] as HTMLElement;
          
          if (categoryElement) {
            const containerWidth = categorySliderRef.current.offsetWidth;
            const elementWidth = categoryElement.offsetWidth;
            const elementLeft = categoryElement.offsetLeft;
            
            // Calcul pour centrer l'élément
            const scrollLeft = elementLeft - (containerWidth / 2) + (elementWidth / 2);
            
            // Scroll avec requestAnimationFrame pour meilleure performance
            requestAnimationFrame(() => {
              if (categorySliderRef.current) {
                categorySliderRef.current.scrollTo({
                  left: Math.max(0, scrollLeft),
                  behavior: 'smooth'
                });
              }
            });
          }
        }
      }
    }
  };

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Fonctions de navigation pour les sliders de rangées
  const getCardsPerView = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    const width = window.innerWidth;
    if (width < 768) return 1; // Mobile: 1 carte visible
    if (width < 1024) return 2; // Tablette: 2 cartes visibles
    return 3; // Desktop: 3 cartes visibles
  }, []);

  const scrollToCard = useCallback((rowIndex: number, direction: 'prev' | 'next') => {
    const slider = rowSliderRefs.current[rowIndex];
    if (!slider) return;

    const cardsPerView = getCardsPerView();
    const cardWidth = window.innerWidth < 768 ? 280 : 320;
    const gap = window.innerWidth < 768 ? 16 : 24;
    const scrollDistance = cardWidth + gap;

    const currentIndex = rowSliderIndices[rowIndex] || 0;
    const maxIndex = Math.max(0, filteredEvents.length - cardsPerView);
    
    let newIndex;
    if (direction === 'next') {
      newIndex = Math.min(currentIndex + 1, maxIndex);
    } else {
      newIndex = Math.max(currentIndex - 1, 0);
    }

    // Mettre à jour l'état
    setRowSliderIndices(prev => ({
      ...prev,
      [rowIndex]: newIndex
    }));

    // Scroll fluide
    slider.scrollTo({
      left: newIndex * scrollDistance,
      behavior: 'smooth'
    });
  }, [filteredEvents.length, rowSliderIndices, getCardsPerView]);

  const canScrollPrev = useCallback((rowIndex: number) => {
    return (rowSliderIndices[rowIndex] || 0) > 0;
  }, [rowSliderIndices]);

  const canScrollNext = useCallback((rowIndex: number) => {
    const currentIndex = rowSliderIndices[rowIndex] || 0;
    const cardsPerView = getCardsPerView();
    const maxIndex = Math.max(0, filteredEvents.length - cardsPerView);
    return currentIndex < maxIndex;
  }, [rowSliderIndices, filteredEvents.length, getCardsPerView]);

  // Réinitialiser les indices lors du redimensionnement
  const handleResize = useCallback(() => {
    setRowSliderIndices({});
  }, []);

  // Effect pour gérer le redimensionnement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [handleResize]);

  // Effect pour optimiser le scroll des catégories et ajouter des indicateurs
  useEffect(() => {
    const categorySlider = categorySliderRef.current;
    if (categorySlider) {
      // Optimiser le scroll touch sur mobile
      const handleTouchStart = () => {
        categorySlider.style.scrollBehavior = 'auto';
      };
      
      const handleTouchEnd = () => {
        setTimeout(() => {
          categorySlider.style.scrollBehavior = 'smooth';
        }, 100);
      };

      // Indicateurs de scroll disponible
      const updateScrollIndicators = () => {
        const scrollLeft = categorySlider.scrollLeft;
        const scrollWidth = categorySlider.scrollWidth;
        const clientWidth = categorySlider.clientWidth;
        
        if (scrollLeft > 10) {
          categorySlider.classList.add('scrolled-start');
        } else {
          categorySlider.classList.remove('scrolled-start');
        }
        
        if (scrollLeft < scrollWidth - clientWidth - 10) {
          categorySlider.classList.add('scrolled-end');
        } else {
          categorySlider.classList.remove('scrolled-end');
        }
      };

      categorySlider.addEventListener('touchstart', handleTouchStart, { passive: true });
      categorySlider.addEventListener('touchend', handleTouchEnd, { passive: true });
      categorySlider.addEventListener('scroll', updateScrollIndicators, { passive: true });
      
      // Initialiser les indicateurs
      updateScrollIndicators();

      return () => {
        categorySlider.removeEventListener('touchstart', handleTouchStart);
        categorySlider.removeEventListener('touchend', handleTouchEnd);
        categorySlider.removeEventListener('scroll', updateScrollIndicators);
      };
    }
  }, []);

  return (
    <div className="bg-black min-h-screen text-white live-events-page-spacing live-events-page">
      {/* Video Player Section */}
      <div className="px-4 md:px-[6.25%] pt-8 mb-8 md:mb-12">
        <div className="relative w-full max-w-5xl mx-auto">
          <div className="relative bg-white rounded-[24px] overflow-hidden aspect-video">
            {/* Video Background */}
            <div className="absolute inset-0">
              <ImageWithFallback 
                src={imgBackground} 
                alt="Video background" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090b0b] to-transparent opacity-80" />
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6">
              {/* Top Controls */}
              <div className="flex justify-between items-start">
                <Button
                  onClick={onBack}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 p-2"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <div className="text-white text-right">
                  <div className="text-xs font-bold text-[#DE0035]">APR</div>
                  <div className="text-2xl font-bold">14</div>
                </div>
              </div>

              {/* Center Play Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handlePlayPause}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#DE0035] hover:bg-[#DE0035]/80 flex items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  ) : (
                    <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-1" />
                  )}
                </Button>
              </div>

              {/* Bottom Controls */}
              <div className="space-y-4">
                {/* Timeline */}
                <div className="relative">
                  <div className="h-[5px] bg-[#4c4c4c] rounded-full">
                    <div 
                      className="h-full bg-[#D22F26] rounded-full transition-all duration-300"
                      style={{ width: `43%` }}
                    />
                  </div>
                  <div className="absolute right-0 -top-1 text-xs text-white">
                    38:47
                  </div>
                </div>

                {/* Control Bar */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-5 h-5 text-white" />
                      <div className="w-16 md:w-24 h-1.5 bg-[rgba(255,255,255,0.2)] rounded-full">
                        <div 
                          className="h-full bg-white rounded-full transition-all"
                          style={{ width: `${volume * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10 p-2"
                      onClick={() => setShowSubtitles(!showSubtitles)}
                    >
                      <Settings className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10 p-2"
                    >
                      <Maximize className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Info Card - Side positioned */}
          <div className="absolute top-4 right-4 w-80 hidden lg:block">
            <div className="bg-black/80 backdrop-blur-sm rounded-[22px] p-6 text-white">
              <ImageWithFallback 
                src={imgImage}
                alt="Event" 
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-center">
                    <div className="text-[#DE0035] text-xs font-bold">APR</div>
                    <div className="text-2xl font-bold">14</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Yaye Padura</h3>
                    <p className="text-sm text-gray-300">By Chemical Department</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#DE0035]" />
                  <span className="text-sm text-gray-300">University of Moratuwa</span>
                </div>
                
                <Button className="w-full bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20">
                  <Share className="w-4 h-4 mr-2" />
                  Partager
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Subtitles Panel */}
        {showSubtitles && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-4 w-80 z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-300">Audio</span>
              <span className="text-sm text-white font-semibold">Subtitles</span>
              <span className="text-sm text-gray-300">Quality</span>
            </div>
            <div className="h-px bg-white/20 mb-4" />
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                <span className="text-sm text-gray-300">French</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-[#C1272D] rounded-full bg-[#C1272D]" />
                <span className="text-sm text-gray-300">English 1</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                <span className="text-sm text-gray-300">English 2</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Header avec titre et catégories alignés - Style Replay */}
      <div className="px-4 md:px-[6.25%] pb-4 mb-8 md:mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 md:gap-8">
          {/* Titre */}
          <div className="flex-shrink-0">
            <h1 className="text-[#cdff71] text-[28px] md:text-[36px] lg:text-[48px] font-bold leading-[1.005]">
              En live ce mois
            </h1>
          </div>

          {/* Category Filters - System de scroll actif */}
          <div 
            ref={categorySliderRef}
            className="live-events-category-scroll w-full"
            style={{
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex gap-2 md:gap-3 min-w-max" style={{ minWidth: 'calc(100vw + 100px)' }}>
              {categoryTabs.map((category) => (
                <div
                  key={category.id}
                  className="flex-none live-events-category-transition"
                  style={{ minWidth: '120px' }}
                >
                  <CategoryTab
                    icon={category.icon}
                    label={category.label}
                    isSelected={selectedCategory === category.label}
                    onClick={() => handleCategoryClick(category.label)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="px-4 md:px-[6.25%] pb-8 md:pb-16">
        {/* Filtre actif indicator */}
        {selectedCategory && (
          <div className="mb-6 flex items-center gap-3">
            <span className="text-white/70 text-sm">Filtré par :</span>
            <div className="bg-[#cdff71] text-[#000441] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              {selectedCategory}
              <button 
                onClick={() => setSelectedCategory('')}
                className="hover:bg-[#000441]/10 rounded-full p-1"
                title="Supprimer le filtre"
              >
                ✕
              </button>
            </div>
            <span className="text-white/60 text-sm">({filteredEvents.length} résultat{filteredEvents.length > 1 ? 's' : ''})</span>
          </div>
        )}

        {/* Message quand aucun événement */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-white/60 text-lg mb-4">
              Aucun événement en direct trouvé {selectedCategory && `pour la catégorie "${selectedCategory}"`}
            </div>
            <button 
              onClick={() => setSelectedCategory('')}
              className="bg-[#cdff71] text-[#000441] px-6 py-3 rounded-full font-medium hover:bg-[#cdff71]/90 transition-colors"
            >
              Voir tous les événements
            </button>
          </div>
        ) : (
        Array.from({ length: 3 }).map((_, rowIndex) => (
          <div key={rowIndex} className="mb-6 md:mb-8">
            {/* Row Header with Navigation */}
            <div className="flex items-center justify-between mb-4 live-events-row-header">
              <h3 className="text-white text-lg md:text-xl font-semibold live-events-row-title">
                {rowIndex === 0 ? 'Tendances Live' : rowIndex === 1 ? 'Concerts & Musique' : 'Art & Culture'}
              </h3>
              
              {/* Navigation Buttons - Desktop Only */}
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToCard(rowIndex, 'prev')}
                  disabled={!canScrollPrev(rowIndex)}
                  className="w-10 h-10 rounded-full bg-[#28262d] hover:bg-[#28262d]/80 text-white live-events-row-nav"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToCard(rowIndex, 'next')}
                  disabled={!canScrollNext(rowIndex)}
                  className="w-10 h-10 rounded-full bg-[#28262d] hover:bg-[#28262d]/80 text-white live-events-row-nav"
                >
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </Button>
              </div>
            </div>

            {/* Events Slider Container */}
            <div className="relative">
              <div 
                ref={(el) => rowSliderRefs.current[rowIndex] = el}
                className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide live-events-scroll live-events-smooth-scroll live-events-row-container live-events-row-optimized"
                style={{
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch',
                  scrollSnapType: 'x proximity',
                  overscrollBehaviorX: 'contain'
                }}
              >
                {filteredEvents.map((event, eventIndex) => (
                  <div
                    key={`${rowIndex}-${eventIndex}`}
                    className="flex-none w-[280px] md:w-[320px] bg-gray-900 rounded-2xl overflow-hidden live-events-row-card cursor-pointer"
                    style={{ scrollSnapAlign: 'center' }}
                    onClick={() => onStreamWatch(event.id)}
                  >
                    <div className="relative h-[183px] md:h-[200px]">
                      <ImageWithFallback
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {/* Live Badge */}
                      <div className="absolute top-3 left-3">
                        <div className="bg-[#DE0035] text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 live-events-badge-pulse">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          LIVE
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 md:p-6">
                      <h3 className="font-bold text-white mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-[#FFCD1A] fill-current" />
                            <span className="text-white font-semibold">4.6</span>
                          </div>
                          <span className="text-[#78828a] text-sm">{event.category}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-[#cdff71] text-sm">
                          <Users className="w-4 h-4" />
                          <span>{event.attendees}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-gray-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        
                        <Button
                          size="sm"
                          className="bg-[#DE0035] hover:bg-[#DE0035]/80 text-white px-3 py-1 rounded-full text-xs font-medium live-events-join-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStreamWatch(event.id);
                          }}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Voir le Live
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Navigation Indicators */}
              <div className="flex md:hidden justify-center mt-4 gap-1">
                {Array.from({ length: Math.ceil(filteredEvents.length / getCardsPerView()) }).map((_, indicatorIndex) => (
                  <button
                    key={indicatorIndex}
                    onClick={() => {
                      setRowSliderIndices(prev => ({
                        ...prev,
                        [rowIndex]: indicatorIndex
                      }));
                      const slider = rowSliderRefs.current[rowIndex];
                      if (slider) {
                        const cardWidth = 280;
                        const gap = 16;
                        const scrollDistance = cardWidth + gap;
                        slider.scrollTo({
                          left: indicatorIndex * scrollDistance,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    className={`w-2 h-2 rounded-full live-events-row-indicator ${
                      (rowSliderIndices[rowIndex] || 0) === indicatorIndex
                        ? 'bg-[#cdff71] w-6 active'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
}