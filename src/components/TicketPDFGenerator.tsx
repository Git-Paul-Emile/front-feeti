import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { generateQRDataUrl } from './QRCodeGenerator';
import jsPDF from 'jspdf';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – fichier SVG importé comme URL Vite
import ticketTemplate from '../assets/ticket modele2.svg?url';

interface Ticket {
  id: string;
  orderId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventImage: string;
  category: string;
  price: number;
  currency: string;
  holderName: string;
  holderEmail: string;
  qrCode: string;
  status: 'valid' | 'used' | 'expired';
  purchaseDate: string;
  timestamp: number;
  signature: string;
}

interface TicketPDFGeneratorProps {
  ticket: Ticket;
  onDownload?: () => void;
}

// Dimensions réelles du template
const W = 1659;
const H = 704;

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr));
}

function formatPrice(price: number, currency: string) {
  if (currency === 'FCFA') return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function buildTicketCanvas(ticket: Ticket): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // 1. Fond : template modele2 — libellés déjà en place, zones de données vides
  const bg = await loadImage(ticketTemplate);
  ctx.drawImage(bg, 0, 0, W, H);

  // Helper texte
  const txt = (
    text: string, x: number, y: number,
    font: string, color = '#1a1a2e', align: CanvasTextAlign = 'left',
  ) => {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align;
    ctx.fillText(text, x, y);
  };

  const shortId = ticket.id.slice(-8).toUpperCase();

  // ── 2. IMAGE ÉVÉNEMENT ───────────────────────────────────────────────────
  // Cadre exact mesuré dans le template : x=83 y=103 w=393 h=489
  // Image réduite de 65px et centrée dans le cadre
  if (ticket.eventImage) {
    try {
      const evImg = await loadImage(ticket.eventImage);
      const fw = 393 - 65, fh = 489 - 65;            // 328 × 424
      const imgX = 83  + Math.round((393 - fw) / 2); // 83 + 32 = 115
      const imgY = 103 + Math.round((489 - fh) / 2); // 103 + 32 = 135
      ctx.save();
      ctx.beginPath();
      ctx.rect(imgX, imgY, fw, fh);
      ctx.clip();
      const ratio = Math.max(fw / evImg.width, fh / evImg.height);
      const dw = evImg.width * ratio, dh = evImg.height * ratio;
      ctx.drawImage(evImg, imgX + (fw - dw) / 2, imgY + (fh - dh) / 2, dw, dh);
      ctx.restore();
    } catch { /* image non accessible */ }
  }

  // ── 3. DONNÉES PANNEAU CENTRAL ──────────────────────────────────────────
  // Titre de l'événement (espace libre au-dessus de la ligne "Billet:")
  ctx.font = 'bold 30px Arial';
  ctx.fillStyle = '#1a1a2e';
  ctx.textAlign = 'center';
  let title = ticket.eventTitle;
  while (ctx.measureText(title).width > 700 && title.length > 5) title = title.slice(0, -1);
  if (title !== ticket.eventTitle) title += '…';
  ctx.fillText(title, 795, 175);

  // Catégorie : sous le libellé "Billet:" (y≈213), alignée à gauche avec les autres valeurs
  txt(ticket.category, 718, 213, '17px Arial', '#1a1a2e', 'left');
  // N° de billet (ticket number) : reste inline après "N°" — exception
  txt(shortId, 965, 213, '17px Arial', '#4a3a6e', 'left');

  // Valeur DATE (le libellé DATE est en y≈225 dans le template, valeur en dessous)
  txt(formatDate(ticket.eventDate), 503, 337, 'bold 15px Arial');

  // Valeur HEURE (libellé HEURE: sur la même ligne, valeur à droite)
  txt(ticket.eventTime, 820, 337, 'bold 21px Arial');

  // Valeur LIEU (libellé LIEU en y≈290 dans le template, valeur en dessous)
  ctx.font = 'bold 15px Arial'; ctx.fillStyle = '#1a1a2e'; ctx.textAlign = 'left';
  let loc = ticket.eventLocation;
  while (ctx.measureText(loc).width > 270 && loc.length > 4) loc = loc.slice(0, -1);
  if (loc !== ticket.eventLocation) loc += '…';
  ctx.fillText(loc, 503, 404);

  // Valeur PRIX (libellé PRIX sur la même ligne que LIEU, à droite)
  txt(formatPrice(ticket.price, ticket.currency), 820, 404, 'bold 17px Arial', '#cc0055');

  // Valeur PORTEUR (libellé PORTEUR en y≈357 dans le template)
  ctx.font = 'bold 17px Arial'; ctx.fillStyle = '#1a1a2e'; ctx.textAlign = 'left';
  let holder = ticket.holderName;
  while (ctx.measureText(holder).width > 660 && holder.length > 4) holder = holder.slice(0, -1);
  if (holder !== ticket.holderName) holder += '…';
  ctx.fillText(holder, 503, 467);

  // Valeur EMAIL (libellé EMAIL en y≈420 dans le template)
  txt(ticket.holderEmail, 503, 530, '14px Arial');

  // N° en bas : valeur placée juste après le libellé "N°:" dans le template de chaque panneau
  // Gauche : N°: se termine ≈x=175, gap 30px → 205 | Milieu : ≈x=825 → 855 | Droite : ≈x=1448 → 1478
  txt(shortId,  205, 621, 'bold 12px Arial', '#555566', 'left');
  txt(shortId,  750, 621, 'bold 12px Arial', '#555566', 'left');
  txt(shortId, 1335, 621, 'bold 12px Arial', '#555566', 'left');

  // ── 4. QR CODE dans le cadre du stub droit ────────────────────────────────
  // Cadre : x=1241 y=185 w=340 h=384 — QR réduit de 65px, centré dans le cadre
  const qrSize = 337 - 65;                                        // 272
  const qrX = 1220 + Math.round((340 - qrSize) / 2);             // 1230+170 = 1400
  const qrY = 185  + Math.round((384 - qrSize) / 2);             // 185+192 = 377
  const qrDataUrl = generateQRDataUrl(ticket.qrCode, qrSize);
  const qrImg = await loadImage(qrDataUrl);
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  return canvas;
}

export function TicketPDFGenerator({ ticket, onDownload }: TicketPDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Rendu de l'aperçu dans le canvas React
  useEffect(() => {
    if (!canvasRef.current) return;
    buildTicketCanvas(ticket).then((offscreen) => {
      const ctx = canvasRef.current!.getContext('2d')!;
      canvasRef.current!.width = offscreen.width;
      canvasRef.current!.height = offscreen.height;
      ctx.drawImage(offscreen, 0, 0);
    });
  }, [ticket]);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const canvas = await buildTicketCanvas(ticket);
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      // Format A4 paysage, unité mm
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      // Ajuster l'image pour tenir dans la page avec marges
      const margin = 10;
      const maxW = pageW - margin * 2;
      const maxH = pageH - margin * 2;
      const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
      const imgW = canvas.width * ratio;
      const imgH = canvas.height * ratio;
      const x = (pageW - imgW) / 2;
      const y = (pageH - imgH) / 2;
      pdf.addImage(imgData, 'JPEG', x, y, imgW, imgH);
      pdf.save(`billet-${ticket.eventTitle.replace(/\s+/g, '-')}-${ticket.id.slice(-8)}.pdf`);
      onDownload?.();
    } catch (err) {
      console.error('Erreur génération billet:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Aperçu */}
      <div className="overflow-auto rounded-lg border shadow-sm bg-gray-50 p-2">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }}
        />
      </div>

      {/* Bouton téléchargement */}
      <Button
        onClick={handleDownload}
        disabled={isGenerating}
        className="w-full flex items-center justify-center space-x-2"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            <span>Génération…</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Télécharger le billet (PDF)</span>
          </>
        )}
      </Button>
    </div>
  );
}
