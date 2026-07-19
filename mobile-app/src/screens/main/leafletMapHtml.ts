/**
 * Self-contained Leaflet document rendered inside a WebView by MapScreen.
 *
 * This is the mobile equivalent of the web dashboard's react-leaflet MapPage:
 * same CARTO dark tiles, same Malaysia bounds/center, same choropleth
 * (dominant-severity fill) and pin layers. RN drives it entirely through two
 * bridges:
 *   - RN → WebView: `window.__render(payload)` is injected whenever data or the
 *     active view changes.
 *   - WebView → RN: `window.ReactNativeWebView.postMessage(...)` reports when the
 *     map is ready and when a hazard pin is tapped.
 *
 * Leaflet + the basemap tiles load from CDNs, so the map (like the rest of the
 * app) requires an internet connection.
 */
export const LEAFLET_MAP_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #0F172A; }
    .leaflet-container { background: #0F172A; }
    .lg-popup .leaflet-popup-content-wrapper {
      background: #0F172A; color: #F8FAFC; border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    .lg-popup .leaflet-popup-tip { background: #0F172A; }
    .lg-popup .leaflet-popup-content { margin: 12px 14px; font-family: -apple-system, system-ui, sans-serif; }
    .lg-badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; }
    .lg-type { margin: 8px 0 6px; font-size: 15px; font-weight: 700; text-transform: capitalize; }
    .lg-row { display: flex; justify-content: space-between; gap: 16px; font-size: 12px; margin: 2px 0; }
    .lg-label { color: #94A3B8; }
    .lg-mono { font-variant-numeric: tabular-nums; }
    .lg-cta { margin-top: 10px; padding: 8px; text-align: center; background: #D97706; color: #fff;
      border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    (function () {
      var SEV = { high: '#D42424', medium: '#EF551D', low: '#F1B70B', none: '#22C55E' };
      var BADGE = {
        high:   { bg: '#D4242420', text: '#D42424', border: '#D4242460' },
        medium: { bg: '#EF551D20', text: '#EF551D', border: '#EF551D60' },
        low:    { bg: '#F1B70B20', text: '#F1B70B', border: '#F1B70B60' }
      };

      function post(msg) {
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }

      var map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        minZoom: 6,
        maxBounds: [[0.8, 99.6], [7.5, 119.3]],
        maxBoundsViscosity: 1.0,
        preferCanvas: true
      }).setView([4.2105, 109.5], 6);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

      var choroplethLayer = null;
      var pinsLayer = null;
      var hazardsById = {};

      function dominantColor(p) {
        if (!p.total_reports) return SEV.none;
        var mx = Math.max(p.high_severity_count, p.medium_severity_count, p.low_severity_count);
        if (p.high_severity_count === mx && p.high_severity_count > 0) return SEV.high;
        if (p.medium_severity_count === mx && p.medium_severity_count > 0) return SEV.medium;
        return SEV.low;
      }

      function buildGeoJSON(stats) {
        return {
          type: 'FeatureCollection',
          features: stats.map(function (s) {
            return {
              type: 'Feature',
              properties: {
                state_name: s.state_name,
                total_reports: s.total_reports,
                high_severity_count: s.high_severity_count,
                medium_severity_count: s.medium_severity_count,
                low_severity_count: s.low_severity_count
              },
              geometry: s.geojson
            };
          })
        };
      }

      function markerIcon(sev) {
        var c = SEV[sev] || SEV.low;
        return L.divIcon({
          className: '',
          html: '<div style="width:14px;height:14px;border-radius:50%;background:' + c +
                ';border:2.5px solid #fff;box-shadow:0 0 8px ' + c + '99;"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });
      }

      // Called from popup HTML (inline onclick) to open the native detail screen.
      window.selectHazard = function (id) {
        var h = hazardsById[id];
        if (h) post({ type: 'select', hazard: h });
      };

      function drawChoropleth(stats) {
        if (choroplethLayer) { map.removeLayer(choroplethLayer); choroplethLayer = null; }
        var fc = buildGeoJSON(stats);
        choroplethLayer = L.geoJSON(fc, {
          style: function (f) {
            return {
              fillColor: dominantColor(f.properties),
              fillOpacity: 0.55,
              color: 'rgba(255,255,255,0.25)',
              weight: 1
            };
          },
          onEachFeature: function (f, layer) {
            var p = f.properties;
            layer.bindTooltip(
              '<b>' + p.state_name + '</b><br/>' + p.total_reports + ' reports',
              { sticky: true }
            );
            layer.on({
              mouseover: function (e) { e.target.setStyle({ fillOpacity: 0.75, color: 'rgba(255,255,255,0.70)', weight: 2 }); },
              mouseout:  function (e) { e.target.setStyle({ fillOpacity: 0.55, color: 'rgba(255,255,255,0.25)', weight: 1 }); }
            });
          }
        }).addTo(map);
      }

      // All AI-detected types for a hazard; legacy rows fall back to defect_type.
      function defectTypesLabel(h) {
        var types = (h.defect_types && h.defect_types.length) ? h.defect_types : [h.defect_type];
        return types.map(function (t) { return String(t || '').replace(/_/g, ' '); }).join(' + ');
      }

      function drawPins(hazards) {
        if (pinsLayer) { map.removeLayer(pinsLayer); pinsLayer = null; }
        pinsLayer = L.layerGroup();
        hazards.forEach(function (h) {
          if (typeof h.latitude !== 'number' || typeof h.longitude !== 'number') return;
          var badge = BADGE[h.severity] || BADGE.low;
          var html =
            '<div class="lg-badge" style="background:' + badge.bg + ';color:' + badge.text +
              ';border:1px solid ' + badge.border + '">' + String(h.severity).toUpperCase() + '</div>' +
            '<div class="lg-type">' + defectTypesLabel(h) + '</div>' +
            '<div class="lg-row"><span class="lg-label">STATUS</span><span>' + (h.status || '') + '</span></div>' +
            '<div class="lg-row"><span class="lg-label">LAT</span><span class="lg-mono">' + h.latitude.toFixed(4) + '</span></div>' +
            '<div class="lg-row"><span class="lg-label">LNG</span><span class="lg-mono">' + h.longitude.toFixed(4) + '</span></div>' +
            '<div class="lg-cta" onclick="selectHazard(\\'' + h.id + '\\')">View details</div>';
          L.marker([h.latitude, h.longitude], { icon: markerIcon(h.severity) })
            .bindPopup(html, { className: 'lg-popup', closeButton: false })
            .addTo(pinsLayer);
        });
        pinsLayer.addTo(map);
      }

      // RN → WebView entry point. Payload: { view, stats, hazards }.
      window.__render = function (payload) {
        hazardsById = {};
        (payload.hazards || []).forEach(function (h) { hazardsById[h.id] = h; });

        if (payload.view === 'pins') {
          if (choroplethLayer) { map.removeLayer(choroplethLayer); choroplethLayer = null; }
          drawPins(payload.hazards || []);
        } else {
          if (pinsLayer) { map.removeLayer(pinsLayer); pinsLayer = null; }
          drawChoropleth(payload.stats || []);
        }
      };

      post({ type: 'ready' });
    })();
  </script>
</body>
</html>`;
