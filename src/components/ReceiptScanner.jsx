import { useState, useRef } from "react";
import { ScanLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

export default function ReceiptScanner({ listId, onScanned }) {
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef(null);

  const handleScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setScanning(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  price: { type: "number" },
                  quantity: { type: "number" }
                },
                required: ["name", "price"]
              }
            },
            total: { type: "number" }
          },
          required: ["items"]
        }
      });

      const items = result.output?.items || [];
      if (items.length > 0) {
        const me = await base44.auth.me();
        await base44.entities.PurchaseHistory.bulkCreate(
          items.map(item => ({
            list_id: listId,
            item_name: item.name,
            price: item.price || 0,
            quantity: item.quantity || 1,
            category: "אחר",
            bought_by: me?.full_name || me?.email || "קבלה"
          }))
        );
        onScanned?.(items);
        toast({ title: `${items.length} פריטים נוספו מהקבלה`, duration: 2000 });
      } else {
        toast({ title: "לא זוהו פריטים בקבלה", variant: "destructive", duration: 2000 });
      }
    } catch {
      toast({ title: "שגיאה בסריקת הקבלה", variant: "destructive", duration: 2000 });
    } finally {
      setScanning(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleScan}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={scanning}
        onClick={() => inputRef.current?.click()}
        className="gap-2 rounded-xl"
      >
        {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
        סרוק קבלה
      </Button>
    </>
  );
}