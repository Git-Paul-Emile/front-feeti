import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowLeft, Ticket, Calendar, MapPin, Clock, Download, QrCode, RefreshCw, RotateCcw, X } from 'lucide-react';
import { QRCodeGenerator, generateQRDataUrl } from '../QRCodeGenerator';
import { buildTicketCanvas } from '../TicketPDFGenerator';
import jsPDF from 'jspdf';
import TicketAPI, { type BackendTicket } from '../../services/api/TicketAPI';
import { toast } from 'sonner@2.0.3';

interface MyTicketsPageProps {
  onBack: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

function formatPrice(price: number, currency: string) {
  if (currency === 'FCFA') return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  valid:            { label: 'Valide',              color: 'bg-green-100 text-green-800' },
  used:             { label: 'Utilisé',             color: 'bg-gray-100 text-gray-600' },
  expired:          { label: 'Expiré',              color: 'bg-red-100 text-red-700' },
  refund_requested: { label: 'Remboursement demandé', color: 'bg-orange-100 text-orange-800' },
  refunded:         { label: 'Remboursé',           color: 'bg-blue-100 text-blue-800' },
};

export function MyTicketsPage({ onBack }: MyTicketsPageProps) {
  const [tickets, setTickets] = useState<BackendTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refundModal, setRefundModal] = useState<{ ticketId: string; eventTitle: string } | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);

  const loadTickets = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await TicketAPI.getMyTickets();
      setTickets(data);
    } catch {
      if (!silent) toast.error('Impossible de charger vos billets');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const handleRequestRefund = async () => {
    if (!refundModal || !refundReason.trim()) return;
    setRefundLoading(true);
    try {
      await TicketAPI.requestRefund(refundModal.ticketId, refundReason.trim());
      toast.success('Demande de remboursement envoyée. Délai de traitement : 5 à 7 jours ouvrables.');
      setRefundModal(null);
      setRefundReason('');
      // Rechargement depuis le serveur pour avoir l'état confirmé
      await loadTickets(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Impossible d\'envoyer la demande de remboursement');
    } finally {
      setRefundLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    // Recharger silencieusement quand l'utilisateur revient sur l'onglet (ex: après un achat)
    const onVisible = () => { if (document.visibilityState === 'visible') loadTickets(true); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loadTickets]);

  const handleDownloadPDF = async (ticket: BackendTicket) => {
    const ev = ticket.event;
    const qrCode = generateQRDataUrl(ticket.qrData, 300);
    try {
      const mapped = {
        id: ticket.id,
        orderId: ticket.orderId,
        eventId: ticket.eventId,
        eventTitle: ev?.title ?? 'Événement',
        eventDate: ev?.date ?? '',
        eventTime: ev?.time ?? '',
        eventLocation: ev?.location ?? '',
        eventImage: ev?.image ?? '',
        category: ticket.category,
        price: ticket.price,
        currency: ticket.currency,
        holderName: ticket.holderName,
        holderEmail: ticket.holderEmail,
        qrCode,
        status: ticket.status as 'valid' | 'used' | 'expired',
        purchaseDate: ticket.createdAt ?? new Date().toISOString(),
        timestamp: Date.now(),
        signature: '',
      };
      const canvas = await buildTicketCanvas(mapped);
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const ratio = Math.min((pageW - margin * 2) / canvas.width, (pageH - margin * 2) / canvas.height);
      const imgW = canvas.width * ratio;
      const imgH = canvas.height * ratio;
      pdf.addImage(imgData, 'JPEG', (pageW - imgW) / 2, (pageH - imgH) / 2, imgW, imgH);
      pdf.save(`billet-${(ev?.title ?? 'ticket').replace(/\s+/g, '-')}-${ticket.id.slice(-8)}.pdf`);
    } catch {
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const statusInfo = (status: string) => STATUS_LABELS[status] ?? { label: status, color: 'bg-gray-100 text-gray-600' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-600" />
            Mes billets
          </h1>
          <Button variant="outline" size="sm" onClick={loadTickets} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600" />
          </div>
        ) : tickets.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucun billet</h2>
              <p className="text-gray-500">Vous n'avez pas encore acheté de billets.</p>
              <Button className="mt-6" onClick={onBack}>Explorer les événements</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{tickets.length} billet{tickets.length > 1 ? 's' : ''}</p>
            {tickets.map(ticket => {
              const ev = ticket.event;
              const s = statusInfo(ticket.status);
              const isExpanded = expandedId === ticket.id;
              return (
                <Card key={ticket.id} className={`overflow-hidden border-2 transition-all ${ticket.status === 'valid' ? 'border-indigo-200' : 'border-gray-200'}`}>
                  {/* Event image banner */}
                  {ev?.image ? (
                    <div className="relative h-28 overflow-hidden">
                      <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-2">
                        <p className="text-white font-semibold text-sm truncate">{ev.title}</p>
                        <Badge className={s.color + ' shrink-0'}>{s.label}</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className={`h-1.5 w-full ${ticket.status === 'valid' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-300'}`} />
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        {!ev?.image && <CardTitle className="text-base truncate">{ev?.title ?? 'Événement'}</CardTitle>}
                        <p className="text-sm text-gray-500 mt-1">
                          Billet {ticket.category} — N° {ticket.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      {!ev?.image && <Badge className={s.color}>{s.label}</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Event info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      {ev?.date && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{formatDate(ev.date)}</span>
                        </div>
                      )}
                      {ev?.time && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>{ev.time}</span>
                        </div>
                      )}
                      {ev?.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span>{ev.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-indigo-700">{formatPrice(ticket.price, ticket.currency)}</span>
                      <span className="text-gray-500">{ticket.holderName}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {ticket.status === 'valid' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                        >
                          <QrCode className="w-4 h-4" />
                          {isExpanded ? 'Masquer QR' : 'Voir QR code'}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => handleDownloadPDF(ticket)}
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </Button>
                      {ticket.status === 'valid' && ev?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                          onClick={() => onBack()}
                        >
                          <Ticket className="w-4 h-4" />
                          Achat supplémentaire
                        </Button>
                      )}
                      {(ticket.status === 'valid') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => { setRefundModal({ ticketId: ticket.id, eventTitle: ev?.title ?? 'cet événement' }); setRefundReason(''); }}
                        >
                          <RotateCcw className="w-4 h-4" />
                          Remboursement
                        </Button>
                      )}
                      {ticket.status === 'refund_requested' && ticket.refundRequestedAt && (
                        <p className="text-xs text-orange-600 w-full mt-1">
                          Demande envoyée le {new Date(ticket.refundRequestedAt).toLocaleDateString('fr-FR')} — Traitement sous 5 à 7 jours ouvrables
                        </p>
                      )}
                    </div>

                    {/* QR code expanded */}
                    {isExpanded && (
                      <div className="border-t-2 border-dashed border-gray-200 pt-4 flex flex-col items-center gap-3">
                        <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <QrCode className="w-4 h-4" /> QR Code d'entrée
                        </p>
                        <div className="bg-white p-3 rounded-lg border shadow-sm">
                          <QRCodeGenerator value={ticket.qrData} size={160} />
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Présentez ce QR code à l'entrée de l'événement
                        </p>
                        {ticket.status === 'used' && ticket.usedAt && (
                          <p className="text-xs text-orange-600 font-medium">
                            Utilisé le {new Date(ticket.usedAt).toLocaleString('fr-FR')}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal remboursement */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Demande de remboursement</h2>
                <p className="text-sm text-gray-500 mt-1">{refundModal.eventTitle}</p>
              </div>
              <button onClick={() => setRefundModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-800">
                <strong>Délai de traitement :</strong> 5 à 7 jours ouvrables après validation de votre demande.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Raison du remboursement <span className="text-red-500">*</span>
              </label>
              <textarea
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                placeholder="Expliquez la raison de votre demande de remboursement..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setRefundModal(null)}
                disabled={refundLoading}
              >
                Annuler
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleRequestRefund}
                disabled={refundLoading || !refundReason.trim()}
              >
                {refundLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-2" />
                )}
                Envoyer la demande
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
