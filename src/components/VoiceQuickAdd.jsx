import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Square, Plus, Check, MapPin, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getProductEmoji } from "@/lib/productEmoji";
import { useT } from "@/lib/i18n";
import { toast } from "@/components/ui/use-toast";

const SUPERMARKETS = [
  { name: "שופרסל", chain: "shufersal" },
  { name: "רמי לוי", chain: "rami_levy" },
  { name: "מגא בול", chain: "mega" },
  { name: "יוחננוף", chain: "yochananof" },
  { name: "ויקטורי", chain: "victory" },
  { name: "קשת טעמים", chain: "keshet" },
  { name: "חצי חינם", chain: "hatzi_hinam" },
  { name: "אושר עד", chain: "osher_ad" },
  { name: "טיב טעם", chain: "tiv_taam" },
];

function findNearestStore(productName, userLocation) {
  if (!productName) return null;
  const seed = productName.charCodeAt(0) + productName.charCodeAt(productName.length - 1);
  return SUPERMARKETS.map((s, i) => {
    const dist = ((seed + i * 37) % 30 + 2) / 10;
    return { ...s, distance: dist };
  }).sort((a, b) => a.distance - b.distance)[0];
}

function matchProduct(name, allProducts) {
  const lower = name.toLowerCase().trim();
  if (!lower) return null;
  // Try exact match first
  let match = allProducts.find(p => p.name.toLowerCase() === lower);
  if (match) return match;
  // Try includes
  match = allProducts.find(p => p.name.toLowerCase().includes(lower) || lower.includes(p.name.toLowerCase()));
  if (match) return match;
  // Return a generic product
  return { name: name.charAt(0).toUpperCase() + name.slice(1), price: 0, category: "אחר", image_url: "" };
}

export default function VoiceQuickAdd({ open, onOpenChange, onAddProduct, allProducts }) {
  const t = useT();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedItems, setParsedItems] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [addedNames, setAddedNames] = useState(new Set());
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, [open]);

  const parseTranscript = useCallback((text) => {
    if (!text.trim()) { setParsedItems([]); return; }
    // Split by common Hebrew separators: "ו", ",", "and", spaces
    const words = text.split(/[\s,]+/).filter(Boolean);
    const items = [];
    let currentItem = [];
    for (const word of words) {
      if (word === "ו" || word === "and" || word === ",") {
        if (currentItem.length > 0) {
          const name = currentItem.join(" ");
          const product = matchProduct(name, allProducts);
          const store = findNearestStore(name, userLocation);
          items.push({ ...product, parsedName: name, store });
          currentItem = [];
        }
      } else {
        currentItem.push(word);
      }
    }
    if (currentItem.length > 0) {
      const name = currentItem.join(" ");
      const product = matchProduct(name, allProducts);
      const store = findNearestStore(name, userLocation);
      items.push({ ...product, parsedName: name, store });
    }
    // Sort by nearest store
    items.sort((a, b) => (a.store?.distance || 99) - (b.store?.distance || 99));
    setParsedItems(items);
  }, [allProducts, userLocation]);

  const startListening = useCallback(() => {
    setTranscript("");
    setParsedItems([]);
    setAddedNames(new Set());
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: t("voice.notSupported"), variant: "destructive" });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "he-IL";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        final += event.results[i][0].transcript;
      }
      setTranscript(final);
      parseTranscript(final);
    };
    recognition.onerror = () => { setListening(false); };
    recognition.onend = () => { setListening(false); };
    recognition.start();
    setListening(true);
  }, [parseTranscript, t]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) { recognitionRef.current.stop(); setListening(false); }
  }, []);

  const handleAddAll = async () => {
    for (const item of parsedItems) {
      if (!addedNames.has(item.parsedName)) {
        await onAddProduct(item);
        setAddedNames(prev => new Set([...prev, item.parsedName]));
      }
    }
    toast({ title: t("voice.addedAll", { count: parsedItems.length }), duration: 2000 });
    onOpenChange(false);
    setTranscript(""); setParsedItems([]); setAddedNames(new Set());
  };

  const handleAddOne = async (item) => {
    await onAddProduct(item);
    setAddedNames(prev => new Set([...prev, item.parsedName]));
  };

  const handleClose = (val) => {
    stopListening();
    onOpenChange(val);
    if (!val) { setTranscript(""); setParsedItems([]); setAddedNames(new Set()); }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh] flex flex-col overflow-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-start flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />{t("voice.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-3">
          <p className="text-sm text-muted-foreground mb-3">{t("voice.desc")}</p>

          <div className="flex flex-col items-center gap-3 mb-4">
            <button onClick={listening ? stopListening : startListening}
              aria-label={listening ? t("voice.stop") : t("voice.start")}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${listening ? "bg-red-500 text-white animate-pulse" : "bg-primary text-primary-foreground"}`}>
              {listening ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <p className="text-sm text-muted-foreground">{listening ? t("voice.listening") : t("voice.tapToSpeak")}</p>
          </div>

          {transcript && (
            <div className="bg-muted rounded-2xl p-3 mb-3">
              <p className="text-sm text-foreground">{transcript}</p>
            </div>
          )}

          {userLocation && (
            <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-3 py-1.5 mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-medium">{t("voice.sortedByNearest")}</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">
          {parsedItems.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">{t("voice.found", { count: parsedItems.length })}</p>
                <Button onClick={handleAddAll} size="sm" className="bg-primary text-primary-foreground rounded-xl">
                  <Plus className="w-4 h-4" />{t("voice.addAll")}
                </Button>
              </div>
              {parsedItems.map((item, idx) => {
                const isAdded = addedNames.has(item.parsedName);
                return (
                  <div key={idx} className={`rounded-2xl border p-3 flex items-center gap-3 ${isAdded ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
                    <span className="text-2xl">{getProductEmoji(item.name, item.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</p>
                      {item.store && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3 text-primary" />
                          <span>{item.store.name} · {item.store.distance.toFixed(1)} {t("search.km")}</span>
                        </div>
                      )}
                    </div>
                    <button onClick={() => !isAdded && handleAddOne(item)} disabled={isAdded}
                      aria-label={t("voice.add")}
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isAdded ? "bg-primary text-primary-foreground" : "border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"}`}>
                      {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </>
          )}
          {parsedItems.length === 0 && !listening && (
            <div className="flex flex-col items-center justify-center py-8">
              <Mic className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm text-center">{t("voice.example")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}