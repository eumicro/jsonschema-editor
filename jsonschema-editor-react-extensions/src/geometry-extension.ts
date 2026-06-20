import { ObjectSchema } from "@jsonschema-editor/json-schema";
import {
  createGeometryCollectionSchema,
  DEFAULT_GEOMETRY_STYLE_URL,
  GEOMETRY_ATTRIBUTE,
  readGeometryConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { matchCustomAttribute, type JseReactExtension } from "@jsonschema-editor/react";
import { GeometryCollectionFormField } from "./components/GeometryCollectionFormField.js";

/** OGC GeoJSON GeometryCollection edited on a map (Leaflet + Geoman). */
export const geometryExtension: JseReactExtension = {
  id: "jsonschema-editor-geometry",
  formFields: [
    {
      id: "react-ext-geometry",
      priority: 30,
      match: matchCustomAttribute(GEOMETRY_ATTRIBUTE),
      component: GeometryCollectionFormField,
    },
  ],
  schemaTypes: [
    {
      id: "geometry-collection",
      label: "geometry-collection",
      create: () =>
        createGeometryCollectionSchema({
          styleUrl: DEFAULT_GEOMETRY_STYLE_URL,
          point: true,
          line: true,
          polygon: true,
          maxObjects: 5,
        }),
      match: (node) =>
        node instanceof ObjectSchema && readGeometryConfig(node) !== undefined,
    },
  ],
};

export { GeometryCollectionFormField };
