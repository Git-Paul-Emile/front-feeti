/**
 * LoisirsADecouvrirSection — Section "À découvrir"
 * Affiche les loisirs selon le PDF :
 * - Offre PREMIUM → apparition dans section "À découvrir"
 * - Pack VISIBILITE_ACCUEIL actif → bannière homepage + section "À découvrir"
 * - Pack BOOST actif → homepage + carrousel loisirs
 * - Pack CAMPAGNE_PREMIUM actif → homepage + slider + section recommandée
 * Placée sur la homepage après LoisirsAlaUneSection.
 */
import { useState, useEffect } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeisureAPI, { type LeisureItem } from '../services/api/LeisureAPI';
import { LeisurePromotionBadge, isLeisurePackActive } from './PromotionBadge';

interface LoisirsADecouvrirSectionProps {
  onNavigate: (page: string, params?: any) => void;
}

export function LoisirsADecouvrirSection({ onNavigate }: LoisirsADecouvrirSectionProps) {
  const [items, setItems] = useState<LeisureItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = (lat?: number, lng?: number) => {
      LeisureAPI.getItems({ lat, lng })
        .then(allItems => {
          // PDF spec :
          // PREMIUM offre annuaire → section "À découvrir"
          // VISIBILITE_ACCUEIL pack → bannière homepage + "À découvrir"
          // BOOST → homepage + carrousel loisirs
          // CAMPAGNE_PREMIUM → homepage + slider + section recommandée
          const filtered = allItems.filter(i =>
            i.status === 'published' && (
              i.leisureOfferType === 'PREMIUM' ||
              isLeisurePackActive(i) // VISIBILITE_ACCUEIL + BOOST + CAMPAGNE_PREMIUM
            )
          );
          // Pack actif passe avant offre seule
          const PACK_RANK: Record<string, number> = { CAMPAGNE_PREMIUM: 3, BOOST: 2, VISIBILITE_ACCUEIL: 1 };
          filtered.sort((a, b) => {
            const rA = isLeisurePackActive(a) && a.leisurePackType ? (PACK_RANK[a.leisurePackType] ?? 0) : 0;
            const rB = isLeisurePackActive(b) && b.leisurePackType ? (PACK_RANK[b.leisurePackType] ?? 0) : 0;
            return rB - rA;
          });
          setItems(filtered.slice(0, 6));
        })
        .catch(() => {});
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchItems(pos.coords.latitude, pos.coords.longitude),
        () => fetchItems(),
        { timeout: 5000 }
      );
    } else {
      fetchItems();
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">À découvrir</h2>
            <p className="text-gray-500 text-sm">Établissements et activités mis en avant</p>
          </div>
          <button
            onClick={() => onNavigate('leisure')}
            className="text-sm font-medium text-[#16bda0] hover:text-[#12a88d] transition-colors underline underline-offset-2"
          >
            Voir tout
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden cursor-pointer border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              onClick={() => navigate(`/leisure/establishment/${item.id}`)}
            >
              {/* Image */}
              <div className="relative h-[180px] overflow-hidden">
                {item.image ? (
                  <div
                    className="absolute inset-0 bg-center bg-cover bg-no-repeat group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url('${item.image}')` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <LeisurePromotionBadge
                    offerType={item.leisureOfferType as any}
                    packType={item.leisurePackType as any}
                    packStatus={item.leisurePackStatus}
                    size="sm"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-white">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {item.category?.name ?? item.categorySlug}
                </p>
                <h3 className="text-gray-900 font-semibold text-base mb-2 truncate">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gray-500 text-xs min-w-0">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/leisure/establishment/${item.id}`); }}
                    className="flex items-center gap-1 text-[#16bda0] hover:text-[#12a88d] text-xs font-medium transition-colors shrink-0 ml-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Voir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
