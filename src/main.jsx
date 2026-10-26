import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { applyDarkTheme, isDarkTheme } from '@/lib/theme'
import { applySkin, isPosterSkin } from '@/lib/skin'

// Dark mode is saved on the device and applied immediately on load to prevent a bright flash
applyDarkTheme(isDarkTheme())

// The selected skin is also saved on the device and applied immediately, updating later based on user preference
applySkin(isPosterSkin() ? 'poster' : 'quiet')

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)