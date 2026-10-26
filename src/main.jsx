import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { applyDarkTheme, isDarkTheme } from '@/lib/theme'
import { applySkin, isPosterSkin } from '@/lib/skin'

// מצב כהה נשמר במכשיר ומוחל מיד עם העלייה, כדי שהמסך לא ייטען בהיר ואז יקפוץ לכהה
applyDarkTheme(isDarkTheme())

// גם העיצוב שנבחר נשמר במכשיר ומוחל מיד — ואחר כך מתעדכן לפי הבחירה של המשתמש עצמו
applySkin(isPosterSkin() ? 'poster' : 'quiet')

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)