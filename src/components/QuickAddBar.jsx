import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function QuickAddBar({ onOpenSearch }) {
  return (
    <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border p-4">
      <div className="max-w-lg mx-auto">
        <Button
          className="w-full h-14 rounded-2xl text-lg gap-3"
          onClick={onOpenSearch}
        >
          <Search className="w-6 h-6" />
          חפש וגלה מוצרים
        </Button>
      </div>
    </div>
  );
}