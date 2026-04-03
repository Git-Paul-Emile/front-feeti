import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { TicketPDFGenerator } from '../TicketPDFGenerator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import {
  Calendar,
  MapPin,
  Eye,
  Clock,
  Ticket,
  User,
  Mail,
  Phone,
  CreditCard,
  Star,
  Heart,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import TicketAPI from '../../services/api/TicketAPI';
import EventsBackendAPI, { type BackendEvent } from '../../services/api/EventsBackendAPI';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { CategoryTab, getCategoryIcon } from '../CategorySelector';

const EVENT_CATEGORIES = [
  { slug: 'musique',     label: 'Musique' },
  { slug: 'concert',     label: 'Concert' },
  { slug: 'festival',    label: 'Festival' },
  { slug: 'jazz',        label: 'Jazz' },
  { slug: 'theatre',     label: 'Théâtre' },
  { slug: 'art-culture', label: 'Art & Culture' },
  { slug: 'danse',       label: 'Danse' },
  { slug: 'cinema',      label: 'Cinéma' },
  { slug: 'sport',       label: 'Sport' },
  { slug: 'competition', label: 'Compétition' },
  { slug: 'conference',  label: 'Conférence' },
  { slug: 'formation',   label: 'Formation' },
  { slug: 'tech',        label: 'Tech' },
  { slug: 'gastronomie', label: 'Gastronomie' },
  { slug: 'humour',      label: 'Humour' },
  { slug: 'soiree',      label: 'Soirée' },
  { slug: 'culte',       label: 'Culte' },
  { slug: 'autre',       label: 'Autre' },
];

interface Ticket {
  id: string;
  orderId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventImage: string;
  category: string;
  price: number;
  currency: string;
  holderName: string;
  holderEmail: string;
  qrCode: string;
  status: 'valid' | 'used' | 'expired';
  purchaseDate: string;
  timestamp: number;
  signature: string;
}

interface UserDashboardProps {
}

export function UserDashboard({}: UserDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = (location.state as any)?.initialTab as string | undefined;
  const { user: currentUser, updateProfile } = useAuth();
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<BackendEvent[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // ── Centres d'intérêts ────────────────────────────────────────────────────
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [interestsSaving, setInterestsSaving] = useState(false);

  // Initialiser depuis le profil courant quand il est chargé
  useEffect(() => {
    if (currentUser?.interests) {
      setSelectedInterests(currentUser.interests);
    }
  }, [currentUser?.id]);

  const toggleInterest = (slug: string) => {
    setSelectedInterests(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const handleSaveInterests = async () => {
    setInterestsSaving(true);
    try {
      await updateProfile({ interests: selectedInterests });
      toast.success('Centres d\'intérêts mis à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setInterestsSaving(false);
    }
  };

  const onEventSelect = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };


  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true);
      try {
        const tickets = await TicketAPI.getMyTickets();
        // Adapt BackendTicket to Ticket interface
        const adaptedTickets: Ticket[] = tickets.map(t => ({
          id: t.id,
          orderId: t.orderId,
          eventId: t.eventId,
          eventTitle: t.event?.title || 'Événement inconnu',
          eventDate: t.event?.date || '',
          eventTime: t.event?.time || '',
          eventLocation: t.event?.location || '',
          eventImage: t.event?.image || '',
          category: t.category || 'Standard',
          price: t.price,
          currency: t.currency,
          holderName: t.holderName,
          holderEmail: t.holderEmail,
          qrCode: t.qrData,
          status: t.status,
          purchaseDate: t.createdAt,
          timestamp: new Date(t.createdAt).getTime(),
          signature: '',
        }));
        setUserTickets(adaptedTickets);
      } catch (error) {
        toast.error('Impossible de charger vos billets');
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setFavoritesLoading(true);
    EventsBackendAPI.getMyFavorites()
      .then(setFavorites)
      .catch(() => {})
      .finally(() => setFavoritesLoading(false));
  }, [currentUser?.id]);

  const [removingFavId, setRemovingFavId] = useState<string | null>(null);

  const handleRemoveFavorite = async (eventId: string) => {
    setRemovingFavId(eventId);
    try {
      await EventsBackendAPI.toggleFavorite(eventId);
      setFavorites(prev => prev.filter(e => e.id !== eventId));
      toast.success('Retiré des favoris');
    } catch {
      toast.error('Erreur lors de la suppression du favori');
    } finally {
      setRemovingFavId(null);
    }
  };

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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
    if (currency === 'FCFA') {
      return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTicketStatusLabel = (status: string) => {
    switch (status) {
      case 'valid': return 'Valide';
      case 'used': return 'Utilisé';
      case 'expired': return 'Expiré';
      default: return 'Inconnu';
    }
  };

  const upcomingTickets = userTickets.filter(ticket => 
    new Date(ticket.eventDate) > new Date() && ticket.status === 'valid'
  );

  const pastTickets = userTickets.filter(ticket => 
    new Date(ticket.eventDate) <= new Date() || ticket.status !== 'valid'
  );

  const totalSpent = userTickets.reduce((sum, ticket) => sum + ticket.price, 0);
  const eventsAttended = pastTickets.filter(ticket => ticket.status === 'used').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Utilisateur non connecté</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback className="text-xl">
                {currentUser.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bonjour, {currentUser.name}
              </h1>
              <p className="text-gray-600">Gérez vos billets et votre profil</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{userTickets.length}</p>
                    <p className="text-sm text-gray-600">Billets achetés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{upcomingTickets.length}</p>
                    <p className="text-sm text-gray-600">Événements à venir</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{eventsAttended}</p>
                    <p className="text-sm text-gray-600">Événements assistés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(totalSpent, 'FCFA')}
                    </p>
                    <p className="text-sm text-gray-600">Total dépensé</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue={initialTab || 'tickets'} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="tickets">Mes billets</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
            <TabsTrigger value="interests">Intérêts</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-6">
            {/* Upcoming Events */}
            {upcomingTickets.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Événements à venir ({upcomingTickets.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingTickets.map((ticket) => (
                    <Card key={ticket.id} className="cursor-pointer transition-all duration-200 border-gray-200">
                      <div className="relative">
                        <ImageWithFallback
                          src={ticket.eventImage}
                          alt={ticket.eventTitle}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                        <Badge className={`absolute top-2 right-2 ${getTicketStatusColor(ticket.status)}`}>
                          {getTicketStatusLabel(ticket.status)}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 truncate">
                          {ticket.eventTitle}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(ticket.eventDate)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{ticket.eventTime}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="truncate">{ticket.eventLocation}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-600">
                            {formatPrice(ticket.price, ticket.currency)}
                          </span>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedTicket(ticket)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Billet électronique</DialogTitle>
                                </DialogHeader>
                                {selectedTicket && (
                                  <div className="space-y-4">
                                    <div className="text-center">
                                      <h3 className="font-semibold text-lg mb-2">
                                        {selectedTicket.eventTitle}
                                      </h3>
                                      </div>
                                    <TicketPDFGenerator ticket={selectedTicket} />
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEventSelect(ticket.eventId)}
                            >
                              Détails
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastTickets.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Événements passés ({pastTickets.length})
                </h2>
                <div className="space-y-3">
                  {pastTickets.map((ticket) => (
                    <Card key={ticket.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <ImageWithFallback
                            src={ticket.eventImage}
                            alt={ticket.eventTitle}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {ticket.eventTitle}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{formatDate(ticket.eventDate)}</span>
                              <MapPin className="w-4 h-4 mr-1 ml-3" />
                              <span className="truncate">{ticket.eventLocation}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={getTicketStatusColor(ticket.status)}>
                              {getTicketStatusLabel(ticket.status)}
                            </Badge>
                            <span className="font-medium text-gray-900">
                              {formatPrice(ticket.price, ticket.currency)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEventSelect(ticket.eventId)}
                            >
                              Voir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {userTickets.length === 0 && (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun billet pour le moment
                </h3>
                <p className="text-gray-600 mb-6">
                  Découvrez nos événements et réservez vos premiers billets
                </p>
                <Button onClick={() => window.location.reload()}>
                  Explorer les événements
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{currentUser.name}</p>
                      <p className="text-sm text-gray-600">Nom complet</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{currentUser.email}</p>
                      <p className="text-sm text-gray-600">Email</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{currentUser.phone || 'Non renseigné'}</p>
                      <p className="text-sm text-gray-600">Téléphone</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Membre depuis janvier 2024</p>
                      <p className="text-sm text-gray-600">Date d'inscription</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button>Modifier le profil</Button>
                  <Button variant="outline">Changer le mot de passe</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Nouveaux événements</p>
                      <p className="text-sm text-gray-600">Recevoir des notifications pour les nouveaux événements</p>
                    </div>
                    <Button variant="outline" size="sm">Activé</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Rappels d'événements</p>
                      <p className="text-sm text-gray-600">Rappels 24h avant vos événements</p>
                    </div>
                    <Button variant="outline" size="sm">Activé</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Newsletter</p>
                      <p className="text-sm text-gray-600">Actualités et offres spéciales</p>
                    </div>
                    <Button variant="outline" size="sm">Désactivé</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            {favoritesLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-indigo-600" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun favori pour le moment
                </h3>
                <p className="text-gray-600 mb-6">
                  Ajoutez des événements à vos favoris pour les retrouver facilement
                </p>
                <Button variant="outline" onClick={() => navigate('/events')}>
                  <Heart className="w-4 h-4 mr-2" />
                  Découvrir des événements
                </Button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Mes favoris ({favorites.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((event) => (
                    <Card key={event.id} className="cursor-pointer transition-all duration-200 border-gray-200 hover:shadow-md">
                      <div className="relative">
                        <ImageWithFallback
                          src={event.image}
                          alt={event.title}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 truncate">{event.title}</h3>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-600">
                            {event.price === 0 ? 'Gratuit' : formatPrice(event.price, event.currency || 'FCFA')}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/events/${event.id}`)}
                            >
                              Voir
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={removingFavId === event.id}
                              onClick={() => handleRemoveFavorite(event.id)}
                              className="border-red-300 text-red-500 hover:bg-red-50 hover:border-red-500"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="interests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mes centres d'intérêts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-5">
                  Sélectionne les catégories d'événements qui t'intéressent. Ils seront mis en avant sur ta page d'accueil.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {EVENT_CATEGORIES.map((cat) => (
                    <CategoryTab
                      key={cat.slug}
                      icon={getCategoryIcon(cat.slug)}
                      label={cat.label}
                      isSelected={selectedInterests.includes(cat.slug)}
                      onClick={() => toggleInterest(cat.slug)}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    {selectedInterests.length === 0
                      ? 'Aucun centre d\'intérêt sélectionné'
                      : `${selectedInterests.length} sélectionné${selectedInterests.length > 1 ? 's' : ''}`}
                  </p>
                  <Button
                    onClick={handleSaveInterests}
                    disabled={interestsSaving}
                    className="min-w-[120px]"
                  >
                    {interestsSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Enregistrer'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}