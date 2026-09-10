import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Check, UtensilsCrossed } from "lucide-react";
import { useT } from "@/lib/i18n";
import { getProductEmoji } from "@/lib/productEmoji";

const MEAL_TEMPLATES = [
  { id: "breakfast", emoji: "🍳", meals: ["ביצים", "לחם", "גבינה צהובה", "ממרח שוקולד", "דבש", "קפה", "חלב"] },
  { id: "lunch", emoji: "🍽️", meals: ["עוף", "אורז", "פסטה", "עגבניות", "מלפפון", "חסה", "שמן זית", "פלפל"] },
  { id: "dinner", emoji: "🍝", meals: ["פסטה", "רסק עגבניות", "שום", "בצל", "פרמז'ן", "בזיליקום", "לחם"] },
  { id: "shabbat", emoji: "🕯️", meals: ["חלה", "יין", "דג מלוח", "סלט", "מרק עוף", "כבד קצוץ", "פרפה", "ביסלי", "פיצוחים", "מיץ ענבים"] },
  { id: "bbq", emoji: "🔥", meals: ["פיתה", "המבורגר", "נקניקיות", "שניצל", "פלפל ירוק", "חסה", "עגבניות", "מיונז", "חרדל", "קטשופ"] },
  { id: "kids", emoji: "🧒", meals: ["קורנפלקס", "שוקו", "מעדן חלב", "פרי מרוסק", "ביסקוויטים", "פופקורן", "גבינה צהובה"] },
];

const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export default function WeeklyMenu({ open, onOpenChange, onGenerate }) {
  const t = useT();
  const [selectedMeals, setSelectedMeals] = useState({});

  const toggleMeal = (day, mealId) => {
    setSelectedMeals(prev => {
      const dayMeals = prev[day] || [];
      if (dayMeals.includes(mealId)) {
        return { ...prev, [day]: dayMeals.filter(m => m !== mealId) };
      }
      return { ...prev, [day]: [...dayMeals, mealId] };
    });
  };

  const allIngredients = useMemo(() => {
    const ingredients = new Set();
    Object.values(selectedMeals).forEach(dayMeals => {
      dayMeals.forEach(mealId => {
        const template = MEAL_TEMPLATES.find(m => m.id === mealId);
        if (template) template.meals.forEach(m => ingredients.add(m));
      });
    });
    return Array.from(ingredients);
  }, [selectedMeals]);

  const handleGenerate = () => {
    onGenerate(allIngredients.map(name => ({ name, price: 0, category: "אחר", image_url: "" })));
    onOpenChange(false);
    setSelectedMeals({});
  };

  const totalMeals = Object.values(selectedMeals).reduce((sum, meals) => sum + meals.length, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh] flex flex-col overflow-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-start flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />{t("menu.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 pb-3">
          {DAYS.map(day => (
            <div key={day} className="mb-4">
              <p className="text-sm font-semibold text-foreground mb-2">{t("menu.day." + day) || day}</p>
              <div className="flex gap-2 flex-wrap">
                {MEAL_TEMPLATES.map(meal => {
                  const isSelected = (selectedMeals[day] || []).includes(meal.id);
                  return (
                    <button key={meal.id} onClick={() => toggleMeal(day, meal.id)}
                      aria-label={meal.id} aria-pressed={isSelected}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm transition-all ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
                      <span>{meal.emoji}</span>
                      <span>{t("menu.meal." + meal.id) || meal.id}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {totalMeals > 0 && (
          <div className="border-t border-border px-5 py-3 bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-foreground">{t("menu.ingredients", { count: allIngredients.length })}</p>
            </div>
            <div className="flex gap-1 flex-wrap mb-3 max-h-20 overflow-y-auto">
              {allIngredients.slice(0, 15).map(ing => (
                <span key={ing} className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{getProductEmoji(ing, "")} {ing}</span>
              ))}
              {allIngredients.length > 15 && <span className="text-xs text-muted-foreground">+{allIngredients.length - 15}</span>}
            </div>
            <Button onClick={handleGenerate} className="w-full bg-primary text-primary-foreground rounded-xl h-12">
              <Plus className="w-5 h-5" />{t("menu.addToList")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}