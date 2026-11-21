import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import zh from "./locales/zh.json"
import en from "./locales/en.json"

const savedLang = (() => {
  try {
    return localStorage.getItem("lang") as "zh" | "en" | null
  } catch {
    return null
  }
})()

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  // 默认中文；用户手动切换后记住选择
  lng: savedLang || "zh",
  fallbackLng: "zh",
  interpolation: { escapeValue: false },
  saveMissing: false,
})

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem("lang", lng)
  } catch {}
})

export default i18n
