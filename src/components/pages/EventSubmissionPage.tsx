// Page de soumission d'événement pour les organisateurs

import { useState, useEffect } from 'react';
import CountryAPI, { type Country } from '../../services/api/CountryAPI';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Plus,
  X,
  Calendar,
  MapPin,
  Ticket,
  Users,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Tag,
  DollarSign,
  CheckCircle,
  Loader,
  AlertCircle,
  Info,
  Star,
  Send
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import EventSubmissionAPI from '../../services/api/EventSubmissionAPI';
import { EVENT_CATEGORIES } from '../../data/categories';

interface EventSubmissionPageProps {
  onBack: () => void;
  currentUser: any;
}

interface EventSubmissionForm {
  // 1. Informations organisateur
  organizerName: string;
  organizerType: 'individual' | 'company';
  organizerEmail: string;
  organizerPhone: string;
  organizerWebsite: string;
  organizerLogo: File | null;

  // 2. Détails événement
  eventName: string;
  isLive: boolean;
  category: string;
  description: string;
  hashtags: string[];

  // 3. Date et horaire
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  recurrence: 'unique' | 'weekly' | 'monthly' | 'other';
  recurrenceDetails: string;

  // 4. Lieu
  venueName: string;
  address: string;
  city: string;
  countryCode: string;
  googleMapsLink: string;
  hasStreaming: boolean;

  // 5. Billetterie
  accessType: 'free' | 'paid';
  tickets: TicketType[];
  salesStartDate: string;
  salesEndDate: string;

  // 6. Visuels
  mainPoster: File | null;
  gallery: File[];
  videoLink: string;

  // 7. Partenaires
  partners: Partner[];

  // 8. Options promotion
  featuredHomepage: boolean;
  feetiAds: boolean;
  socialMediaShare: boolean;
  pushNotification: boolean;

  // 9. Conditions
  acceptTerms: boolean;
  confirmAccuracy: boolean;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Partner {
  id: string;
  name: string;
  logo: File | null;
}

export function EventSubmissionPage({ onBack, currentUser }: EventSubmissionPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    CountryAPI.getAll().then(data => setCountries(data.filter(c => c.isActive))).catch(() => {});
  }, []);
  const [formData, setFormData] = useState<EventSubmissionForm>({
    organizerName: currentUser?.name || '',
    organizerType: 'individual',
    organizerEmail: currentUser?.email || '',
    organizerPhone: currentUser?.phone || '',
    organizerWebsite: '',
    organizerLogo: null,
    eventName: '',
    isLive: false,
    category: '',
    description: '',
    hashtags: [],
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    recurrence: 'unique',
    recurrenceDetails: '',
    venueName: '',
    address: '',
    city: '',
    countryCode: '',
    googleMapsLink: '',
    hasStreaming: false,
    accessType: 'paid',
    tickets: [{
      id: '1',
      name: 'Standard',
      price: 0,
      quantity: 100
    }],
    salesStartDate: '',
    salesEndDate: '',
    mainPoster: null,
    gallery: [],
    videoLink: '',
    partners: [],
    featuredHomepage: false,
    feetiAds: false,
    socialMediaShare: false,
    pushNotification: false,
    acceptTerms: false,
    confirmAccuracy: false
  });

  const [currentHashtag, setCurrentHashtag] = useState('');

  const totalSteps = 9;
  const progress = (currentStep / totalSteps) * 100;

  const categories = EVENT_CATEGORIES;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (field === 'gallery') {
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...Array.from(files)]
      }));
      toast.success(`${files.length} image(s) ajoutée(s)`);
    } else {
      setFormData(prev => ({ ...prev, [field]: files[0] }));
      toast.success('Image chargée avec succès');
    }
  };

  const addHashtag = () => {
    if (currentHashtag && !formData.hashtags.includes(currentHashtag)) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, currentHashtag]
      }));
      setCurrentHashtag('');
    }
  };

  const removeHashtag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(t => t !== tag)
    }));
  };

  const addTicketType = () => {
    const newTicket: TicketType = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      quantity: 0
    };
    setFormData(prev => ({
      ...prev,
      tickets: [...prev.tickets, newTicket]
    }));
  };

  const removeTicketType = (id: string) => {
    setFormData(prev => ({
      ...prev,
      tickets: prev.tickets.filter(t => t.id !== id)
    }));
  };

  const updateTicket = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      tickets: prev.tickets.map(t =>
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  };

  const addPartner = () => {
    const newPartner: Partner = {
      id: Date.now().toString(),
      name: '',
      logo: null
    };
    setFormData(prev => ({
      ...prev,
      partners: [...prev.partners, newPartner]
    }));
  };

  const removePartner = (id: string) => {
    setFormData(prev => ({
      ...prev,
      partners: prev.partners.filter(p => p.id !== id)
    }));
  };

  const updatePartner = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      partners: prev.partners.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.organizerName || !formData.organizerEmail || !formData.organizerPhone) {
          toast.error('Veuillez remplir tous les champs obligatoires');
          return false;
        }
        break;
      case 2:
        if (!formData.eventName || !formData.category || !formData.description) {
          toast.error('Veuillez remplir tous les champs obligatoires');
          return false;
        }
        break;
      case 3:
        if (!formData.startDate || !formData.startTime) {
          toast.error('Veuillez renseigner la date et l\'heure de début');
          return false;
        }
        break;
      case 4:
        if (!formData.venueName || !formData.address || !formData.city) {
          toast.error('Veuillez renseigner le lieu de l\'événement');
          return false;
        }
        break;
      case 5:
        if (formData.accessType === 'paid' && formData.tickets.length === 0) {
          toast.error('Veuillez ajouter au moins un type de billet');
          return false;
        }
        break;
      case 6:
        if (!formData.mainPoster) {
          toast.error('L\'affiche principale est obligatoire');
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!formData.acceptTerms || !formData.confirmAccuracy) {
      toast.error('Veuillez accepter les conditions');
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les données pour l'API
      const submissionData = {
        organizerName: formData.organizerName,
        organizerType: formData.organizerType,
        organizerEmail: formData.organizerEmail,
        organizerPhone: formData.organizerPhone,
        organizerWebsite: formData.organizerWebsite,
        organizerLogo: formData.organizerLogo || undefined,
        eventName: formData.eventName,
        category: formData.category,
        description: formData.description,
        hashtags: formData.hashtags,
        startDate: formData.startDate,
        startTime: formData.startTime,
        endDate: formData.endDate,
        endTime: formData.endTime,
        recurrence: formData.recurrence,
        recurrenceDetails: formData.recurrenceDetails,
        venueName: formData.venueName,
        address: formData.address,
        city: formData.city,
        countryCode: formData.countryCode,
        googleMapsLink: formData.googleMapsLink,
        isLive: formData.isLive,
        hasStreaming: formData.hasStreaming,
        accessType: formData.accessType,
        tickets: formData.tickets,
        salesStartDate: formData.salesStartDate,
        salesEndDate: formData.salesEndDate,
        mainPoster: formData.mainPoster || undefined,
        gallery: formData.gallery.length > 0 ? formData.gallery : undefined,
        videoLink: formData.videoLink,
        partners: formData.partners,
        featuredHomepage: formData.featuredHomepage,
        feetiAds: formData.feetiAds,
        socialMediaShare: formData.socialMediaShare,
        pushNotification: formData.pushNotification,
        confirmAccuracy: formData.confirmAccuracy,
        acceptTerms: formData.acceptTerms
      };

      // Envoyer à l'API
      const response = await EventSubmissionAPI.submitEvent(submissionData);

      if (response.success) {
        toast.success('Événement soumis avec succès ! Vous recevrez une réponse par email sous 24-48h.');
        
        // Redirection après 2 secondes
        setTimeout(() => {
          onBack();
        }, 2000);
      } else {
        throw new Error(response.error || 'Erreur lors de la soumission');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Erreur lors de la soumission. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                1. Informations sur l'Organisateur
              </CardTitle>
              <CardDescription>
                Identifiez-vous en tant qu'organisateur de l'événement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="organizerName">Nom de l'organisateur / Structure *</Label>
                <Input
                  id="organizerName"
                  value={formData.organizerName}
                  onChange={(e) => handleInputChange('organizerName', e.target.value)}
                  placeholder="Ex: Association MusicEvents Pro"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Type d'organisateur *</Label>
                <RadioGroup
                  value={formData.organizerType}
                  onValueChange={(value) => handleInputChange('organizerType', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="cursor-pointer">
                      <User className="w-4 h-4 inline mr-2" />
                      Particulier
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company" className="cursor-pointer">
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Entreprise / Association / Groupe
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organizerEmail">Email de contact *</Label>
                  <Input
                    id="organizerEmail"
                    type="email"
                    value={formData.organizerEmail}
                    onChange={(e) => handleInputChange('organizerEmail', e.target.value)}
                    placeholder="contact@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizerPhone">Téléphone *</Label>
                  <Input
                    id="organizerPhone"
                    type="tel"
                    value={formData.organizerPhone}
                    onChange={(e) => handleInputChange('organizerPhone', e.target.value)}
                    placeholder="+242 6 XX XX XX XX"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizerWebsite">Site web ou réseau social</Label>
                <Input
                  id="organizerWebsite"
                  type="url"
                  value={formData.organizerWebsite}
                  onChange={(e) => handleInputChange('organizerWebsite', e.target.value)}
                  placeholder="https://www.example.com ou @instagram"
                />
              </div>

              <div className="space-y-2">
                <Label>Logo ou image de marque</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                  <input
                    type="file"
                    id="organizerLogo"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('organizerLogo', e.target.files)}
                    className="hidden"
                  />
                  <label htmlFor="organizerLogo" className="cursor-pointer">
                    {formData.organizerLogo ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>{formData.organizerLogo.name}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Cliquez pour télécharger votre logo
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG jusqu'à 5MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                2. Détails de l'Événement
              </CardTitle>
              <CardDescription>
                Présentez votre événement de manière attractive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="eventName">Nom de l'événement *</Label>
                <Input
                  id="eventName"
                  value={formData.eventName}
                  onChange={(e) => handleInputChange('eventName', e.target.value)}
                  placeholder="Ex: Festival Jazz d'Été 2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Type d'événement *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('isLive', false)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      !formData.isLive
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Building2 className="w-5 h-5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-sm">En présentiel</p>
                      <p className="text-xs opacity-70">Événement physique</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('isLive', true)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      formData.isLive
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Video className="w-5 h-5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-sm">🔴 Live streaming</p>
                      <p className="text-xs opacity-70">Diffusion en direct</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description complète *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez votre événement en détail..."
                  rows={8}
                  className="resize-none"
                  required
                />
                <p className="text-xs text-gray-500">
                  {formData.description.length} / 2000 caractères
                </p>
              </div>

              <div className="space-y-2">
                <Label>Hashtags et mots-clés (SEO)</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentHashtag}
                    onChange={(e) => setCurrentHashtag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                    placeholder="Ex: jazz, musique, concert"
                  />
                  <Button type="button" onClick={addHashtag} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.hashtags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      #{tag}
                      <button onClick={() => removeHashtag(tag)} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                3. Date et Horaire
              </CardTitle>
              <CardDescription>
                Planifiez les dates de votre événement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Heure de début *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">Heure de fin</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Récurrence</Label>
                <RadioGroup
                  value={formData.recurrence}
                  onValueChange={(value: any) => handleInputChange('recurrence', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unique" id="unique" />
                    <Label htmlFor="unique" className="cursor-pointer">Événement unique</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly" className="cursor-pointer">Hebdomadaire</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="cursor-pointer">Mensuel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer">Autre</Label>
                  </div>
                </RadioGroup>

                {formData.recurrence === 'other' && (
                  <Input
                    value={formData.recurrenceDetails}
                    onChange={(e) => handleInputChange('recurrenceDetails', e.target.value)}
                    placeholder="Précisez la récurrence..."
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                4. Lieu de l'Événement
              </CardTitle>
              <CardDescription>
                Indiquez où se déroulera votre événement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="venueName">Nom du lieu *</Label>
                <Input
                  id="venueName"
                  value={formData.venueName}
                  onChange={(e) => handleInputChange('venueName', e.target.value)}
                  placeholder="Ex: Palais des Congrès"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse complète *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Rue, quartier, numéro..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Brazzaville, Pointe-Noire..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="countryCode">Pays *</Label>
                  <Select
                    value={formData.countryCode}
                    onValueChange={(value) => handleInputChange('countryCode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le pays de l'événement" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleMapsLink">Lien Google Maps (facultatif)</Label>
                <Input
                  id="googleMapsLink"
                  type="url"
                  value={formData.googleMapsLink}
                  onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-blue-600" />
                  <div>
                    <Label className="cursor-pointer">Possibilité de streaming live sur Feeti ?</Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Diffusez votre événement en direct sur notre plateforme
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.hasStreaming}
                  onCheckedChange={(checked) => handleInputChange('hasStreaming', checked)}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-indigo-600" />
                5. Billetterie et Tarifs
              </CardTitle>
              <CardDescription>
                Configurez les types de billets et les prix
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Type d'accès *</Label>
                <RadioGroup
                  value={formData.accessType}
                  onValueChange={(value: any) => handleInputChange('accessType', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="free" />
                    <Label htmlFor="free" className="cursor-pointer">Gratuit</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paid" id="paid" />
                    <Label htmlFor="paid" className="cursor-pointer">Payant</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.accessType === 'paid' && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Types de billets</Label>
                      <Button type="button" onClick={addTicketType} size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un type
                      </Button>
                    </div>

                    {formData.tickets.map((ticket, index) => (
                      <Card key={ticket.id} className="p-4 bg-gray-50">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">Billet {index + 1}</Badge>
                            {formData.tickets.length > 1 && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeTicketType(ticket.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Nom du billet *</Label>
                              <Input
                                value={ticket.name}
                                onChange={(e) => updateTicket(ticket.id, 'name', e.target.value)}
                                placeholder="Ex: Standard, VIP..."
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Prix (FCFA) *</Label>
                              <Input
                                type="number"
                                value={ticket.price}
                                onChange={(e) => updateTicket(ticket.id, 'price', Number(e.target.value))}
                                placeholder="0"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Quantité *</Label>
                              <Input
                                type="number"
                                value={ticket.quantity}
                                onChange={(e) => updateTicket(ticket.id, 'quantity', Number(e.target.value))}
                                placeholder="100"
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salesStartDate">Ouverture des ventes</Label>
                      <Input
                        id="salesStartDate"
                        type="datetime-local"
                        value={formData.salesStartDate}
                        onChange={(e) => handleInputChange('salesStartDate', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salesEndDate">Clôture des ventes</Label>
                      <Input
                        id="salesEndDate"
                        type="datetime-local"
                        value={formData.salesEndDate}
                        onChange={(e) => handleInputChange('salesEndDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Commission Feeti :</strong> 5% + frais de paiement. 
                      Les billets électroniques sont automatiques et gratuits pour vos participants.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                6. Visuels et Médias
              </CardTitle>
              <CardDescription>
                Ajoutez des images et vidéos pour attirer les participants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Affiche principale * (Format paysage recommandé)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                  <input
                    type="file"
                    id="mainPoster"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('mainPoster', e.target.files)}
                    className="hidden"
                  />
                  <label htmlFor="mainPoster" className="cursor-pointer">
                    {formData.mainPoster ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <span className="font-medium">{formData.mainPoster.name}</span>
                        <Button type="button" size="sm" variant="outline" onClick={(e) => {
                          e.preventDefault();
                          handleInputChange('mainPoster', null);
                        }}>
                          Changer l'image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <ImageIcon className="w-16 h-16 mx-auto text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-700">
                            Téléchargez l'affiche principale
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Format recommandé: 1920x1080px
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG jusqu'à 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Galerie d'images (max 5)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                  <input
                    type="file"
                    id="gallery"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload('gallery', e.target.files)}
                    className="hidden"
                  />
                  <label htmlFor="gallery" className="cursor-pointer">
                    <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Cliquez pour ajouter des images
                    </p>
                  </label>
                </div>

                {formData.gallery.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {formData.gallery.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              gallery: prev.gallery.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoLink">Vidéo YouTube / Vimeo / Teaser (facultatif)</Label>
                <Input
                  id="videoLink"
                  type="url"
                  value={formData.videoLink}
                  onChange={(e) => handleInputChange('videoLink', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                7. Partenaires et Sponsors (Facultatif)
              </CardTitle>
              <CardDescription>
                Ajoutez les logos de vos partenaires
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>Liste des partenaires</Label>
                <Button type="button" onClick={addPartner} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un partenaire
                </Button>
              </div>

              {formData.partners.length === 0 ? (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    Aucun partenaire ajouté. Cette section est optionnelle.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {formData.partners.map((partner, index) => (
                    <Card key={partner.id} className="p-4 bg-gray-50">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <Input
                            value={partner.name}
                            onChange={(e) => updatePartner(partner.id, 'name', e.target.value)}
                            placeholder="Nom du partenaire"
                          />
                          
                          <div className="border border-gray-300 rounded-lg p-3">
                            <input
                              type="file"
                              id={`partner-logo-${partner.id}`}
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                updatePartner(partner.id, 'logo', file);
                              }}
                              className="hidden"
                            />
                            <label htmlFor={`partner-logo-${partner.id}`} className="cursor-pointer flex items-center gap-2">
                              {partner.logo ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-sm">{partner.logo.name}</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">Charger le logo</span>
                                </>
                              )}
                            </label>
                          </div>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removePartner(partner.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 8:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-indigo-600" />
                8. Options de Promotion
              </CardTitle>
              <CardDescription>
                Boostez la visibilité de votre événement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-amber-600" />
                  <div>
                    <Label className="cursor-pointer">Mise en avant sur la page d'accueil</Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Augmentez votre visibilité (+2000 FCFA)
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.featuredHomepage}
                  onCheckedChange={(checked) => handleInputChange('featuredHomepage', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <div>
                    <Label className="cursor-pointer">Campagne publicitaire Feeti Ads</Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Ciblez votre audience (à partir de 5000 FCFA)
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.feetiAds}
                  onCheckedChange={(checked) => handleInputChange('feetiAds', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <div>
                    <Label className="cursor-pointer">Partage sur les réseaux sociaux Feeti</Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Facebook, Instagram, Twitter (Gratuit)
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.socialMediaShare}
                  onCheckedChange={(checked) => handleInputChange('socialMediaShare', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-green-600" />
                  <div>
                    <Label className="cursor-pointer">Notification push (app mobile)</Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Alertez nos utilisateurs mobiles (Gratuit)
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.pushNotification}
                  onCheckedChange={(checked) => handleInputChange('pushNotification', checked)}
                />
              </div>

              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Les options de promotion sont facturées séparément. Vous serez contacté pour finaliser votre commande.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );

      case 9:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                9. Validation et Conditions
              </CardTitle>
              <CardDescription>
                Relisez et confirmez votre soumission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Votre événement sera examiné par notre équipe sous <strong>24-48 heures</strong>. 
                  Vous recevrez un email de confirmation une fois approuvé.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
                <h4 className="font-semibold">Récapitulatif</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Événement</p>
                    <p className="font-medium">{formData.eventName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Catégorie</p>
                    <p className="font-medium">{formData.category || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium">{formData.startDate || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Lieu</p>
                    <p className="font-medium">{formData.city || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Type d'accès</p>
                    <p className="font-medium">{formData.accessType === 'free' ? 'Gratuit' : 'Payant'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Streaming</p>
                    <p className="font-medium">{formData.hasStreaming ? 'Oui' : 'Non'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="confirmAccuracy"
                    checked={formData.confirmAccuracy}
                    onCheckedChange={(checked: boolean) => handleInputChange('confirmAccuracy', checked)}
                  />
                  <Label htmlFor="confirmAccuracy" className="cursor-pointer leading-relaxed">
                    Je confirme que les informations fournies sont exactes et à jour
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked: boolean) => handleInputChange('acceptTerms', checked)}
                  />
                  <Label htmlFor="acceptTerms" className="cursor-pointer leading-relaxed">
                    J'accepte les{' '}
                    <a href="#" className="text-indigo-600 hover:underline">
                      conditions générales d'utilisation
                    </a>
                    {' '}de Feeti et la{' '}
                    <a href="#" className="text-indigo-600 hover:underline">
                      politique de commission
                    </a>
                  </Label>
                </div>
              </div>

              <Alert variant="destructive" className="bg-amber-50 border-amber-300">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Important :</strong> Toute information fausse ou trompeuse entraînera 
                  le rejet de votre événement et pourra conduire à la suspension de votre compte.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">📝 Publier un Événement</h1>
            <p className="text-indigo-100">
              Remplissez le formulaire pour soumettre votre événement. 
              Notre équipe l'examinera sous 24-48 heures.
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Étape {currentStep} sur {totalSteps}</span>
                <span className="text-gray-500">{Math.round(progress)}% complété</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Steps indicator */}
            <div className="flex items-center justify-between mt-4 text-xs text-gray-500 overflow-x-auto">
              {['Organisateur', 'Détails', 'Date', 'Lieu', 'Billetterie', 'Médias', 'Partenaires', 'Promotion', 'Validation'].map((step, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center gap-1 ${
                    index + 1 === currentStep ? 'text-indigo-600 font-medium' :
                    index + 1 < currentStep ? 'text-green-600' :
                    'text-gray-400'
                  }`}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center border-2
                    ${index + 1 === currentStep ? 'border-indigo-600 bg-indigo-50' :
                      index + 1 < currentStep ? 'border-green-600 bg-green-50' :
                      'border-gray-300 bg-white'
                    }
                  `}>
                    {index + 1 < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className="hidden md:block whitespace-nowrap">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form Step */}
        <div className="mb-6">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>

              <div className="text-center text-sm text-gray-500">
                Étape {currentStep} / {totalSteps}
              </div>

              {currentStep < totalSteps ? (
                <Button onClick={nextStep} disabled={isSubmitting}>
                  Suivant
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.acceptTerms || !formData.confirmAccuracy}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Soumettre l'Événement
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Alert className="mt-6">
          <Info className="w-4 h-4" />
          <AlertDescription>
            <strong>Besoin d'aide ?</strong> Contactez notre équipe à{' '}
            <a href="mailto:support@feeti.com" className="text-indigo-600 hover:underline">
              support@feeti.com
            </a>
            {' '}ou appelez le{' '}
            <a href="tel:+242981-23-19" className="text-indigo-600 hover:underline">
              +242 981-23-19
            </a>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
