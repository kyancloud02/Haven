import { useState } from 'react'

const STORAGE_KEY = 'haven_game_state'

const DEFAULT_STATE = {
  gold: 50,
  housingTier: 'Cardboard Box',
  unlockedHeroes: [
    { id: 'base_hero', name: 'Base Hero' },
  ],
  currentLeaderId: 'king',
  // null, or { expiresDate: 'YYYY-MM-DD', multiplier: 1.2, itemName, characterName }
  blessing: null,
  // [{ id, name, kingdom, goldBonus, signedAt }]
  activeTreaties: [],
  // null, or character id
  guardId: null,
  // Heritage / legacy system
  foundedAt:        Date.now(), // ms timestamp — kingdom birth date
  prestigePoints:   0,          // carries over across heir restarts
  legacyGeneration: 1,          // increments each time Restart with Heir is used
  heirUnlocked:     false,      // true once Stone Manor + 3 treaties condition met
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Merge with defaults so new fields are populated on existing saves
    return { ...DEFAULT_STATE, ...parsed }
  } catch {
    return null
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useGameState() {
  const [state, setState] = useState(() => loadState() ?? DEFAULT_STATE)

  function updateState(patch) {
    setState(prev => {
      const next = { ...prev, ...patch }
      saveState(next)
      return next
    })
  }

  return [state, updateState]
}
