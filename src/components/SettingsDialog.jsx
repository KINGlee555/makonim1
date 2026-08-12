import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, History, BarChart3, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

export default function SettingsDialog({ open, onOpenChange, list }) {
  const navigate = useNavigate();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (list) setPushEnabled(!!list.push_enabled);
  }, [list]);

  const handleTogglePush = async (checked) => {
    setPushEnabled(checked);
    setSaving(true);
    try {
      await base44.entities.ShoppingList.update(list.id, { push_enabled: checked });
      toast({ title: checked ? "התראות הופעלו" : "התראות בוטלו", duration: 1500 });
    } catch {
      setPushEnabled(!checked);
      toast({ title: "שגיאה בעדכון הגדרות", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl text-right">הגדרות</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Push notifications */}
          <div className="flex items-center justify-between bg-muted/50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">התראות Push</p>
                <p className="text-sm text-muted-foreground">עדכן את בן/בת הזוג כשפריט נקנה</p>
              </div>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={handleTogglePush}
              disabled={saving}
            />
          </div>

          {pushEnabled && (
            <div className="flex items-start gap-2 bg-primary/5 rounded-xl p-3">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                התראות Push דורשות בניית אפליקציה נייטיבית (iOS/Android). כעת ההעדפה נשמרת ותופעל אוטומטית כשתבנה האפליקציה.
              </p>
            </div>
          )}

          {/* Shopping history */}
          <button
            onClick={() => navigate(`/history/${list.id}`)}
            className="w-full flex items-center gap-3 bg-muted/50 hover:bg-muted rounded-2xl p-4 transition-colors text-right"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">היסטוריית קניות</p>
              <p className="text-sm text-muted-foreground">צפה בפריטים שנקנו בעבר</p>
            </div>
          </button>

          {/* Shopping summary */}
          <button
            onClick={() => navigate(`/summary/${list.id}`)}
            className="w-full flex items-center gap-3 bg-muted/50 hover:bg-muted rounded-2xl p-4 transition-colors text-right"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">סיכום קניות</p>
              <p className="text-sm text-muted-foreground">סה"כ הוצאות ופילוח לפי קטגוריה</p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}