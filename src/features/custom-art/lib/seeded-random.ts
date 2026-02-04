/**
 * Seeded random number generator using Mulberry32 algorithm
 * Produces deterministic sequences from a seed value
 */

export type SeededRandom = () => number;

/**
 * Creates a seeded random number generator
 * @param seed - Initial seed value
 * @returns Function that returns random numbers between 0 and 1
 */
export function createSeededRandom(seed: number): SeededRandom {
  let state = seed >>> 0; // Ensure unsigned 32-bit integer

  return function random(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Utility functions using a seeded random generator
 */
export function randomInt(random: SeededRandom, min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function randomFloat(random: SeededRandom, min: number, max: number): number {
  return random() * (max - min) + min;
}

export function randomChoice<T>(random: SeededRandom, array: T[]): T {
  return array[Math.floor(random() * array.length)];
}

export function randomColor(random: SeededRandom): string {
  const h = Math.floor(random() * 360);
  const s = Math.floor(random() * 30) + 20; // 20-50% saturation
  const l = Math.floor(random() * 30) + 40; // 40-70% lightness
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffle<T>(random: SeededRandom, array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
