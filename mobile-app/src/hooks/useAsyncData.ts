/**
 * Small async-data primitive shared by the data-backed screens.
 *
 * Standardises the loading / error / retry lifecycle so every screen that reads
 * from Supabase gets the same fallbacks (spinner, error with retry) without
 * duplicating the boilerplate. Guards against setting state after unmount and
 * ignores stale responses when deps change mid-flight.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  /** Re-runs the fetcher (e.g. from a Retry button). */
  retry: () => void;
}

/**
 * @param fetcher  async producer of the data; should be stable or wrapped in
 *                 useCallback by the caller.
 * @param enabled  when false, skips fetching and stays idle (e.g. no user yet).
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, enabled = true): AsyncDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => setReloadToken((n) => n + 1), []);

  // Keep the latest fetcher without making it a dependency (avoids refetch loops
  // when callers pass an inline function).
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    fetcherRef.current()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [enabled, reloadToken]);

  return { data, loading, error, retry };
}
