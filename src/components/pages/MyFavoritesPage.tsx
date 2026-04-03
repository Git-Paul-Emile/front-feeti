import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowLeft, Heart, Calendar, MapPin, Users, RefreshCw } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import EventsBackendAPI, { type BackendEvent } from '../../services/api/EventsBackendAPI';
import LeisureAPI, { type LeisureItem } from '../../services/api/LeisureAPI';
import { toast } from 'sonner';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

function formatPrice(price: number, currency: string) {
  if (price === 0) return 'Gratuit';
  if (currency === 'FCFA') return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);
}

export function MyFavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<BackendEvent[]>([]);
  const [leisureFavorites, setLeisureFavorites] = useState<LeisureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [events, leisure] = await Promise.allSettled([
        EventsBackendAPI.getMyFavorites(),
        LeisureAPI.getMyFavorites(),
      ]);
      if (events.status === 'fulfilled') setFavorites(events.value);
      if (leisure.status === 'fulfilled') setLeisureFavorites(leisure.value);
    } catch {
      toast.error('Impossible de charger vos favoris');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRemoveFavorite = async (event: BackendEvent) => {
    setRemovingId(event.id);
    try {
      await EventsBackendAPI.toggleFavorite(event.id);
      setFavorites(prev => prev.filter(e => e.id !== event.id));
      toast.success('Retiré des favoris');
    } catch {
      toast.error('Erreur lors de la suppression du favori');
    } finally {
      setRemovingId(null);
    }
  };

  const handleRemoveLeisureFavorite = async (item: LeisureItem) => {
    setRemovingId(item.id);
    try {
      await LeisureAPI.toggleFavorite(item.id);
      setLeisureFavorites(prev => prev.filter(i => i.id !== item.id));
      toast.success('Retiré des favoris');
    } catch {
      toast.error('Erreur lors de la suppression du favori');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <h1 className="text-lg font-semibold">
            Mes favoris
          </h1>
          <Button variant="outline" size="sm" onClick={load} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600" />
          </div>
        ) : favorites.length === 0 && leisureFavorites.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucun favori</h2>
              <p className="text-gray-500 mb-6">
                Vous n'avez pas encore ajouté d'événements ou de loisirs à vos favoris.
              </p>
              <Button onClick={() => navigate('/events')} className="bg-indigo-600 hover:bg-indigo-700">
                Explorer les événements
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* ── Événements ── */}
            {favorites.length > 0 && (
            <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-700">Événements ({favorites.length})</h2>
            <p className="text-sm text-gray-500">
              {favorites.length} événement{favorites.length > 1 ? 's' : ''} en favori
            </p>

            {favorites.map((event) => {
              const isUpcoming = new Date(event.date) > new Date();
              const isSoldOut = event.attendees >= event.maxAttendees;

              return (
                <Card
                  key={event.id}
                  className="overflow-hidden border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-4">
                      {/* Image */}
                      <div className="relative flex-shrink-0">
                        <ImageWithFallback
                          src={event.image}
                          alt={event.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        {event.isLive && (
                          <span className="absolute top-1 left-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            LIVE
                          </span>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                            <p className="text-sm text-indigo-600 mt-0.5">
                              {event.organizer?.name || 'Organisateur'}
                            </p>
                          </div>
                          <Badge variant="secondary" className="flex-shrink-0 text-xs">
                            {event.category}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(event.date)} à {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {event.maxAttendees - event.attendees} places restantes
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <span className="font-bold text-indigo-600">
                              {formatPrice(event.price, event.currency)}
                            </span>
                            {isSoldOut && (
                              <Badge className="ml-2 bg-red-100 text-red-700 text-xs">Complet</Badge>
                            )}
                            {!isUpcoming && (
                              <Badge className="ml-2 bg-gray-100 text-gray-600 text-xs">Terminé</Badge>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveFavorite(event)}
                              disabled={removingId === event.id}
                              className="text-red-500 border-red-200 hover:bg-red-50"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => navigate(`/events/${event.id}`)}
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              Voir
                            </Button>
                            {isUpcoming && !isSoldOut && (
                              <Button
                                size="sm"
                                onClick={() => navigate(`/events/${event.id}/buy`)}
                                variant="outline"
                                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                              >
                                Réserver
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
            )}

            {/* ── Loisirs ── */}
            {leisureFavorites.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-gray-700">Loisirs ({leisureFavorites.length})</h2>
                {leisureFavorites.map(item => (
                  <Card key={item.id} className="overflow-hidden border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
                    <CardContent className="p-0">
                      <div className="flex gap-4 p-4">
                        <div className="flex-shrink-0">
                          <ImageWithFallback src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                              <p className="text-sm text-indigo-600 mt-0.5">{item.category?.name}</p>
                            </div>
                            {item.isFeatured && <Badge className="flex-shrink-0 bg-amber-500 text-white text-xs">Recommandé</Badge>}
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {item.location}
                            </span>
                            {item.priceRange && <span className="font-semibold text-indigo-600">{item.priceRange}</span>}
                            {item.rating && <span>{item.rating.toFixed(1)} ★</span>}
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveLeisureFavorite(item)}
                              disabled={removingId === item.id}
                              className="text-red-500 border-red-200 hover:bg-red-50"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </Button>
                            <Button size="sm" onClick={() => navigate('/leisure')} className="bg-indigo-600 hover:bg-indigo-700">
                              Voir
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
