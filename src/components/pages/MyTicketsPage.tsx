import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowLeft, Ticket, Calendar, MapPin, Clock, Download, QrCode, RefreshCw } from 'lucide-react';
import { QRCodeGenerator, generateQRDataUrl } from '../QRCodeGenerator';
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
  valid:   { label: 'Valide',   color: 'bg-green-100 text-green-800' },
  used:    { label: 'Utilisé',  color: 'bg-gray-100 text-gray-600' },
  expired: { label: 'Expiré',   color: 'bg-red-100 text-red-700' },
};

export function MyTicketsPage({ onBack }: MyTicketsPageProps) {
  const [tickets, setTickets] = useState<BackendTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await TicketAPI.getMyTickets();
      setTickets(data);
    } catch {
      toast.error('Impossible de charger vos billets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const handleDownloadPDF = (ticket: BackendTicket) => {
    const qrDataUrl = generateQRDataUrl(ticket.qrData, 200);
    const event = ticket.event;
    const printContent = `
      <html>
      <head>
        <title>Billet - ${event?.title ?? ''}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
          .ticket { max-width: 580px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,.15); }
          .header { background: linear-gradient(135deg, #4338ca, #059669); color: white; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0 0 6px 0; font-size: 22px; }
          .header p { margin: 0; opacity: .85; font-size: 14px; }
          .body { padding: 24px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
          .item { background: #f3f4f6; border-radius: 8px; padding: 12px; }
          .item .label { font-size: 11px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: .05em; }
          .item .value { font-weight: 700; font-size: 14px; color: #111; }
          .qr { border-top: 2px dashed #e5e7eb; margin-top: 16px; padding-top: 20px; text-align: center; }
          .qr p { margin: 10px 0 0; font-size: 12px; color: #6b7280; }
          @media print { body { background: white; } .ticket { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <h1>${event?.title ?? 'Événement'}</h1>
            <p>Billet ${ticket.category} — N° ${ticket.id.slice(-8).toUpperCase()}</p>
          </div>
          <div class="body">
            <div class="grid">
              <div class="item"><div class="label">Date</div><div class="value">${event?.date ? formatDate(event.date) : '—'}</div></div>
              <div class="item"><div class="label">Heure</div><div class="value">${event?.time ?? '—'}</div></div>
              <div class="item"><div class="label">Lieu</div><div class="value">${event?.location ?? '—'}</div></div>
              <div class="item"><div class="label">Prix</div><div class="value">${formatPrice(ticket.price, ticket.currency)}</div></div>
              <div class="item"><div class="label">Porteur</div><div class="value">${ticket.holderName}</div></div>
              <div class="item"><div class="label">Email</div><div class="value">${ticket.holderEmail}</div></div>
            </div>
            <div class="qr">
              <strong>QR Code d'entrée</strong>
              <img src="${qrDataUrl}" width="180" height="180" style="display:block;margin:12px auto 0" alt="QR Code" />
              <p>Présentez ce billet à l'entrée de l'événement</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.print();
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
                  {/* Top band */}
                  <div className={`h-1.5 w-full ${ticket.status === 'valid' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-300'}`} />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{ev?.title ?? 'Événement'}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Billet {ticket.category} — N° {ticket.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <Badge className={s.color}>{s.label}</Badge>
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
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                      >
                        <QrCode className="w-4 h-4" />
                        {isExpanded ? 'Masquer QR' : 'Voir QR code'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => handleDownloadPDF(ticket)}
                      >
                        <Download className="w-4 h-4" />
                        Télécharger PDF
                      </Button>
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
    </div>
  );
}
