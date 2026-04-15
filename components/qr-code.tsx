"use client";

import { useEffect, useRef, useState } from "react";

interface QrCodeProps {
  value: string;
  size?: number;
}

export function QrCode({ value, size = 200 }: QrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    // qrcode ライブラリを動的インポート
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(value, { width: size, margin: 2 }).then((url) => {
        setImgSrc(url);
      });
    });
  }, [value, size]);

  return (
    <div className="inline-flex flex-col items-center gap-2">
      {imgSrc ? (
        <img
          src={imgSrc}
          alt="QR Code"
          width={size}
          height={size}
          className="rounded-md border border-border"
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="bg-muted rounded-md animate-pulse"
        />
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
