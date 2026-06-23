import { useState, useMemo, useEffect, useRef } from 'react';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Users,
  Calendar,
  Ticket,
  CreditCard,
  MessageSquare,
  BarChart3,
  Video,
  Settings,
  Shield,
  UserPlus,
  Eye,
  Trash2,
  Plus,
  Search,
  Filter,
  Mail,
  DollarSign,
  MapPin,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  Lock,
  Key,
  Globe,
  Tag,
  Gift,
  Loader2,
  Percent,
  Edit2,
  Upload,
  ImageIcon,
  Star,
  Clock3,
  Truck,
  TrendingUp,
  AlertTriangle,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { firebaseClientErrorToUserMessage } from '../../utils/firebaseUserFacingError';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig.js';
import EventsBackendAPI, { type BackendEvent } from '../../services/api/EventsBackendAPI';
import AdminAPI, { type AdminUser, type TicketStats, type AdminTicket } from '../../services/api/AdminAPI';
import CategoriesAPI, { type Category as EventCategory } from '../../services/api/CategoriesAPI';
import AuthAPI from '../../services/api/AuthAPI';
import DealsBackendAPI, { type BackendDeal, type DealInput, type DealCategory } from '../../services/api/DealsBackendAPI';
import LeisureAPI, { type LeisureItem as BackendLeisureItem, type LeisureCategory as BackendLeisureCategory, type LeisureItemInput } from '../../services/api/LeisureAPI';
import BlogAPI, { type BlogPost as ApiBlogPost, type BlogCategory as ApiBlogCategory, type BlogStats, parseTags } from '../../services/api/BlogAPI';
import { BookOpen } from 'lucide-react';
import DeliveryAPI, { type DeliveryZone, type DeliveryCity } from '../../services/api/DeliveryAPI';
import CountryAPI, { type Country } from '../../services/api/CountryAPI';
import SettingsAPI, { type PlatformSettings } from '../../services/api/SettingsAPI';
import PromotionAPI, { type PackConfig, type PromotionPurchase, type AdminPromotionStats } from '../../services/api/PromotionAPI';
import NotificationsAPI from '../../services/api/NotificationsAPI';
import type { EstablishmentPricing, EstablishmentSubscription as EOwnerSubscription, DealPayment as EOwnerDealPayment } from '../../services/api/EstablishmentOwnerAPI';

type Event = BackendEvent;

// ── Types promotion ───────────────────────────────────────────────────────────
type EventPromotionType = 'OR' | 'ARGENT' | 'BRONZE' | 'LITE';

const EVENT_PROMO_CONFIG: Record<EventPromotionType, { label: string; color: string; limit: number; duration: string }> = {
  OR:     { label: 'Pack OR',     color: 'bg-yellow-400 text-yellow-900',  limit: 2,     duration: 'Jusqu\'à 60 jours' },
  ARGENT: { label: 'Pack ARGENT', color: 'bg-slate-300 text-slate-800',    limit: 5,     duration: '45 à 60 jours' },
  BRONZE: { label: 'Pack BRONZE', color: 'bg-orange-400 text-white',       limit: 10,    duration: '30 à 45 jours' },
  LITE:   { label: 'Pack LITE',   color: 'bg-blue-100 text-blue-800',      limit: 9999,  duration: '15 à 30 jours' },
};

// ── Suivi des achats de promotion (self-service) ──────────────────────────────
function PromotionSuiviTab() {
  const [purchases, setPurchases] = useState<PromotionPurchase[]>([]);
  const [stats, setStats] = useState<AdminPromotionStats | null>(null);
  const [filterPack, setFilterPack] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [deactivating, setDeactivating] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      PromotionAPI.adminGetPromotions({ packType: filterPack || undefined, status: filterStatus || undefined }),
      PromotionAPI.adminGetStats(),
    ])
      .then(([res, s]) => { setPurchases(res.data); setStats(s); })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterPack, filterStatus]);

  const handleDeactivate = async (id: string) => {
    setDeactivating(id);
    try {
      await PromotionAPI.adminDeactivate(id, 'Désactivé manuellement par l\'admin');
      toast.success('Promotion désactivée');
      load();
    } catch {
      toast.error('Erreur lors de la désactivation');
    } finally {
      setDeactivating(null);
    }
  };

  const formatPrice = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
  const formatDate = (s: string) => new Date(s).toLocaleDateString('fr-FR');

  const PACK_BADGE: Record<string, string> = {
    OR: 'bg-amber-100 text-amber-800', ARGENT: 'bg-slate-100 text-slate-700',
    BRONZE: 'bg-orange-100 text-orange-800', LITE: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-gray-500">Revenus total</p>
              <p className="text-xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-gray-500">Ce mois</p>
              <p className="text-xl font-bold text-gray-900">{formatPrice(stats.monthRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-gray-500">Actives en cours</p>
              <p className="text-xl font-bold text-gray-900">{stats.activePurchases}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-gray-500">Répartition</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {stats.byPack.map(b => (
                  <span key={b.packType} className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PACK_BADGE[b.packType] ?? ''}`}>
                    {b.packType} ×{b.count}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterPack}
          onChange={e => setFilterPack(e.target.value)}
          className="text-sm border rounded-lg px-3 py-1.5 bg-white text-gray-700"
        >
          <option value="">Tous les packs</option>
          {['OR', 'ARGENT', 'BRONZE', 'LITE'].map(p => (
            <option key={p} value={p}>Pack {p}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border rounded-lg px-3 py-1.5 bg-white text-gray-700"
        >
          <option value="">Tous les statuts</option>
          <option value="completed">Actif</option>
          <option value="cancelled">Annulé</option>
          <option value="refunded">Remboursé</option>
        </select>
        <Button variant="outline" size="sm" onClick={load}>Actualiser</Button>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Chargement...</div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Aucune promotion trouvée</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Événement</th>
                <th className="text-left px-4 py-3">Organisateur</th>
                <th className="text-left px-4 py-3">Pack</th>
                <th className="text-left px-4 py-3">Montant</th>
                <th className="text-left px-4 py-3">Période</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchases.map(p => {
                const now = new Date();
                const endDate = new Date(p.promotionEndDate);
                const isExpired = endDate < now;
                const daysLeft = isExpired ? 0 : Math.ceil((endDate.getTime() - now.getTime()) / 86400000);

                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 line-clamp-1">
                        {p.event?.title ?? p.eventId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{p.organizer?.name}</p>
                        <p className="text-xs text-gray-400">{p.organizer?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PACK_BADGE[p.packType] ?? ''}`}>
                        {p.packType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(p.pricePaid)}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600">
                        <div>{formatDate(p.promotionStartDate)}</div>
                        <div className="text-gray-400">→ {formatDate(p.promotionEndDate)}</div>
                        {!isExpired && p.status === 'completed' && (
                          <div className="text-green-600 font-medium">{daysLeft}j restant{daysLeft > 1 ? 's' : ''}</div>
                        )}
                        {isExpired && <div className="text-gray-400">Expiré</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === 'completed' ? 'bg-green-100 text-green-700' :
                        p.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {p.status === 'completed' ? 'Actif' : p.status === 'cancelled' ? 'Annulé' : p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'completed' && !isExpired && (
                        <button
                          onClick={() => handleDeactivate(p.id)}
                          disabled={deactivating === p.id}
                          className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                        >
                          {deactivating === p.id ? 'En cours...' : 'Désactiver'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Configuration des packs (prix, description, avantages) ───────────────────
function PackConfigTab() {
  const [configs, setConfigs] = useState<PackConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PackConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    price: 0, description: '', advantages: [] as string[], durationDays: 30,
  });
  const [newAdvantage, setNewAdvantage] = useState('');

  useEffect(() => {
    PromotionAPI.adminGetPackConfigs()
      .then(setConfigs)
      .catch(() => toast.error('Erreur de chargement des configs'))
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (cfg: PackConfig) => {
    setEditing(cfg);
    setForm({
      price: cfg.price,
      description: cfg.description,
      advantages: [...cfg.advantages],
      durationDays: cfg.durationDays,
    });
    setNewAdvantage('');
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await PromotionAPI.adminUpdatePackConfig(editing.type, form);
      setConfigs(prev => prev.map(c => c.type === editing.type ? updated : c));
      setEditing(null);
      toast.success(`Pack ${editing.type} mis à jour`);
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const addAdvantage = () => {
    if (!newAdvantage.trim()) return;
    setForm(f => ({ ...f, advantages: [...f.advantages, newAdvantage.trim()] }));
    setNewAdvantage('');
  };

  const removeAdvantage = (i: number) => {
    setForm(f => ({ ...f, advantages: f.advantages.filter((_, idx) => idx !== i) }));
  };

  const PACK_BORDER: Record<string, string> = {
    OR: 'border-amber-400', ARGENT: 'border-slate-400', BRONZE: 'border-orange-400', LITE: 'border-blue-400',
  };
  const PACK_BADGE: Record<string, string> = {
    OR: 'bg-amber-100 text-amber-800', ARGENT: 'bg-slate-100 text-slate-700',
    BRONZE: 'bg-orange-100 text-orange-800', LITE: 'bg-blue-100 text-blue-700',
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Chargement...</div>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Configurez le prix, la description commerciale et les avantages de chaque pack.
        Ces informations sont affichées aux organisateurs lors de l'achat.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {configs.map(cfg => (
          <div key={cfg.type} className={`rounded-xl border-2 p-5 ${PACK_BORDER[cfg.type] ?? 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${PACK_BADGE[cfg.type] ?? ''}`}>
                Pack {cfg.type}
              </span>
              <button
                onClick={() => openEdit(cfg)}
                className="text-xs text-gray-500 hover:text-gray-800 font-medium border border-gray-200 rounded-lg px-3 py-1 transition-colors"
              >
                Modifier
              </button>
            </div>
            <p className="text-xl font-bold text-gray-900 mb-1">
              {new Intl.NumberFormat('fr-FR').format(cfg.price)} {cfg.currency}
            </p>
            <p className="text-xs text-gray-500 mb-1">{cfg.durationDays} jours</p>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{cfg.description || <em className="text-gray-400">Aucune description</em>}</p>
            <ul className="space-y-1">
              {cfg.advantages.map((a, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{a}</span>
                </li>
              ))}
              {cfg.advantages.length === 0 && (
                <li className="text-xs text-gray-400 italic">Aucun avantage défini</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      {/* Modal d'édition */}
      <Dialog open={!!editing} onOpenChange={v => !v && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier Pack {editing?.type}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Prix (FCFA)</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Durée (jours)</Label>
                  <Input
                    type="number"
                    value={form.durationDays}
                    onChange={e => setForm(f => ({ ...f, durationDays: parseInt(e.target.value) || 1 }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Description commerciale</Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="mt-1 text-sm"
                  rows={3}
                  placeholder="Texte affiché aux organisateurs lors du choix du pack..."
                />
              </div>

              <div>
                <Label className="text-xs mb-2 block">Avantages</Label>
                <ul className="space-y-1 mb-3">
                  {form.advantages.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                      <span className="text-green-500 text-xs">✓</span>
                      <span className="text-sm flex-1">{a}</span>
                      <button
                        onClick={() => removeAdvantage(i)}
                        className="text-red-400 hover:text-red-600 text-xs font-medium"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Input
                    value={newAdvantage}
                    onChange={e => setNewAdvantage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAdvantage())}
                    placeholder="Ajouter un avantage..."
                    className="text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={addAdvantage}>Ajouter</Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Composant gestion des promotions Bon Plans ───────────────────────────────
function DealPromotionsTab({ deals }: { deals: BackendDeal[] }) {
  const [slots, setSlots] = useState<Array<{ type: string; limit: number; used: number; available: number }>>([]);
  const [selectedDeal, setSelectedDeal] = useState<BackendDeal | null>(null);
  const [promoForm, setPromoForm] = useState({
    promotionType: '' as EventPromotionType | '',
    promotionStatus: 'active' as 'active' | 'inactive',
    promotionStartDate: '',
    promotionEndDate: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AdminAPI.getDealPromotionSlots().then(setSlots).catch(() => {});
  }, []);

  const openPromo = (deal: BackendDeal) => {
    setSelectedDeal(deal);
    setPromoForm({
      promotionType: (deal.promotionType as EventPromotionType) || '',
      promotionStatus: deal.promotionStatus === 'active' ? 'active' : 'inactive',
      promotionStartDate: deal.promotionStartDate ? deal.promotionStartDate.slice(0, 10) : '',
      promotionEndDate: deal.promotionEndDate ? deal.promotionEndDate.slice(0, 10) : '',
    });
  };

  const handleSavePromo = async () => {
    if (!selectedDeal) return;
    setSaving(true);
    try {
      await AdminAPI.updateDealPromotion(selectedDeal.id, {
        promotionType: promoForm.promotionType || null,
        promotionStatus: promoForm.promotionStatus,
        promotionStartDate: promoForm.promotionStartDate || null,
        promotionEndDate: promoForm.promotionEndDate || null,
      });
      toast.success('Promotion bon plan mise à jour');
      setSelectedDeal(null);
      AdminAPI.getDealPromotionSlots().then(setSlots).catch(() => {});
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const PACK_BADGE: Record<string, string> = {
    OR: 'bg-amber-100 text-amber-800', ARGENT: 'bg-slate-100 text-slate-700',
    BRONZE: 'bg-orange-100 text-orange-800', LITE: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des promotions Bon Plans</CardTitle>
          <CardDescription>Attribuer un pack promotionnel à un bon plan pour le mettre en avant sur la homepage</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Jauges slots */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {slots.map(slot => (
              <div key={slot.type} className="bg-gray-50 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PACK_BADGE[slot.type] ?? ''}`}>
                    {slot.type}
                  </span>
                  <span className="text-xs text-gray-500">{slot.used}/{slot.limit === 9999 ? '∞' : slot.limit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full transition-all"
                    style={{ width: slot.limit === 9999 ? '10%' : `${Math.min(100, (slot.used / slot.limit) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Liste des deals */}
          <div className="space-y-2">
            {deals.filter(d => d.status === 'published').map(deal => {
              const isActive = deal.promotionStatus === 'active';
              return (
                <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{deal.title}</p>
                    <p className="text-xs text-gray-500">{deal.merchantName} · -{deal.discount}%</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    {isActive && deal.promotionType && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PACK_BADGE[deal.promotionType] ?? ''}`}>
                        {deal.promotionType}
                      </span>
                    )}
                    <button
                      onClick={() => openPromo(deal)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 rounded-lg px-3 py-1"
                    >
                      {isActive ? 'Modifier' : 'Promouvoir'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog promotion */}
      <Dialog open={!!selectedDeal} onOpenChange={v => !v && setSelectedDeal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pack promotionnel — {selectedDeal?.title}</DialogTitle>
          </DialogHeader>
          {selectedDeal && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs mb-1 block">Type de pack</Label>
                <Select
                  value={promoForm.promotionType || 'none'}
                  onValueChange={v => setPromoForm(f => ({ ...f, promotionType: v === 'none' ? '' : v as EventPromotionType }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun pack</SelectItem>
                    {(['OR', 'ARGENT', 'BRONZE', 'LITE'] as EventPromotionType[]).map(t => (
                      <SelectItem key={t} value={t}>Pack {t} — {EVENT_PROMO_CONFIG[t].duration}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {promoForm.promotionType && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1 block">Début</Label>
                      <Input type="date" value={promoForm.promotionStartDate}
                        onChange={e => setPromoForm(f => ({ ...f, promotionStartDate: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Fin</Label>
                      <Input type="date" value={promoForm.promotionEndDate}
                        onChange={e => setPromoForm(f => ({ ...f, promotionEndDate: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Statut</Label>
                    <Select value={promoForm.promotionStatus}
                      onValueChange={v => setPromoForm(f => ({ ...f, promotionStatus: v as 'active' | 'inactive' }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setSelectedDeal(null)}>Annuler</Button>
            <Button onClick={handleSavePromo} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Composant gestion des promotions ─────────────────────────────────────────
function PromotionsTab({ events }: { events: Event[] }) {
  const [slots, setSlots] = useState<Array<{ type: string; limit: number; used: number; available: number }>>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [promoForm, setPromoForm] = useState({
    promotionType: '' as EventPromotionType | '',
    promotionStatus: 'active' as 'active' | 'inactive',
    promotionStartDate: '',
    promotionEndDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    EventsBackendAPI.getPromotionSlots().then(setSlots).catch(() => {});
  }, []);

  const openDialog = (event: Event) => {
    setSelectedEvent(event);
    setPromoForm({
      promotionType: (event.promotionType as EventPromotionType) || '',
      promotionStatus: (event.promotionStatus === 'active' ? 'active' : 'inactive'),
      promotionStartDate: event.promotionStartDate ? event.promotionStartDate.slice(0, 10) : '',
      promotionEndDate: event.promotionEndDate ? event.promotionEndDate.slice(0, 10) : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedEvent) return;
    setSaving(true);
    try {
      await EventsBackendAPI.updatePromotion(selectedEvent.id, {
        promotionType: promoForm.promotionType || null,
        promotionStatus: promoForm.promotionStatus,
        promotionStartDate: promoForm.promotionStartDate || null,
        promotionEndDate: promoForm.promotionEndDate || null,
      });
      toast.success('Promotion mise à jour');
      setDialogOpen(false);
      // Refresh slots
      EventsBackendAPI.getPromotionSlots().then(setSlots).catch(() => {});
    } catch (e: any) {
      toast.error(firebaseClientErrorToUserMessage(e, 'Erreur lors de la mise à jour'));
    } finally {
      setSaving(false);
    }
  };

  const publishedEvents = events.filter(e => e.status === 'published');

  return (
    <div className="space-y-6">
      {/* Slots disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Slots disponibles par pack
          </CardTitle>
          <CardDescription>Nombre d'événements promus simultanément par catégorie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['OR', 'ARGENT', 'BRONZE', 'LITE'] as EventPromotionType[]).map(type => {
              const config = EVENT_PROMO_CONFIG[type];
              const slot = slots.find(s => s.type === type);
              const used = slot?.used ?? 0;
              const limit = config.limit === 9999 ? '∞' : config.limit;
              return (
                <div key={type} className="border rounded-xl p-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${config.color}`}>
                    {config.label}
                  </span>
                  <p className="text-2xl font-bold text-gray-900">{used} / {limit}</p>
                  <p className="text-xs text-gray-500 mt-1">{config.duration}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Table événements */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des promotions événements</CardTitle>
          <CardDescription>Attribuer ou retirer un pack promotionnel à un événement publié</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Événement</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Pack actif</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publishedEvents.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Aucun événement publié</TableCell></TableRow>
              )}
              {publishedEvents.map(event => {
                const packConfig = event.promotionType ? EVENT_PROMO_CONFIG[event.promotionType as EventPromotionType] : null;
                const isActive = event.promotionStatus === 'active';
                return (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{event.title}</TableCell>
                    <TableCell><Badge variant="outline">{event.category}</Badge></TableCell>
                    <TableCell>
                      {packConfig && isActive ? (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${packConfig.color}`}>
                          {packConfig.label}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Aucun</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {event.promotionStartDate && event.promotionEndDate
                        ? `${new Date(event.promotionStartDate).toLocaleDateString('fr-FR')} → ${new Date(event.promotionEndDate).toLocaleDateString('fr-FR')}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openDialog(event)}>
                        <Edit2 className="w-3 h-3 mr-1" /> Gérer
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog attribution pack */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attribuer un pack promotionnel</DialogTitle>
            <DialogDescription className="line-clamp-1">{selectedEvent?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Type de pack</Label>
              <Select
                value={promoForm.promotionType || 'none'}
                onValueChange={(v: string) => setPromoForm(f => ({ ...f, promotionType: (v === 'none' ? '' : v) as EventPromotionType | '' }))}
              >
                <SelectTrigger><SelectValue placeholder="Sélectionner un pack" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {(['OR', 'ARGENT', 'BRONZE', 'LITE'] as EventPromotionType[]).map(type => (
                    <SelectItem key={type} value={type}>{EVENT_PROMO_CONFIG[type].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {promoForm.promotionType && (
              <>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  {EVENT_PROMO_CONFIG[promoForm.promotionType].label} — {EVENT_PROMO_CONFIG[promoForm.promotionType].duration}
                </div>
                <div>
                  <Label>Statut</Label>
                  <Select
                    value={promoForm.promotionStatus}
                    onValueChange={(v: string) => setPromoForm(f => ({ ...f, promotionStatus: v as 'active' | 'inactive' }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Date début</Label>
                    <Input type="date" value={promoForm.promotionStartDate} onChange={e => setPromoForm(f => ({ ...f, promotionStartDate: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Date fin</Label>
                    <Input type="date" value={promoForm.promotionEndDate} onChange={e => setPromoForm(f => ({ ...f, promotionEndDate: e.target.value }))} />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Types promotion loisirs ───────────────────────────────────────────────────
type LeisureOfferTypeAdmin = 'BASIC' | 'PRO' | 'PREMIUM';
type LeisurePackTypeAdmin = 'VISIBILITE_ACCUEIL' | 'BOOST' | 'CAMPAGNE_PREMIUM';

const LEISURE_OFFER_CONFIG: Record<LeisureOfferTypeAdmin, { label: string; color: string }> = {
  BASIC:   { label: 'BASIC',   color: 'bg-gray-100 text-gray-700' },
  PRO:     { label: 'PRO',     color: 'bg-emerald-100 text-emerald-800' },
  PREMIUM: { label: 'PREMIUM', color: 'bg-yellow-100 text-yellow-800' },
};

const LEISURE_PACK_CONFIG_ADMIN: Record<LeisurePackTypeAdmin, { label: string; color: string; limit: number }> = {
  VISIBILITE_ACCUEIL: { label: 'Visibilité Accueil', color: 'bg-teal-100 text-teal-800',   limit: 10 },
  BOOST:              { label: 'Boost',               color: 'bg-blue-100 text-blue-800',   limit: 5  },
  CAMPAGNE_PREMIUM:   { label: 'Campagne Premium',    color: 'bg-purple-100 text-purple-800', limit: 3 },
};

// ── Composant gestion des promotions loisirs ──────────────────────────────────
function LeisurePromotionsTab() {
  const [items, setItems] = useState<BackendLeisureItem[]>([]);
  const [slots, setSlots] = useState<Array<{ type: string; limit: number; used: number; available: number }>>([]);
  const [selectedItem, setSelectedItem] = useState<BackendLeisureItem | null>(null);
  const [form, setForm] = useState({
    leisureOfferType: '' as LeisureOfferTypeAdmin | '',
    leisurePackType: '' as LeisurePackTypeAdmin | '',
    leisurePackStatus: 'active' as 'active' | 'inactive',
    leisurePackStartDate: '',
    leisurePackEndDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    LeisureAPI.getAllAdmin().then(setItems).catch(() => {});
    LeisureAPI.getLeisurePromotionSlots().then(setSlots).catch(() => {});
  }, []);

  // Auto-calcul de la date de fin à J+7 quand la date de début change
  const handleStartDateChange = (value: string) => {
    const end = value ? new Date(new Date(value).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : '';
    setForm(f => ({ ...f, leisurePackStartDate: value, leisurePackEndDate: end }));
  };

  const openDialog = (item: BackendLeisureItem) => {
    setSelectedItem(item);
    setForm({
      leisureOfferType: (item.leisureOfferType as LeisureOfferTypeAdmin) || '',
      leisurePackType: (item.leisurePackType as LeisurePackTypeAdmin) || '',
      leisurePackStatus: item.leisurePackStatus === 'active' ? 'active' : 'inactive',
      leisurePackStartDate: item.leisurePackStartDate ? item.leisurePackStartDate.slice(0, 10) : '',
      leisurePackEndDate: item.leisurePackEndDate ? item.leisurePackEndDate.slice(0, 10) : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    setSaving(true);
    try {
      await LeisureAPI.updatePromotion(selectedItem.id, {
        leisureOfferType: (form.leisureOfferType || null) as any,
        leisurePackType: (form.leisurePackType || null) as any,
        leisurePackStatus: form.leisurePackStatus,
        leisurePackStartDate: form.leisurePackStartDate || null,
        leisurePackEndDate: form.leisurePackEndDate || null,
      });
      toast.success('Promotion loisir mise à jour');
      setDialogOpen(false);
      LeisureAPI.getAllAdmin().then(setItems).catch(() => {});
      LeisureAPI.getLeisurePromotionSlots().then(setSlots).catch(() => {});
    } catch (e: any) {
      toast.error(firebaseClientErrorToUserMessage(e, 'Erreur lors de la mise à jour'));
    } finally {
      setSaving(false);
    }
  };

  const publishedItems = items.filter(i => i.status === 'published');

  return (
    <div className="space-y-6">
      {/* Slots packs ponctuels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-500" />
            Slots disponibles — Packs ponctuels loisirs (7 jours)
          </CardTitle>
          <CardDescription>Nombre d'établissements promus simultanément par pack</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['CAMPAGNE_PREMIUM', 'BOOST', 'VISIBILITE_ACCUEIL'] as LeisurePackTypeAdmin[]).map(type => {
              const config = LEISURE_PACK_CONFIG_ADMIN[type];
              const slot = slots.find(s => s.type === type);
              const used = slot?.used ?? 0;
              return (
                <div key={type} className="border rounded-xl p-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${config.color}`}>
                    {config.label}
                  </span>
                  <p className="text-2xl font-bold text-gray-900">{used} / {config.limit}</p>
                  <p className="text-xs text-gray-500 mt-1">7 jours · max {config.limit} simultanés</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Table établissements */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des promotions loisirs</CardTitle>
          <CardDescription>Attribuer une offre annuaire et/ou un pack ponctuel à un établissement</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Établissement</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Offre annuaire</TableHead>
                <TableHead>Pack actif</TableHead>
                <TableHead>Dates pack</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publishedItems.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucun établissement publié</TableCell></TableRow>
              )}
              {publishedItems.map(item => {
                const offerCfg = item.leisureOfferType ? LEISURE_OFFER_CONFIG[item.leisureOfferType as LeisureOfferTypeAdmin] : null;
                const packCfg = item.leisurePackType ? LEISURE_PACK_CONFIG_ADMIN[item.leisurePackType as LeisurePackTypeAdmin] : null;
                const packActive = item.leisurePackStatus === 'active';
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-[180px] truncate">{item.name}</TableCell>
                    <TableCell><Badge variant="outline">{item.category?.name ?? item.categorySlug}</Badge></TableCell>
                    <TableCell>
                      {offerCfg ? (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${offerCfg.color}`}>{offerCfg.label}</span>
                      ) : <span className="text-gray-400 text-xs">Aucune</span>}
                    </TableCell>
                    <TableCell>
                      {packCfg && packActive ? (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${packCfg.color}`}>{packCfg.label}</span>
                      ) : <span className="text-gray-400 text-xs">Aucun</span>}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {item.leisurePackStartDate && item.leisurePackEndDate
                        ? `${new Date(item.leisurePackStartDate).toLocaleDateString('fr-FR')} → ${new Date(item.leisurePackEndDate).toLocaleDateString('fr-FR')}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openDialog(item)}>
                        <Edit2 className="w-3 h-3 mr-1" /> Gérer
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog attribution */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attribuer une promotion loisir</DialogTitle>
            <DialogDescription className="line-clamp-1">{selectedItem?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Offre annuaire */}
            <div>
              <Label>Offre annuaire</Label>
              <Select
                value={form.leisureOfferType || 'none'}
                onValueChange={(v: string) => setForm(f => ({ ...f, leisureOfferType: (v === 'none' ? '' : v) as LeisureOfferTypeAdmin | '' }))}
              >
                <SelectTrigger><SelectValue placeholder="Sélectionner une offre" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {(['BASIC', 'PRO', 'PREMIUM'] as LeisureOfferTypeAdmin[]).map(type => (
                    <SelectItem key={type} value={type}>{LEISURE_OFFER_CONFIG[type].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pack ponctuel */}
            <div>
              <Label>Pack ponctuel (7 jours)</Label>
              <Select
                value={form.leisurePackType || 'none'}
                onValueChange={(v: string) => setForm(f => ({ ...f, leisurePackType: (v === 'none' ? '' : v) as LeisurePackTypeAdmin | '' }))}
              >
                <SelectTrigger><SelectValue placeholder="Sélectionner un pack" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {(['VISIBILITE_ACCUEIL', 'BOOST', 'CAMPAGNE_PREMIUM'] as LeisurePackTypeAdmin[]).map(type => (
                    <SelectItem key={type} value={type}>{LEISURE_PACK_CONFIG_ADMIN[type].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.leisurePackType && (
              <>
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-800">
                  {LEISURE_PACK_CONFIG_ADMIN[form.leisurePackType].label} — 7 jours · max {LEISURE_PACK_CONFIG_ADMIN[form.leisurePackType].limit} simultanés
                </div>
                <div>
                  <Label>Statut du pack</Label>
                  <Select
                    value={form.leisurePackStatus}
                    onValueChange={(v: string) => setForm(f => ({ ...f, leisurePackStatus: v as 'active' | 'inactive' }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Date début</Label>
                    <Input
                      type="date"
                      value={form.leisurePackStartDate}
                      onChange={e => handleStartDateChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Date fin <span className="text-xs text-gray-400">(auto J+7)</span></Label>
                    <Input
                      type="date"
                      value={form.leisurePackEndDate}
                      onChange={e => setForm(f => ({ ...f, leisurePackEndDate: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface AdminDashboardProps {
  currentUser: any;
  onBack: () => void;
}

const COLORS = ['#4338ca', '#059669', '#dc2626', '#ea580c', '#7c3aed', '#0891b2', '#be123c'];



// ── Finance types (payments tab) ──────────────────────────────────────
interface FinanceFlux {
  totalEntrees: number; totalTVACollectee: number;
  totalCommissions: number; totalVersesOrganisateurs: number; soldesPlateforme: number;
}
interface FinanceDashboard {
  fluxFinanciers: FinanceFlux;
  topOrganisateurs: Array<{ organizerId: string; nom: string; totalTransactions: number; totalTTC: number; totalNet: number }>;
  transactionsEnLitige: number;
  alertes: string[];
  repartitionParStatut: Array<{ status: string; count: number; totalTTC: number }>;
}
interface TVAReport {
  periode: { debut: string; fin: string; label: string };
  totalTTC: number; totalHT: number; totalTVA: number; nombreTransactions: number;
  parTaux: Array<{ tauxTVA: string; devise: string; totalHT: number; totalTVA: number; totalTTC: number; nombre: number }>;
}
interface FinancePayout {
  id: string; organizerId: string;
  organizer: { name: string; email: string };
  montant: number; devise: string; methodePaiement: string;
  statut: string; initiatedAt: string;
  approvedAt?: string; completedAt?: string;
  _count?: { transactions: number };
}
interface AuditEntry {
  id: string; userId: string; userRole: string; action: string;
  resource: string; resourceId?: string; ipAddress?: string; createdAt: string;
}
const fmtCfa = (c: number) => `${(c / 100).toLocaleString('fr-FR')} XOF`;
const STATUS_LABEL: Record<string, string> = {
  initiated: 'Initié', approved: 'Approuvé', processing: 'En cours',
  completed: 'Terminé', failed: 'Échoué', reversed: 'Annulé',
};
const STATUS_COLOR: Record<string, string> = {
  initiated: 'bg-yellow-100 text-yellow-800', approved: 'bg-blue-100 text-blue-800',
  processing: 'bg-cyan-100 text-cyan-800', completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800', reversed: 'bg-gray-100 text-gray-700',
};

export function AdminDashboard({ currentUser, onBack }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const tabsListRef = useRef<HTMLDivElement>(null);

  // Notification form state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifAllUsers, setNotifAllUsers] = useState(true);
  const [notifSending, setNotifSending] = useState(false);

  useEffect(() => {
    const container = tabsListRef.current;
    if (!container) return;
    const active = container.querySelector('[data-state="active"]') as HTMLElement | null;
    if (active) active.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'nearest', inline: 'nearest' });
  }, [activeTab]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [isViewEventOpen, setIsViewEventOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [rejectingEvent, setRejectingEvent] = useState<Event | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Real users from backend
  const [realUsers, setRealUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState('');

  const viewingOrganizer = useMemo(
    () => viewingEvent ? realUsers.find(u => u.id === viewingEvent.organizerId) : undefined,
    [viewingEvent, realUsers]
  );

  // ── Finance / Payments tab ──────────────────────────────────────────
  const [financeDashboard, setFinanceDashboard] = useState<FinanceDashboard | null>(null);
  const [financeTVA, setFinanceTVA] = useState<TVAReport | null>(null);
  const [financePayouts, setFinancePayouts] = useState<FinancePayout[]>([]);
  const [financeAudit, setFinanceAudit] = useState<AuditEntry[]>([]);
  const [financeLoading, setFinanceLoading] = useState(false);

  const loadFinanceData = async () => {
    if (financeLoading) return;
    setFinanceLoading(true);
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const params = new URLSearchParams({
        dateFrom: firstDay.toISOString().slice(0, 10),
        dateTo: now.toISOString().slice(0, 10),
      });
      const [dashRes, tvaRes, payoutsRes, auditRes] = await Promise.all([
        axiosInstance.get(`/reporting/admin/dashboard?${params}`),
        axiosInstance.get(`/reporting/tva?${params}`),
        axiosInstance.get('/payouts?limit=10'),
        axiosInstance.get(`/reporting/audit?${params}&limit=10`),
      ]);
      setFinanceDashboard(dashRes.data.data);
      setFinanceTVA(tvaRes.data.data);
      setFinancePayouts(payoutsRes.data.data ?? []);
      setFinanceAudit(auditRes.data.data ?? []);
    } catch (err) {
      console.error('Erreur chargement finance:', err);
    } finally {
      setFinanceLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'payments') { loadFinanceData(); }
    if (activeTab === 'settings') { loadSettingsAudit(); loadPlatformSettings(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Sales trends (Évolution des ventes)
  const [salesTrends, setSalesTrends] = useState<Array<{ mois: string; label: string; totalTTC: number; net: number; count: number }>>([]);
  const [salesTrendsLoading, setSalesTrendsLoading] = useState(false);

  const loadSalesTrends = async () => {
    setSalesTrendsLoading(true);
    try {
      const res = await axiosInstance.get('/reporting/tendances?mois=6');
      setSalesTrends(res.data.data ?? []);
    } catch { /* silently fail */ }
    finally { setSalesTrendsLoading(false); }
  };

  // Tickets tab state
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
  const [adminTickets, setAdminTickets] = useState<AdminTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const loadTicketsData = async () => {
    setTicketsLoading(true);
    try {
      const [stats, tickets] = await Promise.all([
        AdminAPI.getTicketsStats(),
        AdminAPI.getTickets(20),
      ]);
      setTicketStats(stats);
      setAdminTickets(tickets);
    } catch { toast.error('Erreur chargement billets'); }
    finally { setTicketsLoading(false); }
  };

  // Settings audit log
  const [settingsAudit, setSettingsAudit] = useState<AuditEntry[]>([]);
  const [settingsAuditLoading, setSettingsAuditLoading] = useState(false);

  const loadSettingsAudit = async () => {
    if (settingsAudit.length > 0) return;
    setSettingsAuditLoading(true);
    try {
      const res = await axiosInstance.get('/reporting/audit?limit=10');
      setSettingsAudit(res.data.data ?? []);
    } catch { /* silently fail */ }
    finally { setSettingsAuditLoading(false); }
  };

  const loadPlatformSettings = async () => {
    if (settingsLoaded) return;
    try {
      const data = await SettingsAPI.get();
      setSettingsForm(data);
      setSettingsLoaded(true);
    } catch { /* silently fail */ }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const updated = await SettingsAPI.update(settingsForm);
      setSettingsForm(updated);
      toast.success('Paramètres enregistrés');
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setSettingsSaving(false); }
  };

  const handlePayoutAction = async (payoutId: string, action: 'approve' | 'execute' | 'confirm' | 'cancel') => {
    try {
      if (action === 'cancel') {
        const raison = window.prompt('Raison de l\'annulation ?');
        if (!raison) return;
        await axiosInstance.delete(`/payouts/${payoutId}`, { data: { raison } });
      } else {
        await axiosInstance.post(`/payouts/${payoutId}/${action}`);
      }
      toast.success(`Action "${action}" effectuée`);
      loadFinanceData();
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, `Erreur lors de l'action ${action}`));
    }
  };

  // Event categories management (DB-backed)
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  const [eventCatLoading, setEventCatLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '' });
  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null);

  const loadEventCategories = async () => {
    setEventCatLoading(true);
    try {
      const data = await CategoriesAPI.getAll();
      setEventCategories(data);
    } catch { /* silently fail */ }
    finally { setEventCatLoading(false); }
  };

  const handleAddCategory = async () => {
    const name = newCategory.name.trim();
    const slug = newCategory.slug.trim() || slugify(name);
    if (!name || !slug) { toast.error('Nom requis'); return; }
    setEventCatLoading(true);
    try {
      const created = await CategoriesAPI.create({ name, slug });
      setEventCategories(prev => [...prev, created]);
      setNewCategory({ name: '', slug: '' });
      toast.success(`Catégorie "${name}" ajoutée`);
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la création'));
    } finally { setEventCatLoading(false); }
  };

  const handleSaveEditCategory = async () => {
    if (!editingCategory) return;
    setEventCatLoading(true);
    try {
      const updated = await CategoriesAPI.update(editingCategory.id, { name: editingCategory.name, slug: editingCategory.slug });
      setEventCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
      setEditingCategory(null);
      toast.success('Catégorie mise à jour');
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la mise à jour'));
    } finally { setEventCatLoading(false); }
  };

  const handleDeleteCategory = async (cat: EventCategory) => {
    try {
      await CategoriesAPI.delete(cat.id);
      setEventCategories(prev => prev.filter(c => c.id !== cat.id));
      toast.success(`Catégorie "${cat.name}" supprimée`);
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la suppression'));
    }
  };

  // View user dialog
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);

  // Create user form
  const [createForm, setCreateForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'user'
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [createLoading, setCreateLoading] = useState(false);

  const validateCreateForm = () => {
    const errs: Record<string, string> = {};
    if (!createForm.name.trim() || createForm.name.trim().length < 2) errs.name = 'Nom requis (min. 2 caractères)';
    if (!createForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) errs.email = 'Email invalide';
    if (createForm.phone.trim() && !/^\+?[0-9]{8,15}$/.test(createForm.phone.trim())) errs.phone = 'Numéro invalide (8–15 chiffres)';
    if (!createForm.password) { errs.password = 'Mot de passe requis'; }
    else if (createForm.password.length < 8) errs.password = 'Au moins 8 caractères';
    else if (!/[A-Z]/.test(createForm.password)) errs.password = 'Au moins une majuscule';
    else if (!/[0-9]/.test(createForm.password)) errs.password = 'Au moins un chiffre';
    if (!createForm.confirmPassword) errs.confirmPassword = 'Confirmation requise';
    else if (createForm.confirmPassword !== createForm.password) errs.confirmPassword = 'Les mots de passe ne correspondent pas';
    return errs;
  };

  const handleCreateUser = async () => {
    const errs = validateCreateForm();
    if (Object.keys(errs).length > 0) { setCreateErrors(errs); return; }
    setCreateErrors({});
    setCreateLoading(true);
    try {
      await AuthAPI.register({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim() || undefined,
        password: createForm.password,
        role: createForm.role as 'user' | 'organizer',
      });
      toast.success('Utilisateur créé avec succès');
      setIsCreateUserOpen(false);
      setCreateForm({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'user' });
      loadUsers();
    } catch (err: any) {
      if (err?.errors) setCreateErrors(err.errors);
      else toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la création'));
    } finally {
      setCreateLoading(false);
    }
  };

  // Deal categories management
  const [dealCategories, setDealCategories] = useState<DealCategory[]>([]);
  const [newDealCategory, setNewDealCategory] = useState({ name: '', slug: '' });
  const [editingDealCategory, setEditingDealCategory] = useState<DealCategory | null>(null);
  const [dealCatLoading, setDealCatLoading] = useState(false);

  const loadDealCategories = async () => {
    try {
      const data = await DealsBackendAPI.getDealCategories();
      setDealCategories(data);
    } catch { /* silently fail */ }
  };

  const slugify = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleAddDealCategory = async () => {
    const name = newDealCategory.name.trim();
    const slug = newDealCategory.slug.trim() || slugify(name);
    if (!name || !slug) { toast.error('Nom requis'); return; }
    setDealCatLoading(true);
    try {
      const created = await DealsBackendAPI.createDealCategory({ name, slug });
      setDealCategories(prev => [...prev, created]);
      setNewDealCategory({ name: '', slug: '' });
      toast.success(`Catégorie "${name}" ajoutée`);
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la création'));
    } finally {
      setDealCatLoading(false);
    }
  };

  const handleUpdateDealCategory = async () => {
    if (!editingDealCategory) return;
    setDealCatLoading(true);
    try {
      const updated = await DealsBackendAPI.updateDealCategory(editingDealCategory.id, {
        name: editingDealCategory.name,
        slug: editingDealCategory.slug,
        icon: editingDealCategory.icon,
      });
      setDealCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
      setEditingDealCategory(null);
      toast.success('Catégorie mise à jour');
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la mise à jour'));
    } finally {
      setDealCatLoading(false);
    }
  };

  const handleDeleteDealCategory = async (cat: DealCategory) => {
    try {
      await DealsBackendAPI.deleteDealCategory(cat.id);
      setDealCategories(prev => prev.filter(c => c.id !== cat.id));
      toast.success(`Catégorie "${cat.name}" supprimée`);
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la suppression'));
    }
  };

  // Deals management
  const [deals, setDeals] = useState<BackendDeal[]>([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [isDealFormOpen, setIsDealFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<BackendDeal | null>(null);
  const [dealForm, setDealForm] = useState<DealInput>({
    title: '', description: '', category: 'general', originalPrice: 0,
    discountedPrice: 0, discount: 0, validUntil: '', location: '',
    image: '', isPopular: false, merchantName: '', tags: '[]',
    availableQuantity: undefined, maxQuantity: undefined, status: 'published', countryCode: 'all',
  });
  const [dealFormLoading, setDealFormLoading] = useState(false);
  const [dealImageFile, setDealImageFile] = useState<File | null>(null);
  const [dealImagePreview, setDealImagePreview] = useState('');
  const [viewingDeal, setViewingDeal] = useState<BackendDeal | null>(null);

  const loadDeals = async () => {
    setDealsLoading(true);
    try {
      const data = await DealsBackendAPI.getAllDealsAdmin();
      setDeals(data);
    } catch {
      toast.error('Erreur lors du chargement des bons plans');
    } finally {
      setDealsLoading(false);
    }
  };

  const openCreateDeal = () => {
    setEditingDeal(null);
    setDealForm({ title: '', description: '', category: 'general', originalPrice: 0, discountedPrice: 0, discount: 0, validUntil: '', location: '', image: '', isPopular: false, merchantName: '', tags: '[]', availableQuantity: undefined, maxQuantity: undefined, rating: undefined, reviewCount: undefined, contactPhone: undefined, contactEmail: undefined, contactWebsite: undefined, status: 'published', countryCode: 'all' });
    setDealImageFile(null);
    setDealImagePreview('');
    setIsDealFormOpen(true);
  };

  const openEditDeal = (deal: BackendDeal) => {
    setEditingDeal(deal);
    setDealForm({
      title: deal.title, description: deal.description, category: deal.category,
      originalPrice: deal.originalPrice, discountedPrice: deal.discountedPrice,
      discount: deal.discount, validUntil: deal.validUntil, location: deal.location,
      image: deal.image, isPopular: deal.isPopular, merchantName: deal.merchantName,
      tags: deal.tags, availableQuantity: deal.availableQuantity ?? undefined,
      maxQuantity: deal.maxQuantity ?? undefined, rating: deal.rating ?? undefined,
      reviewCount: deal.reviewCount ?? undefined, contactPhone: deal.contactPhone ?? undefined,
      contactEmail: deal.contactEmail ?? undefined, contactWebsite: deal.contactWebsite ?? undefined,
      status: deal.status, countryCode: deal.countryCode ?? 'all',
    });
    setDealImageFile(null);
    setDealImagePreview(deal.image || '');
    setIsDealFormOpen(true);
  };

  const handleSaveDeal = async () => {
    if (!dealForm.title || !dealForm.merchantName || !dealForm.validUntil || !dealForm.location) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setDealFormLoading(true);
    try {
      let imageUrl = dealForm.image ?? '';
      if (dealImageFile) {
        imageUrl = await EventsBackendAPI.uploadImage(dealImageFile);
      }
      const payload = { ...dealForm, image: imageUrl, countryCode: dealForm.countryCode === 'all' ? undefined : dealForm.countryCode };
      if (editingDeal) {
        const updated = await DealsBackendAPI.updateDeal(editingDeal.id, payload);
        setDeals(prev => prev.map(d => d.id === editingDeal.id ? updated : d));
        toast.success('Bon plan mis à jour');
      } else {
        const created = await DealsBackendAPI.createDeal(payload);
        setDeals(prev => [created, ...prev]);
        toast.success('Bon plan créé');
      }
      setIsDealFormOpen(false);
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la sauvegarde'));
    } finally {
      setDealFormLoading(false);
    }
  };

  const handleDeleteDeal = async (deal: BackendDeal) => {
    try {
      await DealsBackendAPI.deleteDeal(deal.id);
      setDeals(prev => prev.filter(d => d.id !== deal.id));
      toast.success(`Bon plan "${deal.title}" supprimé`);
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la suppression'));
    }
  };

  // ── Leisure state ─────────────────────────────────────────────────────────
  const [leisureItems, setLeisureItems] = useState<BackendLeisureItem[]>([]);
  const [leisureLoading, setLeisureLoading] = useState(false);
  const [leisureCategories, setLeisureCategories] = useState<BackendLeisureCategory[]>([]);
  const [leisureCatLoading, setLeisureCatLoading] = useState(false);
  const [isLeisureFormOpen, setIsLeisureFormOpen] = useState(false);
  const [editingLeisureItem, setEditingLeisureItem] = useState<BackendLeisureItem | null>(null);
  const [editingLeisureCat, setEditingLeisureCat] = useState<BackendLeisureCategory | null>(null);
  const [newLeisureCat, setNewLeisureCat] = useState({ name: '', slug: '' });
  const [leisureForm, setLeisureForm] = useState<LeisureItemInput>({
    name: '', description: '', categorySlug: '', location: '', address: '', phone: '',
    website: '', priceRange: '', openingHours: '', image: '', features: '[]', tags: '[]',
    status: 'published', countryCode: '',
  });
  const [leisureFormLoading, setLeisureFormLoading] = useState(false);
  const [leisureImageFile, setLeisureImageFile] = useState<File | null>(null);
  const [leisureImagePreview, setLeisureImagePreview] = useState('');
  const [viewingLeisureItem, setViewingLeisureItem] = useState<BackendLeisureItem | null>(null);

  const loadLeisureItems = async () => {
    setLeisureLoading(true);
    try {
      const data = await LeisureAPI.getAllAdmin();
      setLeisureItems(data);
    } catch { toast.error('Erreur lors du chargement des loisirs'); }
    finally { setLeisureLoading(false); }
  };

  const loadLeisureCategories = async () => {
    try {
      const data = await LeisureAPI.getCategories();
      setLeisureCategories(data);
    } catch { /* silently fail */ }
  };

  const openCreateLeisure = () => {
    setEditingLeisureItem(null);
    setLeisureForm({ name: '', description: '', categorySlug: leisureCategories[0]?.slug ?? '', location: '', address: '', phone: '', website: '', priceRange: '', openingHours: '', image: '', features: '[]', tags: '[]', status: 'published', countryCode: '' });
    setLeisureImageFile(null);
    setLeisureImagePreview('');
    setIsLeisureFormOpen(true);
  };

  const openEditLeisure = (item: BackendLeisureItem) => {
    setEditingLeisureItem(item);
    setLeisureForm({ name: item.name, description: item.description, categorySlug: item.categorySlug, location: item.location, address: item.address ?? '', phone: item.phone ?? '', website: item.website ?? '', priceRange: item.priceRange ?? '', openingHours: item.openingHours ?? '', image: item.image, features: item.features, tags: item.tags, status: item.status, countryCode: item.countryCode ?? '' });
    setLeisureImageFile(null);
    setLeisureImagePreview(item.image || '');
    setIsLeisureFormOpen(true);
  };

  const handleSaveLeisure = async () => {
    if (!leisureForm.name || !leisureForm.description || !leisureForm.categorySlug || !leisureForm.location) {
      toast.error('Nom, description, catégorie et localisation sont requis');
      return;
    }
    if (leisureForm.description.length < 1000) {
      toast.error('La description doit contenir au moins 1000 caractères');
      return;
    }
    setLeisureFormLoading(true);
    try {
      let imageUrl = leisureForm.image ?? '';
      if (leisureImageFile) imageUrl = await EventsBackendAPI.uploadImage(leisureImageFile);
      const payload = { ...leisureForm, image: imageUrl, countryCode: leisureForm.countryCode || undefined };
      if (editingLeisureItem) {
        const updated = await LeisureAPI.updateItem(editingLeisureItem.id, payload);
        setLeisureItems(prev => prev.map(i => i.id === editingLeisureItem.id ? updated : i));
        toast.success('Loisir mis à jour');
      } else {
        const created = await LeisureAPI.createItem(payload);
        setLeisureItems(prev => [created, ...prev]);
        toast.success('Loisir créé');
      }
      setIsLeisureFormOpen(false);
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la sauvegarde'));
    } finally { setLeisureFormLoading(false); }
  };

  const handleDeleteLeisure = async (item: BackendLeisureItem) => {
    try {
      await LeisureAPI.deleteItem(item.id);
      setLeisureItems(prev => prev.filter(i => i.id !== item.id));
      toast.success(`Loisir "${item.name}" supprimé`);
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la suppression'));
    }
  };

  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toast.error('Titre et message requis');
      return;
    }
    setNotifSending(true);
    try {
      await NotificationsAPI.sendEmail({
        to: notifAllUsers ? [] : [],
        subject: notifTitle,
        html: `<p>${notifMessage}</p>`,
      });
      toast.success('Notification envoyée avec succès');
      setNotifTitle('');
      setNotifMessage('');
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, "Erreur lors de l'envoi"));
    } finally {
      setNotifSending(false);
    }
  };

  const handlePushNotification = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toast.error('Titre et message requis');
      return;
    }
    setNotifSending(true);
    try {
      await NotificationsAPI.sendPushNotification({
        token: 'broadcast',
        title: notifTitle,
        body: notifMessage,
      });
      toast.success('Notification push envoyée');
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, "Erreur lors de l'envoi push"));
    } finally {
      setNotifSending(false);
    }
 };

  const handleAddLeisureCat = async () => {
    const name = newLeisureCat.name.trim();
    const slug = newLeisureCat.slug.trim() || slugify(name);
    if (!name || !slug) { toast.error('Nom requis'); return; }
    setLeisureCatLoading(true);
    try {
      const created = await LeisureAPI.createCategory({ name, slug });
      setLeisureCategories(prev => [...prev, created]);
      setNewLeisureCat({ name: '', slug: '' });
      toast.success(`Catégorie "${name}" ajoutée`);
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la création'));
    } finally { setLeisureCatLoading(false); }
  };

  const handleUpdateLeisureCat = async () => {
    if (!editingLeisureCat) return;
    setLeisureCatLoading(true);
    try {
      const updated = await LeisureAPI.updateCategory(editingLeisureCat.id, { name: editingLeisureCat.name, slug: editingLeisureCat.slug });
      setLeisureCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
      setEditingLeisureCat(null);
      toast.success('Catégorie mise à jour');
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la mise à jour'));
    } finally { setLeisureCatLoading(false); }
  };

  const handleDeleteLeisureCat = async (cat: BackendLeisureCategory) => {
    try {
      await LeisureAPI.deleteCategory(cat.id);
      setLeisureCategories(prev => prev.filter(c => c.id !== cat.id));
      toast.success(`Catégorie "${cat.name}" supprimée`);
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la suppression'));
    }
  };

  // ─── Blog posts management ────────────────────────────────────────────────────
  const [blogPosts, setBlogPosts] = useState<ApiBlogPost[]>([]);
  const [blogPostsTotal, setBlogPostsTotal] = useState(0);
  const [blogPostsLoading, setBlogPostsLoading] = useState(false);
  const [blogStats, setBlogStats] = useState<BlogStats | null>(null);
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [blogFilterStatus, setBlogFilterStatus] = useState('all');
  const [isBlogPostDialogOpen, setIsBlogPostDialogOpen] = useState(false);
  const [editingBlogPostId, setEditingBlogPostId] = useState<string | null>(null);
  const [blogPostSaving, setBlogPostSaving] = useState(false);
  const [blogTagsInput, setBlogTagsInput] = useState('');
  const [viewingBlogPost, setViewingBlogPost] = useState<ApiBlogPost | null>(null);
  const emptyBlogForm = { title: '', excerpt: '', content: '', categorySlug: '', featuredImage: '', status: 'draft' as 'draft' | 'published', isFeatured: false };
  const [blogPostForm, setBlogPostForm] = useState(emptyBlogForm);

  // ─── Blog categories management ───────────────────────────────────────────────
  const [blogCategories, setBlogCategories] = useState<ApiBlogCategory[]>([]);
  const [newBlogCat, setNewBlogCat] = useState({ name: '', slug: '' });
  const [editingBlogCat, setEditingBlogCat] = useState<ApiBlogCategory | null>(null);
  const [blogCatLoading, setBlogCatLoading] = useState(false);

  const loadBlogPosts = async () => {
    setBlogPostsLoading(true);
    try {
      const res = await BlogAPI.getAdminPosts({
        search: blogSearchQuery || undefined,
        status: blogFilterStatus !== 'all' ? blogFilterStatus : undefined,
        limit: 50,
      });
      setBlogPosts(res.posts);
      setBlogPostsTotal(res.total);
    } catch { toast.error('Erreur chargement articles'); }
    finally { setBlogPostsLoading(false); }
  };

  const loadBlogCategories = async () => {
    try { setBlogCategories(await BlogAPI.getCategories()); } catch { /* silently fail */ }
  };

  const loadBlogStats = async () => {
    try { setBlogStats(await BlogAPI.getStats()); } catch { /* silently fail */ }
  };

  const openCreateBlogPost = () => {
    setBlogPostForm({ ...emptyBlogForm, categorySlug: blogCategories[0]?.slug ?? '' });
    setBlogTagsInput('');
    setEditingBlogPostId(null);
    setIsBlogPostDialogOpen(true);
  };

  const openEditBlogPost = (post: ApiBlogPost) => {
    setBlogPostForm({ title: post.title, excerpt: post.excerpt, content: post.content, categorySlug: post.categorySlug, featuredImage: post.featuredImage, status: post.status, isFeatured: post.isFeatured });
    setBlogTagsInput(parseTags(post.tags).join(', '));
    setEditingBlogPostId(post.id);
    setIsBlogPostDialogOpen(true);
  };

  const handleSaveBlogPost = async () => {
    if (!blogPostForm.title.trim() || !blogPostForm.excerpt.trim() || !blogPostForm.content.trim() || !blogPostForm.categorySlug) { toast.error('Remplissez tous les champs obligatoires'); return; }
    setBlogPostSaving(true);
    const tags = blogTagsInput.split(',').map(t => t.trim()).filter(Boolean);
    try {
      if (editingBlogPostId) { await BlogAPI.updatePost(editingBlogPostId, { ...blogPostForm, tags }); toast.success('Article mis à jour !'); }
      else { await BlogAPI.createPost({ ...blogPostForm, tags }); toast.success('Article créé !'); }
      setIsBlogPostDialogOpen(false);
      loadBlogPosts();
      loadBlogStats();
    } catch (err: any) { toast.error(firebaseClientErrorToUserMessage(err, "Erreur lors de l'enregistrement")); }
    finally { setBlogPostSaving(false); }
  };

  const handleDeleteBlogPost = async (id: string) => {
    try {
      await BlogAPI.deletePost(id);
      toast.success('Article supprimé');
      loadBlogPosts();
      loadBlogStats();
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  const handleAddBlogCat = async () => {
    const name = newBlogCat.name.trim();
    const slug = newBlogCat.slug.trim() || slugify(name);
    if (!name || !slug) { toast.error('Nom requis'); return; }
    setBlogCatLoading(true);
    try {
      const created = await BlogAPI.createCategory({ name, slug });
      setBlogCategories(prev => [...prev, created]);
      setNewBlogCat({ name: '', slug: '' });
      toast.success(`Catégorie "${name}" ajoutée`);
    } catch (err: any) { toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la création')); }
    finally { setBlogCatLoading(false); }
  };

  const handleUpdateBlogCat = async () => {
    if (!editingBlogCat) return;
    setBlogCatLoading(true);
    try {
      const updated = await BlogAPI.updateCategory(editingBlogCat.id, { name: editingBlogCat.name, slug: editingBlogCat.slug });
      setBlogCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
      setEditingBlogCat(null);
      toast.success('Catégorie mise à jour');
    } catch (err: any) { toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la mise à jour')); }
    finally { setBlogCatLoading(false); }
  };

  const handleDeleteBlogCat = async (id: string) => {
    try {
      await BlogAPI.deleteCategory(id);
      setBlogCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Catégorie supprimée');
    } catch (err: any) { toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la suppression')); }
  };

  // Livraison
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [deliveryCities, setDeliveryCities] = useState<DeliveryCity[]>([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [adminCountries, setAdminCountries] = useState<{ code: string; name: string; flag: string }[]>([]);

  // Countries management (settings tab)
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countryForm, setCountryForm] = useState({ code: '', name: '', flag: '' });
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  // Platform settings
  const [settingsForm, setSettingsForm] = useState<PlatformSettings>({
    platformName: 'Feeti',
    commissionRate: '10',
    tvaRate: '18',
    defaultCurrency: 'fcfa',
    maintenanceMode: 'false',
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const loadAllCountries = async () => {
    setCountriesLoading(true);
    try {
      const data = await CountryAPI.getAllAdmin();
      setAllCountries(data);
    } catch { /* silently fail */ }
    finally { setCountriesLoading(false); }
  };

  const handleAddCountry = async () => {
    const code = countryForm.code.trim().toUpperCase();
    const name = countryForm.name.trim();
    if (!code || !name) { toast.error('Code et nom requis'); return; }
    setCountriesLoading(true);
    try {
      const created = await CountryAPI.create({ code, name, flag: countryForm.flag.trim() || undefined });
      setAllCountries(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setCountryForm({ code: '', name: '', flag: '' });
      toast.success(`Pays "${name}" ajouté`);
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la création'));
    } finally { setCountriesLoading(false); }
  };

  const handleUpdateCountry = async () => {
    if (!editingCountry) return;
    setCountriesLoading(true);
    try {
      const updated = await CountryAPI.update(editingCountry.code, { name: editingCountry.name, flag: editingCountry.flag, isActive: editingCountry.isActive });
      setAllCountries(prev => prev.map(c => c.code === updated.code ? updated : c));
      setEditingCountry(null);
      toast.success('Pays mis à jour');
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la mise à jour'));
    } finally { setCountriesLoading(false); }
  };

  const handleToggleCountryActive = async (country: Country) => {
    try {
      const updated = await CountryAPI.update(country.code, { isActive: !country.isActive });
      setAllCountries(prev => prev.map(c => c.code === updated.code ? updated : c));
      toast.success(`Pays ${updated.isActive ? 'activé' : 'désactivé'}`);
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur'));
    }
  };

  const handleDeleteCountry = async (country: Country) => {
    try {
      await CountryAPI.remove(country.code);
      setAllCountries(prev => prev.filter(c => c.code !== country.code));
      toast.success(`Pays "${country.name}" supprimé`);
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la suppression'));
    }
  };

  const [zoneForm, setZoneForm] = useState({ name: '', countryCode: '', fee: 0, currency: 'FCFA', description: '' });
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [cityForm, setCityForm] = useState({ name: '', countryCode: '', zoneId: '' });
  const [editingCity, setEditingCity] = useState<DeliveryCity | null>(null);
  const [deliveryTab, setDeliveryTab] = useState<'zones' | 'cities'>('zones');

  // ── Tarification badges Feeti Access ────────────────────────────────────────
  const [badgePricingUnitCost, setBadgePricingUnitCost] = useState(500);
  const [badgePricingSaving, setBadgePricingSaving] = useState(false);
  const [badgePricingLoaded, setBadgePricingLoaded] = useState(false);
  const [adminBadgeOrders, setAdminBadgeOrders] = useState<any[]>([]);
  const [badgeOrdersLoading, setBadgeOrdersLoading] = useState(false);

  const loadBadgePricing = async () => {
    try {
      const res = await axiosInstance.get('/api/access/badge-pricing');
      setBadgePricingUnitCost(res.data.data?.unitCost ?? 500);
      setBadgePricingLoaded(true);
    } catch { /* silently use defaults */ }
  };

  const handleSaveBadgePricing = async () => {
    setBadgePricingSaving(true);
    try {
      await axiosInstance.put('/api/admin/badge-pricing', { unitCost: badgePricingUnitCost });
      toast.success('Tarification badges mise à jour');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erreur lors de la sauvegarde');
    } finally { setBadgePricingSaving(false); }
  };

  const loadAdminBadgeOrders = async () => {
    setBadgeOrdersLoading(true);
    try {
      const res = await axiosInstance.get('/api/admin/badge-orders');
      setAdminBadgeOrders(res.data.data ?? []);
    } catch { /* silently fail */ }
    finally { setBadgeOrdersLoading(false); }
  };

  // ── Tarification établissements ──────────────────────────────────────────────
  const [estPricing, setEstPricing] = useState<EstablishmentPricing>({ establishmentAnnualFee: 50000, bonplanCreationFee: 5000, subscriptionDurationDays: 365, currency: 'FCFA' });
  const [estPricingSaving, setEstPricingSaving] = useState(false);
  const [estPricingLoaded, setEstPricingLoaded] = useState(false);

  const loadEstPricing = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/platform-pricing');
      setEstPricing(res.data.data);
      setEstPricingLoaded(true);
    } catch { /* silently use defaults */ }
  };

  const handleSaveEstPricing = async () => {
    setEstPricingSaving(true);
    try {
      await axiosInstance.put('/api/admin/platform-pricing', estPricing);
      toast.success('Tarification mise à jour');
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de la sauvegarde'));
    } finally { setEstPricingSaving(false); }
  };

  // ── Abonnements établissements (admin) ───────────────────────────────────────
  const [adminSubs, setAdminSubs] = useState<EOwnerSubscription[]>([]);
  const [adminSubsLoading, setAdminSubsLoading] = useState(false);

  const loadAdminSubs = async () => {
    setAdminSubsLoading(true);
    try {
      const res = await axiosInstance.get('/api/admin/subscriptions');
      setAdminSubs(res.data.data ?? []);
    } catch { /* silently fail */ }
    finally { setAdminSubsLoading(false); }
  };

  // ── Paiements Bon Plans (admin) ──────────────────────────────────────────────
  const [adminDealPayments, setAdminDealPayments] = useState<EOwnerDealPayment[]>([]);
  const [adminDealPaymentsLoading, setAdminDealPaymentsLoading] = useState(false);

  const loadAdminDealPayments = async () => {
    setAdminDealPaymentsLoading(true);
    try {
      const res = await axiosInstance.get('/api/admin/deal-payments');
      setAdminDealPayments(res.data.data ?? []);
    } catch { /* silently fail */ }
    finally { setAdminDealPaymentsLoading(false); }
  };

  const loadDeliveryData = async () => {
    setDeliveryLoading(true);
    try {
      const [zones, cities, countries] = await Promise.all([
        DeliveryAPI.getAllZones(),
        DeliveryAPI.getAllCities(),
        CountryAPI.getAll(),
      ]);
      setDeliveryZones(zones);
      setDeliveryCities(cities);
      setAdminCountries(countries.filter(c => c.isActive).map(c => ({ code: c.code, name: c.name, flag: c.flag })));
    } catch { /* silencieux */ } finally {
      setDeliveryLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    loadUsers();
    loadDeals();
    loadDealCategories();
    loadLeisureItems();
    loadLeisureCategories();
    loadBlogPosts();
    loadBlogCategories();
    loadBlogStats();
    loadDeliveryData();
    loadEventCategories();
    loadSalesTrends();
    loadTicketsData();
    loadAllCountries();
  }, []);

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const data = await EventsBackendAPI.getAllEventsAdmin();
      setEvents(data);
    } catch (err: any) {
      const msg = err?.response?.status === 403
        ? 'Accès refusé — droits admin requis pour voir les événements'
        : err?.response?.status === 401
        ? 'Session expirée, veuillez vous reconnecter'
        : 'Erreur lors du chargement des événements';
      toast.error(msg);
    } finally {
      setEventsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await AdminAPI.getAllUsers();
      setRealUsers(data);
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setUsersLoading(false);
    }
  };


  // Permission check
  const hasPermission = (requiredRole: string) => {
    const roleHierarchy: Record<string, number> = {
      'super_admin': 5,
      'admin': 4,
      'moderator': 3,
      'support': 2,
      'organizer': 1,
      'user': 0
    };
    
    const userRole = currentUser?.adminRole || currentUser?.role || 'user';
    return (roleHierarchy[userRole] ?? 0) >= (roleHierarchy[requiredRole] ?? 0);
  };

  // If not admin, deny access
  if (!hasPermission('moderator')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Accès Refusé</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full">
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers = useMemo(() => {
    return realUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [realUsers, searchTerm]);

  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState<'all' | 'pending' | 'active' | 'archived'>('all');

  const isEventArchived = (event: Event) =>
    event.status === 'rejected' || (event.status === 'published' && new Date(event.date) < new Date());

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const term = eventSearchTerm.toLowerCase();
    return events
      .filter(event => {
        const matchesSearch =
          (event.title ?? '').toLowerCase().includes(term) ||
          (event.category ?? '').toLowerCase().includes(term) ||
          (event.location ?? '').toLowerCase().includes(term);
        if (!matchesSearch) return false;
        const archived = event.status === 'rejected' || (event.status === 'published' && new Date(event.date) < now);
        const active   = event.status === 'published' && new Date(event.date) >= now;
        const pending  = event.status === 'draft';
        if (eventStatusFilter === 'pending')  return pending;
        if (eventStatusFilter === 'active')   return active;
        if (eventStatusFilter === 'archived') return archived;
        return true;
      })
      .sort((a, b) => {
        const order = (e: Event) => {
          if (e.status === 'draft') return 0;
          if (e.status === 'published' && new Date(e.date) >= now) return 1;
          return 2;
        };
        return order(a) - order(b);
      });
  }, [events, eventSearchTerm, eventStatusFilter]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => {
      const cat = e.category || 'Autres';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
  }, [events]);

  const handleUserAction = async (action: string, user: AdminUser) => {
    try {
      switch (action) {
        case 'delete':
          await AdminAPI.deleteUser(user.id);
          setRealUsers(prev => prev.filter(u => u.id !== user.id));
          toast.success(`Utilisateur ${user.name} supprimé`);
          break;
        default:
          break;
      }
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, `Erreur lors de l'action`));
    }
  };

  const handleRoleChange = async () => {
    if (!roleChangeUser || !newRole) return;
    try {
      await AdminAPI.updateUserRole(roleChangeUser.id, newRole);
      setRealUsers(prev => prev.map(u => u.id === roleChangeUser.id ? { ...u, role: newRole as AdminUser['role'] } : u));
      toast.success(`Rôle de ${roleChangeUser.name} mis à jour → ${newRole}`);
      setRoleChangeUser(null);
      setNewRole('');
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors du changement de rôle'));
    }
  };

  const writeOrganizerNotification = (event: Event, action: 'approved' | 'rejected') => {
    if (!event.organizerId) return;
    const key = `feeti_org_notifications_${event.organizerId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({ eventId: event.id, eventTitle: event.title, action, timestamp: Date.now() });
    localStorage.setItem(key, JSON.stringify(existing));
  };

  const handleEventAction = async (action: string, event: Event) => {
    try {
      switch (action) {
        case 'approve':
          await AdminAPI.updateEventStatus(event.id, 'published');
          setEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: 'published' } : e));
          writeOrganizerNotification(event, 'approved');
          toast.success(`Événement "${event.title}" approuvé et publié`);
          break;
        case 'reject': {
          setRejectingEvent(event);
          setRejectionReason('');
          break;
        }
        case 'delete':
          await EventsBackendAPI.deleteEvent(event.id);
          setEvents(prev => prev.filter(e => e.id !== event.id));
          toast.success(`Événement "${event.title}" supprimé`);
          break;
        default:
          break;
      }
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors de l\'action sur l\'événement'));
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingEvent) return;
    try {
      await AdminAPI.updateEventStatus(rejectingEvent.id, 'rejected', rejectionReason);
      setEvents(prev => prev.map(e => e.id === rejectingEvent.id ? { ...e, status: 'rejected' } : e));
      writeOrganizerNotification(rejectingEvent, 'rejected');
      toast.success(`Événement "${rejectingEvent.title}" rejeté`);
    } catch (err: any) {
      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur lors du rejet'));
    } finally {
      setRejectingEvent(null);
      setRejectionReason('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dialog — raison du rejet */}
      <Dialog open={!!rejectingEvent} onOpenChange={(open) => { if (!open) { setRejectingEvent(null); setRejectionReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter l'événement</DialogTitle>
            <DialogDescription>
              Indiquez la raison du rejet pour <strong>{rejectingEvent?.title}</strong>. L'organisateur pourra la consulter.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="rejection-reason">Raison du rejet</Label>
            <Textarea
              id="rejection-reason"
              className="mt-2"
              placeholder="Ex : informations insuffisantes, date incorrecte..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectingEvent(null); setRejectionReason(''); }}>Annuler</Button>
            <Button variant="destructive" onClick={handleConfirmReject} disabled={!rejectionReason.trim()}>Confirmer le rejet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="text-gray-600">
              ← Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin Feeti</h1>
              <p className="text-gray-600">Gestion complète de la plateforme</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {currentUser?.adminRole?.toUpperCase() || 'ADMIN'}
            </Badge>
            <Avatar>
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback>{currentUser?.name?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="relative" ref={tabsListRef}>
            <TabsList className="flex flex-nowrap overflow-x-auto justify-start w-full bg-white rounded-none h-auto p-0">

              <TabsTrigger value="subscriptions" onClick={loadAdminSubs} className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <CheckCircle className="w-4 h-4" /><span>Abonnements</span>
              </TabsTrigger>

              <TabsTrigger value="tickets" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <Ticket className="w-4 h-4" /><span>Billets</span>
              </TabsTrigger>

              <TabsTrigger value="deals" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <Gift className="w-4 h-4" /><span>Bons Plans</span>
              </TabsTrigger>

              <TabsTrigger value="categories" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <Tag className="w-4 h-4" /><span>Catégories</span>
              </TabsTrigger>

              <TabsTrigger value="pack-config" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <Tag className="w-4 h-4" /><span>Config packs</span>
              </TabsTrigger>

              <TabsTrigger value="content" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <MessageSquare className="w-4 h-4" /><span>Contenu</span>
              </TabsTrigger>

              <TabsTrigger value="events" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto relative data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <Calendar className="w-4 h-4" /><span>Événements</span>
                {events.filter(e => e.status === 'draft').length > 0 && (
                  <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {events.filter(e => e.status === 'draft').length}
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger value="live" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <Video className="w-4 h-4" /><span>Live</span>
              </TabsTrigger>

              <TabsTrigger value="delivery" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <Truck className="w-4 h-4" /><span>Livraison</span>
              </TabsTrigger>

              <TabsTrigger value="leisure" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <MapPin className="w-4 h-4" /><span>Loisirs</span>
              </TabsTrigger>

              <TabsTrigger value="payments" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <CreditCard className="w-4 h-4" /><span>Paiements</span>
              </TabsTrigger>

              <TabsTrigger value="deal-payments" onClick={loadAdminDealPayments} className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <CreditCard className="w-4 h-4" /><span>Paiements BP</span>
              </TabsTrigger>

              <TabsTrigger value="deal-promos" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <Gift className="w-4 h-4" /><span>Promos Bons Plans</span>
              </TabsTrigger>

              <TabsTrigger value="leisure-promos" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <MapPin className="w-4 h-4" /><span>Promos Loisirs</span>
              </TabsTrigger>

              <TabsTrigger value="promotions" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <Star className="w-4 h-4" /><span>Promotions</span>
              </TabsTrigger>

              <TabsTrigger value="promo-suivi" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <TrendingUp className="w-4 h-4" /><span>Suivi promos</span>
              </TabsTrigger>

              <TabsTrigger value="establishment-pricing" onClick={() => { if (!estPricingLoaded) loadEstPricing(); }} className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <DollarSign className="w-4 h-4" /><span>Tarification</span>
              </TabsTrigger>

              <TabsTrigger value="badge-pricing" onClick={() => { if (!badgePricingLoaded) loadBadgePricing(); loadAdminBadgeOrders(); }} className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <Shield className="w-4 h-4" /><span>Badges Access</span>
              </TabsTrigger>

              <TabsTrigger value="users" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <Users className="w-4 h-4" /><span>Utilisateurs</span>
              </TabsTrigger>

              <TabsTrigger value="overview" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <BarChart3 className="w-4 h-4" /><span>Vue d'ensemble</span>
              </TabsTrigger>

              <TabsTrigger value="settings" className="flex items-center space-x-2 whitespace-nowrap shrink-0 w-auto data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 rounded-none">
                <Settings className="w-4 h-4" /><span>Paramètres</span>
              </TabsTrigger>

            </TabsList>
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent" />
          </div>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usersLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : realUsers.length.toLocaleString('fr-FR')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {realUsers.filter(u => u.role === 'organizer').length} organisateurs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Événements Actifs</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {eventsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : events.filter(e => e.status === 'published').length.toLocaleString('fr-FR')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {events.filter(e => e.status === 'draft').length} en attente d'approbation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bons Plans Actifs</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dealsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : deals.filter(d => d.status === 'published').length.toLocaleString('fr-FR')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {deals.length} bons plans au total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Participants Total</CardTitle>
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {eventsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : events.reduce((acc, e) => acc + (e.attendees || 0), 0).toLocaleString('fr-FR')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    sur {events.reduce((acc, e) => acc + (e.maxAttendees || 0), 0).toLocaleString('fr-FR')} places totales
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Feeti Na Feeti CTA */}
            <Card className="border-dashed border-2 border-violet-200 bg-violet-50/50">
              <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5">
                <div>
                  <p className="font-semibold text-violet-900">🎁 Feeti Na Feeti — Programme de fidélité</p>
                  <p className="text-sm text-violet-700">Gérez les points, niveaux, récompenses, missions, partenaires et la communauté.</p>
                </div>
                <Button onClick={() => navigate('/admin/feeti-na-feeti')} className="bg-violet-600 hover:bg-violet-700 shrink-0">
                  Gérer la fidélité <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Évolution des Ventes
                    {salesTrendsLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  </CardTitle>
                  <CardDescription>Ventes et revenus des 6 derniers mois</CardDescription>
                </CardHeader>
                <CardContent>
                  {salesTrends.length === 0 && !salesTrendsLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-10">Aucune donnée de vente disponible</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesTrends.map(t => ({ name: t.label.slice(0, 4), ventes: Math.round(t.totalTTC / 100), revenus: Math.round(t.net / 100) }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} FCFA`, '']} />
                        <Bar dataKey="ventes" fill="#4338ca" name="Ventes TTC" />
                        <Bar dataKey="revenus" fill="#059669" name="Net organisateurs" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Répartition par Catégorie</CardTitle>
                  <CardDescription>Distribution des événements par catégorie</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Événements Récents</CardTitle>
                <CardDescription>Derniers événements sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : events.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucun événement</p>
                ) : (
                  <div className="space-y-4">
                    {[...events]
                      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                      .slice(0, 5)
                      .map(event => (
                        <div key={event.id} className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${event.status === 'published' ? 'bg-green-500' : event.status === 'draft' ? 'bg-orange-500' : 'bg-red-500'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.location} · {event.date}</p>
                          </div>
                          <Badge variant="outline" className={`text-xs flex-shrink-0 ${event.status === 'published' ? 'border-green-300 text-green-700' : event.status === 'draft' ? 'border-orange-300 text-orange-700' : 'border-red-300 text-red-700'}`}>
                            {event.status === 'published' ? 'Publié' : event.status === 'draft' ? 'En attente' : 'Rejeté'}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des Utilisateurs */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filtres</span>
                </Button>
              </div>
              {hasPermission('admin') && (
                <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center space-x-2">
                      <UserPlus className="w-4 h-4" />
                      <span>Nouvel utilisateur</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                      <DialogDescription>
                        Ajoutez un nouvel utilisateur à la plateforme
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cu-name">Nom complet *</Label>
                        <Input
                          id="cu-name"
                          placeholder="Jean Dupont"
                          value={createForm.name}
                          onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
                          className={createErrors.name ? 'border-red-400' : ''}
                        />
                        {createErrors.name && <p className="text-xs text-red-500 mt-1">{createErrors.name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="cu-email">Adresse email *</Label>
                        <Input
                          id="cu-email"
                          type="email"
                          placeholder="jean@example.com"
                          value={createForm.email}
                          onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
                          className={createErrors.email ? 'border-red-400' : ''}
                        />
                        {createErrors.email && <p className="text-xs text-red-500 mt-1">{createErrors.email}</p>}
                      </div>
                      <div>
                        <Label htmlFor="cu-phone">Téléphone <span className="text-gray-400 font-normal">(optionnel)</span></Label>
                        <Input
                          id="cu-phone"
                          type="tel"
                          placeholder="+242 06 ..."
                          value={createForm.phone}
                          onChange={(e) => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                          className={createErrors.phone ? 'border-red-400' : ''}
                        />
                        {createErrors.phone && <p className="text-xs text-red-500 mt-1">{createErrors.phone}</p>}
                      </div>
                      <div>
                        <Label htmlFor="cu-password">Mot de passe *</Label>
                        <Input
                          id="cu-password"
                          type="password"
                          placeholder="••••••••"
                          value={createForm.password}
                          onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
                          className={createErrors.password ? 'border-red-400' : ''}
                        />
                        {createErrors.password
                          ? <p className="text-xs text-red-500 mt-1">{createErrors.password}</p>
                          : <p className="text-xs text-gray-400 mt-1">8 caractères min., 1 majuscule, 1 chiffre</p>
                        }
                      </div>
                      <div>
                        <Label htmlFor="cu-confirm">Confirmer le mot de passe *</Label>
                        <Input
                          id="cu-confirm"
                          type="password"
                          placeholder="••••••••"
                          value={createForm.confirmPassword}
                          onChange={(e) => setCreateForm(f => ({ ...f, confirmPassword: e.target.value }))}
                          className={createErrors.confirmPassword ? 'border-red-400' : ''}
                        />
                        {createErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{createErrors.confirmPassword}</p>}
                      </div>
                      <div>
                        <Label htmlFor="cu-role">Rôle *</Label>
                        <Select value={createForm.role} onValueChange={(v: string) => setCreateForm(f => ({ ...f, role: v }))}>
                          <SelectTrigger id="cu-role">
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Utilisateur</SelectItem>
                            <SelectItem value="organizer">Organisateur</SelectItem>
                            <SelectItem value="moderator">Modérateur</SelectItem>
                            <SelectItem value="admin">Administrateur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => { setIsCreateUserOpen(false); setCreateErrors({}); setCreateForm({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'user' }); }}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateUser} disabled={createLoading}>
                        {createLoading ? 'Création…' : 'Créer'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Gestion des Utilisateurs
                  <Button variant="outline" size="sm" onClick={loadUsers} disabled={usersLoading}>
                    <RefreshCw className={`w-4 h-4 mr-1 ${usersLoading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                </CardTitle>
                <CardDescription>
                  {filteredUsers.length} utilisateur(s) trouvé(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Role change dialog */}
                {roleChangeUser && (
                  <Dialog open={!!roleChangeUser} onOpenChange={() => setRoleChangeUser(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Changer le rôle de {roleChangeUser.name}</DialogTitle>
                        <DialogDescription>Sélectionnez le nouveau rôle pour cet utilisateur.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        <Label>Nouveau rôle</Label>
                        <Select value={newRole} onValueChange={setNewRole}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Utilisateur</SelectItem>
                            <SelectItem value="organizer">Organisateur</SelectItem>
                            <SelectItem value="moderator">Modérateur</SelectItem>
                            <SelectItem value="admin">Administrateur</SelectItem>
                            {currentUser?.adminRole === 'super_admin' && (
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setRoleChangeUser(null)}>Annuler</Button>
                        <Button onClick={handleRoleChange}>Confirmer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Activité</TableHead>
                      <TableHead>Inscrit le</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                          Chargement des utilisateurs...
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                              {user.phone && <div className="text-xs text-muted-foreground">{user.phone}</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' || user.role === 'super_admin' ? 'destructive' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            <div>{user._count.events} événement(s)</div>
                            <div>{user._count.tickets} billet(s)</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {/* View user info */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                              title="Voir les informations"
                              onClick={() => { setViewingUser(user); setIsViewUserOpen(true); }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {hasPermission('admin') && (
                              <>
                                {/* Role change */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Changer le rôle"
                                  onClick={() => { setRoleChangeUser(user); setNewRole(user.role); }}
                                >
                                  <Key className="h-4 w-4" />
                                </Button>
                                {/* Delete */}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Cette action supprimera définitivement l'utilisateur <strong>{user.name}</strong> ainsi que tous ses événements et billets.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleUserAction('delete', user)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des Événements */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un événement..."
                    value={eventSearchTerm}
                    onChange={(e) => setEventSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={loadEvents} disabled={eventsLoading}>
                  <RefreshCw className={`w-4 h-4 mr-1 ${eventsLoading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
              {/* Filtres de statut */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={eventStatusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setEventStatusFilter('all')}
                >
                  Tous ({events.length})
                </Button>
                <Button
                  size="sm"
                  variant={eventStatusFilter === 'pending' ? 'default' : 'outline'}
                  className={eventStatusFilter === 'pending' ? 'bg-amber-500 hover:bg-amber-600' : 'border-amber-400 text-amber-700 hover:bg-amber-50'}
                  onClick={() => setEventStatusFilter('pending')}
                >
                  En attente ({events.filter(e => e.status === 'draft').length})
                </Button>
                <Button
                  size="sm"
                  variant={eventStatusFilter === 'active' ? 'default' : 'outline'}
                  className={eventStatusFilter === 'active' ? 'bg-green-600 hover:bg-green-700' : 'border-green-500 text-green-700 hover:bg-green-50'}
                  onClick={() => setEventStatusFilter('active')}
                >
                  En cours ({events.filter(e => e.status === 'published' && new Date(e.date) >= new Date()).length})
                </Button>
                <Button
                  size="sm"
                  variant={eventStatusFilter === 'archived' ? 'default' : 'outline'}
                  className={eventStatusFilter === 'archived' ? 'bg-gray-500 hover:bg-gray-600' : 'border-gray-400 text-gray-600 hover:bg-gray-50'}
                  onClick={() => setEventStatusFilter('archived')}
                >
                  Archivés ({events.filter(e => e.status === 'rejected' || (e.status === 'published' && new Date(e.date) < new Date())).length})
                </Button>
              </div>
            </div>

            {events.filter(e => e.status === 'draft').length > 0 && eventStatusFilter !== 'active' && eventStatusFilter !== 'archived' && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-300 rounded-lg">
                <Clock3 className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800">
                    {events.filter(e => e.status === 'draft').length} événement(s) en attente de validation
                  </p>
                  <p className="text-sm text-amber-600">Ces événements ne sont pas visibles par le public tant qu'ils ne sont pas approuvés.</p>
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Gestion des Événements</CardTitle>
                <CardDescription>
                  {filteredEvents.length} événement(s) affiché(s) — {events.filter(e => e.status === 'draft').length} en attente, {events.filter(e => e.status === 'published' && new Date(e.date) >= new Date()).length} en cours, {events.filter(e => isEventArchived(e)).length} archivés
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    Chargement...
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Événement</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvents.map((event) => {
                        const archived = isEventArchived(event);
                        const canAction = event.status === 'draft';
                        return (
                        <TableRow key={event.id} className={archived ? 'opacity-60 bg-gray-50' : ''}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {event.image ? (
                                <img
                                  src={event.image}
                                  alt={event.title}
                                  className={`h-12 w-12 rounded-lg object-cover ${archived ? 'grayscale' : ''}`}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <Calendar className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <div className={`font-medium ${archived ? 'text-gray-500' : ''}`}>{event.title}</div>
                                <div className="text-sm text-muted-foreground flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{event.location}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">{event.category}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{event.date}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{event.time}</div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {event.price === 0 ? 'Gratuit' : `${event.price.toLocaleString()} ${event.currency}`}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium">{event.attendees} / {event.maxAttendees}</div>
                              <Progress
                                value={(event.attendees / event.maxAttendees) * 100}
                                className="w-16 h-2"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <Badge
                                variant={canAction ? 'secondary' : archived ? 'destructive' : 'default'}
                                className={!archived && !canAction ? 'bg-green-100 text-green-800 border-green-300' : ''}
                              >
                                {event.status === 'draft'     ? 'En attente' :
                                 event.status === 'published' && !archived ? 'En cours' :
                                 event.status === 'published' && archived  ? 'Terminé' :
                                 event.status === 'rejected'  ? 'Rejeté' :
                                 event.status === 'cancelled' ? 'Annulé' : event.status}
                              </Badge>
                              {archived && (
                                <span className="text-xs text-gray-400 italic flex items-center gap-1">
                                  <FileText className="w-3 h-3" /> Archivé
                                </span>
                              )}
                              {event.isLive && (
                                <Badge className="bg-red-500 text-white text-xs">LIVE</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setViewingEvent(event); setIsViewEventOpen(true); }}
                                className="h-8 w-8 p-0"
                                title="Voir les détails"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {hasPermission('moderator') && canAction && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEventAction('approve', event)}
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                  title="Approuver"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {hasPermission('moderator') && canAction && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEventAction('reject', event)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                  title="Rejeter"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        );
                      })}
                      {filteredEvents.length === 0 && !eventsLoading && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Aucun événement trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des Billets */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Gestion des Billets</h2>
              <Button variant="outline" size="sm" onClick={loadTicketsData} disabled={ticketsLoading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${ticketsLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Billets Vendus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {ticketsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (ticketStats?.totalSold ?? 0).toLocaleString('fr-FR')}
                  </div>
                  <p className="text-sm text-muted-foreground">Total billets émis</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Billets Utilisés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {ticketsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (ticketStats?.totalUsed ?? 0).toLocaleString('fr-FR')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ticketStats && ticketStats.totalSold > 0
                      ? `${Math.round((ticketStats.totalUsed / ticketStats.totalSold) * 100)}% du total`
                      : '0% du total'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Remboursements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {ticketsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (ticketStats?.totalRefunded ?? 0).toLocaleString('fr-FR')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ticketStats && ticketStats.totalSold > 0
                      ? `${((ticketStats.totalRefunded / ticketStats.totalSold) * 100).toFixed(1)}% du total`
                      : '0% du total'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Billets Récents</CardTitle>
                <CardDescription>Derniers billets émis sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                {ticketsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : adminTickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucun billet trouvé</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Billet</TableHead>
                        <TableHead>Événement</TableHead>
                        <TableHead>Acheteur</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminTickets.map(ticket => (
                        <TableRow key={ticket.id}>
                          <TableCell>
                            <div>
                              <div className="font-mono text-xs text-muted-foreground">{ticket.orderId}</div>
                              <div className="text-xs text-muted-foreground capitalize">{ticket.category}</div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[160px] truncate">{ticket.event.title}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{ticket.holderName}</div>
                              <div className="text-xs text-muted-foreground">{ticket.holderEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{ticket.price.toLocaleString('fr-FR')} {ticket.currency}</TableCell>
                          <TableCell>
                            <Badge variant={ticket.status === 'valid' ? 'default' : ticket.status === 'used' || ticket.usedAt ? 'secondary' : 'destructive'}>
                              {ticket.usedAt ? 'Utilisé' : ticket.status === 'valid' ? 'Valide' : ticket.status === 'refunded' ? 'Remboursé' : ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des Paiements */}
          <TabsContent value="payments" className="space-y-6">
            {/* Header with link to full finance dashboard */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Vue Financière</h2>
                <p className="text-sm text-muted-foreground">Mois en cours — données en temps réel</p>
              </div>
              <div className="flex items-center gap-2">
                {financeLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <Button variant="outline" size="sm" onClick={loadFinanceData} disabled={financeLoading}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Actualiser
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/audit')}>
                  Journal d'audit
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/feeti-na-feeti')}>
                  Feeti Na Feeti
                </Button>
                <Button size="sm" onClick={() => navigate('/admin/finance')}>
                  Tableau de bord financier complet <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Alertes */}
            {(financeDashboard?.alertes ?? []).length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Alertes</span>
                </div>
                {financeDashboard!.alertes.map((a, i) => (
                  <p key={i} className="text-sm text-amber-700 ml-6">{a}</p>
                ))}
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { title: 'Revenus TTC', value: fmtCfa(financeDashboard?.fluxFinanciers.totalEntrees ?? 0), icon: <DollarSign className="h-5 w-5 text-purple-500" />, sub: 'Total encaissé' },
                { title: 'TVA Collectée', value: fmtCfa(financeDashboard?.fluxFinanciers.totalTVACollectee ?? 0), icon: <Percent className="h-5 w-5 text-blue-500" />, sub: `TVA ${settingsForm.tvaRate}%` },
                { title: 'Commissions', value: fmtCfa(financeDashboard?.fluxFinanciers.totalCommissions ?? 0), icon: <TrendingUp className="h-5 w-5 text-green-500" />, sub: `${settingsForm.commissionRate}% des ventes` },
                { title: 'Versés Orgs.', value: fmtCfa(financeDashboard?.fluxFinanciers.totalVersesOrganisateurs ?? 0), icon: <Send className="h-5 w-5 text-cyan-500" />, sub: 'Net organisateurs' },
                { title: 'En Litige', value: String(financeDashboard?.transactionsEnLitige ?? 0), icon: <AlertTriangle className="h-5 w-5 text-red-500" />, sub: 'Transactions' },
              ].map(({ title, value, icon, sub }) => (
                <Card key={title}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">{icon}<span className="text-xs text-muted-foreground">{sub}</span></div>
                    <div className="text-xl font-bold truncate">{value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Répartition par statut + Top organisateurs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Répartition par Statut</CardTitle>
                </CardHeader>
                <CardContent>
                  {(financeDashboard?.repartitionParStatut ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Aucune donnée</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={financeDashboard!.repartitionParStatut}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                        >
                          {financeDashboard!.repartitionParStatut.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any, name) => [v, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Organisateurs</CardTitle>
                </CardHeader>
                <CardContent>
                  {(financeDashboard?.topOrganisateurs ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Aucune donnée</p>
                  ) : (
                    <div className="space-y-3">
                      {financeDashboard!.topOrganisateurs.slice(0, 5).map((org, i) => (
                        <div key={org.organizerId} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{org.nom}</p>
                            <p className="text-xs text-muted-foreground">{org.totalTransactions} transactions</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold">{fmtCfa(org.totalTTC)}</p>
                            <p className="text-xs text-green-600">net {fmtCfa(org.totalNet)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Gestion des Virements (Payouts) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">Virements Organisateurs</CardTitle>
                  <CardDescription>Workflow de validation en double</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {financePayouts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucun virement</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organisateur</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Méthode</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financePayouts.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{p.organizer?.name ?? p.organizerId}</p>
                              <p className="text-xs text-muted-foreground">{p.organizer?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{fmtCfa(p.montant)}</TableCell>
                          <TableCell className="text-sm">{p.methodePaiement}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[p.statut] ?? 'bg-gray-100 text-gray-700'}`}>
                              {STATUS_LABEL[p.statut] ?? p.statut}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(p.initiatedAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {p.statut === 'initiated' && (
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handlePayoutAction(p.id, 'approve')}>
                                  Approuver
                                </Button>
                              )}
                              {p.statut === 'approved' && (
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handlePayoutAction(p.id, 'execute')}>
                                  Exécuter
                                </Button>
                              )}
                              {p.statut === 'processing' && (
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handlePayoutAction(p.id, 'confirm')}>
                                  Confirmer
                                </Button>
                              )}
                              {['initiated', 'approved'].includes(p.statut) && (
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600 hover:text-red-700" onClick={() => handlePayoutAction(p.id, 'cancel')}>
                                  Annuler
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* TVA Report + Audit Log */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Percent className="h-4 w-4 text-blue-500" /> Rapport TVA
                  </CardTitle>
                  <CardDescription>
                    {financeTVA ? `${financeTVA.nombreTransactions} transactions` : 'Mois en cours'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!financeTVA ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée TVA</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Total HT</p>
                          <p className="font-semibold text-sm">{fmtCfa(financeTVA.totalHT)}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">TVA ({settingsForm.tvaRate}%)</p>
                          <p className="font-semibold text-sm text-purple-700">{fmtCfa(financeTVA.totalTVA)}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Total TTC</p>
                          <p className="font-semibold text-sm text-green-700">{fmtCfa(financeTVA.totalTTC)}</p>
                        </div>
                      </div>
                      {financeTVA.parTaux.slice(0, 3).map((t, i) => (
                        <div key={i} className="flex items-center justify-between text-sm border-t pt-2">
                          <span className="text-muted-foreground">{t.tauxTVA} — {t.devise}</span>
                          <span className="font-medium">{fmtCfa(t.totalTVA)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" /> Journal d'Audit
                  </CardTitle>
                  <CardDescription>Dernières actions financières</CardDescription>
                </CardHeader>
                <CardContent>
                  {financeAudit.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucune entrée</p>
                  ) : (
                    <div className="space-y-2">
                      {financeAudit.slice(0, 6).map((entry) => (
                        <div key={entry.id} className="flex items-start gap-2 text-xs">
                          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{entry.action}</span>
                            <span className="text-muted-foreground"> · {entry.resource}</span>
                            {entry.resourceId && <span className="text-muted-foreground"> #{entry.resourceId.slice(0, 8)}</span>}
                          </div>
                          <span className="text-muted-foreground shrink-0">
                            {new Date(entry.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* CTA vers tableau de bord complet */}
            <Card className="border-dashed border-2 border-purple-200 bg-purple-50/50">
              <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5">
                <div>
                  <p className="font-semibold text-purple-900">Tableau de bord financier complet</p>
                  <p className="text-sm text-purple-700">Tendances, export CSV, gestion avancée des virements, intégrité du journal d'audit</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" onClick={() => navigate('/admin/audit')}>
                    Audit
                  </Button>
                  <Button onClick={() => navigate('/admin/finance')} className="bg-purple-600 hover:bg-purple-700">
                    Voir tout <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion du Contenu */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Articles Total</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {blogPostsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (blogStats?.total ?? 0).toLocaleString('fr-FR')}
                  </div>
                  <p className="text-sm text-muted-foreground">{blogStats?.published ?? 0} publiés</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Brouillons</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {blogPostsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (blogStats?.draft ?? 0).toLocaleString('fr-FR')}
                  </div>
                  <p className="text-sm text-muted-foreground">En attente de publication</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Vues Totales</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {blogPostsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (blogStats?.totalViews ?? 0).toLocaleString('fr-FR')}
                  </div>
                  <p className="text-sm text-muted-foreground">Tous articles confondus</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Catégories Blog</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {blogCatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : blogCategories.length.toLocaleString('fr-FR')}
                  </div>
                  <p className="text-sm text-muted-foreground">Catégories actives</p>
                </CardContent>
              </Card>
            </div>

            {/* ── Blog Management ── */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      Gestion du Blog
                    </CardTitle>
                    <CardDescription>Articles et contenus éditoriaux</CardDescription>
                  </div>
                  <Button onClick={openCreateBlogPost} className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" />Nouvel article
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Total', value: blogStats?.total ?? 0 },
                    { label: 'Publiés', value: blogStats?.published ?? 0 },
                    { label: 'Brouillons', value: blogStats?.draft ?? 0 },
                    { label: 'Vues', value: (blogStats?.totalViews ?? 0).toLocaleString() },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-gray-900">{value}</div>
                      <div className="text-xs text-gray-500">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[160px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Rechercher..." value={blogSearchQuery} onChange={e => setBlogSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') loadBlogPosts(); }} className="pl-9 h-8 text-sm" />
                  </div>
                  <Select value={blogFilterStatus} onValueChange={(v: string) => { setBlogFilterStatus(v); }}>
                    <SelectTrigger className="w-[140px] h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="published">Publiés</SelectItem>
                      <SelectItem value="draft">Brouillons</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={loadBlogPosts} className="h-8">
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>

                {/* Posts list */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {blogPostsLoading ? (
                    <div className="text-center py-6 text-gray-400 text-sm">Chargement…</div>
                  ) : blogPosts.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm">Aucun article trouvé</div>
                  ) : blogPosts.map(post => (
                    <div key={post.id} className="flex items-start justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 text-sm truncate">{post.title}</span>
                          {post.isFeatured && <Badge className="bg-yellow-100 text-yellow-800 text-xs shrink-0">À la une</Badge>}
                          <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="text-xs shrink-0">
                            {post.status === 'published' ? 'Publié' : 'Brouillon'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                          <span>{post.category?.name ?? post.categorySlug}</span>
                          <span>{post.views} vues</span>
                          <span>{post.readTime} min</span>
                          {post.publishDate && <span>{new Date(post.publishDate).toLocaleDateString('fr-FR')}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => setViewingBlogPost(post)} className="h-7 w-7 p-0" title="Voir détails">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditBlogPost(post)} className="h-7 w-7 p-0">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
                              <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteBlogPost(post.id)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">{blogPostsTotal} article{blogPostsTotal !== 1 ? 's' : ''} au total</p>
              </CardContent>
            </Card>

            {/* Blog post create/edit dialog */}
            <Dialog open={isBlogPostDialogOpen} onOpenChange={(open: boolean) => { if (!open) setIsBlogPostDialogOpen(false); }}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingBlogPostId ? "Modifier l'article" : 'Créer un article'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <Label>Titre *</Label>
                    <Input placeholder="Titre de l'article" value={blogPostForm.title} onChange={e => setBlogPostForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Résumé *</Label>
                    <Textarea placeholder="Résumé court" value={blogPostForm.excerpt} onChange={e => setBlogPostForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} />
                  </div>
                  <div className="space-y-1">
                    <Label>Contenu * (HTML supporté)</Label>
                    <Textarea placeholder="Contenu complet…" value={blogPostForm.content} onChange={e => setBlogPostForm(f => ({ ...f, content: e.target.value }))} rows={10} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Catégorie *</Label>
                      <Select value={blogPostForm.categorySlug} onValueChange={(v: string) => setBlogPostForm(f => ({ ...f, categorySlug: v }))}>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>{blogCategories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Statut</Label>
                      <Select value={blogPostForm.status} onValueChange={(v: 'draft' | 'published') => setBlogPostForm(f => ({ ...f, status: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Brouillon</SelectItem>
                          <SelectItem value="published">Publié</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Tags (séparés par virgules)</Label>
                    <Input placeholder="tag1, tag2, tag3" value={blogTagsInput} onChange={e => setBlogTagsInput(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Image à la une (URL)</Label>
                    <Input placeholder="https://…" value={blogPostForm.featuredImage} onChange={e => setBlogPostForm(f => ({ ...f, featuredImage: e.target.value }))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="blog-featured" checked={blogPostForm.isFeatured} onCheckedChange={(v: boolean) => setBlogPostForm(f => ({ ...f, isFeatured: v }))} />
                    <Label htmlFor="blog-featured">Article à la une</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBlogPostDialogOpen(false)} disabled={blogPostSaving}>Annuler</Button>
                  <Button onClick={handleSaveBlogPost} className="bg-indigo-600 hover:bg-indigo-700" disabled={blogPostSaving}>
                    {blogPostSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {editingBlogPostId ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Blog post view-detail dialog */}
            <Dialog open={!!viewingBlogPost} onOpenChange={(open: boolean) => { if (!open) setViewingBlogPost(null); }}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                {viewingBlogPost && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-lg leading-snug">{viewingBlogPost.title}</DialogTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant={viewingBlogPost.status === 'published' ? 'default' : 'secondary'}>
                          {viewingBlogPost.status === 'published' ? 'Publié' : 'Brouillon'}
                        </Badge>
                        {viewingBlogPost.isFeatured && <Badge className="bg-yellow-500 text-white">À la une</Badge>}
                        <Badge variant="outline">{viewingBlogPost.category?.name ?? viewingBlogPost.categorySlug}</Badge>
                        <span className="text-xs text-gray-500 self-center">{viewingBlogPost.readTime} min · {viewingBlogPost.views} vues · {viewingBlogPost.comments} commentaires</span>
                      </div>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      {viewingBlogPost.featuredImage && (
                        <img src={viewingBlogPost.featuredImage} alt={viewingBlogPost.title} className="w-full h-48 object-cover rounded-lg" />
                      )}
                      <p className="text-sm text-gray-600 italic border-l-4 border-indigo-300 pl-3">{viewingBlogPost.excerpt}</p>
                      {parseTags(viewingBlogPost.tags).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {parseTags(viewingBlogPost.tags).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="prose prose-sm max-w-none text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: viewingBlogPost.content }} />
                      {viewingBlogPost.publishDate && (
                        <p className="text-xs text-gray-400">Publié le {new Date(viewingBlogPost.publishDate).toLocaleDateString('fr-FR')}</p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setViewingBlogPost(null)}>Fermer</Button>
                      <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => { setViewingBlogPost(null); openEditBlogPost(viewingBlogPost); }}>
                        <Edit2 className="w-4 h-4 mr-2" />Modifier
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>

              <Card>
                  <CardHeader>
                    <CardTitle>Notifications Push</CardTitle>
                    <CardDescription>Communication avec les utilisateurs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="notif-title">Titre</Label>
                        <Input
                          id="notif-title"
                          value={notifTitle}
                          onChange={e => setNotifTitle(e.target.value)}
                          placeholder="Nouveau événement disponible !"
                        />
                      </div>
                      <div>
                        <Label htmlFor="notif-message">Message</Label>
                        <Textarea
                          id="notif-message"
                          value={notifMessage}
                          onChange={e => setNotifMessage(e.target.value)}
                          placeholder="Ne manquez pas le Festival Électro Summer..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={handleSendNotification}
                        disabled={notifSending}
                      >
                        {notifSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                        Envoyer par email
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handlePushNotification}
                        disabled={notifSending}
                      >
                        {notifSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                        Notification push
                      </Button>
                    </div>
                  </CardContent>
                </Card>
          </TabsContent>

          {/* Gestion Live Streaming */}
          <TabsContent value="live" className="space-y-6">
            {(() => {
              const liveEvents = events.filter(e => e.isLive);
              const totalAttendees = liveEvents.reduce((acc, e) => acc + (e.attendees || 0), 0);
              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Lives Actifs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {eventsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : liveEvents.length.toLocaleString('fr-FR')}
                        </div>
                        <p className="text-sm text-muted-foreground">Événements en live</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Participants</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {eventsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : totalAttendees.toLocaleString('fr-FR')}
                        </div>
                        <p className="text-sm text-muted-foreground">Total inscrits (lives)</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenus Live</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {financeDashboard ? fmtCfa(financeDashboard.fluxFinanciers.totalEntrees) : '—'}
                        </div>
                        <p className="text-sm text-muted-foreground">Revenus plateforme (mois)</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Événements Live</CardTitle>
                      <CardDescription>Événements marqués comme live</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {eventsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                        </div>
                      ) : liveEvents.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Aucun événement live en ce moment</p>
                      ) : (
                        <div className="space-y-4">
                          {liveEvents.map(event => (
                            <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                                <div>
                                  <p className="font-medium">{event.title}</p>
                                  <p className="text-sm text-muted-foreground">{event.attendees} participants • {event.location}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="destructive">LIVE</Badge>
                                <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>{event.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </TabsContent>

          {/* Catégories */}
          <TabsContent value="categories" className="space-y-6">
            <Tabs defaultValue="events-cat">
              <TabsList className="mb-4">
                <TabsTrigger value="events-cat" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Événements
                </TabsTrigger>
                <TabsTrigger value="deals-cat" className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Bons Plans
                </TabsTrigger>
                <TabsTrigger value="leisure-cat" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Loisirs
                </TabsTrigger>
                <TabsTrigger value="blog-cat" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Blog
                </TabsTrigger>
              </TabsList>

              {/* Catégories événements */}
              <TabsContent value="events-cat">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        Catégories d'événements
                      </div>
                      <Button variant="outline" size="sm" onClick={loadEventCategories} disabled={eventCatLoading}>
                        <RefreshCw className={`w-4 h-4 ${eventCatLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Gérez les catégories disponibles lors de la création d'événements et festivals.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {editingCategory ? (
                      <div className="flex gap-3 flex-wrap items-end p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Nom *</label>
                          <Input value={editingCategory.name} onChange={e => setEditingCategory(c => c ? { ...c, name: e.target.value } : c)} placeholder="Ex : Danse" />
                        </div>
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Slug *</label>
                          <Input value={editingCategory.slug} onChange={e => setEditingCategory(c => c ? { ...c, slug: e.target.value } : c)} placeholder="ex : danse" />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveEditCategory} disabled={eventCatLoading} className="bg-indigo-600 hover:bg-indigo-700">
                            {eventCatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                          </Button>
                          <Button variant="outline" onClick={() => setEditingCategory(null)}>Annuler</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 flex-wrap items-end">
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Nom *</label>
                          <Input value={newCategory.name} onChange={e => setNewCategory(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="Ex : Danse, Cirque..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); }}} />
                        </div>
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Slug (auto)</label>
                          <Input value={newCategory.slug} onChange={e => setNewCategory(f => ({ ...f, slug: e.target.value }))} placeholder="ex : danse" />
                        </div>
                        <Button onClick={handleAddCategory} disabled={eventCatLoading} className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                          {eventCatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />Ajouter</>}
                        </Button>
                      </div>
                    )}
                    <div className="space-y-2">
                      {eventCatLoading && eventCategories.length === 0 && (
                        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-indigo-600" /></div>
                      )}
                      {!eventCatLoading && eventCategories.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">Aucune catégorie définie.</p>
                      )}
                      {eventCategories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                          <div>
                            <span className="font-medium text-gray-900">{cat.name}</span>
                            <span className="ml-2 text-xs text-gray-400 font-mono">{cat.slug}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingCategory(cat)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer "{cat.name}" ?</AlertDialogTitle>
                                  <AlertDialogDescription>Cette catégorie sera supprimée définitivement de la base de données.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteCategory(cat)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {eventCategories.length} catégorie{eventCategories.length !== 1 ? 's' : ''} · Disponibles pour tous les organisateurs.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Catégories bons plans */}
              <TabsContent value="deals-cat">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-indigo-600" />
                      Catégories de bons plans
                    </CardTitle>
                    <CardDescription>Gérez les catégories disponibles pour les bons plans.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {editingDealCategory ? (
                      <div className="flex gap-3 flex-wrap items-end p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Nom *</label>
                          <Input value={editingDealCategory.name} onChange={e => setEditingDealCategory(c => c ? { ...c, name: e.target.value } : c)} placeholder="Ex : Restaurants" />
                        </div>
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Slug *</label>
                          <Input value={editingDealCategory.slug} onChange={e => setEditingDealCategory(c => c ? { ...c, slug: e.target.value } : c)} placeholder="ex : restaurants" />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleUpdateDealCategory} disabled={dealCatLoading} className="bg-indigo-600 hover:bg-indigo-700">
                            {dealCatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                          </Button>
                          <Button variant="outline" onClick={() => setEditingDealCategory(null)}>Annuler</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 flex-wrap items-end">
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Nom *</label>
                          <Input value={newDealCategory.name} onChange={e => setNewDealCategory(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="Ex : Restaurants" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddDealCategory(); }}} />
                        </div>
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Slug (auto)</label>
                          <Input value={newDealCategory.slug} onChange={e => setNewDealCategory(f => ({ ...f, slug: e.target.value }))} placeholder="ex : restaurants" />
                        </div>
                        <Button onClick={handleAddDealCategory} disabled={dealCatLoading} className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                          {dealCatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />Ajouter</>}
                        </Button>
                      </div>
                    )}
                    <div className="space-y-2">
                      {dealCategories.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">Aucune catégorie définie.</p>
                      )}
                      {dealCategories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div>
                              <span className="font-medium text-gray-900">{cat.name}</span>
                              <span className="ml-2 text-xs text-gray-400 font-mono">{cat.slug}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingDealCategory(cat)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer "{cat.name}" ?</AlertDialogTitle>
                                  <AlertDialogDescription>Cette catégorie sera supprimée définitivement.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteDealCategory(cat)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {dealCategories.length} catégorie{dealCategories.length !== 1 ? 's' : ''} · Apparaissent dans le formulaire de création de bons plans.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Catégories loisirs */}
              <TabsContent value="leisure-cat">
                <Card>
                  <CardHeader>
                    <CardTitle>Catégories de loisirs</CardTitle>
                    <CardDescription>Gérez les catégories d'établissements de loisirs (hôtels, restaurants, bars...).</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {editingLeisureCat ? (
                      <div className="flex gap-3 flex-wrap items-end p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Nom *</label>
                          <Input value={editingLeisureCat.name} onChange={e => setEditingLeisureCat(c => c ? { ...c, name: e.target.value } : c)} placeholder="Ex : Hôtels" />
                        </div>
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Slug *</label>
                          <Input value={editingLeisureCat.slug} onChange={e => setEditingLeisureCat(c => c ? { ...c, slug: e.target.value } : c)} placeholder="ex : hotels" />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleUpdateLeisureCat} disabled={leisureCatLoading} className="bg-indigo-600 hover:bg-indigo-700">
                            {leisureCatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                          </Button>
                          <Button variant="outline" onClick={() => setEditingLeisureCat(null)}>Annuler</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 flex-wrap items-end">
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Nom *</label>
                          <Input value={newLeisureCat.name} onChange={e => setNewLeisureCat(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="Ex : Hôtels" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddLeisureCat(); }}} />
                        </div>
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Slug (auto)</label>
                          <Input value={newLeisureCat.slug} onChange={e => setNewLeisureCat(f => ({ ...f, slug: e.target.value }))} placeholder="ex : hotels" />
                        </div>
                        <Button onClick={handleAddLeisureCat} disabled={leisureCatLoading} className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                          {leisureCatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />Ajouter</>}
                        </Button>
                      </div>
                    )}
                    <div className="space-y-2">
                      {leisureCategories.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Aucune catégorie définie.</p>}
                      {leisureCategories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                          <div>
                            <span className="font-medium text-gray-900">{cat.name}</span>
                            <span className="ml-2 text-xs text-gray-400 font-mono">{cat.slug}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingLeisureCat(cat)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer "{cat.name}" ?</AlertDialogTitle>
                                  <AlertDialogDescription>Cette catégorie sera supprimée définitivement.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteLeisureCat(cat)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{leisureCategories.length} catégorie{leisureCategories.length !== 1 ? 's' : ''}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Catégories Blog ── */}
              <TabsContent value="blog-cat">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      Catégories de blog
                    </CardTitle>
                    <CardDescription>Gérez les catégories d'articles du blog (événements, culture, lifestyle, tech…).</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {editingBlogCat ? (
                      <div className="flex gap-3 flex-wrap items-end p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Nom *</label>
                          <Input value={editingBlogCat.name} onChange={e => setEditingBlogCat(c => c ? { ...c, name: e.target.value } : c)} placeholder="Ex : Culture" />
                        </div>
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Slug *</label>
                          <Input value={editingBlogCat.slug} onChange={e => setEditingBlogCat(c => c ? { ...c, slug: e.target.value } : c)} placeholder="ex : culture" />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleUpdateBlogCat} disabled={blogCatLoading} className="bg-indigo-600 hover:bg-indigo-700">
                            {blogCatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                          </Button>
                          <Button variant="outline" onClick={() => setEditingBlogCat(null)}>Annuler</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 flex-wrap items-end">
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Nom *</label>
                          <Input value={newBlogCat.name} onChange={e => setNewBlogCat(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="Ex : Culture" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddBlogCat(); } }} />
                        </div>
                        <div className="space-y-1 flex-1 min-w-[160px]">
                          <label className="text-xs font-medium text-gray-700">Slug (auto)</label>
                          <Input value={newBlogCat.slug} onChange={e => setNewBlogCat(f => ({ ...f, slug: e.target.value }))} placeholder="ex : culture" />
                        </div>
                        <Button onClick={handleAddBlogCat} disabled={blogCatLoading} className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                          {blogCatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />Ajouter</>}
                        </Button>
                      </div>
                    )}

                    <div className="space-y-2">
                      {blogCategories.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">Aucune catégorie définie.</p>
                      )}
                      {blogCategories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <Tag className="w-4 h-4 text-indigo-400" />
                            <div>
                              <span className="font-medium text-gray-900">{cat.name}</span>
                              <span className="ml-2 text-xs text-gray-400 font-mono">{cat.slug}</span>
                              {cat.icon && <span className="ml-2 text-xs text-gray-400">· {cat.icon}</span>}
                              <span className="ml-2 text-xs text-gray-400">· {cat._count?.posts ?? 0} article(s)</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingBlogCat(cat)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer "{cat.name}" ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Impossible si des articles sont liés à cette catégorie.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteBlogCat(cat.id)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {blogCategories.length} catégorie{blogCategories.length !== 1 ? 's' : ''} · Utilisées pour classifier les articles du blog.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Bons Plans */}
          <TabsContent value="deals" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Bons Plans</h2>
                <p className="text-gray-600 text-sm">{deals.length} bon{deals.length !== 1 ? 's' : ''} plan{deals.length !== 1 ? 's' : ''} au total</p>
              </div>
              <Button onClick={openCreateDeal} className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />Nouveau bon plan
              </Button>
            </div>

            {/* Form Dialog */}
            <Dialog open={isDealFormOpen} onOpenChange={setIsDealFormOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingDeal ? 'Modifier le bon plan' : 'Créer un bon plan'}</DialogTitle>
                  <DialogDescription>Remplissez les informations du bon plan.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Titre *</Label>
                    <Input value={dealForm.title} onChange={e => setDealForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre du bon plan" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Description *</Label>
                    <Textarea value={dealForm.description} onChange={e => setDealForm(f => ({ ...f, description: e.target.value }))} placeholder="Description détaillée" rows={3} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Établissement lié (optionnel)</Label>
                    <Select
                      value={(dealForm as any).leisureItemId || 'none'}
                      onValueChange={(v: string) => {
                        const itemId = v === 'none' ? undefined : v;
                        const found = leisureItems.find((li: BackendLeisureItem) => li.id === itemId);
                        setDealForm(f => ({
                          ...f,
                          leisureItemId: itemId,
                          merchantName: found ? found.name : f.merchantName,
                          location: found ? found.location : f.location,
                          image: found && found.image ? found.image : f.image,
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un établissement (auto-remplit marchand/lieu)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun (saisie manuelle)</SelectItem>
                        {leisureItems.map((li: BackendLeisureItem) => (
                          <SelectItem key={li.id} value={li.id}>{li.name} — {li.location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Marchand *</Label>
                    <Input value={dealForm.merchantName} onChange={e => setDealForm(f => ({ ...f, merchantName: e.target.value }))} placeholder="Nom du marchand" />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={dealForm.category} onValueChange={(v: string) => setDealForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {dealCategories.length > 0
                          ? dealCategories.map(c => (
                              <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                            ))
                          : ['weekly', 'general', 'feeti-na-feeti', 'restaurants', 'hotels', 'activities', 'shopping'].map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prix original (FCFA) *</Label>
                    <Input type="number" value={dealForm.originalPrice} onChange={e => setDealForm(f => ({ ...f, originalPrice: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Prix réduit (FCFA) *</Label>
                    <Input type="number" value={dealForm.discountedPrice} onChange={e => setDealForm(f => ({ ...f, discountedPrice: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Réduction (%) *</Label>
                    <Input type="number" min={1} max={99} value={dealForm.discount} onChange={e => setDealForm(f => ({ ...f, discount: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Valide jusqu'au *</Label>
                    <Input type="date" value={dealForm.validUntil} onChange={e => setDealForm(f => ({ ...f, validUntil: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Lieu *</Label>
                    <Input value={dealForm.location} onChange={e => setDealForm(f => ({ ...f, location: e.target.value }))} placeholder="Ville, quartier..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Pays (code)</Label>
                    <Select value={dealForm.countryCode ?? ''} onValueChange={(v: string) => setDealForm(f => ({ ...f, countryCode: v || undefined }))}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les pays</SelectItem>
                        <SelectItem value="CG">🇨🇬 Congo</SelectItem>
                        <SelectItem value="CD">🇨🇩 RDC</SelectItem>
                        <SelectItem value="GA">🇬🇦 Gabon</SelectItem>
                        <SelectItem value="CI">🇨🇮 Côte d'Ivoire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Image</Label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                      onClick={() => document.getElementById('deal-image-upload')?.click()}
                    >
                      {dealImagePreview ? (
                        <div className="relative">
                          <img src={dealImagePreview} alt="Aperçu" className="w-full h-40 object-cover rounded-lg" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <p className="text-white text-sm font-medium flex items-center gap-2">
                              <Upload className="w-4 h-4" />Changer l'image
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 flex flex-col items-center gap-2 text-gray-400">
                          <ImageIcon className="w-10 h-10" />
                          <p className="text-sm font-medium">Cliquez pour uploader une image</p>
                          <p className="text-xs">PNG, JPG, WEBP · Max 10 Mo</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="deal-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setDealImageFile(file);
                          setDealImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantité disponible</Label>
                    <Input type="number" value={dealForm.availableQuantity ?? ''} onChange={e => setDealForm(f => ({ ...f, availableQuantity: e.target.value ? Number(e.target.value) : undefined }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantité max</Label>
                    <Input type="number" value={dealForm.maxQuantity ?? ''} onChange={e => setDealForm(f => ({ ...f, maxQuantity: e.target.value ? Number(e.target.value) : undefined }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Note (ex: 4.5)</Label>
                    <Input type="number" min={0} max={5} step={0.1} value={dealForm.rating ?? ''} onChange={e => setDealForm(f => ({ ...f, rating: e.target.value ? Number(e.target.value) : undefined }))} placeholder="0 – 5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre d'avis</Label>
                    <Input type="number" min={0} value={dealForm.reviewCount ?? ''} onChange={e => setDealForm(f => ({ ...f, reviewCount: e.target.value ? Number(e.target.value) : undefined }))} placeholder="ex: 120" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Tags (séparés par des virgules)</Label>
                    <Input
                      value={(() => { try { return JSON.parse(dealForm.tags ?? '[]').join(', '); } catch { return ''; } })()}
                      onChange={e => setDealForm(f => ({ ...f, tags: JSON.stringify(e.target.value.split(',').map(t => t.trim()).filter(Boolean)) }))}
                      placeholder="ex: promo, restaurant, famille"
                    />
                  </div>
                  <div className="md:col-span-2 border-t pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Contact du marchand</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Téléphone / WhatsApp</Label>
                        <Input value={dealForm.contactPhone ?? ''} onChange={e => setDealForm(f => ({ ...f, contactPhone: e.target.value || undefined }))} placeholder="+242 06 ..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={dealForm.contactEmail ?? ''} onChange={e => setDealForm(f => ({ ...f, contactEmail: e.target.value || undefined }))} placeholder="contact@marchand.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Site web</Label>
                        <Input value={dealForm.contactWebsite ?? ''} onChange={e => setDealForm(f => ({ ...f, contactWebsite: e.target.value || undefined }))} placeholder="https://..." />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select value={dealForm.status ?? 'published'} onValueChange={(v: string) => setDealForm(f => ({ ...f, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Publié</SelectItem>
                        <SelectItem value="draft">Brouillon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="isPopular" checked={dealForm.isPopular ?? false} onChange={e => setDealForm(f => ({ ...f, isPopular: e.target.checked }))} className="rounded" />
                    <Label htmlFor="isPopular">Marquer comme populaire</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDealFormOpen(false)}>Annuler</Button>
                  <Button onClick={handleSaveDeal} disabled={dealFormLoading} className="bg-indigo-600 hover:bg-indigo-700">
                    {dealFormLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</> : (editingDeal ? 'Mettre à jour' : 'Créer')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog open={!!viewingDeal} onOpenChange={(open: boolean) => { if (!open) setViewingDeal(null); }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {viewingDeal && (() => {
                  const daysLeft = Math.max(0, Math.ceil((new Date(viewingDeal.validUntil).getTime() - Date.now()) / 86400000));
                  let tags: string[] = [];
                  try { tags = JSON.parse(viewingDeal.tags); } catch { tags = []; }
                  return (
                    <>
                      <DialogHeader>
                        <DialogTitle className="text-xl">{viewingDeal.title}</DialogTitle>
                        <DialogDescription>{viewingDeal.merchantName} · {viewingDeal.location}</DialogDescription>
                      </DialogHeader>

                      <div className="rounded-lg overflow-hidden h-52 bg-gray-100">
                        {viewingDeal.image
                          ? <img src={viewingDeal.image} alt={viewingDeal.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                              <ImageIcon className="w-12 h-12" />
                              <span className="text-sm">Aucune image</span>
                            </div>
                        }
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-gray-500">Catégorie</p>
                          <Badge variant="outline" className="capitalize">{viewingDeal.category}</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500">Statut</p>
                          <Badge className={viewingDeal.status === 'published' ? 'bg-green-100 text-green-800 border-0' : 'bg-gray-100 text-gray-600 border-0'}>
                            {viewingDeal.status === 'published' ? 'Publié' : 'Brouillon'}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500">Prix original</p>
                          <p className="font-semibold text-gray-500 line-through">{new Intl.NumberFormat('fr-FR').format(viewingDeal.originalPrice)} FCFA</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500">Prix réduit</p>
                          <p className="font-bold text-indigo-600 text-lg">{new Intl.NumberFormat('fr-FR').format(viewingDeal.discountedPrice)} FCFA</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500">Réduction</p>
                          <Badge className="bg-green-100 text-green-800 border-0">-{viewingDeal.discount}%</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500">Validité</p>
                          <p className="font-medium">{viewingDeal.validUntil} · <span className={daysLeft <= 7 ? 'text-red-600' : 'text-gray-700'}>{daysLeft} jour{daysLeft !== 1 ? 's' : ''} restant{daysLeft !== 1 ? 's' : ''}</span></p>
                        </div>
                        {viewingDeal.availableQuantity !== undefined && viewingDeal.availableQuantity !== null && (
                          <div className="space-y-1">
                            <p className="text-gray-500">Quantité</p>
                            <p className="font-medium">{viewingDeal.availableQuantity} / {viewingDeal.maxQuantity ?? '∞'}</p>
                          </div>
                        )}
                        {viewingDeal.rating !== undefined && viewingDeal.rating !== null && (
                          <div className="space-y-1">
                            <p className="text-gray-500">Note</p>
                            <p className="font-medium">{viewingDeal.rating} / 5 ({viewingDeal.reviewCount} avis)</p>
                          </div>
                        )}
                        {viewingDeal.isPopular && (
                          <div className="col-span-2">
                            <Badge className="bg-red-100 text-red-700 border-0">Populaire</Badge>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-gray-500 text-sm">Description</p>
                        <p className="text-gray-800 text-sm leading-relaxed">{viewingDeal.description}</p>
                      </div>

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag, i) => <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>)}
                        </div>
                      )}

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setViewingDeal(null)}>Fermer</Button>
                        <Button onClick={() => { setViewingDeal(null); openEditDeal(viewingDeal); }} className="bg-indigo-600 hover:bg-indigo-700">
                          <Edit2 className="w-4 h-4 mr-2" />Modifier
                        </Button>
                      </DialogFooter>
                    </>
                  );
                })()}
              </DialogContent>
            </Dialog>

            {/* Deals Table */}
            <Card>
              <CardContent className="p-0">
                {dealsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                ) : deals.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Aucun bon plan</p>
                    <p className="text-sm">Créez votre premier bon plan en cliquant sur le bouton ci-dessus.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Marchand</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Prix réduit</TableHead>
                        <TableHead className="text-center">
                          <Percent className="w-4 h-4 inline" />
                        </TableHead>
                        <TableHead>Valide jusqu'au</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deals.map(deal => (
                        <TableRow key={deal.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">{deal.title}</TableCell>
                          <TableCell className="text-sm text-gray-600">{deal.merchantName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">{deal.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-indigo-600">
                            {new Intl.NumberFormat('fr-FR').format(deal.discountedPrice)} FCFA
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-green-100 text-green-800 border-0 text-xs">-{deal.discount}%</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{deal.validUntil}</TableCell>
                          <TableCell>
                            <Badge className={deal.status === 'published' ? 'bg-green-100 text-green-800 border-0' : 'bg-gray-100 text-gray-600 border-0'}>
                              {deal.status === 'published' ? 'Publié' : 'Brouillon'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => setViewingDeal(deal)}>
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openEditDeal(deal)}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer ce bon plan ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action est irréversible. Le bon plan "{deal.title}" sera définitivement supprimé.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteDeal(deal)} className="bg-red-600 hover:bg-red-700">
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
                )}
              </CardContent>
            </Card>

          </TabsContent>

          {/* Loisirs */}
          <TabsContent value="leisure" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Loisirs</h2>
                <p className="text-gray-600 text-sm">{leisureItems.length} établissement{leisureItems.length !== 1 ? 's' : ''} au total</p>
              </div>
              <Button onClick={openCreateLeisure} className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />Nouveau loisir
              </Button>
            </div>

            {/* Form dialog */}
            <Dialog open={isLeisureFormOpen} onOpenChange={setIsLeisureFormOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingLeisureItem ? 'Modifier le loisir' : 'Nouveau loisir'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                      <Label>Nom *</Label>
                      <Input value={leisureForm.name} onChange={e => setLeisureForm(f => ({ ...f, name: e.target.value }))} placeholder="Samba Lodge" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label>Description *</Label>
                      <div className="relative">
                        <textarea
                          value={leisureForm.description}
                          onChange={e => setLeisureForm(f => ({ ...f, description: e.target.value }))}
                          placeholder="Description détaillée de l'établissement..."
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                          style={{ height: '40px', overflowY: 'auto' }}
                        />
                        <div className={`text-xs mt-1 ${leisureForm.description.length >= 1000 ? 'text-green-600' : 'text-gray-400'}`}>
                          {leisureForm.description.length} / 1000 caractères
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Catégorie *</Label>
                      <Select value={leisureForm.categorySlug} onValueChange={(v: string) => setLeisureForm(f => ({ ...f, categorySlug: v }))}>
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                        <SelectContent>
                          {leisureCategories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Pays</Label>
                      <Select value={leisureForm.countryCode || 'all'} onValueChange={(v: string) => setLeisureForm(f => ({ ...f, countryCode: v === 'all' ? '' : v }))}>
                        <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les pays</SelectItem>
                          <SelectItem value="CG">Congo (CG)</SelectItem>
                          <SelectItem value="CD">RDC (CD)</SelectItem>
                          <SelectItem value="GA">Gabon (GA)</SelectItem>
                          <SelectItem value="CI">Côte d'Ivoire (CI)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Localisation *</Label>
                      <Input value={leisureForm.location} onChange={e => setLeisureForm(f => ({ ...f, location: e.target.value }))} placeholder="Brazzaville Centre" />
                    </div>
                    <div className="space-y-1">
                      <Label>Adresse</Label>
                      <Input value={leisureForm.address} onChange={e => setLeisureForm(f => ({ ...f, address: e.target.value }))} placeholder="Avenue du Fleuve..." />
                    </div>
                    <div className="space-y-1">
                      <Label>Téléphone</Label>
                      <Input value={leisureForm.phone} onChange={e => setLeisureForm(f => ({ ...f, phone: e.target.value }))} placeholder="+242 06 123 456" />
                    </div>
                    <div className="space-y-1">
                      <Label>Site web</Label>
                      <Input value={leisureForm.website} onChange={e => setLeisureForm(f => ({ ...f, website: e.target.value }))} placeholder="www.exemple.com" />
                    </div>
                    <div className="space-y-1">
                      <Label>Fourchette de prix</Label>
                      <Input value={leisureForm.priceRange} onChange={e => setLeisureForm(f => ({ ...f, priceRange: e.target.value }))} placeholder="15 000 - 45 000 FCFA" />
                    </div>
                    <div className="space-y-1">
                      <Label>Horaires</Label>
                      <Input value={leisureForm.openingHours} onChange={e => setLeisureForm(f => ({ ...f, openingHours: e.target.value }))} placeholder="08h00 - 22h00" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label>Image</Label>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors overflow-hidden relative">
                        {(leisureImagePreview || leisureForm.image) ? (
                          <img src={leisureImagePreview || leisureForm.image} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-400">
                            <ImageIcon className="w-8 h-8" />
                            <span className="text-sm">Cliquer pour choisir une image</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setLeisureImageFile(f); setLeisureImagePreview(URL.createObjectURL(f)); } }} />
                      </label>
                      {(leisureImagePreview || leisureForm.image) && (
                        <button type="button" onClick={() => { setLeisureImageFile(null); setLeisureImagePreview(''); setLeisureForm(f => ({ ...f, image: '' })); }} className="text-xs text-red-500 hover:underline mt-1">
                          Supprimer l&apos;image
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>Statut</Label>
                      <Select value={leisureForm.status} onValueChange={(v: string) => setLeisureForm(f => ({ ...f, status: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Publié</SelectItem>
                          <SelectItem value="draft">Brouillon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLeisureFormOpen(false)}>Annuler</Button>
                  <Button onClick={handleSaveLeisure} disabled={leisureFormLoading} className="bg-indigo-600 hover:bg-indigo-700">
                    {leisureFormLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {editingLeisureItem ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Detail dialog */}
            <Dialog open={!!viewingLeisureItem} onOpenChange={(open: boolean) => { if (!open) setViewingLeisureItem(null); }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {viewingLeisureItem && (() => {
                  let tags: string[] = [];
                  let features: string[] = [];
                  try { tags = JSON.parse(viewingLeisureItem.tags); } catch { tags = []; }
                  try { features = JSON.parse(viewingLeisureItem.features); } catch { features = []; }
                  return (
                    <>
                      <DialogHeader>
                        <DialogTitle className="text-xl">{viewingLeisureItem.name}</DialogTitle>
                        <DialogDescription>{viewingLeisureItem.category?.name} · {viewingLeisureItem.location}</DialogDescription>
                      </DialogHeader>

                      <div className="rounded-lg overflow-hidden h-52 bg-gray-100">
                        {viewingLeisureItem.image
                          ? <img src={viewingLeisureItem.image} alt={viewingLeisureItem.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                              <ImageIcon className="w-12 h-12" />
                              <span className="text-sm">Pas d'image</span>
                            </div>
                        }
                      </div>

                      <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-gray-500">Catégorie</p>
                          <Badge variant="outline" className="capitalize">{viewingLeisureItem.category?.name ?? viewingLeisureItem.categorySlug}</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500">Statut</p>
                          <Badge className={viewingLeisureItem.status === 'published' ? 'bg-green-100 text-green-800 border-0' : 'bg-gray-100 text-gray-600 border-0'}>
                            {viewingLeisureItem.status === 'published' ? 'Publié' : 'Brouillon'}
                          </Badge>
                        </div>
                        {viewingLeisureItem.priceRange && (
                          <div className="space-y-1">
                            <p className="text-gray-500">Prix</p>
                            <p className="font-semibold text-indigo-600">{viewingLeisureItem.priceRange}</p>
                          </div>
                        )}
                        {viewingLeisureItem.openingHours && (
                          <div className="space-y-1">
                            <p className="text-gray-500">Horaires</p>
                            <p className="font-medium">{viewingLeisureItem.openingHours}</p>
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="text-gray-500">Localisation</p>
                          <p className="font-medium">{viewingLeisureItem.location}</p>
                        </div>
                        {viewingLeisureItem.address && (
                          <div className="space-y-1">
                            <p className="text-gray-500">Adresse</p>
                            <p className="font-medium">{viewingLeisureItem.address}</p>
                          </div>
                        )}
                        {viewingLeisureItem.phone && (
                          <div className="space-y-1">
                            <p className="text-gray-500">Téléphone</p>
                            <p className="font-medium">{viewingLeisureItem.phone}</p>
                          </div>
                        )}
                        {viewingLeisureItem.website && (
                          <div className="space-y-1">
                            <p className="text-gray-500">Site web</p>
                            <a href={viewingLeisureItem.website.startsWith('http') ? viewingLeisureItem.website : `https://${viewingLeisureItem.website}`} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:underline">{viewingLeisureItem.website}</a>
                          </div>
                        )}
                        {viewingLeisureItem.countryCode && (
                          <div className="space-y-1">
                            <p className="text-gray-500">Pays</p>
                            <p className="font-medium">{viewingLeisureItem.countryCode}</p>
                          </div>
                        )}
                        {viewingLeisureItem.rating !== undefined && viewingLeisureItem.rating !== null && (
                          <div className="space-y-1">
                            <p className="text-gray-500">Note</p>
                            <p className="font-medium">{viewingLeisureItem.rating} / 5 ({viewingLeisureItem.reviewCount ?? 0} avis)</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-gray-500 text-sm">Description</p>
                        <p className="text-gray-800 text-sm leading-relaxed">{viewingLeisureItem.description}</p>
                      </div>

                      {features.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-gray-500 text-sm">Équipements & Services</p>
                          <div className="flex flex-wrap gap-2">
                            {features.map((f, i) => <Badge key={i} variant="outline" className="text-xs">{f}</Badge>)}
                          </div>
                        </div>
                      )}

                      {tags.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-gray-500 text-sm">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {tags.map((t, i) => <Badge key={i} className="bg-indigo-50 text-indigo-700 border-0 text-xs">{t}</Badge>)}
                          </div>
                        </div>
                      )}

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setViewingLeisureItem(null)}>Fermer</Button>
                        <Button onClick={() => { setViewingLeisureItem(null); openEditLeisure(viewingLeisureItem); }} className="bg-indigo-600 hover:bg-indigo-700">
                          <Edit2 className="w-4 h-4 mr-2" />Modifier
                        </Button>
                      </DialogFooter>
                    </>
                  );
                })()}
              </DialogContent>
            </Dialog>

            {leisureLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
            ) : (
              <div className="grid gap-4">
                {leisureItems.length === 0 && (
                  <Card><CardContent className="py-12 text-center text-gray-500">Aucun loisir créé. Cliquez sur "Nouveau loisir" pour commencer.</CardContent></Card>
                )}
                {leisureItems.map(item => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-500">{item.category?.name} · {item.location}</p>
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>{item.status === 'published' ? 'Publié' : 'Brouillon'}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 self-start">
                          <Button size="sm" variant="outline" onClick={() => setViewingLeisureItem(item)}>
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEditLeisure(item)}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer "{item.name}" ?</AlertDialogTitle>
                                <AlertDialogDescription>Cet établissement sera supprimé définitivement.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteLeisure(item)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Gestion de la livraison */}
          <TabsContent value="delivery" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Zones & Villes de livraison</h2>
                <p className="text-muted-foreground text-sm">Gérez les zones de livraison par pays et leurs villes associées</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadDeliveryData} disabled={deliveryLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${deliveryLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>

            <Tabs value={deliveryTab} onValueChange={(v: string) => setDeliveryTab(v as 'zones' | 'cities')}>
              <TabsList>
                <TabsTrigger value="zones">Zones ({deliveryZones.length})</TabsTrigger>
                <TabsTrigger value="cities">Villes ({deliveryCities.length})</TabsTrigger>
              </TabsList>

              {/* ── Zones ── */}
              <TabsContent value="zones" className="space-y-4 mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setZoneForm({ name: '', countryCode: '', fee: 0, currency: 'FCFA', description: '' })}>
                      <Plus className="w-4 h-4 mr-2" /> Nouvelle zone
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>{editingZone ? 'Modifier la zone' : 'Nouvelle zone de livraison'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label>Pays *</Label>
                        <Select value={zoneForm.countryCode} onValueChange={(v: string) => setZoneForm(f => ({ ...f, countryCode: v }))}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner un pays" /></SelectTrigger>
                          <SelectContent className="bg-white">
                            {adminCountries.map(c => (
                              <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Nom de la zone *</Label>
                        <Input value={zoneForm.name} onChange={e => setZoneForm(f => ({ ...f, name: e.target.value }))} placeholder="Zone 1, Zone 2..." />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Frais (montant) *</Label>
                          <Input type="number" min={0} value={zoneForm.fee} onChange={e => setZoneForm(f => ({ ...f, fee: Number(e.target.value) }))} />
                        </div>
                        <div className="space-y-1">
                          <Label>Devise</Label>
                          <Input value={zoneForm.currency} onChange={e => setZoneForm(f => ({ ...f, currency: e.target.value }))} placeholder="FCFA" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label>Description</Label>
                        <Input value={zoneForm.description} onChange={e => setZoneForm(f => ({ ...f, description: e.target.value }))} placeholder="Optionnel" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={async () => {
                        try {
                          if (editingZone) {
                            const updated = await DeliveryAPI.updateZone(editingZone.id, { name: zoneForm.name, fee: zoneForm.fee, currency: zoneForm.currency, description: zoneForm.description });
                            setDeliveryZones(prev => prev.map(z => z.id === editingZone.id ? updated : z));
                            toast.success('Zone mise à jour');
                          } else {
                            const created = await DeliveryAPI.createZone(zoneForm);
                            setDeliveryZones(prev => [...prev, created]);
                            toast.success('Zone créée');
                          }
                          setEditingZone(null);
                        } catch (err: any) {
                          toast.error(firebaseClientErrorToUserMessage(err, 'Erreur'));
                        }
                      }}>Enregistrer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pays</TableHead>
                        <TableHead>Zone</TableHead>
                        <TableHead>Frais</TableHead>
                        <TableHead>Villes</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveryZones.map(zone => (
                        <TableRow key={zone.id}>
                          <TableCell className="font-medium">{zone.country?.flag} {zone.country?.name}</TableCell>
                          <TableCell>{zone.name}</TableCell>
                          <TableCell>{new Intl.NumberFormat('fr-FR').format(zone.fee)} {zone.currency}</TableCell>
                          <TableCell>{zone._count?.cities ?? 0}</TableCell>
                          <TableCell>
                            <Badge variant={zone.isActive ? 'default' : 'secondary'}>{zone.isActive ? 'Actif' : 'Inactif'}</Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditingZone(zone); setZoneForm({ name: zone.name, countryCode: zone.countryCode, fee: zone.fee, currency: zone.currency, description: zone.description || '' }); }}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive"><Trash2 className="w-3 h-3" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer la zone ?</AlertDialogTitle>
                                  <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={async () => {
                                    try {
                                      await DeliveryAPI.deleteZone(zone.id);
                                      setDeliveryZones(prev => prev.filter(z => z.id !== zone.id));
                                      toast.success('Zone supprimée');
                                    } catch (err: any) {
                                      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur'));
                                    }
                                  }}>Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                      {deliveryZones.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucune zone créée</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              {/* ── Villes ── */}
              <TabsContent value="cities" className="space-y-4 mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setCityForm({ name: '', countryCode: '', zoneId: '' })}>
                      <Plus className="w-4 h-4 mr-2" /> Nouvelle ville
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>{editingCity ? 'Modifier la ville' : 'Nouvelle ville / commune'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label>Pays *</Label>
                        <Select value={cityForm.countryCode} onValueChange={(v: string) => setCityForm(f => ({ ...f, countryCode: v, zoneId: '' }))}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner un pays" /></SelectTrigger>
                          <SelectContent className="bg-white">
                            {Array.from(new Set(deliveryZones.map(z => z.countryCode))).map(code => {
                              const z = deliveryZones.find(z => z.countryCode === code);
                              return <SelectItem key={code} value={code}>{z?.country?.flag} {z?.country?.name}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Zone *</Label>
                        <Select value={cityForm.zoneId} onValueChange={(v: string) => setCityForm(f => ({ ...f, zoneId: v }))} disabled={!cityForm.countryCode}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner une zone" /></SelectTrigger>
                          <SelectContent className="bg-white">
                            {deliveryZones.filter(z => z.countryCode === cityForm.countryCode).map(z => (
                              <SelectItem key={z.id} value={z.id}>{z.name} — {new Intl.NumberFormat('fr-FR').format(z.fee)} {z.currency}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Nom de la ville *</Label>
                        <Input value={cityForm.name} onChange={e => setCityForm(f => ({ ...f, name: e.target.value }))} placeholder="Libreville, Brazzaville..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={async () => {
                        try {
                          if (editingCity) {
                            const updated = await DeliveryAPI.updateCity(editingCity.id, { name: cityForm.name, zoneId: cityForm.zoneId });
                            setDeliveryCities(prev => prev.map(c => c.id === editingCity.id ? updated : c));
                            toast.success('Ville mise à jour');
                          } else {
                            const created = await DeliveryAPI.createCity(cityForm);
                            setDeliveryCities(prev => [...prev, created]);
                            toast.success('Ville créée');
                          }
                          setEditingCity(null);
                        } catch (err: any) {
                          toast.error(firebaseClientErrorToUserMessage(err, 'Erreur'));
                        }
                      }}>Enregistrer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ville</TableHead>
                        <TableHead>Pays</TableHead>
                        <TableHead>Zone</TableHead>
                        <TableHead>Frais zone</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveryCities.map(city => (
                        <TableRow key={city.id}>
                          <TableCell className="font-medium">{city.name}</TableCell>
                          <TableCell>{city.country?.flag} {city.country?.name}</TableCell>
                          <TableCell>{city.zone?.name}</TableCell>
                          <TableCell>{city.zone ? `${new Intl.NumberFormat('fr-FR').format(city.zone.fee)} ${city.zone.currency}` : '—'}</TableCell>
                          <TableCell>
                            <Badge variant={city.isActive ? 'default' : 'secondary'}>{city.isActive ? 'Active' : 'Inactive'}</Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditingCity(city); setCityForm({ name: city.name, countryCode: city.countryCode, zoneId: city.zoneId }); }}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive"><Trash2 className="w-3 h-3" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer la ville ?</AlertDialogTitle>
                                  <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={async () => {
                                    try {
                                      await DeliveryAPI.deleteCity(city.id);
                                      setDeliveryCities(prev => prev.filter(c => c.id !== city.id));
                                      toast.success('Ville supprimée');
                                    } catch (err: any) {
                                      toast.error(firebaseClientErrorToUserMessage(err, 'Erreur'));
                                    }
                                  }}>Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                      {deliveryCities.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucune ville créée</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* ── Gestion des packs promotionnels événements ──────────────────── */}
          <TabsContent value="promotions" className="space-y-6">
            <PromotionsTab events={events} />
          </TabsContent>

          {/* ── Suivi des achats self-service ────────────────────────────────── */}
          <TabsContent value="promo-suivi" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Suivi des promotions</h2>
              <p className="text-sm text-gray-500">Historique de tous les achats de packs promotionnels par les organisateurs.</p>
            </div>
            <PromotionSuiviTab />
          </TabsContent>

          {/* ── Configuration des packs (prix, desc, avantages) ─────────────── */}
          <TabsContent value="pack-config" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Configuration des packs</h2>
              <p className="text-sm text-gray-500">Définissez le prix, la durée, la description et les avantages de chaque pack affiché aux organisateurs.</p>
            </div>
            <PackConfigTab />
          </TabsContent>

          {/* ── Promotions Bon Plans ─────────────────────────────────────────── */}
          <TabsContent value="deal-promos" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Promotions Bon Plans</h2>
              <p className="text-sm text-gray-500">Attribuez un pack promotionnel à un bon plan pour le positionner dans le slider homepage.</p>
            </div>
            <DealPromotionsTab deals={deals} />
          </TabsContent>

          {/* ── Gestion des promotions loisirs ──────────────────────────────── */}
          <TabsContent value="leisure-promos" className="space-y-6">
            <LeisurePromotionsTab />
          </TabsContent>

          {/* ── Tarification établissements ────────────────────────────────── */}
          <TabsContent value="establishment-pricing" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Tarification — Propriétaires d'établissement</h2>
              <p className="text-sm text-gray-500">Définissez les frais d'abonnement annuel et de création de bon plan.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                    Frais d'abonnement
                  </CardTitle>
                  <CardDescription>Montant payé annuellement par le propriétaire pour chaque établissement inscrit.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Abonnement annuel</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={estPricing.establishmentAnnualFee}
                        onChange={e => setEstPricing(p => ({ ...p, establishmentAnnualFee: Number(e.target.value) }))}
                      />
                      <span className="flex items-center text-sm text-gray-500 whitespace-nowrap">{estPricing.currency}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Durée abonnement (jours)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={estPricing.subscriptionDurationDays}
                      onChange={e => setEstPricing(p => ({ ...p, subscriptionDurationDays: Number(e.target.value) }))}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-red-500" />
                    Frais de bon plan
                  </CardTitle>
                  <CardDescription>Montant payé à chaque publication d'un bon plan par un propriétaire d'établissement.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Frais par bon plan</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={estPricing.bonplanCreationFee}
                        onChange={e => setEstPricing(p => ({ ...p, bonplanCreationFee: Number(e.target.value) }))}
                      />
                      <span className="flex items-center text-sm text-gray-500 whitespace-nowrap">{estPricing.currency}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Devise</Label>
                    <Select value={estPricing.currency} onValueChange={(v: string) => setEstPricing(p => ({ ...p, currency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FCFA">FCFA</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSaveEstPricing}
                disabled={estPricingSaving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {estPricingSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Enregistrer la tarification
              </Button>
            </div>
          </TabsContent>

          {/* ── Abonnements établissements ────────────────────────────────── */}
          <TabsContent value="subscriptions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Abonnements Établissements</h2>
                <p className="text-sm text-gray-500">{adminSubs.length} abonnement{adminSubs.length !== 1 ? 's' : ''} au total</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadAdminSubs} disabled={adminSubsLoading}>
                <RefreshCw className={`w-4 h-4 ${adminSubsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                {adminSubsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                ) : adminSubs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Aucun abonnement</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Établissement</TableHead>
                        <TableHead>Propriétaire (ID)</TableHead>
                        <TableHead>Début</TableHead>
                        <TableHead>Fin</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Méthode</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Réf. paiement</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminSubs.map(sub => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.leisureItem?.name ?? sub.leisureItemId}</TableCell>
                          <TableCell className="text-xs font-mono text-gray-500">{sub.userId.slice(0, 8)}…</TableCell>
                          <TableCell className="text-sm">{new Date(sub.startDate).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell className="text-sm">{new Date(sub.endDate).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell className="font-semibold text-indigo-600">{new Intl.NumberFormat('fr-FR').format(sub.amount)} {sub.currency}</TableCell>
                          <TableCell className="text-sm capitalize">{sub.paymentMethod ?? '—'}</TableCell>
                          <TableCell>
                            <Badge className={
                              sub.status === 'active' ? 'bg-green-100 text-green-800 border-0' :
                              sub.status === 'expired' ? 'bg-gray-100 text-gray-600 border-0' :
                              sub.status === 'cancelled' ? 'bg-red-100 text-red-700 border-0' :
                              'bg-yellow-100 text-yellow-800 border-0'
                            }>
                              {sub.status === 'active' ? 'Actif' : sub.status === 'expired' ? 'Expiré' : sub.status === 'cancelled' ? 'Annulé' : 'En attente'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-gray-400">{sub.paymentRef?.slice(0, 12) ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Paiements Bon Plans ───────────────────────────────────────── */}
          <TabsContent value="deal-payments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Paiements Bon Plans</h2>
                <p className="text-sm text-gray-500">{adminDealPayments.length} paiement{adminDealPayments.length !== 1 ? 's' : ''} au total</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadAdminDealPayments} disabled={adminDealPaymentsLoading}>
                <RefreshCw className={`w-4 h-4 ${adminDealPaymentsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                {adminDealPaymentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                ) : adminDealPayments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Aucun paiement de bon plan</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bon Plan</TableHead>
                        <TableHead>Établissement</TableHead>
                        <TableHead>Propriétaire (ID)</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Méthode</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Réf. paiement</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminDealPayments.map(dp => (
                        <TableRow key={dp.id}>
                          <TableCell className="font-medium max-w-[160px] truncate">{dp.deal?.title ?? <span className="text-gray-400 italic">En attente</span>}</TableCell>
                          <TableCell className="text-sm">{dp.leisureItem?.name ?? dp.leisureItemId.slice(0, 8)}</TableCell>
                          <TableCell className="text-xs font-mono text-gray-500">{dp.userId.slice(0, 8)}…</TableCell>
                          <TableCell className="font-semibold text-indigo-600">{new Intl.NumberFormat('fr-FR').format(dp.amount)} {dp.currency}</TableCell>
                          <TableCell className="text-sm capitalize">{dp.paymentMethod ?? '—'}</TableCell>
                          <TableCell>
                            <Badge className={
                              dp.status === 'paid' ? 'bg-green-100 text-green-800 border-0' :
                              dp.status === 'failed' ? 'bg-red-100 text-red-700 border-0' :
                              'bg-yellow-100 text-yellow-800 border-0'
                            }>
                              {dp.status === 'paid' ? 'Payé' : dp.status === 'failed' ? 'Échoué' : 'En attente'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">{new Date(dp.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell className="text-xs font-mono text-gray-400">{dp.paymentRef?.slice(0, 12) ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Badges Feeti Access — tarification & commandes ────────── */}
          <TabsContent value="badge-pricing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Config tarification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-600"/>Tarification des badges</CardTitle>
                  <CardDescription>Coût unitaire par badge (en simulation)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Coût par badge (FCFA)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number" min={0}
                        value={badgePricingUnitCost}
                        onChange={e => setBadgePricingUnitCost(parseInt(e.target.value) || 0)}
                        className="max-w-[180px]"
                      />
                      <span className="text-sm text-gray-500">FCFA / badge</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md text-xs text-gray-600">
                    Exemple : {badgePricingUnitCost} FCFA × 100 badges = <strong>{(badgePricingUnitCost * 100).toLocaleString('fr-FR')} FCFA</strong>
                  </div>
                  <Button onClick={handleSaveBadgePricing} disabled={badgePricingSaving} className="bg-emerald-600 hover:bg-emerald-700">
                    {badgePricingSaving && <Loader2 className="w-4 h-4 animate-spin mr-2"/>}
                    Enregistrer
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Commandes de badges */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Commandes de badges</h2>
                <p className="text-sm text-gray-500">{adminBadgeOrders.length} commande{adminBadgeOrders.length !== 1 ? 's' : ''}</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadAdminBadgeOrders} disabled={badgeOrdersLoading}>
                <RefreshCw className={`w-4 h-4 ${badgeOrdersLoading ? 'animate-spin' : ''}`}/>
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                {badgeOrdersLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600"/></div>
                ) : adminBadgeOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300"/>
                    <p className="font-medium">Aucune commande</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organisateur</TableHead>
                        <TableHead>Événement</TableHead>
                        <TableHead>Badges</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminBadgeOrders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="text-sm">{order.organizer?.name ?? '—'}<br/><span className="text-xs text-gray-400">{order.organizer?.email}</span></TableCell>
                          <TableCell className="text-sm">{order.event?.title ?? '—'}</TableCell>
                          <TableCell className="font-semibold">{order.quantity}</TableCell>
                          <TableCell className="font-semibold text-emerald-700">{order.totalAmount?.toLocaleString('fr-FR')} {order.currency}</TableCell>
                          <TableCell>
                            <Badge className={order.status === 'paid' ? 'bg-green-100 text-green-800 border-0' : order.status === 'cancelled' ? 'bg-red-100 text-red-800 border-0' : 'bg-yellow-100 text-yellow-800 border-0'}>
                              {order.status === 'paid' ? 'Payé' : order.status === 'cancelled' ? 'Annulé' : 'En attente'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres et Sécurité */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres Généraux</CardTitle>
                  <CardDescription>Configuration de la plateforme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="platform-name">Nom de la plateforme</Label>
                    <Input
                      id="platform-name"
                      value={settingsForm.platformName}
                      onChange={e => setSettingsForm(f => ({ ...f, platformName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="commission">Commission (%)</Label>
                    <Input
                      id="commission"
                      type="number"
                      min={0}
                      max={100}
                      value={settingsForm.commissionRate}
                      onChange={e => setSettingsForm(f => ({ ...f, commissionRate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tva-rate">Taux TVA (%)</Label>
                    <Input
                      id="tva-rate"
                      type="number"
                      min={0}
                      max={100}
                      value={settingsForm.tvaRate}
                      onChange={e => setSettingsForm(f => ({ ...f, tvaRate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Devise par défaut</Label>
                    <Select
                      value={settingsForm.defaultCurrency}
                      onValueChange={(v: string) => setSettingsForm(f => ({ ...f, defaultCurrency: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fcfa">FCFA</SelectItem>
                        <SelectItem value="eur">EUR</SelectItem>
                        <SelectItem value="usd">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenance"
                      checked={settingsForm.maintenanceMode === 'true'}
                      onCheckedChange={(checked: boolean) => setSettingsForm(f => ({ ...f, maintenanceMode: String(checked) }))}
                    />
                    <Label htmlFor="maintenance">Mode maintenance</Label>
                  </div>
                  <Button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Enregistrer
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sécurité</CardTitle>
                  <CardDescription>Protection et surveillance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Authentification 2FA</p>
                      <p className="text-sm text-muted-foreground">Pour les administrateurs</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Détection de fraude</p>
                      <p className="text-sm text-muted-foreground">Surveillance automatique</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Logs d'activité</p>
                      <p className="text-sm text-muted-foreground">Enregistrement des actions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gestion des pays */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-600" />
                    Gestion des Pays
                  </div>
                  <Button variant="outline" size="sm" onClick={loadAllCountries} disabled={countriesLoading}>
                    <RefreshCw className={`w-4 h-4 ${countriesLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
                <CardDescription>Pays disponibles sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Form add / edit */}
                {editingCountry ? (
                  <div className="flex gap-3 flex-wrap items-end p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="space-y-1 w-20">
                      <label className="text-xs font-medium text-gray-700">Code ISO *</label>
                      <Input value={editingCountry.code} disabled className="font-mono uppercase" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-[140px]">
                      <label className="text-xs font-medium text-gray-700">Nom *</label>
                      <Input value={editingCountry.name} onChange={e => setEditingCountry(c => c ? { ...c, name: e.target.value } : c)} placeholder="Ex : Congo" />
                    </div>
                    <div className="space-y-1 w-24">
                      <label className="text-xs font-medium text-gray-700">Drapeau (emoji)</label>
                      <Input value={editingCountry.flag} onChange={e => setEditingCountry(c => c ? { ...c, flag: e.target.value } : c)} placeholder="🇨🇬" />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateCountry} disabled={countriesLoading} className="bg-indigo-600 hover:bg-indigo-700">
                        {countriesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                      </Button>
                      <Button variant="outline" onClick={() => setEditingCountry(null)}>Annuler</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 flex-wrap items-end">
                    <div className="space-y-1 w-20">
                      <label className="text-xs font-medium text-gray-700">Code ISO *</label>
                      <Input value={countryForm.code} onChange={e => setCountryForm(f => ({ ...f, code: e.target.value.toUpperCase().slice(0, 2) }))} placeholder="CG" className="font-mono uppercase" maxLength={2} />
                    </div>
                    <div className="space-y-1 flex-1 min-w-[140px]">
                      <label className="text-xs font-medium text-gray-700">Nom *</label>
                      <Input value={countryForm.name} onChange={e => setCountryForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex : Congo" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCountry(); }}} />
                    </div>
                    <div className="space-y-1 w-24">
                      <label className="text-xs font-medium text-gray-700">Drapeau (emoji)</label>
                      <Input value={countryForm.flag} onChange={e => setCountryForm(f => ({ ...f, flag: e.target.value }))} placeholder="🇨🇬" />
                    </div>
                    <Button onClick={handleAddCountry} disabled={countriesLoading} className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                      {countriesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />Ajouter</>}
                    </Button>
                  </div>
                )}

                {/* List */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {countriesLoading && allCountries.length === 0 && (
                    <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-indigo-600" /></div>
                  )}
                  {!countriesLoading && allCountries.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Aucun pays configuré.</p>
                  )}
                  {allCountries.map(country => (
                    <div key={country.code} className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${country.isActive ? 'bg-gray-50 hover:bg-gray-100' : 'bg-red-50 opacity-70'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{country.flag || '🏳️'}</span>
                        <div>
                          <span className="font-medium text-gray-900">{country.name}</span>
                          <span className="ml-2 text-xs font-mono text-gray-400">{country.code}</span>
                          {!country.isActive && <Badge variant="destructive" className="ml-2 text-xs">Inactif</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" title={country.isActive ? 'Désactiver' : 'Activer'} onClick={() => handleToggleCountryActive(country)} className={country.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}>
                          {country.isActive ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingCountry(country)}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer "{country.name}" ?</AlertDialogTitle>
                              <AlertDialogDescription>Les événements liés à ce pays seront dissociés.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCountry(country)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">{allCountries.filter(c => c.isActive).length} pays actif(s) sur {allCountries.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Journal d'Activité
                  <Button variant="outline" size="sm" onClick={() => { setSettingsAudit([]); loadSettingsAudit(); }} disabled={settingsAuditLoading}>
                    <RefreshCw className={`w-4 h-4 ${settingsAuditLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
                <CardDescription>Dernières actions administratives</CardDescription>
              </CardHeader>
              <CardContent>
                {settingsAuditLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  </div>
                ) : settingsAudit.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucune entrée d'audit disponible</p>
                ) : (
                  <div className="space-y-3">
                    {settingsAudit.map(entry => (
                      <div key={entry.id} className="flex items-center space-x-3 p-3 border rounded">
                        <Shield className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{entry.action} — <span className="text-muted-foreground font-normal">{entry.resource}{entry.resourceId ? ` #${entry.resourceId.slice(0, 8)}` : ''}</span></p>
                          <p className="text-xs text-muted-foreground">{entry.userRole} · {new Date(entry.createdAt).toLocaleString('fr-FR')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Dialog Voir utilisateur */}
      <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Informations utilisateur</DialogTitle>
            <DialogDescription>Détails complets du compte</DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-lg">{viewingUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-lg">{viewingUser.name}</div>
                  <Badge variant={viewingUser.role === 'admin' || viewingUser.role === 'super_admin' ? 'destructive' : 'secondary'}>
                    {viewingUser.role}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium text-gray-700 w-24">ID :</span>
                  <span className="font-mono text-xs break-all">{viewingUser.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 w-24">Email :</span>
                  <span>{viewingUser.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 w-24">Téléphone :</span>
                  <span>{viewingUser.phone || <span className="text-muted-foreground">Non renseigné</span>}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 w-24">Inscrit le :</span>
                  <span>{new Date(viewingUser.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 w-24">Mis à jour :</span>
                  <span>{new Date(viewingUser.updatedAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-indigo-700">{viewingUser._count.events}</div>
                  <div className="text-xs text-muted-foreground mt-1">Événement(s)</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-700">{viewingUser._count.tickets}</div>
                  <div className="text-xs text-muted-foreground mt-1">Billet(s)</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewUserOpen(false)}>Fermer</Button>
            {hasPermission('admin') && viewingUser && (
              <Button onClick={() => { setIsViewUserOpen(false); setRoleChangeUser(viewingUser); setNewRole(viewingUser.role); }}>
                <Key className="w-4 h-4 mr-2" /> Changer le rôle
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Voir événement */}
      <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
        <DialogContent className="max-w-2xl flex flex-col p-0 gap-0 max-h-[90vh]">
          {/* Header fixe */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle>Détails de l'événement</DialogTitle>
            <DialogDescription>Informations complètes soumises par l'organisateur</DialogDescription>
          </DialogHeader>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
            {viewingEvent && (
              <>
                {viewingEvent.image && (
                  <img src={viewingEvent.image} alt={viewingEvent.title} className="w-full h-48 object-cover rounded-lg" />
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <span className="font-semibold text-lg">{viewingEvent.title}</span>
                    <Badge className="ml-2" variant={viewingEvent.status === 'published' ? 'default' : viewingEvent.status === 'draft' ? 'secondary' : 'destructive'}>
                      {viewingEvent.status === 'published' ? 'Publié' : viewingEvent.status === 'draft' ? 'En attente' : 'Rejeté'}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-muted-foreground">{viewingEvent.description}</div>
                  <div><span className="font-medium">Date :</span> {viewingEvent.date} à {viewingEvent.time}</div>
                  <div><span className="font-medium">Lieu :</span> {viewingEvent.location}</div>
                  <div><span className="font-medium">Catégorie :</span> {viewingEvent.category}</div>
                  <div><span className="font-medium">Prix :</span> {viewingEvent.price === 0 ? 'Gratuit' : `${viewingEvent.price.toLocaleString()} ${viewingEvent.currency}`}</div>
                  <div><span className="font-medium">Places max :</span> {viewingEvent.maxAttendees}</div>
                  <div><span className="font-medium">Participants :</span> {viewingEvent.attendees}</div>
                  {viewingEvent.isLive && <div className="col-span-2"><Badge className="bg-red-500 text-white">Live Streaming activé</Badge></div>}
                </div>

                {/* Organizer info */}
                <div className="pt-3 border-t">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Organisateur</p>
                  {viewingOrganizer ? (
                    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{viewingOrganizer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{viewingOrganizer.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{viewingOrganizer.email}</div>
                        {viewingOrganizer.phone && <div className="text-xs text-muted-foreground">{viewingOrganizer.phone}</div>}
                        <Badge variant="secondary" className="text-xs mt-1">{viewingOrganizer.role}</Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">ID : {viewingEvent.organizerId}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Boutons d'action — footer fixe */}
          {viewingEvent && (
            <div className="px-6 py-4 border-t flex-shrink-0 flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => { handleEventAction('approve', viewingEvent); setIsViewEventOpen(false); }}
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Approuver
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => { handleEventAction('reject', viewingEvent); setIsViewEventOpen(false); }}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {viewingEvent.status === 'published' ? 'Dépublier' : 'Rejeter'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
