import { useState } from 'react'

export const BIOMES = ['forest', 'port', 'mountains', 'meadow']

const STORAGE_KEY = 'haven_biome'

export function useBiome() {
  const [biome, setBiomeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && BIOMES.includes(saved)) return saved
    // Random selection on first load
    return BIOMES[Math.floor(Math.random() * BIOMES.length)]
  })

  function setBiome(b) {
    if (!BIOMES.includes(b)) return
    localStorage.setItem(STORAGE_KEY, b)
    setBiomeState(b)
  }

  return [biome, setBiome]
}
