import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Star, Calendar, Clock, ChevronLeft, ChevronRight, ArrowLeft, X, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import svgPaths from "../../imports/svg-eek2rjp8e6";
import svgPathsCategory from "../../imports/svg-leff6hoark";
import imgRectangle48 from "figma:asset/9defa6ad18339ff5c8de749bed4a0c65c528d090.png";
import imgRectangle35 from "figma:asset/369dbb8a3ddecc745ce7702a189fd9ff5e97bc3d.png";
import imgRectangle36 from "figma:asset/4162ebc798a8b173720f87de7478d94281022f64.png";
import imgRectangle37 from "figma:asset/6ac6422f14dd5b2704180c9e632edff571b31ab4.png";
import imgRectangle38 from "figma:asset/53e208c6c8dd2188e71c7333042adddb5c4ca85a.png";
import imgRectangle39 from "figma:asset/58dada16c4000cc3f3fd2c29ee72ce18c575175b.png";
import imgRectangle40 from "figma:asset/c4669ce83c7f985ad0438c0f91e33ad2940e8dfb.png";
import imgRectangle41 from "figma:asset/bac87bbeb04523690f478444643a023cb3915df9.png";
import imgRectangle42 from "figma:asset/4b0dd5157475136ded53618b9fe070e2f727eb27.png";
import imgRectangle43 from "figma:asset/58393595894a4f0b03a3b163e7d7dfec5c5e7d0c.png";
import imgRectangle44 from "figma:asset/b9c99a545f3aff80f09844eb80ecc5a230754c85.png";
import imgRectangle45 from "figma:asset/5f7efc2bec2516e3f721950b7abfee5b1a958cf6.png";
import imgImage from "figma:asset/9642a472e265d7dba7788f22c0c3a3264707bf05.png";
import imgImage1 from "figma:asset/9389257a4ecca2067419f928c95ebd912fdb4108.png";
import imgImage2 from "figma:asset/1c01af871b4aec1a5f99c8d43d12cb57caf4a34a.png";
import imgImage3 from "figma:asset/f223555fb04d576a7a9ff4191817d63db7d110a8.png";
import imgImage4 from "figma:asset/0d23ccb8f22ce6b0632355075fe579927c44df21.png";
import imgSideOverlay from "figma:asset/81b9770ae22a3cd1d4976ab8cf10857f815f9607.png";
import imgRectangle46 from "figma:asset/4d118dfbcee18414a275890c002cbd4fea5cc845.png";

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

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'organizer';
  adminRole?: 'super_admin' | 'admin' | 'moderator' | 'support' | 'organizer' | 'user';
}

interface ReplayPageProps {
  events: Event[];
  onEventSelect: (eventId: string) => void;
  onStreamWatch: (eventId: string) => void;
  onPurchase: (eventId: string) => void;
  onBack: () => void;
  currentUser: User | null;
}

// Category Tab Component
function CategoryTab({ icon, label, isSelected, onClick }: {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300
        ${isSelected 
          ? 'bg-[#cdff71] text-[#000441] shadow-lg' 
          : 'bg-[#28262d] text-[#F9F9F9] hover:bg-[#3a3640]'
        }
      `}
    >
      <div className="w-4 h-4">
        {icon}
      </div>
      <span className="text-sm font-medium">
        {label}
      </span>
    </button>
  );
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

function WeightIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="weight">
        <path d="M6.5 6.5H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M8 6.5V4.5C8 3.95 8.45 3.5 9 3.5H15C15.55 3.5 16 3.95 16 4.5V6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M4 8.5V18.5C4 19.05 4.45 19.5 5 19.5H19C19.55 19.5 20 19.05 20 18.5V8.5C20 7.95 19.55 7.5 19 7.5H5C4.45 7.5 4 7.95 4 8.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
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
        <path d={svgPathsCategory.p137f9d00} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPathsCategory.p36526000} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPathsCategory.p1e724200} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function MusicnoteIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="musicnote">
        <path d={svgPathsCategory.p8d41200} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M11.97 18V4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPathsCategory.p17cba0f0} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function ReserveIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="reserve">
        <path d={svgPathsCategory.pe124f80} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPathsCategory.p32c1af80} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPathsCategory.p7b2c300} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M15 11H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

const categories = [
  { id: 'cinema', label: 'Cinema', icon: <VideoIcon />, active: true },
  { id: 'concert', label: 'Concert', icon: <SoundIcon />, active: false },
  { id: 'art', label: 'Art', icon: <BrushIcon />, active: false },
  { id: 'music', label: 'Music', icon: <MusicnoteIcon />, active: false },
  { id: 'brunches', label: 'Brunches', icon: <ReserveIcon />, active: false },
  { id: 'sport', label: 'Sport', icon: <WeightIcon />, active: false },
  { id: 'scientific', label: 'Scientific', icon: <BrushIcon />, active: true },
  { id: 'business', label: 'Business', icon: <ReserveIcon />, active: true }
];

export function ReplayPage({ 
  events, 
  onEventSelect, 
  onStreamWatch, 
  onPurchase, 
  onBack, 
  currentUser 
}: ReplayPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bestOfSliderIndex, setBestOfSliderIndex] = useState(0);
  const [movieSliderIndex, setMovieSliderIndex] = useState(0);
  const [isPlayButtonLoading, setIsPlayButtonLoading] = useState(false);
  const [playButtonHovered, setPlayButtonHovered] = useState(false);
  const [playButtonSuccess, setPlayButtonSuccess] = useState(false);
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [autoSlideEnabled, setAutoSlideEnabled] = useState(true);
  const [showContentOverlay, setShowContentOverlay] = useState(true);
  const categorySliderRef = useRef<HTMLDivElement>(null);
  const sliderIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filtre les événements passés (non-live) depuis les props
  const replayEvents = useMemo(() => 
    events.filter(event => !event.isLive),
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
      'Business': 'Business',
      'Scientific': 'Scientific',
      'Brunches': 'Brunches'
    };
    return categoryMap[eventCategory] || 'Cinema';
  };

  // Filtrer les événements selon la catégorie sélectionnée
  const filteredReplayEvents = useMemo(() => {
    if (!selectedCategory || selectedCategory === '') {
      return replayEvents;
    }
    
    return replayEvents.filter(event => {
      const mappedCategory = mapEventCategoryToTab(event.category);
      return mappedCategory.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [selectedCategory, replayEvents]);

  // Hero slider controls
  const nextSlide = () => {
    const totalSlides = Math.max(1, replayEvents.length);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    const totalSlides = Math.max(1, replayEvents.length);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Best of replay slider controls
  const nextBestOfSlide = () => {
    setBestOfSliderIndex((prev) => (prev + 1) % Math.ceil(replayEvents.length / 5));
  };

  const prevBestOfSlide = () => {
    setBestOfSliderIndex((prev) => (prev - 1 + Math.ceil(replayEvents.length / 5)) % Math.ceil(replayEvents.length / 5));
  };

  // Movie list slider controls - Défilement par rangée
  const getMoviesPerRow = () => {
    if (typeof window === 'undefined') return 1;
    const width = window.innerWidth;
    if (width < 768) return 1; // Mobile: 1 carte par rangée
    if (width < 1024) return 2; // Tablette: 2 cartes par rangée 
    return 3; // Desktop: 3 cartes par rangée
  };

  const nextMovieSlide = () => {
    const moviesPerRow = getMoviesPerRow();
    const maxIndex = Math.ceil(filteredReplayEvents.length / moviesPerRow) - 1;
    setMovieSliderIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevMovieSlide = () => {
    const moviesPerRow = getMoviesPerRow();
    const maxIndex = Math.ceil(filteredReplayEvents.length / moviesPerRow) - 1;
    setMovieSliderIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Auto-slide functionality
  useEffect(() => {
    if (autoSlideEnabled && !isSliderHovered && replayEvents.length > 0) {
      sliderIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % replayEvents.length);
      }, 5000); // Change slide every 5 seconds
    }
    
    return () => {
      if (sliderIntervalRef.current) {
        clearInterval(sliderIntervalRef.current);
      }
    };
  }, [autoSlideEnabled, isSliderHovered, replayEvents.length]);

  // Initialize watchlist state from localStorage
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const currentWatchlist = JSON.parse(localStorage.getItem('feeti-watchlist') || '[]');
        setIsWatchlisted(currentWatchlist.includes('replay-1'));
      } catch (storageError) {
        console.log('LocalStorage not available:', storageError);
      }
    }
  }, []);

  // Reset slider index when window resizes to avoid display issues
  useEffect(() => {
    const handleResize = () => {
      setMovieSliderIndex(0);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Enhanced play button handler
  const handlePlayButtonClick = async () => {
    if (isPlayButtonLoading || playButtonSuccess) return;
    
    setIsPlayButtonLoading(true);
    setPlayButtonSuccess(false);
    
    try {
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Success state
      setPlayButtonSuccess(true);
      setIsPlayButtonLoading(false);
      
      // Reset success state after animation
      setTimeout(() => {
        setPlayButtonSuccess(false);
        if (replayEvents[currentSlide]) {
          onStreamWatch(replayEvents[currentSlide].id);
        }
      }, 600);
      
    } catch (error) {
      console.error('Play button error:', error);
      setIsPlayButtonLoading(false);
      setPlayButtonSuccess(false);
    }
  };

  // Enhanced watchlist handler
  const handleWatchlistToggle = () => {
    if (typeof localStorage !== 'undefined') {
      try {
        const currentWatchlist = JSON.parse(localStorage.getItem('feeti-watchlist') || '[]');
        const itemId = 'replay-1';
        
        let updatedWatchlist;
        if (currentWatchlist.includes(itemId)) {
          updatedWatchlist = currentWatchlist.filter((id: string) => id !== itemId);
        } else {
          updatedWatchlist = [...currentWatchlist, itemId];
        }
        
        localStorage.setItem('feeti-watchlist', JSON.stringify(updatedWatchlist));
        setIsWatchlisted(!isWatchlisted);
      } catch (storageError) {
        console.log('LocalStorage not available:', storageError);
      }
    }
  };

  // Category selection handler
  const handleCategoryClick = (categoryLabel: string) => {
    if (selectedCategory === categoryLabel) {
      setSelectedCategory(''); // Désélectionner
    } else {
      setSelectedCategory(categoryLabel);
      
      // Scroll la catégorie sélectionnée vers le centre sur mobile
      if (categorySliderRef.current && window.innerWidth < 1024) {
        const categoryIndex = categories.findIndex(cat => cat.label === categoryLabel);
        const categoryElement = categorySliderRef.current.children[0]?.children[categoryIndex] as HTMLElement;
        
        if (categoryElement) {
          const containerWidth = categorySliderRef.current.offsetWidth;
          const elementWidth = categoryElement.offsetWidth;
          const elementOffset = categoryElement.offsetLeft;
          const scrollLeft = elementOffset - (containerWidth / 2) + (elementWidth / 2);
          
          categorySliderRef.current.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  // Calculer le décalage du slider de manière responsive - Par rangée entière
  const getSliderOffset = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    const width = window.innerWidth;
    if (width < 768) return 100; // Mobile: 100% par rangée (1 carte)
    if (width < 1024) return 100; // Tablette: 100% par rangée (2 cartes)
    return 100; // Desktop: 100% par rangée (3 cartes)
  }, []);

  const getBestOfSliderOffset = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    const width = window.innerWidth;
    if (width < 768) return 90; // Mobile: 90% par slide
    if (width < 1024) return 45; // Tablette: 45% par slide
    return 20; // Desktop: 20% par slide (5 cartes)
  }, []);

  return (
    <div className="bg-black relative w-full min-h-screen" data-name="replay">
      {/* Hero Slider */}
      <div 
        className="relative w-full h-[410px] md:h-[510px] lg:h-[570px] overflow-hidden"
        onMouseEnter={() => setIsSliderHovered(true)}
        onMouseLeave={() => setIsSliderHovered(false)}
      >
        {replayEvents.slice(0, Math.max(1, replayEvents.length)).map((event, index) => (
          <div
            key={event.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            
            {/* Content Overlay */}
            {showContentOverlay && (
              <div className="absolute inset-0 flex items-center">
                <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                  <div className="max-w-2xl relative">
                    {/* Bouton Fermer le contenu overlay */}
                    <button
                      onClick={() => setShowContentOverlay(false)}
                      className="absolute -top-12 right-0 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-200 group"
                      title="Masquer les informations"
                    >
                      <X className="w-5 h-5 text-white group-hover:text-gray-300" />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-[#DE0035] text-white px-3 py-1 text-sm font-medium">
                        REPLAY
                      </Badge>
                      <span className="text-white/80 text-sm">
                        {event.date} • {event.time}
                      </span>
                    </div>
                    
                    <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                      {event.title}
                    </h1>
                    
                    <p className="text-white/90 text-lg mb-8 max-w-xl">
                      {event.description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => onStreamWatch(event.id)}
                        disabled={isPlayButtonLoading}
                        className={`
                          replay-play-button group relative
                          ${isPlayButtonLoading ? 'loading' : ''}
                          ${playButtonSuccess ? 'success' : ''}
                        `}
                      >
                        <div className="replay-play-inner bg-[#DE0035] rounded-full p-4 md:p-5">
                          <Play className="replay-play-icon w-6 h-6 md:w-8 md:h-8 text-white fill-current" />
                        </div>
                      </button>
                      
                      <button
                        onClick={handleWatchlistToggle}
                        className={`
                          replay-action-button replay-watchlist-button
                          px-6 py-3 rounded-full border-2 text-white font-medium transition-all duration-300
                          ${isWatchlisted 
                            ? 'active bg-[#cdff71]/20 border-[#cdff71]/50 text-[#cdff71]' 
                            : 'border-white/30 hover:border-white/50'
                          }
                        `}
                      >
                        <Star className={`w-5 h-5 mr-2 ${isWatchlisted ? 'fill-current' : ''}`} />
                        {isWatchlisted ? 'Dans ma liste' : 'Ma liste'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bouton pour réafficher le contenu overlay quand masqué */}
            {!showContentOverlay && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
                <button
                  onClick={() => setShowContentOverlay(true)}
                  className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-black/80 transition-all duration-200 flex items-center gap-2"
                  title="Afficher les informations"
                >
                  <Info className="w-4 h-4" />
                  <span className="text-sm">Infos</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Navigation Arrows */}
        <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20">
          <button 
            onClick={prevSlide}
            className="replay-nav-button bg-black/50 p-3 rounded-full hover:bg-black/70 transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20">
          <button 
            onClick={nextSlide}
            className="replay-nav-button bg-black/50 p-3 rounded-full hover:bg-black/70 transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {replayEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`replay-slide-indicator w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'active bg-[#cdff71] scale-125' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Back Button */}
        <div className="absolute top-6 left-4 md:left-6 z-20">
          <button 
            onClick={onBack}
            className="replay-action-button bg-black/50 p-3 rounded-full hover:bg-black/70 transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Best of replay Section */}
      <div className="py-8 md:py-16 px-4 md:px-[6.25%]">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <h2 className="text-[#cdff71] text-[32px] md:text-[40px] lg:text-[48px] font-bold leading-[1.005]">
            Best of replay
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={prevBestOfSlide}
              className="bg-[#28262d] p-[6px] rounded-full hover:bg-[#3a3640] transition-colors duration-300"
            >
              <ChevronLeft className="w-5 h-5 text-[#F9F9F9]" />
            </button>
            <button 
              onClick={nextBestOfSlide}
              className="bg-[#28262d] p-[6px] rounded-full hover:bg-[#3a3640] transition-colors duration-300"
            >
              <ChevronRight className="w-5 h-5 text-[#F9F9F9]" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div 
            className="flex gap-4 transition-transform duration-500 ease-in-out replay-slider-track"
            style={{ 
              transform: `translateX(-${bestOfSliderIndex * getBestOfSliderOffset}%)` 
            }}
          >
            {replayEvents.map((event, index) => (
              <div 
                key={event.id}
                className="relative flex-none w-[180px] md:w-[200px] lg:w-[214px] h-[240px] md:h-[270px] lg:h-[290px] rounded-[3px] overflow-hidden cursor-pointer group"
                onClick={() => onStreamWatch(event.id)}
              >
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a070b] via-transparent to-transparent opacity-75" />
                <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4">
                  <p className="text-white text-[16px] md:text-[18px] lg:text-[20px] font-semibold leading-[24px] md:leading-[28px] lg:leading-[30px] line-clamp-2">
                    {event.title}
                  </p>
                </div>
                
                {/* Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-[#DE0035] rounded-full p-3">
                    <Play className="w-6 h-6 text-white fill-current" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disponible en replay Section */}
      <div className="px-4 md:px-[6.25%] pb-8 md:pb-16">
        {/* Header avec titre et catégories alignés */}
        <div className="replay-section-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Titre */}
          <div className="flex-shrink-0">
            <h2 className="replay-title-enhanced text-[#cdff71] text-[28px] md:text-[36px] lg:text-[48px] font-bold leading-[1.005]">
              Disponible en replay
            </h2>
          </div>

          {/* Category Filters - À droite sur desktop, en dessous sur mobile */}
          <div 
            ref={categorySliderRef}
            className="replay-category-slider overflow-x-auto category-slider scrollbar-hide"
          >
            <div className="flex gap-2 md:gap-3 min-w-max">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`replay-category-tab ${selectedCategory === category.label ? 'replay-category-select' : 'replay-category-deselect'}`}
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

        {/* Movie Lists - Avec slider par rangée */}
        <div className="space-y-4 md:space-y-6">
          {[...Array(2)].map((_, sectionIndex) => {
            // Calculer les films par rangée selon le breakpoint
            const moviesPerRow = typeof window !== 'undefined' 
              ? window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3 
              : 3;
            
            // Organiser les événements filtrés en rangées
            const eventRows = [];
            for (let i = 0; i < filteredReplayEvents.length; i += moviesPerRow) {
              eventRows.push(filteredReplayEvents.slice(i, i + moviesPerRow));
            }
            
            return (
              <div key={sectionIndex} className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-white text-[18px] md:text-[20px] font-semibold">
                      {sectionIndex === 0 ? 'Événements populaires' : 'Derniers replays'}
                    </h3>
                    <div className="hidden md:flex items-center gap-2 text-white/60 text-sm">
                      <span>{movieSliderIndex + 1}</span>
                      <span>/</span>
                      <span>{eventRows.length}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Indicateurs de rangée */}
                    <div className="hidden md:flex gap-1">
                      {eventRows.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setMovieSliderIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === movieSliderIndex 
                              ? 'bg-[#cdff71] scale-125' 
                              : 'bg-white/30 hover:bg-white/50'
                          }`}
                          aria-label={`Aller à la rangée ${index + 1}`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={prevMovieSlide}
                        className="bg-[#28262d] p-[6px] rounded-full hover:bg-[#3a3640] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={movieSliderIndex === 0}
                      >
                        <ChevronLeft className="w-4 h-4 text-[#F9F9F9]" />
                      </button>
                      <button 
                        onClick={nextMovieSlide}
                        className="bg-[#28262d] p-[6px] rounded-full hover:bg-[#3a3640] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={movieSliderIndex >= eventRows.length - 1}
                      >
                        <ChevronRight className="w-4 h-4 text-[#F9F9F9]" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="relative overflow-hidden">
                  <div 
                    className="replay-movie-row-slider"
                    style={{ 
                      transform: `translateX(-${movieSliderIndex * getSliderOffset}%)` 
                    }}
                  >
                    <div className="flex w-full">
                      {eventRows.map((row, rowIndex) => (
                        <div 
                          key={rowIndex}
                          className="replay-movie-row"
                        >
                          {row.map((event) => (
                            <div 
                              key={`${event.id}-${sectionIndex}-${rowIndex}`} 
                              className="replay-movie-card cursor-pointer group"
                              onClick={() => onStreamWatch(event.id)}
                            >
                              <div className="w-full h-[140px] md:h-[160px] lg:h-[183px] rounded-[12px] md:rounded-[16px] overflow-hidden mb-2 md:mb-3 relative">
                                <img 
                                  src={event.image} 
                                  alt={event.title}
                                  className="w-full h-full object-cover" 
                                />
                                
                                {/* Hover Play Button */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                                  <div className="bg-[#DE0035] rounded-full p-3 md:p-4">
                                    <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-current" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2 md:space-y-3">
                                <h3 className="text-[#f9f9f9] text-[14px] md:text-[16px] font-bold leading-[20px] md:leading-[24px] tracking-[0.08px] line-clamp-2">
                                  {event.title}
                                </h3>
                                <div className="flex items-center gap-1">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-[14px] h-[14px] md:w-[18px] md:h-[18px] fill-[#FFCD1A] text-[#FFCD1A]" />
                                    <span className="text-[#f9f9f9] text-[10px] md:text-[12px] font-semibold leading-[16px] md:leading-[20px] tracking-[0.06px]">
                                      4.6
                                    </span>
                                  </div>
                                  <span className="text-[#78828a] text-[10px] md:text-[12px] font-medium leading-[16px] md:leading-[20px] tracking-[0.06px] line-clamp-1">
                                    {event.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Promotional Section */}
      <div className="px-4 md:px-[3.375%] py-8 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Bon Plans Card */}
          <div className="bg-[#cdff71] rounded-[20px] md:rounded-[30px] p-6 md:p-12 relative overflow-hidden h-[250px] md:h-[346px] flex flex-col justify-center">
            <div className="relative z-10">
              <p className="text-[#16bea1] text-[24px] md:text-[32px] lg:text-[40px] leading-[36px] md:leading-[48px] lg:leading-[60px] mb-2">
                Consulter tous les
              </p>
              <h3 className="text-black font-black leading-[60px] md:leading-[100px] lg:leading-[130px] mb-4 md:mb-8">
                <span className="text-[32px] md:text-[55px] lg:text-[75px]">BON-PLANS</span>
                <span className="text-[#16bea1] text-[32px] md:text-[55px] lg:text-[75px]">.</span>
              </h3>
              <button 
                onClick={() => onBack()}
                className="bg-[#de0035] text-white rounded-[30px] md:rounded-[40px] px-6 md:px-8 py-2 md:py-3 text-[18px] md:text-[20px] lg:text-[24px] font-bold leading-[1.005] hover:bg-[#de0035]/90 transition-colors"
              >
                Voir+
              </button>
            </div>
          </div>

          {/* Flash Annonce Card */}
          <div className="bg-[#16bda0] rounded-[20px] md:rounded-[30px] p-6 md:p-12 relative overflow-hidden h-[250px] md:h-[346px] flex flex-col justify-center">
            <div className="relative z-10">
              <p className="text-[#cdff71] text-[24px] md:text-[32px] lg:text-[40px] leading-[36px] md:leading-[48px] lg:leading-[60px] mb-2">
                Flashez votre
              </p>
              <h3 className="text-white font-black leading-[60px] md:leading-[100px] lg:leading-[130px] mb-4 md:mb-8">
                <span className="text-[32px] md:text-[55px] lg:text-[75px]">ANNONCE</span>
                <span className="text-[#cdff71] text-[32px] md:text-[55px] lg:text-[75px]">.</span>
              </h3>
              <button 
                onClick={() => onBack()}
                className="bg-[#de0035] text-white rounded-[30px] md:rounded-[40px] px-6 md:px-8 py-2 md:py-3 text-[18px] md:text-[20px] lg:text-[24px] font-bold leading-[1.005] hover:bg-[#de0035]/90 transition-colors"
              >
                Voir+
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}