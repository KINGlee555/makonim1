import { Link } from "react-router-dom";
import { Mail, MessageCircle, Info } from "lucide-react";
import PosterPage from "@/components/poster/PosterPage";

const CONTACT_EMAIL = "alan.novitsky@gmail.com";

export default function Contact() {
  return (
    <PosterPage
      icon={MessageCircle}
      title="יצירת קשר"
      subtitle="שאלה, תקלה, רעיון לשיפור או בקשת פיצ׳ר? כתבו לנו ונחזור אליכם בהקדם"
    >
      <div className="pst-panel">
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=MaKonim`}
          className="flex items-center gap-3 border-[3px] border-[#0B3A4D] bg-[#0B3A4D] px-4 py-4 text-[16px] font-black text-[#FFD400]"
        >
          <Mail className="h-5 w-5 flex-shrink-0" />
          <span className="min-w-0 break-all">{CONTACT_EMAIL}</span>
        </a>

        <div className="mt-5 flex items-start gap-2 border-[3px] border-[#0B3A4D] bg-[#FFD400] p-4 text-[14px] font-bold leading-relaxed">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            האפליקציה מפותחת ומתוחזקת על ידי אלן נוביצקי. מידע נוסף על האפליקציה נמצא{" "}
            <Link to="/about" className="font-black underline decoration-[#0B3A4D] decoration-[3px]">
              בעמוד האודות
            </Link>
            .
          </span>
        </div>
      </div>
    </PosterPage>
  );
}