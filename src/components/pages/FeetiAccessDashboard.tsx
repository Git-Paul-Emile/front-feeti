import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import {
  ArrowLeft, Plus, RefreshCw, Download, Shield, Users, Map,
  TicketCheck, CheckCircle2, XCircle, AlertTriangle, Mail,
  RotateCcw, Trash2, Eye, ChevronRight, Layers, Zap, Copy, QrCode,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import AccessAPI from '../../services/api/AccessAPI';
import type {
  EventZone, ParticipantCategory, ZoneAccessLevel,
  AccessBadge, AccessLog, ZoneTracking,
} from '../../services/api/AccessAPI';
import { useAccessSocket } from '../../hooks/useAccessSocket';

// ─── Constantes ────────────────────────────────────────────────────────────────

const ZONE_CODES = ['Z1','Z2','Z3','Z4','Z5','Z6','Z7','Z8','Z9','Z10'] as const;

const LEVEL_STYLES: Record<ZoneAccessLevel, string> = {
  OUI:  'bg-emerald-500 text-white hover:bg-emerald-600',
  COND: 'bg-amber-400 text-white hover:bg-amber-500',
  NON:  'bg-red-400 text-white hover:bg-red-500',
};

const LEVEL_NEXT: Record<ZoneAccessLevel, ZoneAccessLevel> = {
  NON: 'COND', COND: 'OUI', OUI: 'NON',
};

const RESULT_BADGE: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  granted:     { label: 'Autorisé',     variant: 'default' },
  denied:      { label: 'Refusé',       variant: 'destructive' },
  conditional: { label: 'Conditionnel', variant: 'secondary' },
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

// ─── Props ──────────────────────────────────────────────────────────────────────

interface FeetiAccessDashboardProps {
  eventId: string;
  eventTitle: string;
  onBack: () => void;
}

// ─── Composant principal ────────────────────────────────────────────────────────

export function FeetiAccessDashboard({ eventId, eventTitle, onBack }: FeetiAccessDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('zones');

  // ── Zones state ─────────────────────────────────────────────────────────────
  const [zones, setZones] = useState<EventZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zoneDialog, setZoneDialog] = useState<{ open: boolean; zone?: EventZone }>({ open: false });
  const [zoneForm, setZoneForm] = useState({ code: 'Z1', name: '', description: '', color: '#3B82F6', maxCapacity: '' });

  // ── Categories state ────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<ParticipantCategory[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catDialog, setCatDialog] = useState<{ open: boolean; cat?: ParticipantCategory }>({ open: false });
  const [catForm, setCatForm] = useState({ name: '', description: '', color: '#6B7280' });

  // ── Matrix state ────────────────────────────────────────────────────────────
  const [matrix, setMatrix] = useState<Record<string, Record<string, ZoneAccessLevel>>>({});
  const [matrixDirty, setMatrixDirty] = useState(false);
  const [matrixSaving, setMatrixSaving] = useState(false);

  // ── Badges state ────────────────────────────────────────────────────────────
  const [badges, setBadges] = useState<AccessBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [badgeDialog, setBadgeDialog] = useState(false);
  const [badgeForm, setBadgeForm] = useState({ categoryId: '', holderName: '', holderEmail: '', holderPhone: '', holderPhoto: '', ticketId: '' });
  const [qrDialog, setQrDialog] = useState<{ open: boolean; badge?: AccessBadge }>({ open: false });
  const [sourceEventId, setSourceEventId] = useState('');

  // ── Tracking state ──────────────────────────────────────────────────────────
  const [tracking, setTracking] = useState<ZoneTracking[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [logsFilter, setLogsFilter] = useState<{ zoneId: string; result: string }>({ zoneId: '', result: '' });
  const [trackingLoading, setTrackingLoading] = useState(false);

  // ── QR rotatif state ────────────────────────────────────────────────────────
  const [rotatingMode, setRotatingMode] = useState(false);
  const [rotatingQrData, setRotatingQrData] = useState<{ qr: string; expiresAt: number } | null>(null);
  const [rotatingCountdown, setRotatingCountdown] = useState(0);
  const rotatingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load zones ─────────────────────────────────────────────────────────────
  const loadZones = useCallback(async () => {
    try {
      setZonesLoading(true);
      const data = await AccessAPI.getZones(eventId);
      setZones(data);
    } catch { toast.error('Erreur lors du chargement des zones'); }
    finally { setZonesLoading(false); }
  }, [eventId]);

  // ── Load categories + matrix ─────────────────────────────────────────────
  const loadCategories = useCallback(async () => {
    try {
      setCatsLoading(true);
      const [data, matrixData] = await Promise.all([
        AccessAPI.getCategories(eventId),
        AccessAPI.getAccessMatrix(eventId),
      ]);
      setCategories(data);
      // Build matrix map: categoryId → zoneId → level
      const map: Record<string, Record<string, ZoneAccessLevel>> = {};
      matrixData.categories.forEach((cat) => {
        map[cat.id] = {};
        (cat.accessRights ?? []).forEach((r) => {
          map[cat.id][r.zoneId] = r.accessLevel;
        });
      });
      setMatrix(map);
      setMatrixDirty(false);
    } catch { toast.error('Erreur lors du chargement des catégories'); }
    finally { setCatsLoading(false); }
  }, [eventId]);

  // ── Load badges ──────────────────────────────────────────────────────────
  const loadBadges = useCallback(async () => {
    try {
      setBadgesLoading(true);
      setBadges(await AccessAPI.getBadges(eventId));
    } catch { toast.error('Erreur lors du chargement des badges'); }
    finally { setBadgesLoading(false); }
  }, [eventId]);

  // ── Load tracking ─────────────────────────────────────────────────────────
  const loadTracking = useCallback(async () => {
    try {
      setTrackingLoading(true);
      const [t, l] = await Promise.all([
        AccessAPI.getTracking(eventId),
        AccessAPI.getAccessLogs(eventId, {
          ...(logsFilter.zoneId ? { zoneId: logsFilter.zoneId } : {}),
          ...(logsFilter.result ? { result: logsFilter.result as any } : {}),
        }),
      ]);
      setTracking(t);
      setLogs(l);
    } catch { toast.error('Erreur lors du chargement du tracking'); }
    finally { setTrackingLoading(false); }
  }, [eventId, logsFilter]);

  useEffect(() => { loadZones(); }, [loadZones]);
  useEffect(() => { if (activeTab === 'categories') loadCategories(); }, [activeTab, loadCategories]);
  useEffect(() => { if (activeTab === 'badges') loadBadges(); }, [activeTab, loadBadges]);
  useEffect(() => {
    if (activeTab === 'tracking') loadTracking();
  }, [activeTab, loadTracking]);

  // WebSocket temps réel — met à jour une zone à chaque scan accordé
  useAccessSocket(eventId, (updatedZone) => {
    setTracking(prev => {
      const idx = prev.findIndex(t => t.zoneId === updatedZone.zoneId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedZone;
        return next;
      }
      return [...prev, updatedZone];
    });
  });

  // QR rotatif — refresh auto avant expiration de la fenêtre
  const fetchRotatingQr = useCallback(async (badge: AccessBadge) => {
    try {
      const data = await AccessAPI.getCurrentQr(eventId, badge.id);
      setRotatingQrData({ qr: data.qr, expiresAt: data.nextRefreshAt });
      const delay = Math.max(1000, data.nextRefreshAt - Date.now() - 2000);
      rotatingTimerRef.current = setTimeout(() => fetchRotatingQr(badge), delay);
    } catch {}
  }, [eventId]);

  useEffect(() => {
    if (!rotatingMode || !qrDialog.badge) {
      if (rotatingTimerRef.current) clearTimeout(rotatingTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setRotatingQrData(null);
      setRotatingCountdown(0);
      return;
    }
    fetchRotatingQr(qrDialog.badge);
    return () => {
      if (rotatingTimerRef.current) clearTimeout(rotatingTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [rotatingMode, qrDialog.badge, fetchRotatingQr]);

  // Compte à rebours visuel
  useEffect(() => {
    if (!rotatingQrData) return;
    const tick = () => setRotatingCountdown(Math.max(0, Math.ceil((rotatingQrData.expiresAt - Date.now()) / 1000)));
    tick();
    countdownIntervalRef.current = setInterval(tick, 1000);
    return () => { if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current); };
  }, [rotatingQrData]);

  // ── Zone actions ────────────────────────────────────────────────────────────

  const handleApplyDefaultZones = async () => {
    try {
      const data = await AccessAPI.applyDefaultZones(eventId);
      setZones(data);
      toast.success(`${data.length} zones chargées`);
    } catch { toast.error('Erreur lors de l\'application des templates'); }
  };

  const handleSaveZone = async () => {
    try {
      if (zoneDialog.zone) {
        const updated = await AccessAPI.updateZone(eventId, zoneDialog.zone.id, {
          name: zoneForm.name,
          description: zoneForm.description || undefined,
          color: zoneForm.color,
          maxCapacity: zoneForm.maxCapacity ? Number(zoneForm.maxCapacity) : undefined,
        });
        setZones(prev => prev.map(z => z.id === updated.id ? updated : z));
        toast.success('Zone mise à jour');
      } else {
        const created = await AccessAPI.createZone(eventId, {
          code: zoneForm.code,
          name: zoneForm.name,
          description: zoneForm.description || undefined,
          color: zoneForm.color,
          maxCapacity: zoneForm.maxCapacity ? Number(zoneForm.maxCapacity) : undefined,
        });
        setZones(prev => [...prev, created]);
        toast.success('Zone créée');
      }
      setZoneDialog({ open: false });
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erreur lors de la sauvegarde');
    }
  };

  const handleToggleZone = async (zone: EventZone) => {
    try {
      const updated = await AccessAPI.updateZone(eventId, zone.id, { isActive: !zone.isActive });
      setZones(prev => prev.map(z => z.id === updated.id ? updated : z));
    } catch { toast.error('Erreur'); }
  };

  const handleDeleteZone = async (zone: EventZone) => {
    if (!confirm(`Supprimer la zone "${zone.name}" ?`)) return;
    try {
      await AccessAPI.deleteZone(eventId, zone.id);
      setZones(prev => prev.filter(z => z.id !== zone.id));
      toast.success('Zone supprimée');
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  // ── Category actions ──────────────────────────────────────────────────────

  const handleApplyDefaultCategories = async () => {
    try {
      const data = await AccessAPI.applyDefaultCategories(eventId);
      setCategories(data);
      await loadCategories();
      toast.success(`${data.length} catégories chargées`);
    } catch { toast.error('Erreur'); }
  };

  const handleSaveCategory = async () => {
    try {
      if (catDialog.cat) {
        const updated = await AccessAPI.updateCategory(eventId, catDialog.cat.id, catForm);
        setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
        toast.success('Catégorie mise à jour');
      } else {
        const created = await AccessAPI.createCategory(eventId, catForm);
        setCategories(prev => [...prev, created]);
        toast.success('Catégorie créée');
      }
      setCatDialog({ open: false });
      await loadCategories();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erreur');
    }
  };

  const handleDeleteCategory = async (cat: ParticipantCategory) => {
    if (!confirm(`Supprimer la catégorie "${cat.name}" ?`)) return;
    try {
      await AccessAPI.deleteCategory(eventId, cat.id);
      setCategories(prev => prev.filter(c => c.id !== cat.id));
      toast.success('Catégorie supprimée');
    } catch { toast.error('Erreur'); }
  };

  // ── Matrix actions ────────────────────────────────────────────────────────

  const toggleCell = (categoryId: string, zoneId: string) => {
    setMatrix(prev => {
      const current = prev[categoryId]?.[zoneId] ?? 'NON';
      return {
        ...prev,
        [categoryId]: { ...(prev[categoryId] ?? {}), [zoneId]: LEVEL_NEXT[current] },
      };
    });
    setMatrixDirty(true);
  };

  const handleSaveMatrix = async () => {
    try {
      setMatrixSaving(true);
      const rights: { categoryId: string; zoneId: string; accessLevel: ZoneAccessLevel }[] = [];
      for (const [catId, zoneMap] of Object.entries(matrix)) {
        for (const [zoneId, level] of Object.entries(zoneMap)) {
          rights.push({ categoryId: catId, zoneId, accessLevel: level });
        }
      }
      if (rights.length === 0) { toast.error('Aucun droit à sauvegarder'); return; }
      await AccessAPI.setAccessRights(eventId, rights);
      setMatrixDirty(false);
      toast.success('Matrice sauvegardée');
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setMatrixSaving(false); }
  };

  const handleApplyDefaultMatrix = async () => {
    try {
      const result = await AccessAPI.applyDefaultMatrix(eventId);
      await loadCategories();
      toast.success(`${result.applied} droits appliqués par défaut`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erreur — créez d\'abord les zones et catégories');
    }
  };

  // ── Badge actions ─────────────────────────────────────────────────────────

  const handleGenerateBadge = async () => {
    try {
      const badge = await AccessAPI.generateBadge(eventId, {
        categoryId: badgeForm.categoryId,
        holderName: badgeForm.holderName,
        holderEmail: badgeForm.holderEmail,
        ...(badgeForm.holderPhone ? { holderPhone: badgeForm.holderPhone } : {}),
        ...(badgeForm.holderPhoto ? { holderPhoto: badgeForm.holderPhoto } : {}),
        ...(badgeForm.ticketId ? { ticketId: badgeForm.ticketId } : {}),
      });
      setBadges(prev => [badge, ...prev]);
      setBadgeDialog(false);
      setBadgeForm({ categoryId: '', holderName: '', holderEmail: '', holderPhone: '', holderPhoto: '', ticketId: '' });
      toast.success('Badge généré');
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Erreur'); }
  };

  const handleSendBadge = async (badge: AccessBadge) => {
    try {
      const updated = await AccessAPI.sendBadge(eventId, badge.id);
      setBadges(prev => prev.map(b => b.id === updated.id ? updated : b));
      toast.success('Badge envoyé par email');
    } catch { toast.error('Erreur lors de l\'envoi'); }
  };

  const handleSendBadgeSms = async (badge: AccessBadge) => {
    try {
      const result = await AccessAPI.sendBadgeSms(eventId, badge.id, badge.holderPhone ?? undefined);
      toast.success(result.provider === 'simulation' ? 'SMS simulÃ©' : 'Badge envoyÃ© par SMS');
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Erreur SMS'); }
  };

  const handleRevokeBadge = async (badge: AccessBadge) => {
    if (!confirm(`Révoquer le badge de ${badge.holderName} ?`)) return;
    try {
      const updated = await AccessAPI.revokeBadge(eventId, badge.id);
      setBadges(prev => prev.map(b => b.id === updated.id ? updated : b));
      toast.success('Badge révoqué');
    } catch { toast.error('Erreur'); }
  };

  const handleRegenerateBadge = async (badge: AccessBadge) => {
    try {
      const updated = await AccessAPI.regenerateBadge(eventId, badge.id);
      setBadges(prev => prev.map(b => b.id === updated.id ? updated : b));
      toast.success('Badge régénéré');
    } catch { toast.error('Erreur'); }
  };

  // ── Export ────────────────────────────────────────────────────────────────

  const handleExportCsv = async () => {
    try {
      await AccessAPI.exportCsv(eventId);
      toast.success('Export CSV téléchargé');
    } catch { toast.error('Erreur lors de l\'export'); }
  };

  const handleExportBadgesCsv = async () => {
    try {
      await AccessAPI.exportBadgesCsv(eventId);
      toast.success('Export badges tÃ©lÃ©chargÃ©');
    } catch { toast.error('Erreur lors de l\'export badges'); }
  };

  const handleExportBadgesPdf = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    badges.forEach((badge, index) => {
      if (index > 0) doc.addPage();
      doc.setFontSize(18);
      doc.text('Feeti Access', 20, 24);
      doc.setFontSize(12);
      doc.text(`Evenement: ${eventTitle}`, 20, 34);
      doc.text(`Titulaire: ${badge.holderName}`, 20, 46);
      doc.text(`Email: ${badge.holderEmail}`, 20, 54);
      if (badge.holderPhone) doc.text(`Telephone: ${badge.holderPhone}`, 20, 62);
      doc.text(`Categorie: ${badge.category?.name ?? ''}`, 20, badge.holderPhone ? 70 : 62);
      doc.text(`Statut: ${badge.status}`, 20, badge.holderPhone ? 78 : 70);
      doc.setFontSize(8);
      const qrText = doc.splitTextToSize(badge.qrCode, 170);
      doc.text(qrText, 20, badge.holderPhone ? 92 : 84);
    });
    doc.save(`badges-feeti-access-${eventId}.pdf`);
  };

  const handleDuplicateConfig = async () => {
    if (!sourceEventId.trim()) return;
    try {
      const result = await AccessAPI.duplicateConfig(eventId, sourceEventId.trim());
      await Promise.all([loadZones(), loadCategories()]);
      toast.success(`${result.zones} zones, ${result.categories} catÃ©gories, ${result.rights} droits copiÃ©s`);
      setSourceEventId('');
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Duplication impossible'); }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Feeti Access</h1>
              <p className="text-sm text-gray-500 truncate max-w-xs">{eventTitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="zones">
              <Map className="w-4 h-4 mr-1 hidden sm:block" />
              Zones
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Users className="w-4 h-4 mr-1 hidden sm:block" />
              Catégories & Droits
            </TabsTrigger>
            <TabsTrigger value="badges">
              <TicketCheck className="w-4 h-4 mr-1 hidden sm:block" />
              Badges QR
            </TabsTrigger>
            <TabsTrigger value="tracking">
              <Zap className="w-4 h-4 mr-1 hidden sm:block" />
              Tracking
            </TabsTrigger>
          </TabsList>

          {/* ── TAB ZONES ──────────────────────────────────────────────────────── */}
          <TabsContent value="zones" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Zones de l'événement</h2>
                <p className="text-sm text-gray-500">{zones.filter(z => z.isActive).length} zones actives sur {zones.length}</p>
              </div>
              <div className="flex gap-2">
                <Input
                  className="w-48 h-9 text-xs"
                  value={sourceEventId}
                  onChange={e => setSourceEventId(e.target.value)}
                  placeholder="ID Ã©vÃ©nement source"
                />
                <Button variant="outline" onClick={handleDuplicateConfig} disabled={!sourceEventId.trim()}>
                  <Copy className="w-4 h-4 mr-1" />
                  Dupliquer
                </Button>
                <Button variant="outline" onClick={handleApplyDefaultZones}>
                  <Layers className="w-4 h-4 mr-1" />
                  10 templates
                </Button>
                <Button onClick={() => {
                  setZoneForm({ code: 'Z1', name: '', description: '', color: '#3B82F6', maxCapacity: '' });
                  setZoneDialog({ open: true });
                }}>
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter zone
                </Button>
              </div>
            </div>

            {zonesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}
              </div>
            ) : zones.length === 0 ? (
              <Card className="py-16 text-center">
                <CardContent className="flex flex-col items-center gap-3 text-gray-500">
                  <Map className="w-12 h-12 opacity-30" />
                  <p className="font-medium">Aucune zone configurée</p>
                  <Button variant="outline" onClick={handleApplyDefaultZones}>
                    <Layers className="w-4 h-4 mr-1" /> Charger les 10 templates
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zones.map(zone => (
                  <Card key={zone.id} className={`transition-opacity ${zone.isActive ? '' : 'opacity-60'}`}>
                    <CardContent className="pt-4 pb-3 px-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: zone.color }}>
                            {zone.code}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm leading-tight">{zone.name}</p>
                            {zone.description && <p className="text-xs text-gray-500 line-clamp-1">{zone.description}</p>}
                          </div>
                        </div>
                        <Badge variant={zone.isActive ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                          {zone.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {zone.maxCapacity != null && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Capacité</span>
                            <span className={zone.currentCount > zone.maxCapacity ? 'text-red-500 font-semibold' : ''}>
                              {zone.currentCount} / {zone.maxCapacity}
                            </span>
                          </div>
                          <Progress
                            value={Math.min(100, (zone.currentCount / zone.maxCapacity) * 100)}
                            className={zone.currentCount > zone.maxCapacity ? '[&>div]:bg-red-500' : ''}
                          />
                        </div>
                      )}

                      <div className="flex gap-1 pt-1 border-t">
                        <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs"
                          onClick={() => {
                            setZoneForm({
                              code: zone.code, name: zone.name,
                              description: zone.description ?? '',
                              color: zone.color,
                              maxCapacity: zone.maxCapacity != null ? String(zone.maxCapacity) : '',
                            });
                            setZoneDialog({ open: true, zone });
                          }}>
                          Modifier
                        </Button>
                        <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs"
                          onClick={() => handleToggleZone(zone)}>
                          {zone.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteZone(zone)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── TAB CATÉGORIES & DROITS ────────────────────────────────────────── */}
          <TabsContent value="categories" className="space-y-6">
            {/* Categories */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="text-xl font-bold text-gray-900">Catégories de participants</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleApplyDefaultCategories}>
                    <Layers className="w-4 h-4 mr-1" />10 catégories
                  </Button>
                  <Button onClick={() => {
                    setCatForm({ name: '', description: '', color: '#6B7280' });
                    setCatDialog({ open: true });
                  }}>
                    <Plus className="w-4 h-4 mr-1" />Ajouter
                  </Button>
                </div>
              </div>

              {catsLoading ? (
                <div className="flex gap-2 flex-wrap">
                  {[1,2,3,4].map(i => <div key={i} className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />)}
                </div>
              ) : categories.length === 0 ? (
                <Card className="py-10 text-center">
                  <CardContent className="text-gray-500">Aucune catégorie. Utilisez les 10 catégories par défaut.</CardContent>
                </Card>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border shadow-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      <button onClick={() => {
                        setCatForm({ name: cat.name, description: cat.description ?? '', color: cat.color });
                        setCatDialog({ open: true, cat });
                      }} className="text-gray-400 hover:text-gray-600 text-xs">✎</button>
                      <button onClick={() => handleDeleteCategory(cat)} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Matrix */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Matrice d'accès</h2>
                  <p className="text-sm text-gray-500">Cliquez sur une cellule pour changer le niveau.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" onClick={handleApplyDefaultMatrix}>
                    <RefreshCw className="w-4 h-4 mr-1" />Matrice par défaut
                  </Button>
                  {matrixDirty && (
                    <Button onClick={handleSaveMatrix} disabled={matrixSaving}>
                      {matrixSaving ? 'Sauvegarde...' : 'Sauvegarder la matrice'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Légende */}
              <div className="flex gap-3 mb-3 text-xs">
                {(['OUI','COND','NON'] as ZoneAccessLevel[]).map(l => (
                  <span key={l} className={`px-2 py-0.5 rounded font-semibold ${LEVEL_STYLES[l]}`}>{l}</span>
                ))}
                <span className="text-gray-500">— cliquer pour changer</span>
              </div>

              {categories.length === 0 || zones.length === 0 ? (
                <Card className="py-8 text-center">
                  <CardContent className="text-gray-500 text-sm">
                    Configurez d'abord les zones et les catégories pour accéder à la matrice.
                  </CardContent>
                </Card>
              ) : (
                <div className="overflow-x-auto rounded-xl border bg-white">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-2 text-left font-semibold text-gray-600 min-w-[160px] sticky left-0 bg-gray-50">
                          Catégorie / Zone
                        </th>
                        {zones.filter(z => z.isActive).map(z => (
                          <th key={z.id} className="px-2 py-2 text-center font-semibold min-w-[80px]">
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="w-6 h-6 rounded text-white text-xs flex items-center justify-center font-bold"
                                style={{ backgroundColor: z.color }}>{z.code}</div>
                              <span className="text-xs text-gray-500 max-w-[70px] truncate">{z.name}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat, idx) => (
                        <tr key={cat.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 font-medium text-gray-700 sticky left-0 bg-inherit flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className="max-w-[130px] truncate">{cat.name}</span>
                          </td>
                          {zones.filter(z => z.isActive).map(zone => {
                            const level: ZoneAccessLevel = matrix[cat.id]?.[zone.id] ?? 'NON';
                            return (
                              <td key={zone.id} className="px-2 py-1.5 text-center">
                                <button
                                  className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${LEVEL_STYLES[level]}`}
                                  onClick={() => toggleCell(cat.id, zone.id)}
                                >
                                  {level}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── TAB BADGES QR ──────────────────────────────────────────────────── */}
          <TabsContent value="badges" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Badges QR</h2>
                <p className="text-sm text-gray-500">{badges.length} badge{badges.length > 1 ? 's' : ''}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={handleExportBadgesCsv} disabled={badges.length === 0}>
                  <Download className="w-4 h-4 mr-1" />CSV badges
                </Button>
                <Button variant="outline" onClick={handleExportBadgesPdf} disabled={badges.length === 0}>
                  <Download className="w-4 h-4 mr-1" />PDF badges
                </Button>
                <Button onClick={() => setBadgeDialog(true)}>
                  <Plus className="w-4 h-4 mr-1" />Générer un badge
                </Button>
              </div>
            </div>

            {badgesLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}
              </div>
            ) : badges.length === 0 ? (
              <Card className="py-16 text-center">
                <CardContent className="flex flex-col items-center gap-3 text-gray-500">
                  <TicketCheck className="w-12 h-12 opacity-30" />
                  <p>Aucun badge généré</p>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titulaire</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Envoyé</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {badges.map(badge => (
                      <TableRow key={badge.id}>
                        <TableCell>
                          <p className="font-medium text-gray-900">{badge.holderName}</p>
                          <p className="text-xs text-gray-500">{badge.holderEmail}</p>
                          {badge.holderPhone && <p className="text-xs text-gray-400">{badge.holderPhone}</p>}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{badge.category?.name ?? '—'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            badge.status === 'active' ? 'default' :
                            badge.status === 'revoked' ? 'destructive' : 'secondary'
                          }>
                            {badge.status === 'active' ? 'Actif' : badge.status === 'revoked' ? 'Révoqué' : 'Expiré'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {badge.sentAt ? (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />{fmt(badge.sentAt)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Non envoyé</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Voir QR"
                              onClick={() => setQrDialog({ open: true, badge })}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            {badge.status === 'active' && (
                              <>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Envoyer par email"
                                  onClick={() => handleSendBadge(badge)}>
                                  <Mail className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Envoyer par SMS"
                                  onClick={() => handleSendBadgeSms(badge)}>
                                  <Zap className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Régénérer"
                                  onClick={() => handleRegenerateBadge(badge)}>
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" title="Révoquer"
                                  onClick={() => handleRevokeBadge(badge)}>
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ── TAB TRACKING ──────────────────────────────────────────────────── */}
          <TabsContent value="tracking" className="space-y-6">
            {/* Zone Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900">Flux en temps réel</h2>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/scan/access/${eventId}`)}>
                    <QrCode className="w-4 h-4 mr-1" />Scanner Web
                  </Button>
                  <Button variant="outline" size="sm" onClick={loadTracking} disabled={trackingLoading}>
                    <RefreshCw className={`w-4 h-4 mr-1 ${trackingLoading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportCsv}>
                    <Download className="w-4 h-4 mr-1" />Export CSV
                  </Button>
                </div>
              </div>

              {tracking.length === 0 ? (
                <Card className="py-8 text-center">
                  <CardContent className="text-gray-500 text-sm">
                    Aucune donnée de tracking — les compteurs s'affichent dès le premier scan.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {tracking.map(t => (
                    <Card key={t.zoneId} className={t.isOverCapacity ? 'border-red-400 bg-red-50' : ''}>
                      <CardContent className="pt-3 pb-3 px-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: t.color }}>{t.code}</div>
                            <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">{t.name}</span>
                          </div>
                          {t.isOverCapacity && (
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {t.currentCount}
                          {t.maxCapacity != null && (
                            <span className="text-sm font-normal text-gray-400"> / {t.maxCapacity}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{t.totalEntries} entrées totales</p>
                        {t.maxCapacity != null && (
                          <Progress
                            value={Math.min(100, (t.currentCount / t.maxCapacity) * 100)}
                            className={`mt-2 ${t.isOverCapacity ? '[&>div]:bg-red-500' : ''}`}
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Logs */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h2 className="text-xl font-bold text-gray-900">Historique des accès</h2>
                <div className="flex gap-2 flex-wrap">
                  <Select value={logsFilter.result || 'all'} onValueChange={v => setLogsFilter(p => ({ ...p, result: v === 'all' ? '' : v }))}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue placeholder="Tous résultats" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="granted">Autorisés</SelectItem>
                      <SelectItem value="denied">Refusés</SelectItem>
                      <SelectItem value="conditional">Conditionnels</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={logsFilter.zoneId || 'all'} onValueChange={v => setLogsFilter(p => ({ ...p, zoneId: v === 'all' ? '' : v }))}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue placeholder="Toutes zones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes zones</SelectItem>
                      {zones.map(z => <SelectItem key={z.id} value={z.id}>{z.code} — {z.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={loadTracking}>
                    <RefreshCw className="w-3 h-3 mr-1" />Filtrer
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titulaire</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Résultat</TableHead>
                      <TableHead>Date & Heure</TableHead>
                      <TableHead>Sync offline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">Aucun log</TableCell>
                      </TableRow>
                    ) : logs.slice(0, 200).map(log => {
                      const rb = RESULT_BADGE[log.result];
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <p className="font-medium text-sm">{log.badge?.holderName ?? '—'}</p>
                            <p className="text-xs text-gray-500">{log.badge?.category?.name ?? ''}</p>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {log.zone ? `${log.zone.code} — ${log.zone.name}` : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={rb.variant}>{rb.label}</Badge>
                            {log.refusalReason && (
                              <p className="text-xs text-red-500 mt-0.5">{log.refusalReason}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">{fmt(log.scannedAt)}</TableCell>
                          <TableCell>
                            {log.offlineSync && <Badge variant="outline" className="text-xs">Offline</Badge>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Dialog Zone ──────────────────────────────────────────────────────── */}
      <Dialog open={zoneDialog.open} onOpenChange={(o) => setZoneDialog(p => ({ ...p, open: o }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{zoneDialog.zone ? 'Modifier la zone' : 'Créer une zone'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {!zoneDialog.zone && (
              <div>
                <Label>Code zone</Label>
                <Select value={zoneForm.code} onValueChange={v => setZoneForm(p => ({ ...p, code: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ZONE_CODES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Nom <span className="text-red-500">*</span></Label>
              <Input value={zoneForm.name} onChange={e => setZoneForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Accès Général" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={zoneForm.description} onChange={e => setZoneForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Couleur</Label>
                <div className="flex gap-2 items-center mt-1">
                  <input type="color" value={zoneForm.color}
                    onChange={e => setZoneForm(p => ({ ...p, color: e.target.value }))}
                    className="w-10 h-9 rounded border cursor-pointer" />
                  <span className="text-sm text-gray-500">{zoneForm.color}</span>
                </div>
              </div>
              <div className="flex-1">
                <Label>Capacité max</Label>
                <Input type="number" min={1} value={zoneForm.maxCapacity}
                  onChange={e => setZoneForm(p => ({ ...p, maxCapacity: e.target.value }))}
                  placeholder="Illimitée" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setZoneDialog({ open: false })}>Annuler</Button>
              <Button className="flex-1" onClick={handleSaveZone} disabled={!zoneForm.name.trim()}>
                {zoneDialog.zone ? 'Sauvegarder' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Catégorie ──────────────────────────────────────────────────── */}
      <Dialog open={catDialog.open} onOpenChange={(o) => setCatDialog(p => ({ ...p, open: o }))}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{catDialog.cat ? 'Modifier la catégorie' : 'Créer une catégorie'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Nom <span className="text-red-500">*</span></Label>
              <Input value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: VIP" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <Label>Couleur</Label>
              <div className="flex gap-2 items-center mt-1">
                <input type="color" value={catForm.color}
                  onChange={e => setCatForm(p => ({ ...p, color: e.target.value }))}
                  className="w-10 h-9 rounded border cursor-pointer" />
                <span className="text-sm text-gray-500">{catForm.color}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCatDialog({ open: false })}>Annuler</Button>
              <Button className="flex-1" onClick={handleSaveCategory} disabled={!catForm.name.trim()}>
                {catDialog.cat ? 'Sauvegarder' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Générer Badge ───────────────────────────────────────────────── */}
      <Dialog open={badgeDialog} onOpenChange={setBadgeDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Générer un badge QR</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Catégorie <span className="text-red-500">*</span></Label>
              <Select value={badgeForm.categoryId} onValueChange={v => setBadgeForm(p => ({ ...p, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nom <span className="text-red-500">*</span></Label>
              <Input value={badgeForm.holderName} onChange={e => setBadgeForm(p => ({ ...p, holderName: e.target.value }))} placeholder="Nom complet" />
            </div>
            <div>
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input type="email" value={badgeForm.holderEmail} onChange={e => setBadgeForm(p => ({ ...p, holderEmail: e.target.value }))} placeholder="email@exemple.com" />
            </div>
            <div>
              <Label>Téléphone (SMS)</Label>
              <Input value={badgeForm.holderPhone} onChange={e => setBadgeForm(p => ({ ...p, holderPhone: e.target.value }))} placeholder="+242..." />
            </div>
            <div>
              <Label>Photo URL</Label>
              <Input value={badgeForm.holderPhoto} onChange={e => setBadgeForm(p => ({ ...p, holderPhoto: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <Label>ID Billet (optionnel)</Label>
              <Input value={badgeForm.ticketId} onChange={e => setBadgeForm(p => ({ ...p, ticketId: e.target.value }))} placeholder="Lier à un billet existant" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setBadgeDialog(false)}>Annuler</Button>
              <Button className="flex-1" onClick={handleGenerateBadge}
                disabled={!badgeForm.categoryId || !badgeForm.holderName.trim() || !badgeForm.holderEmail.trim()}>
                Générer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog QR Code ──────────────────────────────────────────────────────── */}
      <Dialog open={qrDialog.open} onOpenChange={(o) => { setQrDialog(p => ({ ...p, open: o })); if (!o) setRotatingMode(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Badge QR — {qrDialog.badge?.holderName}</DialogTitle>
          </DialogHeader>
          {qrDialog.badge && (
            <div className="flex flex-col items-center gap-4 pt-2">
              <div className="relative p-4 bg-white rounded-xl border-2 border-gray-200">
                <QRCodeSVG
                  value={rotatingMode && rotatingQrData ? rotatingQrData.qr : qrDialog.badge.qrCode}
                  size={200} level="M"
                />
                {rotatingMode && rotatingCountdown > 0 && (
                  <div className="absolute bottom-2 right-2 bg-indigo-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                    {rotatingCountdown}s
                  </div>
                )}
              </div>

              {/* Toggle mode rotatif */}
              {qrDialog.badge.status === 'active' && (
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    rotatingMode
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setRotatingMode(p => !p)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {rotatingMode ? `QR rotatif actif (${rotatingCountdown}s)` : 'Activer QR rotatif anti-fraude'}
                </button>
              )}

              <div className="text-center text-sm text-gray-600">
                {qrDialog.badge.holderPhoto && (
                  <img src={qrDialog.badge.holderPhoto} alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border" />
                )}
                <p className="font-semibold">{qrDialog.badge.holderName}</p>
                <p className="text-gray-500">{qrDialog.badge.category?.name}</p>
                {qrDialog.badge.holderPhone && <p className="text-gray-400">{qrDialog.badge.holderPhone}</p>}
              </div>
              <Badge variant={
                qrDialog.badge.status === 'active' ? 'default' :
                qrDialog.badge.status === 'revoked' ? 'destructive' : 'secondary'
              }>
                {qrDialog.badge.status === 'active' ? 'Actif' : qrDialog.badge.status === 'revoked' ? 'Révoqué' : 'Expiré'}
              </Badge>
              {!rotatingMode && (
                <button
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                  onClick={() => { navigator.clipboard.writeText(qrDialog.badge!.qrCode); toast.success('Données copiées'); }}>
                  <Copy className="w-3 h-3" />Copier les données QR
                </button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FeetiAccessDashboard;
