import { useT } from "@/lib/i18n";

// קישור "דלג לתוכן הראשי" — קופץ ראשון בניווט במקלדת, נראה רק כשהוא בפוקוס.
export default function SkipLink() {
  const t = useT();
  return (
    <a href="#main-content" className="pst-skip">
      {t("a11y.skip")}
    </a>
  );
}