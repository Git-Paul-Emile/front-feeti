// Dashboard spécifique pour un événement organisateur avec suivi des ventes et scanner QR

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import {
  ArrowLeft,
  Users,
  Ticket,
  DollarSign,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
  AlertTriangle,
  BarChart3,
  Search,
  Filter,
  UserCheck,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { QRScanner } from '../QRScanner';
import { toast } from 'sonner@2.0.3';
import TicketAPI from '../../services/api/TicketAPI';
import type { BackendTicket } from '../../services/api/TicketAPI';
import ControllerAPI from '../../services/api/ControllerAPI';
import type { EventControllerAssignment } from '../../services/api/ControllerAPI';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  price: number;
  currency: string;
  maxAttendees: number;
  attendees: number;
}

interface OrganizerEventDashboardProps {
  event: Event;
  onBack: () => void;
  initialTab?: string;
}

interface EventStats {
  totalRevenue: number;
  ticketsSold: number;
  ticketsRemaining: number;
  ticketsUsed: number;
  ticketsCancelled: number;
}

export function OrganizerEventDashboard({ event, onBack, initialTab }: OrganizerEventDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab ?? 'overview');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [tickets, setTickets] = useState<BackendTicket[]>([]);

  // Contrôleurs
  const [controllers, setControllers] = useState<EventControllerAssignment[]>([]);
  const [controllersLoading, setControllersLoading] = useState(false);
  const [showAddController, setShowAddController] = useState(false);
  const [ctrlName, setCtrlName] = useState('');
  const [ctrlEmail, setCtrlEmail] = useState('');
  const [ctrlPassword, setCtrlPassword] = useState('');
  const [ctrlPhone, setCtrlPhone] = useState('');
  const [ctrlShowPwd, setCtrlShowPwd] = useState(false);
  const [ctrlSaving, setCtrlSaving] = useState(false);

  const computeStats = useCallback((ticketList: BackendTicket[]): EventStats => {
    const sold = ticketList.length;
    const used = ticketList.filter(t => t.status === 'used').length;
    const cancelled = ticketList.filter(t => t.status === 'expired').length;
    const revenue = ticketList.reduce((sum, t) => sum + t.price, 0);
    return {
      totalRevenue: revenue,
      ticketsSold: sold,
      ticketsRemaining: event.maxAttendees - event.attendees,
      ticketsUsed: used,
      ticketsCancelled: cancelled,
    };
  }, [event.maxAttendees, event.attendees]);

  const [stats, setStats] = useState<EventStats>({
    totalRevenue: 0,
    ticketsSold: 0,
    ticketsRemaining: event.maxAttendees - event.attendees,
    ticketsUsed: 0,
    ticketsCancelled: 0,
  });

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await TicketAPI.getEventTickets(event.id);
      setTickets(data);
      setStats(computeStats(data));
    } catch {
      toast.error('Erreur lors du chargement des billets');
    } finally {
      setLoading(false);
    }
  }, [event.id, computeStats]);

  useEffect(() => { loadTickets(); }, [loadTickets]);
  useEffect(() => { if (initialTab === 'controllers') loadControllers(); }, []);

  const loadControllers = useCallback(async () => {
    setControllersLoading(true);
    try {
      const data = await ControllerAPI.listForEvent(event.id);
      setControllers(data);
    } catch {
      toast.error('Erreur lors du chargement des contrôleurs');
    } finally {
      setControllersLoading(false);
    }
  }, [event.id]);

  const handleAddController = useCallback(async () => {
    if (!ctrlName || !ctrlEmail || !ctrlPassword) {
      toast.error('Nom, email et mot de passe sont requis');
      return;
    }
    setCtrlSaving(true);
    try {
      const assignment = await ControllerAPI.createAndAssign(event.id, {
        name: ctrlName, email: ctrlEmail, password: ctrlPassword, phone: ctrlPhone || undefined,
      });
      setControllers(prev => [...prev, assignment]);
      setCtrlName(''); setCtrlEmail(''); setCtrlPassword(''); setCtrlPhone('');
      setShowAddController(false);
      toast.success('Contrôleur ajouté avec succès');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de l\'ajout du contrôleur');
    } finally {
      setCtrlSaving(false);
    }
  }, [event.id, ctrlName, ctrlEmail, ctrlPassword, ctrlPhone]);

  const handleRemoveController = useCallback(async (controllerId: string) => {
    try {
      await ControllerAPI.remove(event.id, controllerId);
      setControllers(prev => prev.filter(c => c.controllerId !== controllerId));
      toast.success('Contrôleur retiré');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  }, [event.id]);

  const handleQRScan = useCallback(async (qrData: string) => {
    try {
      const result = await TicketAPI.verifyTicket(qrData);
      // Mettre à jour localement le statut du billet
      setTickets(prev => prev.map(t => t.id === result.id ? { ...t, status: 'used' as const, usedAt: new Date().toISOString() } : t));
      setStats(prev => ({ ...prev, ticketsUsed: prev.ticketsUsed + 1 }));
      toast.success(`Billet validé — Bienvenue ${result.holderName} (${result.category})`);
      setShowScanner(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Billet invalide ou introuvable';
      toast.error(msg);
    }
  }, []);

  const filteredTickets = tickets.filter(t =>
    t.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.holderEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':   return <Badge className="bg-green-100 text-green-800">Valide</Badge>;
      case 'used':    return <Badge className="bg-gray-100 text-gray-800">Utilisé</Badge>;
      case 'expired': return <Badge className="bg-red-100 text-red-800">Expiré</Badge>;
      default:        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('fr-FR').format(p) + ' ' + (event.currency || 'FCFA');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{event.date} à {event.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
            <Button onClick={loadTickets} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Revenus Totaux</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Billets Vendus</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.ticketsSold} / {event.maxAttendees}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <Progress value={(stats.ticketsSold / event.maxAttendees) * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Places Restantes</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.ticketsRemaining}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Billets Validés</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.ticketsUsed}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v === 'controllers') loadControllers(); }}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-1 hidden sm:block" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="sales">
              <Ticket className="w-4 h-4 mr-1 hidden sm:block" />
              Ventes ({stats.ticketsSold})
            </TabsTrigger>
            <TabsTrigger value="scanner">
              <QrCode className="w-4 h-4 mr-1 hidden sm:block" />
              Scanner QR
            </TabsTrigger>
            <TabsTrigger value="controllers">
              <UserCheck className="w-4 h-4 mr-1 hidden sm:block" />
              Contrôleurs ({controllers.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Statistiques de Vente</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600">Revenu total</p>
                      <p className="text-xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600">Revenu moyen / billet</p>
                      <p className="text-xl font-bold text-blue-600">
                        {stats.ticketsSold > 0 ? formatPrice(Math.round(stats.totalRevenue / stats.ticketsSold)) : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Taux de remplissage</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {event.maxAttendees > 0 ? Math.round((stats.ticketsSold / event.maxAttendees) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Derniers billets vendus</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tickets.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Ticket className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium">{t.holderName}</p>
                          <p className="text-sm text-gray-500">{t.category} — {t.holderEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(t.price)}</p>
                        {getStatusBadge(t.status)}
                      </div>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Aucun billet vendu pour l'instant</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Liste des Billets</CardTitle>
                    <CardDescription>{stats.ticketsSold} billet(s) vendu(s)</CardDescription>
                  </div>
                  <Button variant="outline" onClick={loadTickets} disabled={loading}>
                    <Download className="w-4 h-4 mr-2" />
                    Actualiser
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher par nom, email ou ID..."
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Porteur</TableHead>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Date d'achat</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTickets.map(t => (
                          <TableRow key={t.id}>
                            <TableCell className="font-mono text-xs">{t.id.slice(-8).toUpperCase()}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{t.holderName}</p>
                                <p className="text-xs text-gray-500">{t.holderEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell>{t.category}</TableCell>
                            <TableCell className="font-medium">{formatPrice(t.price)}</TableCell>
                            <TableCell>{getStatusBadge(t.status)}</TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredTickets.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              Aucun billet trouvé
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Controllers Tab */}
          <TabsContent value="controllers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-indigo-600" />
                      Contrôleurs de billets
                    </CardTitle>
                    <CardDescription>
                      Gérez les personnes autorisées à scanner les billets de cet événement
                    </CardDescription>
                  </div>
                  <Dialog open={showAddController} onOpenChange={setShowAddController}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Ajouter un contrôleur
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter un contrôleur</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-1">
                          <Label htmlFor="ctrlName">Nom complet *</Label>
                          <Input id="ctrlName" value={ctrlName} onChange={e => setCtrlName(e.target.value)} placeholder="Jean Dupont" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="ctrlEmail">Email *</Label>
                          <Input id="ctrlEmail" type="email" value={ctrlEmail} onChange={e => setCtrlEmail(e.target.value)} placeholder="jean@example.com" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="ctrlPassword">Mot de passe *</Label>
                          <div className="relative">
                            <Input
                              id="ctrlPassword"
                              type={ctrlShowPwd ? 'text' : 'password'}
                              value={ctrlPassword}
                              onChange={e => setCtrlPassword(e.target.value)}
                              placeholder="Mot de passe"
                              className="pr-10"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                              onClick={() => setCtrlShowPwd(v => !v)}
                            >
                              {ctrlShowPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="ctrlPhone">Téléphone (optionnel)</Label>
                          <Input id="ctrlPhone" value={ctrlPhone} onChange={e => setCtrlPhone(e.target.value)} placeholder="+242 ..." />
                        </div>
                        <p className="text-xs text-gray-500">
                          Un compte contrôleur sera créé avec ces identifiants.
                          Si le contrôleur existe déjà, il sera simplement affecté à cet événement.
                        </p>
                        <Button
                          onClick={handleAddController}
                          disabled={ctrlSaving}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                          {ctrlSaving ? 'Ajout en cours...' : 'Ajouter le contrôleur'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {controllersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600" />
                  </div>
                ) : controllers.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Aucun contrôleur assigné</p>
                    <p className="text-sm">Ajoutez des contrôleurs pour qu'ils puissent scanner les billets à l'entrée.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {controllers.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                            <UserCheck className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{c.controller.name}</p>
                            <p className="text-sm text-gray-500">{c.controller.email}</p>
                            {c.controller.phone && <p className="text-xs text-gray-400">{c.controller.phone}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 hidden sm:block">
                            Depuis le {new Date(c.assignedAt).toLocaleDateString('fr-FR')}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveController(c.controllerId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scanner Tab */}
          <TabsContent value="scanner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-indigo-600" />
                  Scanner de Billets
                </CardTitle>
                <CardDescription>
                  Scannez les QR codes des billets pour valider l'entrée
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showScanner ? (
                  <div className="space-y-4">
                    <QRScanner
                      onScan={handleQRScan}
                      onClose={() => setShowScanner(false)}
                    />
                    <Button variant="outline" onClick={() => setShowScanner(false)} className="w-full">
                      Fermer le scanner
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <QrCode className="w-12 h-12 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Scanner QR Code</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Utilisez votre caméra pour scanner les billets des participants à l'entrée de votre événement
                    </p>
                    <Button
                      onClick={() => setShowScanner(true)}
                      size="lg"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      Activer le Scanner
                    </Button>

                    <div className="mt-8 pt-8 border-t">
                      <h4 className="font-semibold mb-4">Statistiques de Validation</h4>
                      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-green-600">{stats.ticketsUsed}</p>
                          <p className="text-sm text-gray-600">Validés</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-blue-600">
                            {stats.ticketsSold - stats.ticketsUsed - stats.ticketsCancelled}
                          </p>
                          <p className="text-sm text-gray-600">En attente</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-red-600">{stats.ticketsCancelled}</p>
                          <p className="text-sm text-gray-600">Expirés</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!showScanner && (
                  <Alert className="mt-6">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Important :</strong> Assurez-vous d'avoir une bonne connexion Internet
                      pour vérifier les billets en temps réel. Chaque billet ne peut être scanné qu'une seule fois.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
