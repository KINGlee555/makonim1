// Builds the HTML body for the shopping-list invitation email.
// Funny, marketing-style, on-brand (turquoise) — in Hebrew.

export function buildInvitationEmailBody({ shareLink, senderName, listTitle }) {
  const sender = senderName || "בן/בת הזוג שלך";
  const title = listTitle || "הרשימה המשפחתית";

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#eef7f6;font-family:Rubik,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef7f6;padding:24px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 30px rgba(13,116,120,0.12);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0E7478,#16a39a);padding:36px 32px;text-align:center;">
            <div style="font-size:54px;line-height:1;">🛒</div>
            <h1 style="color:#ffffff;font-size:30px;margin:12px 0 4px;font-weight:700;">מה קונים?</h1>
            <p style="color:#ccefec;font-size:16px;margin:0;">הרשימה המשפחתית שתשנה את חייכם</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 8px;">
            <h2 style="color:#0E7478;font-size:22px;margin:0 0 12px;font-weight:700;">היי! 🙋‍♀️🙋‍♂️</h2>
            <p style="color:#2c3e50;font-size:17px;line-height:1.6;margin:0 0 16px;">
              <strong>${sender}</strong> הזמין/ה אותך להצטרף לרשימת הקניות
              "<strong style="color:#16a39a;">${title}</strong>".
            </p>
            <p style="color:#2c3e50;font-size:17px;line-height:1.6;margin:0 0 16px;">
              נמאס לכם לקנות חלב שכבר יש במקרר? 🥛<br>
              נמאס לגלות בסופר ששכחתם את הביצים? 🥚<br>
              ומה עם ה"תביא גם לחם דרך אגב" שתמיד נשכח? 🍞
            </p>
            <p style="color:#2c3e50;font-size:17px;line-height:1.6;margin:0 0 20px;">
              בעזרת <strong style="color:#0E7478;">מה קונים?</strong> תשכחו מזה לתמיד —
              רשימה אחת משותפת, סנכרון בזמן אמת, ואפילו ניווט לסופר הכי זול וקרוב. 🗺️💸
            </p>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td align="center" style="padding:8px 32px 28px;">
            <a href="${shareLink}" style="display:inline-block;background:#0E7478;color:#ffffff;text-decoration:none;font-size:18px;font-weight:700;padding:16px 40px;border-radius:16px;box-shadow:0 6px 18px rgba(14,116,120,0.3);">
              לחצ/י כאן והצטרפ/י לרשימה 🎉
            </a>
            <p style="color:#94a3b8;font-size:13px;margin:16px 0 0;">או העתק/י את הקישור: ${shareLink}</p>
          </td>
        </tr>
        <!-- Features -->
        <tr>
          <td style="padding:0 32px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="33%" align="center" style="padding:8px;">
                  <div style="font-size:30px;">⚡</div>
                  <p style="color:#0E7478;font-size:14px;font-weight:600;margin:6px 0 0;">סנכרון חי</p>
                </td>
                <td width="33%" align="center" style="padding:8px;">
                  <div style="font-size:30px;">📍</div>
                  <p style="color:#0E7478;font-size:14px;font-weight:600;margin:6px 0 0;">ניווט לסופר</p>
                </td>
                <td width="33%" align="center" style="padding:8px;">
                  <div style="font-size:30px;">💰</div>
                  <p style="color:#0E7478;font-size:14px;font-weight:600;margin:6px 0 0;">חיסכון אמיתי</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f0faf9;padding:20px 32px;text-align:center;border-top:1px solid #d6efed;">
            <p style="color:#64748b;font-size:13px;margin:0;">הקישור אישי ומשותף רק איתך — לא הזמנת אותנו? פשוט תתעלם/י 🙂</p>
            <p style="color:#94a3b8;font-size:12px;margin:8px 0 0;">© מה קונים? — כי קניות זו עבודת צוות</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export const INVITATION_SUBJECT = "🛒 הצטרפ/י לרשימת הקניות המשפחתית שלנו!";