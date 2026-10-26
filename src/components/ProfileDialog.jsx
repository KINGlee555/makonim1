import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Camera, Loader2, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { saveLocalName, loadLocalName } from "@/lib/userName";
import { useT } from "@/lib/i18n";

export default function ProfileDialog({ open, onOpenChange, currentUser, onNameUpdated, forceName }) {
  const t = useT();
  const [name, setName] = useState(currentUser?.full_name || loadLocalName());
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(currentUser?.profile_image_url || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // מחיקת החשבון: השרת מאמת את המבקש ומוחק את הפרופיל שלו, ואז המשתמש מנותק מהאפליקציה
  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await base44.functions.invoke("deleteMyAccount", { confirm_email: confirmEmail.trim() });
      base44.auth.logout("/login");
    } catch (err) {
      const reason = err?.response?.data?.error;
      setDeleteError(reason === "email_mismatch" ? t("profile.deleteEmailMismatch") : t("profile.deleteError"));
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    saveLocalName(name.trim());
    await base44.auth.updateMe({ full_name: name.trim(), profile_image_url: photoUrl });
    onNameUpdated(name.trim());
    setSaving(false);
    onOpenChange(false);
  };

  const handleOpenChange = (val) => {
    if (!val && forceName && !name.trim()) return;
    onOpenChange(val);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setPhotoUrl(file_url);
    } catch (err) {
      // silently fail — photo is optional
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`max-w-sm mx-auto ${forceName ? "[&>button:last-child]:hidden" : ""}`}>
        <DialogHeader>
          <DialogTitle className="text-xl text-start">{t("profile.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden hover:bg-primary/20 transition-colors active:scale-95"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-primary" />
              )}
              <div className="absolute bottom-0 inset-x-0 bg-black/40 py-1 flex items-center justify-center">
                {uploading ? (
                  <Loader2 className="w-3 h-3 text-white animate-spin" />
                ) : (
                  <Camera className="w-3 h-3 text-white" />
                )}
              </div>
            </button>
            <p className="text-xs text-muted-foreground">
              {photoUrl ? t("profile.changePhoto") : t("profile.addPhoto")}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-3 bg-muted rounded-2xl p-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center overflow-hidden flex-shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-primary-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{t("profile.preview")}</p>
              <p className="text-base font-semibold truncate">{name || t("profile.noName")}</p>
            </div>
          </div>
          <Input
            placeholder={t("profile.placeholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="h-12 rounded-xl text-base"
            maxLength={64}
            autoFocus
          />
          {forceName && !name.trim() && (
            <p className="text-sm text-destructive text-center">{t("profile.required")}</p>
          )}
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="w-full h-12 rounded-xl text-base"
          >
            {saving ? t("profile.saving") : t("profile.save")}
          </Button>

          {!forceName && (
            <div className="pt-3 border-t border-border">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl text-base text-destructive border-destructive/40 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("profile.deleteAccount")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-sm mx-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("profile.deleteTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>{t("profile.deleteBody")}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2">
                    <label htmlFor="delete-account-email" className="text-sm font-medium">
                      {t("profile.deleteEmailLabel")}
                    </label>
                    <Input
                      id="delete-account-email"
                      type="email"
                      dir="ltr"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="h-12 rounded-xl text-base"
                    />
                    {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
                  </div>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel disabled={deleting}>{t("profile.deleteCancel")}</AlertDialogCancel>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleting || !confirmEmail.trim()}
                    >
                      {deleting ? t("profile.deleting") : t("profile.deleteConfirm")}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}