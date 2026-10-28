import { Link, useNavigate } from "react-router-dom";

// כפתור חזרה שמתנהג כמו שצריך: חוזר למסך שממנו הגענו, ורק כשאין לאן לחזור —
// לרשימה. כך ניווט בין מסכי הפנים לא זורק את המשתמש חזרה להתחלה.
export default function PosterLink({ to, onClick, children, ...rest }) {
  const navigate = useNavigate();

  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const canGoBack = window.history.length > 1 && (window.history.state?.idx ?? 0) > 0;
    if (!canGoBack) return; // אין היסטוריה — הקישור הרגיל מוביל לרשימה
    event.preventDefault();
    navigate(-1);
  };

  return (
    <Link to={to} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}