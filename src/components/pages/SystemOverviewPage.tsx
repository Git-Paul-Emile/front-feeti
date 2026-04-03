import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  ShoppingCart, 
  CreditCard, 
  Mail, 
  QrCode, 
  Shield, 
  CheckCircle,
  Users,
  Calendar,
  MapPin,
  Download,
  Smartphone,
  Server,
  Database,
  Lock,
  ArrowRight,
  Zap,
  Globe,
  Eye
} from 'lucide-react';

interface SystemOverviewPageProps {
  onBack: () => void;
}

export function SystemOverviewPage({ onBack }: SystemOverviewPageProps) {
  const [activeFlow, setActiveFlow] = useState<string | null>(null);

  const systemFeatures = [
    {
      id: 'purchase',
      title: 'Achat de billets',
      description: 'Système complet d\'achat avec sélection, paiement et génération de tickets',
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'bg-blue-500',
      steps: [
        'Sélection des billets (Standard, Premium, VIP)',
        'Informations client (nom, email, téléphone)',
        'Paiement sécurisé (Stripe/Paystack)',
        'Génération automatique des tickets avec QR codes'
      ]
    },
    {
      id: 'verification',
      title: 'Vérification de billets',
      description: 'Système de contrôle d\'accès avec validation de QR codes sécurisés',
      icon: <QrCode className="w-6 h-6" />,
      color: 'bg-green-500',
      steps: [
        'Scan du QR code à l\'entrée',
        'Vérification de la signature HMAC',
        'Contrôle du statut du billet',
        'Marquage automatique comme "utilisé"'
      ]
    },
    {
      id: 'notification',
      title: 'Notifications automatiques',
      description: 'Envoi d\'emails et SMS de confirmation avec billets PDF',
      icon: <Mail className="w-6 h-6" />,
      color: 'bg-purple-500',
      steps: [
        'Email de confirmation immédiat',
        'Billets PDF en pièce jointe',  
        'SMS avec lien de téléchargement',
        'Rappels automatiques avant l\'événement'
      ]
    },
    {
      id: 'security',
      title: 'Sécurité avancée',
      description: 'Protection contre la fraude avec signatures cryptographiques',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-red-500',
      steps: [
        'Signatures HMAC uniques par ticket',
        'QR codes impossibles à dupliquer',
        'Vérification en temps réel',
        'Logs d\'audit complets'
      ]
    }
  ];

  const technicalSpecs = [
    {
      category: 'Frontend',
      icon: <Globe className="w-5 h-5" />,
      technologies: [
        { name: 'React + Next.js', description: 'Interface utilisateur moderne et responsive' },
        { name: 'Tailwind CSS', description: 'Design system cohérent et optimisé' },
        { name: 'ShadCN UI', description: 'Composants accessibles et réutilisables' },
        { name: 'TypeScript', description: 'Typage statique pour plus de robustesse' }
      ]
    },
    {
      category: 'Paiement',
      icon: <CreditCard className="w-5 h-5" />,
      technologies: [
        { name: 'Stripe Payment Intents', description: 'Paiements sécurisés internationaux' },
        { name: 'Paystack', description: 'Optimisé pour les paiements africains' },
        { name: 'Apple Pay / Google Pay', description: 'Paiements mobiles simplifiés' },
        { name: 'Webhooks', description: 'Validation automatique des paiements' }
      ]
    },
    {
      category: 'Backend',
      icon: <Server className="w-5 h-5" />,
      technologies: [
        { name: 'Node.js + Express', description: 'API REST performante et scalable' },
        { name: 'PostgreSQL', description: 'Base de données relationnelle robuste' },
        { name: 'Redis', description: 'Cache haute performance' },
        { name: 'JWT + HMAC', description: 'Authentification et signatures sécurisées' }
      ]
    },
    {
      category: 'Notifications',
      icon: <Mail className="w-5 h-5" />,
      technologies: [
        { name: 'SendGrid', description: 'Emails transactionnels fiables' },
        { name: 'Twilio SMS', description: 'Notifications SMS instantanées' },
        { name: 'PDFKit', description: 'Génération de billets PDF' },
        { name: 'QR Code Generator', description: 'QR codes sécurisés et optimisés' }
      ]
    }
  ];

  const purchaseFlow = [
    { step: 1, title: 'Sélection', icon: <ShoppingCart className="w-4 h-4" />, description: 'Choix des billets et quantités' },
    { step: 2, title: 'Informations', icon: <Users className="w-4 h-4" />, description: 'Saisie des données client' },
    { step: 3, title: 'Paiement', icon: <CreditCard className="w-4 h-4" />, description: 'Traitement sécurisé' },
    { step: 4, title: 'Confirmation', icon: <CheckCircle className="w-4 h-4" />, description: 'Billets générés et envoyés' }
  ];

  const verificationFlow = [
    { step: 1, title: 'Scan QR', icon: <QrCode className="w-4 h-4" />, description: 'Lecture du QR code' },
    { step: 2, title: 'Validation', icon: <Shield className="w-4 h-4" />, description: 'Vérification signature HMAC' },
    { step: 3, title: 'Contrôle', icon: <Database className="w-4 h-4" />, description: 'Vérification base de données' },
    { step: 4, title: 'Accès', icon: <CheckCircle className="w-4 h-4" />, description: 'Autorisation d\'entrée' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Système de Billetterie Feeti
              </h1>
              <p className="text-gray-600 mt-2">
                Architecture complète d'achat et vérification de billets électroniques
              </p>
            </div>
            <Button onClick={onBack} variant="outline">
              Retour
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mx-auto">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="flows">Flux processus</TabsTrigger>
            <TabsTrigger value="tech">Technologies</TabsTrigger>
            <TabsTrigger value="api">API & Sécurité</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemFeatures.map((feature) => (
                <Card 
                  key={feature.id}
                  className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    activeFlow === feature.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => setActiveFlow(activeFlow === feature.id ? null : feature.id)}
                >
                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                    {activeFlow === feature.id && (
                      <div className="space-y-2">
                        {feature.steps.map((step, index) => (
                          <div key={index} className="flex items-start space-x-2 text-xs">
                            <div className="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                              {index + 1}
                            </div>
                            <span className="text-gray-700">{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">< 3s</p>
                      <p className="text-sm text-gray-600">Temps de paiement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">100%</p>
                      <p className="text-sm text-gray-600">Sécurité HMAC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">QR</p>
                      <p className="text-sm text-gray-600">Codes sécurisés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">Auto</p>
                      <p className="text-sm text-gray-600">Email + SMS</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Flux de processus */}
          <TabsContent value="flows" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Flux d'achat */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Processus d'achat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {purchaseFlow.map((item, index) => (
                      <div key={item.step} className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {item.icon}
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        {index < purchaseFlow.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Flux de vérification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <QrCode className="w-5 h-5" />
                    <span>Processus de vérification</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {verificationFlow.map((item, index) => (
                      <div key={item.step} className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {item.icon}
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        {index < verificationFlow.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Diagramme de flux */}
            <Card>
              <CardHeader>
                <CardTitle>Architecture générale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center text-white">
                        <Users className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-medium">Client</p>
                    </div>
                    
                    <ArrowRight className="w-6 h-6 mx-auto text-gray-400" />
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center text-white">
                        <Globe className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-medium">Frontend React</p>
                    </div>
                    
                    <ArrowRight className="w-6 h-6 mx-auto text-gray-400" />
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center text-white">
                        <Server className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-medium">API Backend</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <div className="inline-flex space-x-4 bg-white p-4 rounded-lg border">
                      <div className="text-center">
                        <Database className="w-8 h-8 mx-auto text-indigo-500 mb-1" />
                        <p className="text-xs">PostgreSQL</p>
                      </div>
                      <div className="text-center">
                        <CreditCard className="w-8 h-8 mx-auto text-green-500 mb-1" />
                        <p className="text-xs">Stripe</p>
                      </div>
                      <div className="text-center">
                        <Mail className="w-8 h-8 mx-auto text-blue-500 mb-1" />
                        <p className="text-xs">SendGrid</p>
                      </div>
                      <div className="text-center">
                        <QrCode className="w-8 h-8 mx-auto text-purple-500 mb-1" />
                        <p className="text-xs">QR Generator</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technologies */}
          <TabsContent value="tech" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {technicalSpecs.map((spec) => (
                <Card key={spec.category}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {spec.icon}
                      <span>{spec.category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {spec.technologies.map((tech, index) => (
                        <div key={index} className="border-l-4 border-indigo-200 pl-4 py-2">
                          <h4 className="font-medium text-gray-900 mb-1">{tech.name}</h4>
                          <p className="text-sm text-gray-600">{tech.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* API & Sécurité */}
          <TabsContent value="api" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Endpoints API */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="w-5 h-5" />
                    <span>Endpoints principaux</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">POST</Badge>
                        <code className="text-sm">/api/tickets/purchase</code>
                      </div>
                      <p className="text-sm text-gray-600">Achat de billets avec paiement Stripe</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">POST</Badge>
                        <code className="text-sm">/api/tickets/verify</code>
                      </div>
                      <p className="text-sm text-gray-600">Vérification de QR codes d'entrée</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">GET</Badge>
                        <code className="text-sm">/api/tickets/{id}/pdf</code>
                      </div>
                      <p className="text-sm text-gray-600">Génération et téléchargement PDF</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">POST</Badge>
                        <code className="text-sm">/api/webhooks/stripe</code>
                      </div>
                      <p className="text-sm text-gray-600">Webhook de confirmation paiement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sécurité */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Mesures de sécurité</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Signatures HMAC</h4>
                        <p className="text-sm text-gray-600">Chaque QR code contient une signature cryptographique unique</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Chiffrement SSL/TLS</h4>
                        <p className="text-sm text-gray-600">Toutes les communications sont chiffrées end-to-end</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Validation timestamp</h4>
                        <p className="text-sm text-gray-600">Vérification de l'horodatage pour éviter le replay</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Logs d'audit</h4>
                        <p className="text-sm text-gray-600">Traçabilité complète de toutes les vérifications</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exemple de QR Code */}
            <Card>
              <CardHeader>
                <CardTitle>Structure du QR Code sécurisé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "orderId": "ORDER_1703584800123",
  "ticketId": "ticket-vip-001", 
  "timestamp": 1703584800123,
  "eventId": "event-festival-2024",
  "signature": "SHA256_HMAC_SIGNATURE",
  "verifyUrl": "https://feeti.com/api/verify-ticket"
}`}</pre>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Chaque QR code contient toutes les informations nécessaires pour une vérification autonome et sécurisée.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}