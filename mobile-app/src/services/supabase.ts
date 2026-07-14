/**
 * Supabase client for React Native.
 *
 * Ported from the web dashboard's `lib/supabase.ts`, adapted for RN:
 *   - `react-native-url-polyfill` provides the URL API supabase-js expects.
 *   - Sessions persist via AsyncStorage (the web uses localStorage).
 *   - `detectSessionInUrl: false` — there is no URL bar on native; email-link
 *     callbacks are handled by deep links, not hash parsing.
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants/config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
