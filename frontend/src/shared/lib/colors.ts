export interface ZoneColor {
  fill: string;
  stroke: string;
  name: string;
}

export const ZONE_COLORS: ZoneColor[] = [
  { fill: 'rgba(107, 155, 196, 0.25)', stroke: '#6b9bc4', name: 'Синий акцент' },
  { fill: 'rgba(113, 169, 179, 0.25)', stroke: '#71a9b3', name: 'Циан' },
  { fill: 'rgba(219, 171, 94, 0.25)', stroke: '#dbab5e', name: 'Янтарный' },
  { fill: 'rgba(218, 131, 121, 0.25)', stroke: '#da8379', name: 'Красный' },
  { fill: 'rgba(124, 179, 147, 0.25)', stroke: '#7cb393', name: 'Зеленый' },
  { fill: 'rgba(91, 127, 158, 0.25)', stroke: '#5b7f9e', name: 'Стальной синий' },
  { fill: 'rgba(130, 200, 160, 0.25)', stroke: '#82c8a0', name: 'Мятный' },
  { fill: 'rgba(217, 154, 139, 0.25)', stroke: '#d99a8b', name: 'Коралловый' },
];

export function getZoneColor(index: number): ZoneColor {
  return ZONE_COLORS[index % ZONE_COLORS.length];
}

export function getColorByHex(hex: string): ZoneColor {
  const found = ZONE_COLORS.find((c) => c.stroke === hex);
  if (found) return found;
  return {
    fill: `${hex}40`,
    stroke: hex,
    name: hex,
  };
}
