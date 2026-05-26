import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  QrCode,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Scan,
  Clock,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import TicketAPI from '../services/api/TicketAPI';
import type { VerifyResult } from '../services/backend/types';

interface VerificationEntry {
  result: VerifyResult | null;
  valid: boolean;
  reason: string;
  scannedAt: number;
  qrSnippet: string;
}

interface TicketVerificationAPIProps {
  onClose?: () => void;
}

export function TicketVerificationAPI({ onClose }: TicketVerificationAPIProps) {
  const [qrInput, setQrInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentResult, setCurrentResult] = useState<VerificationEntry | null>(null);
  const [history, setHistory] = useState<VerificationEntry[]>([]);

  const handleVerify = async () => {
    const raw = qrInput.trim();
    if (!raw) {
      toast.error('Veuillez saisir ou scanner un QR code');
      return;
    }

    setIsVerifying(true);
    try {
      // Le backend marque le billet comme "used" et retourne le ticket mis à jour.
      // Un résultat sans exception = premier scan accepté.
      const result = await TicketAPI.verifyTicket(raw);
      const entry: VerificationEntry = {
        result,
        valid: true,
        reason: '',
        scannedAt: Date.now(),
        qrSnippet: raw.slice(0, 40),
      };
      setCurrentResult(entry);
      setHistory(prev => [entry, ...prev.slice(0, 19)]);
      toast.success('Billet valide — Accès autorisé ✓');
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Erreur technique lors de la vérification';
      const entry: VerificationEntry = { result: null, valid: false, reason: msg, scannedAt: Date.now(), qrSnippet: raw.slice(0, 40) };
      setCurrentResult(entry);
      setHistory(prev => [entry, ...prev.slice(0, 19)]);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
      setQrInput('');
    }
  };

  const formatTime = (ts: number) =>
    new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(ts));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vérification de billets</h1>
            <p className="text-gray-500 text-sm mt-1">Contrôle d'accès Feeti — 1 scan autorisé par billet</p>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>Fermer</Button>
          )}
        </div>

        {/* Compteurs */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">{history.filter(h => h.valid).length}</p>
                <p className="text-xs text-gray-500">Valides</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-red-600">{history.filter(h => !h.valid).length}</p>
                <p className="text-xs text-gray-500">Refusés</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">{history.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <QrCode className="w-5 h-5" /> Scanner un billet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Données QR du billet
                  </label>
                  <Input
                    placeholder="Scannez ou collez les données QR..."
                    value={qrInput}
                    onChange={e => setQrInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleVerify(); }}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">Appuyez sur Entrée ou cliquez sur Vérifier</p>
                </div>

                <Button
                  onClick={handleVerify}
                  disabled={isVerifying || !qrInput.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Vérification...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Scan className="w-4 h-4" /> Vérifier le billet
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Résultat */}
            {currentResult && (
              <Card className={`border-2 ${currentResult.valid ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {currentResult.valid
                      ? <CheckCircle className="w-7 h-7 text-green-600" />
                      : currentResult.reason.includes('déjà utilisé')
                      ? <AlertTriangle className="w-7 h-7 text-orange-500" />
                      : <XCircle className="w-7 h-7 text-red-500" />}
                    <div>
                      <p className={`font-bold text-lg ${currentResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                        {currentResult.valid ? 'Accès autorisé' : 'Accès refusé'}
                      </p>
                      {!currentResult.valid && (
                        <p className="text-sm text-red-700">{currentResult.reason}</p>
                      )}
                    </div>
                  </div>
                  {currentResult.result && (
                    <div className="bg-white rounded-lg p-3 border text-sm space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Porteur</span>
                        <span className="font-medium">{currentResult.result.holderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email</span>
                        <span className="font-medium">{currentResult.result.holderEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Catégorie</span>
                        <Badge className="bg-indigo-100 text-indigo-800 text-xs">{currentResult.result.category}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Statut</span>
                        <Badge className={currentResult.valid ? 'bg-green-100 text-green-800 text-xs' : 'bg-red-100 text-red-800 text-xs'}>
                          {currentResult.result.status}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Info sécurité */}
            <Card>
              <CardContent className="p-3 flex items-start gap-3">
                <Shield className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600">
                  Chaque billet ne peut être scanné qu'<strong>une seule fois</strong>.
                  Après validation, il est immédiatement marqué comme utilisé.
                  Les QR codes sont signés HMAC-SHA256 et ne peuvent pas être falsifiés.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Historique */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-5 h-5" /> Historique de la session
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <QrCode className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Aucun scan effectué</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {history.map((entry, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-sm ${
                        entry.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {entry.valid
                          ? <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                          : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {entry.result?.holderName ?? (entry.valid ? 'Valide' : 'Refusé')}
                          </p>
                          {!entry.valid && (
                            <p className="text-xs text-red-600 truncate">{entry.reason}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">{formatTime(entry.scannedAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
