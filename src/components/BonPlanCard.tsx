import React, { useState } from 'react';
import { Heart, MapPin, Clock, Star, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DiscountBadge } from './DiscountBadge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SocialShareButton } from './SocialShareButton';

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

interface BonPlanCardProps {
  plan: BonPlan;
  variant?: 'default' | 'compact' | 'large';
  onCTAClick?: (planId: string) => void;
  onWishlistToggle?: (planId: string, isAdded: boolean) => void;
  onClick?: (planId: string) => void;
}

export function BonPlanCard({
  plan,
  variant = 'default',
  onCTAClick,
  onWishlistToggle,
  onClick,
}: BonPlanCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    const endDate = new Date(dateStr);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isWishlisted;
    setIsWishlisted(newState);
    onWishlistToggle?.(plan.id, newState);
  };

  const handleCTAClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCTAClick?.(plan.id);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'weekly': '#de0035',
      'general': '#059669',
      'feeti-na-feeti': '#7c3aed',
      'restaurants': '#dc2626',
      'hotels': '#0891b2',
      'activities': '#ea580c',
      'shopping': '#be123c'
    };
    return colors[category] || '#de0035';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'weekly': 'HEBDO',
      'general': 'GÉNÉRAL',
      'feeti-na-feeti': 'FEETI',
      'restaurants': 'RESTO',
      'hotels': 'HÔTEL',
      'activities': 'ACTIVITÉ',
      'shopping': 'SHOPPING'
    };
    return labels[category] || 'OFFRE';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const daysRemaining = getDaysRemaining(plan.validUntil);
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
  const categoryColor = getCategoryColor(plan.category);

  if (variant === 'compact') {
    return (
      <div className="relative w-full max-w-[380px] cursor-pointer group" onClick={() => onClick?.(plan.id)}>
        <div
          className="relative h-[320px] rounded-xl overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${plan.image}')` }}
        >
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Content positioned at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="space-y-4">
              {/* Category Badge */}
              <div 
                className="inline-flex items-center justify-center px-3 py-1 rounded-md"
                style={{ backgroundColor: categoryColor }}
              >
                <span className="text-white text-sm font-medium tracking-wide">
                  {getCategoryLabel(plan.category)}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-white text-xl font-semibold leading-tight best-off-text-enhanced line-clamp-2">
                {plan.title}
              </h3>

              {/* Merchant info */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {plan.merchantName.charAt(0)}
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium">
                    {plan.merchantName}
                  </span>
                </div>
                <span className="text-white/80 text-sm">
                  Valide {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {plan.isPopular && (
              <Badge className="bg-red-500 text-white border-0">
                <Star className="w-3 h-3 mr-1" />
                Populaire
              </Badge>
            )}
            <DiscountBadge discount={plan.discount} />
          </div>

          {/* Action buttons top right */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {/* Share button */}
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
              <SocialShareButton
                url={`https://feeti.com/deals/${plan.id}`}
                title={plan.title}
                description={`${plan.description} - ${plan.discount}% de réduction chez ${plan.merchantName}`}
                image={plan.image}
                size="sm"
                variant="ghost"
              />
            </div>
            
            {/* Wishlist button */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleWishlistClick}
              className={`w-9 h-9 rounded-full bg-white/90 border-0 hover:bg-white transition-all duration-300 ${
                isWishlisted ? 'text-red-500' : 'text-gray-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Expiring badge */}
          {isExpiringSoon && (
            <div className="absolute bottom-4 right-4">
              <Badge variant="destructive" className="bg-red-600 border-0 animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                {daysRemaining}j
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[480px] cursor-pointer group" onClick={() => onClick?.(plan.id)}>
      <div
        className="relative h-[400px] rounded-xl overflow-hidden bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-[1.02]"
        style={{ backgroundImage: `url('${plan.image}')` }}
      >
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Content positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="space-y-6">
            {/* Category Badge */}
            <div 
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg"
              style={{ backgroundColor: categoryColor }}
            >
              <span className="text-white font-medium tracking-wide">
                {getCategoryLabel(plan.category)}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-white text-2xl font-semibold leading-tight best-off-text-enhanced line-clamp-2">
              {plan.title}
            </h3>

            {/* Price and CTA Section */}
            <div className="space-y-4">
              {/* Price Display */}
              <div className="flex items-center space-x-3">
                <div className="flex items-baseline space-x-2">
                  <span className="text-white text-2xl font-bold best-off-date-enhanced">
                    {formatPrice(plan.discountedPrice)}
                  </span>
                  <span className="text-white/60 text-lg line-through">
                    {formatPrice(plan.originalPrice)}
                  </span>
                </div>
                <DiscountBadge discount={plan.discount} size="lg" />
              </div>

              {/* Merchant and Location Info */}
              <div className="flex items-center justify-between text-white/90">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {plan.merchantName.charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium">
                    {plan.merchantName}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{plan.location}</span>
                </div>
              </div>

              {/* Rating and Reviews */}
              {plan.rating && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(plan.rating)}
                  </div>
                  <span className="text-white/80 text-sm">
                    {plan.rating} ({plan.reviewCount} avis)
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2 text-white/80 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>
                    {daysRemaining > 0 
                      ? `Expire dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}` 
                      : 'Expiré'
                    }
                  </span>
                  {plan.availableQuantity && plan.maxQuantity && (
                    <>
                      <Users className="w-4 h-4 ml-2" />
                      <span>{plan.availableQuantity}/{plan.maxQuantity} dispos</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Wishlist Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleWishlistClick}
                    className={`w-10 h-10 rounded-full bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 ${
                      isWishlisted ? 'text-red-400 bg-red-500/20' : 'text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </Button>

                  {/* CTA Button */}
                  <Button
                    onClick={handleCTAClick}
                    className="premium-button bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 px-6 py-2 h-10 font-semibold transition-all duration-300 transform hover:scale-105"
                    disabled={daysRemaining === 0}
                  >
                    {daysRemaining === 0 ? 'Expiré' : 'Profiter'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top badges */}
        <div className="absolute top-6 left-6 flex gap-2">
          {plan.isPopular && (
            <Badge className="bg-red-500 text-white border-0 shadow-lg">
              <Star className="w-3 h-3 mr-1" />
              Populaire
            </Badge>
          )}
          {isExpiringSoon && (
            <Badge variant="destructive" className="bg-orange-600 border-0 animate-pulse shadow-lg">
              <Clock className="w-3 h-3 mr-1" />
              Urgent
            </Badge>
          )}
        </div>

        {/* Share button top right */}
        <div className="absolute top-6 right-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
            <SocialShareButton
              url={`https://feeti.com/deals/${plan.id}`}
              title={plan.title}
              description={`${plan.description} - ${plan.discount}% de réduction chez ${plan.merchantName}`}
              image={plan.image}
              size="sm"
              variant="ghost"
            />
          </div>
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );
}