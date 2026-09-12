import { useT } from "@/lib/i18n";

export default function AppFooter() {
  const t = useT();
  return (
    <footer className="text-center pt-8 pb-2 text-[10px] text-muted-foreground/40">
      {t("footer.credit")}
    </footer>
  );
}