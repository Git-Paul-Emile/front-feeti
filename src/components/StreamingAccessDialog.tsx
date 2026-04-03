// Composant pour afficher et gérer le code d'accès streaming

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Copy, Mail, Eye, EyeOff, Loader, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import StreamingAccessAPI from '../services/api/StreamingAccessAPI';

interface StreamingAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessCode?: string;
  accessPin?: string;
  eventTitle: string;
  eventDate: string;
  userEmail?: string;
}

export function StreamingAccessDialog({
  open,
  onOpenChange,
  accessCode: initialAccessCode,
  accessPin: initialAccessPin,
  eventTitle,
  eventDate,
  userEmail
}: StreamingAccessDialogProps) {
  const [showPin, setShowPin] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const accessCode = initialAccessCode || '';
  const accessPin = initialAccessPin || '';

  const handleCopyCode = async () => {
    const success = await StreamingAccessAPI.copyToClipboard(accessCode);
    if (success) {
      toast.success('Code copié !');
    }
  };

  const handleCopyPin = async () => {
    const success = await StreamingAccessAPI.copyToClipboard(accessPin);
    if (success) {
      toast.success('PIN copié !');
    }
  };

  const handleCopyBoth = async () => {
    const text = `Code d'accès: ${accessCode}\nPIN: ${accessPin}`;
    const success = await StreamingAccessAPI.copyToClipboard(text);
    if (success) {
      toast.success('Code et PIN copiés !');
    }
  };

  const handleSendEmail = async () => {
    if (!userEmail) {
      toast.error('Email non disponible');
      return;
    }

    setSendingEmail(true);
    try {
      const success = await StreamingAccessAPI.sendAccessCodeByEmail(
        accessCode,
        accessPin,
        userEmail,
        eventTitle,
        eventDate
      );

      if (success) {
        setEmailSent(true);
        toast.success('Email envoyé avec succès !');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              🎬
            </div>
            Code d'Accès Streaming
          </DialogTitle>
          <DialogDescription className="text-base">
            Utilisez ces codes pour accéder à l'événement en ligne
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations événement */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎭</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 truncate">{eventTitle}</h4>
                <p className="text-sm text-gray-600 mt-1">📅 {eventDate}</p>
              </div>
            </div>
          </div>

          {/* Code d'accès */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <span className="text-indigo-600">🔑</span>
              Code d'Accès
            </Label>
            <div className="relative">
              <Input
                value={accessCode}
                readOnly
                className="text-center text-xl font-mono font-bold tracking-wider pr-12 bg-gray-50 border-2 border-indigo-200"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-indigo-100"
                onClick={handleCopyCode}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* PIN */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <span className="text-green-600">🔒</span>
              Code PIN
            </Label>
            <div className="relative">
              <Input
                value={accessPin}
                type={showPin ? 'text' : 'password'}
                readOnly
                className="text-center text-xl font-mono font-bold tracking-wider pr-24 bg-gray-50 border-2 border-green-200"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="hover:bg-green-100"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="hover:bg-green-100"
                  onClick={handleCopyPin}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Alert informations */}
          <Alert className="bg-blue-50 border-blue-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <AlertDescription>
              <strong>Comment utiliser :</strong><br />
              1. Allez sur la page de l'événement<br />
              2. Cliquez sur "Rejoindre le streaming"<br />
              3. Entrez votre code d'accès et PIN<br />
              4. Profitez de l'événement !
            </AlertDescription>
          </Alert>

          {/* Avertissement */}
          <Alert variant="destructive" className="bg-amber-50 border-amber-300">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>⚠️ Important :</strong> Ne partagez jamais vos codes d'accès. 
              Vous pouvez vous connecter jusqu'à 3 fois. Le code expire 24h après l'événement.
            </AlertDescription>
          </Alert>

          {/* Email sent confirmation */}
          {emailSent && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Un email avec vos codes d'accès a été envoyé à <strong>{userEmail}</strong>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCopyBoth}
            className="w-full sm:w-auto"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copier tout
          </Button>
          
          {userEmail && !emailSent && (
            <Button
              variant="outline"
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="w-full sm:w-auto"
            >
              {sendingEmail ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer par email
                </>
              )}
            </Button>
          )}

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            J'ai compris
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
