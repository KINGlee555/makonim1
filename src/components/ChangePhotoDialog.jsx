import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Camera, CheckCircle2, XCircle, Loader2 } from "lucide-react";

// המשתמש מעלה תמונה, AI מאמת שהיא באמת מתאימה למוצר, ורק אז היא נשמרת.
export default function ChangePhotoDialog({ item, onClose, onSaved }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState("");
  const [state, setState] = useState("idle"); // idle | checking | rejected | saving
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
        required: ["matches", "reason"],
      },
    });

    if (!check?.matches) {
      setState("rejected");
      setReason(check?.reason || "התמונה לא זוהתה כתמונה של המוצר.");
      return;
    }

    setState("saving");
    await base44.entities.ListItem.update(item.id, { image_url: file_url });
    onSaved(item.id, file_url);
    reset();
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => { if (!open) { reset(); onClose(); } }}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>החלפת תמונת מוצר</DialogTitle>
        </DialogHeader>

        {item && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              התמונה שתעלו עבור <span className="font-bold text-foreground">{item.name}</span> תיבדק אוטומטית, ותישמר רק אם היא אכן תואמת למוצר.
            </p>

            {preview && (
              <img src={preview} alt={item.name} className="mx-auto h-40 w-40 rounded-2xl object-cover shadow-sm" />
            )}

            {state === "checking" && (
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> בודקים שהתמונה תואמת למוצר...
              </div>
            )}

            {state === "saving" && (
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> אומתה! שומרים את התמונה...
              </div>
            )}

            {state === "rejected" && (
              <div className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>התמונה נדחתה: {reason}</span>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={state === "checking" || state === "saving"}
              className="h-12 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground"
            >
              <Camera className="me-2 h-5 w-5" />
              {state === "rejected" ? "בחרו תמונה אחרת" : "בחרו תמונה"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}