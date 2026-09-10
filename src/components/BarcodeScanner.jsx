import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanLine, Camera, X, Search } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function BarcodeScanner({ open, onOpenChange, onDetected }) {
  const t = useT();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [detected, setDetected] = useState("");
  const [manualCode, setManualCode] = useState("");

  const stopCamera = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(""); setDetected("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setScanning(true);
    } catch { setError(t("barcode.cameraError")); }
  }, [t]);

  useEffect(() => {
    if (!scanning || !("BarcodeDetector" in window)) return;
    detectorRef.current = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "code_128", "upc_a"] });
    let cancelled = false;
    const detect = async () => {
      if (cancelled || !videoRef.current || !detectorRef.current) return;
      try {
        const barcodes = await detectorRef.current.detect(videoRef.current);
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue;
          setDetected(code); stopCamera(); onDetected(code); return;
        }
      } catch {}
      if (!cancelled) rafRef.current = requestAnimationFrame(detect);
    };
    rafRef.current = requestAnimationFrame(detect);
    return () => { cancelled = true; if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [scanning, onDetected, stopCamera]);

  useEffect(() => {
    if (open) startCamera();
    return () => stopCamera();
  }, [open, startCamera, stopCamera]);

  const handleClose = (val) => { stopCamera(); onOpenChange(val); };
  const handleManualSearch = () => { if (manualCode.trim()) { onDetected(manualCode.trim()); setManualCode(""); } };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto overflow-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-start flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-primary" />{t("barcode.title")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative aspect-square bg-black rounded-2xl overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-32 border-2 border-white/70 rounded-2xl" />
            </div>
            {scanning && (
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">{t("barcode.scanning")}</span>
                <button onClick={stopCamera} className="bg-black/50 text-white p-1.5 rounded-full"><X className="w-4 h-4" /></button>
              </div>
            )}
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Button onClick={startCamera} className="bg-primary text-primary-foreground rounded-xl"><Camera className="w-5 h-5" />{t("barcode.startCamera")}</Button>
              </div>
            )}
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          {detected && (
            <div className="bg-primary/10 rounded-xl p-3 text-center">
              <p className="text-sm text-muted-foreground">{t("barcode.detected")}</p>
              <p className="text-lg font-bold text-primary font-mono">{detected}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-2">{t("barcode.manualDesc")}</p>
            <div className="flex gap-2">
              <Input placeholder={t("barcode.manualPlaceholder")} value={manualCode} onChange={e => setManualCode(e.target.value)} onKeyDown={e => e.key === "Enter" && handleManualSearch()} className="h-12 rounded-xl" />
              <Button onClick={handleManualSearch} className="h-12 w-12 rounded-xl p-0"><Search className="w-5 h-5" /></Button>
            </div>
          </div>
          {!("BarcodeDetector" in window) && <p className="text-xs text-muted-foreground text-center">{t("barcode.notSupported")}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}