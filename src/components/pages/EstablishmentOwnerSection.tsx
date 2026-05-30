import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import {
  Building2, Gift, History, Plus, Edit2, Trash2,
  Loader2, CalendarDays, CreditCard, RefreshCw, MapPin,
  Phone, Globe, Clock, DollarSign, Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { EstablishmentPaymentModal } from '../EstablishmentPaymentModal';
import EstablishmentOwnerAPI, {
  type MyEstablishmentWithSub,
  type EstablishmentPricing,
  type EstablishmentSubscription,
  type DealPayment,
  type CreateEstablishmentInput,
} from '../../services/api/EstablishmentOwnerAPI';
import type { BackendDeal } from '../../services/api/DealsBackendAPI';

const LEISURE_CATEGORIES = [
  { slug: 'hotels', name: 'Hôtels & Hébergements' },
  { slug: 'restaurants', name: 'Restaurants & Cafés' },
  { slug: 'sports', name: 'Sport & Bien-être' },
  { slug: 'loisirs', name: 'Loisirs & Divertissement' },
  { slug: 'envolee', name: 'Évasion & Tourisme' },
  { slug: 'bar-night', name: 'Bars & Nuit' },
  { slug: 'shopping', name: 'Shopping & Boutiques' },
];

const COUNTRY_OPTIONS = [
  { code: 'CG', label: '🇨🇬 Congo-Brazzaville' },
  { code: 'CD', label: '🇨🇩 RD Congo' },
  { code: 'GA', label: '🇬🇦 Gabon' },
  { code: 'CI', label: '🇨🇮 Côte d\'Ivoire' },
];

const emptyCreateForm = (): CreateEstablishmentInput => ({
  name: '',
  description: '',
  categorySlug: 'restaurants',
  location: '',
  address: '',
  phone: '',
  website: '',
  priceRange: '',
  openingHours: '',
  image: '',
  countryCode: 'CG',
  tags: [],
  features: [],
});

const DEAL_CATEGORIES = [
  { slug: 'restaurants', name: 'Restaurants' },
  { slug: 'hotels', name: 'Hôtels' },
  { slug: 'activities', name: 'Activités' },
  { slug: 'shopping', name: 'Shopping' },
  { slug: 'general', name: 'Général' },
  { slug: 'weekly', name: 'Hebdomadaire' },
  { slug: 'feeti-na-feeti', name: 'Feeti Na Feeti' },
];

const emptyDealForm = () => ({
  title: '',
  description: '',
  category: 'general',
  originalPrice: 0,
  discountedPrice: 0,
  discount: 0,
  validUntil: '',
  location: '',
  image: '',
  merchantName: '',
  tags: '',
  contactPhone: '',
  contactEmail: '',
});

function subscriptionStatusBadge(sub?: EstablishmentSubscription) {
  if (!sub) return <Badge variant="outline" className="text-gray-500">Aucun abonnement</Badge>;
  const now = new Date();
  const end = new Date(sub.endDate);
  if (sub.status === 'active' && end > now) {
    return <Badge className="bg-green-100 text-green-800">Actif jusqu'au {end.toLocaleDateString('fr-FR')}</Badge>;
  }
  if (sub.status === 'pending') return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
  return <Badge className="bg-red-100 text-red-800">Expiré</Badge>;
}

export function EstablishmentOwnerSection() {
  const [establishments, setEstablishments] = useState<MyEstablishmentWithSub[]>([]);
  const [deals, setDeals] = useState<BackendDeal[]>([]);
  const [pricing, setPricing] = useState<EstablishmentPricing | null>(null);
  const [history, setHistory] = useState<{ subscriptions: EstablishmentSubscription[]; dealPayments: DealPayment[] }>({ subscriptions: [], dealPayments: [] });
  const [loading, setLoading] = useState(true);

  // Modal paiement
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    type: 'subscription' | 'bonplan';
    leisureItemId: string;
    establishmentName: string;
    dealData?: ReturnType<typeof emptyDealForm>;
  }>({ open: false, type: 'subscription', leisureItemId: '', establishmentName: '' });

  // Formulaire bon plan
  const [dealForm, setDealForm] = useState(emptyDealForm());
  const [selectedEstabForDeal, setSelectedEstabForDeal] = useState('');
  const [isDealFormOpen, setIsDealFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<BackendDeal | null>(null);
  const [dealSaving, setDealSaving] = useState(false);

  // Formulaire création établissement
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateEstablishmentInput>(emptyCreateForm());
  const [isCreating, setIsCreating] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [estabs, myDeals, pricingData, hist] = await Promise.all([
        EstablishmentOwnerAPI.getMyEstablishments(),
        EstablishmentOwnerAPI.getMyDeals(),
        EstablishmentOwnerAPI.getPricing(),
        EstablishmentOwnerAPI.getMyPaymentHistory(),
      ]);
      setEstablishments(estabs);
      setDeals(myDeals);
      setPricing(pricingData);
      setHistory(hist);
      if (estabs.length > 0 && !selectedEstabForDeal) setSelectedEstabForDeal(estabs[0].id);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpenCreateForm = () => {
    setCreateForm(emptyCreateForm());
    setTagsInput('');
    setFeaturesInput('');
    setIsCreateFormOpen(true);
  };

  const handleCreateEstablishment = async () => {
    if (!createForm.name.trim() || !createForm.description.trim() || !createForm.location.trim()) {
      toast.error('Nom, description et localisation sont requis');
      return;
    }
    setIsCreating(true);
    try {
      const data: CreateEstablishmentInput = {
        ...createForm,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        features: featuresInput.split(',').map(f => f.trim()).filter(Boolean),
      };
      const newEstab = await EstablishmentOwnerAPI.createEstablishment(data);
      setIsCreateFormOpen(false);
      setEstablishments(prev => [newEstab, ...prev]);
      toast.success('Établissement créé — activez maintenant votre abonnement pour le publier');
      if (pricing) {
        setPaymentModal({ open: true, type: 'subscription', leisureItemId: newEstab.id, establishmentName: newEstab.name });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenSubscription = (estab: MyEstablishmentWithSub) => {
    if (!pricing) return;
    setPaymentModal({ open: true, type: 'subscription', leisureItemId: estab.id, establishmentName: estab.name });
  };

  const handleOpenAddDeal = () => {
    if (!selectedEstabForDeal) { toast.error('Sélectionnez un établissement'); return; }
    const estab = establishments.find(e => e.id === selectedEstabForDeal);
    if (!estab) return;

    // Vérifier abonnement actif
    const sub = estab.subscriptions?.[0];
    const isActive = sub?.status === 'active' && new Date(sub.endDate) > new Date();
    if (!isActive) {
      toast.error('Abonnement annuel requis. Activez d\'abord votre abonnement pour cet établissement.');
      return;
    }

    const form = { ...emptyDealForm(), location: estab.location, merchantName: estab.name };
    setDealForm(form);
    setPaymentModal({ open: true, type: 'bonplan', leisureItemId: estab.id, establishmentName: estab.name, dealData: form });
  };

  const handleEditDeal = (deal: BackendDeal) => {
    setEditingDeal(deal);
    setDealForm({
      title: deal.title,
      description: deal.description,
      category: deal.category,
      originalPrice: deal.originalPrice,
      discountedPrice: deal.discountedPrice,
      discount: deal.discount,
      validUntil: deal.validUntil,
      location: deal.location,
      image: deal.image || '',
      merchantName: deal.merchantName,
      tags: deal.tags || '',
      contactPhone: deal.contactPhone || '',
      contactEmail: deal.contactEmail || '',
    });
    setIsDealFormOpen(true);
  };

  const handleSaveEditDeal = async () => {
    if (!editingDeal) return;
    setDealSaving(true);
    try {
      const updated = await EstablishmentOwnerAPI.updateDeal(editingDeal.id, dealForm as any);
      setDeals(prev => prev.map(d => d.id === updated.id ? updated : d));
      setIsDealFormOpen(false);
      setEditingDeal(null);
      toast.success('Bon plan mis à jour');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erreur');
    } finally {
      setDealSaving(false);
    }
  };

  const handleDeleteDeal = async (deal: BackendDeal) => {
    if (!confirm(`Supprimer "${deal.title}" ?`)) return;
    try {
      await EstablishmentOwnerAPI.deleteDeal(deal.id);
      setDeals(prev => prev.filter(d => d.id !== deal.id));
      toast.success('Bon plan supprimé');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erreur');
    }
  };

  const handlePaymentSuccess = (result: any) => {
    toast.success(paymentModal.type === 'subscription' ? 'Abonnement activé !' : 'Bon plan publié !');
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          Mon Espace Établissement
        </h2>
        <div className="flex gap-2">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleOpenCreateForm}>
            <Plus className="w-4 h-4 mr-1.5" />Ajouter un établissement
          </Button>
          <Button size="sm" variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="establishments">
        <TabsList className="w-full">
          <TabsTrigger value="establishments" className="flex-1 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>Mes établissements ({establishments.length})</span>
          </TabsTrigger>
          <TabsTrigger value="deals" className="flex-1 flex items-center gap-2">
            <Gift className="w-4 h-4" />
            <span>Mes bon plans ({deals.length})</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 flex items-center gap-2">
            <History className="w-4 h-4" />
            <span>Paiements</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Onglet Établissements ──────────────────────────────────────────── */}
        <TabsContent value="establishments" className="mt-4">
          {establishments.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-200" />
              <p className="text-lg font-semibold text-gray-700 mb-2">Aucun établissement encore</p>
              <p className="text-sm mb-6 max-w-xs mx-auto">Ajoutez votre premier établissement et activez votre abonnement annuel pour le publier sur Feeti.</p>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleOpenCreateForm}>
                <Plus className="w-4 h-4 mr-2" />Créer mon établissement
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {establishments.map(estab => {
                const sub = estab.subscriptions?.[0];
                const isActive = sub?.status === 'active' && sub?.endDate && new Date(sub.endDate) > new Date();
                return (
                  <Card key={estab.id} className="overflow-hidden">
                    <div className="h-32 relative">
                      <ImageWithFallback src={estab.image} alt={estab.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3">
                        <p className="font-bold text-white truncate">{estab.name}</p>
                        <p className="text-white/70 text-xs">{estab.location}</p>
                      </div>
                    </div>
                    <CardContent className="pt-3 pb-4 space-y-3">
                      {estab.status === 'pending' && (
                        <Badge className="bg-amber-100 text-amber-800 text-xs w-full justify-center">
                          En attente de paiement — non visible publiquement
                        </Badge>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Abonnement</span>
                        {subscriptionStatusBadge(sub)}
                      </div>
                      {pricing && (
                        <Button
                          size="sm"
                          variant={isActive ? 'outline' : 'default'}
                          className={isActive ? '' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
                          onClick={() => handleOpenSubscription(estab)}
                        >
                          {isActive ? (
                            <><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Renouveler</>
                          ) : (
                            <><CreditCard className="w-3.5 h-3.5 mr-1.5" />Activer ({new Intl.NumberFormat('fr-FR').format(pricing.establishmentAnnualFee)} {pricing.currency}/an)</>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Onglet Bon Plans ───────────────────────────────────────────────── */}
        <TabsContent value="deals" className="mt-4 space-y-4">
          {establishments.length > 0 && (
            <div className="flex items-end gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-gray-700">Établissement</label>
                <Select value={selectedEstabForDeal} onValueChange={setSelectedEstabForDeal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un établissement" />
                  </SelectTrigger>
                  <SelectContent>
                    {establishments.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleOpenAddDeal}
                disabled={!pricing}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Ajouter un bon plan
                {pricing && <span className="ml-1.5 text-green-200 text-xs">({new Intl.NumberFormat('fr-FR').format(pricing.bonplanCreationFee)} {pricing.currency})</span>}
              </Button>
            </div>
          )}

          {/* Formulaire d'édition inline */}
          {isDealFormOpen && editingDeal && (
            <Card className="border-indigo-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Modifier : {editingDeal.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium text-gray-700">Titre *</label>
                    <Input value={dealForm.title} onChange={e => setDealForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium text-gray-700">Description</label>
                    <Textarea value={dealForm.description} onChange={e => setDealForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Prix original (FCFA)</label>
                    <Input type="number" value={dealForm.originalPrice} onChange={e => setDealForm(f => ({ ...f, originalPrice: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Prix réduit (FCFA)</label>
                    <Input type="number" value={dealForm.discountedPrice} onChange={e => setDealForm(f => ({ ...f, discountedPrice: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Réduction (%)</label>
                    <Input type="number" value={dealForm.discount} onChange={e => setDealForm(f => ({ ...f, discount: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Valide jusqu'au</label>
                    <Input type="date" value={dealForm.validUntil} onChange={e => setDealForm(f => ({ ...f, validUntil: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => { setIsDealFormOpen(false); setEditingDeal(null); }}>Annuler</Button>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSaveEditDeal} disabled={dealSaving}>
                    {dealSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {deals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun bon plan publié.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {deals.map(deal => (
                <div key={deal.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{deal.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs">{deal.category}</Badge>
                      <span className="text-xs text-red-600 font-semibold">-{deal.discount}%</span>
                      <span className="text-xs text-gray-500">jusqu'au {new Date(deal.validUntil).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {deal.leisureItem && (
                      <p className="text-xs text-indigo-600 mt-0.5">{deal.leisureItem.name}</p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleEditDeal(deal)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteDeal(deal)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Onglet Historique paiements ────────────────────────────────────── */}
        <TabsContent value="history" className="mt-4 space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />Abonnements
            </h3>
            {history.subscriptions.length === 0 ? (
              <p className="text-sm text-gray-500 pl-6">Aucun abonnement.</p>
            ) : (
              history.subscriptions.map(sub => (
                <div key={sub.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                  <CalendarDays className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{sub.leisureItem?.name ?? sub.leisureItemId}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(sub.startDate).toLocaleDateString('fr-FR')} → {new Date(sub.endDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{new Intl.NumberFormat('fr-FR').format(sub.amount)} {sub.currency}</p>
                    {sub.status === 'active' && <Badge className="bg-green-100 text-green-800 text-xs">Actif</Badge>}
                    {sub.status === 'expired' && <Badge className="bg-red-100 text-red-800 text-xs">Expiré</Badge>}
                    {sub.status === 'pending' && <Badge className="bg-amber-100 text-amber-800 text-xs">En attente</Badge>}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Gift className="w-4 h-4 text-green-600" />Paiements bon plans
            </h3>
            {history.dealPayments.length === 0 ? (
              <p className="text-sm text-gray-500 pl-6">Aucun paiement bon plan.</p>
            ) : (
              history.dealPayments.map(dp => (
                <div key={dp.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                  <Gift className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{dp.deal?.title ?? 'En attente de publication'}</p>
                    <p className="text-xs text-gray-500">{dp.leisureItem?.name} · {new Date(dp.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{new Intl.NumberFormat('fr-FR').format(dp.amount)} {dp.currency}</p>
                    {dp.status === 'paid' && <Badge className="bg-green-100 text-green-800 text-xs">Payé</Badge>}
                    {dp.status === 'pending' && <Badge className="bg-amber-100 text-amber-800 text-xs">En attente</Badge>}
                    {dp.status === 'failed' && <Badge className="bg-red-100 text-red-800 text-xs">Échoué</Badge>}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Dialog création établissement ────────────────────────────────────── */}
      <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Ajouter mon établissement
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label>Nom de l'établissement *</Label>
                <Input
                  value={createForm.name}
                  onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex : Restaurant Le Jardin, Hôtel Maya Maya..."
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <Label>Description *</Label>
                <Textarea
                  value={createForm.description}
                  onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Décrivez votre établissement, son ambiance, ses spécialités..."
                  rows={4}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Catégorie *</Label>
                <Select value={createForm.categorySlug} onValueChange={(v: string) => setCreateForm(f => ({ ...f, categorySlug: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEISURE_CATEGORIES.map(c => (
                      <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Pays</Label>
                <Select value={createForm.countryCode ?? 'CG'} onValueChange={(v: string) => setCreateForm(f => ({ ...f, countryCode: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label><MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Localisation (ville, quartier) *</Label>
                <Input
                  value={createForm.location}
                  onChange={e => setCreateForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Ex : Brazzaville Centre, Gombe Kinshasa..."
                />
              </div>

              <div className="space-y-1.5">
                <Label><MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Adresse complète</Label>
                <Input
                  value={createForm.address ?? ''}
                  onChange={e => setCreateForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Ex : Avenue des Nations-Unies, Brazzaville"
                />
              </div>

              <div className="space-y-1.5">
                <Label><Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Téléphone</Label>
                <Input
                  value={createForm.phone ?? ''}
                  onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+242 06 xxx xx xx"
                />
              </div>

              <div className="space-y-1.5">
                <Label><Globe className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Site web</Label>
                <Input
                  value={createForm.website ?? ''}
                  onChange={e => setCreateForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="www.monsite.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label><DollarSign className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Fourchette de prix</Label>
                <Input
                  value={createForm.priceRange ?? ''}
                  onChange={e => setCreateForm(f => ({ ...f, priceRange: e.target.value }))}
                  placeholder="Ex : 5 000 - 25 000 FCFA"
                />
              </div>

              <div className="space-y-1.5">
                <Label><Clock className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Horaires d'ouverture</Label>
                <Input
                  value={createForm.openingHours ?? ''}
                  onChange={e => setCreateForm(f => ({ ...f, openingHours: e.target.value }))}
                  placeholder="Ex : 10h00 - 23h00 / 24h/24"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <Label><ImageIcon className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Image (URL)</Label>
                <Input
                  value={createForm.image ?? ''}
                  onChange={e => setCreateForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1.5">
                <Label>Tags (séparés par des virgules)</Label>
                <Input
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="Ex : Piscine, Terrasse, Vue fleuve"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Équipements / Services</Label>
                <Input
                  value={featuresInput}
                  onChange={e => setFeaturesInput(e.target.value)}
                  placeholder="Ex : WiFi, Parking, Restaurant, Spa"
                />
              </div>
            </div>

            {pricing && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-indigo-800">Abonnement annuel requis</p>
                  <p className="text-xs text-indigo-600 mt-0.5">
                    Après la création, vous serez invité à payer <strong>{new Intl.NumberFormat('fr-FR').format(pricing.establishmentAnnualFee)} {pricing.currency}/an</strong> pour publier votre établissement sur Feeti.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsCreateFormOpen(false)}>
                Annuler
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleCreateEstablishment}
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Créer et payer l'abonnement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal paiement */}
      {pricing && (
        <EstablishmentPaymentModal
          open={paymentModal.open}
          onClose={() => setPaymentModal(p => ({ ...p, open: false }))}
          type={paymentModal.type}
          pricing={pricing}
          leisureItemId={paymentModal.leisureItemId}
          establishmentName={paymentModal.establishmentName}
          dealData={paymentModal.dealData}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
