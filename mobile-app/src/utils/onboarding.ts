import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * "Has the user seen the onboarding carousel?" flag.
 *
 * Onboarding is a one-time introduction, so the splash screen reads this to
 * decide whether to route into the carousel or straight to login. The flag is
 * written the moment the user leaves onboarding by any route (Skip, Get
 * started, or the "already have an account" link) — not on the last slide —
 * so a user who skips never sees it again either.
 *
 * Storage failures are swallowed: at worst the carousel shows once more, which
 * is far better than blocking app start on a disk error.
 */
const ONBOARDING_SEEN_KEY = 'jalanguard.onboardingSeen';

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_SEEN_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
  } catch {
    // Ignore — see note above.
  }
}
