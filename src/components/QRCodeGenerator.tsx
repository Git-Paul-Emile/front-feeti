import { forwardRef, useImperativeHandle, useRef, useEffect, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export interface QRCodeGeneratorHandle {
  getDataUrl: () => string | null;
}

export const QRCodeGenerator = forwardRef<QRCodeGeneratorHandle, QRCodeGeneratorProps>(
  ({ value, size = 120, className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      getDataUrl: () => canvasRef.current?.toDataURL('image/png') ?? null,
    }));

    return (
      <div className={`inline-block ${className}`}>
        <QRCodeCanvas
          value={value}
          size={size}
          ref={canvasRef}
          className="border border-gray-200 rounded"
        />
      </div>
    );
  }
);

QRCodeGenerator.displayName = 'QRCodeGenerator';

/**
 * Génère un data URL PNG du QR code pour usage hors React (PDF, canvas).
 * Utilise QRCodeCanvas dans un conteneur temporaire.
 * Les effets enfants (QRCodeCanvas) s'exécutent avant l'effet parent (Capturer),
 * garantissant que le canvas est dessiné quand on lit le data URL.
 */
export function generateQRDataUrl(value: string, size = 200): Promise<string> {
  return new Promise((resolve) => {
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:-9999px;left:-9999px;pointer-events:none';
    document.body.appendChild(div);

    const root = createRoot(div);
    let settled = false;

    const settle = (dataUrl: string) => {
      if (settled) return;
      settled = true;
      resolve(dataUrl);
      // Nettoyage différé pour ne pas unmount pendant le rendu
      setTimeout(() => {
        root.unmount();
        div.remove();
      }, 0);
    };

    // Capturer enveloppe QRCodeCanvas. React garantit que les effets des enfants
    // s'exécutent avant ceux du parent, donc le canvas est dessiné quand on lit.
    function Capturer() {
      const ref = useRef<HTMLCanvasElement>(null);
      useEffect(() => {
        if (ref.current) settle(ref.current.toDataURL('image/png'));
      });
      return createElement(QRCodeCanvas, { value, size, ref });
    }

    root.render(createElement(Capturer));
  });
}
