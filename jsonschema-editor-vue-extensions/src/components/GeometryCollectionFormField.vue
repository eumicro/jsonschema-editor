<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, toRef, watch } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import {
  createEmptyGeometryCollection,
  isGeometryCollection,
  normalizeGeometryConfig,
  readGeometryConfig,
  type GeoJsonGeometry,
  type GeoJsonGeometryCollection,
  type NormalizedGeometryConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { JseSchemaFormField, useFormFieldLabel, useScopedField } from "@jsonschema-editor/vue";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const props = defineProps<{
  schema: SchemaNode;
  document?: SchemaDocument;
  scope: string;
  label?: string;
  i18nKey?: string;
  readonly?: boolean;
}>();

const rootSchema = toRef(props, "schema");
const documentRef = toRef(props, "document");
const labelRef = toRef(props, "label");
const i18nKeyRef = toRef(props, "i18nKey");
const rootData = defineModel<Record<string, unknown>>({ required: true });

const { fieldSchema, value } = useScopedField(rootSchema, rootData, props.scope, documentRef);
const { resolvedSchema, displayLabel, description } = useFormFieldLabel(
  rootSchema,
  props.scope,
  labelRef,
  fieldSchema,
  i18nKeyRef,
);

const geometryConfig = computed(() => {
  const node = resolvedSchema.value;
  return node ? normalizeGeometryConfig(readGeometryConfig(node)) : undefined;
});

const mapContainer = ref<HTMLElement | null>(null);
const mapInstance = shallowRef<L.Map | null>(null);
const featureGroup = shallowRef<L.FeatureGroup | null>(null);
const mapError = ref<string | null>(null);
let suppressValueReload = false;
const objectCount = computed(() => {
  const current = value.value;
  return isGeometryCollection(current) ? current.geometries.length : 0;
});

function fixLeafletIcons(): void {
  // Bundler-friendly default marker icons for Leaflet.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
}

function layersFromGeometry(geometry: GeoJsonGeometry): L.Layer[] {
  const feature: GeoJSON.Feature = { type: "Feature", geometry: geometry as GeoJSON.Geometry, properties: {} };
  const group = L.geoJSON(feature);
  const layers: L.Layer[] = [];
  group.eachLayer((layer) => layers.push(layer));
  return layers;
}

function cloneCollection(collection: GeoJsonGeometryCollection): GeoJsonGeometryCollection {
  return JSON.parse(JSON.stringify(collection)) as GeoJsonGeometryCollection;
}

function updateRemovalPolicy(group: L.FeatureGroup, config: NormalizedGeometryConfig): void {
  const count = geometriesFromGroup(group).length;
  const allowRemoval = count > config.minObjects;
  group.eachLayer((layer) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pm = (layer as any).pm;
    if (pm && typeof pm.setOptions === "function") {
      pm.setOptions({ allowRemoval });
    }
  });
}

function attachLayerSyncEvents(layer: L.Layer): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tagged = layer as any;
  if (tagged._jseGeometrySync) return;
  tagged._jseGeometrySync = true;

  const onLayerGeometryChange = () => {
    mapError.value = null;
    syncValueFromMap();
    const config = geometryConfig.value;
    if (config && objectCount.value >= config.minObjects) {
      lastValidCollection = cloneCollection(currentCollection());
    }
  };

  layer.on("pm:change", onLayerGeometryChange);
  layer.on("pm:update", onLayerGeometryChange);
  layer.on("pm:markerdragend", onLayerGeometryChange);
}

function enableGeomanForLayer(layer: L.Layer): void {
  if (layer instanceof L.LayerGroup) {
    layer.eachLayer(enableGeomanForLayer);
    return;
  }

  if (typeof L.PM?.reInitLayer === "function") {
    L.PM.reInitLayer(layer);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pm = (layer as any).pm;
  if (pm) {
    pm.enable({
      allowSelfIntersection: false,
    });
    attachLayerSyncEvents(layer);
  }
}

function enableGeomanForGroup(group: L.FeatureGroup): void {
  group.eachLayer(enableGeomanForLayer);
}

function geometriesFromGroup(group: L.FeatureGroup): GeoJsonGeometry[] {
  const geometries: GeoJsonGeometry[] = [];
  group.eachLayer((layer) => {
    if (!(layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Polygon))
      return;
    const geo = (layer as L.Marker | L.Polyline | L.Polygon).toGeoJSON() as GeoJSON.Feature;
    if (geo.geometry) {
      geometries.push(geo.geometry as GeoJsonGeometry);
    }
  });
  return geometries;
}

function syncValueFromMap(): void {
  if (!featureGroup.value) return;
  const next: GeoJsonGeometryCollection = {
    type: "GeometryCollection",
    geometries: geometriesFromGroup(featureGroup.value),
  };
  suppressValueReload = true;
  value.value = next;
  const config = geometryConfig.value;
  if (config && featureGroup.value) {
    updateRemovalPolicy(featureGroup.value, config);
  }
  queueMicrotask(() => {
    suppressValueReload = false;
  });
}

function boundsForCollection(collection: GeoJsonGeometryCollection): L.LatLngBounds | null {
  const group = L.featureGroup();
  for (const geometry of collection.geometries) {
    for (const layer of layersFromGeometry(geometry)) {
      group.addLayer(layer);
    }
  }
  if (group.getLayers().length === 0) return null;
  return group.getBounds();
}

function loadCollectionOnMap(
  map: L.Map,
  group: L.FeatureGroup,
  collection: GeoJsonGeometryCollection,
): void {
  group.clearLayers();
  for (const geometry of collection.geometries) {
    for (const layer of layersFromGeometry(geometry)) {
      group.addLayer(layer);
    }
  }

  const bounds = boundsForCollection(collection);
  if (bounds) {
    map.fitBounds(bounds.pad(0.2));
  }

  if (!props.readonly) {
    enableGeomanForGroup(group);
    const config = geometryConfig.value;
    if (config) {
      updateRemovalPolicy(group, config);
    }
  }
}

function currentCollection(): GeoJsonGeometryCollection {
  return isGeometryCollection(value.value)
    ? value.value
    : createEmptyGeometryCollection();
}

function mapPm(): {
  enableDraw: (shape: string) => void;
  toggleGlobalEditMode: () => void;
  enableGlobalRemovalMode: () => void;
  globalRemovalModeEnabled: () => boolean;
} | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (mapInstance.value as any)?.pm;
}

function applyDrawControls(map: L.Map, config: NormalizedGeometryConfig): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pm = (map as any).pm;
  if (!pm) return;

  pm.addControls({
    oneBlock: true,
    position: "topleft",
    drawControls: true,
    editControls: true,
    drawMarker: config.point,
    drawPolyline: config.line,
    drawPolygon: config.polygon,
    drawRectangle: false,
    drawCircle: false,
    drawCircleMarker: false,
    drawText: false,
    editMode: true,
    dragMode: false,
    removalMode: true,
    rotateMode: false,
    cutPolygon: false,
  });

  if (props.readonly) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (map as any).pm.removeControls();
  }
}

function activateEditMode(): void {
  mapPm()?.toggleGlobalEditMode();
}

function activateRemovalMode(): void {
  const pm = mapPm();
  if (!pm) return;
  if (!pm.globalRemovalModeEnabled()) {
    pm.enableGlobalRemovalMode();
  }
}

function activateDrawPolygon(): void {
  mapPm()?.enableDraw("Polygon");
}

function activateDrawMarker(): void {
  mapPm()?.enableDraw("Marker");
}

function activateDrawLine(): void {
  mapPm()?.enableDraw("Line");
}

const canAddGeometry = computed(
  () => objectCount.value < (geometryConfig.value?.maxObjects ?? 0),
);

const canDrawPoint = computed(() => !!geometryConfig.value?.point && canAddGeometry.value);
const canDrawLine = computed(() => !!geometryConfig.value?.line && canAddGeometry.value);
const canDrawPolygon = computed(() => !!geometryConfig.value?.polygon && canAddGeometry.value);

const allowedTypesLabel = computed(() => {
  const config = geometryConfig.value;
  if (!config) return "";
  const labels: string[] = [];
  if (config.point) labels.push("Punkt");
  if (config.line) labels.push("Linie");
  if (config.polygon) labels.push("Polygon");
  return labels.join(", ");
});

const countHint = computed(() => {
  const config = geometryConfig.value;
  if (!config) return "";
  if (config.exactObjects !== undefined) {
    return `${objectCount.value} / exakt ${config.maxObjects} Geometrie(n)`;
  }
  if (config.minObjects > 0) {
    return `${objectCount.value} / ${config.minObjects}–${config.maxObjects} Geometrie(n)`;
  }
  return `${objectCount.value} / max. ${config.maxObjects} Geometrie(n)`;
});

let lastValidCollection: GeoJsonGeometryCollection = createEmptyGeometryCollection();

function handleGeometryMapChange(): void {
  const map = mapInstance.value;
  const group = featureGroup.value;
  const config = geometryConfig.value;
  if (!map || !group || !config) return;

  syncValueFromMap();
  const count = geometriesFromGroup(group).length;
  if (count < config.minObjects) {
    mapError.value = `Mindestens ${config.minObjects} Geometrie(n) erforderlich.`;
    loadCollectionOnMap(map, group, lastValidCollection);
    suppressValueReload = true;
    value.value = cloneCollection(lastValidCollection);
    queueMicrotask(() => {
      suppressValueReload = false;
    });
    return;
  }
  mapError.value = null;
  lastValidCollection = cloneCollection(currentCollection());
}

function attachMapEvents(map: L.Map, group: L.FeatureGroup, config: NormalizedGeometryConfig): void {
  group.on("click", () => {
    if (props.readonly) return;
    if (!mapPm()?.globalRemovalModeEnabled()) return;
    if (geometriesFromGroup(group).length > config.minObjects) return;
    mapError.value = `Mindestens ${config.minObjects} Geometrie(n) erforderlich.`;
  });

  map.on("pm:create", (event: L.LeafletEvent & { layer: L.Layer }) => {
    if (props.readonly) {
      group.removeLayer(event.layer);
      return;
    }
    if (group.getLayers().length > config.maxObjects) {
      group.removeLayer(event.layer);
      mapError.value = `Maximal ${config.maxObjects} Geometrie(n) erlaubt.`;
      return;
    }
    enableGeomanForLayer(event.layer);
    mapError.value = null;
    syncValueFromMap();
    lastValidCollection = cloneCollection(currentCollection());
  });

  map.on("pm:remove", handleGeometryMapChange);
  group.on("layerremove", handleGeometryMapChange);
}

function initMap(config: NormalizedGeometryConfig): void {
  if (!mapContainer.value) return;

  fixLeafletIcons();

  const collection = currentCollection();
  const initialBounds = boundsForCollection(collection);
  const fallbackCenter: L.LatLngExpression = [53.0061937, 7.4118535];

  const map = L.map(mapContainer.value, {
    center: initialBounds?.getCenter() ?? fallbackCenter,
    zoom: initialBounds ? 17 : 14,
    preferCanvas: false,
  });

  L.tileLayer(config.styleUrl, {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const group = L.featureGroup().addTo(map);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (map as any).pm.setGlobalOptions({ layerGroup: group });

  loadCollectionOnMap(map, group, collection);
  lastValidCollection = cloneCollection(collection);

  if (!props.readonly) {
    applyDrawControls(map, config);
    attachMapEvents(map, group, config);
  }

  mapInstance.value = map;
  featureGroup.value = group;

  void nextTick().then(() => {
    map.invalidateSize();
    const bounds = boundsForCollection(collection);
    if (bounds) {
      map.fitBounds(bounds.pad(0.2));
    }
  });
}

function destroyMap(): void {
  mapInstance.value?.remove();
  mapInstance.value = null;
  featureGroup.value = null;
}

onMounted(() => {
  const config = geometryConfig.value;
  if (!config) return;
  try {
    initMap(config);
  } catch (error) {
    mapError.value = error instanceof Error ? error.message : "Karte konnte nicht geladen werden.";
  }
});

onBeforeUnmount(() => {
  destroyMap();
});

watch(
  () => props.readonly,
  (readonly) => {
    const map = mapInstance.value;
    const config = geometryConfig.value;
    if (!map || !config) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pm = (map as any).pm;
    if (readonly) {
      pm.removeControls();
    } else {
      applyDrawControls(map, config);
    }
  },
);

watch(
  () => value.value,
  (next) => {
    if (suppressValueReload) return;
    const map = mapInstance.value;
    const group = featureGroup.value;
    if (!map || !group || !isGeometryCollection(next)) return;

    const current = geometriesFromGroup(group);
    if (JSON.stringify(current) === JSON.stringify(next.geometries)) return;
    loadCollectionOnMap(map, group, next);
  },
  { deep: true },
);
</script>

<template>
  <JseSchemaFormField :label="displayLabel" :description="description" :scope="scope">
    <div class="jse-geometry-field">
      <div ref="mapContainer" class="jse-geometry-map" role="application" :aria-label="displayLabel" />
      <div v-if="!readonly" class="jse-geometry-actions">
        <button type="button" class="jse-geometry-actions__btn" @click="activateEditMode">
          Bearbeiten
        </button>
        <button type="button" class="jse-geometry-actions__btn" @click="activateRemovalMode">
          Löschen
        </button>
        <button
          v-if="canDrawPoint"
          type="button"
          class="jse-geometry-actions__btn"
          @click="activateDrawMarker"
        >
          Punkt setzen
        </button>
        <button
          v-if="canDrawLine"
          type="button"
          class="jse-geometry-actions__btn"
          @click="activateDrawLine"
        >
          Linie zeichnen
        </button>
        <button
          v-if="canDrawPolygon"
          type="button"
          class="jse-geometry-actions__btn"
          @click="activateDrawPolygon"
        >
          Polygon zeichnen
        </button>
      </div>
      <p v-if="geometryConfig && !readonly" class="jse-field__hint">
        {{ countHint }}
        <span v-if="allowedTypesLabel"> · {{ allowedTypesLabel }}</span>
        · „Bearbeiten“ → Eckpunkte verschieben · „Löschen“ → Geometrie anklicken
      </p>
      <p v-if="mapError" class="jse-field__hint jse-field__hint--error">{{ mapError }}</p>
    </div>
  </JseSchemaFormField>
</template>

<style scoped>
.jse-geometry-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.jse-geometry-map {
  width: 100%;
  min-height: 280px;
  border: 1px solid var(--jse-border, #c8c8c8);
  border-radius: 4px;
}

.jse-geometry-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.jse-geometry-actions__btn {
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--jse-border, #c8c8c8);
  border-radius: 4px;
  background: var(--jse-surface, #fff);
  cursor: pointer;
  font: inherit;
}

.jse-geometry-actions__btn:hover {
  background: var(--jse-surface-muted, #f4f4f4);
}
</style>

<style>
@import "leaflet/dist/leaflet.css";
@import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
</style>
