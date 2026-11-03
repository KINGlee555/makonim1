import path from 'node:path'
import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// שכבת ערבית: כל מי שמייבא את "@/lib/i18n" מקבל את העוטף עם ערבית.
// קובץ התרגומים המקורי נשאר במקומו, והעוטף מייבא אותו בנתיב יחסי.
const arabicI18nLayer = {
  name: 'arabic-i18n-layer',
  enforce: 'pre',
  resolveId(source, importer) {
    const isI18nModule = source === '@/lib/i18n' || /^\/src\/lib\/i18n(\.jsx)?$/.test(source)
    if (!isI18nModule) return null
    // העוטף עצמו מייבא את הקובץ המקורי — לא לעטוף אותו שוב
    if (importer && importer.includes('/lib/i18nAr.jsx')) return null
    return path.resolve(__dirname, 'src/lib/i18nAr.jsx')
  }
}

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    arabicI18nLayer,
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
  ]
});