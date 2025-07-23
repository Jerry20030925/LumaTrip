import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en-US.json';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import ja from './locales/ja-JP.json';
import ko from './locales/ko-KR.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'en', // 默认回退到英文
    lng: 'en', // 默认语言设为英文
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      // 检测顺序：localStorage > sessionStorage > navigator > htmlTag
      order: ['localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      // 缓存语言选择
      caches: ['localStorage'],
    },
    resources: {
      en: { translation: en },
      'zh-CN': { translation: zhCN },
      'zh-TW': { translation: zhTW },
      ja: { translation: ja },
      ko: { translation: ko },
    },
  });

export default i18n;