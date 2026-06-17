/**
 * Custom hook — all data-fetching logic for the JalanGuard map dashboard.
 * Upgraded to support dynamic ADM levels with robust Client-Side Caching.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import type { Hazard, StateChoroplethStat } from "../types/map";

const CACHE_TTL_MS = 10 * 60 * 1000;

interface RawChoroplethRow {
  boundary_id: string;
  state_name?: string;
  country_name?: string;
  district_name?: string;
  boundary_name?: string;
  total_reports: number;
  severity_high_count: number;
  severity_medium_count: number;
  severity_low_count: number;
  geojson?: GeoJSON.Geometry;
}

interface StatsCacheEntry {
  data: StateChoroplethStat[];
  fetchedAt: number;
}

interface HazardsCacheEntry {
  data: Hazard[];
  fetchedAt: number;
}

function isFresh(fetchedAt: number, now: number): boolean {
  return now - fetchedAt < CACHE_TTL_MS;
}

function normalizeChoroplethRows(rows: RawChoroplethRow[]): StateChoroplethStat[] {
  return rows
    .filter((row) => Boolean(row.geojson))
    .map((row) => ({
      id: row.boundary_id,
      state_name: row.state_name ?? row.country_name ?? row.district_name ?? row.boundary_name ?? "Unknown Area",
      iso_code: row.boundary_id,
      geojson: row.geojson as GeoJSON.Geometry,
      total_reports: row.total_reports,
      high_severity_count: row.severity_high_count,
      medium_severity_count: row.severity_medium_count,
      low_severity_count: row.severity_low_count,
      high_severity_ratio: row.total_reports > 0
        ? row.severity_high_count / row.total_reports
        : 0,
    }));
}

async function fetchStats(viewName: string): Promise<StateChoroplethStat[]> {
  const { data, error } = await supabase.from(viewName).select("*");
  if (error) throw new Error(error.message);
  return normalizeChoroplethRows((data as RawChoroplethRow[] | null) ?? []);
}

async function fetchHazards(): Promise<Hazard[]> {
  const { data, error } = await supabase.from("hazards").select("*").eq("status", "active");
  if (error) throw new Error(error.message);
  return (data as Hazard[] | null) ?? [];
}

interface UseMapDataReturn {
  stats: StateChoroplethStat[];
  hazards: Hazard[];
  loading: boolean;
  error: Error | null;
  retry: () => void;
}

/**
 * Fetches the dynamic `choropleth_stats_admX` view and active `hazards` from Supabase.
 * @param admLevel 0 (Country), 1 (States), or 2 (Districts). Defaults to 1.
 */
export function useMapData(admLevel: 0 | 1 | 2 = 1): UseMapDataReturn {
  const [stats, setStats] = useState<StateChoroplethStat[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [retryToken, setRetryToken] = useState(0);
  const [refreshTick, setRefreshTick] = useState(0);

  // In-memory cache with timestamps so data refreshes automatically after TTL.
  const statsCache = useRef<Record<number, StatsCacheEntry>>({});
  const hazardsCache = useRef<HazardsCacheEntry | null>(null);
  const lastHandledRetryToken = useRef(0);

  const retry = useCallback(() => setRetryToken((n) => n + 1), []);

  useEffect(() => {
    const intervalId = globalThis.setInterval(() => {
      setRefreshTick((tick) => tick + 1);
    }, CACHE_TTL_MS);

    return () => globalThis.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const now = Date.now();
        const isManualRefresh = retryToken !== lastHandledRetryToken.current;

        const cachedStatsEntry = statsCache.current[admLevel];
        const cachedHazardsEntry = hazardsCache.current;

        const statsFresh = cachedStatsEntry ? isFresh(cachedStatsEntry.fetchedAt, now) : false;
        const hazardsFresh = cachedHazardsEntry ? isFresh(cachedHazardsEntry.fetchedAt, now) : false;

        // If hazards need a refresh, refresh stats too so the Choropleth counts stay aligned.
        const needsHazards = !hazardsFresh || isManualRefresh;
        const needsStats = !statsFresh || needsHazards || isManualRefresh;

        const viewName = `choropleth_stats_adm${admLevel}`;

        const statsPromise = needsStats
          ? fetchStats(viewName)
          : Promise.resolve(cachedStatsEntry?.data ?? []);

        const hazardsPromise = needsHazards
          ? fetchHazards()
          : Promise.resolve(cachedHazardsEntry?.data ?? []);

        const [nextStats, nextHazards] = await Promise.all([statsPromise, hazardsPromise]);

        if (!active) return;

        if (needsStats) {
          statsCache.current[admLevel] = { data: nextStats, fetchedAt: now };
        }

        if (needsHazards) {
          hazardsCache.current = { data: nextHazards, fetchedAt: now };
        }

        if (!active) return;

        lastHandledRetryToken.current = retryToken;

        setStats(statsCache.current[admLevel]?.data ?? []);
        setHazards(hazardsCache.current?.data ?? []);

      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err : new Error("An unknown error occurred"));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => { active = false; };
  }, [retryToken, refreshTick, admLevel]);

  return { stats, hazards, loading, error, retry };
}