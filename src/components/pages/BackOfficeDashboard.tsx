import { useState, useEffect, useMemo } from 'react';
import CategoriesAPI from '../../services/api/CategoriesAPI';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import {
  Users,
  Calendar,
  Ticket,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  RefreshCw,
  Database,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Star,
  Heart
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EventsBackendAPI, { type BackendEvent } from '../../services/api/EventsBackendAPI';
import CountryAPI, { type Country } from '../../services/api/CountryAPI';

interface BackOfficeDashboardProps {
  currentUser: any;
  onBack: () => void;
}

export function BackOfficeDashboard({ currentUser, onBack }: BackOfficeDashboardProps) {
  // États
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<BackendEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    liveEvents: 0,
    totalRevenue: 0,
    totalAttendees: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  // États pour le formulaire d'événement
  const [eventForm, setEventForm] = useState<Partial<BackendEvent>>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    image: '',
    price: 0,
    currency: 'FCFA',
    category: 'Musique',
    maxAttendees: 100,
    isLive: false,
    status: 'draft',
    countryCode: '',
  });
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Charger les données au montage
  useEffect(() => {
    loadDashboardData();
    CountryAPI.getAll().then(data => setCountries(data.filter(c => c.isActive))).catch(() => {});
    CategoriesAPI.getAll()
      .then(cats => setCategories(cats.map(c => c.name)))
      .catch(() => setCategories([]));
  }, []);

  // Toggle featured / favorite
  const handleToggleHighlight = async (eventId: string, field: 'isFeatured' | 'isFavorite', current: boolean) => {
    try {
      const updated = await EventsBackendAPI.toggleHighlight(eventId, { [field]: !current });
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...updated } : e));
      toast.success(field === 'isFeatured'
        ? (!current ? 'Événement mis en avant !' : 'Événement retiré de la une')
        : (!current ? 'Événement ajouté aux favoris !' : 'Événement retiré des favoris'));
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Charger toutes les données
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await EventsBackendAPI.getAllEventsAdmin();
      setEvents(data);
      setStats({
        totalEvents: data.length,
        liveEvents: data.filter(e => e.isLive).length,
        totalRevenue: data.reduce((sum, e) => sum + e.price * e.attendees, 0),
        totalAttendees: data.reduce((sum, e) => sum + e.attendees, 0),
      });
      toast.success('Données chargées avec succès');
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Créer ou mettre à jour un événement
  const handleSaveEvent = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.time) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile instanceof File) {
        imageUrl = await EventsBackendAPI.uploadImage(imageFile);
      }

      if (selectedEvent?.id) {
        const updated = await EventsBackendAPI.updateEvent(selectedEvent.id, {
          ...eventForm,
          ...(imageUrl ? { image: imageUrl } : {}),
        });
        setEvents(prev => prev.map(e => e.id === selectedEvent.id ? updated : e));
        toast.success('Événement mis à jour avec succès');
      } else {
        const created = await EventsBackendAPI.createEvent({
          title: eventForm.title!,
          description: eventForm.description || '',
          date: eventForm.date!,
          time: eventForm.time!,
          location: eventForm.location || '',
          image: imageUrl,
          price: eventForm.price,
          currency: 'FCFA',
          category: eventForm.category || 'Musique',
          maxAttendees: eventForm.maxAttendees || 100,
          isLive: eventForm.isLive,
          status: eventForm.status,
          countryCode: eventForm.countryCode || undefined,
        });
        setEvents(prev => [created, ...prev]);
        toast.success('Événement créé avec succès');
      }

      setIsEventDialogOpen(false);
      setSelectedEvent(null);
      setImageFile(null);
      setImagePreview('');
      resetEventForm();
    } catch (error: any) {
      console.error('Erreur sauvegarde événement:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un événement
  const handleDeleteEvent = async (eventId: string) => {
    setLoading(true);
    try {
      await EventsBackendAPI.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success('Événement supprimé avec succès');
    } catch (error: any) {
      console.error('Erreur suppression événement:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      image: '',
      price: 0,
      currency: 'FCFA',
      category: 'Musique',
      maxAttendees: 100,
      isLive: false,
      status: 'draft',
    });
  };

  // Ouvrir le dialogue d'édition
  const handleEditEvent = (event: BackendEvent) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      price: event.price,
      currency: event.currency,
      category: event.category,
      maxAttendees: event.maxAttendees,
      isLive: event.isLive,
      status: event.status,
      image: event.image,
    });
    setImageFile(null);
    setImagePreview(event.image || '');
    setIsEventDialogOpen(true);
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  // Données pour les graphiques
  const categoryChartData = useMemo(() => {
    const categoryCounts = events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));
  }, [events]);

  // Rendu de la vue d'ensemble
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Événements Totaux</CardTitle>
            <Calendar className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs opacity-80 mt-1">{stats.liveEvents} événements live</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttendees}</div>
            <p className="text-xs opacity-80 mt-1">Total participants</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Événements Live</CardTitle>
            <Ticket className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.liveEvents}</div>
            <p className="text-xs opacity-80 mt-1">En streaming</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <DollarSign className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</div>
            <p className="text-xs opacity-80 mt-1">Revenus totaux</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenus estimés par catégorie</CardTitle>
            <CardDescription>Prix × Participants par catégorie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={events.reduce((acc, e) => {
                    const existing = acc.find(d => d.category === e.category);
                    const revenue = e.price * e.attendees;
                    if (existing) existing.revenue += revenue;
                    else acc.push({ category: e.category, revenue });
                    return acc;
                  }, [] as { category: string; revenue: number }[])}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => [`${v.toLocaleString()} FCFA`, 'Revenus']} />
                    <Bar dataKey="revenue" fill="#4338ca" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Événements par Catégorie</CardTitle>
            <CardDescription>Distribution des événements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#059669" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Événements récents */}
      <Card>
        <CardHeader>
          <CardTitle>Événements Récents</CardTitle>
          <CardDescription>Les derniers événements créés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    {event.image ? (
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.date} à {event.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                    {event.status}
                  </Badge>
                  {event.isLive && (
                    <Badge className="bg-red-500 text-white">LIVE</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Rendu de la gestion des événements
  const renderEventsManagement = () => (
    <div className="space-y-6">
      {/* En-tête avec recherche et actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </Button>
        </div>
        <Button onClick={() => {
          resetEventForm();
          setSelectedEvent(null);
          setImageFile(null);
          setImagePreview('');
          setIsEventDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel Événement
        </Button>
      </div>

      {/* Table des événements */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Événement</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {event.image ? (
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-gray-500">{event.category}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{event.date}</div>
                      <div className="text-gray-500">{event.time}</div>
                    </div>
                  </TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>{event.price.toLocaleString()} {event.currency}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{event.attendees} / {event.maxAttendees}</div>
                      <Progress value={(event.attendees / event.maxAttendees) * 100} className="h-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                      {event.isLive && (
                        <Badge className="bg-red-500 text-white">LIVE</Badge>
                      )}
                      {event.isFeatured && (
                        <Badge className="bg-amber-400 text-white">À la une</Badge>
                      )}
                      {event.isFavorite && (
                        <Badge className="bg-pink-500 text-white">Favori</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost" size="sm"
                        title={event.isFeatured ? 'Retirer de la une' : 'Mettre à la une'}
                        onClick={() => handleToggleHighlight(event.id, 'isFeatured', event.isFeatured ?? false)}
                      >
                        <Star className={`w-4 h-4 ${event.isFeatured ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        title={event.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        onClick={() => handleToggleHighlight(event.id, 'isFavorite', event.isFavorite ?? false)}
                      >
                        <Heart className={`w-4 h-4 ${event.isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditEvent(event)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l'événement</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => event.id && handleDeleteEvent(event.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // Rendu de la gestion des transactions
  const renderTransactions = () => (
    <Card>
      <CardHeader>
        <CardTitle>Revenus par événement</CardTitle>
        <CardDescription>Revenus estimés (prix × participants)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Événement</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Revenus estimés</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.filter(e => e.price > 0).slice(0, 15).map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{event.category}</TableCell>
                <TableCell>{event.price.toLocaleString()} {event.currency}</TableCell>
                <TableCell>{event.attendees}</TableCell>
                <TableCell className="font-bold text-green-700">
                  {(event.price * event.attendees).toLocaleString()} {event.currency}
                </TableCell>
                <TableCell>
                  <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                    {event.status === 'published' ? 'Publié' : 'Brouillon'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {events.filter(e => e.price > 0).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">Aucun événement payant</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  // Rendu des paramètres
  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration Backend</CardTitle>
          <CardDescription>État de la connexion au serveur</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="font-medium">API Backend Express</p>
                <p className="text-sm text-gray-500">PostgreSQL via Prisma ORM</p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connecté
            </Badge>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-blue-900">Base de données active</p>
                <p className="text-sm text-blue-800">
                  Toutes les données événements sont stockées dans PostgreSQL et synchronisées en temps réel via l'API REST.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions Administrateur</CardTitle>
          <CardDescription>Opérations de maintenance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser les données
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Exporter les données
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Réinitialiser le cache
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Back Office Feeti</h1>
                <p className="text-sm text-gray-500">Tableau de bord administrateur</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={loading}>
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              <Avatar>
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>{currentUser?.name?.charAt(0) || 'A'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="w-4 h-4 mr-2" />
              Événements
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <CreditCard className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">{renderOverview()}</TabsContent>
          <TabsContent value="events">{renderEventsManagement()}</TabsContent>
          <TabsContent value="transactions">{renderTransactions()}</TabsContent>
          <TabsContent value="settings">{renderSettings()}</TabsContent>
        </Tabs>
      </div>

      {/* Dialog de création/édition d'événement */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de l'événement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Nom de l'événement"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={eventForm.category}
                  onValueChange={(value) => setEventForm({ ...eventForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0
                      ? <SelectItem value="_" disabled>Catégories indisponibles</SelectItem>
                      : categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Description de l'événement"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Heure *</Label>
                <Input
                  id="time"
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lieu</Label>
              <Input
                id="location"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                placeholder="Lieu de l'événement"
              />
            </div>

            <div className="space-y-2">
              <Label>Image de l'événement</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400"
                onClick={() => document.getElementById('backoffice-img-upload')?.click()}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="aperçu" className="w-full h-36 object-cover rounded" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(''); setEventForm({ ...eventForm, image: '' }); }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-gray-600 hover:text-red-600 text-xs"
                    >✕</button>
                  </div>
                ) : (
                  <div className="py-4 space-y-1">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-500">Cliquez pour choisir une image</p>
                    <p className="text-xs text-gray-400">JPG, PNG, WEBP — max 5 Mo</p>
                  </div>
                )}
              </div>
              <input
                id="backoffice-img-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix</Label>
                <Input
                  id="price"
                  type="number"
                  value={eventForm.price}
                  onChange={(e) => setEventForm({ ...eventForm, price: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttendees">Places max</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  value={eventForm.maxAttendees}
                  onChange={(e) => setEventForm({ ...eventForm, maxAttendees: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={eventForm.status}
                  onValueChange={(value: any) => setEventForm({ ...eventForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryCode">Pays *</Label>
              <Select
                value={eventForm.countryCode ?? ''}
                onValueChange={(value) => setEventForm({ ...eventForm, countryCode: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un pays" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isLive"
                checked={eventForm.isLive}
                onCheckedChange={(checked) => setEventForm({ ...eventForm, isLive: checked })}
              />
              <Label htmlFor="isLive">Événement en direct (Live)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEvent} disabled={loading}>
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
