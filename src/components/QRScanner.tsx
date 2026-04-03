// Composant Scanner QR Code pour vérifier les billets à l'entrée

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent } from './ui/card';
import { 
  Camera, 
  X, 
  CheckCircle, 
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
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      setScanning(true);

      // Demander l'accès à la caméra
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Caméra arrière sur mobile
      });

      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Démarrer la détection QR
        startQRDetection();
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setHasPermission(false);
      setError('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès.');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const startQRDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    const detectQR = () => {
      if (!scanning || !video.videoWidth || !video.videoHeight) {
        requestAnimationFrame(detectQR);
        return;
      }

      // Ajuster la taille du canvas à la vidéo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Dessiner la frame vidéo sur le canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        // Essayer de détecter un QR code
        // Note: Ici on utilise une simulation. En production, utilisez une vraie librairie QR
        // comme jsQR: npm install jsqr
        
        // Exemple avec jsQR (à décommenter si installé):
        // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        // const code = jsQR(imageData.data, imageData.width, imageData.height);
        // if (code) {
        //   onScan(code.data);
        //   stopCamera();
        //   return;
        // }

        // Pour la démo, on simule avec un bouton manuel
      } catch (err) {
        console.error('QR detection error:', err);
      }

      requestAnimationFrame(detectQR);
    };

    detectQR();
  };

  const handleManualInput = (value: string) => {
    if (value) {
      onScan(value);
      stopCamera();
    }
  };

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

            {hasPermission === true && (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />

                {/* Overlay de ciblage */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative">
                    <div className="w-64 h-64 border-4 border-white rounded-lg opacity-50"></div>
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-center">
                    📷 Placez le QR code dans le cadre
                  </p>
                  {scanning && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Scan en cours...</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Saisie manuelle pour démo */}
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          <strong>Mode Démo :</strong> En production, installez jsQR pour scanner automatiquement. 
          Pour tester maintenant, entrez manuellement un ID de billet ci-dessous.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Saisie manuelle (démo)</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: FEETI-001"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualInput((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <Button
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (input) {
                    handleManualInput(input.value);
                  }
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
