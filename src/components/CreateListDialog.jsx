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
      <DialogContent className="max-w-md mx-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl text-right">רשימה חדשה</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            placeholder="שם הרשימה (למשל: קניות לשבת)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="h-14 rounded-xl text-lg"
            autoFocus
          />
          <Button
            onClick={handleCreate}
            className="w-full h-14 rounded-xl text-lg font-semibold"
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