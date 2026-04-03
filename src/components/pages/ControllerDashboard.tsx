import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import {
  QrCode,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  User,
  History,
  LogOut,
  ScanLine,
  AlertTriangle,
} from 'lucide-react';
import { QRScanner } from '../QRScanner';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import ControllerAPI from '../../services/api/ControllerAPI';
import type { ScanHistoryTicket } from '../../services/api/ControllerAPI';
import type { BackendEvent } from '../../services/api/EventsBackendAPI';
import AuthAPI from '../../services/api/AuthAPI';

interface ControllerDashboardProps {
  onLogout: () => void;
}

export function ControllerDashboard({ onLogout }: ControllerDashboardProps) {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('events');

  // Événements assignés
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Scanner
  const [showScanner, setShowScanner] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  // Historique
  const [history, setHistory] = useState<ScanHistoryTicket[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Profil
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profilePhone, setProfilePhone] = useState(user?.phone ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const data = await ControllerAPI.getMyEvents();
      setEvents(data);
    } catch {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await ControllerAPI.getMyScanHistory();
      setHistory(data);
      setScanCount(data.length);
    } catch {
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  useEffect(() => {
    if (activeTab === 'history') loadHistory();
  }, [activeTab, loadHistory]);

  const handleQRScan = useCallback(async (qrData: string) => {
    try {
      const result = await ControllerAPI.verifyTicket(qrData);
      setScanCount(prev => prev + 1);
      toast.success(`✅ Billet validé — ${result.holderName} (${result.category})`);
      setShowScanner(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Billet invalide ou introuvable';
      toast.error(msg);
    }
  }, []);

  const handleSaveProfile = useCallback(async () => {
    setProfileSaving(true);
    try {
      await updateProfile({ name: profileName, phone: profilePhone || null });
      toast.success('Profil mis à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setProfileSaving(false);
    }
  }, [profileName, profilePhone, updateProfile]);

  const handleChangePassword = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      toast.success('Mot de passe modifié avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setPasswordSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword, changePassword]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Espace Contrôleur</h1>
              <p className="text-sm text-gray-500">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
              {scanCount} scan{scanCount > 1 ? 's' : ''}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="events">
              <Calendar className="w-4 h-4 mr-1 hidden sm:block" />
              Événements
            </TabsTrigger>
            <TabsTrigger value="scan">
              <QrCode className="w-4 h-4 mr-1 hidden sm:block" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-1 hidden sm:block" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-1 hidden sm:block" />
              Profil
            </TabsTrigger>
          </TabsList>

          {/* Événements assignés */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Mes événements assignés</h2>
              <Badge>{events.length} événement{events.length > 1 ? 's' : ''}</Badge>
            </div>

            {eventsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600" />
              </div>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucun événement assigné pour l'instant.</p>
                  <p className="text-sm">L'organisateur vous affectera à un événement.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {events.map(event => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 shrink-0" />
                              <span>{event.date} à {event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={
                            event.status === 'published'
                              ? 'bg-green-100 text-green-800 shrink-0'
                              : 'bg-gray-100 text-gray-600 shrink-0'
                          }
                        >
                          {event.status === 'published' ? 'Publié' : event.status}
                        </Badge>
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm text-gray-500">
                        <span>{event.attendees} / {event.maxAttendees} participants</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setActiveTab('scan'); }}
                          className="h-7"
                        >
                          <QrCode className="w-3 h-3 mr-1" />
                          Scanner
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Scanner QR */}
          <TabsContent value="scan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-indigo-600" />
                  Scanner de billets
                </CardTitle>
                <CardDescription>
                  Scannez les QR codes des billets pour valider l'entrée
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showScanner ? (
                  <div className="space-y-4">
                    <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
                    <Button variant="outline" onClick={() => setShowScanner(false)} className="w-full">
                      Fermer le scanner
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <QrCode className="w-12 h-12 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Prêt à scanner</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
                      Activez la caméra pour scanner les billets des participants.
                    </p>
                    <Button
                      onClick={() => setShowScanner(true)}
                      size="lg"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600"
                    >
                      <ScanLine className="w-5 h-5 mr-2" />
                      Activer le scanner
                    </Button>

                    <div className="mt-8 pt-6 border-t">
                      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                          <CheckCircle className="w-7 h-7 text-green-600 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-green-600">{scanCount}</p>
                          <p className="text-xs text-gray-500">Validés (session)</p>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-lg text-center">
                          <Clock className="w-7 h-7 text-indigo-600 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-indigo-600">{events.length}</p>
                          <p className="text-xs text-gray-500">Événements assignés</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!showScanner && (
                  <Alert className="mt-4">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription className="text-sm">
                      Vous ne pouvez scanner que les billets des événements qui vous ont été assignés.
                      Chaque billet ne peut être scanné qu'une seule fois.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historique des scans */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Historique des scans</h2>
              <Badge>{history.length} billet{history.length > 1 ? 's' : ''}</Badge>
            </div>

            {historyLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600" />
              </div>
            ) : history.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucun scan effectué pour l'instant.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {history.map(ticket => (
                  <Card key={ticket.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                            <span className="font-medium text-gray-900 truncate">{ticket.holderName}</span>
                            <Badge variant="secondary" className="text-xs">{ticket.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{ticket.holderEmail}</p>
                          <p className="text-sm font-medium text-gray-700 mt-1 truncate">
                            {ticket.event.title}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{ticket.event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Scanné le {ticket.usedAt ? formatDateTime(ticket.usedAt) : '—'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-gray-800">
                            {new Intl.NumberFormat('fr-FR').format(ticket.price)} {ticket.currency}
                          </p>
                          <Badge className="bg-green-100 text-green-800 text-xs">Validé</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profil */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profileName">Nom complet</Label>
                  <Input
                    id="profileName"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="Votre nom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profileEmail">Email</Label>
                  <Input id="profileEmail" value={user?.email ?? ''} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-400">L'email ne peut pas être modifié ici.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profilePhone">Téléphone</Label>
                  <Input
                    id="profilePhone"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    placeholder="+242 ..."
                  />
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {profileSaving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPwd">Mot de passe actuel</Label>
                  <Input
                    id="currentPwd"
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPwd">Nouveau mot de passe</Label>
                  <Input
                    id="newPwd"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPwd">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="confirmPwd"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
                  variant="outline"
                  className="w-full"
                >
                  {passwordSaving ? 'Modification...' : 'Changer le mot de passe'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
