import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loadLocalName } from "@/lib/userName";

export default function WelcomeScreen({ onNameSubmit }) {
  const [name, setName] = useState(loadLocalName());

  const handleSubmit = () => {
    if (!name.trim()) return;
    onNameSubmit(name.trim());
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background" dir="rtl">
      <div className="w-full max-w-sm px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">MaKonim</h1>
        <p className="text-muted-foreground text-lg mb-8">רשימת קניות משותפת</p>

        <div className="space-y-4">
          <Input
            placeholder="מה שמך?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="h-14 rounded-2xl text-lg text-center"
            autoFocus
          />
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full h-14 rounded-2xl text-lg"
          >
            בוא נתחיל לקנות 🛒
          </Button>
        </div>
      </div>
    </div>
  );
}