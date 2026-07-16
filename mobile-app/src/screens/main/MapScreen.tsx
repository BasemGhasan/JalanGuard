import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { COLORS, SPACING } from '../../constants';
import { useMapData } from '../../hooks';
import type { Hazard, MapView as MapViewMode } from '../../types';
import { LEAFLET_MAP_HTML } from './leafletMapHtml';
import { mapScreenStyles } from '../../styles/screens';

type MapScreenProps = {
  onOpenHazardDetail: (hazard: Hazard) => void;
};

const ADM_OPTIONS: Array<{ level: 0 | 1 | 2; label: string }> = [
  { level: 0, label: 'Country' },
  { level: 1, label: 'States' },
  { level: 2, label: 'Districts' },
];

/**
 * Live map — the mobile counterpart of the web dashboard's MapPage.
 *
 * Renders the shared Leaflet document (see `leafletMapHtml`) inside a WebView
 * and feeds it live Supabase data via `useMapData`. The choropleth/pins toggle
 * and ADM-level toggle are native overlays; tapping a pin's "View details"
 * posts the hazard back over the bridge and opens the native detail screen.
 */
export function MapScreen({ onOpenHazardDetail }: MapScreenProps) {
  const webRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const [mapView, setMapView] = useState<MapViewMode>('choropleth');
  const [admLevel, setAdmLevel] = useState<0 | 1 | 2>(1);

  const { stats, hazards, loading, error, retry } = useMapData(admLevel);

  const payload = useMemo(
    () => ({ view: mapView, stats, hazards }),
    [mapView, stats, hazards],
  );

  // Push data into the WebView whenever it (re)renders or the data/view changes.
  useEffect(() => {
    if (!ready) return;
    const js = `window.__render && window.__render(${JSON.stringify(payload)}); true;`;
    webRef.current?.injectJavaScript(js);
  }, [ready, payload]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as
          | { type: 'ready' }
          | { type: 'select'; hazard: Hazard };
        if (data.type === 'ready') {
          setReady(true);
        } else if (data.type === 'select' && data.hazard) {
          onOpenHazardDetail(data.hazard);
        }
      } catch {
        // Ignore malformed bridge messages.
      }
    },
    [onOpenHazardDetail],
  );

  return (
    <View style={mapScreenStyles.container}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html: LEAFLET_MAP_HTML }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        style={mapScreenStyles.webview}
      />

      {/* View toggle (top-right) */}
      <View
        style={[mapScreenStyles.toggleGroup, mapScreenStyles.toggleRight, { top: insets.top + SPACING.sm }]}
      >
        {(['choropleth', 'pins'] as MapViewMode[]).map((view) => {
          const active = mapView === view;
          return (
            <Pressable
              key={view}
              onPress={() => setMapView(view)}
              style={[mapScreenStyles.toggleItem, active && mapScreenStyles.toggleItemActive]}
            >
              <Text style={[mapScreenStyles.toggleText, active && mapScreenStyles.toggleTextActive]}>
                {view === 'choropleth' ? 'Areas' : 'Pins'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ADM-level toggle (top-left, choropleth only) */}
      {mapView === 'choropleth' && (
        <View
          style={[mapScreenStyles.toggleGroup, mapScreenStyles.toggleLeft, { top: insets.top + SPACING.sm }]}
        >
          {ADM_OPTIONS.map((opt) => {
            const active = admLevel === opt.level;
            return (
              <Pressable
                key={opt.level}
                onPress={() => setAdmLevel(opt.level)}
                style={[mapScreenStyles.toggleItem, active && mapScreenStyles.toggleItemActive]}
              >
                <Text style={[mapScreenStyles.toggleText, active && mapScreenStyles.toggleTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {loading && (
        <View style={mapScreenStyles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      )}

      {!loading && error && (
        <View style={mapScreenStyles.overlay}>
          <Text style={mapScreenStyles.errorText}>Couldn’t load map data.</Text>
          <Pressable style={mapScreenStyles.retryButton} onPress={retry}>
            <Text style={mapScreenStyles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
