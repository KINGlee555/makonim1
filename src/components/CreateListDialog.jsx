import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CreateListDialog({ open, onOpenChange, onCreate }) {
  const [title, setTitle] = useState("");

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreate(title.trim());
    setTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto rounded-3xl border-primary/15 p-6 shadow-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl text-right">רשימה חדשה</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            placeholder="שם הרשימה (למשל: קניות לשבת)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="h-14 rounded-2xl border-primary/20 bg-secondary/30 text-lg"
            maxLength={64}
            autoFocus
          />
          <Button
            onClick={handleCreate}
            className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg shadow-primary/20"
            disabled={!title.trim()}
          >
            <Plus className="w-5 h-5 ml-2" />
            צור רשימה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}