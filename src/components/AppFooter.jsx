import { useT } from "@/lib/i18n";

export default function AppFooter() {
  const t = useT();
  return (
    <footer className="text-center py-4 text-xs text-muted-foreground">
      {t("footer.credit")}
    </footer>
  );
}