import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent } from '../ui/dialog';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';
import LeisureAPI, { type LeisureItem } from '../../services/api/LeisureAPI';
import { useAuth } from '../../context/AuthContext';
import { useCountry } from '../../context/CountryContext';

interface LeisureCategoryPageProps {
  categorySlug: string;
  pageTitle: string;
  heroBg?: string;
}

function parseTags(tags: string): string[] {
  try { return JSON.parse(tags); } catch { return []; }
}

export function LeisureCategoryPage({ categorySlug, pageTitle, heroBg }: LeisureCategoryPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedCountry } = useCountry();

  const [items, setItems] = useState<LeisureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [detailItem, setDetailItem] = useState<LeisureItem | null>(null);

  useEffect(() => {
    setLoading(true);
    LeisureAPI.getItems({ categorySlug, countryCode: selectedCountry?.code })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [categorySlug, selectedCountry?.code]);

  useEffect(() => {
    if (!user) { setFavoriteIds(new Set()); return; }
    LeisureAPI.getMyFavorites()
      .then(favs => setFavoriteIds(new Set(favs.map(f => f.id))))
      .catch(() => {});
  }, [user?.id]);

  const handleToggleFavorite = useCallback(async (itemId: string) => {
    if (!user) { navigate('/login'); return; }
    try {
      const result = await LeisureAPI.toggleFavorite(itemId);
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (result.isFavorited) next.add(itemId); else next.delete(itemId);
        return next;
      });
      toast.success(result.isFavorited ? 'Ajouté aux favoris' : 'Retiré des favoris');
    } catch {
      toast.error('Erreur lors de la mise à jour des favoris');
    }
  }, [user, navigate]);

  const handleMoreInfo = (item: LeisureItem) => setDetailItem(item);

  const handleLocation = (item: LeisureItem) => {
    const query = encodeURIComponent(item.address || item.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const bgImage = heroBg || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-[200px] overflow-hidden rounded-[12px] mx-[72px] mt-[141px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(20,22,36,0.5), rgba(20,22,36,0.5)), url('${bgImage}')` }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <h1 className="text-[48px] font-black text-white tracking-[-0.25px] leading-[48px]">
            {pageTitle.toUpperCase()}
          </h1>
          <button
            onClick={() => navigate('/leisure')}
            className="text-white/80 hover:text-white text-sm underline"
          >
            Retour aux loisirs
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="px-[6.25%] py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl font-medium">Aucun établissement disponible</p>
            <p className="text-sm mt-2">Revenez bientôt pour découvrir cette catégorie</p>
          </div>
        ) : (
          <div className="space-y-16">
            {items.map((item, index) => (
              <div key={item.id} className={`flex gap-4 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                <div className="relative w-full">
                  <div className="flex gap-4">
                    {/* Content panel */}
                    <div className="bg-white rounded-[24px] w-1/2 min-h-[320px] relative z-10 flex flex-col justify-between p-8 shadow-sm border border-gray-100">
                      <div>
                        <div className="mb-4 flex flex-wrap gap-1">
                          {parseTags(item.tags).map((tag, i) => (
                            <span key={i} className="text-[#00bdd7] text-[14px] font-bold">
                              {i > 0 ? ' • ' : ''}{tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-[28px] font-black text-[#1e1e1e] leading-[36px] tracking-[-0.25px] mb-3">
                          {item.name}
                        </h3>
                        {item.priceRange && (
                          <p className="text-sm font-semibold text-indigo-600 mb-3">{item.priceRange}</p>
                        )}
                        {item.openingHours && (
                          <p className="text-xs text-gray-500 mb-3">Horaires : {item.openingHours}</p>
                        )}
                        <p className="text-[#717171] text-[15px] leading-[24px] line-clamp-4">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <Button
                          onClick={() => handleMoreInfo(item)}
                          className="bg-[#de0035] hover:bg-[#de0035]/90 text-white h-[38px] px-[16px] text-[13px] font-semibold"
                        >
                          + D&apos;infos
                        </Button>
                        <Button
                          onClick={() => handleLocation(item)}
                          className="bg-[#de0035] hover:bg-[#de0035]/90 text-white h-[38px] px-[16px] text-[13px] font-semibold"
                        >
                          Localisation
                        </Button>
                      </div>
                    </div>

                    {/* Image panel */}
                    <div className="w-1/2 min-h-[320px] rounded-[24px] overflow-hidden relative">
                      <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-white bg-black/40 rounded-full px-4 py-1">
                        <span className="text-[14px]">{item.location}</span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={() => handleToggleFavorite(item.id)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${favoriteIds.has(item.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-red-50'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={favoriteIds.has(item.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                          </svg>
                        </button>
                      </div>
                      {item.isFeatured && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-amber-500 text-white">Recommandé</Badge>
                        </div>
                      )}
                      {item.rating && (
                        <div className="absolute bottom-4 right-4 bg-white/90 rounded-full px-3 py-1 text-sm font-bold text-gray-800">
                          {item.rating.toFixed(1)} ({item.reviewCount ?? 0})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Detail Modal */}
      <Dialog open={!!detailItem} onOpenChange={open => { if (!open) setDetailItem(null); }}>
        <DialogContent className="max-w-2xl p-0 rounded-[24px] max-h-[90vh] overflow-y-auto">
          {detailItem && (
            <div className="flex flex-col">
              {/* Image only */}
              <div className="relative h-[240px] flex-shrink-0 rounded-t-[24px] overflow-hidden">
                <ImageWithFallback src={detailItem.image} alt={detailItem.name} className="w-full h-full object-cover" />
                {detailItem.isFeatured && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-amber-500 text-white">Recommandé</Badge>
                  </div>
                )}
                <button
                  onClick={() => handleToggleFavorite(detailItem.id)}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${favoriteIds.has(detailItem.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-red-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={favoriteIds.has(detailItem.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-6 pt-5 pb-6 space-y-5">
                {/* Title + meta */}
                <div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {parseTags(detailItem.tags).map((tag, i) => (
                      <span key={i} className="text-[#00bdd7] text-xs font-bold">{i > 0 ? ' • ' : ''}{tag}</span>
                    ))}
                  </div>
                  <h2 className="text-2xl font-black text-[#1e1e1e] leading-tight">{detailItem.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">{detailItem.category?.name} · {detailItem.location}</p>
                </div>

                {/* Key info */}
                <div className="grid grid-cols-3 gap-3">
                  {detailItem.rating && (
                    <div className="bg-gray-50 rounded-[12px] p-3 text-center">
                      <p className="text-xl font-black text-indigo-600">{detailItem.rating.toFixed(1)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{detailItem.reviewCount ?? 0} avis</p>
                    </div>
                  )}
                  {detailItem.priceRange && (
                    <div className="bg-gray-50 rounded-[12px] p-3 text-center">
                      <p className="text-sm font-bold text-gray-900">{detailItem.priceRange}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Prix</p>
                    </div>
                  )}
                  {detailItem.openingHours && (
                    <div className="bg-gray-50 rounded-[12px] p-3 text-center">
                      <p className="text-sm font-bold text-gray-900 truncate">{detailItem.openingHours}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Horaires</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{detailItem.description}</p>
                </div>

                {/* Features */}
                {parseTags(detailItem.features).length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">Équipements & Services</h3>
                    <div className="flex flex-wrap gap-2">
                      {parseTags(detailItem.features).map((f, i) => (
                        <Badge key={i} variant="outline" className="text-xs px-2 py-0.5">{f}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {detailItem.phone && (
                    <Button variant="outline" className="flex-1" onClick={() => window.open(`tel:${detailItem.phone}`)}>
                      Appeler
                    </Button>
                  )}
                  <Button
                    className="flex-1 bg-[#de0035] hover:bg-[#de0035]/90 text-white"
                    onClick={() => handleLocation(detailItem)}
                  >
                    Localisation
                  </Button>
                  {detailItem.website && (
                    <Button variant="outline" className="flex-1" onClick={() => window.open(detailItem.website!.startsWith('http') ? detailItem.website! : `https://${detailItem.website}`, '_blank')}>
                      Site web
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
