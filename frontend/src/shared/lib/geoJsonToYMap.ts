import type { PolygonGeometry, LngLat } from 'ymaps3';
import type { Polygon } from 'geojson';

/**
 * Конвертирует GeoJSON Polygon в ymaps3 PolygonGeometry.
 * GeoJSON Position — это number[] (произвольная длина),
 * а ymaps3 LngLat — строгий tuple [number, number].
 */
export const geoJsonPolygonToYMapPolygon = (
  polygon: Polygon,
): PolygonGeometry => ({
  type: 'Polygon',
  coordinates: polygon.coordinates.map((ring) =>
    ring.map(([lng, lat]) => [lng, lat] as LngLat),
  ),
});
