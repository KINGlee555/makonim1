import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { applyDarkTheme, isDarkTheme } from '@/lib/theme'

// מצב כהה נשמר במכשיר ומוחל מיד עם העלייה, כדי שהמסך לא ייטען בהיר ואז יקפוץ לכהה
applyDarkTheme(isDarkTheme())

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)