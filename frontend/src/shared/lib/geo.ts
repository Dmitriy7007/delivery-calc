import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';
import type { Position } from 'geojson';

export function isPointInPolygon(
  lng: number,
  lat: number,
  coordinates: Position[][]
): boolean {
  const pt = point([lng, lat]);
  const poly = polygon(coordinates);
  return booleanPointInPolygon(pt, poly);
}

export function formatCoordinates(lng: number, lat: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}
