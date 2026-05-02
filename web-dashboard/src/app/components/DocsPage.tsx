import { Copy, Check } from "lucide-react";

const params = [
  { name: "severity", type: "string", desc: "Filter by hazard severity: low, medium, high" },
  { name: "status", type: "string", desc: "Issue lifecycle: reported, verified, resolved" },
  { name: "bbox", type: "float[4]", desc: "Bounding box: minLng,minLat,maxLng,maxLat" },
];

export function DocsPage() {
  return (
    <div className="px-20 py-16" style={{ minHeight: "calc(1024px - 64px)" }}>
      <div className="grid grid-cols-2 gap-16 max-w-[1280px] mx-auto">
        {/* Left column */}
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-[#1e293b] text-[#d97706] mb-4 border border-[#d97706]/20" style={{ fontSize: "12px", fontWeight: 600 }}>
            v1.2 · STABLE
          </div>
          <h1 className="text-white mb-3" style={{ fontSize: "44px", fontWeight: 700, lineHeight: 1.1 }}>
            API Reference
          </h1>
          <p className="text-[#94a3b8] mb-10" style={{ fontSize: "17px", lineHeight: 1.6 }}>
            Integrate verified road hazard data into your applications. All endpoints return JSON and require an API key.
          </p>

          <h3 className="text-white mb-4" style={{ fontSize: "16px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Query Parameters
          </h3>

          <div className="rounded-2xl border border-white/5 bg-[#1e293b] overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_2fr] px-5 py-3 border-b border-white/5 bg-[#0f172a]">
              <span className="text-[#94a3b8]" style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Parameter</span>
              <span className="text-[#94a3b8]" style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</span>
              <span className="text-[#94a3b8]" style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</span>
            </div>
            {params.map((p, i) => (
              <div
                key={p.name}
                className={`grid grid-cols-[1fr_1fr_2fr] px-5 py-4 ${i < params.length - 1 ? "border-b border-white/5" : ""}`}
              >
                <code className="text-[#d97706] font-mono">{p.name}</code>
                <code className="text-[#94a3b8] font-mono" style={{ fontSize: "13px" }}>{p.type}</code>
                <span className="text-white" style={{ fontSize: "14px" }}>{p.desc}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-[#1e293b]/50 border border-white/5 flex gap-3 items-start">
            <Check className="w-5 h-5 text-[#d97706] mt-0.5 flex-shrink-0" />
            <p className="text-[#94a3b8]" style={{ fontSize: "14px" }}>
              Community Rate Limit: 500 requests / day.
            </p>
          </div>
        </div>

        {/* Right column - code */}
        <div className="pt-16">
          <div className="rounded-2xl bg-[#0f172a] border border-white/5 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/20">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/60" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <span className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="ml-3 text-[#94a3b8] font-mono" style={{ fontSize: "12px" }}>request.js</span>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors">
                <Copy className="w-3.5 h-3.5" />
                <span style={{ fontSize: "12px" }}>Copy</span>
              </button>
            </div>
            <pre className="p-6 font-mono overflow-x-auto" style={{ fontSize: "13px", lineHeight: 1.7 }}>
<code>
<span className="text-[#94a3b8]">{`// Fetch high-severity hazards in KL`}</span>{"\n"}
<span className="text-[#c084fc]">const</span> <span className="text-white">response</span> <span className="text-[#94a3b8]">=</span> <span className="text-[#c084fc]">await</span> <span className="text-[#60a5fa]">fetch</span><span className="text-white">(</span>{"\n"}
{"  "}<span className="text-[#86efac]">{`"https://api.jalanguard.org/v1/hazards?"`}</span> <span className="text-[#94a3b8]">+</span>{"\n"}
{"  "}<span className="text-[#60a5fa]">new</span> <span className="text-[#fbbf24]">URLSearchParams</span><span className="text-white">({"{"}</span>{"\n"}
{"    "}<span className="text-white">severity</span><span className="text-[#94a3b8]">:</span> <span className="text-[#86efac]">{`"high"`}</span><span className="text-[#94a3b8]">,</span>{"\n"}
{"    "}<span className="text-white">status</span><span className="text-[#94a3b8]">:</span> <span className="text-[#86efac]">{`"verified"`}</span><span className="text-[#94a3b8]">,</span>{"\n"}
{"    "}<span className="text-white">bbox</span><span className="text-[#94a3b8]">:</span> <span className="text-[#86efac]">{`"101.6,3.1,101.7,3.2"`}</span>{"\n"}
{"  "}<span className="text-white">{`})`}</span><span className="text-[#94a3b8]">,</span>{"\n"}
{"  "}<span className="text-white">{"{"}</span>{"\n"}
{"    "}<span className="text-white">headers</span><span className="text-[#94a3b8]">:</span> <span className="text-white">{"{"}</span>{"\n"}
{"      "}<span className="text-[#86efac]">{`"X-API-Key"`}</span><span className="text-[#94a3b8]">:</span> <span className="text-white">process</span><span className="text-[#94a3b8]">.</span><span className="text-white">env</span><span className="text-[#94a3b8]">.</span><span className="text-white">JG_KEY</span>{"\n"}
{"    "}<span className="text-white">{"}"}</span>{"\n"}
{"  "}<span className="text-white">{"}"}</span>{"\n"}
<span className="text-white">);</span>{"\n\n"}
<span className="text-[#c084fc]">const</span> <span className="text-white">hazards</span> <span className="text-[#94a3b8]">=</span> <span className="text-[#c084fc]">await</span> <span className="text-white">response</span><span className="text-[#94a3b8]">.</span><span className="text-[#fbbf24]">json</span><span className="text-white">();</span>{"\n"}
<span className="text-white">console</span><span className="text-[#94a3b8]">.</span><span className="text-[#fbbf24]">log</span><span className="text-white">(hazards</span><span className="text-[#94a3b8]">.</span><span className="text-white">features</span><span className="text-[#94a3b8]">.</span><span className="text-white">length);</span>
</code>
            </pre>
          </div>

          <div className="mt-6 rounded-2xl bg-[#0f172a] border border-white/5 overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 bg-black/20 flex items-center justify-between">
              <span className="text-[#94a3b8] font-mono" style={{ fontSize: "12px" }}>response · 200 OK</span>
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400" style={{ fontSize: "11px", fontWeight: 600 }}>JSON</span>
            </div>
            <pre className="p-6 font-mono" style={{ fontSize: "13px", lineHeight: 1.7 }}>
<code>
<span className="text-white">{"{"}</span>{"\n"}
{"  "}<span className="text-[#86efac]">{`"type"`}</span><span className="text-[#94a3b8]">:</span> <span className="text-[#86efac]">{`"FeatureCollection"`}</span><span className="text-[#94a3b8]">,</span>{"\n"}
{"  "}<span className="text-[#86efac]">{`"count"`}</span><span className="text-[#94a3b8]">:</span> <span className="text-[#fbbf24]">42</span>{"\n"}
<span className="text-white">{"}"}</span>
</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
