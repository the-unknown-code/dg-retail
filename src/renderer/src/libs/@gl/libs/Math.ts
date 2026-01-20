/**
 * Clamps a number between a minimum and maximum value.
 * If input < min → returns min.
 * If input > max → returns max.
 * Otherwise returns input.
 */
export function clamp(min: number, input: number, max: number): number {
  return Math.max(min, Math.min(input, max))
}

/**
 * Maps a number from one range to another.
 * Example: mapRange(0, 100, 50, 0, 1) → 0.5
 */
export function mapRange(
  in_min: number,
  in_max: number,
  input: number,
  out_min: number,
  out_max: number
): number {
  return ((input - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}

/**
 * Performs linear interpolation between two values.
 * amt = 0 → returns start.
 * amt = 1 → returns end.
 * amt between 0 and 1 → blends between start and end.
 */
export function lerp(start: number, end: number, amt: number): number {
  return (1 - amt) * start + amt * end
}

/**
 * Truncates a number to a fixed number of decimal places.
 * Example: truncate(3.14159, 2) → 3.14
 */
export function truncate(value: number, decimals: number): number {
  return parseFloat(value.toFixed(decimals))
}

/**
 * Wraps a number so it stays within a given range.
 * Works like a "circular" boundary.
 * Example: wrapValue(370, 0, 360) → 10
 */
export function wrapValue(value: number, lowBound: number, highBound: number): number {
  const range = highBound - lowBound
  return ((((value - lowBound) % range) + range) % range) + lowBound
}
