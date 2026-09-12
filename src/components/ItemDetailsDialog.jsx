import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

const UNITS = ["unit", "package", "kg", "liter"];

export default function ItemDetailsDialog({ item, onClose, onSave }) {
  const t = useT();
  const [note, setNote] = useState("");
  const [unit, setUnit] = useState("unit");

  useEffect(() => {
    setNote(item?.note || "");
    setUnit(item?.unit || "unit");
  }, [item]);

  const save = () => {
    onSave(item, { note: note.trim(), unit });
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader><DialogTitle>{t("itemDetails.title")}</DialogTitle></DialogHeader>
        <label className="space-y-2 text-sm font-semibold">
          <span>{t("itemDetails.unit")}</span>
          <select value={unit} onChange={(event) => setUnit(event.target.value)} className="h-12 w-full rounded-xl border border-input bg-background px-3">
            {UNITS.map((value) => <option key={value} value={value}>{t(`unit.${value}`)}</option>)}
          </select>
        </label>
        <label className="space-y-2 text-sm font-semibold">
          <span>{t("itemDetails.note")}</span>
          <Input value={note} onChange={(event) => setNote(event.target.value)} maxLength={120} placeholder={t("itemDetails.notePlaceholder")} className="h-12 rounded-xl" />
        </label>
        <Button onClick={save} className="h-12 rounded-xl">{t("itemDetails.save")}</Button>
      </DialogContent>
    </Dialog>
  );
}