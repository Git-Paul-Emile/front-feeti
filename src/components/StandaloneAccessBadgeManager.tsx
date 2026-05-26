import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Plus, Shield, Mail, XCircle, CheckCircle2,
  RefreshCw, Download, ArrowLeft, User, Tag, Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import AccessAPI, { type AccessBadge } from '../services/api/AccessAPI';
import EventsBackendAPI from '../services/api/EventsBackendAPI';

interface StandaloneAccessBadgeManagerProps {
  onBack?: () => void;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active:  { label: 'Actif',   className: 'bg-green-100 text-green-800' },
  revoked: { label: 'Révoqué', className: 'bg-red-100 text-red-800' },
  expired: { label: 'Expiré',  className: 'bg-gray-100 text-gray-600' },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function StandaloneAccessBadgeManager({ onBack }: StandaloneAccessBadgeManagerProps) {
  const [badges, setBadges]         = useState<AccessBadge[]>([]);
  const [loading, setLoading]       = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [qrPreview, setQrPreview]   = useState<AccessBadge | null>(null);

  // Événements de l'organisateur pour le lien facultatif
  const [events, setEvents]   = useState<{ id: string; title: string }[]>([]);

  // Formulaire de création
  const [form, setForm] = useState({
    holderName:    '',
    holderEmail:   '',
    holderPhone:   '',
    categoryLabel: 'Participant',
    eventLabel:    '',
    eventId:       '',
  });
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    AccessAPI.getStandaloneBadges()
      .then(setBadges)
      .catch(() => toast.error('Erreur lors du chargement des badges'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    EventsBackendAPI.getMyEvents?.()
      .then((evts: any[]) => setEvents(evts.map((e: any) => ({ id: e.id, title: e.title }))))
      .catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!form.holderName.trim() || !form.holderEmail.trim()) {
      toast.error('Nom et email du porteur obligatoires');
      return;
    }
    setCreating(true);
    try {
      const badge = await AccessAPI.generateStandaloneBadge({
        holderName:    form.holderName.trim(),
        holderEmail:   form.holderEmail.trim(),
        holderPhone:   form.holderPhone.trim() || undefined,
        categoryLabel: form.categoryLabel.trim() || 'Participant',
        eventLabel:    form.eventLabel.trim() || undefined,
        eventId:       form.eventId || undefined,
      });
      setBadges(prev => [badge, ...prev]);
      setCreateOpen(false);
      setForm({ holderName: '', holderEmail: '', holderPhone: '', categoryLabel: 'Participant', eventLabel: '', eventId: '' });
      toast.success('Badge créé avec succès');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (badge: AccessBadge) => {
    if (!confirm(`Révoquer le badge de ${badge.holderName} ?`)) return;
    try {
      const updated = await AccessAPI.revokeStandaloneBadge(badge.id);
      setBadges(prev => prev.map(b => b.id === badge.id ? { ...b, ...updated } : b));
      toast.success('Badge révoqué');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erreur lors de la révocation');
    }
  };

  const handleSend = async (badge: AccessBadge) => {
    try {
      await AccessAPI.sendStandaloneBadge(badge.id);
      setBadges(prev => prev.map(b => b.id === badge.id ? { ...b, sentAt: new Date().toISOString() } : b));
      toast.success(`Badge envoyé à ${badge.holderEmail}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erreur envoi email');
    }
  };

  const downloadQr = (badge: AccessBadge) => {
    const svg = document.getElementById(`qr-${badge.id}`);
    if (!svg) return;
    const serialized = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([serialized], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `badge-${badge.holderName.replace(/\s+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categoryName = (b: AccessBadge) => b.categoryLabel ?? b.category?.name ?? 'Participant';
  const eventName    = (b: AccessBadge) => b.eventLabel ?? b.event?.title ?? '—';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="text-gray-500 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600" />
                Badges d'accès indépendants
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Créez des badges sans les rattacher à un événement Feeti</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-1" /> Nouveau badge
            </Button>
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement…</div>
        ) : badges.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Shield className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">Aucun badge indépendant créé</p>
              <p className="text-xs text-gray-400 mt-1">Créez des badges pour des participants sans événement rattaché sur Feeti</p>
              <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-1" /> Créer un badge
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map(badge => {
              const s = STATUS_LABELS[badge.status] ?? STATUS_LABELS['active'];
              return (
                <Card key={badge.id} className={`relative overflow-hidden ${badge.status === 'revoked' ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{badge.holderName}</CardTitle>
                        <p className="text-xs text-gray-500 truncate">{badge.holderEmail}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${s.className}`}>{s.label}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Tag className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{categoryName(badge)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{eventName(badge)}</span>
                    </div>
                    <div className="text-xs text-gray-400">Créé le {fmt(badge.createdAt)}</div>
                    {badge.sentAt && (
                      <div className="text-xs text-green-600">Envoyé le {fmt(badge.sentAt)}</div>
                    )}

                    {/* QR préview miniature */}
                    <div
                      className="flex justify-center p-2 bg-white rounded border cursor-pointer hover:shadow transition-shadow"
                      onClick={() => setQrPreview(badge)}
                      title="Voir le QR code en grand"
                    >
                      <QRCodeSVG id={`qr-${badge.id}`} value={badge.qrCode} size={80} />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 flex-wrap">
                      {badge.status === 'active' && (
                        <>
                          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleSend(badge)}>
                            <Mail className="w-3 h-3 mr-1" /> Email
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => downloadQr(badge)}>
                            <Download className="w-3 h-3 mr-1" /> QR
                          </Button>
                          <Button size="sm" variant="destructive" className="text-xs px-2" onClick={() => handleRevoke(badge)}>
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                      {badge.status !== 'active' && (
                        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => downloadQr(badge)}>
                          <Download className="w-3 h-3 mr-1" /> Télécharger QR
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal création */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" /> Nouveau badge indépendant
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Nom du porteur <span className="text-red-500">*</span></Label>
              <Input
                value={form.holderName}
                onChange={e => setForm(p => ({ ...p, holderName: e.target.value }))}
                placeholder="Prénom Nom"
              />
            </div>
            <div className="space-y-1">
              <Label>Email du porteur <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                value={form.holderEmail}
                onChange={e => setForm(p => ({ ...p, holderEmail: e.target.value }))}
                placeholder="porteur@example.com"
              />
            </div>
            <div className="space-y-1">
              <Label>Téléphone <span className="text-gray-400 font-normal text-xs">(facultatif)</span></Label>
              <Input
                type="tel"
                value={form.holderPhone}
                onChange={e => setForm(p => ({ ...p, holderPhone: e.target.value }))}
                placeholder="+242 6 12 34 56 78"
              />
            </div>
            <div className="space-y-1">
              <Label>Catégorie du badge</Label>
              <Input
                value={form.categoryLabel}
                onChange={e => setForm(p => ({ ...p, categoryLabel: e.target.value }))}
                placeholder="ex: VIP, Staff, Presse, Artiste…"
              />
            </div>

            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Rattachement à un événement (facultatif)
              </p>
              {events.length > 0 ? (
                <div className="space-y-1">
                  <Label>Lier à un événement Feeti</Label>
                  <select
                    value={form.eventId}
                    onChange={e => setForm(p => ({ ...p, eventId: e.target.value, eventLabel: '' }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">— Aucun événement Feeti —</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                </div>
              ) : null}
              {!form.eventId && (
                <div className="space-y-1 mt-2">
                  <Label>Ou saisissez un intitulé libre</Label>
                  <Input
                    value={form.eventLabel}
                    onChange={e => setForm(p => ({ ...p, eventLabel: e.target.value }))}
                    placeholder="ex: Gala de fin d'année 2025"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setCreateOpen(false)} disabled={creating}>
                Annuler
              </Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleCreate} disabled={creating}>
                {creating ? (
                  <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Création…</span>
                ) : (
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Créer le badge</span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal QR agrandi */}
      {qrPreview && (
        <Dialog open={!!qrPreview} onOpenChange={() => setQrPreview(null)}>
          <DialogContent className="max-w-xs text-center">
            <DialogHeader>
              <DialogTitle>Badge — {qrPreview.holderName}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3 mt-2">
              <QRCodeSVG id={`qr-large-${qrPreview.id}`} value={qrPreview.qrCode} size={220} />
              <p className="text-sm text-gray-600">{categoryName(qrPreview)}</p>
              <p className="text-xs text-gray-400">{eventName(qrPreview)}</p>
              <Button variant="outline" className="w-full" onClick={() => downloadQr(qrPreview)}>
                <Download className="w-4 h-4 mr-2" /> Télécharger le QR
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
