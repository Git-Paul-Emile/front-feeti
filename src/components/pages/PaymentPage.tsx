import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { 
  CreditCard, 
  Shield, 
  ArrowLeft, 
  Calendar,
  MapPin,
  Users,
  Lock,
  CheckCircle,
  MapPinIcon,
  Tv
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

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
  organizer: string;
}

interface PaymentPageProps {
  event: Event;
  ticketQuantity: number;
  onBack: () => void;
  onPaymentSuccess: (paymentData: any) => void;
  currentUser: any;
}

export function PaymentPage({ event, ticketQuantity, onBack, onPaymentSuccess, currentUser }: PaymentPageProps) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [ticketType, setTicketType] = useState<'salle' | 'streaming'>('salle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: currentUser?.email || '',
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    phone: currentUser?.phone || '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    acceptTerms: false,
    newsletter: false
  });

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

  // Prix différents selon le type de billet
  const getTicketPrice = () => {
    if (ticketType === 'streaming') {
      return event.price * 0.7; // 30% de réduction pour le streaming
    }
    return event.price;
  };

  const subtotal = getTicketPrice() * ticketQuantity;
  const serviceFee = subtotal * 0.05;
  const total = subtotal + serviceFee;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      alert('Veuillez accepter les conditions générales');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const paymentData = {
        eventId: event.id,
        quantity: ticketQuantity,
        total: total,
        paymentMethod: paymentMethod,
        transactionId: `TXN_${Date.now()}`,
        ticketType: ticketType,
        tickets: [...Array(ticketQuantity)].map((_, i) => ({
          id: `TICKET_${Date.now()}_${i}`,
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          eventLocation: ticketType === 'streaming' ? 'Live Streaming' : event.location,
          price: getTicketPrice(),
          currency: event.currency,
          ticketType: ticketType,
          holderName: `${formData.firstName} ${formData.lastName}`,
          holderEmail: formData.email,
          qrCode: `https://feeti.com/verify/${event.id}/${Date.now()}_${i}`
        }))
      };
      
      setIsProcessing(false);
      onPaymentSuccess(paymentData);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Finaliser votre commande
              </h1>
              <p className="text-gray-600">
                Complétez vos informations pour réserver vos billets
              </p>
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              {/* Ticket Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Tv className="w-5 h-5" />
                    <span>Type de billet</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={ticketType} onValueChange={setTicketType}>
                    <div className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                      ticketType === 'salle' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="salle" id="salle" />
                        <Label htmlFor="salle" className="flex items-center space-x-2 cursor-pointer">
                          <MapPinIcon className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-medium">Billet en salle</p>
                            <p className="text-sm text-gray-600">Accès physique à l'événement</p>
                          </div>
                        </Label>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatPrice(event.price, event.currency)}</p>
                        <p className="text-sm text-gray-600">Prix standard</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                      ticketType === 'streaming' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="streaming" id="streaming" />
                        <Label htmlFor="streaming" className="flex items-center space-x-2 cursor-pointer">
                          <Tv className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-medium">Billet live streaming</p>
                            <p className="text-sm text-gray-600">Accès en direct depuis chez vous</p>
                          </div>
                        </Label>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatPrice(getTicketPrice(), event.currency)}</p>
                        <p className="text-sm text-green-600">-30% par rapport au prix salle</p>
                      </div>
                    </div>
                  </RadioGroup>
                  
                  {ticketType === 'streaming' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Tv className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900 mb-1">Streaming live de qualité HD</p>
                          <ul className="text-blue-700 space-y-1">
                            <li>• Diffusion en temps réel</li>
                            <li>• Chat interactif avec les autres spectateurs</li>
                            <li>• Rediffusion disponible 48h après l'événement</li>
                            <li>• Compatible tous appareils (PC, mobile, TV)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {ticketType === 'salle' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <MapPinIcon className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-green-900 mb-1">Expérience complète sur site</p>
                          <ul className="text-green-700 space-y-1">
                            <li>• Accès physique à la salle</li>
                            <li>• Ambiance et interaction directe</li>
                            <li>• Accès aux espaces VIP (selon billet)</li>
                            <li>• Photos souvenirs avec les artistes</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Informations de contact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Mode de paiement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center space-x-2 cursor-pointer">
                        <CreditCard className="w-4 h-4" />
                        <span>Carte bancaire</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg opacity-50">
                      <RadioGroupItem value="paypal" id="paypal" disabled />
                      <Label htmlFor="paypal" className="flex items-center space-x-2">
                        <span>PayPal (bientôt disponible)</span>
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Numéro de carte *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Date d'expiration *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardholderName">Nom du porteur *</Label>
                        <Input
                          id="cardholderName"
                          placeholder="Nom sur la carte"
                          value={formData.cardholderName}
                          onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Terms and Newsletter */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => handleInputChange('acceptTerms', !!checked)}
                    />
                    <Label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                      J'accepte les <a href="#" className="text-indigo-600 hover:underline">conditions générales de vente</a> et la <a href="#" className="text-indigo-600 hover:underline">politique de confidentialité</a> *
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={(checked) => handleInputChange('newsletter', !!checked)}
                    />
                    <Label htmlFor="newsletter" className="text-sm leading-relaxed">
                      Je souhaite recevoir les dernières actualités et offres de Feeti par email
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                size="lg"
                disabled={isProcessing || !formData.acceptTerms}
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Traitement en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Payer {formatPrice(total, event.currency)}</span>
                  </div>
                )}
              </Button>

              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span>Paiement sécurisé SSL</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Remboursement garanti</span>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="sticky top-32">
              {/* Event Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Récapitulatif de commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-4">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {event.category}
                        </Badge>
                        <Badge variant={ticketType === 'streaming' ? 'default' : 'outline'} className="text-xs">
                          {ticketType === 'streaming' ? 'Live Streaming' : 'En Salle'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(event.date)} à {event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{ticketType === 'streaming' ? 'Live Streaming' : event.location}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {ticketQuantity} × {formatPrice(getTicketPrice(), event.currency)}
                      </span>
                      <span className="font-medium">
                        {formatPrice(subtotal, event.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Frais de service</span>
                      <span className="font-medium">
                        {formatPrice(serviceFee, event.currency)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-indigo-600">
                        {formatPrice(total, event.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Après votre achat :
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {ticketType === 'streaming' ? (
                        <>
                          <li>• Lien de streaming envoyé par email</li>
                          <li>• Accès disponible 30min avant le début</li>
                          <li>• Rediffusion accessible 48h</li>
                          <li>• Support technique dédié</li>
                        </>
                      ) : (
                        <>
                          <li>• Billets envoyés par email instantanément</li>
                          <li>• QR code pour l'entrée à l'événement</li>
                          <li>• Rappel automatique 24h avant</li>
                          <li>• Support client 7j/7</li>
                        </>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Paiement 100% sécurisé</p>
                      <p>Vos données sont protégées par chiffrement SSL</p>
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