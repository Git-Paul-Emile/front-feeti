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
  Phone, Globe, Clock, DollarSign, Image as ImageIcon, Upload, Check,
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
import LeisureAPI from '../../services/api/LeisureAPI';
import CountryAPI from '../../services/api/CountryAPI';
import EventsBackendAPI from '../../services/api/EventsBackendAPI';
import { getCitiesForCountry } from '../../utils/citiesByCountry';

// Liste de secours : la liste réelle vient de l'API (mêmes catégories que les filtres publics)
const FALLBACK_LEISURE_CATEGORIES = [
  { slug: 'hotels', name: 'Hôtels' },
  { slug: 'restaurants', name: 'Restaurants' },
  { slug: 'sports', name: 'Sport & Bien-être' },
  { slug: 'loisirs', name: 'Loisirs' },
  { slug: 'envolee', name: 'Évasion' },
  { slug: 'bar-night', name: 'Bar & Nuit' },
];

const FALLBACK_COUNTRIES = [
  { code: 'CG', name: 'République du Congo', flag: '🇨🇬' },
  { code: 'CD', name: 'RDC', flag: '🇨🇩' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮' },
];

// Équipements / services proposés, alignés sur ceux des établissements déjà publiés
const COMMON_FEATURES = ['WiFi', 'Parking', 'Climatisation', 'Accès PMR', 'Paiement Mobile Money', 'Paiement par carte'];
const FEATURES_BY_CATEGORY: Record<string, string[]> = {
  hotels: ['Piscine', 'Spa', 'Restaurant', 'Bar lounge', 'Petit déjeuner inclus', 'Centre de conférences', 'Navette aéroport', 'Vue fleuve', 'Vue océan'],
  restaurants: ['Terrasse', 'Cuisine locale', 'Cuisine fusion', 'Buffet', 'Brunch weekend', 'Plats végétariens', 'Cave à vins', 'Livraison', 'À emporter', 'Réservation recommandée'],
  sports: ['Cardio', 'Musculation', 'Yoga', 'Zumba', 'Coaching personnalisé', 'Vestiaires', 'Massage relaxant', 'Hammam', 'Sauna', 'Soins beauté', 'Piscine'],
  loisirs: ['Salle de jeux', 'Billard', 'Bowling', 'Réalité virtuelle', 'Consoles de jeux', 'Tournois', 'Snack-bar', 'Anniversaires', 'Espace enfants'],
  envolee: ['Guide', 'Transport inclus', 'Repas inclus', 'Hébergement inclus', 'Observation faune', 'Plongée', 'Location équipement', 'Cours débutants'],
  'bar-night': ['Cocktails', 'DJ sets', 'Tables VIP', 'Service bouteille', 'Happy hour', 'Musique live', 'Terrasse', 'Vue panoramique', 'Dress code'],
};

const TAG_OPTIONS = [
  'Luxe', 'Famille', 'Romantique', 'Business', 'Gastronomie', 'Traditionnel', 'Nature',
  'Aventure', 'Bien-être', 'Jeunes', 'VIP', 'Vue fleuve', 'Vue mer', 'Terrasse', 'Piscine',
];

const PRICE_CURRENCIES = ['FCFA', 'USD', 'EUR'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // même limite que l'upload backend

const emptyCreateForm = (): CreateEstablishmentInput => ({
  name: '',
  description: '',
  categorySlug: '',
  location: '',
  address: '',
  phone: '',
  website: '',
  priceRange: '',
  openingHours: '',
  image: '',
  countryCode: '',
  tags: [],
  features: [],
});

const formatAmount = (n: number) => new Intl.NumberFormat('fr-FR').format(n).replace(/ | /g, ' ');

/** Sélecteur à choix multiples : options prédéfinies + ajout libre. */
function MultiChoice({ label, options, selected, onChange, addPlaceholder }: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  addPlaceholder: string;
}) {
  const [custom, setCustom] = useState('');
  // Les valeurs choisies hors liste (ajout libre, autre catégorie) restent visibles
  const all = [...options, ...selected.filter(s => !options.includes(s))];
  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter(s => s !== value) : [...selected, value]);
  const addCustom = () => {
    const value = custom.trim();
    if (!value) return;
    const existing = all.find(o => o.toLowerCase() === value.toLowerCase());
    if (!selected.includes(existing ?? value)) onChange([...selected, existing ?? value]);
    setCustom('');
  };
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-gray-900">
        {label}
        {selected.length > 0 && <span className="ml-2 text-xs font-normal text-gray-500">{selected.length} sélectionné{selected.length > 1 ? 's' : ''}</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {all.map(option => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(option)}
              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                active
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-400'
              }`}
            >
              {active && <Check className="w-3 h-3" aria-hidden="true" />}
              {option}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Input
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
          placeholder={addPlaceholder}
          className="h-8 text-sm"
        />
        <Button type="button" size="sm" variant="outline" onClick={addCustom} disabled={!custom.trim()}>
          Ajouter
        </Button>
      </div>
    </fieldset>
  );
}

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
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);
  const [dealSaving, setDealSaving] = useState(false);
  const [dealImageFile, setDealImageFile] = useState<File | null>(null);
  const [dealImagePreview, setDealImagePreview] = useState('');
  const [dealUploading, setDealUploading] = useState(false);

  // Formulaire création établissement
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateEstablishmentInput>(emptyCreateForm());
  const [createStep, setCreateStep] = useState<string | null>(null);
  const isCreating = createStep !== null;
  const [leisureCategories, setLeisureCategories] = useState(FALLBACK_LEISURE_CATEGORIES);
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('FCFA');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const cityOptions = getCitiesForCountry(createForm.countryCode);
  const featureOptions = [
    ...(FEATURES_BY_CATEGORY[createForm.categorySlug] ?? []),
    ...COMMON_FEATURES,
  ];

  // Catégories et pays : mêmes référentiels que les établissements publiés et leurs filtres
  useEffect(() => {
    LeisureAPI.getCategories()
      .then(cats => { if (cats.length > 0) setLeisureCategories(cats.map(c => ({ slug: c.slug, name: c.name }))); })
      .catch(() => {});
    CountryAPI.getAll()
      .then(list => {
        const active = list.filter(c => c.isActive !== false);
        if (active.length > 0) setCountries(active.map(c => ({ code: c.code, name: c.name, flag: c.flag })));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!dealImagePreview) return;
    return () => URL.revokeObjectURL(dealImagePreview);
  }, [dealImagePreview]);

  const resetDealImage = () => {
    setDealImageFile(null);
    setDealImagePreview('');
  };

  const handleDealImageSelected = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Le fichier doit être une image (JPG, PNG, WebP)'); return; }
    if (file.size > MAX_IMAGE_SIZE) { toast.error("L'image ne doit pas dépasser 5 Mo"); return; }
    setDealImageFile(file);
    setDealImagePreview(URL.createObjectURL(file));
  };

  // Libère l'aperçu local de l'image
  useEffect(() => {
    if (!imagePreview) return;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  // silent : rafraîchit les données sans remplacer la page par le spinner
  // (sinon les fenêtres ouvertes, dont la confirmation de paiement, sont démontées)
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
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
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpenCreateForm = () => {
    setCreateForm(emptyCreateForm());
    setCity('');
    setDistrict('');
    setPriceMin('');
    setPriceMax('');
    setPriceCurrency('FCFA');
    setImageFile(null);
    setImagePreview('');
    setIsCreateFormOpen(true);
  };

  const handleImageSelected = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Le fichier doit être une image (JPG, PNG, WebP)'); return; }
    if (file.size > MAX_IMAGE_SIZE) { toast.error("L'image ne doit pas dépasser 5 Mo"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCreateEstablishment = async () => {
    if (isCreating) return;
    if (!createForm.name.trim()) { toast.error("Le nom de l'établissement est obligatoire"); return; }
    if (!createForm.description.trim()) { toast.error('La description est obligatoire'); return; }
    if (!createForm.categorySlug) { toast.error('Choisissez une catégorie'); return; }
    if (!createForm.countryCode) { toast.error('Choisissez un pays'); return; }
    if (!city.trim()) { toast.error('Choisissez une ville'); return; }
    if (!imageFile) { toast.error("Ajoutez une photo de l'établissement"); return; }
    const min = priceMin === '' ? null : Number(priceMin);
    const max = priceMax === '' ? null : Number(priceMax);
    if ((min !== null && (!Number.isFinite(min) || min < 0)) || (max !== null && (!Number.isFinite(max) || max < 0))) {
      toast.error('La fourchette de prix est invalide');
      return;
    }
    if (min !== null && max !== null && min > max) {
      toast.error('Le prix minimum doit être inférieur au prix maximum');
      return;
    }
    let priceRange = '';
    if (min !== null && max !== null) priceRange = `${formatAmount(min)} - ${formatAmount(max)} ${priceCurrency}`;
    else if (min !== null) priceRange = `À partir de ${formatAmount(min)} ${priceCurrency}`;
    else if (max !== null) priceRange = `Jusqu'à ${formatAmount(max)} ${priceCurrency}`;

    setCreateStep("Envoi de l'image...");
    try {
      const image = await EventsBackendAPI.uploadImage(imageFile);
      setCreateStep("Création de l'établissement...");
      const data: CreateEstablishmentInput = {
        ...createForm,
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        // Même format que les établissements existants : « Quartier, Ville »
        location: district.trim() ? `${district.trim()}, ${city.trim()}` : city.trim(),
        priceRange,
        image,
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
      setCreateStep(null);
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

    // Le propriétaire remplit d'abord son offre, le paiement vient ensuite
    const form = {
      ...emptyDealForm(),
      location: estab.location,
      merchantName: estab.name,
      image: estab.image || '',
      contactPhone: estab.phone || '',
    };
    setDealForm(form);
    resetDealImage();
    setEditingDeal(null);
    setIsCreatingDeal(true);
    setIsDealFormOpen(true);
  };

  const handleSubmitNewDeal = async () => {
    if (dealUploading) return;
    const estab = establishments.find(e => e.id === selectedEstabForDeal);
    if (!estab) { toast.error('Sélectionnez un établissement'); return; }
    const { title, originalPrice, discountedPrice, validUntil } = dealForm;
    if (title.trim().length < 3) { toast.error('Donnez un titre à votre bon plan (3 caractères minimum)'); return; }
    if (!(originalPrice > 0)) { toast.error("Indiquez le prix d'origine"); return; }
    if (!(discountedPrice >= 0) || discountedPrice >= originalPrice) {
      toast.error("Le prix remisé doit être inférieur au prix d'origine");
      return;
    }
    if (!validUntil) { toast.error('Indiquez la date de fin de validité'); return; }
    const discount = dealForm.discount > 0
      ? dealForm.discount
      : Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
    let image = dealForm.image;
    if (dealImageFile) {
      // L'image est envoyée avant le paiement : le bon plan est publié avec sa photo
      setDealUploading(true);
      try {
        image = await EventsBackendAPI.uploadImage(dealImageFile);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? "Échec de l'envoi de l'image");
        return;
      } finally {
        setDealUploading(false);
      }
      resetDealImage();
    }
    const data = { ...dealForm, title: title.trim(), discount, image };
    setDealForm(data);
    setPaymentModal({ open: true, type: 'bonplan', leisureItemId: estab.id, establishmentName: estab.name, dealData: data });
  };

  const closeDealForm = () => {
    resetDealImage();
    setIsDealFormOpen(false);
    setEditingDeal(null);
    setIsCreatingDeal(false);
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
    resetDealImage();
    setIsDealFormOpen(true);
  };

  const handleSaveEditDeal = async () => {
    if (!editingDeal) return;
    setDealSaving(true);
    try {
      const image = dealImageFile ? await EventsBackendAPI.uploadImage(dealImageFile) : dealForm.image;
      const updated = await EstablishmentOwnerAPI.updateDeal(editingDeal.id, { ...dealForm, image } as any);
      resetDealImage();
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
    if (paymentModal.type === 'bonplan') closeDealForm();
    void loadData(true);
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
          <Button size="sm" variant="outline" onClick={() => loadData()}>
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
          {isDealFormOpen && (editingDeal || isCreatingDeal) && (
            <Card className="border-indigo-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {editingDeal ? `Modifier : ${editingDeal.title}` : 'Nouveau bon plan'}
                </CardTitle>
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
                    <Input type="date" value={dealForm.validUntil} min={new Date().toISOString().slice(0, 10)} onChange={e => setDealForm(f => ({ ...f, validUntil: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Catégorie</label>
                    <Select value={dealForm.category} onValueChange={(v: string) => setDealForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DEAL_CATEGORIES.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Téléphone de contact</label>
                    <Input value={dealForm.contactPhone} onChange={e => setDealForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="+242 06 xxx xx xx" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label htmlFor="deal-image" className="text-xs font-medium text-gray-700">Image du bon plan</label>
                    <div className="flex items-center gap-4">
                      <div className="w-28 h-20 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                        {(dealImagePreview || dealForm.image) ? (
                          <img src={dealImagePreview || dealForm.image} alt="Aperçu de l'image du bon plan" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-300" aria-hidden="true" />
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <input
                          id="deal-image"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={e => { handleDealImageSelected(e.target.files?.[0]); e.target.value = ''; }}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('deal-image')?.click()}>
                          <Upload className="w-4 h-4 mr-1.5" />
                          {(dealImageFile || dealForm.image) ? "Changer l'image" : 'Choisir une image'}
                        </Button>
                        <p className="text-xs text-gray-500 truncate">
                          {dealImageFile
                            ? dealImageFile.name
                            : dealForm.image
                              ? "Image actuelle. Sans changement, elle sera conservée."
                              : 'JPG, PNG ou WebP, 5 Mo maximum'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={closeDealForm}>Annuler</Button>
                  {editingDeal ? (
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSaveEditDeal} disabled={dealSaving}>
                      {dealSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}Enregistrer
                    </Button>
                  ) : (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSubmitNewDeal} disabled={dealUploading}>
                      {dealUploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />Envoi de l'image...</> : 'Continuer vers le paiement'}
                      {pricing && ` (${new Intl.NumberFormat('fr-FR').format(pricing.bonplanCreationFee)} ${pricing.currency})`}
                    </Button>
                  )}
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
                <Label htmlFor="estab-name">Nom de l'établissement *</Label>
                <Input
                  id="estab-name"
                  value={createForm.name}
                  onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex : Restaurant Le Jardin, Hôtel Maya Maya..."
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="estab-description">Description *</Label>
                <Textarea
                  id="estab-description"
                  value={createForm.description}
                  onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Décrivez votre établissement, son ambiance, ses spécialités..."
                  rows={4}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Catégorie *</Label>
                <Select value={createForm.categorySlug} onValueChange={(v: string) => setCreateForm(f => ({ ...f, categorySlug: v }))}>
                  <SelectTrigger aria-label="Catégorie"><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                  <SelectContent>
                    {leisureCategories.map(c => (
                      <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Pays *</Label>
                <Select
                  value={createForm.countryCode ?? ''}
                  onValueChange={(v: string) => {
                    setCreateForm(f => ({ ...f, countryCode: v }));
                    setCity(''); // la ville dépend du pays
                  }}
                >
                  <SelectTrigger aria-label="Pays"><SelectValue placeholder="Choisir un pays" /></SelectTrigger>
                  <SelectContent>
                    {countries.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label><MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Ville *</Label>
                {cityOptions.length > 0 ? (
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger aria-label="Ville"><SelectValue placeholder="Choisir une ville" /></SelectTrigger>
                    <SelectContent>
                      {cityOptions.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    aria-label="Ville"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    disabled={!createForm.countryCode}
                    placeholder={createForm.countryCode ? 'Nom de la ville' : "Choisissez d'abord un pays"}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="estab-district">Quartier</Label>
                <Input
                  id="estab-district"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="Ex : Centre-ville, Gombe, Plateau..."
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="estab-address"><MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Adresse complète</Label>
                <Input
                  id="estab-address"
                  value={createForm.address ?? ''}
                  onChange={e => setCreateForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Ex : 12 avenue des Nations-Unies"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="estab-phone"><Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Téléphone</Label>
                <Input
                  id="estab-phone"
                  type="tel"
                  value={createForm.phone ?? ''}
                  onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+242 06 xxx xx xx"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="estab-website"><Globe className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Site web</Label>
                <Input
                  id="estab-website"
                  value={createForm.website ?? ''}
                  onChange={e => setCreateForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="www.monsite.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label><DollarSign className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Fourchette de prix</Label>
                <div className="flex items-center gap-2">
                  <Input
                    aria-label="Prix minimum"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={priceMin}
                    onChange={e => setPriceMin(e.target.value)}
                    placeholder="Min"
                  />
                  <span className="text-gray-400">-</span>
                  <Input
                    aria-label="Prix maximum"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={priceMax}
                    onChange={e => setPriceMax(e.target.value)}
                    placeholder="Max"
                  />
                  <Select value={priceCurrency} onValueChange={setPriceCurrency}>
                    <SelectTrigger aria-label="Devise" className="w-24 shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRICE_CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="estab-hours"><Clock className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Horaires d'ouverture</Label>
                <Input
                  id="estab-hours"
                  value={createForm.openingHours ?? ''}
                  onChange={e => setCreateForm(f => ({ ...f, openingHours: e.target.value }))}
                  placeholder="Ex : 10h00 - 23h00 / 24h/24"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="estab-image"><ImageIcon className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Photo de l'établissement *</Label>
                <div className="flex items-center gap-4">
                  <div className="w-28 h-20 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Aperçu de la photo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-300" aria-hidden="true" />
                    )}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <input
                      id="estab-image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={e => { handleImageSelected(e.target.files?.[0]); e.target.value = ''; }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('estab-image')?.click()}>
                      <Upload className="w-4 h-4 mr-1.5" />
                      {imageFile ? 'Changer la photo' : 'Choisir une photo'}
                    </Button>
                    <p className="text-xs text-gray-500 truncate">
                      {imageFile ? imageFile.name : 'JPG, PNG ou WebP, 5 Mo maximum'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <MultiChoice
                  label="Équipements / Services"
                  options={featureOptions}
                  selected={createForm.features ?? []}
                  onChange={features => setCreateForm(f => ({ ...f, features }))}
                  addPlaceholder="Autre équipement ou service"
                />
              </div>

              <div className="md:col-span-2">
                <MultiChoice
                  label="Tags"
                  options={TAG_OPTIONS}
                  selected={createForm.tags ?? []}
                  onChange={tags => setCreateForm(f => ({ ...f, tags }))}
                  addPlaceholder="Autre tag"
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
                {createStep ?? "Créer et payer l'abonnement"}
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
