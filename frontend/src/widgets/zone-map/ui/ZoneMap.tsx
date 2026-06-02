import React, { useCallback, useMemo, useState } from 'react';
import {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapFeature,
  YMapMarker,
  YMapListener,
  reactify,
} from '@/shared/lib/ymaps3';
import type { LngLat } from 'ymaps3';
import { MAP_CONFIG } from '@/shared/config';
import { ZonePolygon } from '@/entities/zone';
import type { Zone } from '@/shared/types';

interface ZoneMapProps {
  zones: Zone[];
  selectedZoneId?: number | null;
  onZoneClick?: (zone: Zone) => void;
  onMapClick?: (coords: [number, number]) => void;
  drawingCoords?: [number, number][];
  drawingColor?: string;
  onPointUpdate?: (index: number, coords: [number, number]) => void;
  onPointRemove?: (index: number) => void;
  onPointInsert?: (index: number, coords: [number, number]) => void;
  isDrawing?: boolean;
  children?: React.ReactNode;
  mapCenter?: [number, number];
  mapZoom?: number;
}

// Состояние перетаскивания для real-time обновления линий
interface DragState {
  type: 'vertex' | 'midpoint';
  index: number; // vertex index или afterIndex для midpoint
  coord: [number, number];
}

export const ZoneMap: React.FC<ZoneMapProps> = ({
  zones,
  selectedZoneId,
  onZoneClick,
  onMapClick,
  drawingCoords,
  drawingColor = '#71a9b3',
  onPointUpdate,
  onPointRemove,
  onPointInsert,
  isDrawing = false,
  children,
  mapCenter,
  mapZoom,
}) => {
  // Drag-state для real-time обновления полигона при перетаскивании
  const [dragState, setDragState] = useState<DragState | null>(null);

  // Координаты для отрисовки полигона — учитывают текущий drag
  const effectiveCoords = useMemo(() => {
    if (!drawingCoords) return undefined;
    if (!dragState) return drawingCoords;

    const result = [...drawingCoords];
    if (dragState.type === 'vertex') {
      result[dragState.index] = dragState.coord;
    } else {
      // midpoint: вставляем точку после index
      result.splice(dragState.index + 1, 0, dragState.coord);
    }
    return result;
  }, [drawingCoords, dragState]);

  // Используем useDefault чтобы зум не сбрасывался при ре-рендере
  const defaultLocation = reactify.useDefault({
    center: (mapCenter ?? MAP_CONFIG.center) as [number, number],
    zoom: mapZoom ?? MAP_CONFIG.zoom,
  });

  const handleClick = useCallback(
    (object: any, event: any) => {
      if (object?.type === 'feature' && object?.id) {
        const zoneId = parseInt(String(object.id).replace('zone-', ''), 10);
        const zone = zones.find((z) => z.id === zoneId);
        if (zone && onZoneClick) {
          onZoneClick(zone);
          return;
        }
      }

      if (onMapClick && event?.coordinates) {
        onMapClick(event.coordinates);
      }
    },
    [zones, onZoneClick, onMapClick]
  );

  // === Vertex drag handlers ===
  const handleVertexDragMove = useCallback(
    (idx: number) => (coordinates: LngLat) => {
      setDragState({ type: 'vertex', index: idx, coord: [coordinates[0], coordinates[1]] });
    },
    []
  );

  const handleVertexDragEnd = useCallback(
    (idx: number) => (coordinates: LngLat) => {
      setDragState(null);
      if (onPointUpdate) {
        onPointUpdate(idx, [coordinates[0], coordinates[1]]);
      }
    },
    [onPointUpdate]
  );

  const handleVertexRightClick = useCallback(
    (idx: number, e: React.MouseEvent) => {
      e.preventDefault();
      if (onPointRemove && drawingCoords && drawingCoords.length > 3) {
        onPointRemove(idx);
      }
    },
    [onPointRemove, drawingCoords]
  );

  // === Midpoint drag handlers ===
  const handleMidpointDragMove = useCallback(
    (afterIndex: number) => (coordinates: LngLat) => {
      setDragState({ type: 'midpoint', index: afterIndex, coord: [coordinates[0], coordinates[1]] });
    },
    []
  );

  const handleMidpointDragEnd = useCallback(
    (afterIndex: number) => (coordinates: LngLat) => {
      setDragState(null);
      if (onPointInsert) {
        onPointInsert(afterIndex, [coordinates[0], coordinates[1]]);
      }
    },
    [onPointInsert]
  );

  // Midpoint positions — вычисляются из оригинальных drawingCoords (не effective)
  const midpoints = useMemo(() => {
    if (!drawingCoords || drawingCoords.length < 2 || !isDrawing) return [];

    const mids: { coord: [number, number]; afterIndex: number }[] = [];
    const len = drawingCoords.length;

    for (let i = 0; i < len; i++) {
      const next = (i + 1) % len;
      if (next === 0 && len < 3) continue;

      const [x1, y1] = drawingCoords[i];
      const [x2, y2] = drawingCoords[next];
      mids.push({
        coord: [(x1 + x2) / 2, (y1 + y2) / 2],
        afterIndex: i,
      });
    }

    return mids;
  }, [drawingCoords, isDrawing]);

  return (
    <div className="zone-map">
      <YMap
        location={defaultLocation}
        mode="vector"
      >
        <YMapDefaultSchemeLayer />
        <YMapDefaultFeaturesLayer />
        <YMapListener onClick={handleClick} />

        {/* Existing zones */}
        {zones.map((zone) => (
          <ZonePolygon
            key={zone.id}
            zone={zone}
            isSelected={zone.id === selectedZoneId}
          />
        ))}

        {/* Drawing preview polygon — использует effectiveCoords */}
        {effectiveCoords && effectiveCoords.length >= 3 && (
          <YMapFeature
            id="drawing-preview"
            geometry={{
              type: 'Polygon' as const,
              coordinates: [[...effectiveCoords, effectiveCoords[0]].map(c => c as LngLat)],
            }}
            style={{
              fill: drawingColor + '30',
              stroke: [{ color: drawingColor, width: 2, dash: [8, 4] }],
            }}
          />
        )}

        {/* Drawing line (2 points) */}
        {effectiveCoords && effectiveCoords.length === 2 && (
          <YMapFeature
            id="drawing-line"
            geometry={{
              type: 'LineString' as const,
              coordinates: effectiveCoords.map(c => c as LngLat),
            }}
            style={{
              stroke: [{ color: drawingColor, width: 2, dash: [8, 4] }],
            }}
          />
        )}

        {/* Midpoint vertices — яркие полупрозрачные ручки */}
        {midpoints.map((mid, i) => (
          <YMapMarker
            key={`mid-${i}`}
            coordinates={mid.coord}
            draggable={true}
            onDragMove={handleMidpointDragMove(mid.afterIndex)}
            onDragEnd={handleMidpointDragEnd(mid.afterIndex)}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#ffffff',
                opacity: 0.75,
                border: `2.5px solid ${drawingColor}`,
                transform: 'translate(-50%, -50%)',
                cursor: 'grab',
                boxShadow: `0 0 6px ${drawingColor}80`,
                transition: 'opacity 0.15s, transform 0.15s',
              }}
              className="midpoint-handle"
              title="Перетащите для добавления точки"
            />
          </YMapMarker>
        ))}

        {/* Drawing vertices — draggable */}
        {drawingCoords?.map((coord, idx) => (
          <YMapMarker
            key={`vertex-${idx}`}
            coordinates={coord}
            draggable={isDrawing}
            onDragMove={handleVertexDragMove(idx)}
            onDragEnd={handleVertexDragEnd(idx)}
          >
            <div
              onContextMenu={(e) => handleVertexRightClick(idx, e)}
              style={{
                width: idx === 0 ? 16 : 12,
                height: idx === 0 ? 16 : 12,
                borderRadius: '50%',
                background: idx === 0 ? '#55efc4' : drawingColor,
                border: '2.5px solid white',
                transform: 'translate(-50%, -50%)',
                cursor: isDrawing ? 'grab' : 'default',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                transition: 'width 0.15s, height 0.15s',
              }}
              title={
                isDrawing
                  ? `Точка ${idx + 1}${
                      drawingCoords.length > 3 ? ' • ПКМ — удалить' : ''
                    }`
                  : undefined
              }
            />
          </YMapMarker>
        ))}

        {children}
      </YMap>

      <style>{`
        .zone-map {
          width: 100%;
          height: 100%;
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
        }

        .zone-map > div {
          width: 100% !important;
          height: 100% !important;
        }

        .midpoint-handle:hover {
          opacity: 1 !important;
          transform: translate(-50%, -50%) scale(1.5) !important;
          box-shadow: 0 0 10px ${drawingColor} !important;
        }
      `}</style>
    </div>
  );
};
