import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "app_language";

const translations = {
  he: {
    // App
    "app.loading": "טוען...",
    "app.name": "מה קונים?",

    // Header
    "header.greeting": "היי! מה קונים {name} 👋",
    "header.changeName": "שנה שם",
    "header.settings": "הגדרות",
    "header.share": "שתף",
    "header.language": "שפה",

    // Footer
    "footer.credit": "פותח ע״י אלן נוביצקי",

    // ListView
    "list.notFound": "הרשימה לא נמצאה",
    "list.toBuy": "לקנות",
    "list.bought": "נקנו",
    "list.total": "סה״כ:",
    "list.empty": "הרשימה ריקה",
    "list.emptyDesc": "הוסף מוצרים עם הכפתור למטה",
    "list.boughtSection": "נקנו ✓",
    "list.clear": "נקה",
    "list.clearedBought": "המוצרים שנקנו נמחקו",
    "list.addedToList": "{name} נוסף לרשימה",
    "list.userAdded": "{email} נוסף לרשימה",

    // ProductSearchDialog
    "search.title": "חיפוש מוצרים",
    "search.placeholder": "חפש מוצר... (חלב, נענע, לחם...)",
    "search.byPrice": "לפי מחיר",
    "search.byLocation": "לפי מיקום",
    "search.locationUnsupported": "הדפדפן לא תומך במיקום",
    "search.locationError": "לא ניתן לגשת למיקום, אנא אפשר הרשאה",
    "search.showingNearby": "מציג סופרים קרובים אליך",
    "search.loadingProducts": "טוען מוצרים...",
    "search.searchPrompt": "חפש מוצר מהסופר",
    "search.noResults": "לא נמצאו תוצאות, נסה מילה אחרת",
    "search.suggestions": "המלצות בשבילך",
    "search.voiceSearch": "חיפוש קולי",
    "search.km": "ק״מ",

    // ShareDialog
    "share.title": "שתף את הרשימה",
    "share.sendEmail": "שלח הזמנה במייל",
    "share.emailPlaceholder": "הקלד/י את המייל של בן/בת הזוג...",
    "share.send": "שלח",
    "share.emailNote": "המייל יגיע עם קישור ישיר להצטרפות לרשימה 🎉",
    "share.or": "או",
    "share.yourLink": "הקישור הייחודי שלך",
    "share.linkCopied": "הקישור הועתק!",
    "share.shareNote": "שתף את הקישור עם משפחה וחברים והם יצטרפו לרשימה אוטומטית!",
    "share.invalidEmail": "כתובת מייל לא תקינה",
    "share.inviteSent": "ההזמנה נשלחה ל-{email} 🎉",
    "share.emailFailed": "שליחת המייל נכשלה",
    "share.emailFailedDesc": "ייתכן שהכתובת אינה רשומה באפליקציה. ניתן לשתף קישור במקום.",

    // ProfileDialog
    "profile.title": "השם שלי ברשימה",
    "profile.preview": "כך ייראה שמך לשאר המשתתפים",
    "profile.noName": "שם לא הוגדר",
    "profile.placeholder": "הכנס את שמך...",
    "profile.save": "שמור שם",
    "profile.saving": "שומר...",
    "profile.required": "חובה להזין שם כדי להמשיך",

    // SettingsDialog
    "settings.title": "הגדרות",
    "settings.pushNotifications": "התראות Push",
    "settings.pushDesc": "עדכן את בן/בת הזוג כשפריט נקנה",
    "settings.pushEnabled": "התראות הופעלו",
    "settings.pushDisabled": "התראות בוטלו",
    "settings.pushInfo": "התראות Push דורשות בניית אפליקציה נייטיבית (iOS/Android). כעת ההעדפה נשמרת ותופעל אוטומטית כשתבנה האפליקציה.",
    "settings.history": "היסטוריית קניות",
    "settings.historyDesc": "צפה בפריטים שנקנו בעבר",
    "settings.summary": "סיכום קניות",
    "settings.summaryDesc": "סה\"כ הוצאות ופילוח לפי קטגוריה",
    "settings.error": "שגיאה בעדכון הגדרות",

    // NavigateToStoreDialog
    "navigate.title": "ניווט לסופר",
    "navigate.recommended": "הסופר המומלץ עבור",
    "navigate.howToArrive": "איך תרצה להגיע?",
    "navigate.walk": "ברגל",
    "navigate.drive": "בנסיעה",
    "navigate.supermarket": "סופרמרקט",

    // ShoppingHistory
    "history.title": "היסטוריית קניות",
    "history.desc": "כל הפריטים שנקנו ברשימה זו",
    "history.scanReceipt": "סרוק קבלה",
    "history.totalExpenses": "סה\"כ הוצאות",
    "history.itemsBought": "פריטים שנקנו",
    "history.noHistory": "אין עדיין היסטוריה",
    "history.noHistoryDesc": "פריטים שנקנו ונמחקו יופיעו כאן",
    "history.units": "יח'",
    "history.receiptScanned": "{count} פריטים נוספו מהקבלה",
    "history.noItemsInReceipt": "לא זוהו פריטים בקבלה",
    "history.receiptError": "שגיאה בסריקת הקבלה",

    // ShoppingSummary
    "summary.title": "סיכום קניות",
    "summary.desc": "ניתוח הוצאות ופילוח נתונים",
    "summary.totalSpent": "סה\"כ הוצאות",
    "summary.itemsBought": "פריטים נקנו",
    "summary.byCategory": "הוצאות לפי קטגוריה",
    "summary.byBuyer": "קניות לפי משתמש",
    "summary.noData": "אין עדיין נתונים",
    "summary.noDataDesc": "קנה פריטים כדי לראות סיכום",
    "summary.items": "פריטים",
    "summary.unknown": "לא ידוע",
    "summary.other": "אחר",

    // JoinList
    "join.searching": "מחפש את הרשימה...",
    "join.joining": "מצטרף לרשימה...",
    "join.success": "הצטרפת בהצלחה!",
    "join.joinedToList": "לרשימה \"{title}\"",
    "join.alreadyIn": "את/ה כבר ברשימה!",
    "join.movingTo": "מעביר לרשימה \"{title}\"...",
    "join.notFound": "הרשימה לא נמצאה",
    "join.notFoundDesc": "ייתכן שהקישור שגוי",
    "join.backHome": "חזרה לדף הבית",
    "join.full": "הרשימה מלאה",
    "join.fullDesc": "ניתן לשתף עד 5 אנשים",
    "join.error": "שגיאה בטעינת הרשימה",

    // Home/Welcome
    "welcome.title": "MaKonim",
    "welcome.subtitle": "רשימת קניות משותפת",
    "welcome.namePlaceholder": "מה שמך?",
    "welcome.start": "בוא נתחיל לקנות 🛒",

    // ProductItem
    "productItem.navigate": "ניווט",
    "productItem.undoBought": "בטל קנייה",

    // QuickAddBar
    "quickAdd.search": "חפש וגלה מוצרים",

    // ListReader
    "reader.read": "הקרא",
    "reader.stop": "עצור",
    "reader.units": "יחידות",
    "reader.oneUnit": "יחידה אחת",

    // ReceiptScanner
    "receipt.scan": "סרוק קבלה",

    // VoiceSearch
    "voice.title": "חיפוש קולי",
    "voice.micError": "לא ניתן לגשת למיקרופון",
    "voice.transcribeError": "שגיאה בתמלול",

    // ConnectedUsers
    "users.live": "LIVE",
    "users.dialogTitle": "מי מחובר?",
    "users.members": "משתפים ברשימה",
    "users.owner": "בעלים",
    "users.inviteFamily": "הזמן בני משפחה",
    "users.inviteDesc": "שתף את הקישור עם בני משפחה והם יצטרפו אוטומטית",
    "share.copy": "העתק",
    "share.copied": "הועתק",
    "users.noName": "משתמש ללא שם",

    // Language names
    "lang.he": "עברית",
    "lang.en": "English",
    "lang.ru": "Русский",

    // Auth - Login
    "auth.login.title": "ברוכים הבאים",
    "auth.login.subtitle": "התחבר לחשבון שלך",
    "auth.login.email": "אימייל",
    "auth.login.password": "סיסמה",
    "auth.login.submit": "התחבר",
    "auth.login.loading": "מתחבר...",
    "auth.login.google": "המשך עם Google",
    "auth.login.or": "או",
    "auth.login.noAccount": "אין לך חשבון?",
    "auth.login.createOne": "צור חשבון",
    "auth.login.forgotPassword": "שכחת סיסמה?",
    "auth.login.error": "אימייל או סיסמה שגויים",

    // Auth - Register
    "auth.register.title": "צור חשבון",
    "auth.register.subtitle": "הירשם כדי להתחיל",
    "auth.register.email": "אימייל",
    "auth.register.password": "סיסמה",
    "auth.register.confirmPassword": "אישור סיסמה",
    "auth.register.submit": "צור חשבון",
    "auth.register.loading": "יוצר חשבון...",
    "auth.register.google": "המשך עם Google",
    "auth.register.or": "או",
    "auth.register.haveAccount": "כבר יש לך חשבון?",
    "auth.register.login": "התחבר",
    "auth.register.verifyTitle": "אמת את האימייל",
    "auth.register.verifySubtitle": "שלחנו קוד ל-{email}",
    "auth.register.verify": "אמת",
    "auth.register.verifying": "מאמת...",
    "auth.register.noCode": "לא קיבלת את הקוד?",
    "auth.register.resend": "שלח שוב",
    "auth.register.codeSent": "קוד נשלח",
    "auth.register.codeSentDesc": "בדוק את האימייל לקוד החדש.",
    "auth.register.passwordMismatch": "הסיסמאות אינן תואמות",
    "auth.register.failed": "ההרשמה נכשלה",
    "auth.register.invalidCode": "קוד אימות שגוי",
    "auth.register.resendFailed": "שליחת הקוד נכשלה",

    // Auth - ForgotPassword
    "auth.forgot.title": "איפוס סיסמה",
    "auth.forgot.subtitle": "נשלח לך קישור לאיפוס",
    "auth.forgot.email": "כתובת אימייל",
    "auth.forgot.submit": "שלח קישור איפוס",
    "auth.forgot.loading": "שולח...",
    "auth.forgot.back": "חזרה להתחברות",
    "auth.forgot.success": "אם קיים חשבון עם אימייל זה, תקבל קישור לאיפוס סיסמה בקרוב.",

    // Auth - ResetPassword
    "auth.reset.title": "סיסמה חדשה",
    "auth.reset.subtitle": "הזן את הסיסמה החדשה שלך",
    "auth.reset.newPassword": "סיסמה חדשה",
    "auth.reset.confirmPassword": "אישור סיסמה",
    "auth.reset.submit": "אפס סיסמה",
    "auth.reset.loading": "מאפס...",
    "auth.reset.passwordMismatch": "הסיסמאות אינן תואמות",
    "auth.reset.failed": "איפוס הסיסמה נכשל",
    "auth.reset.invalidLink": "קישור איפוס שגוי",
    "auth.reset.invalidLinkDesc": "קישור איפוס הסיסמה חסר או לא תקין",
    "auth.reset.requestNew": "בקש קישור חדש",
    "auth.reset.incomplete": "הקישור שהשתמשת בו נראה חלקי. אנא בקש אימייל חדש לאיפוס סיסמה.",
  },
  en: {
    // App
    "app.loading": "Loading...",
    "app.name": "What to Buy?",

    // Header
    "header.greeting": "Hi! What to Buy {name} 👋",
    "header.changeName": "Change name",
    "header.settings": "Settings",
    "header.share": "Share",
    "header.language": "Language",

    // Footer
    "footer.credit": "Developed by Alan Novitsky",

    // ListView
    "list.notFound": "List not found",
    "list.toBuy": "To Buy",
    "list.bought": "Bought",
    "list.total": "Total:",
    "list.empty": "List is Empty",
    "list.emptyDesc": "Add products with the button below",
    "list.boughtSection": "Bought ✓",
    "list.clear": "Clear",
    "list.clearedBought": "Bought items cleared",
    "list.addedToList": "{name} added to list",
    "list.userAdded": "{email} added to list",

    // ProductSearchDialog
    "search.title": "Search Products",
    "search.placeholder": "Search product... (milk, mint, bread...)",
    "search.byPrice": "By Price",
    "search.byLocation": "By Location",
    "search.locationUnsupported": "Browser doesn't support location",
    "search.locationError": "Cannot access location, please allow permission",
    "search.showingNearby": "Showing nearby stores",
    "search.loadingProducts": "Loading products...",
    "search.searchPrompt": "Search for a product",
    "search.noResults": "No results, try another word",
    "search.suggestions": "Recommendations for you",
    "search.voiceSearch": "Voice search",
    "search.km": "km",

    // ShareDialog
    "share.title": "Share the List",
    "share.sendEmail": "Send email invite",
    "share.emailPlaceholder": "Type your partner's email...",
    "share.send": "Send",
    "share.emailNote": "The email will include a direct link to join the list 🎉",
    "share.or": "or",
    "share.yourLink": "Your unique link",
    "share.linkCopied": "Link copied!",
    "share.shareNote": "Share the link with family and friends and they'll join the list automatically!",
    "share.invalidEmail": "Invalid email address",
    "share.inviteSent": "Invitation sent to {email} 🎉",
    "share.emailFailed": "Email sending failed",
    "share.emailFailedDesc": "The address may not be registered. You can share a link instead.",

    // ProfileDialog
    "profile.title": "My Name in the List",
    "profile.preview": "This is how your name will appear to others",
    "profile.noName": "No name set",
    "profile.placeholder": "Enter your name...",
    "profile.save": "Save Name",
    "profile.saving": "Saving...",
    "profile.required": "A name is required to continue",

    // SettingsDialog
    "settings.title": "Settings",
    "settings.pushNotifications": "Push Notifications",
    "settings.pushDesc": "Notify your partner when an item is bought",
    "settings.pushEnabled": "Notifications enabled",
    "settings.pushDisabled": "Notifications disabled",
    "settings.pushInfo": "Push notifications require a native app build (iOS/Android). The preference is saved and will activate automatically when you build the app.",
    "settings.history": "Shopping History",
    "settings.historyDesc": "View previously purchased items",
    "settings.summary": "Shopping Summary",
    "settings.summaryDesc": "Total expenses and category breakdown",
    "settings.error": "Settings update error",

    // NavigateToStoreDialog
    "navigate.title": "Navigate to Store",
    "navigate.recommended": "Recommended store for",
    "navigate.howToArrive": "How would you like to arrive?",
    "navigate.walk": "Walking",
    "navigate.drive": "Driving",
    "navigate.supermarket": "supermarket",

    // ShoppingHistory
    "history.title": "Shopping History",
    "history.desc": "All items bought in this list",
    "history.scanReceipt": "Scan Receipt",
    "history.totalExpenses": "Total Expenses",
    "history.itemsBought": "Items Bought",
    "history.noHistory": "No History Yet",
    "history.noHistoryDesc": "Bought and deleted items will appear here",
    "history.units": "pcs",
    "history.receiptScanned": "{count} items added from receipt",
    "history.noItemsInReceipt": "No items detected in receipt",
    "history.receiptError": "Receipt scanning error",

    // ShoppingSummary
    "summary.title": "Shopping Summary",
    "summary.desc": "Expense analysis and data breakdown",
    "summary.totalSpent": "Total Expenses",
    "summary.itemsBought": "Items Bought",
    "summary.byCategory": "Expenses by Category",
    "summary.byBuyer": "Purchases by User",
    "summary.noData": "No Data Yet",
    "summary.noDataDesc": "Buy items to see summary",
    "summary.items": "items",
    "summary.unknown": "Unknown",
    "summary.other": "Other",

    // JoinList
    "join.searching": "Searching for list...",
    "join.joining": "Joining list...",
    "join.success": "Joined successfully!",
    "join.joinedToList": "To list \"{title}\"",
    "join.alreadyIn": "You are already in the list!",
    "join.movingTo": "Moving to list \"{title}\"...",
    "join.notFound": "List not found",
    "join.notFoundDesc": "The link may be incorrect",
    "join.backHome": "Back to home",
    "join.full": "List is full",
    "join.fullDesc": "Up to 5 people can be shared",
    "join.error": "Error loading list",

    // Home/Welcome
    "welcome.title": "MaKonim",
    "welcome.subtitle": "Shared Shopping List",
    "welcome.namePlaceholder": "What's your name?",
    "welcome.start": "Let's start shopping 🛒",

    // ProductItem
    "productItem.navigate": "Navigate",
    "productItem.undoBought": "Undo purchase",

    // QuickAddBar
    "quickAdd.search": "Search & Discover Products",

    // ListReader
    "reader.read": "Read",
    "reader.stop": "Stop",
    "reader.units": "units",
    "reader.oneUnit": "one unit",

    // ReceiptScanner
    "receipt.scan": "Scan Receipt",

    // VoiceSearch
    "voice.title": "Voice search",
    "voice.micError": "Cannot access microphone",
    "voice.transcribeError": "Transcription error",

    // ConnectedUsers
    "users.live": "LIVE",
    "users.dialogTitle": "Who's Connected?",
    "users.members": "List Members",
    "users.owner": "Owner",
    "users.inviteFamily": "Invite Family",
    "users.inviteDesc": "Share the link with family and they'll join automatically",
    "share.copy": "Copy",
    "share.copied": "Copied",
    "users.noName": "No Name",

    // Language names
    "lang.he": "עברית",
    "lang.en": "English",
    "lang.ru": "Русский",

    // Auth - Login
    "auth.login.title": "Welcome back",
    "auth.login.subtitle": "Log in to your account",
    "auth.login.email": "Email",
    "auth.login.password": "Password",
    "auth.login.submit": "Log in",
    "auth.login.loading": "Logging in...",
    "auth.login.google": "Continue with Google",
    "auth.login.or": "or",
    "auth.login.noAccount": "Don't have an account?",
    "auth.login.createOne": "Create one",
    "auth.login.forgotPassword": "Forgot password?",
    "auth.login.error": "Invalid email or password",

    // Auth - Register
    "auth.register.title": "Create your account",
    "auth.register.subtitle": "Sign up to get started",
    "auth.register.email": "Email",
    "auth.register.password": "Password",
    "auth.register.confirmPassword": "Confirm Password",
    "auth.register.submit": "Create account",
    "auth.register.loading": "Creating account...",
    "auth.register.google": "Continue with Google",
    "auth.register.or": "or",
    "auth.register.haveAccount": "Already have an account?",
    "auth.register.login": "Log in",
    "auth.register.verifyTitle": "Verify your email",
    "auth.register.verifySubtitle": "We sent a code to {email}",
    "auth.register.verify": "Verify",
    "auth.register.verifying": "Verifying...",
    "auth.register.noCode": "Didn't receive the code?",
    "auth.register.resend": "Resend",
    "auth.register.codeSent": "Code sent",
    "auth.register.codeSentDesc": "Check your email for the new code.",
    "auth.register.passwordMismatch": "Passwords do not match",
    "auth.register.failed": "Registration failed",
    "auth.register.invalidCode": "Invalid verification code",
    "auth.register.resendFailed": "Failed to resend code",

    // Auth - ForgotPassword
    "auth.forgot.title": "Reset password",
    "auth.forgot.subtitle": "We'll send you a link to reset it",
    "auth.forgot.email": "Email address",
    "auth.forgot.submit": "Send reset link",
    "auth.forgot.loading": "Sending...",
    "auth.forgot.back": "Back to log in",
    "auth.forgot.success": "If an account exists with that email, you'll receive a password reset link shortly.",

    // Auth - ResetPassword
    "auth.reset.title": "New password",
    "auth.reset.subtitle": "Enter your new password below",
    "auth.reset.newPassword": "New Password",
    "auth.reset.confirmPassword": "Confirm Password",
    "auth.reset.submit": "Reset password",
    "auth.reset.loading": "Resetting...",
    "auth.reset.passwordMismatch": "Passwords do not match",
    "auth.reset.failed": "Failed to reset password",
    "auth.reset.invalidLink": "Invalid reset link",
    "auth.reset.invalidLinkDesc": "This password reset link is missing or invalid",
    "auth.reset.requestNew": "Request a new link",
    "auth.reset.incomplete": "The link you used appears to be incomplete. Please request a new password reset email.",
  },
  ru: {
    // App
    "app.loading": "Загрузка...",
    "app.name": "Что купить?",

    // Header
    "header.greeting": "Привет! Что купить {name} 👋",
    "header.changeName": "Изменить имя",
    "header.settings": "Настройки",
    "header.share": "Поделиться",
    "header.language": "Язык",

    // Footer
    "footer.credit": "Разработано Аланом Новицким",

    // ListView
    "list.notFound": "Список не найден",
    "list.toBuy": "Купить",
    "list.bought": "Куплено",
    "list.total": "Итого:",
    "list.empty": "Список пуст",
    "list.emptyDesc": "Добавьте товары кнопкой ниже",
    "list.boughtSection": "Куплено ✓",
    "list.clear": "Очистить",
    "list.clearedBought": "Купленные товары удалены",
    "list.addedToList": "{name} добавлен в список",
    "list.userAdded": "{email} добавлен в список",

    // ProductSearchDialog
    "search.title": "Поиск продуктов",
    "search.placeholder": "Искать продукт... (молоко, мята, хлеб...)",
    "search.byPrice": "По цене",
    "search.byLocation": "По расположению",
    "search.locationUnsupported": "Браузер не поддерживает геолокацию",
    "search.locationError": "Нет доступа к геолокации, разрешите доступ",
    "search.showingNearby": "Показываем ближайшие магазины",
    "search.loadingProducts": "Загрузка продуктов...",
    "search.searchPrompt": "Найдите продукт",
    "search.noResults": "Нет результатов, попробуйте другое слово",
    "search.suggestions": "Рекомендации для вас",
    "search.voiceSearch": "Голосовой поиск",
    "search.km": "км",

    // ShareDialog
    "share.title": "Поделиться списком",
    "share.sendEmail": "Отправить приглашение по email",
    "share.emailPlaceholder": "Введите email партнёра...",
    "share.send": "Отправить",
    "share.emailNote": "Письмо придёт с прямой ссылкой для присоединения 🎉",
    "share.or": "или",
    "share.yourLink": "Ваша уникальная ссылка",
    "share.linkCopied": "Ссылка скопирована!",
    "share.shareNote": "Поделитесь ссылкой с семьёй и друзьями — они присоединятся автоматически!",
    "share.invalidEmail": "Неверный email",
    "share.inviteSent": "Приглашение отправлено {email} 🎉",
    "share.emailFailed": "Не удалось отправить email",
    "share.emailFailedDesc": "Адрес может быть не зарегистрирован. Можно поделиться ссылкой.",

    // ProfileDialog
    "profile.title": "Моё имя в списке",
    "profile.preview": "Так ваше имя будут видеть другие",
    "profile.noName": "Имя не задано",
    "profile.placeholder": "Введите имя...",
    "profile.save": "Сохранить имя",
    "profile.saving": "Сохранение...",
    "profile.required": "Необходимо ввести имя",

    // SettingsDialog
    "settings.title": "Настройки",
    "settings.pushNotifications": "Push-уведомления",
    "settings.pushDesc": "Уведомить партнёра при покупке товара",
    "settings.pushEnabled": "Уведомления включены",
    "settings.pushDisabled": "Уведомления отключены",
    "settings.pushInfo": "Push-уведомления требуют нативного приложения (iOS/Android). Настройка сохранится и активируется при сборке приложения.",
    "settings.history": "История покупок",
    "settings.historyDesc": "Просмотр купленных ранее товаров",
    "settings.summary": "Сводка покупок",
    "settings.summaryDesc": "Всего расходов и разбивка по категориям",
    "settings.error": "Ошибка обновления настроек",

    // NavigateToStoreDialog
    "navigate.title": "Навигация к магазину",
    "navigate.recommended": "Рекомендуемый магазин для",
    "navigate.howToArrive": "Как хотите добраться?",
    "navigate.walk": "Пешком",
    "navigate.drive": "На машине",
    "navigate.supermarket": "супермаркет",

    // ShoppingHistory
    "history.title": "История покупок",
    "history.desc": "Все товары, купленные в этом списке",
    "history.scanReceipt": "Сканировать чек",
    "history.totalExpenses": "Всего расходов",
    "history.itemsBought": "Куплено товаров",
    "history.noHistory": "Истории пока нет",
    "history.noHistoryDesc": "Купленные и удалённые товары появятся здесь",
    "history.units": "шт.",
    "history.receiptScanned": "{count} товаров добавлено из чека",
    "history.noItemsInReceipt": "В чеке не найдено товаров",
    "history.receiptError": "Ошибка сканирования чека",

    // ShoppingSummary
    "summary.title": "Сводка покупок",
    "summary.desc": "Анализ расходов и разбивка данных",
    "summary.totalSpent": "Всего расходов",
    "summary.itemsBought": "Куплено товаров",
    "summary.byCategory": "Расходы по категориям",
    "summary.byBuyer": "Покупки по пользователям",
    "summary.noData": "Данных пока нет",
    "summary.noDataDesc": "Купите товары, чтобы увидеть сводку",
    "summary.items": "товаров",
    "summary.unknown": "Неизвестно",
    "summary.other": "Другое",

    // JoinList
    "join.searching": "Поиск списка...",
    "join.joining": "Присоединение к списку...",
    "join.success": "Успешно присоединились!",
    "join.joinedToList": "К списку \"{title}\"",
    "join.alreadyIn": "Вы уже в списке!",
    "join.movingTo": "Переход к списку \"{title}\"...",
    "join.notFound": "Список не найден",
    "join.notFoundDesc": "Возможно, ссылка неверная",
    "join.backHome": "На главную",
    "join.full": "Список заполнен",
    "join.fullDesc": "Можно поделиться с 5 людьми",
    "join.error": "Ошибка загрузки списка",

    // Home/Welcome
    "welcome.title": "MaKonim",
    "welcome.subtitle": "Совместный список покупок",
    "welcome.namePlaceholder": "Как вас зовут?",
    "welcome.start": "Начнём покупки 🛒",

    // ProductItem
    "productItem.navigate": "Навигация",
    "productItem.undoBought": "Отменить покупку",

    // QuickAddBar
    "quickAdd.search": "Поиск продуктов",

    // ListReader
    "reader.read": "Озвучить",
    "reader.stop": "Стоп",
    "reader.units": "шт.",
    "reader.oneUnit": "1 шт.",

    // ReceiptScanner
    "receipt.scan": "Сканировать чек",

    // VoiceSearch
    "voice.title": "Голосовой поиск",
    "voice.micError": "Нет доступа к микрофону",
    "voice.transcribeError": "Ошибка транскрипции",

    // ConnectedUsers
    "users.live": "LIVE",
    "users.dialogTitle": "Кто подключен?",
    "users.members": "Участники списка",
    "users.owner": "Владелец",
    "users.inviteFamily": "Пригласить семью",
    "users.inviteDesc": "Поделитесь ссылкой с семьёй — они присоединятся автоматически",
    "share.copy": "Копировать",
    "share.copied": "Скопировано",
    "users.noName": "Без имени",

    // Language names
    "lang.he": "עברית",
    "lang.en": "English",
    "lang.ru": "Русский",

    // Auth - Login
    "auth.login.title": "С возвращением",
    "auth.login.subtitle": "Войдите в свой аккаунт",
    "auth.login.email": "Email",
    "auth.login.password": "Пароль",
    "auth.login.submit": "Войти",
    "auth.login.loading": "Вход...",
    "auth.login.google": "Продолжить с Google",
    "auth.login.or": "или",
    "auth.login.noAccount": "Нет аккаунта?",
    "auth.login.createOne": "Создать",
    "auth.login.forgotPassword": "Забыли пароль?",
    "auth.login.error": "Неверный email или пароль",

    // Auth - Register
    "auth.register.title": "Создайте аккаунт",
    "auth.register.subtitle": "Зарегистрируйтесь, чтобы начать",
    "auth.register.email": "Email",
    "auth.register.password": "Пароль",
    "auth.register.confirmPassword": "Подтвердите пароль",
    "auth.register.submit": "Создать аккаунт",
    "auth.register.loading": "Создание аккаунта...",
    "auth.register.google": "Продолжить с Google",
    "auth.register.or": "или",
    "auth.register.haveAccount": "Уже есть аккаунт?",
    "auth.register.login": "Войти",
    "auth.register.verifyTitle": "Подтвердите email",
    "auth.register.verifySubtitle": "Мы отправили код на {email}",
    "auth.register.verify": "Подтвердить",
    "auth.register.verifying": "Проверка...",
    "auth.register.noCode": "Не получили код?",
    "auth.register.resend": "Отправить снова",
    "auth.register.codeSent": "Код отправлен",
    "auth.register.codeSentDesc": "Проверьте email для нового кода.",
    "auth.register.passwordMismatch": "Пароли не совпадают",
    "auth.register.failed": "Регистрация не удалась",
    "auth.register.invalidCode": "Неверный код подтверждения",
    "auth.register.resendFailed": "Не удалось отправить код",

    // Auth - ForgotPassword
    "auth.forgot.title": "Сброс пароля",
    "auth.forgot.subtitle": "Мы отправим ссылку для сброса",
    "auth.forgot.email": "Email адрес",
    "auth.forgot.submit": "Отправить ссылку",
    "auth.forgot.loading": "Отправка...",
    "auth.forgot.back": "Назад ко входу",
    "auth.forgot.success": "Если аккаунт с этим email существует, вы получите ссылку для сброса пароля.",

    // Auth - ResetPassword
    "auth.reset.title": "Новый пароль",
    "auth.reset.subtitle": "Введите новый пароль",
    "auth.reset.newPassword": "Новый пароль",
    "auth.reset.confirmPassword": "Подтвердите пароль",
    "auth.reset.submit": "Сбросить пароль",
    "auth.reset.loading": "Сброс...",
    "auth.reset.passwordMismatch": "Пароли не совпадают",
    "auth.reset.failed": "Не удалось сбросить пароль",
    "auth.reset.invalidLink": "Неверная ссылка сброса",
    "auth.reset.invalidLinkDesc": "Ссылка для сброса отсутствует или недействительна",
    "auth.reset.requestNew": "Запросить новую ссылку",
    "auth.reset.incomplete": "Ссылка неполная. Пожалуйста, запросите новое письмо для сброса пароля.",
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "he";
  });

  const dir = lang === "he" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, dir]);

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
  }, []);

  const t = useCallback((key, vars) => {
    let str = translations[lang]?.[key] || translations.he[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), v);
      });
    }
    return str;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useT() {
  const { t } = useLanguage();
  return t;
}