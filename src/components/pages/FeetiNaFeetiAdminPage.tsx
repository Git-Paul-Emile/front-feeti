import {
  ArrowLeft, Users, TrendingUp, Gift, Award, Target, BarChart3, Settings,
  Plus, Edit, Trash2, Search, Download, Star, Crown, Trophy, Zap, Loader2,
  AlertCircle, Check, X, Shield, MessageSquare, Sparkles, Store, Bell,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  loyaltyApi,
  type LoyaltyReward, type LoyaltyPartner, type LoyaltyMission,
  type AdminStats, type LoyaltyBonus, type CommunityPost, type FraudAlerts,
} from '../../api/loyalty';

interface Props { onBack: () => void; currentUser: any; }

type Tab = 'dashboard' | 'users' | 'points' | 'rewards' | 'partners' | 'missions' | 'community' | 'bonuses' | 'vip' | 'fraud' | 'settings';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'Mobembo': return <Star className="w-4 h-4" />;
    case 'Elengi':  return <Award className="w-4 h-4" />;
    case 'Momi':    return <Crown className="w-4 h-4" />;
    case 'Mwana':   return <Zap className="w-4 h-4" />;
    case 'Boboto':  return <Trophy className="w-4 h-4" />;
    default:        return <Star className="w-4 h-4" />;
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Mobembo': return 'bg-gray-100 text-gray-700';
    case 'Elengi':  return 'bg-blue-100 text-blue-700';
    case 'Momi':    return 'bg-purple-100 text-purple-700';
    case 'Mwana':   return 'bg-orange-100 text-orange-700';
    case 'Boboto':  return 'bg-yellow-100 text-yellow-700';
    default:        return 'bg-gray-100 text-gray-700';
  }
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Reward form modal ────────────────────────────────────────────────────────

function RewardForm({ reward, onSave, onClose }: {
  reward?: Partial<LoyaltyReward>;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: reward?.title ?? '',
    description: reward?.description ?? '',
    points: reward?.points ?? 50,
    category: reward?.category ?? 'Billets',
    image: reward?.image ?? '',
    stock: reward?.stock ?? 10,
    isActive: reward?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={reward?.id ? 'Modifier la récompense' : 'Nouvelle récompense'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {([
          { label: 'Titre', key: 'title', type: 'text' },
          { label: 'Description', key: 'description', type: 'text' },
          { label: 'Points requis', key: 'points', type: 'number' },
          { label: 'Stock', key: 'stock', type: 'number' },
          { label: 'URL image', key: 'image', type: 'text' },
        ] as { label: string; key: string; type: string }[]).map(({ label, key, type }) => (
          <FormField key={key} label={label}>
            <input
              type={type}
              value={(form as any)[key]}
              onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
              className={INPUT_CLS}
              required={key !== 'image'}
            />
          </FormField>
        ))}
        <FormField label="Catégorie">
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={INPUT_CLS}>
            {['Billets', 'VIP', 'Restaurants', 'Expériences', 'Partenaires'].map(c => <option key={c}>{c}</option>)}
          </select>
        </FormField>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
          Actif
        </label>
        <ModalActions onClose={onClose} saving={saving} />
      </form>
    </Modal>
  );
}

// ─── Partner form modal ───────────────────────────────────────────────────────

function PartnerForm({ partner, onSave, onClose }: {
  partner?: Partial<LoyaltyPartner>;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: partner?.name ?? '',
    description: partner?.description ?? '',
    category: partner?.category ?? 'Restaurant',
    discount: partner?.discount ?? '5%',
    discountByLevel: partner?.discountByLevel ?? { Mobembo: '5%', Elengi: '10%', Momi: '20%', Mwana: '30%', Boboto: '40%' },
    bonusPoints: partner?.bonusPoints ?? 0,
    logo: partner?.logo ?? '',
    address: partner?.address ?? '',
    phone: partner?.phone ?? '',
    website: partner?.website ?? '',
    isActive: partner?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  const setDiscount = (level: string, val: string) =>
    setForm(f => ({ ...f, discountByLevel: { ...f.discountByLevel, [level]: val } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={partner?.id ? 'Modifier le partenaire' : 'Nouveau partenaire'} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nom *"><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={INPUT_CLS} required /></FormField>
          <FormField label="Catégorie">
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={INPUT_CLS}>
              {['Restaurant', 'Bar & Club', 'Hôtel', 'Bien-être', 'Boutique', 'Loisirs', 'Médical'].map(c => <option key={c}>{c}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Description"><input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={INPUT_CLS} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Téléphone"><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={INPUT_CLS} /></FormField>
          <FormField label="Site web"><input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className={INPUT_CLS} /></FormField>
        </div>
        <FormField label="Adresse"><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={INPUT_CLS} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Logo (URL ou emoji)"><input value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} className={INPUT_CLS} /></FormField>
          <FormField label="Bonus pts / 1000 FCFA"><input type="number" value={form.bonusPoints} onChange={e => setForm(f => ({ ...f, bonusPoints: Number(e.target.value) }))} className={INPUT_CLS} min={0} /></FormField>
        </div>
        {/* Remises par niveau */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Remises par niveau</p>
          <div className="grid grid-cols-5 gap-2">
            {(['Mobembo', 'Elengi', 'Momi', 'Mwana', 'Boboto'] as const).map(level => (
              <div key={level}>
                <label className="block text-xs text-gray-500 mb-1">{level}</label>
                <input
                  value={(form.discountByLevel as any)[level] ?? ''}
                  onChange={e => setDiscount(level, e.target.value)}
                  className={INPUT_CLS + ' text-center'}
                  placeholder="10%"
                />
              </div>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
          Actif
        </label>
        <ModalActions onClose={onClose} saving={saving} />
      </form>
    </Modal>
  );
}

// ─── Mission form modal ───────────────────────────────────────────────────────

function MissionForm({ mission, onSave, onClose }: {
  mission?: Partial<LoyaltyMission>;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: mission?.title ?? '',
    description: mission?.description ?? '',
    points: mission?.points ?? 100,
    actionType: mission?.actionType ?? 'event_attendance',
    target: mission?.target ?? 3,
    isActive: mission?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={mission?.id ? 'Modifier la mission' : 'Nouvelle mission'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Titre *"><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={INPUT_CLS} required /></FormField>
        <FormField label="Description"><input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={INPUT_CLS} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Points récompense">
            <input type="number" value={form.points} onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))} className={INPUT_CLS} min={1} required />
          </FormField>
          <FormField label="Cible (nombre d'actions)">
            <input type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: Number(e.target.value) }))} className={INPUT_CLS} min={1} required />
          </FormField>
        </div>
        <FormField label="Type d'action">
          <select value={form.actionType} onChange={e => setForm(f => ({ ...f, actionType: e.target.value }))} className={INPUT_CLS}>
            {[
              'ticket_purchase', 'event_attendance', 'event_share',
              'referral_signup', 'community_post', 'community_engagement',
              'partner_spending',
            ].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </FormField>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
          Active
        </label>
        <ModalActions onClose={onClose} saving={saving} />
      </form>
    </Modal>
  );
}

// ─── Bonus form modal ─────────────────────────────────────────────────────────

function BonusForm({ bonus, onSave, onClose }: {
  bonus?: Partial<LoyaltyBonus>;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: bonus?.title ?? '',
    description: bonus?.description ?? '',
    bonusType: bonus?.bonusType ?? 'multiplier',
    value: bonus?.value ?? 1.5,
    actionType: bonus?.actionType ?? '',
    minLevel: bonus?.minLevel ?? '',
    startDate: bonus?.startDate ? bonus.startDate.slice(0, 16) : '',
    endDate: bonus?.endDate ? bonus.endDate.slice(0, 16) : '',
    isActive: bonus?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, startDate: new Date(form.startDate), endDate: new Date(form.endDate) });
      onClose();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={bonus?.id ? 'Modifier le bonus' : 'Nouveau bonus / campagne'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Titre *"><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={INPUT_CLS} required /></FormField>
        <FormField label="Description"><input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={INPUT_CLS} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Type de bonus">
            <select value={form.bonusType} onChange={e => setForm(f => ({ ...f, bonusType: e.target.value as any }))} className={INPUT_CLS}>
              <option value="multiplier">Multiplicateur</option>
              <option value="flat_bonus">Bonus fixe (pts)</option>
              <option value="activity_bonus">Bonus activité</option>
              <option value="social_bonus">Bonus social</option>
            </select>
          </FormField>
          <FormField label={form.bonusType === 'multiplier' ? 'Valeur (ex: 1.5 = +50%)' : 'Valeur (pts)'}>
            <input type="number" step="0.01" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} className={INPUT_CLS} required />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Action concernée (vide = toutes)">
            <select value={form.actionType} onChange={e => setForm(f => ({ ...f, actionType: e.target.value }))} className={INPUT_CLS}>
              <option value="">Toutes</option>
              {['ticket_purchase', 'event_attendance', 'event_share', 'partner_spending', 'community_post'].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </FormField>
          <FormField label="Niveau minimum requis">
            <select value={form.minLevel} onChange={e => setForm(f => ({ ...f, minLevel: e.target.value }))} className={INPUT_CLS}>
              <option value="">Tous niveaux</option>
              {['Mobembo', 'Elengi', 'Momi', 'Mwana', 'Boboto'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date début *"><input type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className={INPUT_CLS} required /></FormField>
          <FormField label="Date fin *"><input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className={INPUT_CLS} required /></FormField>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
          Actif
        </label>
        <ModalActions onClose={onClose} saving={saving} />
      </form>
    </Modal>
  );
}

// ─── Adjust points modal ──────────────────────────────────────────────────────

function AdjustPointsModal({ profileId, userName, onSave, onClose }: {
  profileId: string; userName: string;
  onSave: (profileId: string, delta: number, description: string) => Promise<void>;
  onClose: () => void;
}) {
  const [delta, setDelta] = useState(0);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { toast.error('Raison obligatoire'); return; }
    setSaving(true);
    try { await onSave(profileId, delta, description); toast.success('Points ajustés'); onClose(); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={`Ajustement — ${userName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Points (négatif = déduire)">
          <input type="number" value={delta} onChange={e => setDelta(Number(e.target.value))} className={INPUT_CLS} required />
        </FormField>
        <FormField label="Raison (obligatoire)">
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Correction erreur scan QR" className={INPUT_CLS} required />
        </FormField>
        <ModalActions onClose={onClose} saving={saving} label="Appliquer" />
      </form>
    </Modal>
  );
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

const INPUT_CLS = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm";

function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} my-4`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ModalActions({ onClose, saving, label = 'Enregistrer' }: { onClose: () => void; saving: boolean; label?: string }) {
  return (
    <div className="flex gap-2 pt-2">
      <Button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
        {label}
      </Button>
      <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export function FeetiNaFeetiAdminPage({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [ledger, setLedger] = useState<any[]>([]);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const [ledgerTotalPages, setLedgerTotalPages] = useState(1);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [partners, setPartners] = useState<LoyaltyPartner[]>([]);
  const [missions, setMissions] = useState<LoyaltyMission[]>([]);
  const [bonuses, setBonuses] = useState<LoyaltyBonus[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [communityFilter, setCommunityFilter] = useState('');
  const [communityPage, setCommunityPage] = useState(1);
  const [communityTotalPages, setCommunityTotalPages] = useState(1);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlerts | null>(null);
  const [vipLogs, setVipLogs] = useState<any[]>([]);

  // Modals
  const [rewardModal, setRewardModal] = useState<{ open: boolean; reward?: Partial<LoyaltyReward> }>({ open: false });
  const [partnerModal, setPartnerModal] = useState<{ open: boolean; partner?: Partial<LoyaltyPartner> }>({ open: false });
  const [missionModal, setMissionModal] = useState<{ open: boolean; mission?: Partial<LoyaltyMission> }>({ open: false });
  const [bonusModal, setBonusModal] = useState<{ open: boolean; bonus?: Partial<LoyaltyBonus> }>({ open: false });
  const [adjustModal, setAdjustModal] = useState<{ open: boolean; profileId?: string; userName?: string }>({ open: false });

  const loadStats = useCallback(async () => {
    const [s, fr] = await Promise.all([loyaltyApi.getAdminStats(), loyaltyApi.getFraudAlerts()]);
    setStats(s);
    setFraudAlerts(fr);
  }, []);

  const loadUsers = useCallback(async (p: number) => {
    const res = await loyaltyApi.getAllUsers({ search: searchQuery, level: filterLevel !== 'all' ? filterLevel : undefined, page: p, limit: 20 });
    setUsers(res.items ?? []);
    setUsersTotal(res.total);
    setUsersTotalPages(res.totalPages ?? 1);
  }, [searchQuery, filterLevel]);

  const loadLedger = useCallback(async (p: number) => {
    const res = await loyaltyApi.getAllLedger({ page: p, limit: 50 });
    setLedger(res.items ?? []);
    setLedgerTotal(res.total);
    setLedgerTotalPages(res.totalPages ?? 1);
  }, []);

  const loadCommunity = useCallback(async (p: number, status?: string) => {
    const res = await loyaltyApi.getAdminCommunityPosts({ page: p, limit: 20, status: status || undefined });
    setCommunityPosts(res.items ?? []);
    setCommunityTotalPages(res.totalPages ?? 1);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, p, m, b, vip] = await Promise.all([
        loyaltyApi.getAdminRewards(),
        loyaltyApi.getAdminPartners(),
        loyaltyApi.getAdminMissions(),
        loyaltyApi.getAllBonuses(),
        loyaltyApi.getAdminVipLogs({ limit: 20 }),
      ]);
      setRewards(r);
      setPartners(p);
      setMissions(m);
      setBonuses(b);
      setVipLogs(vip.items ?? []);
      await Promise.all([loadStats(), loadUsers(1), loadLedger(1), loadCommunity(1)]);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [loadStats, loadUsers, loadLedger, loadCommunity]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { if (!loading) loadUsers(page); }, [page, searchQuery, filterLevel]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleDeleteReward = async (id: string) => {
    if (!confirm('Supprimer cette récompense ?')) return;
    try { await loyaltyApi.deleteReward(id); toast.success('Récompense supprimée'); setRewards(r => r.filter(x => x.id !== id)); }
    catch { toast.error('Erreur'); }
  };

  const handleSaveReward = async (data: any) => {
    if (rewardModal.reward?.id) {
      const updated = await loyaltyApi.updateReward(rewardModal.reward.id, data);
      setRewards(r => r.map(x => x.id === updated.id ? updated : x));
      toast.success('Récompense mise à jour');
    } else {
      const created = await loyaltyApi.createReward(data);
      setRewards(r => [...r, created]);
      toast.success('Récompense créée');
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm('Supprimer ce partenaire ?')) return;
    try { await loyaltyApi.deletePartner(id); toast.success('Partenaire supprimé'); setPartners(p => p.filter(x => x.id !== id)); }
    catch { toast.error('Erreur'); }
  };

  const handleSavePartner = async (data: any) => {
    if (partnerModal.partner?.id) {
      const updated = await loyaltyApi.updatePartner(partnerModal.partner.id, data);
      setPartners(p => p.map(x => x.id === updated.id ? updated : x));
      toast.success('Partenaire mis à jour');
    } else {
      const created = await loyaltyApi.createPartner(data);
      setPartners(p => [...p, created]);
      toast.success('Partenaire créé');
    }
  };

  const handleSaveMission = async (data: any) => {
    if (missionModal.mission?.id) {
      const updated = await loyaltyApi.updateMission(missionModal.mission.id, data);
      setMissions(m => m.map(x => x.id === updated.id ? updated : x));
      toast.success('Mission mise à jour');
    } else {
      const created = await loyaltyApi.createMission(data);
      setMissions(m => [...m, created]);
      toast.success('Mission créée');
    }
  };

  const handleDeleteMission = async (id: string) => {
    if (!confirm('Supprimer cette mission ?')) return;
    try { await loyaltyApi.deleteMission(id); toast.success('Mission supprimée'); setMissions(m => m.filter(x => x.id !== id)); }
    catch { toast.error('Erreur'); }
  };

  const handleSaveBonus = async (data: any) => {
    if (bonusModal.bonus?.id) {
      const updated = await loyaltyApi.updateBonus(bonusModal.bonus.id, data);
      setBonuses(b => b.map(x => x.id === updated.id ? updated : x));
      toast.success('Bonus mis à jour');
    } else {
      const created = await loyaltyApi.createBonus(data);
      setBonuses(b => [...b, created]);
      toast.success('Bonus créé');
    }
  };

  const handleDeleteBonus = async (id: string) => {
    if (!confirm('Supprimer ce bonus ?')) return;
    try { await loyaltyApi.deleteBonus(id); toast.success('Bonus supprimé'); setBonuses(b => b.filter(x => x.id !== id)); }
    catch { toast.error('Erreur'); }
  };

  const handleAdjustPoints = async (profileId: string, delta: number, description: string) => {
    await loyaltyApi.manualAdjustPoints(profileId, delta, description);
    loadUsers(page);
    loadStats();
  };

  const handleModeratePost = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await loyaltyApi.moderateCommunityPost(id, status);
      toast.success(status === 'approved' ? 'Publication approuvée' : 'Publication rejetée');
      loadCommunity(communityPage, communityFilter);
    } catch { toast.error('Erreur'); }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Supprimer cette publication ?')) return;
    try { await loyaltyApi.adminDeleteCommunityPost(id); toast.success('Publication supprimée'); loadCommunity(communityPage, communityFilter); }
    catch { toast.error('Erreur'); }
  };

  const handleExportLedger = async () => {
    try { const blob = await loyaltyApi.exportLedgerCSV(); downloadBlob(blob, `fnf-ledger-${Date.now()}.csv`); }
    catch { toast.error('Erreur export'); }
  };

  const handleExportPartners = async () => {
    try { const blob = await loyaltyApi.exportPartnerSpendingCSV(); downloadBlob(blob, `fnf-partenaires-${Date.now()}.csv`); }
    catch { toast.error('Erreur export'); }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <p className="text-gray-700">{error}</p>
      <Button onClick={loadAll}>Réessayer</Button>
    </div>
  );

  const pointsAvailable = (stats?.pointsDistributed ?? 0) - (stats?.pointsUsed ?? 0);
  const fraudCount = (fraudAlerts?.shareAbuse?.length ?? 0) + (fraudAlerts?.recentManual?.length ?? 0);

  const TABS: { key: Tab; label: string; Icon: any; badge?: number }[] = [
    { key: 'dashboard',  label: 'Dashboard',      Icon: BarChart3      },
    { key: 'users',      label: 'Utilisateurs',   Icon: Users          },
    { key: 'points',     label: 'Points',         Icon: TrendingUp     },
    { key: 'rewards',    label: 'Récompenses',    Icon: Gift           },
    { key: 'partners',   label: 'Partenaires',    Icon: Store          },
    { key: 'missions',   label: 'Missions',       Icon: Target         },
    { key: 'community',  label: 'Communauté',     Icon: MessageSquare  },
    { key: 'bonuses',    label: 'Campagnes',      Icon: Sparkles       },
    { key: 'vip',        label: 'VIP',            Icon: Crown          },
    { key: 'fraud',      label: 'Alertes',        Icon: Shield, badge: fraudCount },
    { key: 'settings',   label: 'Paramètres',     Icon: Settings       },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modals */}
      {rewardModal.open && <RewardForm reward={rewardModal.reward} onSave={handleSaveReward} onClose={() => setRewardModal({ open: false })} />}
      {partnerModal.open && <PartnerForm partner={partnerModal.partner} onSave={handleSavePartner} onClose={() => setPartnerModal({ open: false })} />}
      {missionModal.open && <MissionForm mission={missionModal.mission} onSave={handleSaveMission} onClose={() => setMissionModal({ open: false })} />}
      {bonusModal.open && <BonusForm bonus={bonusModal.bonus} onSave={handleSaveBonus} onClose={() => setBonusModal({ open: false })} />}
      {adjustModal.open && adjustModal.profileId && (
        <AdjustPointsModal profileId={adjustModal.profileId} userName={adjustModal.userName ?? ''} onSave={handleAdjustPoints} onClose={() => setAdjustModal({ open: false })} />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={onBack} className="mb-4 text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />Retour
          </Button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">FEETI NA FEETI — Administration</h1>
              <p className="text-indigo-100">Gestion complète du programme de fidélité</p>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
            {TABS.map(({ key, label, Icon, badge }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors relative ${
                  activeTab === key ? 'bg-white text-indigo-600' : 'text-white hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {badge ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{badge}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* ── Dashboard ── */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Membres fidélité', value: stats.totalUsers.toLocaleString(), sub: `${stats.activeUsers.toLocaleString()} actifs`, Icon: Users, bg: 'bg-indigo-100', ic: 'text-indigo-600' },
                { label: 'Points distribués', value: `${(stats.pointsDistributed / 1000).toFixed(0)}K`, sub: `≈ ${((stats.pointsDistributed * 20) / 1000).toFixed(0)}K FCFA`, Icon: TrendingUp, bg: 'bg-green-100', ic: 'text-green-600' },
                { label: 'En circulation', value: pointsAvailable.toLocaleString(), sub: `≈ ${(pointsAvailable * 20).toLocaleString()} FCFA`, Icon: Gift, bg: 'bg-purple-100', ic: 'text-purple-600' },
                { label: 'Dépenses partenaires', value: `${((stats.partnerSpendingTotal ?? 0) / 1000).toFixed(0)}K FCFA`, sub: `${stats.partnerTransactions ?? 0} transactions`, Icon: Store, bg: 'bg-amber-100', ic: 'text-amber-600' },
              ].map(({ label, value, sub, Icon, bg, ic }) => (
                <Card key={label}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-400 mt-1">{sub}</p>
                      </div>
                      <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${ic}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Répartition niveaux */}
              <Card>
                <CardHeader><CardTitle>Répartition par niveau</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {stats.levelCounts.map(({ level, _count }) => (
                      <div key={level} className={`text-center p-3 rounded-lg ${getLevelColor(level)}`}>
                        <div className="flex justify-center mb-1">{getLevelIcon(level)}</div>
                        <p className="text-xl font-bold">{_count.id}</p>
                        <p className="text-xs mt-0.5 truncate">{level}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stats communauté */}
              <Card>
                <CardHeader><CardTitle>Communauté & Alertes</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {stats.communityStats.map(({ status, _count }) => (
                    <div key={status} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600 capitalize">{status}</span>
                      <span className="font-bold text-gray-900">{_count.id}</span>
                    </div>
                  ))}
                  {fraudCount > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-red-700 text-sm">
                      <Bell className="w-4 h-4" />
                      {fraudCount} alerte(s) fraude active(s)
                      <Button variant="outline" size="sm" className="ml-auto text-xs" onClick={() => setActiveTab('fraud')}>Voir</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top utilisateurs */}
            <Card>
              <CardHeader><CardTitle>Top 5 utilisateurs</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.slice(0, 5).map((user, i) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                      }`}>#{i + 1}</div>
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {(user.user?.name ?? '?').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{user.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.user?.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getLevelColor(user.level)}`}>
                        {getLevelIcon(user.level)} {user.level}
                      </span>
                      <p className="text-base font-bold text-indigo-600 w-16 text-right">{user.points.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Utilisateurs ── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Utilisateurs ({usersTotal})</h2>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text" placeholder="Rechercher..." value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <select value={filterLevel} onChange={e => { setFilterLevel(e.target.value); setPage(1); }} className={INPUT_CLS + ' w-auto'}>
                    <option value="all">Tous niveaux</option>
                    {['Mobembo', 'Elengi', 'Momi', 'Mwana', 'Boboto'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {['Utilisateur', 'Niveau', 'Points', 'Événements', 'Dépenses', 'Actions'].map(h => (
                          <th key={h} className="text-left py-3 px-3 font-semibold text-gray-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                {(user.user?.name ?? '?').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{user.user?.name}</p>
                                <p className="text-xs text-gray-500">{user.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getLevelColor(user.level)}`}>
                              {getLevelIcon(user.level)} {user.level}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-indigo-600">{user.points.toLocaleString()}</td>
                          <td className="py-3 px-3 text-gray-600">{user.eventsAttended}</td>
                          <td className="py-3 px-3 text-gray-600">{user.totalSpent?.toLocaleString()} FCFA</td>
                          <td className="py-3 px-3">
                            <Button variant="outline" size="sm" onClick={() => setAdjustModal({ open: true, profileId: user.id, userName: user.user?.name })}>
                              <Edit className="w-3 h-3 mr-1" />Ajuster pts
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && <p className="text-center text-gray-500 py-8">Aucun utilisateur.</p>}
                </div>
                <Pagination page={page} totalPages={usersTotalPages} onChange={p => setPage(p)} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Points ── */}
        {activeTab === 'points' && stats && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Historique des points ({ledgerTotal})</h2>
              <Button variant="outline" onClick={handleExportLedger}>
                <Download className="w-4 h-4 mr-2" />Export CSV
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Distribués (total)', value: stats.pointsDistributed.toLocaleString(), color: 'text-indigo-600' },
                { label: 'Utilisés', value: stats.pointsUsed.toLocaleString(), color: 'text-green-600' },
                { label: 'En circulation', value: pointsAvailable.toLocaleString(), color: 'text-purple-600' },
              ].map(({ label, value, color }) => (
                <Card key={label}><CardContent className="p-5 text-center">
                  <p className="text-sm text-gray-500 mb-1">{label}</p>
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                </CardContent></Card>
              ))}
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {['Utilisateur', 'Action', 'Points', 'Avant', 'Après', 'Date'].map(h => (
                          <th key={h} className="text-left py-3 px-4 font-semibold text-gray-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.map((tx: any) => (
                        <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2.5 px-4 font-medium">{tx.profile?.user?.name ?? '—'}</td>
                          <td className="py-2.5 px-4 text-gray-500 max-w-xs truncate">{tx.description}</td>
                          <td className="py-2.5 px-4 font-bold">
                            <span className={tx.points > 0 ? 'text-green-600' : 'text-red-600'}>
                              {tx.points > 0 ? '+' : ''}{tx.points}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-gray-500">{tx.balanceBefore}</td>
                          <td className="py-2.5 px-4 text-gray-500">{tx.balanceAfter}</td>
                          <td className="py-2.5 px-4 text-gray-500">{new Date(tx.createdAt).toLocaleString('fr-FR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {ledger.length === 0 && <p className="text-center text-gray-500 py-8">Aucune transaction.</p>}
                </div>
                <div className="p-4">
                  <Pagination page={page} totalPages={ledgerTotalPages} onChange={p => { setPage(p); loadLedger(p); }} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Récompenses ── */}
        {activeTab === 'rewards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Récompenses</h2>
              <Button onClick={() => setRewardModal({ open: true })} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />Ajouter
              </Button>
            </div>
            {rewards.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-gray-500">Aucune récompense.</CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map(reward => (
                  <Card key={reward.id} className={!reward.isActive ? 'opacity-60' : ''}>
                    <div className="h-36 bg-gray-200 bg-cover bg-center" style={reward.image ? { backgroundImage: `url(${reward.image})` } : undefined} />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold">{reward.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${reward.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {reward.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{reward.description}</p>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="font-bold text-indigo-600">{reward.points} pts</span>
                        <span className="text-gray-500">Stock: {reward.stock}</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">{reward.category}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setRewardModal({ open: true, reward })}>
                          <Edit className="w-3 h-3 mr-1" />Modifier
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteReward(reward.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Partenaires ── */}
        {activeTab === 'partners' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Partenaires marchands ({partners.length})</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportPartners}>
                  <Download className="w-4 h-4 mr-2" />Export
                </Button>
                <Button onClick={() => setPartnerModal({ open: true })} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />Ajouter
                </Button>
              </div>
            </div>
            {partners.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-gray-500">Aucun partenaire configuré.</CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partners.map(partner => (
                  <Card key={partner.id} className={!partner.isActive ? 'opacity-60' : ''}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl">
                          {partner.logo || '🏢'}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${partner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {partner.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-0.5">{partner.name}</h3>
                      <p className="text-xs text-gray-500 mb-3">{partner.category}</p>
                      {/* Remises par niveau */}
                      <div className="grid grid-cols-5 gap-1 mb-3">
                        {(['Mobembo', 'Elengi', 'Momi', 'Mwana', 'Boboto'] as const).map(level => (
                          <div key={level} className={`text-center p-1 rounded text-xs ${getLevelColor(level)}`}>
                            <p className="font-bold">{(partner.discountByLevel as any)?.[level] ?? partner.discount}</p>
                            <p className="truncate text-[10px]">{level}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mb-3">
                        <span>Bonus: <strong className="text-green-600">+{partner.bonusPoints} pts/1000 FCFA</strong></span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setPartnerModal({ open: true, partner })}>
                          <Edit className="w-3 h-3 mr-1" />Modifier
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeletePartner(partner.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Missions ── */}
        {activeTab === 'missions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Missions ({missions.length})</h2>
              <Button onClick={() => setMissionModal({ open: true })} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />Nouvelle mission
              </Button>
            </div>
            {missions.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-gray-500">Aucune mission configurée.</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {missions.map(mission => (
                  <Card key={mission.id} className={!mission.isActive ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{mission.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${mission.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {mission.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{mission.description}</p>
                          <div className="flex gap-3 text-xs text-gray-500">
                            <span>Action: <strong className="text-gray-700">{mission.actionType}</strong></span>
                            <span>Cible: <strong className="text-gray-700">{mission.target}</strong></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <p className="text-lg font-bold text-indigo-600">+{mission.points} pts</p>
                          <Button variant="outline" size="sm" onClick={() => setMissionModal({ open: true, mission })}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteMission(mission.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Communauté ── */}
        {activeTab === 'community' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Communauté</h2>
              <select
                value={communityFilter}
                onChange={e => { setCommunityFilter(e.target.value); setCommunityPage(1); loadCommunity(1, e.target.value); }}
                className={INPUT_CLS + ' w-auto'}
              >
                <option value="">Tous</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvés</option>
                <option value="rejected">Rejetés</option>
              </select>
            </div>
            {communityPosts.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-gray-500">Aucune publication.</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {communityPosts.map(post => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm">{post.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              post.status === 'approved' ? 'bg-green-100 text-green-700' :
                              post.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>{post.status}</span>
                            {post.isFeatured && <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">Épinglé</span>}
                          </div>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{post.content}</p>
                          <div className="flex gap-3 text-xs text-gray-400">
                            <span>👍 {post.likesCount}</span>
                            <span>💬 {post.commentsCount}</span>
                            <span>{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {post.status === 'pending' && (
                            <>
                              <Button variant="outline" size="sm" className="text-green-600 border-green-300" onClick={() => handleModeratePost(post.id, 'approved')}>
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 border-red-300" onClick={() => handleModeratePost(post.id, 'rejected')}>
                                <X className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleDeletePost(post.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <Pagination page={communityPage} totalPages={communityTotalPages} onChange={p => { setCommunityPage(p); loadCommunity(p, communityFilter); }} />
          </div>
        )}

        {/* ── Campagnes / Bonus ── */}
        {activeTab === 'bonuses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Campagnes & Bonus ({bonuses.length})</h2>
              <Button onClick={() => setBonusModal({ open: true })} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />Nouvelle campagne
              </Button>
            </div>
            {bonuses.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-gray-500">Aucune campagne configurée.</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {bonuses.map(bonus => {
                  const now = Date.now();
                  const start = new Date(bonus.startDate).getTime();
                  const end = new Date(bonus.endDate).getTime();
                  const isLive = bonus.isActive && now >= start && now <= end;
                  return (
                    <Card key={bonus.id} className={!bonus.isActive ? 'opacity-60' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold">{bonus.title}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${isLive ? 'bg-green-100 text-green-700' : bonus.isActive ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'}`}>
                                {isLive ? 'En cours' : bonus.isActive ? 'Inactif' : 'Désactivé'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{bonus.description}</p>
                            <div className="flex gap-3 text-xs text-gray-500">
                              <span>Type: <strong>{bonus.bonusType}</strong></span>
                              <span>Valeur: <strong className="text-indigo-600">{bonus.value}</strong></span>
                              {bonus.actionType && <span>Action: <strong>{bonus.actionType}</strong></span>}
                              {bonus.minLevel && <span>Niveau min: <strong>{bonus.minLevel}</strong></span>}
                            </div>
                            <div className="flex gap-3 text-xs text-gray-400 mt-1">
                              <span>Du {new Date(bonus.startDate).toLocaleDateString('fr-FR')}</span>
                              <span>au {new Date(bonus.endDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm" onClick={() => setBonusModal({ open: true, bonus })}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteBonus(bonus.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── VIP ── */}
        {activeTab === 'vip' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Accès VIP événements</h2>
            <Card>
              <CardHeader>
                <CardTitle>Journal des accès VIP</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Niveaux requis : Momi → Zone VIP • Mwana & Boboto → Backstage
                </p>
              </CardHeader>
              <CardContent>
                {vipLogs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Aucun accès VIP enregistré.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {['Utilisateur', 'Événement', 'Type d\'accès', 'Billet', 'Date'].map(h => (
                            <th key={h} className="text-left py-3 px-3 font-semibold text-gray-700">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {vipLogs.map((log: any) => (
                          <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2.5 px-3">{log.userId}</td>
                            <td className="py-2.5 px-3 text-gray-600">{log.eventId}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">{log.accessType}</span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-500 text-xs">{log.ticketId ?? '—'}</td>
                            <td className="py-2.5 px-3 text-gray-500">{new Date(log.grantedAt).toLocaleString('fr-FR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Alertes fraude ── */}
        {activeTab === 'fraud' && fraudAlerts && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Alertes fraude</h2>

            {/* Share abuse */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Abus de partages aujourd'hui ({fraudAlerts.shareAbuse.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fraudAlerts.shareAbuse.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucun abus détecté.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {['Utilisateur', 'Date', 'Partages'].map(h => (
                            <th key={h} className="text-left py-2 px-3 font-semibold text-gray-700">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {fraudAlerts.shareAbuse.map((alert: any) => (
                          <tr key={alert.id} className="border-b border-gray-100">
                            <td className="py-2 px-3">{alert.userId}</td>
                            <td className="py-2 px-3 text-gray-600">{alert.date}</td>
                            <td className="py-2 px-3">
                              <span className="font-bold text-red-600">{alert.count}</span>
                              <span className="text-gray-400 ml-1">/10</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ajustements manuels récents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Ajustements manuels (24h) ({fraudAlerts.recentManual.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fraudAlerts.recentManual.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucun ajustement récent.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {['Utilisateur', 'Points', 'Description', 'Date'].map(h => (
                            <th key={h} className="text-left py-2 px-3 font-semibold text-gray-700">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {fraudAlerts.recentManual.map((entry: any) => (
                          <tr key={entry.id} className="border-b border-gray-100">
                            <td className="py-2 px-3">{entry.profile?.user?.name ?? '—'}</td>
                            <td className="py-2 px-3 font-bold">
                              <span className={entry.points > 0 ? 'text-green-600' : 'text-red-600'}>
                                {entry.points > 0 ? '+' : ''}{entry.points}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-gray-600 max-w-xs truncate">{entry.description}</td>
                            <td className="py-2 px-3 text-gray-500">{new Date(entry.createdAt).toLocaleString('fr-FR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Paramètres ── */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Paramètres du programme</h2>

            <Card>
              <CardHeader><CardTitle>Règles de conversion</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  {[
                    ['Points pour 100 FCFA dépensés (billet)', '1 point'],
                    ['Points pour 1000 FCFA chez partenaire', '1 point + bonus partenaire'],
                    ['Valeur d\'1 point', '20 FCFA'],
                    ['Bonus présence événement', '200 pts'],
                    ['Bonus partage événement', '20 pts (max 10/jour)'],
                    ['Bonus publication communauté', '50 pts'],
                    ['Bonus like communauté', '5 pts'],
                    ['Bonus commentaire communauté', '10 pts'],
                    ['Bonus parrainage inscription', '150 pts'],
                    ['Bonus parrainage 1er événement', '300 pts'],
                    ['Bonus activité : 3 événements/mois', '+150 pts'],
                    ['Bonus activité : 5 événements/mois', '+300 pts'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{label}</span>
                      <span className="font-bold text-indigo-600">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Niveaux & Avantages</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {['Niveau', 'Points requis', 'Multiplicateur', 'Avantages partenaires', 'VIP accès'].map(h => (
                          <th key={h} className="text-left py-2 px-3 font-semibold text-gray-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Mobembo', '0 – 999',    '1.0×', '5–10% réduction', '—'],
                        ['Elengi',  '1000 – 1999','1.1×', '10–20% restaurants, 20% concerts', '—'],
                        ['Momi',    '2000 – 2999','1.15×','20–30% établissements, 30% salons', 'Zone VIP'],
                        ['Mwana',   '3000 – 3999','1.2×', '30–40% loisirs, 10% librairies', 'VIP + Backstage'],
                        ['Boboto',  '4000+',      '1.3×', '40% partenaires, 15% labos, hôtels', 'VIP + Backstage + Privé'],
                      ].map(([level, range, mult, disc, vip]) => (
                        <tr key={level} className="border-b border-gray-100">
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getLevelColor(level)}`}>
                              {getLevelIcon(level)} {level}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-700">{range}</td>
                          <td className="py-3 px-3 font-bold text-green-600">{mult}</td>
                          <td className="py-3 px-3 text-gray-600 text-xs">{disc}</td>
                          <td className="py-3 px-3 text-xs">
                            {vip === '—' ? <span className="text-gray-400">—</span> : <span className="text-purple-600 font-medium">{vip}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
