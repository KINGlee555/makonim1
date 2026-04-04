import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ProfileDialog({ open, onOpenChange, currentUser, onNameUpdated }) {
  const [name, setName] = useState(currentUser?.full_name || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await base44.auth.updateMe({ full_name: name.trim() });
    onNameUpdated(name.trim());
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl text-right">השם שלי ברשימה</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 bg-muted rounded-2xl p-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">כך ייראה שמך לשאר המשתתפים</p>
              <p className="text-base font-semibold">{name || "שם לא הוגדר"}</p>
            </div>
          </div>
          <Input
            placeholder="הכנס את שמך..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="h-12 rounded-xl text-base"
            autoFocus
          />
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="w-full h-12 rounded-xl text-base"
          >
            {saving ? "שומר..." : "שמור שם"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}