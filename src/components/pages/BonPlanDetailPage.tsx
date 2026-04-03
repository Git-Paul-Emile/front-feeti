import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';
import DealsBackendAPI, { type BackendDeal } from '../../services/api/DealsBackendAPI';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  Users,
  Tag,
  Phone,
  Globe,
  Share2,
  Heart,
  Loader2,
  Percent,
  Store,
} from 'lucide-react';

interface BonPlanDetailPageProps {
  dealId?: string;
  onBack: () => void;
}

function parseTags(json: string): string[] {
  try { return JSON.parse(json); } catch { return []; }
}

const CATEGORY_LABELS: Record<string, string> = {
  weekly: 'Hebdomadaire',
  general: 'Général',
  'feeti-na-feeti': 'Feeti Na Feeti',
  restaurants: 'Restaurants',
  hotels: 'Hôtels',
  activities: 'Activités',
  shopping: 'Shopping',
};

const CATEGORY_COLORS: Record<string, string> = {
  weekly: '#de0035',
  general: '#059669',
  'feeti-na-feeti': '#7c3aed',
  restaurants: '#dc2626',
  hotels: '#0891b2',
  activities: '#ea580c',
  shopping: '#be123c',
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

function getDaysRemaining(dateStr: string) {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
  ));
}

export function BonPlanDetailPage({ dealId, onBack }: BonPlanDetailPageProps) {
  const [deal, setDeal] = useState<BackendDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (!dealId) { setLoading(false); return; }
    DealsBackendAPI.getDealById(dealId)
      .then(setDeal)
      .catch(() => setDeal(null))
      .finally(() => setLoading(false));
  }, [dealId]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share && deal) {
      navigator.share({ title: deal.title, text: deal.description, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Bon plan introuvable.</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const tags = parseTags(deal.tags);
  const daysRemaining = getDaysRemaining(deal.validUntil);
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining === 0;
  const categoryColor = CATEGORY_COLORS[deal.category] || '#de0035';
  const categoryLabel = CATEGORY_LABELS[deal.category] || deal.category;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-[300px] sm:h-[400px] lg:h-[480px] overflow-hidden">
        <ImageWithFallback
          src={deal.image}
          alt={deal.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="bg-white/90 border-0 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>

        {/* Action buttons top right */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            className="w-9 h-9 p-0 rounded-full bg-white/90 border-0 backdrop-blur-sm"
          >
            <Share2 className="w-4 h-4 text-gray-700" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsWishlisted(w => !w);
              toast.success(isWishlisted ? 'Retiré des favoris' : 'Ajouté aux favoris');
            }}
            className={`w-9 h-9 p-0 rounded-full bg-white/90 border-0 backdrop-blur-sm ${isWishlisted ? 'text-red-500' : 'text-gray-700'}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Badges bottom left */}
        <div className="absolute bottom-6 left-6 flex gap-2 flex-wrap">
          <div
            className="inline-flex items-center px-3 py-1.5 rounded-md text-white text-sm font-medium"
            style={{ backgroundColor: categoryColor }}
          >
            {categoryLabel}
          </div>
          <div className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-500 text-white text-sm font-bold">
            <Percent className="w-3.5 h-3.5 mr-1" />
            -{deal.discount}%
          </div>
          {deal.isPopular && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-md bg-red-500 text-white text-sm font-medium">
              <Star className="w-3.5 h-3.5 mr-1 fill-current" />
              Populaire
            </div>
          )}
          {isExpiringSoon && !isExpired && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-md bg-orange-500 text-white text-sm font-medium animate-pulse">
              <Clock className="w-3.5 h-3.5 mr-1" />
              Expire dans {daysRemaining}j
            </div>
          )}
          {isExpired && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-500 text-white text-sm font-medium">
              Expiré
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Title + Price */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{deal.title}</h1>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-indigo-600">{formatPrice(deal.discountedPrice)}</span>
              <span className="text-lg text-gray-400 line-through">{formatPrice(deal.originalPrice)}</span>
            </div>
            <div className="bg-green-100 text-green-800 font-bold px-3 py-1.5 rounded-lg text-lg">
              Économie : {formatPrice(deal.originalPrice - deal.discountedPrice)}
            </div>
          </div>

          {deal.rating !== undefined && deal.rating !== null && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">{renderStars(deal.rating)}</div>
              <span className="text-gray-600 text-sm">
                {deal.rating.toFixed(1)}{deal.reviewCount ? ` (${deal.reviewCount} avis)` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Localisation</p>
                  <p className="font-semibold">{deal.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Validité</p>
                  <p className="font-semibold">
                    {isExpired
                      ? 'Offre expirée'
                      : `Valide encore ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    Jusqu'au {new Date(deal.validUntil).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {deal.availableQuantity !== undefined && deal.availableQuantity !== null && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Disponibilité</p>
                    <p className="font-semibold">
                      {deal.availableQuantity} / {deal.maxQuantity ?? '∞'} disponibles
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Description */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{deal.description}</p>
          </CardContent>
        </Card>

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contact / Merchant */}
        <Card className="border-indigo-100 bg-indigo-50/50">
          <CardContent className="pt-5 pb-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-indigo-600" />
              Contact & Marchand
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-bold">{deal.merchantName.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{deal.merchantName}</p>
                  <p className="text-sm text-gray-500">{categoryLabel}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>{deal.location}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto text-xs"
                  onClick={() => {
                    const query = encodeURIComponent(deal.location);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                  }}
                >
                  <Globe className="w-3.5 h-3.5 mr-1" />
                  Voir sur Maps
                </Button>
              </div>

              <div className="pt-2 border-t border-indigo-100">
                <p className="text-sm text-gray-500">
                  Pour profiter de cette offre, présentez-vous chez <strong>{deal.merchantName}</strong> à <strong>{deal.location}</strong> avant l'expiration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <Button
            size="lg"
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold h-12 text-base"
            disabled={isExpired}
            onClick={() => toast.success(`Offre "${deal.title}" — rendez-vous chez ${deal.merchantName} !`)}
          >
            {isExpired ? 'Offre expirée' : 'Profiter de l\'offre'}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="sm:w-auto h-12"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>
    </div>
  );
}
