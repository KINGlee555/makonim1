import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";

const TEMPLATES = [
  { id: "weekly", emoji: "🛒", names: ["חלב", "לחם", "ביצים", "גבינה לבנה", "יוגורט", "עגבניות", "מלפפון", "בצל", "שמן זית", "מלח", "קפה", "סוכר", "שמן קנולה", "טונה", "פסטה", "אורז"] },
  { id: "bbq", emoji: "🔥", names: ["פיתה", "המבורגר", "נקניקיות", "שניצל", "כבד עוף", "פלפל ירוק", "חסה", "עגבניות", "מיונז", "חרדל", "קטשופ", "תירס", "חמוצים"] },
  { id: "shabbat", emoji: "🕯️", names: ["חלה", "יין אדום", "דג מלוח", "סלט", "מרק עוף", "כבד קצוץ", "פרפה", "קוטג", "ביסלי", "פיצוחים", "מיץ ענבים", "גלידה"] },
  { id: "breakfast", emoji: "🍳", names: ["ביצים", "חלב", "דגני בוקר", "לחם", "גבינה צהובה", "ממרח שוקולד", "דבש", "חמאה", "ריבה", "קפה", "תה", "מאפין"] },
  { id: "cleaning", emoji: "🧽", names: ["סבון כלים", "מטלית", "אקונומיקה", "קוטל חיידקים", "ספריי ניקוי", "מטאטא", "מגב", "שקיות זבל", "נייר טואלט", "מגבונים", "סבון כביסה", "מרכך כביסה"] },
  { id: "baby", emoji: "🍼", names: ["תחבושות חיתולים", "חיתולים", "מגבונים לתינוק", "קרם תחת", "בקבוקי תינוק", "מוצץ", "תמל 1", "דייסת אורז", "סבון תינוק"] },
];

export default function ListTemplates({ open, onOpenChange, listId, allProducts, onAdded }) {
  const t = useT();
  const [adding, setAdding] = useState(null);

  const handleAddTemplate = async (template) => {
    setAdding(template.id);
    try {
      const matched = template.names
        .map(name => allProducts.find(p => p.name === name || p.name.includes(name) || name.includes(p.name)))
        .filter(Boolean);
      const items = (matched.length > 0 ? matched : template.names.map(name => ({ name, price: 0, image_url: "", category: "אחר" })))
        .map(p => ({ list_id: listId, name: p.name, price: p.price || 0, image_url: p.image_url || "", category: p.category || "אחר", status: "pending", quantity: 1 }));
      await base44.entities.ListItem.bulkCreate(items);
      toast({ title: t("templates.added", { count: items.length }), duration: 2000 });
      if (onAdded) onAdded();
    } catch {
      toast({ title: t("templates.error"), variant: "destructive" });
    }
    setAdding(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh] flex flex-col overflow-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-start">{t("templates.title")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground px-6 -mt-1 mb-2">{t("templates.desc")}</p>
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">
          {TEMPLATES.map(template => (
            <button key={template.id} onClick={() => handleAddTemplate(template)} disabled={adding === template.id}
              className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:border-primary hover:bg-primary/5 transition-all text-start disabled:opacity-50">
              <span className="text-3xl">{template.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{t(`templates.${template.id}`)}</p>
                <p className="text-xs text-muted-foreground">{template.names.length} {t("templates.items")}</p>
              </div>
              {adding === template.id ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-primary font-bold text-lg">+</span>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}