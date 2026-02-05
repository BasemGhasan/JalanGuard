/**
 * i18n Configuration for JalanGuard
 * Supports English (en) and Malay (ms)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import ms from './locales/ms.json';

const resources = {
    en: { translation: en },
    ms: { translation: ms },
};

// Get device language, default to English
const getDeviceLanguage = (): string => {
    const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en';
    return ['en', 'ms'].includes(deviceLocale) ? deviceLocale : 'en';
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: getDeviceLanguage(),
        fallbackLng: 'en',
        compatibilityJSON: 'v3',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

export default i18n;
