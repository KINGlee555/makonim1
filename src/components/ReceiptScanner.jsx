import { useState, useRef } from "react";
import { ScanLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";

export default function ReceiptScanner({ listId, onScanned }) {
  const t = useT();
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef(null);

  const handleScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setScanning(true);
    try {
      // TODO: Upload the file to your new backend storage (e.g., Supabase Storage)
      // Then send the file URL to a cloud function that uses an LLM (like OpenAI/Gemini)
      // to extract a JSON of items: [{ name, price, quantity }, ...], total

      // Simulating network upload and LLM processing delay for now
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mocking the LLM result
      const mockResult = {
        items: [
          { name: "Mock Product 1", price: 10.5, quantity: 1 },
          { name: "Mock Product 2", price: 5.9, quantity: 2 }
        ],
        total: 22.3
      };

      const items = mockResult.items || [];
      if (items.length > 0) {
        // TODO: Fetch current user from your new auth provider
        const me = { full_name: "Test User", email: "test@example.com" }; // Mock user

        // TODO: Bulk create the purchase history records in your new backend database
        /*
        await newBackend.bulkCreatePurchaseHistory(
          items.map(item => ({
            list_id: listId,
            item_name: item.name,
            price: item.price || 0,
            quantity: item.quantity || 1,
            category: "Other",
            bought_by: me?.full_name || me?.email || "Receipt"
          }))
        );
        */

        onScanned?.(items);
        toast({ title: t("history.receiptScanned", { count: items.length }), duration: 2000 });
      } else {
        toast({ title: t("history.noItemsInReceipt"), variant: "destructive", duration: 2000 });
      }
    } catch {
      toast({ title: t("history.receiptError"), variant: "destructive", duration: 2000 });
    } finally {
      setScanning(false);
    }
  };

  return (
      <>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleScan} />
        <Button variant="outline" size="sm" disabled={scanning} onClick={() => inputRef.current?.click()} className="gap-2 rounded-xl">
          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
          {t("receipt.scan")}
        </Button>
      </>
  );
}