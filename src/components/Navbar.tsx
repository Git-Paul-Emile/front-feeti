import { useState } from 'react';
import type { Country } from '../services/api/CountryAPI';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Menu, User, Settings, LogOut, ChevronDown, MapPin, Star, Megaphone, Zap, Heart, Shield } from 'lucide-react';
import svgPaths from "../imports/svg-pgf9xqt80w";


interface NavbarProps {
  currentUser: any;
  onLogout: () => void;
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  selectedCountry: Country | null;          // null = tous les pays
  onCountrySelect: (country: Country | null) => void;
  countries?: Country[];
}

export function Navbar({ currentUser, onLogout, onNavigate, currentPage, selectedCountry, onCountrySelect, countries = [] }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { key: 'home', label: 'Accueil', isActive: currentPage === 'home' },
    { key: 'events', label: 'Billetterie', hasDropdown: true },
    { key: 'streaming', label: 'En live', hasDropdown: true },
    { key: 'deals-list', label: 'Bon plan', hasDropdown: false },
    { key: 'leisure', label: 'Loisirs', hasDropdown: false },
    { key: 'blog', label: 'Féetiche' },
  ];

  return (
    <div>
      {/* Top bar with location and app store buttons - Hidden on mobile */}
      <div className="hidden sm:flex bg-[#1a0957] px-4 sm:px-8 md:px-12 lg:px-16 xl:px-[75px] py-2 h-[40px] sm:h-[50px] items-center justify-between">
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="border border-white rounded-[20px] sm:rounded-[24px] h-[18px] sm:h-[21px] px-2 sm:px-4 flex items-center hover:bg-white/10 transition-all duration-200 group">
                <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#00BDD7] mr-1 group-hover:scale-110 transition-transform" />
                <span className="text-white text-[7px] sm:text-[8px] whitespace-nowrap mr-1">
                  {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : 'Tous les pays'}
                </span>
                <ChevronDown className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white/70 group-hover:text-white transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white border shadow-lg" align="start">
              <div className="p-1">
                <div className="px-2 py-1.5 text-xs font-medium text-gray-500 border-b">
                  Choisir votre pays
                </div>
                {/* Option "Tous les pays" */}
                <DropdownMenuItem
                  onClick={() => onCountrySelect(null)}
                  className={`flex items-center space-x-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                    !selectedCountry ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span className="flex-1">Tous les pays</span>
                  {!selectedCountry && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                </DropdownMenuItem>
                {countries.map((country) => (
                  <DropdownMenuItem
                    key={country.code}
                    onClick={() => onCountrySelect(country)}
                    className={`flex items-center space-x-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedCountry?.code === country.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1">{country.name}</span>
                    {selectedCountry?.code === country.code && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* User Account Button */}
          {currentUser ? (
            <div className="relative">
              {/* Direct click to dashboard based on role */}
              <button
                onClick={() => {
                  if (currentUser?.adminRole && ['super_admin', 'admin', 'moderator', 'support'].includes(currentUser.adminRole)) {
                    onNavigate('admin-dashboard');
                  } else if (currentUser?.role === 'organizer') {
                    onNavigate('organizer-dashboard');
                  } else {
                    onNavigate('user-dashboard');
                  }
                }}
                className="w-[26px] h-[26px] sm:w-[31px] sm:h-[31px] bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors group"
                title="Accéder à mon espace"
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-[#1a0957] group-hover:scale-110 transition-transform" />
              </button>
              
              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="absolute -right-1 -top-1 w-4 h-4 bg-[#00BDD7] rounded-full border border-white flex items-center justify-center hover:bg-[#16BDA0] transition-colors shadow-sm"
                    title="Options du compte"
                  >
                    <ChevronDown className="w-2.5 h-2.5 text-white" />
                  </button>
                </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate('user-dashboard')} className="hover:bg-gray-50">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mon compte</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('my-favorites')} className="hover:bg-gray-50">
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Mes favoris</span>
                </DropdownMenuItem>
                {currentUser.role === 'organizer' && (
                  <DropdownMenuItem onClick={() => onNavigate('organizer-dashboard')} className="hover:bg-gray-50">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Dashboard organisateur</span>
                  </DropdownMenuItem>
                )}
                {currentUser.adminRole && ['super_admin', 'admin', 'moderator', 'support'].includes(currentUser.adminRole) && (
                  <DropdownMenuItem onClick={() => onNavigate('admin-dashboard')} className="hover:bg-gray-50">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Administration</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="hover:bg-gray-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ) : (
            <button 
              onClick={() => onNavigate('login')}
              className="w-[26px] h-[26px] sm:w-[31px] sm:h-[31px] bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors group"
              title="Se connecter"
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4 text-[#1a0957] group-hover:scale-110 transition-transform" />
            </button>
          )}

          {/* Play Store */}
          <div className="w-[26px] h-[26px] sm:w-[31px] sm:h-[31px] bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="w-[12px] h-[13px] sm:w-[15px] sm:h-[16px] text-[#16BEA1]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 13">
                <g>
                  <path d={svgPaths.p17a89000} fill="currentColor" />
                  <path d={svgPaths.pc882740} fill="currentColor" />
                  <path d={svgPaths.p30a24100} fill="currentColor" />
                  <path d={svgPaths.p12835900} fill="currentColor" />
                </g>
              </svg>
            </div>
          </div>
          
          {/* App Store */}
          <div className="w-[26px] h-[26px] sm:w-[31px] sm:h-[31px] bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="w-[12px] h-[15px] sm:w-[15px] sm:h-[18px] text-[#16BEA1]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 19">
                <g>
                  <path d={svgPaths.pbb91e00} fill="currentColor" />
                  <path d={svgPaths.p3b420680} fill="currentColor" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main navbar */}
      <nav className={`${
        currentPage === 'replay' 
          ? 'bg-background border-b border-border' 
          : 'bg-white'
      } px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[75px] py-3 sm:py-4 md:py-6 h-[70px] sm:h-[80px] md:h-[90px] flex items-center justify-between sticky top-0 z-50 shadow-sm`}>
        {/* Logo */}
        <div 
          onClick={() => onNavigate('home')}
          className="h-[24px] w-[96px] sm:h-[28px] sm:w-[112px] md:h-[32px] md:w-[128px] relative cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="absolute bottom-0 left-[73.81%] right-0 top-0">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 41 39">
              <g>
                <path d={svgPaths.pb4c4300} fill="#1A0957" />
                <path d={svgPaths.p2a0dbb00} fill="#811AEC" />
                <path d={svgPaths.p16d5e380} fill="#F1C519" />
                <path d={svgPaths.p15cd3f80} fill="#E43962" />
                <path d={svgPaths.pfe8d400} fill="#16BDA0" />
                <path d={svgPaths.p3693380} fill="#811AEC" />
                <path d={svgPaths.p1116dfc0} fill="#F1C519" />
                <path d={svgPaths.p2022e980} fill="#E43962" />
                <path d={svgPaths.p206aab00} fill="#16BDA0" />
              </g>
            </svg>
          </div>
          <div className="absolute bottom-[8.01%] left-0 right-[28.1%] top-[8.01%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 113 33">
              <g>
                <path d={svgPaths.p2d591880} fill="#1A0957" />
                <path d={svgPaths.p3aaf32c0} fill="#1A0957" />
                <path d={svgPaths.p87ab6f0} fill="#1A0957" />
                <path d={svgPaths.p20a2e100} fill="#1A0957" />
                <path d={svgPaths.p66cf900} fill="#1A0957" />
              </g>
            </svg>
          </div>
        </div>

        {/* Country selector for medium screens (when top bar is hidden) */}
        <div className="hidden sm:flex lg:hidden items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 text-sm">
                {selectedCountry
                  ? <><span>{selectedCountry.flag}</span><span className="text-gray-700 font-medium">{selectedCountry.code}</span></>
                  : <span className="text-gray-700 font-medium">Tous</span>
                }
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white border shadow-lg" align="start">
              <div className="p-1">
                <div className="px-2 py-1.5 text-xs font-medium text-gray-500 border-b">
                  Choisir votre pays
                </div>
                {/* Option "Tous les pays" */}
                <DropdownMenuItem
                  onClick={() => onCountrySelect(null)}
                  className={`flex items-center space-x-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                    !selectedCountry ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span className="flex-1">Tous les pays</span>
                  {!selectedCountry && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                </DropdownMenuItem>
                {countries.map((country) => (
                  <DropdownMenuItem
                    key={country.code}
                    onClick={() => onCountrySelect(country)}
                    className={`flex items-center space-x-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedCountry?.code === country.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1">{country.name}</span>
                    {selectedCountry?.code === country.code && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation Links - Hidden on mobile */}
        <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 2xl:space-x-8">
          {navItems.map((item) => (
            <div key={item.key} className="relative">
              {item.hasDropdown ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-1 text-[#03033b] text-[16px] xl:text-[18px] 2xl:text-[20px] font-normal hover:font-bold transition-all group">
                      <span>{item.label}</span>
                      <ChevronDown className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 group-hover:rotate-180 transition-transform duration-200" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-white border shadow-lg">
                    {item.key === 'events' && (
                      <>
                        <DropdownMenuItem onClick={() => onNavigate('events')} className="hover:bg-gray-50">
                          Tous les événements
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigate('events', { featuredFilter: true, typeFilter: 'in-person' })} className="hover:bg-gray-50">
                          À la une
                        </DropdownMenuItem>
                      </>
                    )}
                    {item.key === 'streaming' && (
                      <>
                        <DropdownMenuItem onClick={() => onNavigate('events', { typeFilter: 'live', monthFilter: true })} className="hover:bg-gray-50">
                          En live de ce mois
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigate('events', { typeFilter: 'live' })} className="hover:bg-gray-50">
                          Tous les événements en live
                        </DropdownMenuItem>
                      </>
                    )}

                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => onNavigate(item.key)}
                  className={`text-[#03033b] text-[16px] xl:text-[18px] 2xl:text-[20px] transition-all hover:text-[#16BDA0] ${
                    item.isActive ? 'font-bold text-[#16BDA0]' : 'font-normal hover:font-bold'
                  }`}
                >
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
          {/* Live Event Button - Responsive */}
          <button
            onClick={() => onNavigate('live-events')}
            className="group relative bg-gradient-to-r from-[#dc2626] to-[#b91c1c] h-[30px] sm:h-[32px] md:h-[35px] w-[120px] sm:w-[140px] md:w-[160px] rounded-[20px] sm:rounded-[22px] md:rounded-[25px] flex items-center justify-center px-2 sm:px-3 md:px-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            
            {/* Content */}
            <div className="relative flex items-center z-10">
              <Zap className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] text-white mr-1 sm:mr-1.5 md:mr-2 group-hover:animate-pulse" />
              <span className="text-white text-[11px] sm:text-[12px] md:text-[14px] font-medium whitespace-nowrap">
                <span className="hidden sm:inline">Event en direct</span>
                <span className="sm:hidden">Live</span>
              </span>
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-[20px] sm:rounded-[22px] md:rounded-[25px] bg-gradient-to-r from-[#dc2626]/20 to-[#b91c1c]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          </button>

          {/* Post Ad Button - Responsive */}
          <button
            onClick={() => onNavigate('organizer-dashboard')}
            className="group relative bg-gradient-to-r from-[#03033b] to-[#1a0957] h-[30px] sm:h-[32px] md:h-[35px] w-[120px] sm:w-[140px] md:w-[160px] rounded-[20px] sm:rounded-[22px] md:rounded-[25px] flex items-center justify-center px-2 sm:px-3 md:px-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            
            {/* Content */}
            <div className="relative flex items-center z-10">
              <Megaphone className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] text-[#00BDD7] mr-1 sm:mr-1.5 md:mr-2 group-hover:animate-pulse" />
              <span className="text-white text-[11px] sm:text-[12px] md:text-[14px] font-medium whitespace-nowrap">
                <span className="hidden sm:inline">Poster l'annonce</span>
                <span className="sm:hidden">Poster</span>
              </span>
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-[20px] sm:rounded-[22px] md:rounded-[25px] bg-gradient-to-r from-[#00BDD7]/20 to-[#16BDA0]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          </button>



          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-1 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5 text-[#03033b]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left text-[#03033b]">Menu</SheetTitle>
              </SheetHeader>
              
              {/* Mobile Navigation */}
              <div className="flex flex-col space-y-4 mt-6">
                {/* Country selector for mobile */}
                <div className="pb-4 border-b border-gray-200">
                  <h3 className="font-semibold text-[#03033b] mb-3 text-sm">Votre position</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => {
                          onCountrySelect(country);
                        }}
                        className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
                          selectedCountry?.code === country.code
                            ? 'bg-blue-50 border-2 border-blue-200 text-blue-700'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span className="text-xs font-medium truncate">{country.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action buttons for mobile */}
                <div className="pb-4 border-b border-gray-200 space-y-3">
                  <button
                    onClick={() => {
                      onNavigate('events', { typeFilter: 'live' });
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Event en direct</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      onNavigate('organizer-dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-[#03033b] to-[#1a0957] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                  >
                    <Megaphone className="w-4 h-4 text-[#00BDD7]" />
                    <span>Poster l'annonce</span>
                  </button>
                </div>
                
                {navItems.map((item) => (
                  <div key={item.key} className="border-b border-gray-100 pb-4 last:border-b-0">
                    {item.hasDropdown ? (
                      <div>
                        <h3 className="font-semibold text-[#03033b] mb-2 text-lg">{item.label}</h3>
                        <div className="space-y-2 pl-4">
                          {item.key === 'events' && (
                            <>
                              <button
                                onClick={() => { onNavigate('events'); setIsMobileMenuOpen(false); }}
                                className="block w-full text-left text-gray-600 hover:text-[#16BDA0] transition-colors"
                              >
                                Tous les événements
                              </button>
                              <button
                                onClick={() => { onNavigate('events', { featuredFilter: true, typeFilter: 'in-person' }); setIsMobileMenuOpen(false); }}
                                className="flex items-center w-full text-left text-gray-600 hover:text-[#16BDA0] transition-colors"
                              >
                                <Star className="mr-2 h-4 w-4 text-green-500" />
                                À la une
                              </button>
                            </>
                          )}
                          {item.key === 'streaming' && (
                            <>
                              <button
                                onClick={() => { onNavigate('events', { typeFilter: 'live', monthFilter: true }); setIsMobileMenuOpen(false); }}
                                className="flex items-center w-full text-left text-gray-600 hover:text-[#16BDA0] transition-colors"
                              >
                                <Star className="mr-2 h-4 w-4 text-indigo-500" />
                                En live de ce mois
                              </button>
                              <button
                                onClick={() => { onNavigate('events', { typeFilter: 'live' }); setIsMobileMenuOpen(false); }}
                                className="block w-full text-left text-gray-600 hover:text-[#16BDA0] transition-colors"
                              >
                                Tous les événements en live
                              </button>
                              <button
                                onClick={() => { onNavigate('events', { typeFilter: 'live', featuredFilter: true }); setIsMobileMenuOpen(false); }}
                                className="flex items-center w-full text-left text-gray-600 hover:text-[#16BDA0] transition-colors"
                              >
                                <Star className="mr-2 h-4 w-4 text-green-500" />
                                À la une
                              </button>
                            </>
                          )}

                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          onNavigate(item.key);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left text-lg font-semibold transition-colors ${
                          item.isActive ? 'text-[#16BDA0]' : 'text-[#03033b] hover:text-[#16BDA0]'
                        }`}
                      >
                        {item.label}
                      </button>
                    )}
                  </div>
                ))}

                {/* Country selector for mobile */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="mb-4">
                    <h3 className="font-semibold text-[#03033b] text-sm mb-3">Votre position</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center w-full justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                          <div className="flex items-center space-x-2">
                            {selectedCountry
                              ? <><span className="text-lg">{selectedCountry.flag}</span><span className="text-[#03033b] font-medium">{selectedCountry.name}</span></>
                              : <span className="text-[#03033b] font-medium">Tous les pays</span>
                            }
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 bg-white border shadow-lg" align="start">
                        <div className="p-1">
                          <div className="px-2 py-1.5 text-xs font-medium text-gray-500 border-b">
                            Choisir votre pays
                          </div>
                          <DropdownMenuItem
                            onClick={() => { onCountrySelect(null); setIsMobileMenuOpen(false); }}
                            className={`flex items-center space-x-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                              !selectedCountry ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                            }`}
                          >
                            <span className="flex-1">Tous les pays</span>
                            {!selectedCountry && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                          </DropdownMenuItem>
                          {countries.map((country) => (
                            <DropdownMenuItem
                              key={country.code}
                              onClick={() => {
                                onCountrySelect(country);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`flex items-center space-x-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                                selectedCountry?.code === country.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                              }`}
                            >
                              <span className="text-lg">{country.flag}</span>
                              <span className="flex-1">{country.name}</span>
                              {selectedCountry?.code === country.code && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* User section for mobile */}
                {currentUser && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-[#03033b] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#00BDD7]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#03033b]">{currentUser.name}</p>
                        <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          onNavigate('user-dashboard');
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left text-gray-600 hover:text-[#16BDA0] transition-colors"
                      >
                        <User className="mr-3 h-4 w-4" />
                        Mon compte
                      </button>
                      <button
                        onClick={() => { onNavigate('my-favorites'); setIsMobileMenuOpen(false); }}
                        className="flex items-center w-full text-left text-gray-600 hover:text-[#16BDA0] transition-colors"
                      >
                        <Heart className="mr-3 h-4 w-4" />
                        Mes favoris
                      </button>
                      {currentUser.role === 'organizer' && (
                        <button
                          onClick={() => {
                            onNavigate('organizer-dashboard');
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center w-full text-left text-gray-600 hover:text-[#16BDA0] transition-colors"
                        >
                          <Settings className="mr-3 h-4 w-4" />
                          Dashboard organisateur
                        </button>
                      )}
                      {currentUser.adminRole && ['super_admin', 'admin', 'moderator', 'support'].includes(currentUser.adminRole) && (
                        <button
                          onClick={() => {
                            onNavigate('admin-dashboard');
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center w-full text-left text-gray-600 hover:text-[#16BDA0] transition-colors"
                        >
                          <Shield className="mr-3 h-4 w-4" />
                          Administration
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left text-red-600 hover:text-red-700 transition-colors"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}

                {/* Login button for mobile when not authenticated */}
                {!currentUser && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        onNavigate('login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-[#03033b] to-[#1a0957] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      Se connecter
                    </button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  );
}