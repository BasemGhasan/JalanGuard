/**
 * Re-runs a fetch when a tab screen regains focus.
 *
 * Bottom-tab screens stay mounted, so their initial fetch never repeats on its
 * own. This refetches when the screen is focused again (e.g. returning to
 * History right after submitting a report) — but skips the first focus so it
 * doesn't double-fetch on mount alongside the hook's own initial load.
 */
import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function useRefetchOnFocus(refetch: () => void): void {
  const isFirstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refetch();
    }, [refetch]),
  );
}
