import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import '@/styles/fridge.css'
import '@/styles/poster-wide.css'
import { applyStoredPreferences } from '@/lib/preferences'

// ההעדפות שנשמרו במכשיר — מצב כהה/בהיר, מצב גדול ונוח, שפה וכיוון —
// מוחלות מיד עם העלייה, כדי שהמסך לא ייטען בהיר ואז יקפוץ לכהה
applyStoredPreferences()

// רישום קובץ השירות — בזכותו האתר מותקן כאפליקציה על מסך הבית בכל הפלטפורמות
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)