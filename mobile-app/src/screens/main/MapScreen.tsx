import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
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
 *
 * On mount the map centres on the device's location; if permission is denied or
 * the fix fails it stays on the country-wide default view.
 */
export function MapScreen({ onOpenHazardDetail }: MapScreenProps) {
  const webRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const [mapView, setMapView] = useState<MapViewMode>('pins');
  const [admLevel, setAdmLevel] = useState<0 | 1 | 2>(1);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  // Guards the fly-to so it only happens on the first load, never again — the
  // user is free to pan/zoom away once the map has settled.
  const didCentreRef = useRef(false);

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

  // Resolve the device's position once, in parallel with the WebView loading.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!active || status !== 'granted') return;

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (active) {
          setUserCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      } catch {
        // No fix available — the country-wide default view stands.
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Centre on the user once both the map and the location fix are available.
  useEffect(() => {
    if (!ready || !userCoords || didCentreRef.current) return;
    didCentreRef.current = true;
    webRef.current?.injectJavaScript(
      `window.__locate && window.__locate(${userCoords.latitude}, ${userCoords.longitude}); true;`,
    );
  }, [ready, userCoords]);

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
