import React from 'react'
import { YMapFeature } from '@/shared/lib/ymaps3'
import { getColorByHex } from '@/shared/lib/colors'
import { geoJsonPolygonToYMapPolygon } from '@/shared/lib/geoJsonToYMap'
import type { Zone } from '@/shared/types'

interface ZonePolygonProps {
  zone: Zone
  isSelected?: boolean
  opacity?: number
}

export const ZonePolygon: React.FC<ZonePolygonProps> = ({
  zone,
  isSelected = false,
  opacity,
}) => {
  const colors = getColorByHex(zone.color)

  const fillColor =
    opacity !== undefined
      ? zone.color +
        Math.round(opacity * 255)
          .toString(16)
          .padStart(2, '0')
      : colors.fill

  return (
    <YMapFeature
      id={`zone-${zone.id}`}
      geometry={geoJsonPolygonToYMapPolygon(zone.polygon)}
      style={{
        fill: isSelected ? zone.color + '60' : fillColor,
        stroke: [
          {
            color: isSelected ? '#ffffff' : colors.stroke,
            width: isSelected ? 3 : 2,
          },
        ],
      }}
    />
  )
}
