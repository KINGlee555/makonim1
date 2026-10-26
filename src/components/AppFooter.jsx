import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useT } from "@/lib/i18n";

export default function AppFooter() {
    const t = useT();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // TODO: Verify if the current user is an admin via your new auth provider
        // Mocking admin role as true for development purposes
        const mockUser = { role: "admin" };
        setIsAdmin(mockUser?.role === "admin");
    }, []);

    return (
        <footer className="pst-ft">
            <Link to="/about">אודות</Link>
            <Link to="/contact">יצירת קשר</Link>
            {isAdmin && (
                <>
                    <Link to="/photo-suggestions">{t("footer.suggestions")}</Link>
                    <Link to="/price-reports">{t("footer.priceReports")}</Link>
                    <Link to="/sponsored">{t("sponsored.admin")}</Link>
                    <Link to="/premium-members">מנויי פרימיום</Link>
                </>
            )}
            <span className="pst-credit">{t("footer.credit")}</span>
        </footer>
    );
}