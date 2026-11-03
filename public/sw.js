// רישום האפליקציה כאפליקציה אמיתית על המסך — קובץ השירות הזה הוא מה שדפדפן
// (אנדרואיד, אייפון, מחשב) דורש כדי לאפשר "הוסף למסך הבית" ולהריץ את האתר כאפליקציה.
// הוא לא שומר תוכן במטמון, כדי שעדכון של האתר יגיע תמיד למשתמש.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// מאזין ל-fetch נדרש כדי שהדפדפן יראה בזה אפליקציה מותקנת; הבקשות עצמן ממשיכות כרגיל לרשת.
self.addEventListener("fetch", () => {});
