import type { CelestialBodyData } from '../data/celestialBodies'

/**
 * Pure filter function for celestial bodies.
 * Matches Russian and English names, case-insensitive, trimming whitespace.
 * Returns the original list unchanged if the search query is empty or whitespace.
 */
export function filterCelestialBodies<T extends Pick<CelestialBodyData, 'name' | 'russianName'>>(
  bodies: readonly T[],
  query: string
): T[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) {
    return [...bodies]
  }

  return bodies.filter(body => {
    const ruMatch = body.russianName.toLowerCase().includes(trimmed)
    const enMatch = body.name.toLowerCase().includes(trimmed)
    return ruMatch || enMatch
  })
}
