import { useState, useEffect } from 'react';
import TicketAPI from '../../services/api/TicketAPI';
import api from '../../routes/axiosConfig';
import DeliveryAPI, { type DeliveryZone } from '../../services/api/DeliveryAPI';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import {
  CreditCard,
  Shield,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Lock,
  CheckCircle,
  QrCode,
  Download,
  Mail,
  Ticket,
  Plus,
  Minus,
  AlertCircle,
  Check,
  Star,
  Crown,
  Truck,
  Smartphone,
  Wallet
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { QRCodeGenerator } from '../QRCodeGenerator';
import { TicketPDFGenerator } from '../TicketPDFGenerator';
import { toast } from 'sonner@2.0.3';
import { loyaltyApi, type PointsPaymentSimulation } from '../../api/loyalty';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  price: number;
  vipPrice?: number;
  currency: string;
  category: string;
  attendees: number;
  maxAttendees: number;
  isLive: boolean;
  organizer: string;
  organizerName?: string;
  countryCode?: string;
}

interface TicketCategory {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  maxQuantity: number;
  remainingStock: number;
  color: string;
  icon: React.ReactNode;
  popular?: boolean;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface Ticket {
  id: string;
  orderId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventImage: string;
  category: string;
  price: number;
  currency: string;
  holderName: string;
  holderEmail: string;
  qrCode: string;
  status: 'valid' | 'used' | 'expired';
  purchaseDate: string;
  timestamp: number;
  signature: string;
}

interface TicketPurchasePageProps {
  event: Event;
  onBack: () => void;
  onPurchaseComplete: (tickets: Ticket[]) => void;
  currentUser: any;
  headerCountryCode: string | null; // null = "Tous les pays"
}

export function TicketPurchasePage({ event, onBack, onPurchaseComplete, currentUser, headerCountryCode }: TicketPurchasePageProps) {
  // Pays effectif pour la livraison : header country si défini, sinon pays de l'événement
  const deliveryCountryCode = headerCountryCode ?? event.countryCode ?? '';
  // États principaux
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [generatedTickets, setGeneratedTickets] = useState<Ticket[]>([]);

  // Catégories basées sur les prix réels de l'organisateur
  const ticketCategories: TicketCategory[] = [
    {
      id: 'standard',
      name: 'Standard',
      price: event.price,
      description: 'Accès général à l\'événement',
      features: ['Accès à l\'événement', 'Vestiaire gratuit', 'Support client'],
      maxQuantity: 4,
      remainingStock: event.maxAttendees - event.attendees,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <Ticket className="w-5 h-5" />
    },
    ...(event.vipPrice ? [{
      id: 'vip',
      name: 'VIP',
      price: event.vipPrice,
      description: 'Expérience premium avec avantages exclusifs',
      features: [
        'Accès VIP avec places réservées',
        'Meet & Greet avec les artistes',
        'Boissons et collations incluses',
        'Parking VIP gratuit',
        'Cadeaux exclusifs'
      ],
      maxQuantity: 2,
      remainingStock: Math.floor((event.maxAttendees - event.attendees) * 0.1),
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-400',
      icon: <Crown className="w-5 h-5" />,
      popular: true
    }] : []),
  ];

  // Auto-fill depuis le compte connecté (name = "Prénom Nom")
  const nameParts = (currentUser?.name || '').trim().split(' ');
  const defaultFirstName = nameParts[0] || '';
  const defaultLastName = nameParts.slice(1).join(' ') || '';
  const defaultFullName = currentUser?.name || '';

  // États pour les sélections
  const [selectedTickets, setSelectedTickets] = useState<{[key: string]: number}>({});
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: defaultFirstName,
    lastName: defaultLastName,
    email: currentUser?.email || '',
    phone: currentUser?.phone || ''
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: defaultFullName
  });
  // Méthode de paiement sélectionnée par l'utilisateur
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money' | 'paystack'>('card');
  const [mobilePhone, setMobilePhone] = useState(currentUser?.phone || '');
  const [mobileOperator, setMobileOperator] = useState<'mtn' | 'orange' | 'airtel'>('mtn');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  // Paiement partiel avec points FEETI NA FEETI
  const [pointsSimulation, setPointsSimulation] = useState<PointsPaymentSimulation | null>(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [pointsApplied, setPointsApplied] = useState(false);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [loadingSimulation, setLoadingSimulation] = useState(false);

  // Livraison
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'physical'>('email');
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [deliveryRecipientName, setDeliveryRecipientName] = useState(defaultFullName);
  const [deliveryRecipientPhone, setDeliveryRecipientPhone] = useState(currentUser?.phone || '');
  const [deliveryInfo, setDeliveryInfo] = useState('');

  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);
  const deliveryFee = deliveryMethod === 'physical' && selectedZone ? selectedZone.fee : 0;

  // Chargement des zones quand on passe en livraison physique ou que le pays change
  useEffect(() => {
    if (deliveryMethod === 'physical' && deliveryCountryCode) {
      setSelectedZoneId('');
      DeliveryAPI.getZonesByCountry(deliveryCountryCode).then(setDeliveryZones).catch(() => {});
    }
  }, [deliveryMethod, deliveryCountryCode]);


  // Utilitaires
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'FCFA') {
      return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Calculs des totaux
  const getTotalQuantity = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const getSubtotal = () => {
    return Object.entries(selectedTickets).reduce((sum, [categoryId, qty]) => {
      const category = ticketCategories.find(c => c.id === categoryId);
      return sum + (category ? category.price * qty : 0);
    }, 0);
  };

  const total = getSubtotal() + deliveryFee;

  // Gestionnaires d'événements
  const handleTicketQuantityChange = (categoryId: string, change: number) => {
    const category = ticketCategories.find(c => c.id === categoryId);
    if (!category) return;

    const currentQty = selectedTickets[categoryId] || 0;
    const newQty = Math.max(0, Math.min(category.maxQuantity, currentQty + change));
    
    // Vérification de la limite globale de 4 billets
    const otherTicketsQty = Object.entries(selectedTickets)
      .filter(([id]) => id !== categoryId)
      .reduce((sum, [, qty]) => sum + qty, 0);
    
    if (otherTicketsQty + newQty > 4) {
      toast.error('Maximum 4 billets par commande');
      return;
    }

    setSelectedTickets(prev => ({
      ...prev,
      [categoryId]: newQty
    }));
  };

  const handleStepSubmit = async () => {
    if (currentStep === 1) {
      if (getTotalQuantity() === 0) {
        toast.error('Veuillez sélectionner au moins un billet');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
      if (deliveryMethod === 'physical') {
        if (!selectedZoneId) { toast.error('Veuillez sélectionner votre quartier / zone'); return; }
        if (!deliveryRecipientName || !deliveryRecipientPhone) { toast.error('Nom et téléphone du destinataire obligatoires'); return; }
      }
      setCurrentStep(3);
      // Charger la simulation de paiement partiel
      if (currentUser && total > 0) {
        setLoadingSimulation(true);
        loyaltyApi.simulatePointsPayment(total).then(sim => {
          setPointsSimulation(sim);
          setPointsToUse(sim.pointsUsable); // propose le max par défaut
        }).catch(() => {}).finally(() => setLoadingSimulation(false));
      }
    } else if (currentStep === 3) {
      if (!acceptTerms) {
        toast.error('Veuillez accepter les conditions générales');
        return;
      }
      await processPayment();
    }
  };

  const processPayment = async () => {
    setIsProcessing(true);

    try {
      // Construire les items à partir des billets sélectionnés
      const items = Object.entries(selectedTickets)
        .filter(([, qty]) => qty > 0)
        .map(([categoryId, quantity]) => {
          const cat = ticketCategories.find(c => c.id === categoryId)!;
          return { category: cat.name, quantity, price: cat.price };
        });

      // Obtenir un paymentId selon la méthode choisie (simulation)
      let paymentId = `sim_${Date.now()}`;
      const provider: 'stripe' | 'mobile_money' | 'paystack' =
        paymentMethod === 'card' ? 'stripe' : paymentMethod;

      if (paymentMethod === 'mobile_money' && mobilePhone) {
        try {
          const mmRes = await api.post('/api/payments/mobile-money/initialize', {
            phone: mobilePhone,
            provider: mobileOperator,
            amount: total,
            currency: event.currency,
          });
          paymentId = mmRes.data?.data?.transaction_id || paymentId;
        } catch { /* simulation : continue même si l'appel échoue */ }
      } else if (paymentMethod === 'paystack') {
        try {
          const psRes = await api.post('/api/payments/paystack/initialize', {
            email: customerInfo.email,
            amount: total,
            currency: event.currency,
          });
          paymentId = psRes.data?.data?.reference || paymentId;
        } catch { /* simulation : continue */ }
      }

      // Appel au backend : confirme paiement + crée billets + envoie email
      const result = await TicketAPI.confirmAndPurchase({
        eventId: event.id,
        holderName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        holderEmail: customerInfo.email,
        holderPhone: customerInfo.phone || undefined,
        items,
        delivery: {
          method: deliveryMethod,
          ...(deliveryMethod === 'physical' && {
            zoneId: selectedZoneId,
            recipientName: deliveryRecipientName,
            recipientPhone: deliveryRecipientPhone,
            additionalInfo: deliveryInfo || undefined,
          }),
        },
        paymentProvider: provider,
        paymentId,
      });

      // Mapper les billets backend vers le format local attendu par TicketPDFGenerator
      const mappedTickets: Ticket[] = result.tickets.map(t => ({
        id: t.id,
        orderId: t.orderId,
        eventId: t.eventId,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventLocation: event.location,
        eventImage: event.image,
        category: t.category,
        price: t.price,
        currency: t.currency,
        holderName: t.holderName,
        holderEmail: t.holderEmail,
        qrCode: t.qrDataUrl || t.qrData, // Utiliser le PNG généré si disponible
        status: 'valid',
        purchaseDate: t.createdAt || new Date().toISOString(),
        timestamp: Date.now(),
        signature: '',
      }));

      setGeneratedTickets(mappedTickets);
      setPurchaseComplete(true);
      setCurrentStep(4);

      // Déduire les points Feeti Na Feeti si appliqués
      if (pointsApplied && pointsToUse > 0 && mappedTickets.length > 0) {
        loyaltyApi.applyPointsPayment(pointsToUse, mappedTickets[0].id, total).catch(() => {});
      }

      toast.success(deliveryMethod === 'physical'
        ? 'Paiement réussi ! Votre billet vous sera livré physiquement.'
        : 'Paiement réussi ! Vos billets vous ont été envoyés par email.');
      onPurchaseComplete(mappedTickets);

    } catch (error: any) {
      console.error('Erreur lors du paiement:', error);
      const msg = error?.response?.data?.message || 'Erreur technique lors du paiement.';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTicketPDF = (ticket: Ticket) => {
    // Simulation du téléchargement PDF
    toast.success(`Ticket ${ticket.category} téléchargé !`);
  };

  const downloadAllTickets = () => {
    toast.success('Tous les tickets téléchargés !');
  };

  const stepTitles = [
    'Sélection des billets',
    'Informations personnelles', 
    'Paiement',
    'Confirmation'
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Choisissez vos billets
              </h2>
              <p className="text-gray-600">
                Sélectionnez le type et la quantité de billets désirés (max. 4 billets par commande)
              </p>
            </div>

            <div className="grid gap-6">
              {ticketCategories.map((category) => (
                <Card key={category.id} className={`relative overflow-hidden border-2 transition-all hover:shadow-lg ${
                  (selectedTickets[category.id] || 0) > 0 ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                }`}>
                  {category.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 text-xs font-bold">
                      POPULAIRE
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-2 rounded-lg ${category.color}`}>
                            {category.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                            <p className="text-2xl font-bold text-indigo-600">
                              {formatPrice(category.price, event.currency)}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{category.description}</p>
                        
                        <div className="space-y-2">
                          {category.features.map((feature, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-700">
                              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Stock restant: <span className="font-medium text-gray-700">{category.remainingStock}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Max. {category.maxQuantity} par commande
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex flex-col items-end space-y-4">
                        <div className="flex items-center space-x-3 bg-white rounded-full border-2 border-gray-200 p-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 rounded-full p-0"
                            onClick={() => handleTicketQuantityChange(category.id, -1)}
                            disabled={(selectedTickets[category.id] || 0) === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-bold">
                            {selectedTickets[category.id] || 0}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 rounded-full p-0"
                            onClick={() => handleTicketQuantityChange(category.id, 1)}
                            disabled={(selectedTickets[category.id] || 0) >= category.maxQuantity || getTotalQuantity() >= 4}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {(selectedTickets[category.id] || 0) > 0 && (
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Sous-total</p>
                            <p className="font-bold text-lg text-indigo-600">
                              {formatPrice(category.price * (selectedTickets[category.id] || 0), event.currency)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {getTotalQuantity() > 0 && (
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-indigo-900">
                        {getTotalQuantity()} billet{getTotalQuantity() > 1 ? 's' : ''} sélectionné{getTotalQuantity() > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-indigo-700">
                        Limite: 4 billets maximum par commande
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">
                        {formatPrice(getSubtotal(), event.currency)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Vos informations
              </h2>
              <p className="text-gray-600">
                Ces informations apparaîtront sur vos billets
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Informations personnelles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={customerInfo.firstName}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={customerInfo.lastName}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="votre@email.com"
                  />
                  <p className="text-xs text-gray-500">Vos billets seront envoyés à cette adresse</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    placeholder="+242 6 12 34 56 78"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Livraison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>Mode de réception</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('email')}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${deliveryMethod === 'email' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Mail className="w-6 h-6 mb-2 text-indigo-600" />
                    <span className="font-medium text-sm">Par email</span>
                    <span className="text-xs text-gray-500 mt-1">Gratuit · Instantané</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('physical')}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${deliveryMethod === 'physical' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Truck className="w-6 h-6 mb-2 text-indigo-600" />
                    <span className="font-medium text-sm">Livraison physique</span>
                    <span className="text-xs text-gray-500 mt-1">Selon la zone</span>
                  </button>
                </div>

                {deliveryMethod === 'physical' && (
                  <div className="space-y-4 pt-2">
                    {!deliveryCountryCode && (
                      <p className="text-sm text-amber-600">Impossible de déterminer le pays de livraison.</p>
                    )}
                    {deliveryCountryCode && deliveryZones.length === 0 && (
                      <p className="text-sm text-amber-600">Aucune zone de livraison disponible pour ce pays.</p>
                    )}

                    {/* Destinataire */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nom du destinataire *</Label>
                        <Input value={deliveryRecipientName} onChange={e => setDeliveryRecipientName(e.target.value)} placeholder="Nom complet" />
                      </div>
                      <div className="space-y-2">
                        <Label>Téléphone du destinataire *</Label>
                        <Input value={deliveryRecipientPhone} onChange={e => setDeliveryRecipientPhone(e.target.value)} placeholder="+242 6 ..." />
                      </div>
                    </div>

                    {/* Rue / Quartier = zones admin */}
                    {deliveryZones.length > 0 && (
                      <div className="space-y-2">
                        <Label>Rue / Quartier *</Label>
                        <Select value={selectedZoneId} onValueChange={setSelectedZoneId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez votre quartier / zone" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {deliveryZones.map(z => (
                              <SelectItem key={z.id} value={z.id}>
                                {z.name}
                                {z.description ? ` — ${z.description}` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedZone && (
                          <p className="text-xs text-indigo-600 font-medium">
                            Frais de livraison : {formatPrice(selectedZone.fee, selectedZone.currency)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Infos complémentaires */}
                    <div className="space-y-2">
                      <Label>Informations complémentaires</Label>
                      <Input value={deliveryInfo} onChange={e => setDeliveryInfo(e.target.value)} placeholder="Bâtiment, étage, repère landmark..." />
                    </div>

                    {selectedZone && (
                      <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg text-sm">
                        <span className="text-indigo-700 font-medium">Frais de livraison</span>
                        <span className="font-bold text-indigo-600">{formatPrice(selectedZone.fee, selectedZone.currency)}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Paiement sécurisé
              </h2>
              <p className="text-gray-600">
                Finalisez votre commande avec un paiement 100% sécurisé
              </p>
            </div>

            {/* ─── Feeti Na Feeti — Paiement partiel avec points ─── */}
            {currentUser && (pointsSimulation || loadingSimulation) && (
              <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-yellow-800">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span>Feeti Na Feeti — Utiliser vos points</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingSimulation ? (
                    <div className="flex items-center space-x-2 text-yellow-700">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600" />
                      <span className="text-sm">Chargement de vos points...</span>
                    </div>
                  ) : pointsSimulation && pointsSimulation.pointsUsable > 0 ? (
                    pointsApplied ? (
                      <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                        <div className="flex items-center space-x-2 text-green-800">
                          <CheckCircle className="w-5 h-5" />
                          <div>
                            <p className="font-semibold">{(pointsDiscount).toLocaleString('fr-FR')} FCFA économisés</p>
                            <p className="text-sm">{pointsToUse} points appliqués (1 pt = 20 FCFA)</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-700 hover:text-red-600"
                          onClick={() => { setPointsApplied(false); setPointsDiscount(0); setPointsToUse(pointsSimulation.pointsUsable); }}
                        >
                          Annuler
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <p className="text-yellow-700">Points disponibles</p>
                            <p className="font-bold text-yellow-900 text-base">{pointsSimulation.pointsAvailable.toLocaleString('fr-FR')} pts</p>
                          </div>
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <p className="text-orange-700">Réduction max (50%)</p>
                            <p className="font-bold text-orange-900 text-base">{(pointsSimulation.maxPointsUsable * 20).toLocaleString('fr-FR')} FCFA</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-yellow-800 text-sm">Points à utiliser <span className="text-yellow-600">(1 pt = 20 FCFA)</span></Label>
                          <div className="flex items-center space-x-3">
                            <Input
                              type="number"
                              min={0}
                              max={pointsSimulation.maxPointsUsable}
                              value={pointsToUse}
                              onChange={e => setPointsToUse(Math.min(pointsSimulation.maxPointsUsable, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-32 bg-white"
                            />
                            <span className="text-sm text-yellow-800">
                              = <strong className="text-orange-700">{(pointsToUse * 20).toLocaleString('fr-FR')} FCFA</strong> de réduction
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            if (pointsToUse > 0) {
                              setPointsDiscount(pointsToUse * 20);
                              setPointsApplied(true);
                              toast.success(`${pointsToUse} pts appliqués — ${(pointsToUse * 20).toLocaleString('fr-FR')} FCFA de réduction !`);
                            }
                          }}
                          disabled={pointsToUse === 0}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white w-full"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Appliquer mes points
                        </Button>
                      </>
                    )
                  ) : (
                    <p className="text-sm text-yellow-700">
                      Vous n'avez pas assez de points pour réduire cette commande.
                      {pointsSimulation && ` (${pointsSimulation.pointsAvailable} pts disponibles)`}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Mode de paiement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Sélection de la méthode */}
                <div className="grid gap-3">
                  {/* Carte bancaire */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                      paymentMethod === 'card'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      paymentMethod === 'card' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Carte bancaire</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard</p>
                    </div>
                    {paymentMethod === 'card' && <CheckCircle className="w-5 h-5 text-indigo-500 ml-auto" />}
                  </button>

                  {/* Mobile Money */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mobile_money')}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                      paymentMethod === 'mobile_money'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      paymentMethod === 'mobile_money' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Mobile Money</p>
                      <p className="text-sm text-gray-500">MTN, Orange, Airtel</p>
                    </div>
                    {paymentMethod === 'mobile_money' && <CheckCircle className="w-5 h-5 text-indigo-500 ml-auto" />}
                  </button>

                  {/* Paystack */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paystack')}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                      paymentMethod === 'paystack'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      paymentMethod === 'paystack' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Paystack</p>
                      <p className="text-sm text-gray-500">Paiement sécurisé Paystack</p>
                    </div>
                    {paymentMethod === 'paystack' && <CheckCircle className="w-5 h-5 text-indigo-500 ml-auto" />}
                  </button>
                </div>

                {/* Détails Mobile Money */}
                {paymentMethod === 'mobile_money' && (
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="space-y-2">
                      <Label>Opérateur</Label>
                      <div className="flex gap-2">
                        {(['mtn', 'orange', 'airtel'] as const).map(op => (
                          <button
                            key={op}
                            type="button"
                            onClick={() => setMobileOperator(op)}
                            className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                              mobileOperator === op
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 text-gray-600'
                            }`}
                          >
                            {op === 'mtn' ? 'MTN' : op === 'orange' ? 'Orange' : 'Airtel'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobilePhone">Numéro de téléphone *</Label>
                      <Input
                        id="mobilePhone"
                        type="tel"
                        placeholder="06 XXX XX XX XX"
                        value={mobilePhone}
                        onChange={(e) => setMobilePhone(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Détails Carte */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Paiement sécurisé — vos données sont chiffrées
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Numéro de carte</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiration</Label>
                        <Input id="expiryDate" placeholder="MM/YY" value={paymentInfo.expiryDate}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryDate: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms}
                    onCheckedChange={setAcceptTerms}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                    J'accepte les <a href="#" className="text-indigo-600 hover:underline">conditions générales de vente</a> et la <a href="#" className="text-indigo-600 hover:underline">politique de confidentialité</a> *
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={newsletter}
                    onCheckedChange={setNewsletter}
                  />
                  <Label htmlFor="newsletter" className="text-sm leading-relaxed">
                    Je souhaite recevoir les dernières actualités et offres de Feeti par email
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Commande confirmée !
              </h2>
              <p className="text-gray-600">
                Vos billets ont été générés avec succès
                {deliveryMethod === 'email' ? ' et envoyés par email' : ' — livraison physique en cours de traitement'}
              </p>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                {deliveryMethod === 'email' ? (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <Mail className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Email de confirmation envoyé</p>
                        <p className="text-sm text-green-700">{customerInfo.email}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Votre email contient :</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Récapitulatif de votre commande</li>
                        <li>• Billets électroniques avec QR codes</li>
                        <li>• Instructions pour l'entrée à l'événement</li>
                        <li>• Informations pratiques</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <Truck className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Livraison physique confirmée</p>
                        <p className="text-sm text-green-700">Destinataire : {deliveryRecipientName}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Votre commande inclut :</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Livraison dans la zone : {selectedZone?.name}</li>
                        <li>• Frais de livraison : {deliveryFee > 0 ? formatPrice(deliveryFee, selectedZone?.currency || 'FCFA') : 'Offerts'}</li>
                        <li>• Téléphone de contact : {deliveryRecipientPhone}</li>
                        {deliveryInfo && <li>• Note : {deliveryInfo}</li>}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Vos billets générés</span>
                  <Button
                    onClick={downloadAllTickets}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tout télécharger</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {generatedTickets.map((ticket, index) => (
                  <div key={ticket.id} className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Billet {ticket.category} #{index + 1}</h4>
                        <p className="text-sm text-gray-600">{ticket.holderName}</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✓ Valide
                      </Badge>
                    </div>
                    
                    {/* Générateur PDF intégré */}
                    <TicketPDFGenerator 
                      ticket={ticket} 
                      onDownload={() => downloadTicketPDF(ticket)}
                    />
                    
                    {index < generatedTickets.length - 1 && (
                      <div className="border-t border-gray-200 pt-4"></div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h4 className="font-medium text-blue-900 mb-3">Informations importantes</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Présentez vos QR codes (sur smartphone ou imprimés) à l'entrée</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Arrivez 30 minutes avant le début de l'événement</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Une pièce d'identité peut être demandée à l'entrée</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Les billets ne sont ni échangeables ni remboursables</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="flex items-center space-x-2"
              disabled={isProcessing}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Button>
            
            {/* Progress Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="flex items-center justify-between mb-2">
                {stepTitles.map((title, index) => (
                  <div key={index} className={`text-xs font-medium ${
                    index + 1 <= currentStep ? 'text-indigo-600' : 'text-gray-400'
                  }`}>
                    {index + 1}. {title}
                  </div>
                ))}
              </div>
              <Progress value={(currentStep / 4) * 100} className="h-2" />
            </div>
            
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex justify-between pt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1 || isProcessing}
                >
                  Précédent
                </Button>
                
                <Button
                  onClick={handleStepSubmit}
                  disabled={isProcessing}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Traitement...</span>
                    </div>
                  ) : currentStep === 3 ? (
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Payer {formatPrice(Math.max(0, total - pointsDiscount), event.currency)}</span>
                    </div>
                  ) : (
                    'Continuer'
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              {/* Event Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-3">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {event.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {event.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(event.date)} à {event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  {getTotalQuantity() > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        {Object.entries(selectedTickets)
                          .filter(([, qty]) => qty > 0)
                          .map(([categoryId, qty]) => {
                            const category = ticketCategories.find(c => c.id === categoryId);
                            if (!category) return null;
                            return (
                              <div key={categoryId} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {qty} × {category.name}
                                </span>
                                <span className="font-medium">
                                  {formatPrice(category.price * qty, event.currency)}
                                </span>
                              </div>
                            );
                          })}
                        {deliveryFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Livraison ({selectedZone?.name})</span>
                            <span className="font-medium">{formatPrice(deliveryFee, selectedZone?.currency || event.currency)}</span>
                          </div>
                        )}
                        {pointsApplied && pointsDiscount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span className="flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>Points Feeti Na Feeti</span>
                            </span>
                            <span className="font-medium">−{formatPrice(pointsDiscount, event.currency)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span className="text-indigo-600">
                            {formatPrice(Math.max(0, total - pointsDiscount), event.currency)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Organizer Info */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Organisateur</h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 font-semibold">
                        {(event.organizerName || event.organizer)[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{event.organizerName || event.organizer}</p>
                      <p className="text-sm text-gray-500">Organisateur vérifié</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Paiement sécurisé SSL</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Billets électroniques instantanés</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <QrCode className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">QR codes sécurisés</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}