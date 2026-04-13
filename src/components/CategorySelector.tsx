import { useState, useRef, useEffect, useCallback } from 'react';
import CategoriesAPI from '../services/api/CategoriesAPI';
import { Calendar, MapPin, Clock, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import svgPaths from "../imports/svg-leff6hoark";

// Icon Components for Categories
function VideoIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="video">
        <path d={svgPaths.p1adf5980} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p2db0380} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p3e760100} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="sound">
        <path d="M3 8.25V15.75" id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M7.5 5.75V18.25" id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M12 3.25V20.75" id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M16.5 5.75V18.25" id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M21 8.25V15.75" id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function BrushIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="brush">
        <path d={svgPaths.p137f9d00} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p36526000} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p1e724200} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function MusicnoteIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="musicnote">
        <path d={svgPaths.p8d41200} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M11.97 18V4" id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p17cba0f0} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function ReserveIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="reserve">
        <path d={svgPaths.pe124f80} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p32c1af80} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p7b2c300} id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M15 11H9" id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function WeightIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="weight">
        <path d={svgPaths.p414cb80} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p20568d00} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M9.82 12H14.18" id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M22.5 14.5V9.5" id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M1.5 14.5V9.5" id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function MicroscopeIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="microscope">
        <g id="Group">
          <path d={svgPaths.p3e73d500} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
          <path d={svgPaths.p2648080} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
          <path d={svgPaths.pbd9f800} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        </g>
        <path d="M12.05 12.2L7.56 22" id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M12 12.2L16.44 22" id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="briefcase">
        <path d={svgPaths.p5c67700} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.pd4ca500} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.p32c69a00} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.p1a788600} id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.p33c16f00} id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function CpuIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="cpu">
        <path d={svgPaths.p4025b00} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p2a720700} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M8.01 4V2" id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M12 4V2" id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M16 4V2" id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M20 8H22" id="Vector_6" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M20 12H22" id="Vector_7" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M20 16H22" id="Vector_8" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M16 20V22" id="Vector_9" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M12.01 20V22" id="Vector_10" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M8.01 20V22" id="Vector_11" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M2 8H4" id="Vector_12" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M2 12H4" id="Vector_13" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M2 16H4" id="Vector_14" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="building-4">
        <path d="M1 22H23" id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d="M19.78 22.01V17.55" id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.p2ce9bef0} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.p113a2f80} id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d="M5.79999 8.25H10.75" id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <path d="M5.79999 12H10.75" id="Vector_6" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <path d="M8.25 22V18.25" id="Vector_7" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function SpeedometerIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="speedometer">
        <path d={svgPaths.p23b2d880} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.p3fb0c920} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.p26d1a580} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function HospitalIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="hospital">
        <path d="M2 22H22" id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <path d={svgPaths.p126f7180} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <path d={svgPaths.p28397300} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <g id="Group">
          <path d="M12 6V11" id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
          <path d="M9.5 8.5H14.5" id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        </g>
      </g>
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="crown">
        <path d={svgPaths.p32bdf280} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M6.5 22H17.5" id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M9.5 14H14.5" id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function TreeIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="tree">
        <g id="Group">
          <path d={svgPaths.p3052a800} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
          <path d={svgPaths.p7564c00} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        </g>
        <path d="M12 22V18" id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="book">
        <path d={svgPaths.p75c9200} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M12 5.49V20.49" id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M7.75 8.49H5.5" id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M8.5 11.49H5.5" id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function PenToolIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="pen-tool">
        <path d={svgPaths.p37412200} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p21bd900} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p1b1f7100} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p9196d40} id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d={svgPaths.p22eb5b00} id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function GlobalIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="global">
        <path d={svgPaths.pace200} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p168b3380} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p2bfa5680} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p1920f500} id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p219c3a80} id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// Category Tab Component - Optimized for vertical alignment
interface CategoryTabProps {
  icon: React.ReactNode;
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CategoryTab({ icon, label, isSelected = false, onClick }: CategoryTabProps) {
  return (
    <button
      onClick={onClick}
      className={`group box-border flex items-center justify-center px-[20px] py-[12px] relative rounded-[100px] shrink-0 transition-all duration-300 hover:scale-105 active:scale-95 min-h-[48px] ${
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

// Enhanced Search Bar Component with advanced filters
function SearchBar({ searchQuery, onSearchChange, onSearch }: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: (query: string) => void;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Main Search Bar */}
      <div className="bg-white h-[48px] relative rounded-[32px] shrink-0 w-full" data-name="Search">
        <div aria-hidden="true" className="absolute border border-[#dddddd] border-solid inset-0 pointer-events-none rounded-[32px]" />
        <div className="flex flex-row items-center relative size-full">
          <div className="box-border content-stretch flex gap-[12px] h-[48px] items-center justify-start px-[16px] py-0 relative w-full">
            <div className="basis-0 box-border content-stretch flex flex-col grow items-start justify-center min-h-px min-w-px px-0 py-[11px] relative shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Events, Attraction, Playground, ...."
                className="w-full bg-transparent border-none outline-none font-['Montserrat:Regular',_sans-serif] font-normal leading-[16px] text-[#717171] text-[12px] tracking-[-0.36px] placeholder:text-[#717171] focus:text-[#000441]"
              />
            </div>
            
            {/* Filter Toggle Button */}
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <button className="relative shrink-0 size-[20px] hover:scale-110 transition-transform duration-200" data-name="filter-button">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                    <g id="equalizer / 24 / Outline">
                      <path d={svgPaths.p2e449180} fill="var(--fill-0, #B0B0B0)" id="Vector" />
                    </g>
                  </svg>
                </button>
              </PopoverTrigger>
              
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-[#000441]">Filtres avancés</h4>
                  
                  {/* Date Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#000441] flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Période
                    </label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir une période" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les dates</SelectItem>
                        <SelectItem value="today">Aujourd'hui</SelectItem>
                        <SelectItem value="tomorrow">Demain</SelectItem>
                        <SelectItem value="week">Cette semaine</SelectItem>
                        <SelectItem value="month">Ce mois</SelectItem>
                        <SelectItem value="weekend">Ce week-end</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#000441] flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Localisation
                    </label>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir une zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Partout</SelectItem>
                        <SelectItem value="near">Proche de moi (5km)</SelectItem>
                        <SelectItem value="city">Dans ma ville</SelectItem>
                        <SelectItem value="region">Dans ma région</SelectItem>
                        <SelectItem value="country">Dans mon pays</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Apply Filters */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-[#cdff71] text-[#000441] hover:bg-[#b8e55c]"
                      onClick={() => {
                        onSearch(searchQuery);
                        setShowFilters(false);
                      }}
                    >
                      Appliquer
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setDateFilter('all');
                        setLocationFilter('all');
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(dateFilter !== 'all' || locationFilter !== 'all') && (
        <div className="flex flex-wrap gap-2 px-4">
          {dateFilter !== 'all' && (
            <div className="bg-[#cdff71] text-[#000441] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 filter-pill">
              <Clock className="w-3 h-3" />
              {dateFilter === 'today' ? 'Aujourd\'hui' :
               dateFilter === 'tomorrow' ? 'Demain' :
               dateFilter === 'week' ? 'Cette semaine' :
               dateFilter === 'month' ? 'Ce mois' :
               dateFilter === 'weekend' ? 'Ce week-end' : dateFilter}
              <button 
                onClick={() => setDateFilter('all')}
                className="hover:bg-[#000441] hover:text-white rounded-full w-4 h-4 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
          )}
          {locationFilter !== 'all' && (
            <div className="bg-[#cdff71] text-[#000441] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 filter-pill">
              <MapPin className="w-3 h-3" />
              {locationFilter === 'near' ? 'Proche (5km)' :
               locationFilter === 'city' ? 'Ma ville' :
               locationFilter === 'region' ? 'Ma région' :
               locationFilter === 'country' ? 'Mon pays' : locationFilter}
              <button 
                onClick={() => setLocationFilter('all')}
                className="hover:bg-[#000441] hover:text-white rounded-full w-4 h-4 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Mapping icône par slug de catégorie
export function getCategoryIcon(slug: string): React.ReactNode {
  const map: Record<string, React.ReactNode> = {
    'musique':     <MusicnoteIcon />,
    'concert':     <SoundIcon />,
    'festival':    <MusicnoteIcon />,
    'jazz':        <SoundIcon />,
    'theatre':     <VideoIcon />,
    'art-culture': <BrushIcon />,
    'danse':       <TreeIcon />,
    'cinema':      <VideoIcon />,
    'sport':       <WeightIcon />,
    'competition': <SpeedometerIcon />,
    'conference':  <MicroscopeIcon />,
    'formation':   <BookIcon />,
    'forum':       <BriefcaseIcon />,
    'tech':        <CpuIcon />,
    'gastronomie': <ReserveIcon />,
    'humour':      <GlobalIcon />,
    'soiree':      <CrownIcon />,
    'culte':       <HospitalIcon />,
    'autre':       <PenToolIcon />,
  };
  return map[slug] ?? <BrushIcon />;
}


// Main Category Selector Component with Single Row
interface CategorySelectorProps {
  onCategorySelect?: (category: string) => void;
  onSearch?: (query: string, filters?: any) => void;
}

export function CategorySelector({ onCategorySelect, onSearch }: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<{ name: string; slug: string; icon?: string }[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    CategoriesAPI.getAll()
      .then((cats) => { setCategories(cats); setError(false); })
      .catch(() => { setCategories([]); setError(true); });
  }, []);

  const handleCategoryClick = useCallback((categoryName: string) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory('');
      onCategorySelect?.('');
    } else {
      setSelectedCategory(categoryName);
      onCategorySelect?.(categoryName);
    }
  }, [selectedCategory, onCategorySelect]);

  const handleSearch = (query: string, filters?: any) => {
    onSearch?.(query, filters);
  };

  return (
    <section className="bg-[#000441] py-12" data-name="Category Selector">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Découvrez vos événements
          </h2>
          <p className="text-base text-white/80 max-w-2xl mx-auto">
            Explorez notre sélection d'événements par catégorie et trouvez l'expérience parfaite pour vous
          </p>
        </div>

        {/* Enhanced Search Bar */}
        <div className="mb-8">
          <SearchBar 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>

        {/* Categories Container - Single Row with Horizontal Scroll */}
        <div className="bg-[#000441] px-4 py-6 rounded-[32px]" data-name="Categories Container">
          <div className="overflow-x-auto category-slider scrollbar-hide">
            <div className="flex gap-3 min-w-max">
              {error || categories.length === 0 ? (
                <p className="text-white/50 text-sm py-2 px-4">
                  {error ? 'Impossible de charger les catégories.' : 'Aucune catégorie disponible.'}
                </p>
              ) : categories.map((category: { name: string; slug: string; icon?: string }, index: number) => (
                <CategoryTab
                  key={`${category.slug}-${index}`}
                  icon={getCategoryIcon(category.slug)}
                  label={category.name}
                  isSelected={selectedCategory === category.name}
                  onClick={() => handleCategoryClick(category.name)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}