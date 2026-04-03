import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';
import LeisureAPI, { type LeisureItem } from '../../services/api/LeisureAPI';
import { useAuth } from '../../context/AuthContext';

interface EstablishmentDetailPageProps {
  onBack: () => void;
  establishmentId?: string;
}

function parseTags(json: string): string[] {
  try { return JSON.parse(json); } catch { return []; }
}

export function EstablishmentDetailPage({ onBack, establishmentId }: EstablishmentDetailPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<LeisureItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (!establishmentId) { setLoading(false); return; }
    LeisureAPI.getItemById(establishmentId)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [establishmentId]);

  useEffect(() => {
    if (!user || !establishmentId) return;
    LeisureAPI.checkFavorite(establishmentId)
      .then(setIsFavorited)
      .catch(() => {});
  }, [user?.id, establishmentId]);

  const handleToggleFavorite = useCallback(async () => {
    if (!user) { navigate('/login'); return; }
    if (!establishmentId) return;
    try {
      const result = await LeisureAPI.toggleFavorite(establishmentId);
      setIsFavorited(result.isFavorited);
      toast.success(result.isFavorited ? 'Ajouté aux favoris' : 'Retiré des favoris');
    } catch {
      toast.error('Erreur lors de la mise à jour des favoris');
    }
  }, [user, establishmentId, navigate]);

  const handleShare = useCallback(() => {
    if (navigator.share && item) {
      navigator.share({ title: item.name, text: `Découvrez ${item.name} sur Feeti`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers');
    }
  }, [item]);

  const handleLocation = useCallback(() => {
    if (!item) return;
    const query = encodeURIComponent(item.address || item.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  }, [item]);

  const handlePhone = useCallback(() => {
    if (item?.phone) window.open(`tel:${item.phone}`);
  }, [item]);

  const handleWebsite = useCallback(() => {
    if (item?.website) window.open(item.website.startsWith('http') ? item.website : `https://${item.website}`, '_blank');
  }, [item]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
        <p className="text-xl font-medium">Établissement introuvable</p>
        <Button onClick={onBack} variant="outline">Retour aux loisirs</Button>
      </div>
    );
  }

  const tags = parseTags(item.tags);
  const features = parseTags(item.features);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero image */}
      <div className="relative h-[480px] overflow-hidden">
        <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Top controls */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <Button onClick={onBack} variant="ghost" className="bg-white/90 hover:bg-white text-gray-900 shadow-md">
            Retour
          </Button>
          <div className="flex gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${isFavorited ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-red-50'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-gray-700 hover:bg-gray-100 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, i) => <Badge key={i} className="bg-white/20 text-white border-white/30">{tag}</Badge>)}
          </div>
          <h1 className="text-4xl font-black text-white mb-2">{item.name}</h1>
          <p className="text-white/80 text-sm">{item.category?.name} · {item.location}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Key info row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {item.rating && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-black text-indigo-600">{item.rating.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">{item.reviewCount ?? 0} avis</p>
              </CardContent>
            </Card>
          )}
          {item.priceRange && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm font-bold text-gray-900">{item.priceRange}</p>
                <p className="text-xs text-gray-500 mt-1">Prix</p>
              </CardContent>
            </Card>
          )}
          {item.openingHours && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm font-bold text-gray-900">{item.openingHours}</p>
                <p className="text-xs text-gray-500 mt-1">Horaires</p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm font-bold text-gray-900 truncate">{item.location}</p>
              <p className="text-xs text-gray-500 mt-1">Localisation</p>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{item.description}</p>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Équipements & Services</h2>
            <div className="flex flex-wrap gap-2">
              {features.map((f, i) => (
                <Badge key={i} variant="outline" className="text-sm px-3 py-1">{f}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contact & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {item.phone && (
            <Button onClick={handlePhone} variant="outline" className="w-full">
              Appeler
            </Button>
          )}
          <Button onClick={handleLocation} className="w-full bg-[#de0035] hover:bg-[#de0035]/90 text-white">
            Voir sur la carte
          </Button>
          {item.website && (
            <Button onClick={handleWebsite} variant="outline" className="w-full">
              Site web
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
