import React from "react";
import PosterPage from "@/components/poster/PosterPage";

// מסכי הכניסה בשפת כרזת השוק — פס צהוב עם המיתוג וכותרת המסך, וכרטיס לבן לטופס.
export default function AuthLayout({ icon, title, subtitle, footer, children }) {
  return (
    <PosterPage icon={icon} title={title} subtitle={subtitle} back="/" backLabel="חזרה">
      <div className="pst-panel mx-auto w-full max-w-md">{children}</div>
      {footer && <p className="mt-5 text-center text-[15px] font-bold">{footer}</p>}
    </PosterPage>
  );
}