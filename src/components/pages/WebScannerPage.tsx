import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BrowserQRCodeReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';
import {
  ArrowLeft, Wifi, WifiOff, Camera, CameraOff,
  CheckCircle, XCircle, AlertCircle, RefreshCw, Upload,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import AccessAPI from '../../services/api/AccessAPI';
import type { EventZone, ScanResult, OfflineScan } from '../../services/api/AccessAPI';

// ─── Offline queue helpers ─────────────────────────────────────────────────

const QUEUE_PREFIX = 'feeti_access_offline_';

function loadQueue(eventId: string): OfflineScan[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_PREFIX + eventId) ?? '[]'); }
  catch { return []; }
}

function saveQueue(eventId: string, q: OfflineScan[]) {
  localStorage.setItem(QUEUE_PREFIX + eventId, JSON.stringify(q));
}

// ─── Result display config ─────────────────────────────────────────────────

const RESULT_CONFIG = {
  granted:     { label: 'Accès accordé',      Icon: CheckCircle,  bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-700', iconCls: 'text-emerald-500' },
  denied:      { label: 'Accès refusé',       Icon: XCircle,      bg: 'bg-red-50',     border: 'border-red-400',     text: 'text-red-700',     iconCls: 'text-red-500' },
  conditional: { label: 'Accès conditionnel', Icon: AlertCircle,  bg: 'bg-amber-50',   border: 'border-amber-400',   text: 'text-amber-700',   iconCls: 'text-amber-500' },
} as const;

// ─── Component ────────────────────────────────────────────────────────────

export function WebScannerPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [zones, setZones] = useState<EventZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<(ScanResult & { ts: Date }) | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<OfflineScan[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [agentCode, setAgentCode] = useState(sessionStorage.getItem('feeti_access_agent_code') ?? '');
  const [agentUnlocked, setAgentUnlocked] = useState(false);
  const [agentChecking, setAgentChecking] = useState(false);
  const [suspectDialog, setSuspectDialog] = useState(false);
  const [suspectReason, setSuspectReason] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const processingRef = useRef(false); // évite les double-lectures
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playTone = (type: 'ok' | 'error' | 'warn') => {
    try {
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextCtor();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = type === 'ok' ? 880 : type === 'warn' ? 520 : 180;
      gain.gain.value = 0.08;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + (type === 'error' ? 0.28 : 0.16));
    } catch {}
  };

  // ── Load zones ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!eventId) return;
    setOfflineQueue(loadQueue(eventId));
    AccessAPI.getZones(eventId)
      .then(data => setZones(data.filter(z => z.isActive)))
      .catch(() => toast.error('Impossible de charger les zones'))
      .finally(() => setZonesLoading(false));
  }, [eventId]);

  const verifyAgent = async () => {
    if (!agentCode.trim()) return;
    setAgentChecking(true);
    try {
      await AccessAPI.verifyAgentCode(agentCode.trim());
      sessionStorage.setItem('feeti_access_agent_code', agentCode.trim());
      setAgentUnlocked(true);
      toast.success('Code agent validé');
    } catch {
      setAgentUnlocked(false);
      toast.error('Code agent invalide');
    } finally {
      setAgentChecking(false);
    }
  };

  // ── Online/offline ──────────────────────────────────────────────────────
  useEffect(() => {
    const up = () => setIsOnline(true);
    const dn = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', dn);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', dn); };
  }, []);

  // ── Cleanup on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      controlsRef.current?.stop();
    };
  }, []);

  // ── Handle decoded QR ──────────────────────────────────────────────────
  const handleScan = useCallback(async (text: string) => {
    if (processingRef.current || !selectedZoneId || !eventId || !agentUnlocked) return;
    processingRef.current = true;

    const entry: OfflineScan = { qrCode: text, zoneId: selectedZoneId, scannedAt: new Date().toISOString() };

    if (!isOnline) {
      const next = [...offlineQueue, entry];
      setOfflineQueue(next);
      saveQueue(eventId, next);
      setLastResult({ result: 'conditional', holder: { name: 'Enregistré hors connexion' }, ts: new Date() });
      playTone('warn');
      resumeTimerRef.current = setTimeout(() => { processingRef.current = false; }, 1500);
      return;
    }

    try {
      const result = await AccessAPI.scanBadge(text, selectedZoneId, agentCode.trim());
      setLastResult({ ...result, ts: new Date() });
      playTone(result.result === 'granted' ? 'ok' : result.result === 'conditional' ? 'warn' : 'error');
    } catch {
      setLastResult({ result: 'denied', refusalReason: 'Erreur réseau', ts: new Date() });
      playTone('error');
    }

    // Reprendre après 2.5s
    resumeTimerRef.current = setTimeout(() => { processingRef.current = false; }, 2500);
  }, [selectedZoneId, eventId, isOnline, offlineQueue, agentUnlocked, agentCode]);

  // ── Start scanner ──────────────────────────────────────────────────────
  const startScanner = async () => {
    if (!agentUnlocked) { toast.error('Validez le code agent d\'abord'); return; }
    if (!selectedZoneId) { toast.error('Sélectionnez une zone d\'abord'); return; }
    if (!videoRef.current) return;

    processingRef.current = false;

    try {
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromConstraints(
        { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
        videoRef.current,
        (result) => { if (result) handleScan(result.getText()); }
      );
      controlsRef.current = controls;
      setScanning(true);
    } catch (err: any) {
      toast.error('Caméra inaccessible : ' + (err?.message ?? 'permission refusée'));
    }
  };

  // ── Stop scanner ───────────────────────────────────────────────────────
  const stopScanner = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    processingRef.current = false;
    setScanning(false);
  };

  // ── Sync offline queue ─────────────────────────────────────────────────
  const syncQueue = async () => {
    if (!eventId || offlineQueue.length === 0) return;
    setSyncing(true);
    try {
      const { synced } = await AccessAPI.syncOfflineScans(offlineQueue);
      const remaining = offlineQueue.slice(synced);
      setOfflineQueue(remaining);
      saveQueue(eventId, remaining);
      toast.success(`${synced} scan(s) synchronisé(s)`);
    } catch {
      toast.error('Erreur de synchronisation');
    }
    setSyncing(false);
  };

  const selectedZone = zones.find(z => z.id === selectedZoneId);
  const cfg = lastResult ? RESULT_CONFIG[lastResult.result] : null;
  const submitSuspectReport = async () => {
    const badgeId = lastResult?.holder?.badgeId;
    if (!badgeId || suspectReason.trim().length < 5) return;
    try {
      await AccessAPI.reportSuspectBadge(badgeId, suspectReason.trim());
      toast.success('Signalement enregistré');
      setSuspectDialog(false);
      setSuspectReason('');
    } catch {
      toast.error('Signalement impossible');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => { stopScanner(); navigate(-1); }}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="font-bold text-sm">Scanner Feeti Access</p>
            {selectedZone && (
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: selectedZone.color }} />
                {selectedZone.code} — {selectedZone.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {offlineQueue.length > 0 && (
            <Badge className="text-xs bg-amber-600 text-white border-0">
              {offlineQueue.length} hors-ligne
            </Badge>
          )}
          {isOnline
            ? <Wifi className="w-4 h-4 text-emerald-400" />
            : <WifiOff className="w-4 h-4 text-red-400" />
          }
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">

        {!agentUnlocked && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 space-y-3">
              <Label className="text-gray-200">Code agent</Label>
              <div className="flex gap-2">
                <Input
                  value={agentCode}
                  onChange={e => setAgentCode(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') verifyAgent(); }}
                  className="bg-gray-900 border-gray-600 text-white"
                  placeholder="Code d'accès terrain"
                />
                <Button onClick={verifyAgent} disabled={agentChecking || !agentCode.trim()}>
                  {agentChecking ? '...' : 'OK'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Zone selector (visible seulement si inactif) ──────────────── */}
        {!scanning && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Zone à contrôler</label>
            {zonesLoading ? (
              <div className="h-10 bg-gray-700 rounded animate-pulse" />
            ) : (
              <Select value={selectedZoneId} onValueChange={setSelectedZoneId}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Choisir une zone..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {zones.map(z => (
                    <SelectItem key={z.id} value={z.id} className="text-white focus:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: z.color }} />
                        {z.code} — {z.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* ── Viewfinder ────────────────────────────────────────────────── */}
        <div className="relative bg-black rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${scanning ? 'block' : 'hidden'}`}
            muted
            playsInline
          />

          {/* Overlay viseur */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-2 border-white/60 rounded-xl relative">
                <span className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                <span className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                <span className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                <span className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
              </div>
            </div>
          )}

          {!scanning && (
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Camera className="w-14 h-14 opacity-40" />
              <p className="text-sm">Caméra inactive</p>
            </div>
          )}
        </div>

        {/* ── Start / Stop ──────────────────────────────────────────────── */}
        <Button
          onClick={scanning ? stopScanner : startScanner}
          disabled={!scanning && !selectedZoneId}
          className={`w-full py-6 text-base font-semibold rounded-xl transition-colors ${
            scanning ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {scanning
            ? <><CameraOff className="w-5 h-5 mr-2" />Arrêter le scan</>
            : <><Camera className="w-5 h-5 mr-2" />Démarrer le scan</>
          }
        </Button>

        {/* ── Last result ───────────────────────────────────────────────── */}
        {lastResult && cfg && (
          <Card className={`border-2 ${cfg.border} ${cfg.bg}`}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-start gap-3">
                {lastResult.holder?.photo && (
                  <img src={lastResult.holder.photo} alt="" className="w-12 h-12 rounded-full object-cover border border-white/70" />
                )}
                <cfg.Icon className={`w-8 h-8 shrink-0 mt-0.5 ${cfg.iconCls}`} />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-base ${cfg.text}`}>{cfg.label}</p>
                  {lastResult.holder?.name && (
                    <p className="text-sm text-gray-700 font-medium mt-0.5">{lastResult.holder.name}</p>
                  )}
                  {lastResult.holder?.category && (
                    <p className="text-xs text-gray-500">{lastResult.holder.category}</p>
                  )}
                  {lastResult.holder?.phone && (
                    <p className="text-xs text-gray-500">{lastResult.holder.phone}</p>
                  )}
                  {lastResult.refusalReason && (
                    <p className="text-xs text-red-600 mt-1">{lastResult.refusalReason}</p>
                  )}
                  {lastResult.holder?.authorizedZones && lastResult.holder.authorizedZones.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {lastResult.holder.authorizedZones.map(z => (
                        <span key={z.zoneId} className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          z.level === 'OUI' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>{z.zoneName}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {lastResult.ts.toLocaleTimeString('fr-FR')}
                  </p>
                  {lastResult.result === 'denied' && (
                    <Button size="sm" variant="outline" className="mt-2 h-8 text-xs" onClick={() => setSuspectDialog(true)}>
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />Signaler
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Offline sync ──────────────────────────────────────────────── */}
        {offlineQueue.length > 0 && isOnline && (
          <Button
            variant="outline"
            className="w-full border-amber-500 text-amber-400 hover:bg-amber-900/20"
            onClick={syncQueue}
            disabled={syncing}
          >
            {syncing
              ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Synchronisation...</>
              : <><Upload className="w-4 h-4 mr-2" />Synchroniser {offlineQueue.length} scan(s) hors-ligne</>
            }
          </Button>
        )}
      </div>
      <Dialog open={suspectDialog} onOpenChange={setSuspectDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Signaler un badge suspect</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Motif</Label>
            <Textarea
              value={suspectReason}
              onChange={e => setSuspectReason(e.target.value)}
              placeholder="Ex: QR présenté par une autre personne, capture d'écran suspecte..."
            />
            <Button className="w-full" onClick={submitSuspectReport} disabled={suspectReason.trim().length < 5}>
              Enregistrer le signalement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WebScannerPage;
