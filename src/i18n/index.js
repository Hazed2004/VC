import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.js";

// Order of the language picker. Labels are in their own language on purpose.
export const LANGUAGES = [{ code: "en", label: "English" }];

i18next.use(LanguageDetector).init({
  resources: {
    en: { translation: en },
  },
  supportedLngs: LANGUAGES.map((l) => l.code),
  fallbackLng: "en",
  // Resources are bundled, so init can finish before the page renders.
  initAsync: false,
  // Strings are written with textContent; only the *-html keys use innerHTML,
  // and those never interpolate user input.
  interpolation: { escapeValue: false },
  detection: {
    // No querystring: game.js forwards location.search to the engine.
    order: ["localStorage", "navigator"],
    lookupLocalStorage: "vc-lang",
    caches: ["localStorage"],
  },
});

export const t = (key, options) => i18next.t(key, options);

export function currentLanguage() {
  return i18next.resolvedLanguage || "en";
}

// Sets a translated text and remembers the key, so a language switch can
// translate it again.
export function setText(el, key, options) {
  if (!el) return;
  el.dataset.i18n = key;
  if (options) el.dataset.i18nOptions = JSON.stringify(options);
  else delete el.dataset.i18nOptions;
  el.textContent = t(key, options);
}

// Sets text that is not translated (a file name, a percentage).
export function setRawText(el, text) {
  if (!el) return;
  delete el.dataset.i18n;
  delete el.dataset.i18nOptions;
  el.textContent = text;
}

export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const options = el.dataset.i18nOptions ? JSON.parse(el.dataset.i18nOptions) : undefined;
    el.textContent = t(el.dataset.i18n, options);
  });
  root.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  root.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    el.alt = t(el.dataset.i18nAlt);
  });
  root.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
  });
  document.documentElement.lang = currentLanguage();
  document.title = t("meta.title");
}

export function changeLanguage(code) {
  return i18next.changeLanguage(code);
}

// The legacy scripts in public/ are not modules; they reach i18n through
// these globals. They listen for "vc:languagechange" to redraw their lists.
i18next.on("languageChanged", () => {
  applyTranslations();
  window.dispatchEvent(new Event("vc:languagechange"));
});

window.t = t;
window.vcI18n = { t, setText, setRawText, currentLanguage };
