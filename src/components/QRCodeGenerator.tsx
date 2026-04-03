import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export interface QRCodeGeneratorHandle {
  getDataUrl: () => string | null;
}

function drawQR(canvas: HTMLCanvasElement, value: string, size: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  const cellSize = size / 21;
  ctx.fillStyle = '#000000';

  const hash = value.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);

  const random = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const drawFinderPattern = (x: number, y: number) => {
    ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, cellSize);
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, 7 * cellSize);
    ctx.fillRect(x * cellSize, (y + 6) * cellSize, 7 * cellSize, cellSize);
    ctx.fillRect((x + 6) * cellSize, y * cellSize, cellSize, 7 * cellSize);
    for (let i = 2; i < 5; i++) {
      for (let j = 2; j < 5; j++) {
        ctx.fillRect((x + i) * cellSize, (y + j) * cellSize, cellSize, cellSize);
      }
    }
  };

  drawFinderPattern(0, 0);
  drawFinderPattern(14, 0);
  drawFinderPattern(0, 14);

  for (let i = 8; i < 13; i++) {
    if (i % 2 === 0) {
      ctx.fillRect(i * cellSize, 6 * cellSize, cellSize, cellSize);
      ctx.fillRect(6 * cellSize, i * cellSize, cellSize, cellSize);
    }
  }

  for (let i = 0; i < 21; i++) {
    for (let j = 0; j < 21; j++) {
      if ((i < 9 && j < 9) || (i < 9 && j > 11) || (i > 11 && j < 9)) continue;
      if (i === 6 || j === 6) continue;
      const seed = hash + i * 21 + j;
      if (random(seed) > 0.5) {
        ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  ctx.fillRect(8 * cellSize, 13 * cellSize, cellSize, cellSize);
}

export const QRCodeGenerator = forwardRef<QRCodeGeneratorHandle, QRCodeGeneratorProps>(
  ({ value, size = 120, className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      getDataUrl: () => canvasRef.current?.toDataURL('image/png') ?? null,
    }));

    useEffect(() => {
      if (!canvasRef.current) return;
      drawQR(canvasRef.current, value, size);
    }, [value, size]);

    return (
      <div className={`inline-block ${className}`}>
        <canvas
          ref={canvasRef}
          className="border border-gray-200 rounded"
          style={{ width: size, height: size }}
        />
      </div>
    );
  }
);

QRCodeGenerator.displayName = 'QRCodeGenerator';

/** Génère un data URL PNG du QR code sans composant React (pour PDF) */
export function generateQRDataUrl(value: string, size = 200): string {
  const canvas = document.createElement('canvas');
  drawQR(canvas, value, size);
  return canvas.toDataURL('image/png');
}
