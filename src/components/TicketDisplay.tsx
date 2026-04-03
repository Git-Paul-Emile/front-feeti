// Composant pour afficher un ticket avec QR code et actions

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Download, 
  Share2, 
  Mail, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle, 
  XCircle,
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import TicketGenerationAPI, { GeneratedTicket } from '../services/api/TicketGenerationAPI';

interface TicketDisplayProps {
  ticket: GeneratedTicket;
  onShare?: () => void;
  onDownload?: () => void;
  showActions?: boolean;
}

export function TicketDisplay({ ticket, onShare, onDownload, showActions = true }: TicketDisplayProps) {
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await TicketGenerationAPI.saveTicketPDF(ticket.id, `ticket-${ticket.ticketId}.pdf`);
      onDownload?.();
    } catch (error) {
      console.error('Error downloading ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const shared = await TicketGenerationAPI.shareTicket(ticket);
      if (shared) {
        onShare?.();
      }
    } catch (error) {
      console.error('Error sharing ticket:', error);
    }
  };

  const handleOpenPDF = () => {
    TicketGenerationAPI.openTicketPDF(ticket.id);
  };

  const handleRegenerateQR = async () => {
    setRegenerating(true);
    try {
      const response = await TicketGenerationAPI.regenerateQRCode(ticket.id);
      if (response.success) {
        toast.success('QR code régénéré avec succès');
        // Recharger la page ou mettre à jour le ticket
        window.location.reload();
      }
    } catch (error) {
      console.error('Error regenerating QR:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const getStatusBadge = () => {
    switch (ticket.status) {
      case 'valid':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Valide
          </Badge>
        );
      case 'used':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Utilisé
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Annulé
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-indigo-100 hover:border-indigo-300 transition-all">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{ticket.eventTitle}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge()}
              <Badge variant="outline" className="text-xs">
                {ticket.ticketId}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Date & Heure</p>
                <p className="font-medium">{ticket.eventDate}</p>
                <p className="text-sm text-gray-600">{ticket.eventTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Lieu</p>
                <p className="font-medium">{ticket.eventLocation}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Détenteur</p>
                <p className="font-medium">{ticket.holderName}</p>
                <p className="text-sm text-gray-600">{ticket.holderEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Prix</p>
                <p className="text-lg font-bold text-green-600">
                  {ticket.price.toLocaleString()} {ticket.currency}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code */}
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
            <img 
              src={ticket.qrCodeDataUrl} 
              alt="QR Code"
              className="w-48 h-48 mb-4"
            />
            <p className="text-sm text-center text-gray-600 mb-2">
              Présentez ce code à l'entrée
            </p>
            {ticket.status === 'valid' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateQR}
                disabled={regenerating}
                className="text-xs"
              >
                {regenerating ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Régénération...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Régénérer QR
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Alert si ticket utilisé */}
        {ticket.status === 'used' && (
          <Alert className="mt-4 bg-gray-50 border-gray-200">
            <CheckCircle className="w-4 h-4 text-gray-600" />
            <AlertDescription>
              Ce billet a déjà été utilisé et ne peut plus être scanné.
            </AlertDescription>
          </Alert>
        )}

        {/* Alert si ticket annulé */}
        {ticket.status === 'cancelled' && (
          <Alert className="mt-4 bg-red-50 border-red-200">
            <XCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Ce billet a été annulé et n'est plus valide.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        {showActions && ticket.status === 'valid' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={handleDownload}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Télécharger
              </Button>

              <Button
                onClick={handleOpenPDF}
                className="w-full"
                variant="outline"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ouvrir PDF
              </Button>

              <Button
                onClick={handleShare}
                className="w-full"
                variant="outline"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>

              <Button
                onClick={() => {
                  window.location.href = `mailto:?subject=Mon billet - ${ticket.eventTitle}&body=Voici mon billet pour ${ticket.eventTitle}`;
                }}
                className="w-full"
                variant="outline"
              >
                <Mail className="w-4 h-4 mr-2" />
                Envoyer
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            <strong>⚠️ Important :</strong>
          </p>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>Ce billet est strictement personnel et non cessible</li>
            <li>Arrivez 15 minutes avant le début de l'événement</li>
            <li>Le QR code ne peut être scanné qu'une seule fois</li>
            <li>Conservez ce billet jusqu'à la fin de l'événement</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
