import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, History, BarChart3, Info, Store, Check, Star, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";
import { requestNotificationPermission } from "@/hooks/useListNotifications";
import BudgetTracker from "./BudgetTracker";
import PremiumLock from "@/components/premium/PremiumLock";
import usePremium from "@/hooks/usePremium";
import { SUPERMARKET_NAMES, getPreferredSupermarket, setPreferredSupermarket } from "@/lib/supermarkets";
import ChainLogo from "@/components/ChainLogo";

export default function SettingsDialog({ open, onOpenChange, list }) {
  const t = useT();
  const navigate = useNavigate();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferredStore, setPreferredStore] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const { isPremium } = usePremium();

  useEffect(() => {
    if (list) {
      setPushEnabled(!!list.push_enabled);
      setIsFavorite(!!list.is_favorite);
    }
    setPreferredStore(getPreferredSupermarket());
  }, [list, open]);

  const handleTogglePush = async (checked) => {
    // לפני שמפעילים — מאשרים התראות בדפדפן; בלי אישור אין מה לשמור
    if (checked) {
      const permission = await requestNotificationPermission();
      if (permission !== "granted") {
        toast({ title: t("notify.blocked") });
        return;
      }
    }
    setPushEnabled(checked);
    setSaving(true);
    try {
      await base44.entities.ShoppingList.update(list.id, { push_enabled: checked });
    } catch {
      setPushEnabled(!checked);
      toast({ title: t("settings.error") });
    }
    setSaving(false);
  };

  const handleToggleFavorite = async () => {
    const newVal = !isFavorite;
    setIsFavorite(newVal);
    try {
      await base44.entities.ShoppingList.update(list.id, { is_favorite: newVal });
    } catch {
      setIsFavorite(!newVal);
    }
  };

  const handleSelectStore = (name) => {
    setPreferredStore(name);
    setPreferredSupermarket(name);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[88vh] overflow-y-auto" style={{ maxWidth: 'min(28rem, calc(100vw - 1.5rem))' }}>
        <DialogHeader>
          <DialogTitle className="text-xl text-start">{t("settings.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* Favorite toggle */}
          <div className="flex items-center justify-between bg-muted/50 rounded-2xl p-4 animate-slide-up stagger-1">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Star className={`w-5 h-5 ${isFavorite ? "text-yellow-500 fill-yellow-500" : "text-primary"}`} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{t("settings.favorite")}</p>
                <p className="text-sm text-muted-foreground truncate">{t("settings.favoriteDesc")}</p>
              </div>
            </div>
            <Switch checked={isFavorite} onCheckedChange={handleToggleFavorite} />
          </div>

          {/* Push notifications */}
          <div className="flex items-center justify-between bg-muted/50 rounded-2xl p-4 animate-slide-up stagger-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{t("settings.pushNotifications")}</p>
                <p className="text-sm text-muted-foreground truncate">{t("settings.pushDesc")}</p>
              </div>
            </div>
            <Switch checked={pushEnabled} onCheckedChange={handleTogglePush} disabled={saving} />
          </div>

          {pushEnabled && (
            <div className="w-full max-w-full mx-auto bg-primary/5 rounded-xl p-3 animate-slide-up overflow-hidden">
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <Info className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs font-medium text-primary">{t("settings.pushNotifications")}</span>
              </div>
              <p dir="rtl" className="block w-full max-w-full text-center text-xs text-muted-foreground leading-relaxed break-words [overflow-wrap:anywhere]">{t("settings.pushInfo")}</p>
            </div>
          )}

          {/* WhatsApp bot — מוסיפים מוצרים בהודעת ווטסאפ */}
          <a
            href={base44.agents.getWhatsAppConnectURL("shopping_bot")}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center gap-3 bg-muted/50 hover:bg-muted rounded-2xl p-4 transition-colors text-start animate-slide-up stagger-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{t("settings.whatsapp")}</p>
              <p className="text-sm text-muted-foreground truncate">{t("settings.whatsappDesc")}</p>
            </div>
          </a>

          {/* Supermarket preference */}
          <div className="bg-muted/50 rounded-2xl p-4 animate-slide-up stagger-3 overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">סופר מועדף</p>
                <p className="text-sm text-muted-foreground truncate">בחר את הסופר שלך לניווט מהיר</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pb-1">
              <button
                onClick={() => handleSelectStore("")}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all whitespace-nowrap ${
                  preferredStore === "" ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:border-primary/30"
                }`}
              >
                ללא העדפה
              </button>
              {SUPERMARKET_NAMES.map((name) => (
                <button
                  key={name}
                  onClick={() => handleSelectStore(name)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all flex items-center gap-1 whitespace-nowrap ${
                    preferredStore === name ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  {preferredStore === name && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  <ChainLogo name={name} size={16} />
                  <span className="whitespace-nowrap">{name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="animate-slide-up stagger-4">
            {isPremium ? <BudgetTracker listId={list.id} /> : <PremiumLock hint={t("premium.f2")} />}
          </div>

          <button
            onClick={() => navigate(`/history/${list.id}`)}
            className="w-full flex items-center gap-3 bg-muted/50 hover:bg-muted rounded-2xl p-4 transition-colors text-start animate-slide-up stagger-5"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{t("settings.history")}</p>
              <p className="text-sm text-muted-foreground truncate">{t("settings.historyDesc")}</p>
            </div>
          </button>

          <button
            onClick={() => navigate(`/summary/${list.id}`)}
            className="w-full flex items-center gap-3 bg-muted/50 hover:bg-muted rounded-2xl p-4 transition-colors text-start animate-slide-up stagger-6"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{t("settings.summary")}</p>
              <p className="text-sm text-muted-foreground truncate">{t("settings.summaryDesc")}</p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}