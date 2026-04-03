import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  QrCode, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Camera,
  Scan,
  Clock,
  Shield,
  User,
  Calendar,
  MapPin,
  Ticket
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TicketVerificationResult {
  valid: boolean;
  reason?: string;
  ticketData?: {
    id: string;
    orderId: string;
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    category: string;
    holderName: string;
    holderEmail: string;
    purchaseDate: string;
    status: 'valid' | 'used' | 'expired';
    timestamp: number;
  };
  verificationTimestamp?: number;
}

interface TicketVerificationAPIProps {
  onClose?: () => void;
}

export function TicketVerificationAPI({ onClose }: TicketVerificationAPIProps) {
  const [qrInput, setQrInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<TicketVerificationResult | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<TicketVerificationResult[]>([]);

  // Simulation d'une base de données de tickets
  const mockTicketDatabase = new Map([
    ['ORDER_1234567890-ticket-001', {
      id: 'ticket-001',
      orderId: 'ORDER_1234567890',
      eventId: '1',
      eventTitle: 'Festival Électro Summer',
      eventDate: '2024-07-15',
      eventTime: '20:00',
      eventLocation: 'Brazzaville',
      category: 'VIP',
      holderName: 'John Doe',
      holderEmail: 'john@example.com',
      purchaseDate: '2024-06-15T10:30:00Z',
      status: 'valid' as const,
      timestamp: 1718451000000,
      signature: 'valid-signature-hash'
    }],
    ['ORDER_1234567891-ticket-002', {
      id: 'ticket-002',
      orderId: 'ORDER_1234567891',
      eventId: '1',
      eventTitle: 'Festival Électro Summer',
      eventDate: '2024-07-15',
      eventTime: '20:00',
      eventLocation: 'Brazzaville',
      category: 'Standard',
      holderName: 'Jane Smith',
      holderEmail: 'jane@example.com',
      purchaseDate: '2024-06-16T14:20:00Z',
      status: 'used' as const,
      timestamp: 1718545200000,
      signature: 'valid-signature-hash'
    }]
  ]);

  const parseQRCode = (qrData: string) => {
    try {
      const parsed = JSON.parse(qrData);
      return {
        orderId: parsed.orderId,
        ticketId: parsed.ticketId,
        timestamp: parsed.timestamp,
        eventId: parsed.eventId,
        signature: parsed.signature
      };
    } catch (error) {
      return null;
    }
  };

  const verifySignature = (orderId: string, ticketId: string, timestamp: number, signature: string) => {
    // Simulation de la vérification HMAC
    const expectedSignature = btoa(`${orderId}-${ticketId}-${timestamp}-SECRET_KEY`);
    return signature === expectedSignature || signature === 'valid-signature-hash';
  };

  const verifyTicket = async (qrData: string): Promise<TicketVerificationResult> => {
    try {
      // Import dynamique de l'API
      const { ticketAPI } = await import('./api/TicketAPI');
      
      // Appeler l'API de vérification
      const result = await ticketAPI.verifyTicket({ qrCode: qrData });
      
      return {
        valid: result.valid,
        reason: result.reason,
        ticketData: result.ticketData ? {
          id: result.ticketData.id,
          orderId: result.ticketData.orderId,
          eventId: result.ticketData.eventId,
          eventTitle: result.ticketData.eventTitle,
          eventDate: result.ticketData.eventDate,
          eventTime: result.ticketData.eventTime,
          eventLocation: result.ticketData.eventLocation,
          category: result.ticketData.category,
          holderName: result.ticketData.holderName,
          holderEmail: result.ticketData.holderEmail,
          purchaseDate: result.ticketData.purchaseDate,
          status: result.ticketData.status,
          timestamp: result.ticketData.timestamp
        } : undefined,
        verificationTimestamp: result.verificationTimestamp
      };
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return {
        valid: false,
        reason: 'Erreur technique lors de la vérification'
      };
    }
  };

  const handleVerifyTicket = async () => {
    if (!qrInput.trim()) {
      toast.error('Veuillez saisir ou scanner un QR code');
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulation du délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await verifyTicket(qrInput);
      setVerificationResult(result);
      
      // Ajouter à l'historique
      setVerificationHistory(prev => [result, ...prev.slice(0, 9)]);
      
      if (result.valid) {
        toast.success('Ticket valide ! Accès autorisé.');
      } else {
        toast.error(`Ticket invalide : ${result.reason}`);
      }
      
    } catch (error) {
      toast.error('Erreur lors de la vérification');
      setVerificationResult({
        valid: false,
        reason: 'Erreur technique lors de la vérification'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (valid: boolean, reason?: string) => {
    if (valid) {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
    
    if (reason?.includes('utilisé')) {
      return <AlertTriangle className="w-6 h-6 text-orange-600" />;
    }
    
    return <XCircle className="w-6 h-6 text-red-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vérification de billets</h1>
              <p className="text-gray-600 mt-2">Système de contrôle d'accès Feeti</p>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
            )}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {verificationHistory.filter(v => v.valid).length}
                    </p>
                    <p className="text-sm text-gray-600">Billets valides</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {verificationHistory.filter(v => !v.valid).length}
                    </p>
                    <p className="text-sm text-gray-600">Billets rejetés</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {verificationHistory.length}
                    </p>
                    <p className="text-sm text-gray-600">Total vérifications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Verification Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Scanner un ticket</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    QR Code du billet
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Collez le contenu du QR code ici ou scannez..."
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        // Simulation du scan de caméra
                        setQrInput(JSON.stringify({
                          orderId: 'ORDER_1234567890',
                          ticketId: 'ticket-001',
                          timestamp: 1718451000000,
                          eventId: '1',
                          signature: 'valid-signature-hash'
                        }));
                      }}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Utilisez la caméra ou collez manuellement le contenu du QR code
                  </p>
                </div>

                <Button
                  onClick={handleVerifyTicket}
                  disabled={isVerifying || !qrInput.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isVerifying ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Vérification...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Scan className="w-4 h-4" />
                      <span>Vérifier le billet</span>
                    </div>
                  )}
                </Button>

                {/* Quick Test Buttons */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tests rapides :</p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQrInput(JSON.stringify({
                        orderId: 'ORDER_1234567890',
                        ticketId: 'ticket-001',
                        timestamp: 1718451000000,
                        eventId: '1',
                        signature: 'valid-signature-hash'
                      }))}
                    >
                      Ticket valide
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQrInput(JSON.stringify({
                        orderId: 'ORDER_1234567891',
                        ticketId: 'ticket-002',
                        timestamp: 1718545200000,
                        eventId: '1',
                        signature: 'valid-signature-hash'
                      }))}
                    >
                      Ticket utilisé
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQrInput('invalid-qr-code')}
                    >
                      QR invalide
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Result */}
            {verificationResult && (
              <Card className={`border-2 ${
                verificationResult.valid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getStatusIcon(verificationResult.valid, verificationResult.reason)}
                    <span>
                      {verificationResult.valid ? 'Billet valide' : 'Billet rejeté'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {verificationResult.valid ? (
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Événement</p>
                            <p className="font-medium">{verificationResult.ticketData?.eventTitle}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Catégorie</p>
                            <Badge className={getStatusColor('valid')}>
                              {verificationResult.ticketData?.category}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-gray-600">Porteur</p>
                            <p className="font-medium">{verificationResult.ticketData?.holderName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Date événement</p>
                            <p className="font-medium">
                              {verificationResult.ticketData?.eventDate && formatDate(verificationResult.ticketData.eventDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <p className="text-green-800 font-medium">
                            Accès autorisé - Ticket marqué comme utilisé
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-red-100 p-3 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <p className="text-red-800 font-medium">
                            Accès refusé : {verificationResult.reason}
                          </p>
                        </div>
                      </div>
                      
                      {verificationResult.ticketData && (
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-sm text-gray-600 mb-2">Informations du ticket :</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Événement :</span>
                              <span className="ml-2 font-medium">{verificationResult.ticketData.eventTitle}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Porteur :</span>
                              <span className="ml-2 font-medium">{verificationResult.ticketData.holderName}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Statut :</span>
                              <Badge className={`ml-2 ${getStatusColor(verificationResult.ticketData.status)}`}>
                                {verificationResult.ticketData.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Verification History */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Historique des vérifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verificationHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune vérification effectuée</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {verificationHistory.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(result.valid, result.reason)}
                            <div>
                              <p className="font-medium text-sm">
                                {result.valid ? 'Valide' : 'Rejeté'}
                              </p>
                              <p className="text-xs text-gray-600">
                                {result.verificationTimestamp && formatDateTime(result.verificationTimestamp)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {result.ticketData && (
                              <div className="text-xs text-gray-600">
                                <p className="font-medium">{result.ticketData.holderName}</p>
                                <p>{result.ticketData.category}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        {!result.valid && result.reason && (
                          <p className="text-xs text-red-600 mt-2 italic">
                            {result.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* API Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>API de vérification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Endpoint</p>
                  <code className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                    POST /api/verify-ticket
                  </code>
                </div>
                
                <div className="text-xs text-gray-600 space-y-2">
                  <div>
                    <p className="font-medium">Request Body:</p>
                    <code className="bg-white p-2 rounded block">
                      {JSON.stringify({ qrCode: "scanned_qr_data" }, null, 2)}
                    </code>
                  </div>
                  
                  <div>
                    <p className="font-medium">Response:</p>
                    <code className="bg-white p-2 rounded block">
                      {JSON.stringify({ 
                        valid: true, 
                        ticketData: { /* ... */ },
                        verificationTimestamp: Date.now()
                      }, null, 2)}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}