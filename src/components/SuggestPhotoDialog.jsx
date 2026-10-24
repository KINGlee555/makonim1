import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Camera, CheckCircle2, Loader2, Send, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";

// כל משתמש יכול להציע תמונה אמיתית יותר למוצר. ההצעה נשלחת למנהל האפליקציה,
// ורק אחרי אישור שלו התמונה מתעדכנת בכל האפליקציה.
export default function SuggestPhotoDialog({ item, listId, userName, onClose }) {
  const t = useT();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState("");
  const [state, setState] = useState("idle"); // idle | checking | rejected | sending
  const [reason, setReason] = useState("");

  const reset = () => { setPreview(""); setState("idle"); setReason(""); };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setState("checking");
    setReason("");
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
    setPreview(file_url);

    const check = await base44.integrations.Core.InvokeLLM({
      prompt: `בתמונה המצורפת אמור להיות המוצר "${item.name}"${item.category ? ` מקטגוריית "${item.category}"` : ""}. האם התמונה אכן מציגה את המוצר הזה בבירור? החזר matches=true רק אם התמונה באמת תואמת למוצר. נמק במשפט קצר בעברית.`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: { matches: { type: "boolean" }, reason: { type: "string" } },
        required: ["matches", "reason"]
      }
    });

    if (!check?.matches) {
      setState("rejected");
      setReason(check?.reason || t("suggest.notProduct"));
      return;
    }

    setState("sending");
    await base44.entities.ImageSuggestion.create({
      product_name: item.name,
      barcode: item.barcode || "",
      category: item.category || "",
      current_image_url: item.image_url || "",
      suggested_image_url: file_url,
      note: "",
      status: "pending",
      submitted_by_name: userName || "",
      list_id: listId || ""
    });
    toast({ title: t("suggest.sentTitle"), description: t("suggest.sentDesc") });
    reset();
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => { if (!open) { reset(); onClose(); } }}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Send className="h-5 w-5 text-market-pink" />{t("suggest.title")}
          </DialogTitle>
        </DialogHeader>

        {item && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">{t("suggest.desc", { name: item.name })}</p>

            <div className="flex items-center justify-center gap-3">
              <div className="text-center">
                <img src={item.image_url || ""} alt="" className="h-28 w-28 rounded-2xl border-2 border-border object-cover" />
                <span className="mt-1 block text-xs font-bold text-muted-foreground">{t("admin.current")}</span>
              </div>
              {preview && (
                <div className="text-center">
                  <img src={preview} alt="" className="h-28 w-28 rounded-2xl border-2 border-primary object-cover" />
                  <span className="mt-1 block text-xs font-bold text-primary">{t("admin.suggested")}</span>
                </div>
              )}
            </div>

            {state === "checking" && (
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />{t("suggest.checking")}
              </div>
            )}

            {state === "sending" && (
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />{t("suggest.sending")}
              </div>
            )}

            {state === "rejected" && (
              <div className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{t("suggest.notProduct")} {reason}</span>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={state === "checking" || state === "sending"}
              className="h-12 w-full rounded-2xl bg-market-pink text-base font-black text-white hover:bg-market-pink"
            >
              <Camera className="me-2 h-5 w-5" />
              {state === "rejected" ? t("suggest.chooseAnother") : t("suggest.choose")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}