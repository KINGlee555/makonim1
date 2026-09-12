import { useState } from "react";
import { getNearbyDeals } from "@/lib/nearbyDeals";

export default function useNearbyDeals() {
  const [deals, setDeals] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const load = () => {
    if (!navigator.geolocation) {
      setError("המכשיר אינו תומך בזיהוי מיקום");
      setStatus("error");
      return;
    }
    setStatus("locating");
    setError("");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      setStatus("loading");
      try {
        const verified = await getNearbyDeals(coords.latitude, coords.longitude);
        setDeals(verified);
        setStatus("done");
      } catch {
        setError("לא הצלחנו לאמת מבצעים באזור כרגע");
        setStatus("error");
      }
    }, () => {
      setError("נדרשת הרשאת מיקום כדי למצוא מבצעים קרובים");
      setStatus("error");
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  };

  return { deals, status, error, load };
}