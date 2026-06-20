import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import {
  createEmptyGeometryCollection,
  isGeometryCollection,
  normalizeGeometryConfig,
  readGeometryConfig,
  type GeoJsonGeometry,
  type GeoJsonGeometryCollection,
  type NormalizedGeometryConfig,
} from "@jsonschema-editor/json-schema-extensions";
import {
  JseSchemaFormField,
  useFormFieldLabel,
  useScopedField,
  type FormFieldProps,
} from "@jsonschema-editor/react";

function fixLeafletIcons(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
}

function layersFromGeometry(geometry: GeoJsonGeometry): L.Layer[] {
  const feature: GeoJSON.Feature = {
    type: "Feature",
    geometry: geometry as GeoJSON.Geometry,
    properties: {},
  };
  const group = L.geoJSON(feature);
  const layers: L.Layer[] = [];
  group.eachLayer((layer) => layers.push(layer));
  return layers;
}

function cloneCollection(collection: GeoJsonGeometryCollection): GeoJsonGeometryCollection {
  return JSON.parse(JSON.stringify(collection)) as GeoJsonGeometryCollection;
}

function isNestedLayerGroup(layer: L.Layer): layer is L.LayerGroup {
  return (
    typeof (layer as L.LayerGroup).eachLayer === "function" &&
    typeof (layer as L.LayerGroup).getLayers === "function" &&
    typeof (layer as L.Marker).getLatLng !== "function"
  );
}

function geometryFromLayer(layer: L.Layer): GeoJsonGeometry | undefined {
  const toGeoJSON = (layer as L.Layer & { toGeoJSON?: () => GeoJSON.Feature }).toGeoJSON;
  if (typeof toGeoJSON !== "function") return undefined;

  const geo = toGeoJSON.call(layer);
  if (!geo.geometry || geo.geometry.type === "GeometryCollection") return undefined;

  switch (geo.geometry.type) {
    case "Point":
    case "MultiPoint":
    case "LineString":
    case "MultiLineString":
    case "Polygon":
    case "MultiPolygon":
      return geo.geometry as GeoJsonGeometry;
    default:
      return undefined;
  }
}

function geometriesFromGroup(group: L.FeatureGroup): GeoJsonGeometry[] {
  const geometries: GeoJsonGeometry[] = [];
  group.eachLayer((layer) => {
    if (isNestedLayerGroup(layer)) {
      geometries.push(...geometriesFromGroup(layer as L.FeatureGroup));
      return;
    }
    const geometry = geometryFromLayer(layer);
    if (geometry) geometries.push(geometry);
  });
  return geometries;
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

function attachLayerSyncEvents(
  layer: L.Layer,
  onChange: () => void,
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tagged = layer as any;
  if (tagged._jseGeometrySync) return;
  tagged._jseGeometrySync = true;

  const onLayerGeometryChange = () => onChange();
  layer.on("pm:change", onLayerGeometryChange);
  layer.on("pm:update", onLayerGeometryChange);
  layer.on("pm:markerdragend", onLayerGeometryChange);
}

function enableGeomanForLayer(
  layer: L.Layer,
  onChange: () => void,
  attachSync = true,
): void {
  if (isNestedLayerGroup(layer)) {
    layer.eachLayer((child) => enableGeomanForLayer(child, onChange, attachSync));
    return;
  }

  if (typeof L.PM?.reInitLayer === "function") {
    L.PM.reInitLayer(layer);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pm = (layer as any).pm;
  if (pm) {
    pm.enable({ allowSelfIntersection: false });
    if (attachSync) attachLayerSyncEvents(layer, onChange);
  }
}

function enableGeomanForGroup(
  group: L.FeatureGroup,
  onChange: () => void,
  attachSync = true,
): void {
  group.eachLayer((layer) => enableGeomanForLayer(layer, onChange, attachSync));
}

function attachSyncEventsForGroup(group: L.FeatureGroup, onChange: () => void): void {
  group.eachLayer((layer) => {
    if (isNestedLayerGroup(layer)) {
      attachSyncEventsForGroup(layer as L.FeatureGroup, onChange);
      return;
    }
    attachLayerSyncEvents(layer, onChange);
  });
}

function applyDrawControls(
  map: L.Map,
  config: NormalizedGeometryConfig,
  readonly: boolean,
): void {
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

  if (readonly) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (map as any).pm.removeControls();
  }
}

function mapPm(map: L.Map | null): {
  enableDraw: (shape: string) => void;
  toggleGlobalEditMode: () => void;
  enableGlobalRemovalMode: () => void;
  globalRemovalModeEnabled: () => boolean;
} | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (map as any)?.pm;
}

export function GeometryCollectionFormField({
  schema,
  document,
  scope,
  label,
  i18nKey,
  readonly = false,
}: FormFieldProps) {
  const { fieldSchema, value, setValue } = useScopedField(schema, scope, document);
  const { resolvedSchema, displayLabel, description } = useFormFieldLabel(
    schema,
    scope,
    label,
    fieldSchema,
    i18nKey,
  );

  const geometryConfig = useMemo(() => {
    const node = resolvedSchema;
    return node ? normalizeGeometryConfig(readGeometryConfig(node)) : undefined;
  }, [resolvedSchema]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const suppressValueReloadRef = useRef(false);
  const mapInitializingRef = useRef(false);
  const lastValidCollectionRef = useRef<GeoJsonGeometryCollection>(createEmptyGeometryCollection());

  const [mapError, setMapError] = useState<string | null>(null);

  const objectCount = isGeometryCollection(value) ? value.geometries.length : 0;

  const currentCollection = useCallback((): GeoJsonGeometryCollection => {
    return isGeometryCollection(value) ? value : createEmptyGeometryCollection();
  }, [value]);

  const syncValueFromMap = useCallback(() => {
    const group = featureGroupRef.current;
    if (!group || mapInitializingRef.current) return;

    const extracted = geometriesFromGroup(group);
    if (
      extracted.length === 0 &&
      group.getLayers().length > 0 &&
      isGeometryCollection(value) &&
      value.geometries.length > 0
    ) {
      return;
    }

    const next: GeoJsonGeometryCollection = {
      type: "GeometryCollection",
      geometries: extracted,
    };
    suppressValueReloadRef.current = true;
    setValue(next);
    if (geometryConfig) {
      updateRemovalPolicy(group, geometryConfig);
    }
    queueMicrotask(() => {
      suppressValueReloadRef.current = false;
    });
  }, [geometryConfig, setValue, value]);

  const loadCollectionOnMap = useCallback(
    (
      map: L.Map,
      group: L.FeatureGroup,
      collection: GeoJsonGeometryCollection,
      onChange: () => void,
    ) => {
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

      if (!readonly) {
        enableGeomanForGroup(group, onChange, !mapInitializingRef.current);
        if (geometryConfig) {
          updateRemovalPolicy(group, geometryConfig);
        }
      }
    },
    [geometryConfig, readonly],
  );

  const handleGeometryMapChange = useCallback(() => {
    const map = mapInstanceRef.current;
    const group = featureGroupRef.current;
    if (!map || !group || !geometryConfig) return;

    syncValueFromMap();
    const count = geometriesFromGroup(group).length;
    if (count < geometryConfig.minObjects) {
      setMapError(`Mindestens ${geometryConfig.minObjects} Geometrie(n) erforderlich.`);
      loadCollectionOnMap(map, group, lastValidCollectionRef.current, syncValueFromMap);
      suppressValueReloadRef.current = true;
      setValue(cloneCollection(lastValidCollectionRef.current));
      queueMicrotask(() => {
        suppressValueReloadRef.current = false;
      });
      return;
    }
    setMapError(null);
    lastValidCollectionRef.current = cloneCollection(currentCollection());
  }, [currentCollection, geometryConfig, loadCollectionOnMap, setValue, syncValueFromMap]);

  useEffect(() => {
    const config = geometryConfig;
    const container = mapContainerRef.current;
    if (!config || !container) return;

    fixLeafletIcons();

    const collection = currentCollection();
    const initialBounds = boundsForCollection(collection);
    const fallbackCenter: L.LatLngExpression = [53.0061937, 7.4118535];

    mapInitializingRef.current = true;

    try {
      const map = L.map(container, {
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

      loadCollectionOnMap(map, group, collection, syncValueFromMap);
      lastValidCollectionRef.current = cloneCollection(collection);

      if (!readonly) {
        applyDrawControls(map, config, readonly);

        group.on("click", () => {
          if (readonly) return;
          if (!mapPm(map)?.globalRemovalModeEnabled()) return;
          if (geometriesFromGroup(group).length > config.minObjects) return;
          setMapError(`Mindestens ${config.minObjects} Geometrie(n) erforderlich.`);
        });

        map.on("pm:create", (event: L.LeafletEvent & { layer: L.Layer }) => {
          if (readonly) {
            group.removeLayer(event.layer);
            return;
          }
          if (group.getLayers().length > config.maxObjects) {
            group.removeLayer(event.layer);
            setMapError(`Maximal ${config.maxObjects} Geometrie(n) erlaubt.`);
            return;
          }
          enableGeomanForLayer(event.layer, syncValueFromMap);
          setMapError(null);
          syncValueFromMap();
          lastValidCollectionRef.current = cloneCollection(currentCollection());
        });

        map.on("pm:remove", handleGeometryMapChange);
        group.on("layerremove", handleGeometryMapChange);
        attachSyncEventsForGroup(group, syncValueFromMap);
      }

      mapInstanceRef.current = map;
      featureGroupRef.current = group;

      requestAnimationFrame(() => {
        map.invalidateSize();
        const bounds = boundsForCollection(collection);
        if (bounds) {
          map.fitBounds(bounds.pad(0.2));
        }
      });
    } catch (error) {
      setMapError(error instanceof Error ? error.message : "Karte konnte nicht geladen werden.");
    } finally {
      mapInitializingRef.current = false;
    }

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      featureGroupRef.current = null;
    };
  }, [
    currentCollection,
    geometryConfig,
    handleGeometryMapChange,
    loadCollectionOnMap,
    readonly,
    syncValueFromMap,
  ]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const config = geometryConfig;
    if (!map || !config) return;
    applyDrawControls(map, config, readonly);
  }, [geometryConfig, readonly]);

  useEffect(() => {
    if (suppressValueReloadRef.current || mapInitializingRef.current) return;
    const map = mapInstanceRef.current;
    const group = featureGroupRef.current;
    if (!map || !group || !isGeometryCollection(value)) return;

    const current = geometriesFromGroup(group);
    if (current.length === value.geometries.length) return;
    if (JSON.stringify(current) === JSON.stringify(value.geometries)) return;
    loadCollectionOnMap(map, group, value, syncValueFromMap);
  }, [loadCollectionOnMap, syncValueFromMap, value]);

  const canAddGeometry = objectCount < (geometryConfig?.maxObjects ?? 0);
  const canDrawPoint = !!geometryConfig?.point && canAddGeometry;
  const canDrawLine = !!geometryConfig?.line && canAddGeometry;
  const canDrawPolygon = !!geometryConfig?.polygon && canAddGeometry;

  const allowedTypesLabel = useMemo(() => {
    const config = geometryConfig;
    if (!config) return "";
    const labels: string[] = [];
    if (config.point) labels.push("Punkt");
    if (config.line) labels.push("Linie");
    if (config.polygon) labels.push("Polygon");
    return labels.join(", ");
  }, [geometryConfig]);

  const countHint = useMemo(() => {
    const config = geometryConfig;
    if (!config) return "";
    if (config.exactObjects !== undefined) {
      return `${objectCount} / exakt ${config.maxObjects} Geometrie(n)`;
    }
    if (config.minObjects > 0) {
      return `${objectCount} / ${config.minObjects}–${config.maxObjects} Geometrie(n)`;
    }
    return `${objectCount} / max. ${config.maxObjects} Geometrie(n)`;
  }, [geometryConfig, objectCount]);

  return (
    <JseSchemaFormField label={displayLabel} description={description} scope={scope}>
      <div className="jse-geometry-field">
        <div
          ref={mapContainerRef}
          className="jse-geometry-map"
          role="application"
          aria-label={displayLabel}
        />
        {!readonly ? (
          <div className="jse-geometry-actions">
            <button
              type="button"
              className="jse-geometry-actions__btn"
              onClick={() => mapPm(mapInstanceRef.current)?.toggleGlobalEditMode()}
            >
              Bearbeiten
            </button>
            <button
              type="button"
              className="jse-geometry-actions__btn"
              onClick={() => {
                const pm = mapPm(mapInstanceRef.current);
                if (pm && !pm.globalRemovalModeEnabled()) {
                  pm.enableGlobalRemovalMode();
                }
              }}
            >
              Löschen
            </button>
            {canDrawPoint ? (
              <button
                type="button"
                className="jse-geometry-actions__btn"
                onClick={() => mapPm(mapInstanceRef.current)?.enableDraw("Marker")}
              >
                Punkt setzen
              </button>
            ) : null}
            {canDrawLine ? (
              <button
                type="button"
                className="jse-geometry-actions__btn"
                onClick={() => mapPm(mapInstanceRef.current)?.enableDraw("Line")}
              >
                Linie zeichnen
              </button>
            ) : null}
            {canDrawPolygon ? (
              <button
                type="button"
                className="jse-geometry-actions__btn"
                onClick={() => mapPm(mapInstanceRef.current)?.enableDraw("Polygon")}
              >
                Polygon zeichnen
              </button>
            ) : null}
          </div>
        ) : null}
        {geometryConfig && !readonly ? (
          <p className="jse-field__hint">
            {countHint}
            {allowedTypesLabel ? ` · ${allowedTypesLabel}` : ""}
            {" · „Bearbeiten“ → Eckpunkte verschieben · „Löschen“ → Geometrie anklicken"}
          </p>
        ) : null}
        {mapError ? <p className="jse-field__hint jse-field__hint--error">{mapError}</p> : null}
      </div>
    </JseSchemaFormField>
  );
}
