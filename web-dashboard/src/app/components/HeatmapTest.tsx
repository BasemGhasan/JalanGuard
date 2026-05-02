import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface StateHeatmapStat {
  id: number;
  state_name: string;
  iso_code: string;
  geojson: object;
  total_reports: number;
  high_severity_count: number;
  medium_severity_count: number;
  low_severity_count: number;
  high_severity_ratio: number;
}

export function HeatmapTest() {
  const [stats, setStats] = useState<StateHeatmapStat[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      console.log("[HeatmapTest] Fetching state_heatmap_stats from Supabase…");

      const { data, error } = await supabase
        .from("state_heatmap_stats")
        .select("*")
        .order("total_reports", { ascending: false });

      if (error) {
        console.error("[HeatmapTest] Error:", error.message);
        setError(error.message);
      } else {
        console.log(
          `[HeatmapTest] ✓ Received ${data.length} states from Supabase:`,
          data
        );
        console.table(
          data.map((s) => ({
            state: s.state_name,
            iso: s.iso_code,
            total: s.total_reports,
            high: s.high_severity_count,
            medium: s.medium_severity_count,
            low: s.low_severity_count,
            "high%": s.high_severity_ratio,
            geojson_type: (s.geojson as any)?.type ?? "—",
          }))
        );
        setStats(data);
      }
      setLoading(false);
    }

    fetchStats();
  }, []);

  return (
    <div className="p-8 text-white">
      <h2 className="text-xl font-semibold mb-1 text-[#d97706]">
        Supabase Connection Test
      </h2>
      <p className="text-[#94a3b8] text-sm mb-6">
        Querying <code className="text-[#38bdf8]">state_heatmap_stats</code>{" "}
        via supabase-js — check the browser console for full GeoJSON output.
      </p>

      {loading && (
        <p className="text-[#94a3b8] animate-pulse">Loading…</p>
      )}

      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
          <strong>Error:</strong> {error}
          {error.includes("does not exist") && (
            <p className="mt-2 text-red-400">
              Run <code>scripts/create_heatmap_view.sql</code> in your Supabase
              SQL Editor first, then refresh.
            </p>
          )}
        </div>
      )}

      {stats && (
        <div className="space-y-2">
          <p className="text-emerald-400 text-sm font-medium mb-4">
            ✓ {stats.length} states returned — GeoJSON geometry confirmed in console.
          </p>
          <div className="overflow-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-[#94a3b8]">
                  <th className="text-left px-4 py-3">State</th>
                  <th className="text-left px-4 py-3">ISO</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-right px-4 py-3">High</th>
                  <th className="text-right px-4 py-3">Medium</th>
                  <th className="text-right px-4 py-3">Low</th>
                  <th className="text-right px-4 py-3">High %</th>
                  <th className="text-left px-4 py-3">GeoJSON Type</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-2 text-white font-medium">{s.state_name}</td>
                    <td className="px-4 py-2 text-[#94a3b8]">{s.iso_code}</td>
                    <td className="px-4 py-2 text-right text-[#d97706] font-semibold">
                      {s.total_reports}
                    </td>
                    <td className="px-4 py-2 text-right text-red-400">{s.high_severity_count}</td>
                    <td className="px-4 py-2 text-right text-yellow-400">{s.medium_severity_count}</td>
                    <td className="px-4 py-2 text-right text-emerald-400">{s.low_severity_count}</td>
                    <td className="px-4 py-2 text-right text-[#94a3b8]">
                      {s.high_severity_ratio}%
                    </td>
                    <td className="px-4 py-2 text-[#38bdf8] text-xs">
                      {(s.geojson as any)?.type ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
