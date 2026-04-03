import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  ArrowLeft, Camera, CameraOff, CheckCircle, XCircle,
  QrCode, Loader, AlertTriangle, Keyboard
} from 'lucide-react';
import TicketAPI, { type VerifyResult } from '../../services/api/TicketAPI';
import { toast } from 'sonner@2.0.3';

interface QRScannerPageProps {
  onBack: () => void;
}

type ScanResult = { type: 'success'; data: VerifyResult } | { type: 'error'; message: string };

export function QRScannerPage({ onBack }: QRScannerPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');

  // Load jsQR dynamically
  const jsQRRef = useRef<any>(null);
  useEffect(() => {
    import('jsqr').then(mod => { jsQRRef.current = mod.default; }).catch(() => {
      // jsQR not available, camera scanning won't work but manual input still works
    });
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
    setScanning(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setScanning(true);
      startScanLoop();
    } catch (err: any) {
      const msg = err?.name === 'NotAllowedError'
        ? 'Permission caméra refusée. Autorisez la caméra dans les paramètres du navigateur.'
        : 'Impossible d\'accéder à la caméra.';
      setCameraError(msg);
    }
  };

  const startScanLoop = useCallback(() => {
    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { animFrameRef.current = requestAnimationFrame(tick); return; }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (jsQRRef.current) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQRRef.current(imageData.data, imageData.width, imageData.height);
        if (code?.data) {
          handleVerify(code.data);
          return; // stop loop after detecting
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const handleVerify = async (qrData: string) => {
    if (verifying) return;
    cancelAnimationFrame(animFrameRef.current);
    setVerifying(true);
    try {
      const result = await TicketAPI.verifyTicket(qrData);
      setLastResult({ type: 'success', data: result });
      toast.success('Billet validé !');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Billet invalide ou déjà utilisé';
      setLastResult({ type: 'error', message: msg });
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleVerify(manualInput.trim());
  };

  const resetScan = () => {
    setLastResult(null);
    setManualInput('');
    if (cameraActive) {
      setScanning(true);
      startScanLoop();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" className="text-white hover:bg-gray-700" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
          </Button>
          <h1 className="font-semibold flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-400" /> Scanner les billets
          </h1>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === 'camera' ? 'default' : 'outline'}
              className={mode === 'camera' ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-gray-600 text-gray-300'}
              onClick={() => { setMode('camera'); resetScan(); }}
            >
              <Camera className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={mode === 'manual' ? 'default' : 'outline'}
              className={mode === 'manual' ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-gray-600 text-gray-300'}
              onClick={() => { setMode('manual'); stopCamera(); resetScan(); }}
            >
              <Keyboard className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Result card */}
        {lastResult && (
          <Card className={`border-2 ${lastResult.type === 'success' ? 'border-green-500 bg-green-950' : 'border-red-500 bg-red-950'}`}>
            <CardContent className="p-6">
              {lastResult.type === 'success' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-10 h-10 text-green-400 flex-shrink-0" />
                    <div>
                      <h2 className="text-lg font-bold text-green-300">Billet valide !</h2>
                      <p className="text-green-200 text-sm">Le billet a été marqué comme utilisé</p>
                    </div>
                  </div>
                  <div className="bg-green-900/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-400">Événement</span>
                      <span className="font-medium">{lastResult.data.event?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">Porteur</span>
                      <span className="font-medium">{lastResult.data.holderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">Email</span>
                      <span className="font-medium">{lastResult.data.holderEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">Catégorie</span>
                      <Badge className="bg-green-700 text-green-100">{lastResult.data.category}</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <XCircle className="w-10 h-10 text-red-400 flex-shrink-0" />
                  <div>
                    <h2 className="text-lg font-bold text-red-300">Billet invalide</h2>
                    <p className="text-red-200 text-sm">{lastResult.message}</p>
                  </div>
                </div>
              )}
              <Button
                className="mt-4 w-full bg-white text-gray-900 hover:bg-gray-100"
                onClick={resetScan}
              >
                Scanner un autre billet
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Camera mode */}
        {mode === 'camera' && !lastResult && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-400" /> Caméra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cameraError && (
                <div className="flex items-start gap-2 bg-yellow-900/40 border border-yellow-600 rounded-lg p-3 text-yellow-300 text-sm">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Video viewport */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  style={{ display: cameraActive ? 'block' : 'none' }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {!cameraActive && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
                    <CameraOff className="w-12 h-12" />
                    <p className="text-sm">Caméra inactive</p>
                  </div>
                )}

                {/* Scanning overlay */}
                {cameraActive && !verifying && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-56 h-56 border-2 border-indigo-400 rounded-xl relative">
                      <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-xl" />
                      <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-xl" />
                      <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-xl" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-xl" />
                      <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-indigo-400 opacity-60 animate-pulse" />
                    </div>
                  </div>
                )}

                {verifying && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-white">
                      <Loader className="w-10 h-10 animate-spin text-indigo-400" />
                      <p>Vérification en cours…</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!cameraActive ? (
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={startCamera}>
                    <Camera className="w-4 h-4 mr-2" /> Activer la caméra
                  </Button>
                ) : (
                  <Button className="flex-1" variant="outline" onClick={stopCamera}>
                    <CameraOff className="w-4 h-4 mr-2" /> Arrêter la caméra
                  </Button>
                )}
              </div>

              {cameraActive && (
                <p className="text-center text-sm text-gray-400">
                  Placez le QR code dans le cadre pour le scanner automatiquement
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manual mode */}
        {mode === 'manual' && !lastResult && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-indigo-400" /> Saisie manuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Données du QR code</Label>
                  <Input
                    value={manualInput}
                    onChange={e => setManualInput(e.target.value)}
                    placeholder="Collez les données du QR code ici…"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500">
                    Copiez la valeur du QR code (JSON) depuis l'application acheteur
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={!manualInput.trim() || verifying}
                >
                  {verifying ? (
                    <><Loader className="w-4 h-4 mr-2 animate-spin" /> Vérification…</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-2" /> Valider le billet</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        {!lastResult && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-sm text-gray-400 space-y-1">
              <p className="font-medium text-gray-300 mb-2">Comment ça marche ?</p>
              <p>1. Activez la caméra ou utilisez la saisie manuelle</p>
              <p>2. Scannez le QR code sur le billet de l'acheteur</p>
              <p>3. Le billet est validé et marqué comme utilisé automatiquement</p>
              <p>4. Un billet utilisé ne peut plus être scanné</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
