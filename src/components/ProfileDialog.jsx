import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { saveLocalName, loadLocalName } from "@/lib/userName";
import { useT } from "@/lib/i18n";

export default function ProfileDialog({ open, onOpenChange, currentUser, onNameUpdated }) {
  const t = useT();
  const [name, setName] = useState(currentUser?.full_name || loadLocalName());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    saveLocalName(name.trim());
    await base44.auth.updateMe({ full_name: name.trim() });
    onNameUpdated(name.trim());
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-start">{t("profile.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 bg-muted rounded-2xl p-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("profile.preview")}</p>
              <p className="text-base font-semibold">{name || t("profile.noName")}</p>
            </div>
          </div>
          <Input
            placeholder={t("profile.placeholder")}
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
            {saving ? t("profile.saving") : t("profile.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}