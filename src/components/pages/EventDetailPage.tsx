import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  Heart,
  Eye,
  Ticket,
  ArrowLeft,
  Info,
  Shield,
  Play
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';
import EventsBackendAPI from '../../services/api/EventsBackendAPI';

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
  attendees: number;
  maxAttendees: number;
  duration?: string;
  isLive: boolean;
  organizer: string;
  organizerName?: string;
}

interface EventDetailPageProps {
  event: Event;
  onBack: () => void;
  onPurchase: (eventId: string) => void;
  onStreamWatch: (eventId: string) => void;
  currentUser: any;
}

export function EventDetailPage({ event, onBack, onPurchase, onStreamWatch, currentUser }: EventDetailPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState(1);

  // Charger l'état favori depuis l'API au montage (si connecté)
  useEffect(() => {
    if (!currentUser?.id) return;
    EventsBackendAPI.checkFavorite(event.id)
      .then(setIsFavorited)
      .catch(() => {});
  }, [currentUser?.id, event.id]);

  const toggleFavorite = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setFavoriteLoading(true);
    try {
      const result = await EventsBackendAPI.toggleFavorite(event.id);
      setIsFavorited(result.isFavorited);
      toast.success(result.isFavorited ? 'Ajouté aux favoris' : 'Retiré des favoris');
    } catch {
      toast.error('Erreur lors de la mise à jour des favoris');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Gratuit';
    if (currency === 'FCFA') {
      return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const isUpcoming = new Date(event.date) > new Date();
  const isSoldOut = event.attendees >= event.maxAttendees;
  const availableTickets = event.maxAttendees - event.attendees;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Erreur lors du partage:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux événements</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative">
              <ImageWithFallback
                src={event.image}
                alt={event.title}
                className="w-full h-64 md:h-96 object-cover rounded-xl"
              />
              {event.isLive && (
                <Badge className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1">
                  <Eye className="w-4 h-4 mr-2" />
                  EN DIRECT
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="absolute top-4 right-4 bg-white/90 text-gray-700"
              >
                {event.category}
              </Badge>
            </div>

            {/* Event Info */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {event.title}
                  </h1>
                  <p className="text-gray-600 mb-4">
                    Organisé par <span className="font-medium text-indigo-600">{event.organizer}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    className={isFavorited ? 'text-red-600 border-red-200' : ''}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(event.date)}</p>
                    <p className="text-sm text-gray-600">à partir de {event.time}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium text-gray-900">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {event.attendees} participants
                    </p>
                    <p className="text-sm text-gray-600">
                      {availableTickets} places restantes
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium text-gray-900">Durée estimée</p>
                    <p className="text-sm text-gray-600">
                      {event.duration ? event.duration : 'Non précisée'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  À propos de cet événement
                </h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Informations pratiques
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Conditions d'accès</h4>
                    <p className="text-sm text-gray-600">
                      Présentation obligatoire du billet (numérique ou imprimé) et d'une pièce d'identité
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Politique d'annulation</h4>
                    <p className="text-sm text-gray-600">
                      Remboursement intégral jusqu'à 48h avant l'événement
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Ticket className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Type de billets</h4>
                    <p className="text-sm text-gray-600">
                      Billets électroniques avec QR code - Pas de billets physiques
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Ticket Purchase */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Réserver</span>
                    {event.isLive && (
                      <Badge variant="destructive" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        LIVE
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">
                      {formatPrice(event.price, event.currency)}
                    </p>
                    <p className="text-sm text-gray-600">par personne</p>
                  </div>

                  {isUpcoming && !isSoldOut && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de billets
                        </label>
                        <select
                          value={selectedTickets}
                          onChange={(e) => setSelectedTickets(Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {[...Array(Math.min(10, availableTickets))].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} billet{i > 0 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">
                            {selectedTickets} × {formatPrice(event.price, event.currency)}
                          </span>
                          <span className="font-medium">
                            {formatPrice(event.price * selectedTickets, event.currency)}
                          </span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center font-bold">
                          <span>Total</span>
                          <span className="text-indigo-600">
                            {formatPrice(event.price * selectedTickets, event.currency)}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => onPurchase(event.id)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        size="lg"
                        disabled={!currentUser}
                      >
                        {!currentUser ? 'Connectez-vous pour réserver' : 'Réserver maintenant'}
                      </Button>

                      <div className="text-xs text-gray-500 text-center space-y-1">
                        <p>Paiement sécurisé par Stripe</p>
                        <p>Billets envoyés reçus instantanément</p>
                      </div>

                      {event.isLive && (
                        <Button
                          onClick={() => onStreamWatch(event.id)}
                          variant="outline"
                          className="w-full border-red-200 text-red-600 hover:bg-red-50"
                          size="lg"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Voir le Live
                        </Button>
                      )}
                    </div>
                  )}

                  {isSoldOut && (
                    <div className="text-center py-4">
                      <p className="text-red-600 font-medium mb-2">Événement complet</p>
                      <p className="text-sm text-gray-600">
                        Cet événement affiche complet. Vous pouvez vous inscrire sur liste d'attente.
                      </p>
                      <Button variant="outline" className="w-full mt-4">
                        Liste d'attente
                      </Button>
                    </div>
                  )}

                  {!isUpcoming && (
                    <div className="text-center py-4">
                      <p className="text-gray-600 font-medium mb-2">Événement terminé</p>
                      <p className="text-sm text-gray-600">
                        Cet événement a déjà eu lieu.
                      </p>
                      {event.isLive && (
                        <Button
                          onClick={() => onStreamWatch(event.id)}
                          variant="outline"
                          className="w-full mt-4 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Voir le Live
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Organizer Info */}
              <Card className="mt-6 border-gray-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Organisateur</h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 font-semibold text-lg">
                        {event.organizer[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{event.organizer}</p>
                      <p className="text-sm text-gray-500">Organisateur vérifié</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
