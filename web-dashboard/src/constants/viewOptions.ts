/**
 * Shared ViewToggle option lists.
 * ADM_LEVEL_OPTIONS was previously duplicated in MapPage and DataExplorer.
 */

// 1. Imports — External
import { Globe, Layers, Map, MapPin, MapPinned } from "lucide-react";

// 1. Imports — Local types
import type { ToggleOption } from "../app/components/map/ViewToggle";
import type { MapView } from "../types/map";

/** Administrative boundary levels: Country → States → Districts. */
export const ADM_LEVEL_OPTIONS: ToggleOption<0 | 1 | 2>[] = [
  { value: 0, label: "Country",   Icon: Globe },
  { value: 1, label: "States",    Icon: Map },
  { value: 2, label: "Districts", Icon: MapPin },
];

/** Map rendering modes: aggregated polygons vs individual pins. */
export const MAP_VIEW_OPTIONS: ToggleOption<MapView>[] = [
  { value: "choropleth", label: "Choropleth", Icon: Layers },
  { value: "pins",       label: "Pins",       Icon: MapPinned },
];
