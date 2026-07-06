export const DIRECTION_8 = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE'] as const;
export const DIRECTION_16 = [
  'E',
  'ENE',
  'NE',
  'NNE',
  'N',
  'NNW',
  'NW',
  'WNW',
  'W',
  'WSW',
  'SW',
  'SSW',
  'S',
  'SSE',
  'SE',
  'ESE',
] as const;

export type Direction8 = (typeof DIRECTION_8)[number];
export type Direction16 = (typeof DIRECTION_16)[number];
export type DirectionKey = Direction8 | Direction16;

export const directionFromDelta = (
  dx: number,
  dy: number,
  available: readonly DirectionKey[],
  fallback: DirectionKey,
) => {
  if (Math.abs(dx) + Math.abs(dy) < 0.01) {
    return fallback;
  }

  const angle = (Math.atan2(-dy, dx) * 180) / Math.PI;
  const normalized = (angle + 360) % 360;
  const fullSet = available.length >= 12 ? DIRECTION_16 : DIRECTION_8;
  const sector = Math.round(normalized / (360 / fullSet.length)) % fullSet.length;
  const preferred = fullSet[sector];

  if (available.includes(preferred)) {
    return preferred;
  }

  let best = fallback;
  let bestDistance = 360;
  for (const candidate of available) {
    const candidateIndex = fullSet.indexOf(candidate as never);
    if (candidateIndex < 0) {
      continue;
    }
    const candidateAngle = candidateIndex * (360 / fullSet.length);
    const distance = Math.abs(((normalized - candidateAngle + 540) % 360) - 180);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
};
