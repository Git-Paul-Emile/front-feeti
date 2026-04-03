import { useState, useEffect, useCallback } from 'react';
import EventsBackendAPI from '../../services/api/EventsBackendAPI';
import { EVENT_CATEGORIES } from '../../data/categories';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { ConfirmDialog } from '../ui/confirm-dialog';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  TrendingUp,
  QrCode,
  MapPin,
  Clock,
  Lock,
  Unlock,
  Star,
  Clock3,
  CheckCircle2,
  XCircle,
  X,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import FeaturedRequestAPI, { type FeaturedRequest } from '../../services/api/FeaturedRequestAPI';

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
  isLive: boolean;
  isFeatured?: boolean;
  organizer?: string;
  status?: string;
  salesBlocked?: boolean;
  ticketTypes?: string;
}

interface OrganizerDashboardProps {
  currentUser: any;
  organizerEvents: Event[];
  onEventCreate: (eventData: any) => void;
  onEventEdit: (eventId: string, eventData: any) => void;
  onEventDelete: (eventId: string) => void;
  onEventSelect: (eventId: string) => void;
  onManageControllers?: (eventId: string) => void;
  onEventToggleSales?: (eventId: string, salesBlocked: boolean) => void;
  onNavigate?: (page: string) => void;
}

export function OrganizerDashboard({
  currentUser,
  organizerEvents,
  onEventCreate,
  onEventEdit,
  onEventDelete,
  onEventSelect,
  onManageControllers,
  onEventToggleSales,
  onNavigate
}: OrganizerDashboardProps) {
  type TicketTypeEntry = { type: string; price: number };
  const DEFAULT_TICKET_TYPES: TicketTypeEntry[] = [{ type: 'Standard', price: 0 }];

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    maxAttendees: 100,
    duration: '',
    isLive: false,
  });
  const [createTicketTypes, setCreateTicketTypes] = useState<TicketTypeEntry[]>(DEFAULT_TICKET_TYPES);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // View detail modal state
  const [viewOrgEvent, setViewOrgEvent] = useState<Event | null>(null);

  // Delete confirmation state
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<Event | null>(null);

  // Featured request state
  const [featuredRequests, setFeaturedRequests] = useState<FeaturedRequest[]>([]);
  const [featuredRequestModal, setFeaturedRequestModal] = useState<Event | null>(null);
  const [featuredMessage, setFeaturedMessage] = useState('');
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [previousRequests, setPreviousRequests] = useState<FeaturedRequest[]>([]);
  const [visibleNotifications, setVisibleNotifications] = useState<Set<string>>(new Set());

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    maxAttendees: 100,
    duration: '',
    isLive: false,
  });
  const [editTicketTypes, setEditTicketTypes] = useState<TicketTypeEntry[]>(DEFAULT_TICKET_TYPES);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('feeti_categories');
      setCategories(stored ? JSON.parse(stored) : [...EVENT_CATEGORIES]);
    } catch {
      setCategories([...EVENT_CATEGORIES]);
    }
    FeaturedRequestAPI.getMyRequests()
      .then(requests => {
        // Vérifier les changements de statut pour afficher des notifications
        if (previousRequests.length > 0) {
          requests.forEach(newReq => {
            const oldReq = previousRequests.find(r => r.id === newReq.id);
            if (oldReq && oldReq.status !== newReq.status && oldReq.status === 'pending') {
              const notificationKey = `featured-notification-${newReq.id}-${newReq.status}`;
              const alreadyShown = localStorage.getItem(notificationKey);
              if (!alreadyShown) {
                if (newReq.status === 'approved') {
                  toast.success(`🎉 "${newReq.event.title}" a été approuvé pour la mise en avant !`, {
                    duration: 2000,
                    id: `featured-${newReq.id}-approved`
                  });
                  setVisibleNotifications(prev => new Set(prev).add(newReq.id));
                } else if (newReq.status === 'rejected') {
                  toast.error(`❌ "${newReq.event.title}" a été rejeté pour la mise en avant.`, {
                    duration: 2000,
                    id: `featured-${newReq.id}-rejected`
                  });
                  setVisibleNotifications(prev => new Set(prev).add(newReq.id));
                }
                localStorage.setItem(notificationKey, 'shown');
              }
            }
          });
        }
        setPreviousRequests(requests);
        setFeaturedRequests(requests);
      })
      .catch(() => {});
  }, []);

  // Auto-hide notifications after 10 seconds
  useEffect(() => {
    if (visibleNotifications.size > 0) {
      const timer = setTimeout(() => {
        setVisibleNotifications(new Set());
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [visibleNotifications]);

  const getFeaturedRequestStatus = (eventId: string) => {
    return featuredRequests.find(r => r.event.id === eventId);
  };

  const handleSubmitFeaturedRequest = useCallback(async () => {
    if (!featuredRequestModal) return;
    setFeaturedLoading(true);
    try {
      const req = await FeaturedRequestAPI.submitRequest(featuredRequestModal.id, featuredMessage || undefined);
      setFeaturedRequests(prev => [...prev.filter(r => r.event.id !== featuredRequestModal.id), req]);
      toast.success('Demande de mise en avant envoyée à l\'admin');
      setFeaturedRequestModal(null);
      setFeaturedMessage('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de l\'envoi de la demande');
    } finally {
      setFeaturedLoading(false);
    }
  }, [featuredRequestModal, featuredMessage]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
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

  const handleToggleSales = useCallback(async (event: Event) => {
    try {
      const result = await EventsBackendAPI.toggleSalesBlocked(event.id);
      onEventToggleSales?.(event.id, result.salesBlocked);
      toast.success(result.salesBlocked ? 'Ventes suspendues' : 'Ventes réactivées');
    } catch {
      toast.error('Erreur lors du changement de statut des ventes');
    }
  }, [onEventToggleSales]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    onEventCreate({
      ...newEvent,
      ticketTypes: createTicketTypes,
      price: createTicketTypes[0]?.price ?? 0,
      imageFile,
      organizer: currentUser.name,
      attendees: 0,
    });
    setIsCreateModalOpen(false);
    setNewEvent({ title: '', description: '', date: '', time: '', location: '', category: '', maxAttendees: 100, duration: '', isLive: false });
    setCreateTicketTypes(DEFAULT_TICKET_TYPES);
    setImageFile(null);
    setImagePreview('');
  };

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      maxAttendees: event.maxAttendees,
      duration: (event as any).duration || '',
      isLive: event.isLive,
    });
    const existing = (event as any).ticketTypes;
    if (Array.isArray(existing) && existing.length > 0) {
      setEditTicketTypes(existing);
    } else {
      const vip = (event as any).vipPrice;
      setEditTicketTypes([
        { type: 'Standard', price: event.price ?? 0 },
        ...(vip ? [{ type: 'VIP', price: vip }] : []),
      ]);
    }
    setEditImagePreview(event.image || '');
    setEditImageFile(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    onEventEdit(editingEvent.id, {
      ...editForm,
      ticketTypes: editTicketTypes,
      price: editTicketTypes[0]?.price ?? 0,
      imageFile: editImageFile,
    });
    setIsEditModalOpen(false);
    setEditingEvent(null);
    setEditImageFile(null);
    setEditImagePreview('');
  };

  const totalRevenue = organizerEvents.reduce((sum, event) => 
    sum + (event.price * event.attendees), 0
  );
  const totalAttendees = organizerEvents.reduce((sum, event) => sum + event.attendees, 0);
  const upcomingEvents = organizerEvents.filter(event => new Date(event.date) > new Date());
  const pastEvents = organizerEvents.filter(event => new Date(event.date) <= new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Organisateur</h1>
            <p className="text-gray-600">Gérez vos événements et analysez vos performances</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => onNavigate?.('qr-scanner')}
              className="flex items-center space-x-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Scanner billets</span>
            </Button>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                Créer un événement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouvel événement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="title">Titre de l'événement</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      placeholder="Nom de votre événement"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      placeholder="Décrivez votre événement..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Heure</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="location">Lieu</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      placeholder="Adresse ou nom du lieu"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée estimée</Label>
                    <Input
                      id="duration"
                      value={newEvent.duration}
                      onChange={(e) => setNewEvent({...newEvent, duration: e.target.value})}
                      placeholder="Ex: 2h30, 3 heures..."
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="image">Affiche de l'événement</Label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Aperçu"
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(''); }}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-gray-600 hover:text-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 py-4">
                          <svg className="w-10 h-10 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-500">Cliquez pour choisir une image</p>
                          <p className="text-xs text-gray-400">JPG, PNG, WEBP — max 5 Mo</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select
                      value={newEvent.category}
                      onValueChange={(value: string) => setNewEvent({...newEvent, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxAttendees">Nombre maximum de participants</Label>
                    <Input
                      id="maxAttendees"
                      type="number"
                      value={newEvent.maxAttendees}
                      onChange={(e) => setNewEvent({...newEvent, maxAttendees: parseInt(e.target.value) || 100})}
                    />
                  </div>

                  {/* Types de billets dynamiques */}
                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-base font-semibold">Types de billets</Label>
                    <div className="space-y-2">
                      {createTicketTypes.map((ticket, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <Input
                            placeholder="Type (ex: Standard, VIP...)"
                            value={ticket.type}
                            onChange={(e) => {
                              const updated = [...createTicketTypes];
                              updated[index] = { ...updated[index], type: e.target.value };
                              setCreateTicketTypes(updated);
                            }}
                            className="flex-1"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="number"
                              placeholder="Prix"
                              value={ticket.price}
                              onChange={(e) => {
                                const updated = [...createTicketTypes];
                                updated[index] = { ...updated[index], price: parseFloat(e.target.value) || 0 };
                                setCreateTicketTypes(updated);
                              }}
                              className="flex-1"
                            />
                            <span className="text-sm text-gray-500 whitespace-nowrap">FCFA</span>
                          </div>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => setCreateTicketTypes(createTicketTypes.filter((_, i) => i !== index))}
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCreateTicketTypes([...createTicketTypes, { type: 'VIP', price: 0 }])}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un type de billet
                    </Button>
                  </div>

                  {/* Type d'événement : En salle ou Streaming Live */}
                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-base font-semibold">Type d'événement *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Option En Salle */}
                      <button
                        type="button"
                        onClick={() => setNewEvent({...newEvent, isLive: false})}
                        className={`
                          relative p-5 rounded-xl border-2 transition-all duration-300
                          ${!newEvent.isLive
                            ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100'
                            : 'border-gray-200 hover:border-indigo-300 bg-white'
                          }
                        `}
                      >
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className={`
                            w-14 h-14 rounded-full flex items-center justify-center
                            ${!newEvent.isLive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                            }
                          `}>
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h4 className={`font-bold ${!newEvent.isLive ? 'text-indigo-600' : 'text-gray-900'}`}>
                              En Salle
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Événement en présentiel avec lieu physique
                            </p>
                          </div>
                        </div>
                        {!newEvent.isLive && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>

                      {/* Option Streaming Live */}
                      <button
                        type="button"
                        onClick={() => setNewEvent({...newEvent, isLive: true})}
                        className={`
                          relative p-5 rounded-xl border-2 transition-all duration-300
                          ${newEvent.isLive
                            ? 'border-red-600 bg-red-50 shadow-lg shadow-red-100'
                            : 'border-gray-200 hover:border-red-300 bg-white'
                          }
                        `}
                      >
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className={`
                            w-14 h-14 rounded-full flex items-center justify-center relative
                            ${newEvent.isLive
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                            }
                          `}>
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {newEvent.isLive && (
                              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className={`font-bold ${newEvent.isLive ? 'text-red-600' : 'text-gray-900'}`}>
                              Streaming Live
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Événement diffusé en direct en ligne
                            </p>
                          </div>
                        </div>
                        {newEvent.isLive && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    </div>

                    {/* Info contextuelle selon le type */}
                    <div className={`p-4 rounded-lg border-2 ${
                      newEvent.isLive 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-indigo-50 border-indigo-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          newEvent.isLive ? 'text-red-600' : 'text-indigo-600'
                        }`}>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-sm">
                          {newEvent.isLive ? (
                            <>
                              <strong className="text-red-800">Streaming Live :</strong>
                              <p className="text-red-700 mt-1">
                                Les participants recevront un code d'accès unique pour rejoindre l'événement en ligne. 
                                Vous pourrez gérer le stream depuis votre dashboard.
                              </p>
                            </>
                          ) : (
                            <>
                              <strong className="text-indigo-800">En Salle :</strong>
                              <p className="text-indigo-700 mt-1">
                                Les participants pourront choisir entre billet digital (email) ou billet physique (livraison). 
                                Vous pourrez scanner les QR codes à l'entrée.
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                    Créer l'événement
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Edit Event Dialog */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier l'événement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="edit-title">Titre</Label>
                  <Input
                    id="edit-title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-time">Heure</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="edit-location">Lieu</Label>
                  <Input
                    id="edit-location"
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Durée estimée</Label>
                  <Input
                    id="edit-duration"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                    placeholder="Ex: 2h30, 3 heures..."
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Affiche de l'événement</Label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                    onClick={() => document.getElementById('edit-image-upload')?.click()}
                  >
                    {editImagePreview ? (
                      <div className="relative">
                        <img src={editImagePreview} alt="Aperçu" className="w-full h-40 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setEditImageFile(null); setEditImagePreview(''); }}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-gray-600 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4">
                        <svg className="w-10 h-10 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">Cliquez pour changer l'image</p>
                        <p className="text-xs text-gray-400">JPG, PNG, WEBP — max 5 Mo</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="edit-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditImageFile(file);
                        setEditImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <Select value={editForm.category} onValueChange={(value: string) => setEditForm({...editForm, category: value})}>
                    <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-maxAttendees">Participants max</Label>
                  <Input
                    id="edit-maxAttendees"
                    type="number"
                    value={editForm.maxAttendees}
                    onChange={(e) => setEditForm({...editForm, maxAttendees: parseInt(e.target.value) || 100})}
                  />
                </div>

                {/* Types de billets dynamiques */}
                <div className="md:col-span-2 space-y-3">
                  <Label className="text-base font-semibold">Types de billets</Label>
                  <div className="space-y-2">
                    {editTicketTypes.map((ticket, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <Input
                          placeholder="Type (ex: Standard, VIP...)"
                          value={ticket.type}
                          onChange={(e) => {
                            const updated = [...editTicketTypes];
                            updated[index] = { ...updated[index], type: e.target.value };
                            setEditTicketTypes(updated);
                          }}
                          className="flex-1"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="number"
                            placeholder="Prix"
                            value={ticket.price}
                            onChange={(e) => {
                              const updated = [...editTicketTypes];
                              updated[index] = { ...updated[index], price: parseFloat(e.target.value) || 0 };
                              setEditTicketTypes(updated);
                            }}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-500 whitespace-nowrap">FCFA</span>
                        </div>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => setEditTicketTypes(editTicketTypes.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditTicketTypes([...editTicketTypes, { type: 'VIP', price: 0 }])}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un type de billet
                  </Button>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <Label className="text-base font-semibold">Type d'événement</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setEditForm({...editForm, isLive: false})}
                      className={`p-4 rounded-xl border-2 transition-all ${!editForm.isLive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!editForm.isLive ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className={`font-semibold ${!editForm.isLive ? 'text-indigo-600' : 'text-gray-700'}`}>En Salle</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({...editForm, isLive: true})}
                      className={`p-4 rounded-xl border-2 transition-all ${editForm.isLive ? 'border-red-600 bg-red-50' : 'border-gray-200 bg-white'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${editForm.isLive ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className={`font-semibold ${editForm.isLive ? 'text-red-600' : 'text-gray-700'}`}>Streaming Live</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Notifications demandes de mise en avant */}
        {featuredRequests.filter(r => (r.status === 'approved' || r.status === 'rejected') && visibleNotifications.has(r.id)).length > 0 && (
          <div className="mb-6 space-y-2">
            {featuredRequests
              .filter(r => (r.status === 'approved' || r.status === 'rejected') && visibleNotifications.has(r.id))
              .map(r => (
                <div
                  key={r.id}
                  className={`flex items-start gap-3 rounded-lg px-4 py-3 border ${
                    r.status === 'approved'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  {r.status === 'approved'
                    ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  }
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${r.status === 'approved' ? 'text-green-800' : 'text-red-800'}`}>
                      {r.status === 'approved'
                        ? `"${r.event.title}" a été approuvé pour la mise en avant !`
                        : `"${r.event.title}" — demande de mise en avant refusée.`
                      }
                    </p>
                    {r.adminNote && (
                      <p className={`text-sm mt-0.5 ${r.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                        Message de l'admin : {r.adminNote}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setVisibleNotifications(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(r.id);
                      return newSet;
                    })}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            }
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{organizerEvents.length}</p>
                  <p className="text-sm text-gray-600">Événements créés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalAttendees}</p>
                  <p className="text-sm text-gray-600">Participants total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(totalRevenue, 'FCFA')}
                  </p>
                  <p className="text-sm text-gray-600">Revenus générés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {organizerEvents.length > 0 ? Math.round(totalAttendees / organizerEvents.length) : 0}
                  </p>
                  <p className="text-sm text-gray-600">Participants moyen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="events">Mes événements</TabsTrigger>
            <TabsTrigger value="analytics">Statistiques</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Événements à venir ({upcomingEvents.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <ImageWithFallback
                          src={event.image}
                          alt={event.title}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                        {event.isLive && (
                          <Badge className="absolute top-2 left-2 bg-red-600 text-white">
                            LIVE
                          </Badge>
                        )}
                        <Badge variant="secondary" className="absolute top-2 right-2">
                          {event.category}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 truncate">
                          {event.title}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{event.attendees}/{event.maxAttendees}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-indigo-600">
                            {formatPrice(event.price, event.currency)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatPrice(event.price * event.attendees, event.currency)} revenus
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                          <Badge
                            variant={event.status === 'published' ? 'default' : 'secondary'}
                            className={event.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {event.status === 'published' ? 'Publié' : 'Brouillon'}
                          </Badge>
                          {/* Badge mise en avant */}
                          {(() => {
                            const req = getFeaturedRequestStatus(event.id);
                            if (event.isFeatured) return (
                              <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> En avant
                              </Badge>
                            );
                            if (req?.status === 'pending') return (
                              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                                <Clock3 className="w-3 h-3" /> En attente
                              </Badge>
                            );
                            if (req?.status === 'rejected') return (
                              <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Refusé
                              </Badge>
                            );
                            return null;
                          })()}
                        </div>
                        {event.attendees > 0 && (
                          <div className="mb-2 flex items-center gap-1 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
                            <Users className="w-3 h-3" />
                            {event.attendees} billet(s) vendu(s) — modification impossible
                          </div>
                        )}
                        <div className="flex space-x-2 flex-wrap gap-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewOrgEvent(event)}
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </Button>
                          {/* Bouton Mettre en avant — seulement si publié et pas encore featured */}
                          {event.status === 'published' && !event.isFeatured && (() => {
                            const req = getFeaturedRequestStatus(event.id);
                            if (req?.status === 'pending') return (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="text-gray-400 border-gray-200 cursor-not-allowed"
                              >
                                Demande en cours...
                              </Button>
                            );
                            return (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setFeaturedRequestModal(event); setFeaturedMessage(''); }}
                                className="text-yellow-600 hover:text-yellow-700 border-yellow-300"
                              >
                                {req?.status === 'rejected' ? 'Renvoyer la demande' : 'Mettre en avant'}
                              </Button>
                            );
                          })()}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleSales(event)}
                            className={event.salesBlocked ? 'text-green-600 hover:text-green-700' : 'text-orange-600 hover:text-orange-700'}
                            title={event.salesBlocked ? 'Réactiver les ventes' : 'Suspendre les ventes'}
                          >
                            {event.salesBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onManageControllers?.(event.id)}
                            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            title="Gérer les contrôleurs"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(event)}
                            disabled={event.attendees > 0}
                            title={event.attendees > 0 ? 'Impossible de modifier : des billets ont été vendus' : 'Modifier'}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirmEvent(event)}
                            className="text-red-600 hover:text-red-700"
                            disabled={event.attendees > 0}
                            title={event.attendees > 0 ? 'Impossible de supprimer : des billets ont été vendus' : 'Supprimer'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Événements passés ({pastEvents.length})
                </h2>
                <div className="space-y-3">
                  {pastEvents.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <ImageWithFallback
                            src={event.image}
                            alt={event.title}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {event.title}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{formatDate(event.date)}</span>
                              <Users className="w-4 h-4 mr-1 ml-3" />
                              <span>{event.attendees} participants</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                {formatPrice(event.price * event.attendees, event.currency)}
                              </p>
                              <p className="text-sm text-gray-600">Revenus</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onManageControllers?.(event.id)}
                              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Contrôleurs
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEventSelect(event.id)}
                            >
                              <BarChart3 className="w-4 h-4 mr-1" />
                              Stats
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {organizerEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun événement créé
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez par créer votre premier événement
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un événement
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenus par mois</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <BarChart3 className="w-8 h-8 mr-2" />
                    Graphique des revenus (simulation)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Participants par événement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <Users className="w-8 h-8 mr-2" />
                    Graphique des participants (simulation)
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance des événements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {organizerEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600">{event.attendees} participants</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatPrice(event.price * event.attendees, event.currency)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {Math.round((event.attendees / event.maxAttendees) * 100)}% rempli
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de profil organisateur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Nom d'organisateur</Label>
                  <Input
                    id="orgName"
                    value={currentUser.name}
                    placeholder="Nom de votre organisation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgDescription">Description</Label>
                  <Textarea
                    id="orgDescription"
                    placeholder="Décrivez votre organisation..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgWebsite">Site web</Label>
                  <Input
                    id="orgWebsite"
                    placeholder="https://votre-site.com"
                  />
                </div>
                <Button>Sauvegarder les modifications</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres de paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Compte bancaire (IBAN)</Label>
                  <Input
                    id="bankAccount"
                    placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paypalEmail">Email PayPal</Label>
                  <Input
                    id="paypalEmail"
                    type="email"
                    placeholder="votre@email.com"
                  />
                </div>
                <Button>Configurer les paiements</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog — Détails de l'événement */}
      <Dialog open={!!viewOrgEvent} onOpenChange={(open: boolean) => { if (!open) setViewOrgEvent(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'événement</DialogTitle>
          </DialogHeader>
          {viewOrgEvent && (
            <div className="space-y-4">
              {viewOrgEvent.image && (
                <img
                  src={viewOrgEvent.image}
                  alt={viewOrgEvent.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xl text-gray-900">{viewOrgEvent.title}</span>
                <Badge variant={viewOrgEvent.status === 'published' ? 'default' : 'secondary'}>
                  {viewOrgEvent.status === 'published' ? 'Publié' : viewOrgEvent.status === 'draft' ? 'Brouillon / En attente' : viewOrgEvent.status}
                </Badge>
                {viewOrgEvent.isLive && <Badge className="bg-red-500 text-white">LIVE</Badge>}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{viewOrgEvent.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span><span className="font-medium">Date :</span> {formatDate(viewOrgEvent.date)} à {viewOrgEvent.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span><span className="font-medium">Lieu :</span> {viewOrgEvent.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span><span className="font-medium">Participants :</span> {viewOrgEvent.attendees} / {viewOrgEvent.maxAttendees}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span><span className="font-medium">Prix :</span> {formatPrice(viewOrgEvent.price, viewOrgEvent.currency)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 col-span-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span><span className="font-medium">Catégorie :</span> {viewOrgEvent.category}</span>
                </div>
              </div>
              {viewOrgEvent.attendees > 0 && (
                <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                  <Users className="w-3.5 h-3.5 flex-shrink-0" />
                  {viewOrgEvent.attendees} billet(s) vendu(s) — modification et suppression désactivées
                </div>
              )}
            </div>
          )}
          <DialogFooter className="pt-2">
            {viewOrgEvent && viewOrgEvent.attendees === 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => { setViewOrgEvent(null); handleEditClick(viewOrgEvent); }}
                >
                  <Edit className="w-4 h-4 mr-2" /> Modifier
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => { setViewOrgEvent(null); setDeleteConfirmEvent(viewOrgEvent); }}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={() => setViewOrgEvent(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <ConfirmDialog
        open={!!deleteConfirmEvent}
        onOpenChange={(open) => { if (!open) setDeleteConfirmEvent(null); }}
        title="Supprimer l'événement"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteConfirmEvent?.title}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer définitivement"
        destructive
        onConfirm={() => {
          if (deleteConfirmEvent) onEventDelete(deleteConfirmEvent.id);
        }}
      />

      {/* Modal demande de mise en avant */}
      <Dialog open={!!featuredRequestModal} onOpenChange={(open: boolean) => { if (!open) { setFeaturedRequestModal(null); setFeaturedMessage(''); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Demander la mise en avant
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Votre événement <span className="font-semibold">{featuredRequestModal?.title}</span> sera soumis à l'administrateur pour apparaître dans le slider principal.
            </p>
            <div className="space-y-2">
              <Label htmlFor="featured-message">Message pour l'admin (optionnel)</Label>
              <Textarea
                id="featured-message"
                placeholder="Expliquez pourquoi cet événement mérite d'être mis en avant..."
                value={featuredMessage}
                onChange={(e) => setFeaturedMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFeaturedRequestModal(null); setFeaturedMessage(''); }}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmitFeaturedRequest}
              disabled={featuredLoading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {featuredLoading ? 'Envoi...' : 'Envoyer la demande'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}