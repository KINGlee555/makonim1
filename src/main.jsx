import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import '@/styles/fridge.css'
import '@/styles/poster-wide.css'
import { applyDarkTheme, isDarkTheme } from '@/lib/theme'
import { applySkin, getStoredSkin } from '@/lib/skin'

// מצב כהה נשמר במכשיר ומוחל מיד עם העלייה, כדי שהמסך לא ייטען בהיר ואז יקפוץ לכהה
applyDarkTheme(isDarkTheme())

// גם העיצוב שנבחר נשמר במכשיר ומוחל מיד — ואחר כך מתעדכן לפי הבחירה של המשתמש עצמו
applySkin(getStoredSkin())

// רישום קובץ השירות — בזכותו האתר מותקן כאפליקציה על מסך הבית בכל הפלטפורמות
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)