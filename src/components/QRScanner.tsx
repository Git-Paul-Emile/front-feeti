import { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent } from './ui/card';
import {
  XCircle,
  Loader,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose?: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  // ref stable pour stopper la boucle RAF depuis la closure (pas de stale state)
  const activeRef = useRef(false);
  const manualInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    activeRef.current = false;
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const startQRDetection = useCallback((onDetected: (data: string) => void) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const tick = () => {
      if (!activeRef.current) return; // arrêt propre via ref

      if (!video.videoWidth || !video.videoHeight) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (code?.data) {
          stopCamera();
          onDetected(code.data);
          return;
        }
      } catch {
        // erreur de décodage ponctuelle — on continue
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    setError(null);
    setHasPermission(null);

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      activeRef.current = true;
      setHasPermission(true);
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        startQRDetection(onScan);
      }
    } catch (err: any) {
      activeRef.current = false;
      setHasPermission(false);
      const msg = err?.name === 'NotAllowedError'
        ? "Permission caméra refusée. Autorisez l'accès dans les paramètres du navigateur."
        : "Impossible d'accéder à la caméra.";
      setError(msg);
    }
  }, [onScan, startQRDetection]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const handleManualInput = useCallback((value: string) => {
    if (value.trim()) {
      stopCamera();
      onScan(value.trim());
    }
  }, [onScan, stopCamera]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>

            {hasPermission === null && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                  <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
                  <p>Initialisation de la caméra...</p>
                </div>
              </div>
            )}

            {hasPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center p-6">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Accès Caméra Refusé</h3>
                  <p className="text-gray-300 mb-4">
                    Autorisez l'accès à la caméra pour scanner les QR codes
                  </p>
                  <Button onClick={startCamera} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réessayer
                  </Button>
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${hasPermission === true ? 'block' : 'hidden'}`}
              playsInline
              autoPlay
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {hasPermission === true && (
              <>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-64 h-64">
                    <div
                      className="absolute inset-0 rounded-lg"
                      style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)' }}
                    />
                    <div className="absolute inset-0 border-2 border-white/30 rounded-lg" />
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-center text-sm">Placez le QR code dans le cadre</p>
                  {isScanning && (
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-xs">Scan en cours…</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          <strong>Saisie manuelle :</strong> Si le QR code est illisible, entrez le N° du billet.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Saisie manuelle</label>
            <div className="flex gap-2">
              <input
                ref={manualInputRef}
                type="text"
                placeholder="N° billet (ex: YEM4RBZ8)"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleManualInput((e.target as HTMLInputElement).value);
                }}
              />
              <Button
                onClick={() => {
                  if (manualInputRef.current) handleManualInput(manualInputRef.current.value);
                }}
              >
                Valider
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <XCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
