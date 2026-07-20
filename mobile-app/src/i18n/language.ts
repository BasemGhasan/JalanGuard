import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from './index';

/**
 * Language selection and persistence.
 *
 * Resolution order on cold start: the user's saved choice, then the device
 * locale (so a Malaysian phone opens in Malay without being asked), then
 * English. The choice is applied before the first render — see App.tsx — so the
 * UI never flashes from one language to the other.
 */
const LANGUAGE_KEY = 'jalanguard.language';

export const SUPPORTED_LANGUAGES = ['en', 'ms'] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

function isSupported(value: string | null | undefined): value is LanguageCode {
  return SUPPORTED_LANGUAGES.includes(value as LanguageCode);
}

/** The device's preferred language, when we have translations for it. */
function deviceLanguage(): LanguageCode {
  const code = Localization.getLocales()[0]?.languageCode;
  return isSupported(code) ? code : 'en';
}

/** Applies the saved (or device-default) language. Call once during startup. */
export async function loadSavedLanguage(): Promise<LanguageCode> {
  let saved: string | null = null;
  try {
    saved = await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch {
    // Fall through to the device default.
  }

  const language = isSupported(saved) ? saved : deviceLanguage();
  await i18n.changeLanguage(language);
  return language;
}

/** Switches language and remembers it for next launch. */
export async function setLanguage(language: LanguageCode): Promise<void> {
  await i18n.changeLanguage(language);
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // The change still applies to this session; only persistence is lost.
  }
}
