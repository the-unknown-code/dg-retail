/**
 * Returns a random integer between min and max (both inclusive).
 *
 * @param min - The minimum value (inclusive).
 * @param max - The maximum value (inclusive).
 * @returns A random integer between min and max.
 */

export function random(from: number, to: number): number {
  return Math.floor(Math.random() * (to - from + 1)) + from
}
