import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";

const PRESETS = ["קניות שבועיות", "קניות לשבת", "קניות לחג", "ברבקיו", "מוצרי ניקיון", "היגיינה וטיפוח", "חיות מחמד"];

export default function RenameListDialog({ open, onOpenChange, list, onRenamed }) {
  const t = useT();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setTitle(list?.title || ""); }, [open, list]);

  const save = async (value) => {
    const next = (value || "").trim();
    if (!next || !list) return;
    setSaving(true);
    await base44.entities.ShoppingList.update(list.id, { title: next });
    onRenamed(next);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-start text-xl font-bold">{t("rename.title")}</DialogTitle>
        </DialogHeader>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={64}
          className="h-12 rounded-2xl text-base" placeholder={t("rename.placeholder")} />
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(preset => (
            <button key={preset} onClick={() => setTitle(preset)}
              className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground">
              {preset}
            </button>
          ))}
        </div>
        <Button onClick={() => save(title)} disabled={saving || !title.trim()} className="h-12 w-full rounded-2xl text-base font-bold">
          {t("rename.save")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}