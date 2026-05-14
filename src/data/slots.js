// World stage anchor slots — positions as viewport percentages.
// xPct: fraction from left edge. bottomPct: fraction from bottom edge.
// scale: item render scale for depth perspective.
export const WORLD_SLOTS = [
  { id: 'g1', xPct: 0.12, bottomPct: 0.15, scale: 0.88, type: 'ground' },
  { id: 'g2', xPct: 0.23, bottomPct: 0.17, scale: 0.91, type: 'ground' },
  { id: 'g3', xPct: 0.33, bottomPct: 0.18, scale: 0.93, type: 'ground' },
  { id: 'g4', xPct: 0.65, bottomPct: 0.18, scale: 0.93, type: 'ground' },
  { id: 'g5', xPct: 0.75, bottomPct: 0.17, scale: 0.91, type: 'ground' },
  { id: 'g6', xPct: 0.86, bottomPct: 0.15, scale: 0.88, type: 'ground' },
  { id: 'e1', xPct: 0.09, bottomPct: 0.28, scale: 0.80, type: 'elevated' },
  { id: 'e2', xPct: 0.89, bottomPct: 0.28, scale: 0.80, type: 'elevated' },
]
