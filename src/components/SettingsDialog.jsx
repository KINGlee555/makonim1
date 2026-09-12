import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, History, BarChart3, Info, Store, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";
import BudgetTracker from "./BudgetTracker";
import { SUPERMARKET_NAMES, getPreferredSupermarket, setPreferredSupermarket } from "@/lib/supermarkets";

export default function SettingsDialog({ open, onOpenChange, list }) {
  const t = useT();
  const navigate = useNavigate();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferredStore, setPreferredStore] = useState("");

  useEffect(() => {
    if (list) setPushEnabled(!!list.push_enabled);
    setPreferredStore(getPreferredSupermarket());
  }, [list, open]);

  const handleTogglePush = async (checked) => {
    setPushEnabled(checked);
    setSaving(true);
    try {
      await base44.entities.ShoppingList.update(list.id, { push_enabled: checked });
    } catch {
      setPushEnabled(!checked);
    }
    setSaving(false);
  };

  const handleSelectStore = (name) => {
    setPreferredStore(name);
    setPreferredSupermarket(name);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-start">{t("settings.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between bg-muted/50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{t("settings.pushNotifications")}</p>
                <p className="text-sm text-muted-foreground">{t("settings.pushDesc")}</p>
              </div>
            </div>
            <Switch checked={pushEnabled} onCheckedChange={handleTogglePush} disabled={saving} />
          </div>

          {pushEnabled && (
            <div className="flex items-start gap-2 bg-primary/5 rounded-xl p-3">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">{t("settings.pushInfo")}</p>
            </div>
          )}

          {/* Supermarket preference */}
          <div className="bg-muted/50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">סופר מועדף</p>
                <p className="text-sm text-muted-foreground">בחר את הסופר שלך לניווט מהיר</p>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => handleSelectStore("")}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                  preferredStore === "" ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:border-primary/30"
                }`}
              >
ללא העדפה              </button>
              {SUPERMARKET_NAMES.map((name) => (
                <button
                  key={name}
                  onClick={() => handleSelectStore(name)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all flex items-center gap-1 ${
                    preferredStore === name ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  {preferredStore === name && <Check className="w-3.5 h-3.5" />}
                  {name}
                </button>
              ))}
            </div>
          </div>

          <BudgetTracker listId={list.id} />

          <button
            onClick={() => navigate(`/history/${list.id}`)}
            className="w-full flex items-center gap-3 bg-muted/50 hover:bg-muted rounded-2xl p-4 transition-colors text-start"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{t("settings.history")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.historyDesc")}</p>
            </div>
          </button>

          <button
            onClick={() => navigate(`/summary/${list.id}`)}
            className="w-full flex items-center gap-3 bg-muted/50 hover:bg-muted rounded-2xl p-4 transition-colors text-start"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{t("settings.summary")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.summaryDesc")}</p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}