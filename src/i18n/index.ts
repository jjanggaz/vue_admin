import { createI18n } from "vue-i18n";
import ko from "./language/ko.json";
import en from "./language/en.json";

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem("wai_lang") || "ko",
  fallbackLocale: "ko",
  messages: {
    ko,
    en,
  },
});

export default i18n;
