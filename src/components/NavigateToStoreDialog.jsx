import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Car, PersonStanding, Loader2 } from "lucide-react";

const SUPERMARKETS = [
  "שופרסל",
  "רמי לוי",
  "מגא בול",
  "יוחננוף",
  "ויקטורי",
  "חצי חינם",
];

function getNearestStore(productName) {
  const seed = productName.charCodeAt(0);
  return SUPERMARKETS[seed % SUPERMARKETS.length];
}

export default function NavigateToStoreDialog({ open, onOpenChange, product }) {
  const [loading, setLoading] = useState(false);

  const navigate = (mode) => {
    setLoading(true);
    const store = getNearestStore(product?.name || "");
    const travelMode = mode === "walk" ? "walking" : "driving";
    const destination = encodeURIComponent(`${store} סופרמרקט`);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destination}&travelmode=${travelMode}`;
          window.open(url, "_blank");
          setLoading(false);
          onOpenChange(false);
        },
        () => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=${travelMode}`;
          window.open(url, "_blank");
          setLoading(false);
          onOpenChange(false);
        }
      );
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=${travelMode}`;
      window.open(url, "_blank");
      setLoading(false);
      onOpenChange(false);
    }
  };

  const store = product ? getNearestStore(product.name) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-right">ניווט לסופר</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="bg-primary/8 rounded-2xl p-4 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">הסופר המומלץ עבור</p>
              <p className="font-bold text-foreground">{product?.name}</p>
              <p className="text-primary font-semibold text-sm mt-0.5">🏪 {store}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">איך תרצה להגיע?</p>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => navigate("walk")}
              disabled={loading}
              variant="outline"
              className="h-20 flex-col gap-2 rounded-2xl border-2 hover:border-primary hover:bg-primary/5"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <PersonStanding className="w-6 h-6 text-primary" />}
              <span className="font-semibold">ברגל</span>
            </Button>
            <Button
              onClick={() => navigate("drive")}
              disabled={loading}
              className="h-20 flex-col gap-2 rounded-2xl bg-primary hover:bg-primary/90"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Car className="w-6 h-6" />}
              <span className="font-semibold">בנסיעה</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}