"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ScannerState = "idle" | "requesting" | "scanning" | "detected" | "error";

export function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);
  const activeRef = useRef(false); // クロージャー内で参照する停止フラグ
  const [state, setState] = useState<ScannerState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [hasBarcodeDetector, setHasBarcodeDetector] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasBarcodeDetector("BarcodeDetector" in window);
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCamera = useCallback(() => {
    activeRef.current = false;
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startScan = useCallback(async () => {
    setState("requesting");
    setErrorMsg("");
    activeRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState("scanning");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = new (window as any).BarcodeDetector({
        formats: ["qr_code"],
      });

      const detect = async () => {
        if (!activeRef.current || !videoRef.current) return;
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const rawValue: string = barcodes[0].rawValue;
            setState("detected");
            stopCamera();
            try {
              const url = new URL(rawValue);
              router.push(url.pathname + url.search);
            } catch {
              setErrorMsg(`読み取り値: ${rawValue}`);
              setState("error");
            }
          } else {
            animRef.current = requestAnimationFrame(detect);
          }
        } catch {
          if (activeRef.current) {
            animRef.current = requestAnimationFrame(detect);
          }
        }
      };

      animRef.current = requestAnimationFrame(detect);
    } catch (e) {
      activeRef.current = false;
      const msg =
        e instanceof Error ? e.message : "カメラにアクセスできませんでした";
      setErrorMsg(msg);
      setState("error");
    }
  }, [router, stopCamera]);

  const handleStop = useCallback(() => {
    stopCamera();
    setState("idle");
  }, [stopCamera]);

  if (!hasBarcodeDetector) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="text-4xl">📷</div>
        <h2 className="text-base font-semibold">
          スマートフォンのカメラで読み取る
        </h2>
        <div className="text-sm text-muted-foreground space-y-2 text-left max-w-xs mx-auto">
          <p>このブラウザはカメラスキャンに対応していません。</p>
          <p>以下の方法でQRコードを読み取ってください：</p>
          <ol className="list-decimal list-inside space-y-1.5 mt-3">
            <li>
              スマートフォンの <strong>カメラアプリ</strong> を開く
            </li>
            <li>備品に貼ったQRコードに向ける</li>
            <li>表示されたリンクをタップする</li>
          </ol>
        </div>
        <p className="text-xs text-muted-foreground">
          対応ブラウザ: Chrome (Android/PC), Safari (iOS 17+)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {state === "idle" && (
        <div className="text-center space-y-4 py-4">
          <div className="text-5xl">🔍</div>
          <p className="text-sm text-muted-foreground">
            カメラでQRコードを読み取ります
          </p>
          <Button
            onClick={startScan}
            className="w-full max-w-xs mx-auto block"
          >
            スキャンを開始する
          </Button>
        </div>
      )}

      {state === "requesting" && (
        <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">
          カメラを起動しています...
        </div>
      )}

      {(state === "scanning" || state === "detected") && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-square max-w-sm mx-auto">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-white/70 rounded-lg" />
            </div>
            {state === "detected" && (
              <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  ✓ 読み取り完了
                </span>
              </div>
            )}
          </div>
          {state === "scanning" && (
            <Button
              variant="outline"
              onClick={handleStop}
              className="w-full max-w-sm mx-auto block"
            >
              キャンセル
            </Button>
          )}
        </div>
      )}

      {state === "error" && (
        <div className="text-center space-y-4 py-4">
          <div className="text-4xl">⚠️</div>
          <p className="text-sm text-destructive">{errorMsg}</p>
          <Button
            onClick={() => setState("idle")}
            variant="outline"
            className="w-full max-w-xs mx-auto block"
          >
            もう一度試す
          </Button>
        </div>
      )}
    </div>
  );
}
