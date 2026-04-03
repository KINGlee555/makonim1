import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

export default function QuickAddBar({ onQuickAdd, onOpenSearch }) {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    onQuickAdd(text.trim());
    setText("");
  };

  return (
    <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border p-4">
      <div className="max-w-lg mx-auto flex gap-2">
        <Button
          variant="outline"
          className="h-14 w-14 rounded-2xl flex-shrink-0 border-2 border-dashed border-primary/40 text-primary hover:bg-primary/10"
          onClick={onOpenSearch}
        >
          <Search className="w-6 h-6" />
        </Button>
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="הוסף מוצר מהר..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-14 rounded-2xl text-lg"
          />
          <Button
            onClick={handleAdd}
            className="h-14 w-14 rounded-2xl flex-shrink-0"
            disabled={!text.trim()}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}